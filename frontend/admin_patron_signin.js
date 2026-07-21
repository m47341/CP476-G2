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
 * - Check In / Check Out (wired to backend)
 * - New Patron / Update Patron (wired to backend)
 * - Success confirmation modal
 ******************************************************************************/

const API_BASE = 'http://localhost:3060';

// Main screen elements
const landingPage = document.getElementById('landingPage');
const adminLoginPage = document.getElementById('adminLoginPage');
const adminAppPage = document.getElementById('adminAppPage');

// Admin content views
const catalogView = document.getElementById('catalogView');
const checkInView = document.getElementById('checkInView');
const checkOutView = document.getElementById('checkOutView');
const addBookView = document.getElementById('addBookView');
const newPatronView = document.getElementById('newPatronView');
const updatePatronView = document.getElementById('updatePatronView');

// Navigation buttons
const catalogNavBtn = document.getElementById('catalogNavBtn');
const checkInNavBtn = document.getElementById('checkInNavBtn');
const checkOutNavBtn = document.getElementById('checkOutNavBtn');
const addBookNavBtn = document.getElementById('addBookNavBtn');
const newPatronNavBtn = document.getElementById('newPatronNavBtn');
const updatePatronNavBtn = document.getElementById('updatePatronNavBtn');

// Output and modal elements
const bookResults = document.getElementById('bookResults');
const successModal = document.getElementById('successModal');

// Maps each view to its nav button, so switching stays in one place
const viewNavMap = [
    { view: catalogView, btn: catalogNavBtn },
    { view: checkInView, btn: checkInNavBtn },
    { view: checkOutView, btn: checkOutNavBtn },
    { view: addBookView, btn: addBookNavBtn },
    { view: newPatronView, btn: newPatronNavBtn },
    { view: updatePatronView, btn: updatePatronNavBtn }
];

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
    viewNavMap.forEach(entry => {
        entry.view.classList.remove('active-view');
        if (entry.btn) entry.btn.classList.remove('active-nav');
    });

    view.classList.add('active-view');

    const match = viewNavMap.find(entry => entry.view === view);
    if (match && match.btn) {
        match.btn.classList.add('active-nav');
    }
}

// Sets feedback text/color on a given feedback element
function setFormFeedback(el, message, isOk) {
    el.textContent = message || '';
    el.className = 'form-feedback' + (isOk ? ' ok' : '');
}

// Basic email format check, shared across forms
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

// ── Sidebar navigation ──────────────────────────────────────
catalogNavBtn.addEventListener('click', function() {
    showView(catalogView);
    renderBooks(books);
});

checkInNavBtn.addEventListener('click', function() {
    showView(checkInView);
});

checkOutNavBtn.addEventListener('click', function() {
    showView(checkOutView);
});

addBookNavBtn.addEventListener('click', function() {
    showView(addBookView);
});

newPatronNavBtn.addEventListener('click', function() {
    showView(newPatronView);
});

