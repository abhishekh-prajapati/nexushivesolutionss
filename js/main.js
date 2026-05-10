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
document.addEventListener('DOMContentLoaded', () => {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwC4Jbk5YP-4kN6071e56FGi-r31eizJ-Tz6vK3lvM0aas5r9DpLoJWcTyNUosqsT8/exec';
    const form = document.getElementById('globalContactForm');
    const btn = document.getElementById('globalSubmitBtn');
    const btnText = document.getElementById('globalBtnText');
    const btnIcon = document.getElementById('globalBtnIcon');
    const formMessage = document.getElementById('globalFormMessage');

    if(form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            btn.disabled = true;
            btnText.textContent = 'Processing...';
            btnIcon.className = 'fas fa-spinner fa-spin';
            formMessage.style.display = 'none';

            let formData = new FormData(form);

            fetch(scriptURL, { method: 'POST', body: formData })
            .then(response => response.text())
            .then(textContent => {
                if (textContent.includes('Sign in') || textContent.includes('Sign In')) throw new Error('Script requires authentication.');
                try { let json = JSON.parse(textContent); if(json.result === 'error') throw new Error(json.error); } catch(e) {}
                
                btnText.textContent = 'Submitted Successfully';
                btnIcon.className = 'fas fa-check-circle';
                btn.style.background = '#16a34a';
                formMessage.style.display = 'block';
                formMessage.style.background = 'rgba(22, 163, 74, 0.1)';
                formMessage.style.color = '#15803d';
                formMessage.textContent = 'Thank you! Your requirements have been received. Our team will contact you shortly.';
                form.reset();
                setTimeout(() => { btn.disabled = false; btnText.textContent = 'Transmit Requirements'; btnIcon.className = 'fas fa-paper-plane'; btn.style.background = '#f97316'; }, 5000);
            })
            .catch(error => {
                btn.disabled = false;
                btnText.textContent = 'Submission Failed - Try Again';
                btnIcon.className = 'fas fa-exclamation-circle';
                btn.style.background = '#dc2626';
                formMessage.style.display = 'block';
                formMessage.style.background = 'rgba(220, 38, 38, 0.1)';
                formMessage.style.color = '#b91c1c';
                formMessage.textContent = 'Error: ' + error.message;
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Custom Select Dropdown logic
    const customSelects = document.querySelectorAll('.csd-wrapper');
    
    customSelects.forEach(wrapper => {
        const trigger = wrapper.querySelector('.csd-trigger');
        const valueSpan = wrapper.querySelector('.csd-value');
        const options = wrapper.querySelectorAll('.csd-option');
        const hiddenInput = wrapper.querySelector('.csd-hidden-input');

        if (!trigger) return;

        trigger.addEventListener('click', (e) => {
            // Close other open dropdowns
            customSelects.forEach(otherWrapper => {
                if (otherWrapper !== wrapper) {
                    otherWrapper.classList.remove('is-open');
                }
            });
            wrapper.classList.toggle('is-open');
            e.stopPropagation();
        });

        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.getAttribute('data-value');
                const text = option.textContent;

                valueSpan.textContent = text;
                valueSpan.classList.add('has-value');
                hiddenInput.value = value;

                options.forEach(opt => opt.classList.remove('is-selected'));
                option.classList.add('is-selected');

                wrapper.classList.remove('is-open');
                
                // Manually dispatch change event if needed
                const event = new Event('change', { bubbles: true });
                hiddenInput.dispatchEvent(event);
            });
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        customSelects.forEach(wrapper => {
            wrapper.classList.remove('is-open');
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    // Modern Custom Select Dropdown logic
    const modernSelects = document.querySelectorAll(".mc-custom-select");
    
    modernSelects.forEach(wrapper => {
        const trigger = wrapper.querySelector(".mc-select-trigger");
        const valueSpan = wrapper.querySelector(".mc-select-value");
        const options = wrapper.querySelectorAll(".mc-option");
        const hiddenInput = wrapper.querySelector(".mc-hidden-input");

        if (!trigger) return;

        trigger.addEventListener("click", (e) => {
            // Close others
            modernSelects.forEach(other => {
                if (other !== wrapper) other.classList.remove("is-open");
            });
            wrapper.classList.toggle("is-open");
            e.stopPropagation();
        });

        options.forEach(option => {
            option.addEventListener("click", () => {
                const value = option.getAttribute("data-value");
                const text = option.textContent;

                valueSpan.textContent = text;
                wrapper.classList.add("has-value");
                hiddenInput.value = value;

                options.forEach(opt => opt.classList.remove("is-selected"));
                option.classList.add("is-selected");

                wrapper.classList.remove("is-open");
            });
        });
    });

    // Close on outside click
    document.addEventListener("click", () => {
        modernSelects.forEach(wrapper => {
            wrapper.classList.remove("is-open");
        });
    });
});
