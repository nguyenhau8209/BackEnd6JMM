const acountModel = require("../../models/acount.model");
const bcrypt = require("bcrypt");
const Token = require("../../models/token.model");
const sendEmail = require("../../utils/email");
const dotenv = require("dotenv");
const { message } = require("../../models/message.model");
dotenv.config();

// Controller xử lý việc đăng nhập
exports.login = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res
        .status(401)
        .json({ status: 401, message: "Email or password is not empty" });
    }
    // Gọi phương thức findByCredentials từ model để kiểm tra thông tin đăng nhập
    const result = await acountModel.acount.findByCredentials(
      req.body.email,
      req.body.password
    );

    // Kiểm tra nếu có lỗi
    if (result.error) {
      console.log(result.message);
      return res.status(401).json({ status: 401, message: result.message });
    }

    // Đăng nhập thành công
    // Tạo và trả về token

    const user = result;

    // Kiểm tra xem email đã được xác minh chưa
    if (!user.verified) {
      return res
        .status(401)
        .json({ status: 401, message: "Email is not verified" });
    }

    // Tạo và lưu token cho người dùng
    await user.generateAuthToken();

    return res.status(200).json({
      status: 200,
      data: {
        _id: user._id,
        email: user.email,
        token: user.token,
        verified: user.verified,
        createdAt: user.createdAt,
      },
      message: "Login successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Controller xử lý việc đăng ký
exports.register = async (req, res, next) => {
  try {
    console.log(req.body);
    if (!req.body.email || !req.body.password) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid email, password" });
    }
    // Tạo một tài khoản mới từ dữ liệu đầu vào
    const user = new acountModel.acount(req.body);
    // Kiểm tra xem email đã tồn tại chưa
    const checkEmail = await acountModel.acount.findOne({ email: user.email });

    if (checkEmail) {
      // Nếu email đã tồn tại trong cơ sở dữ liệu
      if (checkEmail.verified) {
        // Nếu tài khoản đã được xác thực, trả về thông báo lỗi
        return res.status(409).json({
          status: 409,
          message: "Email already exists and is verified.",
        });
      } else {
        // Nếu tài khoản chưa được xác thực, cập nhật lại thông tin và gửi lại email xác thực
        // Tạo salt và mã hóa mật khẩu
        const salt = await bcrypt.genSalt(15);
        user.password = await bcrypt.hash(req.body.password, salt);
        // Cập nhật thông tin cần thiết (ví dụ: password, thông tin mới)
        checkEmail.password = user.password; // Thay đổi mật khẩu nếu cần
        // Cập nhật thông tin khác nếu cần
        await checkEmail.save();

        // Tạo và gửi lại email xác thực
        const newVerificationToken = await new Token({
          userId: checkEmail._id,
          token: require("crypto").randomBytes(32).toString("hex"),
        }).save();

        const emailMessage = `${process.env.BASE_URL_SERVICE}users/verify/${checkEmail.id}/${newVerificationToken.token}`;
        await sendEmail(checkEmail.email, "Reverify Email", emailMessage);

        return res.status(200).json({
          status: 200,
          message:
            "Email already exists but is not verified. A verification email has been sent again.",
        });
      }
    }

    // Tạo salt và mã hóa mật khẩu
    const salt = await bcrypt.genSalt(15);
    user.password = await bcrypt.hash(req.body.password, salt);

    // Lưu tài khoản mới vào cơ sở dữ liệu
    let new_user = await user.save();

    // Tạo và lưu token xác minh email
    let token = await new Token({
      userId: new_user._id,
      token: require("crypto").randomBytes(32).toString("hex"),
    }).save();

    // Tạo thông điệp xác minh email và gửi email xác minh
    const message = `${process.env.BASE_URL_SERVICE}users/verify/${new_user.id}/${token.token}`;
    await sendEmail(new_user.email, "Verify Email", message);

    return res.status(201).json({
      status: 201,
      data: new_user,
      message:
        "An email has been sent to your account. Please verify your email.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Controller xác minh email
exports.verifyEmail = async (req, res) => {
  try {
    // Tìm tài khoản dựa trên ID trong đường dẫn
    const user = await acountModel.acount.findOne({ _id: req.params.id });

    // Kiểm tra xem tài khoản có tồn tại không
    if (!user) return res.status(400).json({ message: "Invalid link" });

    // Tìm token xác minh trong cơ sở dữ liệu
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });

    // Kiểm tra xem token có tồn tại không
    if (!token) return res.status(400).json({ message: "Invalid link" });

    // Xác minh email và loại bỏ token đã sử dụng
    await acountModel.acount.findByIdAndUpdate(user._id, { verified: true });
    await Token.findByIdAndRemove(token._id);

    return res.status(200).json({
      status: 200,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ status: 400, message: "An error occurred" });
  }
};

// Controller đăng xuất
exports.logout = async (req, res, next) => {
  try {
    // Xóa token của người dùng để đăng xuất
    req.user.token = null;
    await req.user.save();
    return res
      .status(200)
      .json({ status: 200, message: "Logout successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Controller lấy thông tin hồ sơ người dùng
exports.detailProfile = async (req, res, next) => {
  try {
    // Kiểm tra xem req.user có tồn tại (token hợp lệ) hay không
    if (!req.user) {
      return res.status(401).json({ status: 401, message: "Unauthorized" });
    }

    // Tìm tài khoản người dùng và trả về thông tin hồ sơ
    const user = await acountModel.acount.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    return res
      .status(200)
      .json({ status: 200, data: user, message: "get profile success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

function generateRandomPassword(length) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
}

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    if (!email) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid email or new password" });
    }
    const randomPassword = generateRandomPassword(8); // Thay đổi số 8 thành chiều dài mà bạn muốn cho mật khẩu
    console.log(randomPassword);
    // Tạo một tài khoản mới từ dữ liệu đầu vào
    const user = new acountModel.acount({
      email: email,
      password: randomPassword,
    });
    const findEmail = await acountModel.acount.findOne({ email: user.email });
    console.log(findEmail);
    if (!findEmail) {
      return res.status(404).json({ status: 404, message: "email not found" });
    }
    //Tao va luu token xac minh email
    let newVerificationToken = await new Token({
      userId: findEmail._id,
      token: require("crypto").randomBytes(32).toString("hex"),
    }).save();
    const emailMessage = `${process.env.BASE_URL}users/forgotPassword/${findEmail.id}/${newVerificationToken.token}?password=${randomPassword}`;
    await sendEmail(findEmail.email, "Reverify Email", emailMessage);
    return res.status(201).json({
      status: 201,
      data: user,
      message:
        "An email has been sent to your account. Please verify your email.",
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};
exports.verifyEmailChangePassword = async (req, res) => {
  try {
    // Tìm tài khoản dựa trên ID trong đường dẫn
    const user = await acountModel.acount.findOne({ _id: req.params.id });

    // Kiểm tra xem tài khoản có tồn tại không
    if (!user) return res.status(400).json({ message: "Invalid link" });

    // Tìm token xác minh trong cơ sở dữ liệu
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });

    // Kiểm tra xem token có tồn tại không
    if (!token) return res.status(400).json({ message: "Invalid link" });
    const newPassword = req.query.password;
    const salt = await bcrypt.genSalt(15);
    const password = await bcrypt.hash(newPassword, salt);
    // Xác minh email và loại bỏ token đã sử dụng
    await acountModel.acount.findByIdAndUpdate(user._id, {
      password: password,
    });
    await Token.findByIdAndRemove(token._id);
    await sendEmail(
      user.email,
      "Forgot password",
      `Change password successfully! New your password is: ${newPassword}`
    );
    return res.status(200).json({
      status: 200,
      message: "Change password successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ status: 400, message: "An error occurred" });
  }
};

exports.changePassword = async (req, res) => {
  const { newPassword, reNewPassword } = req.body;
  if (newPassword !== reNewPassword) {
    return res
      .status(400)
      .json({
        status: 400,
        message: "password and repassword are not the same",
      });
  }
  try {
    if (!req.user) {
      return res.status(401).json({ status: 401, message: "Unauthorized" });
    }
    const salt = await bcrypt.genSalt(15);
    const changedPassword = await bcrypt.hash(newPassword, salt);
    //find and update user
    const user = await acountModel.acount.findByIdAndUpdate(req.user._id, {
      password: changedPassword,
    });
    return res
      .status(201)
      .json({ status: 201, message: "Change password successfully!" });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};
