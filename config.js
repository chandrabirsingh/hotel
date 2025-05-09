// require('dotenv').config(); // Load .env file

// var mysql = require('mysql');
// var Razorpay = require('razorpay');

// var con = mysql.createConnection({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE
// });

// var instance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// const config = {};
// config.mysql = mysql;
// config.instance = instance;
// config.port = process.env.APP_PORT;
// config.APP_URL = process.env.APP_URL;
// config.con = con;
    
// module.exports = config;
require('dotenv').config();
var mysql = require('mysql');
var Razorpay = require('razorpay');
const sequelize = require('./sequelize');

// Raw MySQL connection (for existing code)
const con = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const config = {
  instance,
  port: process.env.APP_PORT,
  APP_URL: process.env.APP_URL,
  con,        // ✅ keep using raw MySQL connection
  sequelize,  // ✅ use Sequelize wherever needed
};

module.exports = config;
