const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    connectionLimit: 10
}).promise();

db.getConnection()
    .then(() => console.log('✅ Connected to MySQL Database'))
    .catch(err => console.error('❌ Database connection failed:', err));

module.exports = db;
