document.addEventListener('DOMContentLoaded', function() {
    const messageDiv = document.getElementById('message');
    // const resendLink = document.getElementById('resend-link');
    const requestCodeForm = document.getElementById('requestCodeForm');
    const emailInput = document.getElementById('email');

    // Prefill email if available in localStorage
    const storedEmail = localStorage.getItem('verifyEmail');
    if (storedEmail) {
        emailInput.value = storedEmail;
    }

    requestCodeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        messageDiv.textContent = '';

        const email = emailInput.value;

        if (!email) {
            messageDiv.textContent = 'Please enter your email.';
            return;
        }

        try {
            const response = await fetch('/api/auth/sendVerificationCode', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });
            const result = await response.json();
            if (result.success) {
                messageDiv.style.color = '#188038';
                messageDiv.textContent = 'Verification code sent! Redirecting...';
                localStorage.setItem('verifyEmail', email);
                setTimeout(() => {
                    window.location.href = 'verifyVerificationCode.html';
                }, 1500);
            } else {
                messageDiv.style.color = '#d93025';
                messageDiv.textContent = result.message || 'Failed to send code.';
            }
        } catch (error) {
            messageDiv.style.color = '#d93025';
            messageDiv.textContent = 'An error occurred. Please try again.';
        }
    });

    // resendLink.addEventListener('click', async function(e) {
    //     e.preventDefault();
    //     messageDiv.textContent = '';
    //     const email = document.getElementById('email').value;
    //     if (!email) {
    //         messageDiv.textContent = 'Please enter your email to resend the code.';
    //         return;
    //     }
    //     try {
    //         const response = await fetch('/api/auth/sendVerificationCode', {
    //             method: 'PATCH',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ email: email })
    //         });
    //         const result = await response.json();
    //         if (result.success) {
    //             messageDiv.style.color = '#188038';
    //             messageDiv.textContent = 'Verification code resent! Check your email.';
    //         } else {
    //             messageDiv.style.color = '#d93025';
    //             messageDiv.textContent = result.message || 'Failed to resend code.';
    //         }
    //     } catch (error) {
    //         messageDiv.style.color = '#d93025';
    //         messageDiv.textContent = 'An error occurred. Please try again.';
    //     }
    // });
}); 