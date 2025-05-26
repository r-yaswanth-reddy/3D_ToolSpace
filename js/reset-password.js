document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const statusMessage = document.getElementById('statusMessage');
    
    // Password requirement elements
    const lengthReq = document.getElementById('length');
    const uppercaseReq = document.getElementById('uppercase');
    const lowercaseReq = document.getElementById('lowercase');
    const numberReq = document.getElementById('number');
    const specialReq = document.getElementById('special');

    // Password validation patterns
    const patterns = {
        length: /.{8,}/,
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        number: /[0-9]/,
        special: /[!@#$%^&*(),.?":{}|<>]/
    };

    // Validate password requirements
    function validatePassword(password) {
        const validations = {
            length: patterns.length.test(password),
            uppercase: patterns.uppercase.test(password),
            lowercase: patterns.lowercase.test(password),
            number: patterns.number.test(password),
            special: patterns.special.test(password)
        };

        // Update requirement indicators
        lengthReq.classList.toggle('valid', validations.length);
        uppercaseReq.classList.toggle('valid', validations.uppercase);
        lowercaseReq.classList.toggle('valid', validations.lowercase);
        numberReq.classList.toggle('valid', validations.number);
        specialReq.classList.toggle('valid', validations.special);

        return Object.values(validations).every(Boolean);
    }

    // Check if passwords match
    function passwordsMatch() {
        return newPasswordInput.value === confirmPasswordInput.value;
    }

    // Real-time password validation
    newPasswordInput.addEventListener('input', () => {
        validatePassword(newPasswordInput.value);
    });

    // Real-time password match validation
    confirmPasswordInput.addEventListener('input', () => {
        if (confirmPasswordInput.value) {
            confirmPasswordInput.setCustomValidity(
                passwordsMatch() ? '' : 'Passwords do not match'
            );
        }
    });

    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validate password
        if (!validatePassword(newPassword)) {
            showError('Please meet all password requirements');
            return;
        }

        // Check if passwords match
        if (!passwordsMatch()) {
            showError('Passwords do not match');
            return;
        }

        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            showError('Invalid or missing reset token');
            return;
        }

        // Show loading state
        const submitButton = resetPasswordForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Resetting...';
        submitButton.disabled = true;

        try {
            await auth.handlePasswordReset(token, newPassword);
            
            // Hide form and show success message
            resetPasswordForm.style.display = 'none';
            statusMessage.style.display = 'block';
        } catch (error) {
            console.error('Password reset failed:', error);
        } finally {
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.textContent = message;
        resetPasswordForm.prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}); 