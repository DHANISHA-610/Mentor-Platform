const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createTask, getTasksForUser, updateTaskStatus } = require('../controllers/taskController');

router.post('/', protect, createTask);
router.get('/', protect, getTasksForUser);
router.put('/:id', protect, updateTaskStatus);

module.exports = router;
