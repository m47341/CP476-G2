# Library Management System

Internet Computing (CP476) - Group 2

## Overview

A full stack library management system. For finding and getting books, handling data management, and more.

## Prerequisites

```bash
npm init -y
npm install express cors body-parser mysql2 bcryptjs
```

- `express`: Core framework that handles network routing, allowing server to accept API requests (eg, fetching books or logging in) and send back responses.
- `cors`: Security tool that lets frontend talk to backend (even if running on different local ports).
- `body-parser`: Piece of middleware that extracts data out of HTTP request bodies and translates it into JSON objects.
- `mysql2`: Database driver that allows js code to execute SQL queries directly against MySQL server.
- `bcryptjs`: javascript lib used to hash passwords.

## Running

### Backend

(instructions are for a linux environment, can generalize to other platforms)

#### start and verify the db daemon

make sure mysql is installed separately

_Windows:_
(cmd as admin)

```cmd
net start MySQL80
```

_Linux:_

```bash
sudo systemctl start mysql && sudo systemctl status mysql
```

#### seed db schema and mock data

_Windows:_

```cmd
mysql -u root -p < database\init.sql
```

_Linux:_

```bash
mysql -u root -p < database/init.sql
```

Password: `pass123`

#### start backend server

_Windows:_

```cmd
node backend\server.js
```

_Linux:_

```bash
node backend/server.js
```

### Frontend

After backend is running, open `LandingPage.html` in a web browser

## Testing

### Backend

(make sure backend is running)

#### Authentication Route Verification (`authRoutes.js`)

```bash
# patron login, success (password matches hash)
curl -X POST http://localhost:3060/auth/patron-sign-in -H "Content-Type: application/json" -d '{"patron_email": "jeb@email.com", "patron_password": "pass123"}'

# admin login, success (password matches hash)
curl -X POST http://localhost:3060/auth/admin-sign-in -H "Content-Type: application/json" -d '{"admin_email": "john@mail.com", "admin_password": "admin123"}'

# admin login, failure (incorrect password)
curl -X POST http://localhost:3060/auth/admin-sign-in -H "Content-Type: application/json" -d '{"admin_email": "john@mail.com", "admin_password": "wrong"}'

# input validation, failure (incorrect email regex)
curl -X POST http://localhost:3060/auth/patron-sign-in -H "Content-Type: application/json" -d '{"patron_email": "badformat", "patron_password": "pass123"}'

# input validation, failure (missing expected values)
curl -X POST http://localhost:3060/auth/patron-sign-in -H "Content-Type: application/json" -d '{"patron_email": "", "patron_password": ""}'
```

#### Admin Creation & User Management Verification (`adminRoutes.js`)

```bash
# create new patron, success (hashes password and accepts valid email)
curl -X POST http://localhost:3060/admin/create-new-patron -H "Content-Type: application/json" -d '{"Patron_Name": "Bob Teesting", "Patron_Email": "bob@email.com", "Patron_Password": "pass312"}'

# create new patron, failure (missing input)
curl -X POST http://localhost:3060/admin/create-new-patron -H "Content-Type: application/json" -d '{"Patron_Name": "", "Patron_Email": "notadomain", "Patron_Password": ""}'

# update existing patron, success (modifies email structure safely while keeping password)
curl -X POST http://localhost:3060/admin/update-patron -H "Content-Type: application/json" -d '{"Patron_ID": "4", "New_Patron_Name": "Sarah New", "New_Patron_Email": "new_sarah@email.com"}'

# update existing patron, success (hashes and replaces password string with fresh hash)
curl -X POST http://localhost:3060/admin/update-patron -H "Content-Type: application/json" -d '{"Patron_Name": "Jebediah Smith", "New_Patron_Password": "password789"}'
```

#### Admin Operations & Inventory Management (`adminRoutes.js`)

