// everything regular students/patrons can see and do

function getLandingPage() {
  // goal: main welcome screen anyone sees before logging in
  // sends back main splash screen view where user picks admin or patron login
}

function getPatronMainPage() {
  // goal: the screen a patron sees right after logging in
  // table: USERS, LOANS
  // looks up logged in students ID to find active loans and any late fees owed
}

function searchBooksPatron() {
  // goal: lets regular students search library catalog
  // takes search keywords from patron search bar and runs query to find matching titles
}

function putBookOnHold() {
  // goal: lets student reserve a book that is currently checked out by someone else
  // table: HOLDS (User_ID, Book_ID, Date_Start)
  // adds a new holds row with a timestamp so the patron gets in line for the book
}
