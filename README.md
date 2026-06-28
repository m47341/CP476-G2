# Library Management System

Internet Computing (CP476) - Group 2

## Overview

A full stack library management system. For finding and getting books, handling data management, and more.

## Prerequisites

```bash
npm init -y
npm install express cors body-parser mysql2
```

- `express`: Core framework that handles network routing, allowing server to accept API requests (eg, fetching books or logging in) and send back responses.
- `cors`: Security tool that lets frontend talk to backend (even if running on different local ports).
- `body-parser`: Piece of middleware that extracts data out of HTTP request bodies and translates it into JSON objects.
- `mysql2`: Database driver that allows js code to execute SQL queries directly against MySQL server.

## Running

### Backend

(instructions are for a linux environment, can generalize to other platforms)

#### start and verify the db daemon

make sure mysql is installed

```bash
sudo systemctl start mysql && sudo systemctl status mysql
```

#### seed db schema and mock data

```bash
mysql -u root -p < database/init.sql
```

Password: `pass123`

#### start backend server

```bash
node backend/server.js
```

## Testing

### Backend

(make sure backend is running after `node backend/server.js`)

#### Authentication Route Verification (`authRoutes.js`)

```bash
curl -X POST http://localhost:3060/auth/patron-sign-in -H "Content-Type: application/json" -d '{"patron_email": "jeb@email.com", "patron_password": "pass123"}' # pass
curl -X POST http://localhost:3060/auth/admin-sign-in -H "Content-Type: application/json" -d '{"admin_email": "john@mail.com", "admin_password": "admin123"}' # pass
curl -X POST http://localhost:3060/auth/admin-sign-in -H "Content-Type: application/json" -d '{"admin_email": "john@mail.com", "admin_password": "pass123"}' # fail, wrong password
```

#### Patron Feature Verification (`patronRoutes.js`)

```bash
curl -X POST http://localhost:3060/patron/landing-page
curl -X POST http://localhost:3060/patron/patron-main-page
curl -X POST http://localhost:3060/patron/patron-book-search -H "Content-Type: application/json" -d '{"Title": "1984", "Author_Name": "George Orwell"}' # pass, shows 1984
curl -X POST http://localhost:3060/patron/put-book-on-hold -H "Content-Type: application/json" -d '{"User_ID": 2, "Book_ID": 1}' # pass
curl -X POST http://localhost:3060/patron/patron-book-search -H "Content-Type: application/json" -d '{"Title": "1985", "Author_Name": "George Orwell"}' # fail, should show nothing

```

#### Admin Inventory Management Verification (`adminRoutes.js`)

```bash
curl http://localhost:3060/admin/main-page

curl http://localhost:3060/admin/create-new-patron
curl http://localhost:3060/admin/update-patron
curl http://localhost:3060/admin/add-new-book

curl -X POST http://localhost:3060/admin/search -H "Content-Type: application/json" -d '{"Title": "Frankenstein", "Author_Name": "Mary Shelley"}'

curl -X POST http://localhost:3060/admin/check-out -H "Content-Type: application/json" -d '{"Patron_Name": "Jebediah Smith", "Book_ID": 1}'

curl -X POST http://localhost:3060/admin/check-in -H "Content-Type: application/json" -d '{"Patron_Name": "Jebediah Smith", "Book_ID": 1}'

curl http://localhost:3060/admin/overdue-book-list
```

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
