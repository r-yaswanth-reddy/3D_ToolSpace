document.addEventListener('DOMContentLoaded', () => {
    // Navigation highlighting
    const navLinks = document.querySelectorAll('.help-nav a');
    const sections = document.querySelectorAll('.help-section');

    // Function to update active nav link
    function updateActiveNavLink() {
        const scrollPosition = window.scrollY;

        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach(link => link.classList.remove('active'));
                navLinks[index].classList.add('active');
            }
        });
    }

    // Smooth scrolling for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });

    // Update active nav link on scroll
    window.addEventListener('scroll', updateActiveNavLink);

    // Initialize active nav link
    updateActiveNavLink();

    // FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('h3');
        const answer = item.querySelector('p');
        
        // Initially hide answers
        answer.style.display = 'none';
        
        question.addEventListener('click', () => {
            const isOpen = answer.style.display === 'block';
            
            // Close all other answers
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.querySelector('p').style.display = 'none';
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current answer
            answer.style.display = isOpen ? 'none' : 'block';
            item.classList.toggle('active');
        });
    });

    // Video tutorial hover effects
    const tutorialCards = document.querySelectorAll('.tutorial-card');
    
    tutorialCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        });
    });

    // Search functionality
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = 'Search help topics...';
    searchInput.className = 'help-search';
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.appendChild(searchInput);
    
    document.querySelector('.help-header').appendChild(searchContainer);

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        sections.forEach(section => {
            const content = section.textContent.toLowerCase();
            const isVisible = content.includes(searchTerm);
            
            section.style.display = isVisible ? 'block' : 'none';
        });
    });

    // Add styles for search
    const style = document.createElement('style');
    style.textContent = `
        .search-container {
            margin-top: 1rem;
        }
        
        .help-search {
            width: 100%;
            max-width: 400px;
            padding: 0.75rem 1rem;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .help-search:focus {
            border-color: #007BFF;
            outline: none;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }
        
        .faq-item {
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .faq-item:hover {
            background-color: #f8f9fa;
        }
        
        .faq-item.active {
            background-color: #f0f7ff;
        }
        
        .faq-item h3 {
            position: relative;
            padding-right: 1.5rem;
        }
        
        .faq-item h3::after {
            content: '+';
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            font-size: 1.5rem;
            color: #007BFF;
            transition: transform 0.3s ease;
        }
        
        .faq-item.active h3::after {
            transform: translateY(-50%) rotate(45deg);
        }
    `;
    document.head.appendChild(style);
}); 