// controllers/eventController.js
const { Op } = require('sequelize');
const Event = require('../models/Event');
const { deleteFromCloudinary } = require('../config/cloudinary');

// GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const { category, featured, isActive } = req.query;
    const where = {};

    if (category && category !== 'all') where.category = category;
    if (featured !== undefined) where.featured = featured === 'true';
    where.isActive = isActive === 'false' ? false : true;

    const events = await Event.findAll({
      where,
      order: [['order', 'DESC'], ['createdAt', 'DESC']],
    });

    // Shape response to match old MongoDB format (imageUrl / imagePublicId → image.url / image.publicId)
    const shaped = events.map(shapeEvent);

    res.status(200).json({ success: true, count: shaped.length, data: shaped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// GET /api/events/:id
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, data: shapeEvent(event) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const { title, description, category, date, featured, order } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const event = await Event.create({
      title,
      description,
      category,
      date,
      featured: featured === 'true' || featured === true || false,
      order: parseInt(order) || 0,
      imageUrl: req.file.path,
      imagePublicId: req.file.filename,
    });

    res.status(201).json({ success: true, message: 'Event created successfully', data: shapeEvent(event) });
  } catch (error) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
    res.status(500).json({ success: false, message: 'Failed to create event', error: error.message });
  }
};

// PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const updates = { ...req.body };
    if (typeof updates.featured !== 'undefined') {
      updates.featured = updates.featured === 'true' || updates.featured === true;
    }
    if (updates.order) updates.order = parseInt(updates.order);

    if (req.file) {
      await deleteFromCloudinary(event.imagePublicId);
      updates.imageUrl = req.file.path;
      updates.imagePublicId = req.file.filename;
    }

    await event.update(updates);
    res.status(200).json({ success: true, message: 'Event updated successfully', data: shapeEvent(event) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update event', error: error.message });
  }
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    await deleteFromCloudinary(event.imagePublicId);
    await event.destroy();

    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete event', error: error.message });
  }
};

// PATCH /api/events/:id/toggle-active
exports.toggleEventStatus = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    await event.update({ isActive: !event.isActive });

    res.status(200).json({
      success: true,
      message: `Event ${event.isActive ? 'activated' : 'deactivated'} successfully`,
      data: shapeEvent(event),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle event status', error: error.message });
  }
};

// Helper: shape Sequelize row to match old Mongoose response shape
function shapeEvent(event) {
  const plain = event.toJSON ? event.toJSON() : event;
  return {
    ...plain,
    // Keep backward-compatible image object shape
    image: { url: plain.imageUrl, publicId: plain.imagePublicId },
    _id: plain.id, // keep _id alias for frontend compatibility
  };
}
