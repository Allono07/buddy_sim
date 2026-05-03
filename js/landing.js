document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeToggle = document.getElementById('landing-theme-toggle');
    const themeIcon = document.getElementById('landing-theme-icon');
    const navRoot = document.querySelector('.landing-nav');
    const navToggle = document.getElementById('landing-nav-toggle');
    const navToggleIcon = document.getElementById('landing-nav-toggle-icon');
    const navPanel = document.getElementById('landing-nav-panel');
    const navDropdown = document.querySelector('.landing-nav-dropdown');
    const mobileNavLinks = Array.from(document.querySelectorAll('#landing-nav-panel a'));
    const mobileNavQuery = window.matchMedia('(max-width: 960px)');
    const track = document.getElementById('landing-carousel-track');
    const dotsRoot = document.getElementById('landing-carousel-dots');
    const currentLabel = document.getElementById('landing-slide-current');
    const totalLabel = document.getElementById('landing-slide-total');
    const prevButton = document.getElementById('landing-carousel-prev');
    const nextButton = document.getElementById('landing-carousel-next');
    const slides = Array.from(track ? track.children : []);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const autoplayDelayMs = 8000;
    let activeIndex = 0;
    let autoplayId = null;

    const trackVisit = () => {
        if (typeof gtag !== 'function') return;

        const pageName = body.dataset.pageName || 'home';
        const eventName = pageName === 'contact' ? 'contact_page_viewed' : 'home_page_viewed';

        gtag('event', eventName, {
            page_name: pageName,
            page_path: window.location.pathname,
            entry_point: 'page_load'
        });
    };

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.setAttribute('data-theme', 'dark');
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
            localStorage.setItem('theme', 'dark');
        } else {
            body.removeAttribute('data-theme');
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
            localStorage.setItem('theme', 'light');
        }
    };

    if (localStorage.getItem('theme') === 'dark') {
        applyTheme('dark');
    }

    trackVisit();

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            applyTheme(body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        });
    }

    const syncNavIcon = (isOpen) => {
        if (!navToggleIcon) return;
        navToggleIcon.classList.toggle('fa-bars', !isOpen);
        navToggleIcon.classList.toggle('fa-xmark', isOpen);
    };

    const closeNavDropdown = () => {
        if (navDropdown) {
            navDropdown.removeAttribute('open');
        }
    };

    const setNavOpen = (isOpen) => {
        if (!navRoot || !navToggle || !navPanel) return;

        if (!mobileNavQuery.matches) {
            navRoot.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
            navPanel.hidden = false;
            syncNavIcon(false);
            return;
        }

        navRoot.classList.toggle('is-open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navPanel.hidden = !isOpen;
        syncNavIcon(isOpen);
        if (!isOpen) {
            closeNavDropdown();
        }
    };

    const syncNavLayout = () => {
        if (!navToggle || !navPanel) return;
        navToggle.hidden = !mobileNavQuery.matches;
        setNavOpen(mobileNavQuery.matches ? navRoot?.classList.contains('is-open') : false);
    };

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const isOpen = navRoot?.classList.contains('is-open');
            setNavOpen(!isOpen);
        });
    }

    mobileNavLinks.forEach((link) => {
        link.addEventListener('click', () => {
            closeNavDropdown();
            if (mobileNavQuery.matches) {
                setNavOpen(false);
            }
        });
    });

    document.addEventListener('click', (event) => {
        if (navDropdown && navDropdown.hasAttribute('open') && !navDropdown.contains(event.target)) {
            closeNavDropdown();
        }
        if (!mobileNavQuery.matches || !navRoot || !navRoot.classList.contains('is-open')) return;
        if (!navRoot.contains(event.target)) {
            setNavOpen(false);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeNavDropdown();
            if (mobileNavQuery.matches) {
                setNavOpen(false);
            }
        }
    });

    window.addEventListener('resize', syncNavLayout);
    syncNavLayout();

    if (!track || slides.length === 0 || !dotsRoot || !currentLabel || !totalLabel) {
        return;
    }

    const dots = slides.map((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'landing-carousel-dot';
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => {
            setSlide(index);
            restartAutoplay();
        });
        dotsRoot.appendChild(dot);
        return dot;
    });

    totalLabel.textContent = String(slides.length).padStart(2, '0');

    const setSlide = (index) => {
        activeIndex = (index + slides.length) % slides.length;
        track.style.transform = `translateX(-${activeIndex * 100}%)`;
        currentLabel.textContent = String(activeIndex + 1).padStart(2, '0');

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    };

    const stopAutoplay = () => {
        if (autoplayId) {
            window.clearInterval(autoplayId);
            autoplayId = null;
        }
    };

    const startAutoplay = () => {
        if (prefersReducedMotion) return;
        autoplayId = window.setInterval(() => {
            setSlide(activeIndex + 1);
        }, autoplayDelayMs);
    };

    const restartAutoplay = () => {
        stopAutoplay();
        startAutoplay();
    };

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            setSlide(activeIndex - 1);
            restartAutoplay();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            setSlide(activeIndex + 1);
            restartAutoplay();
        });
    }

    const carousel = document.querySelector('[data-carousel]');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
        carousel.addEventListener('focusin', stopAutoplay);
        carousel.addEventListener('focusout', startAutoplay);
    }

    setSlide(0);
    startAutoplay();
});
