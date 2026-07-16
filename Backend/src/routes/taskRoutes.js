const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  createTask,
  getTasksForUser,
  getInternSubmissionsForMentor,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

router.post('/', protect, createTask);
router.get('/intern-submissions', protect, authorizeRoles('mentor'), getInternSubmissionsForMentor);
router.get('/', protect, getTasksForUser);
router.get('/:id', protect, getTaskById);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;
