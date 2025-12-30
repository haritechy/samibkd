// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventStatus
} = require('../controllers/eventController');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Protected routes (Admin only)
router.post('/', protect, upload.single('image'), createEvent);
router.put('/:id', protect, upload.single('image'), updateEvent);
router.delete('/:id', protect, deleteEvent);
router.patch('/:id/toggle-active', protect, toggleEventStatus);

module.exports = router;