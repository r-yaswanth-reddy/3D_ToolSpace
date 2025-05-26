document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const statusMessage = document.getElementById('statusMessage');

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        
        // Show loading state
        const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        try {
            await auth.handlePasswordResetRequest(email);
            
            // Hide form and show success message
            forgotPasswordForm.style.display = 'none';
            statusMessage.style.display = 'block';
        } catch (error) {
            console.error('Password reset request failed:', error);
        } finally {
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
}); 