-- clean reset (for testing)
DROP DATABASE IF EXISTS library_db;
CREATE DATABASE library_db;
USE library_db;


-- create tables
CREATE TABLE USERS (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('Patron', 'Admin') NOT NULL,
    UNIQUE (Email)
);

CREATE TABLE AUTHORS (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL
);

CREATE TABLE BOOKS (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Author_ID INT NOT NULL,
    ISBN VARCHAR(13) NOT NULL,
    Total_Quantity INT NOT NULL DEFAULT 1,
    Available_Quantity INT NOT NULL DEFAULT 1,
    UNIQUE (ISBN),
    CONSTRAINT fk_books_author FOREIGN KEY (Author_ID) REFERENCES AUTHORS(ID)
);

CREATE TABLE LOANS (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    User_ID INT NOT NULL,
    Book_ID INT NOT NULL,
    Borrow_Date DATE NOT NULL,
    Due_Date DATE NOT NULL,
    Returned_Date DATE DEFAULT NULL,
    Fine_amount DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_loans_user FOREIGN KEY (User_ID) REFERENCES USERS(ID) ON DELETE RESTRICT,
    CONSTRAINT fk_loans_book FOREIGN KEY (Book_ID) REFERENCES BOOKS(ID) ON DELETE RESTRICT
);

CREATE TABLE HOLDS (
    User_ID INT NOT NULL,
    Book_ID INT NOT NULL,
    Date_Start DATETIME NOT NULL,
    PRIMARY KEY (User_ID, Book_ID),
    CONSTRAINT fk_holds_user FOREIGN KEY (User_ID) REFERENCES USERS(ID) ON DELETE CASCADE,
    CONSTRAINT fk_holds_book FOREIGN KEY (Book_ID) REFERENCES BOOKS(ID) ON DELETE CASCADE
);


-- mock data (for testing) 
INSERT INTO USERS (Name, Email, Password, Role) VALUES 
('Jonathan Medly', 'john@mail.com', 'admin123', 'Admin'),
('Alice Boss', 'alice@mail.com', 'admin456', 'Admin'),
('Jebediah Smith', 'jeb@email.com', 'pass123', 'Patron'),
('Sarah Reader', 'sarah@email.com', 'pass456', 'Patron');

INSERT INTO AUTHORS (Name) VALUES 
('J. K. Rowling'),
('Harper Lee'),
('F. Scott Fitzgerald'),
('J. R. R. Tolkien'),
('George Orwell');

INSERT INTO BOOKS (Title, Author_ID, ISBN, Total_Quantity, Available_Quantity) VALUES 
('Harry Potter and the Sorcerer''s Stone', 1, '9780590353427', 3, 2),
('To Kill a Mockingbird', 2, '9780060935467', 1, 0),
('The Great Gatsby', 3, '9780743273565', 2, 2),
('The Hobbit', 4, '9780547928227', 4, 4),
('1984', 5, '9780451524935', 2, 2);

-- mock loan, Jebediah has 'To Kill a Mockingbird' checked out
INSERT INTO LOANS (User_ID, Book_ID, Borrow_Date, Due_Date, Returned_Date, Fine_amount)
VALUES (3, 2, '2026-06-01', '2026-06-15', NULL, 0.00);

