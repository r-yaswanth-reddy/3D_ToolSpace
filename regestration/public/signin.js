document.addEventListener('DOMContentLoaded', function() {
    const signinForm = document.getElementById('signinForm');
    const messageDiv = document.getElementById('message');

    signinForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        messageDiv.textContent = '';

        const formData = new FormData(signinForm);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        // console.log(username, email, password);
        if (!username || !email || !password) {
            messageDiv.textContent = 'Please fill in all fields.';
            return;
        }

        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });
            const result = await response.json();
            console.log(result);
            if (result.success) {
                  // After successful login
                window.location.href = 'notes.html'; // Or your carousel page
                
            } else {
                messageDiv.textContent = result.message || 'Signin failed.';
                if (result.verified === false || result.verified === undefined) {
                    alert('Your email is not verified. Please verify your email.');
                    window.location.href = 'sendVerificationCode.html';
                }
            }
        } catch (error) {
            messageDiv.textContent = 'An error occurred. Please try again.';
        }
    });
}); 