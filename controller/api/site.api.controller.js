const acountModel = require("../../models/acount.model");
const bcrypt = require("bcrypt");

exports.login = async (req, res, next) => {
  try {
    const result = await acountModel.acount.findByCredentials(
      req.body.email,
      req.body.password
    );

    if (result.error) {
      console.log(result.message);
      return res.status(401).json({ status: 401, message: result.message });
    }

    //login success
    //create and return token

    const user = result;
    await user.generateAuthToken();
    console.log("user token: ", user);
    return res.status(200).json({
      status: 200,
      data: {
        _id: user?._id,
        email: user?.email,
        token: user?.token,
        createdAt: user?.createdAt,
      },

      message: "Login successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.register = async (req, res, next) => {
  try {
    const user = new acountModel.acount(req.body);
    const salt = await bcrypt.genSalt(15);
    user.password = await bcrypt.hash(req.body.password, salt);
    let new_user = await user.save();
    console.log(new_user);
    return res
      .status(201)
      .json({ status: 201, data: new_user, message: "Register successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.logout = async (req, res, next) => {
  try {
    console.log(req.user);
    req.user.token = null;
    await req.user.save();
    return res
      .status(200)
      .json({ status: 200, message: "Logout successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
exports.detailProfile = async (req, res, next) => {
  try {
    // Kiểm tra xem req.user có tồn tại (token hợp lệ) hay không
    if (!req.user) {
      return res.status(401).json({ status: 401, message: "Unauthorized" });
    }
    const user = await acountModel.acount.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    return res
      .status(200)
      .json({ status: 200, data: user, message: "get profile success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};
