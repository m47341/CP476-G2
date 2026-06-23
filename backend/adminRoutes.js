// everything librarians/admins can see/do
const express = require("express");
const db = require("./database");
const router = express.Router();

router.get("/main-page", getAdminMainPage);
router.get("/create-new-patron", createNewPatron);
router.get("/update-patron", updatePatronInfo);
router.get("/add-new-book", addNewBook);
router.get("/search", searchBooksAdmin);
router.get("/check-out", checkOutBook);
router.get("/check-in", checkInBook);
router.get("/overdue-book-list", getOverdueBooksList);


async function getAdminMainPage(req, res) {
  // goal: master screen for librarians
  // pulls up main control panel screen showing all available admin actions
  try { 
    // not sure what to include here
    // It seems like the Admin mainpage is only buttons that lead to the other pages which is frontend foccused
    // Do we want metrics here?
    res.json({ success: true, message: "Admin dashboard loaded."});
  } catch (error) {
    console.error("Dashboard loading error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

function createNewPatron() {
  // goal: lets an admin register a brand new student into the system
  // table: USERS (ID, Name, Email, Password, Role)
  // takes new registration details from admin form and inserts them into database
}

function updatePatronInfo() {
  // goal: change an existing library members details
  // table: USERS (ID, Name, Email, Password, Role)
  // finds a user by their ID and overwrites fields (eg, email or name typos) with updated text
}

function addNewBook() {
  // goal: lets admin add new book to lib inventory
  // table: BOOKS (ID, Title, Author_ID, ISBN, Total_Quantity, Available_Quantity)
  // inserts brand new row into catalog table with book details and stock count
}

async function searchBooksAdmin(req, res) {
  // goal: lets admin search through entire library collection
  // table: BOOKS (ID, Title, Author_ID, ISBN, Total_Quantity, Available_Quantity)
  // runs catalog search but displays internal data (eg, total stock vs available stock for inventory tracking)

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

async function checkOutBook(req, res) {
  // goal: lets an admin lend a book to a student standing at the desk
  // table: LOANS (ID, User_ID, Book_ID, Borrow_Date, Due_Date, Returned_Date, Fine_amount)
  // creates brand new loan entry linking student ID and book ID, setting a 14 day deadline
  
  // Extract string
  const patronName = req.body.Patron_Name;
  const bookId = req.body.Book_ID;


  try {
    // Translate Patron name into ID
    const [userRows] = await db.dbPromise.query(
      "SELECT * FROM USERS WHERE name = ?",
      [patronName]
    );

    if (userRows.length == 0) {
      return res.status(404).json({ success: false, error: "Patron not found"});
    }

    const extractedUserId = userRows[0].ID;
    // Create Loan
    await db.dbPromise.query(
      "INSERT INTO LOANS (User_ID, Book_ID, Borrow_Date, Due_Date) VALUES (?, ?, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY))",
      [extractedUserId, bookId]
    );    

    // Update inventory
    await db.dbPromise.query(
      "UPDATE BOOKS SET Available_Quantity = Available_Quantity - 1 WHERE ID = ?",
      [bookId]
    );

    res.json({ success: true, message: "Book checked out successfully."});

  } catch (error) {
    console.error("Check Out error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function checkInBook(req, res) {
  // goal: processes a book that a student brings back to the front desk
  // table: LOANS (ID, User_ID, Book_ID, Borrow_Date, Due_Date, Returned_Date, Fine_amount)
  // updates books open loan row with current date for return and calculates fines if late
  
  // Extract string
  const patronName = req.body.Patron_Name;
  const bookId = req.body.Book_ID;


  // Translate Patron name into ID
  try {
    const [userRows] = await db.dbPromise.query(
      "SELECT * FROM USERS WHERE Name = ?",
      [patronName]
    );

    if (userRows.length == 0) {
      return res.status(404).json({ success: false, error: "Patron not found"});
    }

    const extractedUserId = userRows[0].ID;

    // Close Loan
    await db.dbPromise.query(
      "UPDATE LOANS SET Returned_Date = CURRENT_DATE WHERE Book_ID = ? AND User_ID = ? AND Returned_Date IS NULL",
      [bookId, extractedUserId]
    );   

    // Update inventory
    await db.dbPromise.query(
      "UPDATE BOOKS SET Available_Quantity = Available_Quantity + 1 WHERE ID = ?",
      [bookId]
    );

    res.json({ success: true, message: "Book checked in successfully."});

  } catch (error) {
    console.error("Check In error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

function getOverdueBooksList() {
  // goal: shows list of all books that are past due date and havent been returned yet
  // table: LOANS, USERS, BOOKS
  // filters database for loans where return date is blank and due date is older than current day
}

module.exports = router;