// Authentication state management
let currentUser = null;

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/html/login.html';
        return false;
    }
    return true;
}

// Handle login
async function handleLogin(email, password) {
    try {
        // TODO: Replace with actual API call
        const response = await mockLoginAPI(email, password);
        if (response.success) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            window.location.href = '/html/dashboard.html';
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        showError(error.message);
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/html/login.html';
}

// Handle password reset request
async function handlePasswordResetRequest(email) {
    try {
        // TODO: Replace with actual API call
        const response = await mockPasswordResetRequestAPI(email);
        if (response.success) {
            showSuccess('If an account exists with this email, you will receive a password reset link shortly.');
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        showError(error.message);
    }
}

// Handle password reset
async function handlePasswordReset(token, newPassword) {
    try {
        // TODO: Replace with actual API call
        const response = await mockPasswordResetAPI(token, newPassword);
        if (response.success) {
            showSuccess('Your password has been successfully reset.');
            setTimeout(() => {
                window.location.href = '/html/login.html';
            }, 2000);
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        showError(error.message);
    }
}

// Utility functions
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.textContent = message;
    document.querySelector('.auth-form').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.textContent = message;
    document.querySelector('.auth-form').prepend(successDiv);
    setTimeout(() => successDiv.remove(), 5000);
}

// Mock API functions (replace with actual API calls)
async function mockLoginAPI(email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (email === 'test@example.com' && password === 'password123') {
                resolve({
                    success: true,
                    token: 'mock-jwt-token',
                    user: {
                        id: 1,
                        email: email,
                        name: 'Test User'
                    }
                });
            } else {
                resolve({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
        }, 1000);
    });
}

async function mockPasswordResetRequestAPI(email) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Password reset email sent'
            });
        }, 1000);
    });
}

async function mockPasswordResetAPI(token, newPassword) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Password reset successful'
            });
        }, 1000);
    });
}

// Export functions for use in other files
window.auth = {
    checkAuth,
    handleLogin,
    handleLogout,
    handlePasswordResetRequest,
    handlePasswordReset
}; 