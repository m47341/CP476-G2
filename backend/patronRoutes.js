const express = require("express");
const db = require("./database");
const router = express.Router();

// everything regular students/patrons can see and do
const express = require("express");
const db = require("./database");
const router = express.Router();

router.post("/landing-page", getLandingPage);
router.post("/patron-main-page", getPatronMainPage);
router.post("/patron-book-search", searchBooksPatron);
router.post("/put-book-on-hold", putBookOnHold);

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

async function putBookOnHold(req, res) {
  // goal: lets student reserve a book that is currently checked out by someone else
  // table: HOLDS (User_ID, Book_ID, Date_Start)
  // adds a new holds row with a timestamp so the patron gets in line for the book

  // Input extraction
  const userId = req.body.User_ID;
  const bookId = req.body.Book_ID;

  try {
    // query for hold table
    const [holdRows] = await db.dbPromise.query(
      "INSERT INTO HOLDS (User_ID, Book_ID, Date_Start) VALUES (?, ?, NOW())",
      [userId, bookId]
    );

    // Response
    const [bookRows] = await db.dbPromise.query(
      "SELECT * FROM BOOKS WHERE ID = ?",
      [bookId]
    );

    const extractedBookTitle = bookRows[0].Title;

    res.json({ success: true, message: `Successfully put ${extractedBookTitle} on hold.`});
  } catch (error) {
    console.error("Hold error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = router;