# Library Management System

Internet Computing (CP476) - Group 2

## Overview

(improve later)

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

this is more just personal notes for me, ignore for now
on another note, will need to test in other enviornments to see if my results are reproducible, but thats a later problem

### start and verify the db daemon

```bash
sudo systemctl start mysql && sudo systemctl status mysql
```

### seed db schema and mock data

```bash
mysql -u root -p < database/init.sql
```

### boot backend server

```bash
node backend/server.js
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
