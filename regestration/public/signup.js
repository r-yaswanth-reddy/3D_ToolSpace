document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const messageDiv = document.getElementById('message'); // Assuming you have a message div like in signin
    
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        messageDiv.textContent = ''; // Clear previous messages
        
        const formData = new FormData(signupForm);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        if (password !== confirmPassword) {
            messageDiv.textContent = 'Passwords do not match!';
            return;
        }
        
        const submitButton = signupForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Creating Account...';
        submitButton.disabled = true;
        
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Let's redirect to the sign-in page to login after successful signup.
                alert('Account created successfully! Please sign in.'); 
                window.location.href = 'signin.html';
            } else {
                messageDiv.textContent = result.message || 'Signup failed. Please try again.';
            }
            
        } catch (error) {
            console.error('Error:', error);
            messageDiv.textContent = 'An error occurred during signup. Please try again.';
        } finally {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
});