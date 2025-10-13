const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CatalogExclusion = sequelize.define('CatalogExclusion', {
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
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'catalog_exclusions',
});

module.exports = CatalogExclusion;
