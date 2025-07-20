const express = require('express');
const { sendMessage, getChatHistory } = require('../controllers/chatController');

const router = express.Router();

// Send message to AI
router.post('/message', sendMessage);

// Get chat history
router.get('/history/:sessionId', getChatHistory);

module.exports = router;