updatePatronNavBtn.addEventListener('click', function() {
    showView(updatePatronView);
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

// ── Check In ─────────────────────────────────────────────────
const checkInForm = document.getElementById('checkInForm');
const checkInFeedback = document.getElementById('checkInFeedback');

document.getElementById('checkInClearBtn').addEventListener('click', function() {
    checkInForm.reset();
    setFormFeedback(checkInFeedback, '', false);
});

checkInForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const patron = document.getElementById('checkInPatron').value.trim();
    const bookId = document.getElementById('checkInBookId').value.trim();

    if (!patron || !bookId) {
        setFormFeedback(checkInFeedback, 'Patron name and book code are both required.', false);
        return;
    }

    const submitBtn = checkInForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    try {
        const res = await fetch(`${API_BASE}/admin/check-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Patron_Name: patron, Book_ID: bookId })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            setFormFeedback(checkInFeedback, data.message || 'Book checked in successfully.', true);
            checkInForm.reset();
        } else {
            setFormFeedback(checkInFeedback, data.error || 'Check-in failed. Please verify the patron and book code.', false);
        }
    } catch (err) {
        setFormFeedback(checkInFeedback, 'Unable to reach server. Please try again.', false);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Check In';
    }
});

// ── Check Out ────────────────────────────────────────────────
const checkOutForm = document.getElementById('checkOutForm');
const checkOutFeedback = document.getElementById('checkOutFeedback');

document.getElementById('checkOutClearBtn').addEventListener('click', function() {
    checkOutForm.reset();
    setFormFeedback(checkOutFeedback, '', false);
});

checkOutForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const patron = document.getElementById('checkOutPatron').value.trim();
    const bookId = document.getElementById('checkOutBookId').value.trim();

    if (!patron || !bookId) {
        setFormFeedback(checkOutFeedback, 'Patron name and book code are both required.', false);
        return;
    }

    const submitBtn = checkOutForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    try {
        const res = await fetch(`${API_BASE}/admin/check-out`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Patron_Name: patron, Book_ID: bookId })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            setFormFeedback(checkOutFeedback, data.message || 'Book checked out successfully.', true);
            checkOutForm.reset();
        } else {
            setFormFeedback(checkOutFeedback, data.error || 'Check-out failed. Please verify the patron and book code.', false);
        }
    } catch (err) {
        setFormFeedback(checkOutFeedback, 'Unable to reach server. Please try again.', false);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Check Out';
    }
});

// ── New Patron ───────────────────────────────────────────────
const newPatronForm = document.getElementById('newPatronForm');
const newPatronFeedback = document.getElementById('newPatronFeedback');

document.getElementById('newPatronClearBtn').addEventListener('click', function() {
    newPatronForm.reset();
    setFormFeedback(newPatronFeedback, '', false);
});

newPatronForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('newPatronName').value.trim();
    const email = document.getElementById('newPatronEmail').value.trim();
    const password = document.getElementById('newPatronPassword').value;
    const confirm = document.getElementById('newPatronPasswordConfirm').value;

    if (!name || !email || !password || !confirm) {
        setFormFeedback(newPatronFeedback, 'All fields are required.', false);
        return;
    }
    if (!isValidEmail(email)) {
        setFormFeedback(newPatronFeedback, 'Please enter a valid email address.', false);
        return;
    }
    if (password !== confirm) {
        setFormFeedback(newPatronFeedback, 'Passwords do not match.', false);
        return;
    }
    if (password.length < 6) {
        setFormFeedback(newPatronFeedback, 'Password must be at least 6 characters.', false);
        return;
    }

    const submitBtn = newPatronForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating…';

    try {
        const res = await fetch(`${API_BASE}/admin/create-new-patron`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Patron_Name: name,
                Patron_Email: email,
                Patron_Password: password
            })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            setFormFeedback(newPatronFeedback, `Patron "${name}" created successfully.`, true);
            newPatronForm.reset();
        } else {
            setFormFeedback(newPatronFeedback, data.error || 'Failed to create patron. Please try again.', false);
        }
    } catch (err) {
        setFormFeedback(newPatronFeedback, 'Unable to reach server. Please try again.', false);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Patron';
    }
});

// ── Update Patron ────────────────────────────────────────────
const updatePatronForm = document.getElementById('updatePatronForm');
const updatePatronFeedback = document.getElementById('updatePatronFeedback');

document.getElementById('updatePatronClearBtn').addEventListener('click', function() {
    updatePatronForm.reset();
    setFormFeedback(updatePatronFeedback, '', false);
});

updatePatronForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const lookup = document.getElementById('lookupPatronName').value.trim();
    const name = document.getElementById('updatePatronName').value.trim();
    const email = document.getElementById('updatePatronEmail').value.trim();
    const password = document.getElementById('updatePatronPassword').value;
    const confirm = document.getElementById('updatePatronPasswordConfirm').value;

    if (!lookup) {
        setFormFeedback(updatePatronFeedback, 'Current patron name is required to look up the record.', false);
        return;
    }
    if (!name && !email && !password) {
        setFormFeedback(updatePatronFeedback, 'Enter at least one field to update.', false);
        return;
    }
    if (email && !isValidEmail(email)) {
        setFormFeedback(updatePatronFeedback, 'Please enter a valid email address.', false);
        return;
    }
    if (password && password !== confirm) {
        setFormFeedback(updatePatronFeedback, 'Passwords do not match.', false);
        return;
    }
    if (password && password.length < 6) {
        setFormFeedback(updatePatronFeedback, 'New password must be at least 6 characters.', false);
        return;
    }

    const submitBtn = updatePatronForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    try {
        const res = await fetch(`${API_BASE}/admin/update-patron`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Patron_Name: lookup,
                New_Patron_Name: name || lookup,
                New_Patron_Email: email || undefined,
                New_Patron_Password: password || undefined
            })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            setFormFeedback(updatePatronFeedback, `Patron "${lookup}" updated successfully.`, true);
            // Clear only the update fields; keep the lookup name in case admin wants to update more
            document.getElementById('updatePatronName').value = '';
            document.getElementById('updatePatronEmail').value = '';
            document.getElementById('updatePatronPassword').value = '';
            document.getElementById('updatePatronPasswordConfirm').value = '';
        } else {
            setFormFeedback(updatePatronFeedback, data.error || 'Update failed. Please check the patron name and try again.', false);
        }
    } catch (err) {
        setFormFeedback(updatePatronFeedback, 'Unable to reach server. Please try again.', false);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
    }
});

// Load initial mock book list
renderBooks(books);
