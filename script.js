(() => {
    // Scoped script to avoid globals and improve maintainability

    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const nav = document.querySelector('.navigation');

    function setNavState(open) {
        const isOpen = typeof open === 'boolean' ? open : !navMenu.classList.contains('active');
        navMenu.classList.toggle('active', isOpen);
        navToggle.classList.toggle('active', isOpen);
        if (navToggle) navToggle.setAttribute('aria-expanded', String(isOpen));
    }

    // Toggle handlers (click + keyboard)
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => setNavState());
        navToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setNavState();
            }
        });
    }

    // Close mobile menu when clicking on a nav link
    document.querySelectorAll('.nav-item a').forEach(link => {
        link.addEventListener('click', () => setNavState(false));
    });

    // Make cards keyboard-accessible and navigable via data-href
    document.querySelectorAll('.service-card, .project-card').forEach(card => {
        const href = card.dataset && card.dataset.href;
        if (!href) return;
        card.addEventListener('click', () => {
            window.location.href = href;
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = href;
            }
        });
    });

    // Smooth scrolling for same-page anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setNavState(false);
            }
        });
    });

    // Scroll effect: add/remove .scrolled class (uses CSS for visuals)
    let scrollTimer = null;
    window.addEventListener('scroll', () => {
        if (scrollTimer) return;
        scrollTimer = setTimeout(() => {
            if (nav) {
                if (window.scrollY > 50) nav.classList.add('scrolled');
                else nav.classList.remove('scrolled');
            }
            clearTimeout(scrollTimer);
            scrollTimer = null;
        }, 50);
    }, { passive: true });

    // IntersectionObserver to add a reusable .animate class (no inline styles)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .project-card').forEach(card => {
        observer.observe(card);
    });

    // Hero service typewriter (Home)
    const typerEl = document.getElementById('serviceTyperText');
    if (typerEl) {
        const words = [
            'Elektroplanung',
            'Gebäudeautomation',
            'Hardwareengineering',
            'Softwareengineering'
        ];

        let wordIndex = 0;
        let charIndex = 0;
        let deleting = false;

        const typingSpeed = 85;
        const deletingSpeed = 45;
        const pauseAfterWord = 1300;
        const pauseAfterDelete = 300;

        function tick() {
            const currentWord = words[wordIndex];

            if (!deleting) {
                charIndex++;
                typerEl.textContent = currentWord.slice(0, charIndex);

                if (charIndex === currentWord.length) {
                    deleting = true;
                    setTimeout(tick, pauseAfterWord);
                    return;
                }

                setTimeout(tick, typingSpeed);
                return;
            }

            charIndex--;
            typerEl.textContent = currentWord.slice(0, charIndex);

            if (charIndex === 0) {
                deleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                setTimeout(tick, pauseAfterDelete);
                return;
            }

            setTimeout(tick, deletingSpeed);
        }

        tick();
    }

})();
