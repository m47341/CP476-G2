// handles signing in for both types of users
const express = require("express");
const db = require("./database");
const router = express.Router();

router.post("/patron-sign-in", patronSignIn);
router.post("/admin-sign-in", adminSignIn);

async function patronSignIn(req, res) {
  // goal: lets regular patron log into their account
  // table: USERS (ID, Name, Email, Password, Role [Patron])
  // gets email and password from frontend form and checks if matches a record in database

  // Extract email and password
  const patronEmail = req.body.patron_email;
  const patronPassword = req.body.patron_password;

  try {
    // Database Verification
    const [userRows] = await db.dbPromise.query(
      "SELECT * FROM USERS WHERE Email = ?",
      [patronEmail],
    );

    if (userRows.length == 0) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password." });
    }

    const user = userRows[0];

    if (user.Role !== "Patron") {
      return res
        .status(403)
        .json({ success: false, error: "Unauthorized access" });
    }

    if (user.Password !== patronPassword) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password." });
    }
    // Unlock dashboard
    res.json({ success: true, message: `Welcome ${user.Name}` });
  } catch (error) {
    console.error("Patron Sign In error: ", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
}

async function adminSignIn(req, res) {
  // goal: lets librarians/admins log into backend management side
  // table: USERS (ID, Name, Email, Password, Role [Admin])
  // checks login details against database and confirms if user role is actually an admin

  // Extract email and password
  const adminEmail = req.body.admin_email;
  const adminPassword = req.body.admin_password;

  try {
    // Database Verification
    const [userRows] = await db.dbPromise.query(
      "SELECT * FROM USERS WHERE Email = ?",
      [adminEmail],
    );

    if (userRows.length == 0) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password." });
    }

    const user = userRows[0];

    if (user.Role !== "Admin") {
      return res
        .status(403)
        .json({ success: false, error: "Unauthorized access" });
    }

    if (user.Password !== adminPassword) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password." });
    }
    // Unlock dashboard
    res.json({ success: true, message: `Welcome ${user.Name}` });
  } catch (error) {
    console.error("Admin Sign In error: ", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
}

module.exports = router;
