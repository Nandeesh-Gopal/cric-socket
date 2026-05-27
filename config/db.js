console.log("currently importing")

const mysql = require("mysql2");
require("dotenv").config();
// important to import the env variables from .env file

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
// connection pool is a collection of reusable database connection
//Instead of creating a new database connection every time a request comes, Node.js reuses existing connections

/*
const pool = mysql.createPool({
   host: "localhost",
   user: "root",
   password: "1234",
   database: "test",
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0
});
| Option               | Meaning              |
| -------------------- | -------------------- |
| `connectionLimit`    | Maximum connections  |
| `waitForConnections` | Wait if all busy     |
| `queueLimit`         | Max waiting requests |

*/
pool.getConnection((err, connection) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Connected to DB");
  connection.release();
});

module.exports = pool.promise();