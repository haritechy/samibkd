// models/Product.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true },
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { notEmpty: true },
  },
  tagline: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
  price: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'e.g. "₹600" or "12% OFF"',
  },
  badge: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'e.g. "SAVE 52%" or "NEW ARRIVAL"',
  },
  theme: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#C8000A',
    comment: 'Hex color for card accent',
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  imagePublicId: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  isNewArrival: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Show in New Products slider',
  },
  isOffer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Show in Market Exclusives / Offers section',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'products',
  indexes: [
    { fields: ['isActive', 'isNewArrival'] },
    { fields: ['isActive', 'isOffer'] },
    { fields: ['order'] },
  ],
});

module.exports = Product;
