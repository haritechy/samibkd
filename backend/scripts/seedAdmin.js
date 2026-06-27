// scripts/seedAdmin.js
require('dotenv').config();
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');

const seed = async () => {
  await connectDB();

  const existing = await Admin.findOne({ where: { email: 'admin@samimedicals.com' } });
  if (existing) {
    console.log('⚠️  Admin already exists');
    process.exit(0);
  }

  const admin = await Admin.create({
    username: 'admin',
    email: 'admin@samimedicals.com',
    password: 'admin123',
    role: 'superadmin',
  });

  console.log('✅ Admin created successfully');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Password: admin123');
  console.log('⚠️  Please change this password after first login!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
