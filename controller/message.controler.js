const { acount } = require("../models/acount.model");
const messageModel = require("../models/message.model");
const Total = require("../models/total.model");
const returnRes = require("../utils/config");
const runPrompt = require("../utils/convertMessage");
const returnTotal = require("../utils/total");

exports.getMessageFilter = async (req, res) => {
  const {
    userID, // required
    code, // required
    startDate,
    endDate,
    sortPrice,
    sortDate,
    limit, // required
    skip, // required
  } = req.query;

  if (!userID) {
    return returnRes(res, 404, "Invalid userID");
  }

  try {
    const query = {
      userID: userID,
      code: code,
    };

    // Xác định điều kiện lọc theo ngày nếu startDate và endDate được truyền vào
    if (startDate && endDate) {
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const messageList = await messageModel.message.find(query).exec();

    // Chuyển đổi trường "price" thành số
    messageList.forEach((message) => {
      message.price = parseInt(message.price);
    });

    // Sắp xếp dựa trên yêu cầu
    if (sortPrice) {
      messageList.sort((a, b) => {
        return sortPrice === "true" ? a.price - b.price : b.price - a.price;
      });
    } else if (sortDate) {
      messageList.sort((a, b) => {
        return sortDate === "true"
          ? a.createdAt - b.createdAt
          : b.createdAt - a.createdAt;
      });
    } else {
      // Mặc định sắp xếp theo ngày mới nhất trước
      messageList.sort((a, b) => {
        return b.createdAt - a.createdAt;
      });
    }

    // Áp dụng phân trang bằng cách sử dụng limit và skip
    const paginatedList = messageList.slice(skip, skip + limit);

    if (!paginatedList) {
      return returnRes(res, 401, "get list message false!");
    }

    return returnRes(res, 200, paginatedList, "get list message success");
  } catch (error) {
    console.log(error);
    return returnRes(res, 500, error.message);
  }
};

// Lấy danh sách tin nhắn
exports.getListMessage = async (req, res, next) => {
  const userID = req.query.userID;
  const code = req.query.code;
  if (!userID || !code) {
    return returnRes(res, 404, "Invalid userID or code");
  }
  try {
    //Kiểm tra xem userID có trùng với userID được truyền lên không
    if (req.data._id !== userID) {
      return returnRes(res, 401, "Unauthorized");
    }
    const messageList = await messageModel.message.find({ userID, code });

    // Kiểm tra nếu không có tin nhắn
    if (!messageList) {
      return returnRes(res, 401, "get list message false!");
    }

    return returnRes(res, 200, messageList, "get list message success");
  } catch (error) {
    console.log(error);
    return returnRes(res, 500, error.message);
  }
};

exports.getMessageById = async (req, res, next) => {
  try {
    const messageId = req.params.id;

    if (!messageId) {
      return returnRes(res, 404, "Invalid message id");
    }
    const findMessageById = await messageModel.message.findById(messageId);

    // Kiểm tra nếu không có tin nhắn
    if (!findMessageById) {
      return returnRes(res, 401, "Message not found");
    }

    return returnRes(res, 200, findMessageById, "get message successfully");
  } catch (error) {
    console.log(error);
    return returnRes(res, 500, error.message);
  }
};

// Tạo tin nhắn mới
exports.createMessage = async (req, res, next) => {
  if (req.method == "POST") {
    try {
      // Lưu tin nhắn ban đầu vào cơ sở dữ liệu
      let message = new messageModel.message();
      message.message = req.body.message;
      message.userID = req.body.userID;
      message.code = req.body.code;
      message.price = req.body.price;
      if (!req.body.message || !req.body.userID) {
        return returnRes(res, 404, "invalid message || userID");
      }
      //Kiểm tra xem userID có trùng với userID được truyền lên không
      if (req.data._id !== req.body.userID) {
        return returnRes(res, 401, "Unauthorized");
      }
      const findUserID = await acount.findById(req.body.userID);
      console.log(findUserID);
      if (!findUserID) {
        return returnRes(res, 404, "userID is not exists");
      }
      if (!req.body.message) {
        return returnRes(res, 404, "Invalid message");
      }
      const newMessage = await message.save();

      console.log("newMessage ", newMessage);

      if (!message.code || !message.price) {
        // Gọi hàm convertMessage để lấy thông tin
        const convertMessage = await runPrompt(newMessage?.message);

        // Cập nhật tin nhắn ban đầu với thông tin từ convertMessage
        newMessage.price = convertMessage?.price;
        newMessage.code = convertMessage?.code;

        // Lưu lại tin nhắn đã cập nhật
        await newMessage.save();
      }
      // Đảm bảo rằng bạn đã định nghĩa userID và code từ convertMessage
      const { userID, code, price } = newMessage;

      await returnTotal(userID, code, price);
      return returnRes(res, 201, newMessage, "create successfully");
    } catch (error) {
      console.log(error);
      return returnRes(res, 500, error.message);
    }
  }

  // Nếu không phải phương thức POST, trả về trang tạo tin nhắn
  res.render("message/create-message");
};

// Cập nhật tin nhắn
exports.updateMessage = async (req, res, next) => {
  const messageID = req.params.id;
  const messageUpdate = req.body;

  try {
    const updateMessage = await messageModel.message.findByIdAndUpdate(
      messageID,
      messageUpdate
    );

    // Kiểm tra nếu không cập nhật được tin nhắn
    if (!updateMessage) {
      return res
        .status(401)
        .json({ status: 401, message: "Update message false!" });
    }

    return res.status(201).json({
      status: 201,
      message: "Update message successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// Xóa tin nhắn
exports.deleteMessage = async (req, res, next) => {
  const messageID = req.params.id;

  try {
    const deleteMessage = await messageModel.message.findByIdAndDelete(
      messageID
    );

    // Kiểm tra nếu không xóa được tin nhắn
    if (!deleteMessage) {
      return res.status(401).json({ status: 401, message: "delete false!" });
    }

    return res
      .status(201)
      .json({ status: 201, message: "delete successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};
