const express = require("express");
const router = express.Router();
const messageController = require("../controller/message.controler");
const authMidleWare = require("../middleWare/auth.middlewere");

router.get(
  "/get-message",
  authMidleWare.apiAuth,
  messageController.getListMessage
);
router.post(
  "/create-message",
  authMidleWare.apiAuth,
  messageController.createMessage
);

router.put(
  "/update-message/:id",
  authMidleWare.apiAuth,
  messageController.updateMessage
);

router.delete(
  "/delete-message/:id",
  authMidleWare.apiAuth,
  messageController.deleteMessage
);

module.exports = router;
