const { DataTypes } = require('sequelize');
const { sequelize } = require('../db.js');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  partNumber: {type: DataTypes.STRING},
  spnMouserPartNumFormattedForProdInfo: { type: DataTypes.STRING },
  spnManufacturerPartNumber: { type: DataTypes.STRING },
  manufacturer: { type: DataTypes.STRING },
  defaultImg: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER },
  unitPrice: { type: DataTypes.FLOAT },
  totalPrice: { type: DataTypes.FLOAT },
  datasheet: { type: DataTypes.STRING },
  product: { type: DataTypes.STRING },
  productClassification: { type: DataTypes.STRING },
  touchPanel: { type: DataTypes.STRING },
  moduleSize: { type: DataTypes.STRING },
  illuminationColor: { type: DataTypes.STRING },
  waveLength: { type: DataTypes.STRING },
  packaging: { type: DataTypes.STRING },
  ifForwardCurrent: { type: DataTypes.STRING },
  vfForwardVoltage: { type: DataTypes.STRING },
  type: { type: DataTypes.STRING },
  qualification: { type: DataTypes.STRING },
  operatingTemperatureMax: { type: DataTypes.STRING },
  operatingTemperatureMin: { type: DataTypes.STRING },
  dimensions: { type: DataTypes.STRING },
  spnDescription: { type: DataTypes.TEXT },
  series: { type: DataTypes.STRING },
  partStatus: { type: DataTypes.STRING },
  numberOfChannels: { type: DataTypes.STRING },
  interface: { type: DataTypes.STRING },
  voltageSupply: { type: DataTypes.STRING },
  mountingType: { type: DataTypes.STRING },
  packageOrCase: { type: DataTypes.STRING },
  numberOfRegulators: { type: DataTypes.STRING },
  numberOfPositions: { type: DataTypes.STRING },
  voltageRating: { type: DataTypes.STRING },
  voltageInput: { type: DataTypes.STRING },
  voltageOutput: { type: DataTypes.STRING },
  connectorType: { type: DataTypes.STRING },
  impedance: { type: DataTypes.STRING },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'products',
  timestamps: false,
});

module.exports = { Product };
