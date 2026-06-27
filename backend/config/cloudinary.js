// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Gallery / Event image storage ───────────────────────────────────────────
const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'sami-medicals/events',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// ─── Product image storage ────────────────────────────────────────────────────
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'sami-medicals/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const uploadOptions = { fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } };

const galleryUpload = multer({ storage: galleryStorage, ...uploadOptions });
const productUpload = multer({ storage: productStorage, ...uploadOptions });

// Generic upload (keep backward compat)
const upload = galleryUpload;

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    return false;
  }
};

module.exports = { cloudinary, upload, galleryUpload, productUpload, deleteFromCloudinary };
