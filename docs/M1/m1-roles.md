# Roles

## Proposal (2 people) - Due May 25, 2026

**Members**:

- Max Schwarzenberg
- Sarah Jackson

**Requirements**:

- Problem statement, motivation, target users
- App concept and scope (what is in / out)
- Features list (Must Have: Essential for product viability; Should Have: Very important, adds significant value, but product can launch without it; Could Have: Nice additions, low impact if omitted.)

## User Stories and Wireframes (5 people) - Due May 29, 2026

**Members**:

- Sienna Brar
- Christian Simon
- Melanie Tran
- Carter Woods
- Nicholas Perez

## User Stories

**Requirements**:

- Each story includes: role, goal, value and clear acceptance criteria

**Rough Notes**:

- Cover user types:
  - Admins/Lirarians: eg, adding books, editing book details, updating user accounts, viewing loan reports
  - Users/Students: eg, searching for books, borrowing books, viewing current loans, returning books
- Must include:
  - Story ID
  - Story Points (Fibonacci scale)
  - Story Title
  - User Story
- Useful:
  - Priority
  - Sprint Assignment
  - Status
  - Other Notes (high level, if something was said in discussion that is useful put it here)
  - Acceptance Criteria (must be testable)
    - eg, if a librarian is on an `Add Book` page, then they fill out the fields (Title, Author, ISBN) and click `Submit`, then the book is saved and a success message appears, then can be searched in the system

## Wireframe

**Requirements**:

- Based on `User Stories` so that needs to get done first
- Wireframes for all key screens (based on user stories) in the primary workflow (eg, list/create/edit/view)
- Show navigation between screens

_Wireframe sites (potentially)_:

- Figma
- Wireframe.cc
- Excalidraw

**Rough Notes**:

- those in this group can use whichever they want, whatever works best for most people
- make sure its kept in sync

- Key Screens: design interface for both user types using the system. Mockups for:
  - Login page
  - Patron dashboard (search books, view borrowed books)
  - Librarian dashboard (view all loans, look up users)
  - Add/Edit book page

- Primary Workflow: show exact sequence of screens a user clicks through to borrow a book
  - eg, `Search` > `Click Book` > `Click Borrow` > `Confirmation Screen`

- Navigation: use arrows connecting screens to explicitly show what button leads to what page
  - eg, if clicking `Cancel` goes back to dashboard, draw an arrow showing that

## Data planning (4 people) - Due June 1, 2026

**Members**:

- Max Schwarzenberg
- Inam Ul Haque
- Anubhav Pandey
- Abdullahi Isa

**Requirements**:

- lightweight, but explicit
- Identify key data entities (eg, minimum of 4 tables you expect)
- Identify key relationships at a high level (no full ERD required yet)

**Rough Notes**:

### Tables:

USERS

- ID (PK): Integer, Auto increment unique identifier.
- Name: VARCHAR, Full name.
- Email: VARCHAR, Email address (unique).
- Role: VARCHAR/ENUM, Either Librarian or Students to enforce access control.

BOOKS

- ID (PK): Integer, Auto increment unique identifier.
- Title: VARCHAR, Title of book.
- Author_ID: Integer, FK > AUTHORS:ID.
- ISBN: VARCHAR, International book number (unique).
- Total_Quantity: Integer, Total copies owned.
- Available_Quantity: Integer, Available copies. if 0, status is unavailable. Must be <=Total_Quantity.

LOANS

- ID (PK): Integer, Auto increment unique.
- User_ID: Integer, FK > USERS:ID.
- Book_ID: Integer, FK > BOOKS:ID.
- Borrow_Date: DATE, When the book was initially borrowed.
- Due_Date: DATE, Deadline for return, +14 days after Borrow_Date.
- Returned_Date: DATE, default null. if current day > Due_Date, USERS get charged ~$0.50 per day.
- Fine_amount: DECIMAL(5,2), Default $0.00, accumulated late fees.

AUTHORS

- ID (PK): Integer, Auto increment unique identifier.
- Name: VARCHAR, Full author name (in separate table so 3NF).

### High Level Relationships:

- **USERS to LOANS (1:M)**: A single user (student) can check out multiple books at the same time, creating many loans. Each loan belongs to one user.
- **BOOKS to LOANS (1:M)**: A book in the system can be checked out many times over time, creating many loans over time. Each loan references one book.
- **AUTHORS to BOOKS (1:M)**: An author can have many books in the system. Each book has one primary author.

### Data Flow:

- Librarians have read/write permissions to create, edit or delete records in the book and loans tables.
- Students have read access to search for books and to view their individual loans.

### Fine Logic:

If a book is unreturned (LOANS:Return_date is null) after its due date (LOANS:Due_date), fine (LOANS:Fine_amount) is increased by $0.50 every day its unreturned.
