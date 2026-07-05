const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatbot");

router.post(
    "/message",
    express.json(),
    chatController.chat
);

module.exports = router;