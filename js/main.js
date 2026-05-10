document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Precise Header Scroll Behavior
    const header = document.querySelector('header');
    const updateHeader = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', updateHeader);
    updateHeader();

    // 2. Modern Scroll Reveal (Using CSS Classes)
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // entry.target.style.transitionDelay = entry.target.dataset.delay || '0s';
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });
 
    revealElements.forEach(el => revealObserver.observe(el));

    // 3. Active Nav State Logic
    const fullPath = window.location.pathname;
    const path = fullPath.substring(fullPath.lastIndexOf('/') + 1) || 'index.html';
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        }
    });

    // 5. Animated Counter Logic for Impact Metrics
    const statsSection = document.querySelector('.stats-strip');
    let animated = false;

    const animateStats = () => {
        const numbers = document.querySelectorAll('.stat-num');
        numbers.forEach(num => {
            const target = +num.getAttribute('data-val');
            const inc = target / 50; // Total segments
            let initial = 0;
            
            const updateCount = () => {
                if(initial < target) {
                    initial += inc;
                    num.innerText = Math.ceil(initial);
                    setTimeout(updateCount, 20);
                } else {
                    num.innerText = target;
                }
            };
            updateCount();
        });
    };

    const statsObserver = new IntersectionObserver((entries) => {
        if(entries[0].isIntersecting && !animated) {
            animateStats();
            animated = true;
        }
    }, { threshold: 0.5 });

    if(statsSection) statsObserver.observe(statsSection);

    // 6. Image Protection (Anti-Copy)
    document.querySelectorAll('img').forEach(img => {
        // Prevent context menu (Right Click)
        img.addEventListener('contextmenu', (e) => e.preventDefault());
        // Prevent dragging
        img.addEventListener('dragstart', (e) => e.preventDefault());
    });
});
