console.log("currently importing")

const mysql = require("mysql2");
require("dotenv").config();
// important to import the env variables from .env file

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
  //default connection limit is 10
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

/*

When a connection pool creates connections, they are usually kept open even if there are no incoming requests. 
These idle connections are not immediately deleted because reusing existing connections is much faster than creating
new ones every time. The pool keeps them ready for future database queries. However, if a connection stays idle for a
long time, MySQL or the network may automatically close it because of timeout settings such as wait_timeout. When a
new request later arrives, the pool checks the connection, and if it was closed, it automatically creates a new one
and continues working normally.

*/


module.exports = pool.promise();
// to avoid callback hell we are using promise based connection pool instead of callback based connection pool