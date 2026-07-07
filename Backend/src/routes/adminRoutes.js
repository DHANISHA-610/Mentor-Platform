const express = require('express');
const { getPendingMentorApplications, reviewMentorApplication } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/mentor-applications', protect, authorizeRoles('admin'), getPendingMentorApplications);
router.put('/mentor-applications/:id', protect, authorizeRoles('admin'), reviewMentorApplication);

module.exports = router;
