# backend info

mostly making this as a rough start, if you think the way i did it was mid/needs changes/wasnt informed, just change it
(also will move this into `docs/M2/` before submission)

## js files

- `server.js`: to run the server
- `database.js`: for database connections
- `authRoutes.js`: for login and signing in
- `patronRoutes.js`: for everything regular users/students do
- `adminRoutes.js`: for everything librarians/admins do

## Goals, How, Affected files

### Patron sign in

- **Goal**: Lets regular patron log into their account
- **How**: Checks username and password typed against USER table in the database. If matches, get access to patron features.
- **Affected file**: `authRoutes.js` > `patronSignIn()`
- _Note_: modified USERS table to add password field in database, deviation from milestone 1

### Admin Sign in

- **Goal**: Lets librarians/admins log into backend management side
- **How**: Checks their admin credentials against database. If correct, unlocks librarian dashboard so they can manage books and members.
- **Affected file**: `authRoutes.js` > `adminSignIn()`

### Landing page

- **Goal**: Main welcome screen anyone sees before logging in
- **How**: Shows simple welcome page with buttons pointing to either patron login or admin login.
- **Affected file**: `patronRoutes.js` > `getLandingPage()`

### Patron main page

- **Goal**: The screen a patron sees right after logging in
- **How**: Loads and shows specific account info, books they currently have borrowed, any late fees they owe, a search bar, etc (check frontend docs for more details).
- **Affected file**: `patronRoutes.js` > `getPatronMainPage()`

### Admin main page

- **Goal**: Master screen for librarians
- **How**: Displays quick links to administrative actions like adding books, checking items out, managing library members, etc.
- **Affected file**: `adminRoutes.js` > `getAdminMainPage()`

### Check in (admin)

- **Goal**: Processes a book that a student brings back to the front desk
- **How**: Finds the active loan record for that checked out book, writes the current date as the returned date, and adds any fine amounts if they brought it back late.
- **Affected file**: `adminRoutes.js` > `checkInBook()`

### Check out (admin)

- **Goal**: Lets an admin lend a book to a student standing at the desk
- **How**: Creates a brand new row in LOANS table in database with students ID, books ID, todays date, and sets a due date 14 days from checkout.
- **Affected file**: `adminRoutes.js` > `checkOutBook()`

### New patron (admin)

- **Goal**: Lets an admin register a brand new student into the system
- **How**: Takes patrons name, email, and password from an admin form and saves it as new row inside the USERS table.
- **Affected file**: `adminRoutes.js` > `createNewPatron()`

### Update patron (admin)

- **Goal**: Change an existing library members details
- **How**: Looks up student by their ID and overwrites old info (like an updated email address, fixing a name typo, etc) in the database.
- **Affected file**: `adminRoutes.js` > `updatePatronInfo()`

### Book search (admin)

- **Goal**: Lets admin search through entire library collection
- **How**: Looks through books table to find matches based on titles, authors, or genres so admins can edit or track down inventory.
- **Affected file**: `adminRoutes.js` > `searchBooksAdmin()`

### Book search (patron)

- **Goal**: Lets regular students search library catalog
- **How**: Searches books database table and displays whether a book is on the shelf or currently out on loan.
- **Affected file**: `patronRoutes.js` > `searchBooksPatron()`

### Add book (admin)

- **Goal**: Lets admin add new book to lib inventory
- **How**: Takes info like title, author, and how many copies bought, then inserts it directly into books table.
- **Affected file**: `adminRoutes.js` > `addNewBook()`

### Overdue book list (admin)

- **Goal**: Shows list of all books that are past due date and havent been returned yet
- **How**: Scans LOANS table for rows where return date is empty and due date is older than todays date, then calculates ongoing daily late fines.
- **Affected file**: `adminRoutes.js` > `getOverdueBooksList()`

### Put book on hold (patron)

- **Goal**: Lets student reserve a book that is currently checked out by someone else
- **How**: Saves their request into HOLDS table with a timestamp, ensuring that whoever waits the longest gets the book first when it comes back.
- **Affected file**: `adminRoutes.js` > `putBookOnHold()`