```bash
# admin dashboard layout (w/o lookup variables)
curl -X POST http://localhost:3060/admin/main-page -H "Content-Type: application/json"

# admin dashboard layout (w admin id lookup)
curl -X POST http://localhost:3060/admin/main-page -H "Content-Type: application/json" -d '{"Admin_ID": "1"}'

# inventory management, success (adds novel row sequence)
curl -X POST http://localhost:3060/admin/add-new-book -H "Content-Type: application/json" -d '{"Book_Title": "Neuromancer", "Author_Name": "William Gibson", "ISBN": "9780441569595", "Total_Quantity": "2"}'

# inventory management, failure (duplicate ISBN)
curl -X POST http://localhost:3060/admin/add-new-book -H "Content-Type: application/json" -d '{"Book_Title": "1984", "Author_Name": "George Orwell", "ISBN": "9780451524935", "Total_Quantity": "2"}'

# catalog admin search execution
curl -X POST http://localhost:3060/admin/search -H "Content-Type: application/json" -d '{"Title": "1984", "Author_Name": "George Orwell"}'

# check out, success check out (Jebediah checks out novel entry)
curl -X POST http://localhost:3060/admin/check-out -H "Content-Type: application/json" -d '{"Patron_Name": "Jebediah Smith", "Book_ID": "5"}'

# check in, success check in (Jebediah returns the novel entry)
curl -X POST http://localhost:3060/admin/check-in -H "Content-Type: application/json" -d '{"Patron_Name": "Jebediah Smith", "Book_ID": "5"}'

# overdue book tracking list
curl -X POST http://localhost:3060/admin/overdue-book-list -H "Content-Type: application/json"
```

#### Patron Main Interactions & Portal Dashboards (`patronRoutes.js`)

```bash
# landing page retrieval validation
curl -X POST http://localhost:3060/patron/landing-page -H "Content-Type: application/json"

# patron customized master panel lookup
curl -X POST http://localhost:3060/patron/patron-main-page -H "Content-Type: application/json" -d '{"User_ID": "3"}'

# catalog interface search
curl -X POST http://localhost:3060/patron/patron-book-search -H "Content-Type: application/json" -d '{"Title": "1984", "Author_Name": "George Orwell"}'

# hold reservation, success
curl -X POST http://localhost:3060/patron/put-book-on-hold -H "Content-Type: application/json" -d '{"User_ID": "4", "Book_ID": "1"}'

# hold reservation, cancellation drop
curl -X POST http://localhost:3060/patron/cancel-hold -H "Content-Type: application/json" -d '{"User_ID": "4", "Book_ID": "1"}'
```

## Contributions (For Milestone 2)

### Max Schwarzenberg

- database: Worked on the SQL create tables and part of the ER diagram
- backend: Worked on `server.js` and `database.js`

### Inam Ul Haque

- (brief contributions)

### Sarah Jackson

- Implemented backend Node.js for admin sign in, admin main page, check in page, check out page, book search (admin), overdue book list, and put book on hold.

### Abdullahi Isa

- (brief contributions)

### Anubhav Pandey

- Handled review and validation for the database work. Reviewed the create-table SQL to confirm it matched the schema and tested that it ran correctly, then verified the ER diagram's entities, attributes, and one-to-many connections lined up with the tables before everything went into the Milestone 2 report.

### Sienna Brar

- Implemented front end html and css files for patron sign in, landing page, catalog, current loans, and admin update and add patron

### Christian Simon

- Implemented front end HTML and CSS files for Landing page

### Melanie Tran

- Implemented front end HTML, CSS, and JS files for admin main page, admin check in, and admin check out pages.

### Carter Woods

- Implemented backend Node.js for landing page, patron sign-in, patron main page, new patron, update patron, book search (patron), and add book

### Nicholas Perez

- Designed and implemented the low-fidelity Admin Sign-In frontend interface.
- Developed the low-fidelity Admin Book Search frontend, including the search layout and user interface.
- Created the low-fidelity Add Book frontend interface, including the form layout for adding new books.

## Members

- Max Schwarzenberg
- Inam Ul Haque
- Sarah Jackson
- Abdullahi Isa
- Anubhav Pandey
- Sienna Brar
- Christian Simon
- Melanie Tran
- Carter Woods
- Nicholas Perez
