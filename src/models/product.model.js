const { DataTypes } = require('sequelize');
const { sequelize } = require('../db.js');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  spnMouserPartNumFormattedForProdInfo: { type: DataTypes.STRING },
  spnManufacturerPartNumber: { type: DataTypes.STRING },
  manufacturer: { type: DataTypes.STRING },
  defaultImg: { type: DataTypes.STRING },
  price1: { type: DataTypes.FLOAT },
  datasheet: { type: DataTypes.STRING },
  product: { type: DataTypes.STRING },
  productClassification: { type: DataTypes.STRING },
  spnDescription: { type: DataTypes.TEXT },
  series: { type: DataTypes.STRING },
  packaging: { type: DataTypes.STRING },
  partStatus: { type: DataTypes.STRING },
  numberOfChannels: { type: DataTypes.STRING },
  interface: { type: DataTypes.STRING },
  voltageSupply: { type: DataTypes.STRING },
  operatingTemperature: { type: DataTypes.STRING },
  mountingType: { type: DataTypes.STRING },
  packageOrCase: { type: DataTypes.STRING },
  numberOfRegulators: { type: DataTypes.STRING },
  numberOfPositions: { type: DataTypes.STRING },
  voltageRating: { type: DataTypes.STRING },
  voltageInput: { type: DataTypes.STRING },
  voltageOutput: { type: DataTypes.STRING },
  connectorType: { type: DataTypes.STRING },
  impedance: { type: DataTypes.STRING },
}, {
  tableName: 'products',
  timestamps: false,
});

module.exports = { Product };
