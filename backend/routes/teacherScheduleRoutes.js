const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middlewares/authMiddleware');

// Weekly schedule for a teacher
router.get('/:id/schedule', authMiddleware, teacherController.getTeacherSchedule);

// Schedule detail for a single period
router.get('/schedule/:id', authMiddleware, teacherController.getScheduleDetail);

module.exports = router;
