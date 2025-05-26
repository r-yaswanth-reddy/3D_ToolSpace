document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!auth.checkAuth()) {
        return;
    }

    // Load user data
    loadUserData();
    
    // Set up event listeners
    setupEventListeners();
});

function loadUserData() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('fullName').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        
        if (user.avatar) {
            document.getElementById('avatarPreview').src = user.avatar;
        }
    }
}

function setupEventListeners() {
    const profileForm = document.getElementById('profileForm');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const avatarInput = document.getElementById('avatarInput');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmSaveBtn = document.getElementById('confirmSave');
    const cancelSaveBtn = document.getElementById('cancelSave');

    // Avatar change
    changeAvatarBtn.addEventListener('click', () => {
        avatarInput.click();
    });

    avatarInput.addEventListener('change', handleAvatarChange);

    // Form submission
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showConfirmationModal();
    });

    // Cancel button
    cancelBtn.addEventListener('click', () => {
        if (hasUnsavedChanges()) {
            if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                window.location.href = 'dashboard.html';
            }
        } else {
            window.location.href = 'dashboard.html';
        }
    });

    // Confirmation modal
    confirmSaveBtn.addEventListener('click', async () => {
        try {
            await saveProfileChanges();
            hideConfirmationModal();
            showSuccess('Profile updated successfully');
        } catch (error) {
            console.error('Failed to save profile:', error);
            showError('Failed to save profile changes. Please try again.');
        }
    });

    cancelSaveBtn.addEventListener('click', hideConfirmationModal);

    // Password validation
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    newPasswordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);
}

async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('Image size should be less than 5MB');
        return;
    }

    try {
        // Show loading state
        const avatarPreview = document.getElementById('avatarPreview');
        avatarPreview.style.opacity = '0.5';

        // TODO: Replace with actual API call
        const imageUrl = await mockUploadAvatar(file);
        
        // Update preview
        avatarPreview.src = imageUrl;
        avatarPreview.style.opacity = '1';
    } catch (error) {
        console.error('Failed to upload avatar:', error);
        showError('Failed to upload avatar. Please try again.');
    }
}

function validatePassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!newPassword) {
        return true;
    }

    const requirements = {
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    };

    // Update requirement indicators
    Object.entries(requirements).forEach(([req, valid]) => {
        const element = document.getElementById(req);
        if (element) {
            element.classList.toggle('valid', valid);
        }
    });

    return Object.values(requirements).every(Boolean);
}

function validatePasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!newPassword || !confirmPassword) {
        return true;
    }

    const isValid = newPassword === confirmPassword;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (!isValid) {
        confirmInput.setCustomValidity('Passwords do not match');
    } else {
        confirmInput.setCustomValidity('');
    }

    return isValid;
}

function hasUnsavedChanges() {
    const user = JSON.parse(localStorage.getItem('user'));
    const currentData = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        newPassword: document.getElementById('newPassword').value
    };

    return currentData.name !== user.name ||
           currentData.email !== user.email ||
           currentData.newPassword !== '';
}

function showConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    modal.classList.add('active');
}

function hideConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    modal.classList.remove('active');
}

async function saveProfileChanges() {
    const formData = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: document.getElementById('newPassword').value
    };

    // Validate password if changing
    if (formData.newPassword) {
        if (!validatePassword()) {
            throw new Error('Password does not meet requirements');
        }
        if (!validatePasswordMatch()) {
            throw new Error('Passwords do not match');
        }
    }

    // TODO: Replace with actual API call
    await mockUpdateProfile(formData);

    // Update local storage
    const user = JSON.parse(localStorage.getItem('user'));
    user.name = formData.name;
    user.email = formData.email;
    localStorage.setItem('user', JSON.stringify(user));

    // Clear password fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.textContent = message;
    document.querySelector('.profile-form').prepend(successDiv);
    setTimeout(() => successDiv.remove(), 5000);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.textContent = message;
    document.querySelector('.profile-form').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Mock API calls (replace with actual API calls)
async function mockUploadAvatar(file) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(URL.createObjectURL(file));
        }, 1000);
    });
}

async function mockUpdateProfile(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 1000);
    });
}

// Add styles
const style = document.createElement('style');
style.textContent = `
    .avatar-preview {
        transition: opacity 0.3s ease;
    }
    
    .password-requirements li {
        transition: color 0.3s ease;
    }
    
    .password-requirements li.valid {
        color: #28a745;
    }
    
    .modal {
        transition: opacity 0.3s ease;
    }
    
    .modal.active {
        display: flex;
        opacity: 1;
    }
    
    .alert {
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from { transform: translateY(-10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    .btn-primary, .btn-secondary {
        transition: all 0.3s ease;
    }
    
    .btn-primary:hover, .btn-secondary:hover {
        transform: translateY(-1px);
    }
`;
document.head.appendChild(style); 