// server.js — Sami Medicals Backend v2 (MySQL + Sequelize)
const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const morgan  = require('morgan');

dotenv.config();

// ─── Database & Models ────────────────────────────────────────────────────────
const { connectDB } = require('./config/database');
const Admin = require('./models/Admin');

// ─── Mailer (non-blocking verify) ────────────────────────────────────────────
const { verifyMailer } = require('./config/mailer');

// ─── Routes ──────────────────────────────────────────────────────────────────
const authRoutes    = require('./routes/authRoutes');
const eventRoutes   = require('./routes/eventRoutes');
const productRoutes = require('./routes/productRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/events',   eventRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contact',  contactRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sami Medicals API is running (MySQL)',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});


const seedDefaultAdmin = async () => {
  try {
    const defaultEmail = 'admin@samimedicals.com';
    
  
    const adminExists = await Admin.findOne({ where: { email: defaultEmail } });

    if (!adminExists) {
      await Admin.create({
        username: 'admin',
        email: defaultEmail,
        password: 'Admin@123',
        role: 'admin',
        isActive: true
      });
      console.log('👤 [Seed]: Default admin account created successfully! (admin@samimedicals.com)');
    } else {
      console.log('✅ [Seed]: Default admin already exists. Skipping creation.');
    }
  } catch (error) {
    console.error('❌ [Seed Error]: Failed to create default admin:', error.message);
  }
};

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const boot = async () => {
  await connectDB(); // டேட்டாபேஸ் கனெக்ஷன்
  
  // டேட்டாபேஸ் கனெக்ட் ஆன பிறகு அட்மின் அக்கவுண்ட்டை செக் செய்து உருவாக்குகிறது
  await seedDefaultAdmin(); 
  
  verifyMailer(); // fire-and-forget, don't block startup
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: MySQL (Sequelize)`);
  });
};

boot().catch((err) => {
  console.error('❌ Boot error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});