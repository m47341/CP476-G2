/******************************************************************************
 * Name: Nicholas Perez
 * Course: CP476B - Internet Computing
 * Milestone: Milestone 02 - Front-End Implementation
 * File: script.js
 * Date: June 20, 2026
 *
 * Description:
 * JavaScript functionality for the Library Management System front-end.
 * This file controls:
 * - Page navigation
 * - Admin sign-in workflow
 * - Book search using mock data
 * - Add book form handling
 * - Success confirmation modal
 ******************************************************************************/

// Main screen elements
const landingPage = document.getElementById('landingPage');
const adminLoginPage = document.getElementById('adminLoginPage');
const adminAppPage = document.getElementById('adminAppPage');

// Admin content views
const catalogView = document.getElementById('catalogView');
const addBookView = document.getElementById('addBookView');

// Navigation buttons
const catalogNavBtn = document.getElementById('catalogNavBtn');
const addBookNavBtn = document.getElementById('addBookNavBtn');

// Output and modal elements
const bookResults = document.getElementById('bookResults');
const successModal = document.getElementById('successModal');

// Mock book data used before database integration
let books = [
    {
        code: 'B001',
        title: 'Dune',
        author: 'Frank Herbert',
        status: 'Available'
    },
    {
        code: 'B002',
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        status: 'Available'
    },
    {
        code: 'B003',
        title: '1984',
        author: 'George Orwell',
        status: 'On Loan'
    }
];

// Shows the selected main screen and hides the others
function showScreen(screen) {
    landingPage.classList.remove('active-screen');
    adminLoginPage.classList.remove('active-screen');
    adminAppPage.classList.remove('active-screen');

    screen.classList.add('active-screen');
}

// Shows the selected admin view and updates the active navigation button
function showView(view) {
    catalogView.classList.remove('active-view');
    addBookView.classList.remove('active-view');
    catalogNavBtn.classList.remove('active-nav');
    addBookNavBtn.classList.remove('active-nav');

    view.classList.add('active-view');

    if (view === catalogView) {
        catalogNavBtn.classList.add('active-nav');
    } else {
        addBookNavBtn.classList.add('active-nav');
    }
}

// Displays the given list of books in the catalog area
function renderBooks(bookList) {
    bookResults.innerHTML = '';

    // Show message if no books match the search
    if (bookList.length === 0) {
        bookResults.innerHTML = '<p>No books found.</p>';
        return;
    }

    // Create one card for each book
    bookList.forEach(function(book) {
        const card = document.createElement('article');
        card.className = 'book-card';

        card.innerHTML = `
            <div>
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Book Code:</strong> ${book.code}</p>
                <p><strong>Status:</strong> ${book.status}</p>
            </div>
            <div class="cover-placeholder" aria-label="Book cover placeholder"></div>
        `;

        bookResults.appendChild(card);
    });
}

// Opens the save confirmation modal
function openSuccessModal() {
    successModal.classList.remove('hidden');
}

// Closes the save confirmation modal
function closeSuccessModal() {
    successModal.classList.add('hidden');
}

// Navigate from landing page to admin login page
document.getElementById('showAdminLoginBtn').addEventListener('click', function() {
    showScreen(adminLoginPage);
});

// Navigate from admin login page back to landing page
document.getElementById('backToLandingBtn').addEventListener('click', function() {
    showScreen(landingPage);
});

// Handle admin login form submission
document.getElementById('adminLoginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    showScreen(adminAppPage);
    showView(catalogView);
    renderBooks(books);
});

// Navigate to catalog view
catalogNavBtn.addEventListener('click', function() {
    showView(catalogView);
    renderBooks(books);
});

// Navigate to add book view
addBookNavBtn.addEventListener('click', function() {
    showView(addBookView);
});

// Open add book view from catalog page button
document.getElementById('openAddBookBtn').addEventListener('click', function() {
    showView(addBookView);
});

// Return from add book view to catalog view
document.getElementById('returnToCatalogBtn').addEventListener('click', function() {
    showView(catalogView);
    renderBooks(books);
});

// Handle catalog search form submission
document.getElementById('bookSearchForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get search input values
    const titleSearch = document.getElementById('searchTitle').value.toLowerCase().trim();
    const authorSearch = document.getElementById('searchAuthor').value.toLowerCase().trim();

    // Filter books by title and author
    const filteredBooks = books.filter(function(book) {
        const titleMatches = book.title.toLowerCase().includes(titleSearch);
        const authorMatches = book.author.toLowerCase().includes(authorSearch);

        return titleMatches && authorMatches;
    });

    renderBooks(filteredBooks);
});

// Clear search inputs and show all books again
document.getElementById('clearSearchBtn').addEventListener('click', function() {
    document.getElementById('searchTitle').value = '';
    document.getElementById('searchAuthor').value = '';

    renderBooks(books);
});

// Handle add book form submission
document.getElementById('addBookForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Create a new book object from form input
    const newBook = {
        code: document.getElementById('bookCode').value.trim(),
        title: document.getElementById('newTitle').value.trim(),
        author: document.getElementById('newAuthor').value.trim(),
        status: 'Available'
    };

    // Add new book to mock data list
    books.push(newBook);

    // Reset form and display success message
    document.getElementById('addBookForm').reset();
    openSuccessModal();
});

// Close modal and return to catalog view
document.getElementById('closeModalBtn').addEventListener('click', function() {
    closeSuccessModal();
    showView(catalogView);
    renderBooks(books);
});

// Load initial mock book list
renderBooks(books);