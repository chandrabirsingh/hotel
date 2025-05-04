const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Hotel = sequelize.define('Hotel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
  full_address: DataTypes.TEXT,
  city: DataTypes.STRING,
  map_link: DataTypes.TEXT,
  main_image: DataTypes.STRING,
  images: DataTypes.TEXT, // JSON string or comma-separated
  about: DataTypes.TEXT,
  type: DataTypes.STRING,
  status: DataTypes.STRING,
}, {
  tableName: 'hotels',
  timestamps: false,
});

module.exports = Hotel;
