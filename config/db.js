const mysql = require("mysql2");

// create pool (BEST PRACTICE)
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "cricket_db",
});

module.exports = pool.promise();