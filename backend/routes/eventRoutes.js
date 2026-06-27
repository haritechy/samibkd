// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { galleryUpload } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventStatus,
} = require('../controllers/eventController');

router.get('/', getEvents);
router.get('/:id', getEvent);

router.post('/', protect, galleryUpload.single('image'), createEvent);
router.put('/:id', protect, galleryUpload.single('image'), updateEvent);
router.delete('/:id', protect, deleteEvent);
router.patch('/:id/toggle-active', protect, toggleEventStatus);

module.exports = router;
