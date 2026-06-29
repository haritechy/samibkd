// controllers/authController.js
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Admin = require('../models/Admin');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });


exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existing = await Admin.findOne({
      where: { [Op.or]: [{ email }, { username }] },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin with this email or username already exists' });
    }

    const admin = await Admin.create({ username, email, password, role: role || 'admin' });
    const token = generateToken(admin.id);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ where: { email } });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await admin.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await admin.update({ lastLogin: new Date() });

    const token = generateToken(admin.id);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.id, { attributes: { exclude: ['password'] } });
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get admin details', error: error.message });
  }
};

// PUT /api/auth/update-password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const admin = await Admin.findByPk(req.admin.id);
    const isCorrect = await admin.comparePassword(currentPassword);

    if (!isCorrect) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    await admin.update({ password: newPassword });
    const token = generateToken(admin.id);

    res.status(200).json({ success: true, message: 'Password updated successfully', token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update password', error: error.message });
  }
};
