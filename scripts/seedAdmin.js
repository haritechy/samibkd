// scripts/seedAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Seed admin
const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@samimedicals.com' });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists');
      process.exit(0);
    }

    // Create admin
    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@samimedicals.com',
      password: 'admin123', // Change this password after first login
      role: 'superadmin'
    });

    console.log('✅ Admin created successfully');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

// Run seed
connectDB().then(() => {
  seedAdmin();
});