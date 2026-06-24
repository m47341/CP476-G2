// handles set up and open connection to database
// using database credentials so can run queries

const mysql = require("mysql2"); // https://www.npmjs.com/package/mysql2

// creates shared pool of 10 reusable connections over a universal port
const pool = mysql.createPool({
  host: "127.0.0.1", // localhost
  user: "root",
  password: "pass123",
  database: "library_db",
  port: 3060,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// enables async/await support so js can wait for db data
// without, app could crash
const dbPromise = pool.promise();

// tests connection config
function connectToDatabase() {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log("db connection failed: ", err.message);
    } else {
      console.log("db connection success");
    }
  });
}

// exports so server.js can pull
module.exports = {
  connectToDatabase,
  dbPromise
};
