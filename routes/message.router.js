const express = require("express");
const router = express.Router();
const messageController = require("../controller/message.controler");
const authMidleWare = require("../middleWare/auth.middlewere");

router.get(
    '/messages',
    authMidleWare.apiAuth,
    messageController.getListMessage
)
router.get(
    '/messages/filter',
    // authMidleWare.apiAuth,
    messageController.getMessageFilter
)

router.get(
  "/message/:id",
  authMidleWare.apiAuth,
  messageController.getMessageById
);
router.post("/message", authMidleWare.apiAuth, messageController.createMessage);

router.put(
  "/message/:id",
  authMidleWare.apiAuth,
  messageController.updateMessage
);

router.delete(
  "/message/:id",
  authMidleWare.apiAuth,
  messageController.deleteMessage
);

module.exports = router
