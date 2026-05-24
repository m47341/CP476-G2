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

## Data planning (4 people) -  Due June 1, 2026
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

- Tables:
  - `Users` (ID, Name, Email, Role [Librarian/Students])
  - `Books` (ID, Title, Author, ISBN, Quantity/Status)
  - `Loans` (ID, User_ID, Book_ID, Borrow_Date, Due_Date, Return_Date)
  - `Authors` (ID, Name (to keep data normalized))

- High Level Relationships: dont need complex database schemas yet, but write out how they connect
  - eg, a student can have many Loans (one to many), a book can be tied to many loans over time (one to many), an author can be      tied to many books in the system (one to many)
  - Librarians have permission to create, edit or delete records in the books and loans tables. While students have read only access to search for books and to view their loans.
