// teacherScheduleRoutes.js
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:id/schedule', authMiddleware, teacherController.getTeacherSchedule);
router.get('/schedule/:id', authMiddleware, teacherController.getScheduleDetail);

module.exports = router;
