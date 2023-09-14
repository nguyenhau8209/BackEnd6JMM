const { acount } = require("../models/acount.model");
const messageModel = require("../models/message.model");
const runPrompt = require("../utils/convertMessage");

// Lấy danh sách tin nhắn
exports.getListMessage = async (req, res, next) => {
  try {
    const messageList = await messageModel.message.find();

    // Kiểm tra nếu không có tin nhắn
    if (!messageList) {
      return res
        .status(401)
        .json({ status: 401, message: "Get list message false!" });
    }

    return res.status(200).json({
      status: 200,
      data: messageList,
      message: "Get list message successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

exports.getMessageById = async (req, res, next) => {
  try {
    const messageId = req.params.id;
    const messageById = await messageModel.message.findById(messageId);

    // Kiểm tra nếu không có tin nhắn
    if (!messageById) {
      return res
        .status(401)
        .json({ status: 401, message: "Message not found" });
    }

    return res.status(200).json({
      status: 200,
      data: messageById,
      message: "Get message successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
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
      const findUserID = await acount.findById(req.body.userID);
      console.log(findUserID);
      if (!findUserID) {
        return res
          .status(404)
          .json({ status: 404, message: "UserID not exited" });
      }
      if (!req.body.message) {
        return res
          .status(404)
          .json({ status: 404, message: "message not exited" });
      }
      const newMessage = await message.save();

      console.log("newMessage ", newMessage);

      // Gọi hàm convertMessage để lấy thông tin
      const convertMessage = await runPrompt(newMessage?.message);

      // Cập nhật tin nhắn ban đầu với thông tin từ convertMessage
      newMessage.price = convertMessage?.price;
      newMessage.code = convertMessage?.code;

      // Lưu lại tin nhắn đã cập nhật
      await newMessage.save();

      return res.status(201).json({
        status: 201,
        data: newMessage,
        message: "Create successfully!",
      });
    } catch (error) {
      console.log(error);
      return res.status(401).json({ status: 401, message: error.message });
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
