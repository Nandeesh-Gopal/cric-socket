const mysql = require("mysql2");

// create pool (BEST PRACTICE)
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Nandbtech07",
  database: "cricket_db",
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