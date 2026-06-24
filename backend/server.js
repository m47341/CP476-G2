// main entry point to start app and link files together

// dependencies
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// other js files to link to
const db = require("./database");
const authRoutes = require("./authRoutes");
const patronRoutes = require("./patronRoutes");
const adminRoutes = require("./adminRoutes");

// setup
const app = express();
const PORT = 3060;

// middleware, for cross origin requests and to parse json data
app.use(cors());
app.use(bodyParser.json());

// temp testing route to make sure backend can read from mysql
app.get("/test-db", async (req, res) => {
  try {
    // runs basic query using db promise file
    const [rows] = await db.dbPromise.query("SELECT * FROM USERS");
    res.json({ message: "database read successfully", data: rows });
  } catch (error) {
    // error message if query fails
    res.status(500).json({ error: error.message });
  }
});

// run functions to load routes and boot server
configureRoutes();
startServer();

// starts backend server so it can listen for incoming traffic
// sets app to listen on a specific port (3060) and logs a message when running
function startServer() {
  db.connectToDatabase();
  app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
  });
}

// connect all route files to main server app
// links auth, patron, and admin route files so app recognizes them
function configureRoutes() {
  app.use("/auth", authRoutes);
  app.use("/patron", patronRoutes);
  app.use("/admin", adminRoutes);
}
