// src/db.js
const { Sequelize } = require('sequelize');

const DB_NAME = 'digikey_db';
const DB_USER = 'root';
const DB_PASS = '';     
const DB_HOST = 'localhost';


const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: false,
});

sequelize.authenticate()
  .then(() => console.log('✅ Database connection established'))
  .catch(err => console.error('❌ Unable to connect to DB:', err));

module.exports = { sequelize };
