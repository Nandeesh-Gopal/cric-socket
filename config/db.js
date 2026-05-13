const mysql = require("mysql2");
require("dotenv").config();


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Connected to DB");
  connection.release();
});

module.exports = pool.promise();