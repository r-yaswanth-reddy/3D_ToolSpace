document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!auth.checkAuth()) {
        return;
    }

    // Load user data
    loadUserData();
    
    // Load recent activity
    loadRecentActivity();
    
    // Set up event listeners
    setupEventListeners();
    setupBackToTop();
});

function loadUserData() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userName').textContent = user.name;
    }
}

async function loadRecentActivity() {
    try {
        // TODO: Replace with actual API call
        const data = await mockFetchRecentActivity();
        
        // Update last login
        const lastLogin = document.getElementById('lastLogin');
        lastLogin.textContent = formatDate(data.lastLogin);
        
        // Update tools used
        const toolsUsed = document.getElementById('toolsUsed');
        toolsUsed.textContent = data.toolsUsed.join(', ');
    } catch (error) {
        console.error('Failed to load recent activity:', error);
    }
}

function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        auth.handleLogout();
    });

    // Tool cards hover effects
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        });
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        if (hours === 0) {
            const minutes = Math.floor(diff / (60 * 1000));
            return `${minutes} minutes ago`;
        }
        return `${hours} hours ago`;
    }
    
    // Less than 7 days
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days} days ago`;
    }
    
    // Otherwise, show full date
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Mock API call (replace with actual API call)
async function mockFetchRecentActivity() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                toolsUsed: ['3D Modeling', 'Rendering', 'Animation']
            });
        }, 500);
    });
}

// Add styles
const style = document.createElement('style');
style.textContent = `
    .tool-card {
        transition: all 0.3s ease;
    }
    
    .activity-card {
        transition: all 0.3s ease;
    }
    
    .activity-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .btn-secondary {
        transition: all 0.3s ease;
    }
    
    .btn-secondary:hover {
        background-color: #e9ecef;
        transform: translateY(-1px);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .activity-card, .tool-card {
        animation: fadeIn 0.5s ease-out;
    }
    
    .activity-card:nth-child(2) {
        animation-delay: 0.1s;
    }
    
    .tool-card:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .tool-card:nth-child(3) {
        animation-delay: 0.3s;
    }
    
    .tool-card:nth-child(4) {
        animation-delay: 0.4s;
    }
`;
document.head.appendChild(style);

function setupBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // Smooth scroll to top when clicked
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
} 