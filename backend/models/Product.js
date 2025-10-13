const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      if (typeof value === 'string') {
        this.setDataValue('sku', value.trim());
      } else {
        this.setDataValue('sku', value);
      }
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shortDescription: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  longDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description: {
    // legacy field support
    type: DataTypes.TEXT,
    allowNull: true,
  },
  salePrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  regularPrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoryPath: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  manufacturer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'products',
});

module.exports = Product;
