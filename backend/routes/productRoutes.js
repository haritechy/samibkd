// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { productUpload } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} = require('../controllers/productController');

// Public
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin only
router.post('/', protect, productUpload.single('image'), createProduct);
router.put('/:id', protect, productUpload.single('image'), updateProduct);
router.delete('/:id', protect, deleteProduct);
router.patch('/:id/toggle-active', protect, toggleProductStatus);

module.exports = router;
