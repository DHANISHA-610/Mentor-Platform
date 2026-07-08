const express = require('express');
const router = express.Router();
const { getInterns } = require('../controllers/internController');

router.get('/', getInterns);

module.exports = router;
