const express = require('express');
const { getMentors, getMentorById, getAllSkills } = require('../controllers/mentorController');

const router = express.Router();

router.get('/', getMentors);
router.get('/skills', getAllSkills);
router.get('/:id', getMentorById);

module.exports = router;
