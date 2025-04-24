// App data with icons, descriptions, and history
const apps = [
    {
        name: 'Chrome',
        icon: 'https://www.google.com/chrome/static/images/chrome-logo.svg',
        description: 'Fast, secure web browser by Google',
        history: ['Gmail', 'Google Drive', 'YouTube'],
        command: 'start chrome'
    },
    {
        name: 'Brave',
        icon: 'https://brave.com/static-assets/images/brave-logo.svg',
        description: 'Browse fast and privately',
        history: ['Brave Search', 'Brave Wallet', 'Brave News'],
        command: 'start brave'
    },
    {
        name: 'VS Code',
        icon: 'https://code.visualstudio.com/assets/images/code-stable.png',
        description: 'Powerful code editor',
        history: ['project1.js', 'styles.css', 'index.html'],
        command: 'start code'
    },
    {
        name: 'Outlook',
        icon: 'https://www.microsoft.com/en-us/microsoft-365/blog/wp-content/uploads/2020/08/Outlook-logo.png',
        description: 'Email and calendar management',
        history: ['Meeting with Team', 'Project Update', 'Weekly Report'],
        command: 'start outlook'
    },
    {
        name: 'WhatsApp',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png',
        description: 'Messaging and video calls',
        history: ['Family Group', 'Work Chat', 'Mom'],
        command: 'start whatsapp'
    },
    {
        name: 'Explorer',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Windows_Explorer_Logo_%282012-2019%29.svg/512px-Windows_Explorer_Logo_%282012-2019%29.svg.png',
        description: 'File and folder management',
        history: ['Documents', 'Downloads', 'Pictures'],
        command: 'start explorer'
    }
];

// Initialize the carousel
let currentRotation = 0;
const carousel = document.querySelector('.carousel');
const totalApps = apps.length;
const angleStep = 360 / totalApps;

// Create app cards
function createAppCards() {
    apps.forEach((app, index) => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.style.transform = `rotateY(${index * angleStep}deg) translateZ(var(--carousel-radius))`;

        card.innerHTML = `
            <img src="${app.icon}" alt="${app.name}" class="app-icon">
            <h2 class="app-title">${app.name}</h2>
            <p class="app-description">${app.description}</p>
            <div class="history-section">
                <h3 class="history-title">Recent Activity</h3>
                ${app.history.map(item => `<div class="history-item">${item}</div>`).join('')}
            </div>
        `;

        card.addEventListener('click', () => launchApp(app.command));
        carousel.appendChild(card);
    });
}

// Launch app function
function launchApp(command) {
    try {
        const shell = new ActiveXObject('WScript.Shell');
        shell.Run(command, 1, false);
    } catch (e) {
        console.error('Failed to launch app:', e);
    }
}

// Rotate carousel
function rotateCarousel(direction) {
    currentRotation += direction * angleStep;
    carousel.style.transform = `rotateY(${currentRotation}deg)`;
}

// Event listeners
document.querySelector('.prev-btn').addEventListener('click', () => rotateCarousel(1));
document.querySelector('.next-btn').addEventListener('click', () => rotateCarousel(-1));

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') rotateCarousel(1);
    if (e.key === 'ArrowRight') rotateCarousel(-1);
});

// Mouse wheel navigation
document.addEventListener('wheel', (e) => {
    e.preventDefault();
    rotateCarousel(e.deltaY > 0 ? 1 : -1);
}, { passive: false });

// Initialize
createAppCards(); 