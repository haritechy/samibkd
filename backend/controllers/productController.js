// controllers/productController.js
const Product = require('../models/Product');
const { deleteFromCloudinary } = require('../config/cloudinary');

// GET /api/products  — public
exports.getProducts = async (req, res) => {
  try {
    const { type } = req.query; // type=new | type=offer | (none = all active)
    const where = { isActive: true };
    if (type === 'new') where.isNewArrival = true;
    if (type === 'offer') where.isOffer = true;

    const products = await Product.findAll({
      where,
      order: [['order', 'DESC'], ['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// GET /api/products/:id — public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// POST /api/products — admin only
exports.createProduct = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const { brand, title, tagline, price, badge, theme, isNewArrival, isOffer, order } = req.body;

    const product = await Product.create({
      brand,
      title,
      tagline,
      price,
      badge,
      theme: theme || '#C8000A',
      isNewArrival: isNewArrival === 'true' || isNewArrival === true || true,
      isOffer: isOffer === 'true' || isOffer === true || false,
      order: parseInt(order) || 0,
      imageUrl: req.file.path,
      imagePublicId: req.file.filename,
    });

    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    if (req.file) await deleteFromCloudinary(req.file.filename);
    res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
  }
};

// PUT /api/products/:id — admin only
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const updates = { ...req.body };
    if (typeof updates.isNewArrival !== 'undefined') updates.isNewArrival = updates.isNewArrival === 'true' || updates.isNewArrival === true;
    if (typeof updates.isOffer !== 'undefined') updates.isOffer = updates.isOffer === 'true' || updates.isOffer === true;
    if (typeof updates.isActive !== 'undefined') updates.isActive = updates.isActive === 'true' || updates.isActive === true;
    if (updates.order) updates.order = parseInt(updates.order);

    if (req.file) {
      await deleteFromCloudinary(product.imagePublicId);
      updates.imageUrl = req.file.path;
      updates.imagePublicId = req.file.filename;
    }

    await product.update(updates);
    res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
  }
};

// DELETE /api/products/:id — admin only
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await deleteFromCloudinary(product.imagePublicId);
    await product.destroy();

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
  }
};

// PATCH /api/products/:id/toggle-active — admin only
exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await product.update({ isActive: !product.isActive });
    res.status(200).json({ success: true, message: `Product ${product.isActive ? 'activated' : 'deactivated'}`, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
