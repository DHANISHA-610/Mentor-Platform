const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createRequest, getRequestsForUser, updateRequestStatus } = require('../controllers/requestController');

router.post('/', protect, createRequest);
router.get('/', protect, getRequestsForUser);
router.put('/:id', protect, updateRequestStatus);

module.exports = router;
