const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Mentor Platform API' });
});

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);

module.exports = router;
