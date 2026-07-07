const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const mentorRoutes = require('./mentorRoutes');
const adminRoutes = require('./adminRoutes');

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Mentor Platform API' });
});

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/mentors', mentorRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
