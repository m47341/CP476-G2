/******************************************************************************
 * Name: Nicholas Perez
 * Course: CP476B - Internet Computing
 * File: add-book.js
 * Date: July 21, 2026
 *
 * Description:
 * Submits new book information to the administrator add-book backend route.
 ******************************************************************************/

(function guardAdminPage() {
  if (sessionStorage.getItem('adminAuth') !== 'true') {
    window.location.replace('admin_patron_signin.html');
  }
})();

const addBookForm = document.getElementById('addBookForm');
const titleInput = document.getElementById('titleInput');
const authorInput = document.getElementById('authorInput');
const isbnInput = document.getElementById('isbnInput');
const quantityInput = document.getElementById('quantityInput');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const feedback = document.getElementById('feedback');

const adminName = sessionStorage.getItem('adminName') || 'Admin';
document.getElementById('adminLabel').textContent = adminName;

function showFeedback(message, isSuccess = false) {
  feedback.textContent = message;
  feedback.classList.remove('dim', 'ok');

  if (isSuccess) {
    feedback.classList.add('ok');
  }
}

function clearFeedback() {
  feedback.textContent = '';
  feedback.classList.remove('ok');
  feedback.classList.add('dim');
}

function setSubmitting(isSubmitting) {
  submitBtn.disabled = isSubmitting;
  submitBtn.textContent = isSubmitting ? 'Adding…' : 'Add Book';
}

function resetForm() {
  addBookForm.reset();
  quantityInput.value = '1';
  clearFeedback();
  titleInput.focus();
}

async function submitBook(event) {
  event.preventDefault();
  clearFeedback();

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const isbn = isbnInput.value.trim();
  const totalQuantity = Number.parseInt(quantityInput.value, 10);

  if (!title || !author || !isbn || !Number.isInteger(totalQuantity) || totalQuantity < 1) {
    showFeedback('Enter a title, author, valid ISBN, and quantity of at least 1.');
    return;
  }

  if (!/^\d{10}(\d{3})?$/.test(isbn)) {
    showFeedback('ISBN must contain exactly 10 or 13 digits.');
    return;
  }

  setSubmitting(true);

  try {
    const response = await fetch('http://localhost:3060/admin/add-new-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Book_Title: title,
        Author_Name: author,
        ISBN: isbn,
        Total_Quantity: totalQuantity,
        Available_Quantity: totalQuantity
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showFeedback(data.error || 'Unable to add the book.');
      return;
    }

    showFeedback(data.message || 'Book added successfully.', true);
    addBookForm.reset();
    quantityInput.value = '1';
    titleInput.focus();
  } catch (error) {
    showFeedback('Unable to reach the server. Make sure the backend is running.');
  } finally {
    setSubmitting(false);
  }
}

addBookForm.addEventListener('submit', submitBook);
clearBtn.addEventListener('click', resetForm);

document.getElementById('dashboardLink').addEventListener('click', () => {
  window.location.href = 'admin.html';
});
document.getElementById('catalogLink').addEventListener('click', () => {
  window.location.href = 'catalog.html';
});
document.getElementById('checkInLink').addEventListener('click', () => {
  window.location.href = 'check-in.html';
});
document.getElementById('checkOutLink').addEventListener('click', () => {
  window.location.href = 'check-out.html';
});
document.getElementById('newPatronLink').addEventListener('click', () => {
  window.location.href = 'new-patron.html';
});
document.getElementById('updatePatronLink').addEventListener('click', () => {
  window.location.href = 'update-patron.html';
});
document.getElementById('signOutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('adminAuth');
  sessionStorage.removeItem('adminName');
  window.location.href = 'admin_patron_signin.html';
});
