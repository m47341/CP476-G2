// handles signing in for both types of users

function patronSignIn() {
  // goal: lets regular patron log into their account
  // table: USERS (ID, Name, Email, Password, Role [Patron])
  // gets email and password from frontend form and checks if matches a record in database
}

function adminSignIn() {
  // goal: lets librarians/admins log into backend management side
  // table: USERS (ID, Name, Email, Password, Role [Admin])
  // checks login details against database and confirms if user role is actually an admin
}
