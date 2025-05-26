document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const formGroups = feedbackForm.querySelectorAll('.form-group');

    // Form validation
    function validateForm() {
        let isValid = true;
        
        formGroups.forEach(group => {
            const input = group.querySelector('input, select, textarea');
            const value = input.value.trim();
            
            if (input.required && !value) {
                showError(group, 'This field is required');
                isValid = false;
            } else if (input.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    showError(group, 'Please enter a valid email address');
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }

    // Show error message
    function showError(group, message) {
        // Remove existing error message
        const existingError = group.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        group.appendChild(errorDiv);
        
        // Add error class to input
        const input = group.querySelector('input, select, textarea');
        input.classList.add('error');
    }

    // Clear error message
    function clearError(group) {
        const errorMessage = group.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
        
        const input = group.querySelector('input, select, textarea');
        input.classList.remove('error');
    }

    // Add input event listeners for real-time validation
    formGroups.forEach(group => {
        const input = group.querySelector('input, select, textarea');
        
        input.addEventListener('input', () => {
            clearError(group);
        });
        
        input.addEventListener('blur', () => {
            const value = input.value.trim();
            
            if (input.required && !value) {
                showError(group, 'This field is required');
            } else if (input.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    showError(group, 'Please enter a valid email address');
                }
            }
        });
    });

    // Handle form submission
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            issueType: document.getElementById('issueType').value,
            message: document.getElementById('message').value.trim()
        };
        
        // Show loading state
        const submitButton = feedbackForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        try {
            // TODO: Replace with actual API call
            await mockSubmitFeedback(formData);
            
            // Show success message
            showSuccessMessage();
            
            // Reset form
            feedbackForm.reset();
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            showError(document.querySelector('.form-actions'), 'Failed to send message. Please try again.');
        } finally {
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });

    // Show success message
    function showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div class="success-icon">✓</div>
            <p>Thank you for your feedback! We'll get back to you soon.</p>
        `;
        
        feedbackForm.prepend(successDiv);
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    // Mock API call (replace with actual API call)
    async function mockSubmitFeedback(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 1500);
        });
    }

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        
        .error {
            border-color: #dc3545 !important;
        }
        
        .success-message {
            background-color: #d4edda;
            color: #155724;
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            text-align: center;
        }
        
        .success-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .form-group {
            position: relative;
        }
        
        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
            padding-right: 2rem;
        }
        
        .form-group input.error::after,
        .form-group select.error::after,
        .form-group textarea.error::after {
            content: '!';
            position: absolute;
            right: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            color: #dc3545;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}); 