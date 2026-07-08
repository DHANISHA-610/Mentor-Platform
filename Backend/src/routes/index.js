const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const mentorRoutes = require('./mentorRoutes');
const internRoutes = require('./internRoutes');
const adminRoutes = require('./adminRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const chatRoutes = require('./chatRoutes');
const requestRoutes = require('./requestRoutes');
const taskRoutes = require('./taskRoutes');

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Mentor Platform API' });
});

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/mentors', mentorRoutes);
router.use('/interns', internRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/chat', chatRoutes);
router.use('/requests', requestRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
