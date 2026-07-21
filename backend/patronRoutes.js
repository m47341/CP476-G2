// everything regular students/patrons can see and do
const express = require("express");
const db = require("./database");
const {
  normalizeInput,
  parsePositiveInteger,
  isDuplicateEntryError,
} = require("./utils");
const router = express.Router();

function extractPatronLookup(body) {
  return {
    patronId: parsePositiveInteger(body && (body.Patron_ID || body.User_ID)),
    patronEmail: normalizeInput(
      body && (body.Patron_Email || body.patron_email),
    ),
    patronName: normalizeInput(
      body && (body.Patron_Name || body.patron_name || body.Name),
    ),
  };
}

router.post("/landing-page", getLandingPage);
router.post("/patron-main-page", getPatronMainPage);
router.post("/patron-book-search", searchBooksPatron);
router.post("/put-book-on-hold", putBookOnHold);
router.post("/cancel-hold", cancelBookHold);

function getLandingPage(req, res) {
  // goal: main welcome screen anyone sees before logging in
  // sends back main splash screen view where user picks admin or patron login
  try {
    res.json({ success: true, message: "Landing page loaded." });
  } catch (error) {
    console.error("Page loading error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getPatronMainPage(req, res) {
  // goal: the screen a patron sees right after logging in
  // table: USERS, LOANS
  // looks up logged in students ID to find active loans and any late fees owed
  const lookup = extractPatronLookup(req.body);

  if (!lookup.patronId && !lookup.patronEmail && !lookup.patronName) {
    return res.status(400).json({
      success: false,
      error: "A patron ID, email, or name is required",
    });
  }

  try {
    let query;
    let parameters;

    if (lookup.patronId) {
      query = "SELECT ID, Name, Email, Role FROM USERS WHERE ID = ?";
      parameters = [lookup.patronId];
    } else if (lookup.patronEmail) {
      query = "SELECT ID, Name, Email, Role FROM USERS WHERE Email = ?";
      parameters = [lookup.patronEmail];
    } else {
      query = "SELECT ID, Name, Email, Role FROM USERS WHERE Name = ?";
      parameters = [lookup.patronName];
    }

    const [userRows] = await db.dbPromise.query(query, parameters);

    if (userRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Patron not found" });
    }

    if (!lookup.patronId && !lookup.patronEmail && userRows.length > 1) {
      return res.status(409).json({
        success: false,
        error: "Multiple patrons match that name, use a unique identifier",
      });
    }

    const user = userRows[0];

    if (user.Role !== "Patron") {
      return res.status(403).json({
        success: false,
        error: "Only patrons can access the patron dashboard",
      });
    }

    const [loanRows] = await db.dbPromise.query(
      `SELECT
        LOANS.ID,
        BOOKS.Title,
        AUTHORS.Name AS Author_Name,
        LOANS.Borrow_Date,
        LOANS.Due_Date,
        LOANS.Returned_Date,
        CASE
          WHEN LOANS.Returned_Date IS NULL AND LOANS.Due_Date < CURRENT_DATE
            THEN GREATEST(DATEDIFF(CURRENT_DATE, LOANS.Due_Date), 0) * 0.5
          ELSE LOANS.Fine_amount
        END AS Fine
      FROM LOANS
      INNER JOIN BOOKS ON LOANS.Book_ID = BOOKS.ID
      INNER JOIN AUTHORS ON BOOKS.Author_ID = AUTHORS.ID
      WHERE LOANS.User_ID = ? AND LOANS.Returned_Date IS NULL
      ORDER BY LOANS.Due_Date ASC, BOOKS.Title ASC`,
      [user.ID],
    );

    const [holdRows] = await db.dbPromise.query(
      `SELECT
        HOLDS.Book_ID,
        BOOKS.Title,
        AUTHORS.Name AS Author_Name,
        HOLDS.Date_Start,
        BOOKS.Available_Quantity,
        BOOKS.Total_Quantity
      FROM HOLDS
      INNER JOIN BOOKS ON HOLDS.Book_ID = BOOKS.ID
      INNER JOIN AUTHORS ON BOOKS.Author_ID = AUTHORS.ID
      WHERE HOLDS.User_ID = ?
      ORDER BY HOLDS.Date_Start DESC, BOOKS.Title ASC`,
      [user.ID],
    );

    const [summaryRows] = await db.dbPromise.query(
      `SELECT
        COUNT(*) AS Active_Loans,
        COALESCE(SUM(CASE WHEN Due_Date < CURRENT_DATE THEN GREATEST(DATEDIFF(CURRENT_DATE, Due_Date), 0) * 0.5 ELSE 0 END), 0) AS Outstanding_Fines,
        SUM(CASE WHEN Due_Date < CURRENT_DATE THEN 1 ELSE 0 END) AS Overdue_Loans
      FROM LOANS
      WHERE User_ID = ? AND Returned_Date IS NULL`,
      [user.ID],
    );

    res.json({
      success: true,
      user: {
        ID: user.ID,
        Name: user.Name,
        Email: user.Email,
        Role: user.Role,
      },
      summary: summaryRows[0],
      loans: loanRows,
      holds: holdRows,
    });
  } catch (error) {
    console.error("Dashboard loading error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function searchBooksPatron(req, res) {
  // goal: lets regular students search library catalog
  // takes search keywords from patron search bar and runs query to find matching titles
  // Extract string
  const title = normalizeInput(req.body && req.body.Title);
  const authorName = normalizeInput(req.body && req.body.Author_Name);

  if (!title && !authorName) {
    return res.status(400).json({
      success: false,
      error: "Provide a title or author to search.",
    });
  }

  try {
    const conditions = [];
    const parameters = [];

    if (title) {
      conditions.push("BOOKS.Title LIKE ?");
      parameters.push(`%${title}%`);
    }

    if (authorName) {
      conditions.push("AUTHORS.Name LIKE ?");
      parameters.push(`%${authorName}%`);
    }

    let query =
      "SELECT BOOKS.ID, BOOKS.Title, AUTHORS.Name AS Author_Name, BOOKS.Total_Quantity, BOOKS.Available_Quantity AS Copies_Available FROM BOOKS INNER JOIN AUTHORS ON BOOKS.Author_ID = AUTHORS.ID";

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY BOOKS.Title ASC";

    const [rows] = await db.dbPromise.query(query, parameters);

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
  const userId = parsePositiveInteger(req.body && req.body.User_ID);
  const bookId = parsePositiveInteger(req.body && req.body.Book_ID);

  if (!userId || !bookId) {
    return res.status(400).json({
      success: false,
      error: "Valid user and book IDs are required",
    });
  }

  try {
    const [userRows] = await db.dbPromise.query(
      "SELECT ID, Role FROM USERS WHERE ID = ?",
      [userId],
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (userRows[0].Role !== "Patron") {
      return res
        .status(403)
        .json({ success: false, error: "Only patrons can place holds." });
    }

    const [bookRows] = await db.dbPromise.query(
      "SELECT ID, Title FROM BOOKS WHERE ID = ?",
      [bookId],
    );

    if (bookRows.length === 0) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    const [existingHoldRows] = await db.dbPromise.query(
      "SELECT 1 FROM HOLDS WHERE User_ID = ? AND Book_ID = ?",
      [userId, bookId],
    );

    if (existingHoldRows.length > 0) {
      return res.status(409).json({
        success: false,
        error: "You already have this book on hold",
      });
    }

    await db.dbPromise.query(
      "INSERT INTO HOLDS (User_ID, Book_ID, Date_Start) VALUES (?, ?, NOW())",
      [userId, bookId],
    );

    const extractedBookTitle = bookRows[0].Title;

    res.json({
      success: true,
      message: `Successfully put ${extractedBookTitle} on hold.`,
    });
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      return res.status(409).json({
        success: false,
        error: "You already have this book on hold",
      });
    }

    console.error("Hold error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function cancelBookHold(req, res) {
  const userId = parsePositiveInteger(req.body && req.body.User_ID);
  const bookId = parsePositiveInteger(req.body && req.body.Book_ID);

  if (!userId || !bookId) {
    return res
      .status(400)
      .json({ success: false, error: "Valid user and book IDs are required" });
  }
  try {
    const [result] = await db.dbPromise.query(
      "DELETE FROM HOLDS WHERE User_ID = ? AND Book_ID = ?",
      [userId, bookId],
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Active hold record not found" });
    }
    res.json({ success: true, message: "Hold canceled successfully" });
  } catch (error) {
    console.error("Cancel hold error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = router;
