// Authentication handling
document.addEventListener('DOMContentLoaded', () => {
    // User Login Form Handler
    const userLoginForm = document.getElementById('userLoginForm');
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;

            try {
                // Here you would typically make an API call to your backend
                // For now, we'll just simulate a successful login
                console.log('User login attempt:', { email, remember });
                
                // Store auth token if remember is checked
                if (remember) {
                    localStorage.setItem('userToken', 'dummy-token');
                } else {
                    sessionStorage.setItem('userToken', 'dummy-token');
                }

                // Redirect to main app
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Login failed:', error);
                alert('Login failed. Please check your credentials.');
            }
        });
    }

    // Admin Login Form Handler
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;
            const adminKey = document.getElementById('adminKey').value;
            const remember = document.getElementById('adminRemember').checked;

            try {
                // Here you would typically make an API call to your backend
                // For now, we'll just simulate a successful login
                console.log('Admin login attempt:', { email, remember });
                
                // Store auth token if remember is checked
                if (remember) {
                    localStorage.setItem('adminToken', 'dummy-admin-token');
                } else {
                    sessionStorage.setItem('adminToken', 'dummy-admin-token');
                }

                // Redirect to admin dashboard
                window.location.href = 'admin-dashboard.html';
            } catch (error) {
                console.error('Admin login failed:', error);
                alert('Admin login failed. Please check your credentials.');
            }
        });
    }

    // Check for existing session
    const checkAuth = () => {
        const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

        if (userToken) {
            window.location.href = 'index.html';
        } else if (adminToken) {
            window.location.href = 'admin-dashboard.html';
        }
    };

    // Run auth check on login pages
    if (window.location.pathname.includes('login')) {
        checkAuth();
    }
}); 