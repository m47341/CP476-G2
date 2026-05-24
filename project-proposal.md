# Library Management System
CP476 Group 2

## Problem Statement

Small libraries typically rely on outdated systems such as manual logs, spreadsheets, or outdated desktop software. These systems present operational challenges, including no real time visibility into book availability, human error in tracking due dates, and a lack of centralized oversight regarding overdue items. Without a centralized system, librarians lack clarity on reading trends, while patrons struggle to browse available inventory. The main goal of this project is to address these workflow issues by replacing outdated manual tracking with an automated, reliable full-stack web application.

## Motivation

Technically, a library tracking system serves as an ideal architectural challenge to integrate a functional front end, server side processing, and a database backend.
Operationally, the app aims to reduce admin overhead for small libraries, prevent inventory loss, and provide end users access to a clean transparent user interface to view the catalog of books available.

## Target Users

When developing a Library Management System, the target users are divided into two main categories: Library Patrons and Admins.

- Library Patrons (Users/Students): Requires an intuitive portal to search the library catalog, verify book availability, view personal borrowing history, and track upcoming return deadlines. 
- Library Admins (Librarians): Require elevated admin permissions to maintain database integrity, manage inventory (CRUD), and oversee all active loans. 

## App Concept

A web based, full stack, Library Management System built with technologies covered in the course. It features a secure database backend connected to a dynamic server layer that processes admin commands and patron transaction requests. User experience is tailored dynamically depending on the role, such as an authenticated admin or a regular user.

## Scope
*(What is in / out)*

**In Scope**
- Secure login flow separating elevated admins from regular end users. 
- Full CRUD capabilities for book records handled by admins. 
- Complete end to end process for borrowing and returning items, automatically synchronizing inventory. 
- Individual dashboards for end users showing their loans and for admins showing overviews. 

**Out of Scope**
- Tracking of overdue books will be supported, but any fees cannot be paid online.
- External APIs for external data population will be excluded (eg, google books).
- No barcode scanners or automated notifications. 

## Features List

### Must Have
*Essential for product viability*
- Login with role assignment that enforces access restriction.
- Admin CRUD for new books, viewing catalog lists, editing book details (Title, Author, ISBN, Quantity), and removing books from the library catalog.
- Public front end to search for book availability by title or author.
- Patrons can borrow books, creating a loan record in the database and decrementing the book's quantity.
- Patrons can mark their borrowed book as returned, updating the loan status and incrementing database quantity.
- Appropriate input validation with strict server side and client side validation on all forms. 

### Should Have
*Very important, adds significant value, but product can launch without it*
- Patrons have a personalized page for viewing a list of their current active loans, historical readings, and corresponding due dates.
- Books that aren't returned by their marked due date are marked ‘Overdue’, handled by the backend.
- Page for admins to view a complete list of active loans across every user (without querying raw tables).
  
### Could Have
*Nice additions, low impact if omitted*
- A Wishlist Queue so books whose quantity is 0 can be reserved, the next available book goes to the first in the queue.
