/******************************************************************************
 * Name: Nicholas Perez
 * Course: CP476B - Internet Computing
 * File: admin_patron_signin.js
 * Date: July 21, 2026
 *
 * Description:
 * Authenticates an administrator and redirects to the existing admin dashboard.
 * Catalog and book-management logic remain in their existing project files.
 ******************************************************************************/

const loginForm = document.getElementById('adminLoginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const backBtn = document.getElementById('backBtn');
const errorMsg = document.getElementById('errorMsg');

function showError(message) {
  errorMsg.textContent = message;
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  loginBtn.textContent = isLoading ? 'Signing in…' : 'Sign In';
}

async function attemptAdminLogin(event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  showError('');

  if (!email || !password) {
    showError('Please enter your email and password.');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('http://localhost:3060/auth/admin-sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admin_email: email,
        admin_password: password
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showError(data.error || 'Login failed. Please try again.');
      return;
    }

    sessionStorage.setItem('adminAuth', 'true');
    sessionStorage.setItem(
      'adminName',
      data.message ? data.message.replace(/^Welcome\s+/, '') : 'Admin'
    );

    window.location.href = 'admin.html';
  } catch (error) {
    showError('Unable to reach the server. Make sure the backend is running.');
  } finally {
    setLoading(false);
  }
}

loginForm.addEventListener('submit', attemptAdminLogin);
backBtn.addEventListener('click', () => {
  window.location.href = 'LandingPage.html';
});
