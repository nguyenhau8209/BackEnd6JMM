const messageModel = require("../models/message.model");

exports.getListMessage = async (req, res, next) => {
  try {
    const messageList = await messageModel.message.find();
    if (!messageList) {
      return res
        .status(401)
        .json({ status: 401, message: "Get list message false!" });
    }
    return res
      .status(200)
      .json({
        status: 200,
        data: messageList,
        message: "Get list message successfully!",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

exports.createMessage = async (req, res, next) => {
  if (req.method == "POST") {
    let message = messageModel.message();
    message.message = req.body.message;
    message.userID = req.body.userID;
    try {
      const newMessage = await message.save();
      console.log("newMessage ", newMessage);
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
  res.render("message/create-message");
};

exports.updateMessage = async (req, res, next) => {
  const messageID = req.params.id;
  const messageUpdate = req.body;
  try {
    const updateMessage = await messageModel.message.findByIdAndUpdate(
      messageID,
      messageUpdate
    );
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

exports.deleteMessage = async (req, res, next) => {
  const messageID = req.params.id;
  try {
    const deleteMessage = await messageModel.message.findByIdAndDelete(
      messageID
    );
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
