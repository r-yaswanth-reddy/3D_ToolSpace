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
        name: 'Google notes',
        icon: 'https://png.pngtree.com/png-vector/20200908/ourmid/pngtree-notes-icon-vector-png-image_2340328.jpg',
        description: 'maintain notes',
        history: ['project1.js', 'styles.css', 'index.html'],
        command: 'start code'
    },
    {
        name: 'Translator',
        icon: 'https://image.similarpng.com/file/similarpng/very-thumbnail/2020/12/Google-translate-icon-design-on-transparent-background-PNG.png',
        description: 'make translation',
        history: ['Meeting with Team', 'Project Update', 'Weekly Report'],
        command: 'start outlook'
    },
    {
        name: 'Calculator',
        icon: 'https://png.pngtree.com/png-vector/20190115/ourmid/pngtree-vector-calculator-icon-png-image_319747.jpg',
        description: 'Calculate things',
        history: ['Family Group', 'Work Chat', 'Mom'],
        command: 'start whatsapp'
    },
    {
        name: 'Calender',
        icon: 'https://i.pinimg.com/736x/5b/52/29/5b52296c015d0526f85926fa6203d0ce.jpg',
        description: 'make your monthly plan',
        history: ['project1.js', 'styles.css', 'index.html'],
        command: 'start cursor'
    }
];

let currentFrontIndex = 0;
const totalApps = apps.length;
const angleStep = 360 / totalApps;
const carousel = document.querySelector('.carousel');

function updateCardPositions() {
    const cards = document.querySelectorAll('.app-card');
    cards.forEach((card, index) => {
        const positionIndex = (index - currentFrontIndex + totalApps) % totalApps;
        const angle = positionIndex * angleStep;
        const radius = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--carousel-radius').trim());
        
        // Calculate position on the circle
        const x = Math.sin(angle * Math.PI / 180) * radius / 2;
        const z = Math.cos(angle * Math.PI / 180) * radius / 2;
        
        // Calculate rotation and scale based on position
        const rotateY = angle; // Card faces center
        const scale = z > 0 ? 1 : 0.8; // Slightly smaller when behind
        
        // Apply transforms
        card.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${rotateY}deg)`;
        card.style.opacity = z > 0 ? 1 : 0.7; // Slightly fade cards in back
        card.style.zIndex = Math.round(z + 1000);

        // Update active state
        if (index === currentFrontIndex) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

function createAppCards() {
    apps.forEach((app, index) => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.dataset.index = index;

        card.innerHTML = `
            <div class="card-content">
                <img src="${app.icon}" alt="${app.name}" class="app-icon">
                <h2 class="app-title">${app.name}</h2>
                <p class="app-description">${app.description}</p>
                <div class="history-section">
                    <h3 class="history-title">Recent Activity</h3>
                    ${app.history.map(item => `<div class="history-item">${item}</div>`).join('')}
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            const clickedIndex = parseInt(card.dataset.index);
            if (clickedIndex === currentFrontIndex) {
                launchApp(app.command);
            } else {
                rotateToCard(clickedIndex);
            }
        });

        carousel.appendChild(card);
    });
    updateCardPositions();
}

function launchApp(command) {
    try {
        const shell = new ActiveXObject('WScript.Shell');
        shell.Run(command, 1, false);
    } catch (e) {
        console.error('Failed to launch app:', e);
    }
}

function rotateToCard(targetIndex) {
    const diff = getShortestRotationPath(currentFrontIndex, targetIndex);
    currentFrontIndex = (currentFrontIndex + diff + totalApps) % totalApps;
    updateCardPositions();
}

function getShortestRotationPath(current, target) {
    let diff = target - current;
    if (diff > totalApps / 2) diff -= totalApps;
    else if (diff < -totalApps / 2) diff += totalApps;
    return diff;
}

function rotateOneStep(direction) {
    currentFrontIndex = (currentFrontIndex + direction + totalApps) % totalApps;
    updateCardPositions();
}

// Event Listeners
document.querySelector('.prev-btn').addEventListener('click', (e) => {
    e.preventDefault();
    rotateOneStep(-1);
});

document.querySelector('.next-btn').addEventListener('click', (e) => {
    e.preventDefault();
    rotateOneStep(1);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') rotateOneStep(-1);
    if (e.key === 'ArrowRight') rotateOneStep(1);
});

document.addEventListener('wheel', (e) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    rotateOneStep(direction);
}, { passive: false });

// Start
createAppCards();
