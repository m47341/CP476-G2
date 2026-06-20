// everything librarians/admins can see/do

function getAdminMainPage() {
  // goal: master screen for librarians
  // pulls up main control panel screen showing all available admin actions
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

function searchBooksAdmin() {
  // goal: lets admin search through entire library collection
  // table: BOOKS (ID, Title, Author_ID, ISBN, Total_Quantity, Available_Quantity)
  // runs catalog search but displays internal data (eg, total stock vs available stock for inventory tracking)
}

function checkOutBook() {
  // goal: lets an admin lend a book to a student standing at the desk
  // table: LOANS (ID, User_ID, Book_ID, Borrow_Date, Due_Date, Returned_Date, Fine_amount)
  // creates brand new loan entry linking student ID and book ID, setting a 14 day deadline
}

function checkInBook() {
  // goal: processes a book that a student brings back to the front desk
  // table: LOANS (ID, User_ID, Book_ID, Borrow_Date, Due_Date, Returned_Date, Fine_amount)
  // updates books open loan row with current date for return and calculates fines if late
}

function getOverdueBooksList() {
  // goal: shows list of all books that are past due date and havent been returned yet
  // table: LOANS, USERS, BOOKS
  // filters database for loans where return date is blank and due date is older than current day
}
