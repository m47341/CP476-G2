// everything librarians/admins can see/do
const express = require("express");
const db = require("./database");
const bcrypt = require("bcryptjs");
const {
  normalizeInput,
  parsePositiveInteger,
  isDuplicateEntryError,
} = require("./utils");
const router = express.Router();

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function extractPatronLookup(body) {
  return {
    patronId: parsePositiveInteger(body && (body.Patron_ID || body.User_ID)),
    patronEmail: normalizeInput(body && body.Patron_Email),
    patronName: normalizeInput(body && body.Patron_Name),
  };
}

async function runTransaction(work) {
  const connection = await db.dbPromise.getConnection();

  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("Transaction rollback error:", rollbackError);
    }

    throw error;
  } finally {
    connection.release();
  }
}

async function resolvePatron(connection, body, notFoundMessage) {
  const lookup = extractPatronLookup(body);
  let query;
  let parameters;

  if (lookup.patronId !== null) {
    query = "SELECT ID, Name, Email, Role FROM USERS WHERE ID = ?";
    parameters = [lookup.patronId];
  } else if (lookup.patronEmail) {
    query = "SELECT ID, Name, Email, Role FROM USERS WHERE Email = ?";
    parameters = [lookup.patronEmail];
  } else if (lookup.patronName) {
    query = "SELECT ID, Name, Email, Role FROM USERS WHERE Name = ?";
    parameters = [lookup.patronName];
  } else {
    return {
      error: {
        status: 400,
        message: "A patron ID, email, or name is required",
      },
    };
  }

  const [userRows] = await connection.query(query, parameters);

  if (userRows.length === 0) {
    return {
      error: {
        status: 404,
        message: notFoundMessage,
      },
    };
  }

  if (!lookup.patronId && !lookup.patronEmail && userRows.length > 1) {
    return {
      error: {
        status: 409,
        message: "Multiple patrons match that name, use a unique identifier",
      },
    };
  }

  return { user: userRows[0] };
}

async function getOrCreateAuthorId(connection, authorName) {
  const [authorInsertResult] = await connection.query(
    "INSERT INTO AUTHORS (Name) VALUES (?) ON DUPLICATE KEY UPDATE ID = LAST_INSERT_ID(ID)",
    [authorName],
  );

  return authorInsertResult.insertId;
}

function extractAdminLookup(body) {
  return {
    adminId: parsePositiveInteger(body && (body.Admin_ID || body.User_ID)),
    adminEmail: normalizeInput(body && (body.Admin_Email || body.admin_email)),
    adminName: normalizeInput(
      body && (body.Admin_Name || body.admin_name || body.Name),
    ),
  };
}

router.post("/main-page", getAdminMainPage);
router.post("/create-new-patron", createNewPatron);
router.post("/update-patron", updatePatronInfo);
router.post("/add-new-book", addNewBook);
router.post("/search", searchBooksAdmin);
router.post("/check-out", checkOutBook);
router.post("/check-in", checkInBook);
router.post("/overdue-book-list", getOverdueBooksList);

