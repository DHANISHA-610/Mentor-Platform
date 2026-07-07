const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const mentorRoutes = require('./mentorRoutes');
const adminRoutes = require('./adminRoutes');
const requestRoutes = require('./requestRoutes');
const taskRoutes = require('./taskRoutes');

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Mentor Platform API' });
});

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/mentors', mentorRoutes);
router.use('/admin', adminRoutes);
router.use('/requests', requestRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
