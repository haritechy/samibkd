// controllers/eventController.js
const Event = require('../models/Event');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all events (with filtering)
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const { category, featured, isActive } = req.query;
    
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }
    
    // Default to showing only active events for public
    query.isActive = isActive === 'false' ? false : true;

    const events = await Event.find(query)
      .sort({ order: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, category, date, featured, order } = req.body;

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // Create event
    const event = await Event.create({
      title,
      description,
      category,
      date,
      featured: featured || false,
      order: order || 0,
      image: {
        url: req.file.path,
        publicId: req.file.filename
      }
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    // If event creation fails, delete uploaded image
    if (req.file) {
      await deleteFromCloudinary(req.file.filename);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin)
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // If new image is uploaded, delete old one
    if (req.file) {
      await deleteFromCloudinary(event.image.publicId);
      req.body.image = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Delete image from Cloudinary
    await deleteFromCloudinary(event.image.publicId);

    // Delete event from database
    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

// @desc    Toggle event active status
// @route   PATCH /api/events/:id/toggle-active
// @access  Private (Admin)
exports.toggleEventStatus = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.isActive = !event.isActive;
    await event.save();

    res.status(200).json({
      success: true,
      message: `Event ${event.isActive ? 'activated' : 'deactivated'} successfully`,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle event status',
      error: error.message
    });
  }
};