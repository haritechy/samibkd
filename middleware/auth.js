// middleware/auth.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if admin still exists
    req.admin = await Admin.findById(decoded.id);

    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin no longer exists'
      });
    }

    // Check if admin is active
    if (!req.admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      error: error.message
    });
  }
};

// Restrict to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};