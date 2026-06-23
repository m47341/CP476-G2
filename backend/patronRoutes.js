const express = require("express");
const db = require("./database");
const router = express.Router();

// everything regular students/patrons can see and do

router.post("/landing-page", getLandingPage);
router.post("/main-page", getPatronMainPage);
router.post("/search", searchBooksPatron);
router.post("/book-hold", putBookOnHold);

function getLandingPage(req, res) {
  // goal: main welcome screen anyone sees before logging in
  // sends back main splash screen view where user picks admin or patron login
  try { 
    res.json({ success: true, message: "Landing page loaded."});
  } catch (error) {
    console.error("Page loading error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}


function getPatronMainPage(req, res) {
  // goal: the screen a patron sees right after logging in
  // table: USERS, LOANS
  // looks up logged in students ID to find active loans and any late fees owed
  try { 
    res.json({ success: true, message: "Patron dashboard loaded."});
  } catch (error) {
    console.error("Dashboard loading error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function searchBooksPatron(req, res) {
  // goal: lets regular students search library catalog
  // takes search keywords from patron search bar and runs query to find matching titles
  // Extract string
  const title = req.query.Title;
  const authorName = req.query.Author_Name;
    
  try {
    // Translate Author into ID
    const [authorRows] = await db.dbPromise.query(
      "SELECT * FROM AUTHORS WHERE Name = ?",
      [authorName]
    );
  
    if (authorRows.length == 0) {
      return res.status(404).json({ success: false, error: "Author not found."});
    }
  
    const extractedAuthorID = authorRows[0].ID;
  
    // Search Database
    const [rows] = await db.dbPromise.query(
      "SELECT * FROM BOOKS WHERE Title = ? AND Author_ID = ?",
      [title, extractedAuthorID]
    );
  
    // Send response
    res.json({ success: true, books: rows });
  } catch (error) {
    console.error("Search error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

function putBookOnHold() {
  // goal: lets student reserve a book that is currently checked out by someone else
  // table: HOLDS (User_ID, Book_ID, Date_Start)
  // adds a new holds row with a timestamp so the patron gets in line for the book
}

module.exports = router;