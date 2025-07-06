const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');  // Ensure the path to sequelize.js is correct

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  password: DataTypes.STRING,
}, {
  tableName: 'admin', // Ensure the table name is correct
  timestamps: false,   // If you are not using timestamps
});

module.exports = Admin;
