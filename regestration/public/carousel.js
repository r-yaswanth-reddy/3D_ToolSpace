// App data with card paths
const apps = [
    {
        name: 'Chrome',
        path: 'chrome.html',
        command: 'start chrome'
    },
    {
        name: 'ChatGPT',
        path: 'chatgpt.html',
        command: 'start chatgpt'
    },
    {
        name: 'Notes',
        path: 'notes.html',
        command: 'start code'
    },
    {
        name: 'Translator',
        path: 'translator.html',
        command: 'start translator'
    },
    {
        name: 'Calculator',
        path: 'calculator.html',
        command: 'start calculator'
    },
    {
        name: 'Calendar',
        path: 'calender.html',
        command: 'start calendar'
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
        const rotateY = angle;
        const scale = z > 0 ? 1 : 0.8;
        const opacity = z > 0 ? 1 : 0.7;
        
        // Apply transforms
        card.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${rotateY}deg) scale(${scale})`;
        card.style.opacity = opacity;
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
        card.dataset.app = app.name.toLowerCase();

        // Add loading indicator
        const loading = document.createElement('div');
        loading.className = 'card-loading';
        loading.innerHTML = '<i class="fas fa-spinner"></i>';
        card.appendChild(loading);

        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = app.path;
        iframe.onload = () => {
            loading.style.display = 'none';
            // Adjust iframe content for specific apps
            if (['calculator', 'notes', 'calendar'].includes(app.name.toLowerCase())) {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const body = iframeDoc.body;
                    // Ensure content fits within iframe
                    body.style.margin = '0';
                    body.style.padding = '0';
                    body.style.width = '100%';
                    body.style.height = '100%';
                    body.style.overflow = 'hidden';
                } catch (e) {
                    console.warn('Could not adjust iframe content:', e);
                }
            }
        };
        card.appendChild(iframe);

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
// Sign out button
document.getElementById('signout').addEventListener('click', (e) => {
    e.preventDefault();
    signOut();
});
// Sign out function
function signOut() {
    // Clear session/cookies and redirect to login
    localStorage.clear();
    document.cookie = '';
    window.location.href = 'signin.html';
}

// Start
createAppCards();