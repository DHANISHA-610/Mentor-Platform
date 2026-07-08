const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getConversations } = require('../controllers/chatController');

const router = express.Router();

router.get('/', protect, getConversations);

module.exports = router;
