const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getConversations,
  getConversationById,
  sendMessage,
  editMessage,
} = require('../controllers/chatController');

const router = express.Router();

router.get('/', protect, getConversations);
router.get('/:id', protect, getConversationById);
router.post('/:id/messages', protect, sendMessage);
router.put('/:id/messages/:messageId', protect, editMessage);

module.exports = router;
