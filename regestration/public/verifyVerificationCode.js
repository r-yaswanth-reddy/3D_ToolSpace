document.addEventListener('DOMContentLoaded', function() {
    const verifyCodeForm = document.getElementById('verifyCodeForm');
    const messageDiv = document.getElementById('message');

    verifyCodeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        messageDiv.textContent = '';

        const verificationCode = document.getElementById('verificationCode').value;
        const email = localStorage.getItem('verifyEmail');

        if (!email) {
            messageDiv.textContent = 'Email not found. Please start verification again.';
            setTimeout(() => {
                window.location.href = 'sendVerificationCode.html';
            }, 1500);
            return;
        }
        if (!verificationCode) {
            messageDiv.textContent = 'Please enter the verification code.';
            return;
        }

        try {
            const response = await fetch('/api/auth/verifyVerificationCode', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, providedcode: verificationCode })
            });
            const result = await response.json();
            if (result.success) {
                alert('Email successfully verified!');
                localStorage.removeItem('verifyEmail');
                window.location.href = 'carousel.html';
            } else {
                messageDiv.style.color = '#d93025';
                messageDiv.textContent = result.message || 'Verification failed.';
            }
        } catch (error) {
            messageDiv.style.color = '#d93025';
            messageDiv.textContent = 'An error occurred. Please try again.';
        }
    });
}); 