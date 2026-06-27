// controllers/contactController.js
const { sendContactEmail } = require('../config/mailer');

// POST /api/contact
exports.sendContact = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ success: false, message: 'Name and message are required' });
    }

    await sendContactEmail({ name, phone, email, message });

    res.status(200).json({
      success: true,
      message: 'Your message has been sent! We will contact you shortly.',
    });
  } catch (error) {
    console.error('Contact email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again or call us directly.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