async function getAdminMainPage(req, res) {
  // goal: master screen for librarians
  // pulls up main control panel screen showing all available admin actions
  try {
    const lookup = extractAdminLookup({ ...req.query, ...req.body });
    let adminUser = null;

    if (lookup.adminId || lookup.adminEmail || lookup.adminName) {
      let query;
      let parameters;

      if (lookup.adminId) {
        query = "SELECT ID, Name, Email, Role FROM USERS WHERE ID = ?";
        parameters = [lookup.adminId];
      } else if (lookup.adminEmail) {
        query = "SELECT ID, Name, Email, Role FROM USERS WHERE Email = ?";
        parameters = [lookup.adminEmail];
      } else {
        query = "SELECT ID, Name, Email, Role FROM USERS WHERE Name = ?";
        parameters = [lookup.adminName];
      }

      const [userRows] = await db.dbPromise.query(query, parameters);

      if (userRows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Admin not found" });
      }

      if (!lookup.adminId && !lookup.adminEmail && userRows.length > 1) {
        return res.status(409).json({
          success: false,
          error: "Multiple admins match that name, use a unique identifier",
        });
      }

      adminUser = userRows[0];

      if (adminUser.Role !== "Admin") {
        return res.status(403).json({
          success: false,
          error: "Only admins can access the admin dashboard",
        });
      }
    }

    const [summaryRows] = await db.dbPromise.query(
      `SELECT
        (SELECT COUNT(*) FROM USERS) AS Total_Users,
        (SELECT COUNT(*) FROM USERS WHERE Role = 'Patron') AS Total_Patrons,
        (SELECT COUNT(*) FROM USERS WHERE Role = 'Admin') AS Total_Admins,
        (SELECT COUNT(*) FROM BOOKS) AS Total_Books,
        (SELECT COALESCE(SUM(Total_Quantity), 0) FROM BOOKS) AS Total_Copies,
        (SELECT COALESCE(SUM(Available_Quantity), 0) FROM BOOKS) AS Available_Copies,
        (SELECT COUNT(*) FROM LOANS WHERE Returned_Date IS NULL) AS Active_Loans,
        (SELECT COUNT(*) FROM LOANS WHERE Returned_Date IS NULL AND Due_Date < CURRENT_DATE) AS Overdue_Loans,
        (SELECT COUNT(*) FROM HOLDS) AS Active_Holds,
        (SELECT COUNT(*) FROM BOOKS WHERE Available_Quantity <= 1) AS Low_Stock_Books`,
    );

    const [overdueRows] = await db.dbPromise.query(
      `SELECT
        LOANS.ID AS Loan_ID,
        USERS.Name AS Patron_Name,
        USERS.Email AS Patron_Email,
        BOOKS.Title,
        AUTHORS.Name AS Author_Name,
        LOANS.Due_Date,
        GREATEST(DATEDIFF(CURRENT_DATE, LOANS.Due_Date), 0) AS Days_Overdue,
        GREATEST(DATEDIFF(CURRENT_DATE, LOANS.Due_Date), 0) * 0.5 AS Current_Fine
      FROM LOANS
      INNER JOIN USERS ON LOANS.User_ID = USERS.ID
      INNER JOIN BOOKS ON LOANS.Book_ID = BOOKS.ID
      INNER JOIN AUTHORS ON BOOKS.Author_ID = AUTHORS.ID
      WHERE LOANS.Returned_Date IS NULL AND LOANS.Due_Date < CURRENT_DATE
      ORDER BY LOANS.Due_Date ASC, USERS.Name ASC
      LIMIT 10`,
    );

    const [lowStockRows] = await db.dbPromise.query(
      `SELECT
        BOOKS.ID,
        BOOKS.Title,
        AUTHORS.Name AS Author_Name,
        BOOKS.Total_Quantity,
        BOOKS.Available_Quantity
      FROM BOOKS
      INNER JOIN AUTHORS ON BOOKS.Author_ID = AUTHORS.ID
      ORDER BY BOOKS.Available_Quantity ASC, BOOKS.Title ASC
      LIMIT 10`,
    );

    const [recentLoanRows] = await db.dbPromise.query(
      `SELECT
        LOANS.ID AS Loan_ID,
        USERS.Name AS Patron_Name,
        BOOKS.Title,
        AUTHORS.Name AS Author_Name,
        LOANS.Borrow_Date,
        LOANS.Due_Date,
        LOANS.Returned_Date
      FROM LOANS
      INNER JOIN USERS ON LOANS.User_ID = USERS.ID
      INNER JOIN BOOKS ON LOANS.Book_ID = BOOKS.ID
      INNER JOIN AUTHORS ON BOOKS.Author_ID = AUTHORS.ID
      ORDER BY LOANS.Borrow_Date DESC, LOANS.ID DESC
      LIMIT 10`,
    );

    res.json({
      success: true,
      admin: adminUser
        ? {
            ID: adminUser.ID,
            Name: adminUser.Name,
            Email: adminUser.Email,
            Role: adminUser.Role,
          }
        : null,
      summary: summaryRows[0],
      overdueLoans: overdueRows,
      lowStockBooks: lowStockRows,
      recentLoans: recentLoanRows,
    });
  } catch (error) {
    console.error("Dashboard loading error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function createNewPatron(req, res) {
  // goal: lets an admin register a brand new student into the system
  // table: USERS (ID, Name, Email, Password, Role)
  // takes new registration details from admin form and inserts them into database

  // Extract string
  const patronName = normalizeInput(req.body && req.body.Patron_Name);
  const patronEmail = normalizeInput(req.body && req.body.Patron_Email);
  const patronPassword = normalizeInput(req.body && req.body.Patron_Password);

  // validation
  if (!patronName || !patronEmail || !patronPassword) {
    return res.status(400).json({
      success: false,
      error: "Name, email, and password are required",
    });
  }

  if (patronPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: "Password must be at least 6 characters",
    });
  }

  if (!EMAIL_REGEX.test(patronEmail)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid email format" });
  }

  try {
    const [existingUsers] = await db.dbPromise.query(
      "SELECT ID FROM USERS WHERE Email = ?",
      [patronEmail],
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: "A patron with that email already exists",
      });
    }

    const hashed = await bcrypt.hash(patronPassword, 10);
    // Create new patron and insert it into USERS
    await db.dbPromise.query(
      "INSERT INTO USERS (Name, Email, Password, Role) VALUES (?, ?, ?, 'Patron')",
      [patronName, patronEmail, hashed],
    );
    res.json({ success: true, message: "Patron created successfully." });
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      return res.status(409).json({
        success: false,
        error: "A patron with that email already exists",
      });
    }

    console.error("Patron creation error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updatePatronInfo(req, res) {
  // goal: change an existing library members details
  // table: USERS (ID, Name, Email, Password, Role)
  // finds a user by their ID and overwrites fields (eg, email or name typos) with updated text

  // Extract string
  const patronId = parsePositiveInteger(req.body && req.body.Patron_ID);
  const patronEmail = normalizeInput(req.body && req.body.Patron_Email);
  const patronName = normalizeInput(req.body && req.body.Patron_Name);
  const newPatronName = normalizeInput(req.body && req.body.New_Patron_Name);
  const newPatronEmail = normalizeInput(req.body && req.body.New_Patron_Email);
  const newPatronPassword = normalizeInput(
    req.body && req.body.New_Patron_Password,
  );

  if (patronId === null && !patronEmail && !patronName) {
    return res.status(400).json({
      success: false,
      error: "Current patron ID, email, or name is required",
    });
  }

  if (!newPatronName && !newPatronEmail && !newPatronPassword) {
    return res.status(400).json({
      success: false,
      error: "Enter at least one field to update",
    });
  }

  if (newPatronEmail && !EMAIL_REGEX.test(newPatronEmail)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid email format" });
  }

  if (newPatronPassword && newPatronPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: "New password must be at least 6 characters",
    });
  }

  try {
    const lookupValue =
      patronId !== null
        ? { key: "ID", value: patronId }
        : patronEmail
          ? { key: "Email", value: patronEmail }
          : { key: "Name", value: patronName };

    const [userRows] = await db.dbPromise.query(
      `SELECT ID, Email FROM USERS WHERE ${lookupValue.key} = ?`,
      [lookupValue.value],
    );

    if (userRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Patron not found" });
    }

    if (lookupValue.key === "Name" && userRows.length > 1) {
      return res.status(409).json({
        success: false,
        error:
          "Multiple patrons match that name. Please use a unique identifier",
      });
    }

    const extractedUserId = userRows[0].ID;
    const currentEmail = userRows[0].Email;

    if (newPatronEmail && newPatronEmail !== currentEmail) {
      const [duplicateEmailRows] = await db.dbPromise.query(
        "SELECT ID FROM USERS WHERE Email = ? AND ID <> ?",
        [newPatronEmail, extractedUserId],
      );

      if (duplicateEmailRows.length > 0) {
        return res.status(409).json({
          success: false,
          error: "Another patron already uses that email",
        });
      }
    }

    const updateFields = [];
    const updateValues = [];

    if (newPatronName) {
      updateFields.push("Name = ?");
      updateValues.push(newPatronName);
    }

    if (newPatronEmail) {
      updateFields.push("Email = ?");
      updateValues.push(newPatronEmail);
    }

    if (newPatronPassword) {
      const hashedPassword = await bcrypt.hash(newPatronPassword, 10);
      updateFields.push("Password = ?");
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Enter at least one field to update",
      });
    }

    // Update patron
    await db.dbPromise.query(
      `UPDATE USERS SET ${updateFields.join(", ")} WHERE ID = ?`,
      [...updateValues, extractedUserId],
    );

    res.json({ success: true, message: "Patron updated successfully." });
  } catch (error) {
    console.error("Patron update error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function addNewBook(req, res) {
  // goal: lets admin add new book to lib inventory
  // table: BOOKS (ID, Title, Author_ID, ISBN, Total_Quantity, Available_Quantity)
  // inserts brand new row into catalog table with book details and stock count

  //Extract string
  const bookTitle = normalizeInput(req.body && req.body.Book_Title);
  const authorName = normalizeInput(req.body && req.body.Author_Name);
  const isbn = normalizeInput(req.body && req.body.ISBN);
  const totalQuantity = parsePositiveInteger(
    req.body && req.body.Total_Quantity,
  );
  const providedAvailableQuantity =
    req.body &&
    (req.body.Avaliable_Quantity ?? req.body.Available_Quantity) !== undefined
      ? parsePositiveInteger(
          req.body.Avaliable_Quantity ?? req.body.Available_Quantity,
        )
      : null;

  if (!bookTitle || !authorName || !isbn || totalQuantity === null) {
    return res.status(400).json({
      success: false,
      error: "Title, author, ISBN, and total quantity are required",
    });
  }

  if (
    providedAvailableQuantity !== null &&
    providedAvailableQuantity > totalQuantity
  ) {
    return res.status(400).json({
      success: false,
      error: "Available quantity cannot exceed total quantity",
    });
  }

  const availableQuantity =
    providedAvailableQuantity === null
      ? totalQuantity
      : providedAvailableQuantity;

  try {
    await runTransaction(async (connection) => {
      const extractedAuthorID = await getOrCreateAuthorId(
        connection,
        authorName,
      );

      await connection.query(
        "INSERT INTO BOOKS (Title, Author_ID, ISBN, Total_Quantity, Available_Quantity) VALUES (?, ?, ?, ?, ?)",
        [bookTitle, extractedAuthorID, isbn, totalQuantity, availableQuantity],
      );
    });

    res.json({ success: true, message: "Book added successfully." });
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      return res.status(409).json({
        success: false,
        error: "A book with that ISBN already exists",
      });
    }

    console.error("Book creation error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function searchBooksAdmin(req, res) {
  // goal: lets admin search through entire library collection
  // table: BOOKS (ID, Title, Author_ID, ISBN, Total_Quantity, Available_Quantity)
  // runs catalog search but displays internal data (eg, total stock vs available stock for inventory tracking)

  // Extract string
  const title = normalizeInput(req.body && req.body.Title);
  const authorName = normalizeInput(req.body && req.body.Author_Name);

  if (!title && !authorName) {
    return res.status(400).json({
      success: false,
      error: "Provide a title or author to search",
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
      "SELECT BOOKS.ID, BOOKS.Title, AUTHORS.Name AS Author_Name, BOOKS.ISBN, BOOKS.Total_Quantity, BOOKS.Available_Quantity AS Copies_Available FROM BOOKS INNER JOIN AUTHORS ON BOOKS.Author_ID = AUTHORS.ID";

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

async function checkOutBook(req, res) {
  // goal: lets an admin lend a book to a student standing at the desk
  // table: LOANS (ID, User_ID, Book_ID, Borrow_Date, Due_Date, Returned_Date, Fine_amount)
  // creates brand new loan entry linking student ID and book ID, setting a 14 day deadline

  // Extract string
  const patronId = parsePositiveInteger(req.body && req.body.Patron_ID);
  const patronEmail = normalizeInput(req.body && req.body.Patron_Email);
  const patronName = normalizeInput(req.body && req.body.Patron_Name);
  const bookId = parsePositiveInteger(req.body && req.body.Book_ID);

  if (!bookId || (patronId === null && !patronEmail && !patronName)) {
    return res.status(400).json({
      success: false,
      error: "Patron ID, email, or name and a valid book ID are required",
    });
  }

  try {
    await runTransaction(async (connection) => {
      const patronLookup = await resolvePatron(
        connection,
        {
          Patron_ID: patronId,
          Patron_Email: patronEmail,
          Patron_Name: patronName,
        },
        "Patron not found",
      );

      if (patronLookup.error) {
        const error = new Error(patronLookup.error.message);
        error.status = patronLookup.error.status;
        throw error;
      }

      const user = patronLookup.user;

      if (user.Role !== "Patron") {
        const error = new Error("Only patrons can be checked out to");
        error.status = 403;
        throw error;
      }

      const [openLoanRows] = await connection.query(
        "SELECT ID FROM LOANS WHERE User_ID = ? AND Book_ID = ? AND Returned_Date IS NULL",
        [user.ID, bookId],
      );

      if (openLoanRows.length > 0) {
        const error = new Error(
          "That patron already has an active loan for this book",
        );
        error.status = 409;
        throw error;
      }

      const [inventoryUpdateResult] = await connection.query(
        "UPDATE BOOKS SET Available_Quantity = Available_Quantity - 1 WHERE ID = ? AND Available_Quantity > 0",
        [bookId],
      );

      if (inventoryUpdateResult.affectedRows === 0) {
        const error = new Error("Book is currently unavailable");
        error.status = 409;
        throw error;
      }

      await connection.query(
        "INSERT INTO LOANS (User_ID, Book_ID, Borrow_Date, Due_Date) VALUES (?, ?, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY))",
        [user.ID, bookId],
      );
    });

    res.json({ success: true, message: "Book checked out successfully." });
  } catch (error) {
    if (error && error.status) {
      return res
        .status(error.status)
        .json({ success: false, error: error.message });
    }

    console.error("Check Out error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function checkInBook(req, res) {
  // goal: processes a book that a student brings back to the front desk
  // table: LOANS (ID, User_ID, Book_ID, Borrow_Date, Due_Date, Returned_Date, Fine_amount)
  // updates books open loan row with current date for return and calculates fines if late

  // Extract string
  const patronId = parsePositiveInteger(req.body && req.body.Patron_ID);
  const patronEmail = normalizeInput(req.body && req.body.Patron_Email);
  const patronName = normalizeInput(req.body && req.body.Patron_Name);
  const bookId = parsePositiveInteger(req.body && req.body.Book_ID);

  if (!bookId || (patronId === null && !patronEmail && !patronName)) {
    return res.status(400).json({
      success: false,
      error: "Patron ID, email, or name and a valid book ID are required",
    });
  }

  try {
    await runTransaction(async (connection) => {
      const patronLookup = await resolvePatron(
        connection,
        {
          Patron_ID: patronId,
          Patron_Email: patronEmail,
          Patron_Name: patronName,
        },
        "Patron not found",
      );

      if (patronLookup.error) {
        const error = new Error(patronLookup.error.message);
        error.status = patronLookup.error.status;
        throw error;
      }

      const user = patronLookup.user;

      if (user.Role !== "Patron") {
        const error = new Error("Only patrons can be checked in");
        error.status = 403;
        throw error;
      }

      const [openLoanRows] = await connection.query(
        "SELECT ID FROM LOANS WHERE Book_ID = ? AND User_ID = ? AND Returned_Date IS NULL",
        [bookId, user.ID],
      );

      if (openLoanRows.length === 0) {
        const error = new Error(
          "No active loan was found for that patron and book",
        );
        error.status = 404;
        throw error;
      }

      const loanId = openLoanRows[0].ID;

      const [loanUpdateResult] = await connection.query(
        `UPDATE LOANS
         SET Returned_Date = CURRENT_DATE,
             Fine_amount = CASE
               WHEN Due_Date < CURRENT_DATE
                 THEN GREATEST(DATEDIFF(CURRENT_DATE, Due_Date), 0) * 0.5
               ELSE Fine_amount
             END
         WHERE ID = ? AND Returned_Date IS NULL`,
        [loanId],
      );

      if (loanUpdateResult.affectedRows === 0) {
        const error = new Error(
          "No active loan was found for that patron and book",
        );
        error.status = 404;
        throw error;
      }

      await connection.query(
        "UPDATE BOOKS SET Available_Quantity = Available_Quantity + 1 WHERE ID = ?",
        [bookId],
      );
    });

    res.json({ success: true, message: "Book checked in successfully." });
  } catch (error) {
    if (error && error.status) {
      return res
        .status(error.status)
        .json({ success: false, error: error.message });
    }

    console.error("Check In error: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getOverdueBooksList(req, res) {
  // goal: shows list of all books that are past due date and havent been returned yet
  // table: LOANS, USERS, BOOKS
  // filters database for loans where return date is blank and due date is older than current day
  try {
    // find overdue books
    const [overdueRows] = await db.dbPromise.query(
      "SELECT USERS.Name, BOOKS.Title, LOANS.Due_Date, LOANS.ID AS Loan_ID FROM LOANS INNER JOIN USERS ON LOANS.User_ID = USERS.ID INNER JOIN BOOKS ON LOANS.Book_ID = BOOKS.ID WHERE Returned_Date IS NULL AND Due_Date < CURRENT_DATE",
    );

    // if no overdue books
    if (overdueRows.length == 0) {
      return res.json({ success: true, message: "No overdue books." });
    }

    // if there are overdue books
    const DAILY_LATE_FEE = 0.5; // I don't know what price we actually want to do
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const row of overdueRows) {
      const dueDate = new Date(row.Due_Date);

      dueDate.setHours(0, 0, 0, 0);

      const timeDifference = today - dueDate;

      const daysOverdue = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

      let fineAmount = 0;
      if (daysOverdue > 0) {
        fineAmount = daysOverdue * DAILY_LATE_FEE;
      }

      row.daysOverdue = daysOverdue;
      row.calculatedFine = fineAmount;
      await db.dbPromise.query(
        "UPDATE LOANS SET Fine_amount = ? WHERE ID = ?",
        [fineAmount, row.Loan_ID],
      );
    }

    res.json({ success: true, overdueRows: overdueRows });
  } catch (error) {
    console.error("Overdue Books List: ", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = router;
