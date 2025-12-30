// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updatePassword
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;