// src/routes/teacherScheduleRoutes.js
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController'); // adjust path if needed
const authMiddleware = require('../middlewares/authMiddleware'); // optional, if you have auth

// ---------------------
// TEACHER SCHEDULE ROUTES
// ---------------------

// Get full schedule of a teacher (optionally filter by day or academic_year)
router.get('/:id/schedule', authMiddleware, teacherController.getTeacherSchedule);

// Get single period detail
router.get('/schedule/:id', authMiddleware, teacherController.getScheduleDetail);

module.exports = router;
