const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

// const db = mysql
//   .createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PWD,
//     database: process.env.DB_NAME,
//   })
//   .promise();

const db = mysql.createConnection(process.env.DB_URL).promise();

module.exports = db;
