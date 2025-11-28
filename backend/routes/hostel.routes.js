const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorization');
const hostelController = require('../controllers/hostelController');

router.use(authenticate);

// Admin Routes
router.get('/rooms', requireRole(['super_admin', 'admin', 'principal', 'vice_principal']), hostelController.getAllRooms);
router.post('/rooms', requireRole(['super_admin', 'admin', 'principal']), hostelController.createRoom);
router.get('/rooms/:id', requireRole(['super_admin', 'admin', 'principal', 'vice_principal']), hostelController.getRoomDetails);

router.post('/allocate', requireRole(['super_admin', 'admin', 'principal']), hostelController.allocateRoom);
router.post('/vacate', requireRole(['super_admin', 'admin', 'principal']), hostelController.vacateRoom);

// Student Routes
router.get('/my-room', requireRole(['student']), hostelController.getStudentHostelDetails);

module.exports = router;
