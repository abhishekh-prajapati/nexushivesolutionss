/**
 * NexusHive — Premium Scroll Text Animations & Micro-interactions
 * Each section gets its own unique reveal animation style
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ═══════════════════════════════════════════════════════
       UTILITY: easing cubic-bezier config
    ═══════════════════════════════════════════════════════ */
    const EASE_OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const EASE_OUT_BACK = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

    /* ═══════════════════════════════════════════════════════
       2. SCROLL PROGRESS BAR
    ═══════════════════════════════════════════════════════ */
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);
    window.addEventListener('scroll', () => {
        const st = document.documentElement.scrollTop;
        const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        progressBar.style.width = `${(st / h) * 100}%`;
    });

    /* ═══════════════════════════════════════════════════════
       3. HERO — SPLIT WORD REVEAL (immediate on load)
    ═══════════════════════════════════════════════════════ */
    function splitWords(el, onScroll = false) {
        const text = el.textContent.trim();
        el.innerHTML = text.split(' ').map((w, i) =>
            `<span class="word-wrap"><span class="word" style="transition-delay:${0.06 * i}s">${w}</span></span>`
        ).join(' ');
        if (!onScroll) {
            setTimeout(() => el.querySelectorAll('.word').forEach(w => w.classList.add('revealed')), 250);
        }
        return el.querySelectorAll('.word');
    }

    // Hero H1 — immediate load
    const heroH1 = document.querySelector('.hero h1');
    if (heroH1) {
        heroH1.style.cssText += `opacity: 0; transform: translateX(50px); transition: opacity 0.8s ease, transform 0.8s ${EASE_OUT_EXPO};`;
        setTimeout(() => {
            heroH1.style.opacity = '1';
            heroH1.style.transform = 'translateX(0)';
        }, 100);
    }

    // Hero Para — blur-fade-up on load
    const heroP = document.querySelector('.hero p');
    if (heroP) {
        heroP.style.cssText += 'opacity:0;filter:blur(6px);transform:translateY(20px);transition:opacity 1s 0.5s ease,filter 1s 0.5s ease,transform 1s 0.5s ease;';
        setTimeout(() => { heroP.style.opacity='1'; heroP.style.filter='blur(0)'; heroP.style.transform='translateY(0)'; }, 400);
    }

    // Hero CTA — slide up + scale on load
    const heroCTA = document.querySelector('.hero .cta-group');
    if (heroCTA) {
        heroCTA.style.cssText += 'opacity:0;transform:translateY(25px) scale(0.97);transition:opacity 0.8s 0.85s ease,transform 0.8s 0.85s '+EASE_OUT_BACK+';';
        setTimeout(() => { heroCTA.style.opacity='1'; heroCTA.style.transform='translateY(0) scale(1)'; }, 500);
    }

    /* ═══════════════════════════════════════════════════════
       4. HERO — TYPEWRITER on tagline
    ═══════════════════════════════════════════════════════ */
    const heroTagline = document.querySelector('.hero .tagline');
    if (heroTagline) {
        const full = heroTagline.textContent.trim();
        heroTagline.textContent = '';
        heroTagline.style.opacity = '1';
        let i = 0;
        const type = () => { if (i < full.length) { heroTagline.textContent += full[i++]; setTimeout(type, 50); } };
        setTimeout(type, 500);
    }

    /* ═══════════════════════════════════════════════════════
       5. HERO — PARTICLES + PARALLAX
    ═══════════════════════════════════════════════════════ */
    const heroSec = document.querySelector('.hero');
    if (heroSec) {
        // Particle canvas
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0.45;';
        heroSec.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        let W, H;
        const resize = () => { W = canvas.width = heroSec.offsetWidth; H = canvas.height = heroSec.offsetHeight; };
        resize(); window.addEventListener('resize', resize);
        const pts = Array.from({length:28}, () => ({
            x: Math.random()*800, y: Math.random()*800,
            r: Math.random()*2.5+0.8, dx:(Math.random()-0.5)*0.35, dy:(Math.random()-0.5)*0.35,
            o: Math.random()*0.45+0.15
        }));
        (function draw() {
            ctx.clearRect(0,0,W,H);
            pts.forEach(p => {
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                ctx.fillStyle = `rgba(79,70,229,${p.o})`; ctx.fill();
                p.x+=p.dx; p.y+=p.dy;
                if(p.x<0||p.x>W) p.dx*=-1; if(p.y<0||p.y>H) p.dy*=-1;
            }); requestAnimationFrame(draw);
        })();
        // Parallax
        window.addEventListener('scroll', () => {
            heroSec.style.setProperty('--parallax-y', `${window.scrollY*0.3}px`);
        });
    }

    /* ═══════════════════════════════════════════════════════
       6. MAGNETIC BUTTONS
    ═══════════════════════════════════════════════════════ */
    document.querySelectorAll('.btn-cta, .btn-get-started').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*0.18}px,${(e.clientY-r.top-r.height/2)*0.18}px)`;
        });
        btn.addEventListener('mouseleave', () => btn.style.transform = '');
    });

    /* ═══════════════════════════════════════════════════════
       7. 3D CARD TILT — instant tracking, reduced intensity
    ═══════════════════════════════════════════════════════ */
    document.querySelectorAll('.startup-card').forEach(card => {
        // Remove CSS transition on transform so tilt follows mouse instantly
        card.style.transition = 'box-shadow 0.3s ease, opacity 0.7s ease';

        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = e.clientX - r.left, y = e.clientY - r.top;
            const rX = -(y - r.height/2) / 28;  // reduced from /16
            const rY =  (x - r.width/2)  / 28;
            card.style.transform = `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg) translateY(-5px)`;
            let shine = card.querySelector('.card-shine');
            if (!shine) {
                shine = document.createElement('div');
                shine.className = 'card-shine';
                card.appendChild(shine);
            }
            shine.style.left = `${(x / r.width)  * 100}%`;
            shine.style.top  = `${(y / r.height) * 100}%`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    /* ═══════════════════════════════════════════════════════
       8. SECTION TEXT ANIMATIONS — CORE ENGINE
       Each section gets tagged with a data-anim type and
       observed. On intersection: animations are triggered.
    ═══════════════════════════════════════════════════════ */

    /* --- ANIMATION HELPERS --- */

    /** Slide-from-right fade reveal (for H2 section headings) */
    function animClipH2(el, delay = 0) {
        el.style.cssText += `
            opacity: 0;
            transform: translateX(50px);
            transition: opacity 0.8s ${delay}s ${EASE_OUT_EXPO},
                        transform 0.8s ${delay}s ${EASE_OUT_EXPO};
        `;
        return () => {
            el.style.opacity  = '1';
            el.style.transform = 'translateX(0)';
        };
    }

    /** Char-by-char stagger (for tagline spans in sections) */
    function animChars(el, delay = 0) {
        const parts = el.innerHTML.split(/<br\s*\/?>/i);
        let charIndex = 0;
        el.innerHTML = parts.map(part => {
            return part.split('').map(c => {
                if (c === ' ') return '&nbsp;';
                if (c === '\n' || c === '\t') return '';
                const html = `<span class="char" style="display:inline-block;opacity:0;transform:translateY(15px) rotate(5deg);transition:opacity 0.4s ${(delay + charIndex*0.025).toFixed(3)}s ease,transform 0.5s ${(delay + charIndex*0.025).toFixed(3)}s ${EASE_OUT_BACK}">${c}</span>`;
                charIndex++;
                return html;
            }).join('');
        }).join('<br>');
        return () => {
            el.querySelectorAll('.char').forEach(c => {
                c.style.opacity = '1'; c.style.transform = 'translateY(0) rotate(0deg)';
            });
        };
    }

    /** Blur-fade-up (for paragraphs) */
    function animBlurPara(el, delay = 0) {
        el.style.cssText += `
            opacity:0; filter:blur(5px); transform:translateY(18px);
            transition: opacity 0.9s ${delay}s ease,
                        filter 0.9s ${delay}s ease,
                        transform 0.9s ${delay}s ${EASE_OUT_EXPO};
        `;
        return () => { el.style.opacity='1'; el.style.filter='blur(0)'; el.style.transform='translateY(0)'; };
    }

    /** Slide from left */
    function animSlideLeft(el, delay = 0) {
        el.style.cssText += `
            opacity:0; transform:translateX(-50px);
            transition: opacity 0.8s ${delay}s ${EASE_OUT_EXPO},
                        transform 0.8s ${delay}s ${EASE_OUT_EXPO};
        `;
        return () => { el.style.opacity='1'; el.style.transform='translateX(0)'; };
    }

    /** Slide from right */
    function animSlideRight(el, delay = 0) {
        el.style.cssText += `
            opacity:0; transform:translateX(50px);
            transition: opacity 0.8s ${delay}s ${EASE_OUT_EXPO},
                        transform 0.8s ${delay}s ${EASE_OUT_EXPO};
        `;
        return () => { el.style.opacity='1'; el.style.transform='translateX(0)'; };
    }

    /** Scale-up bounce (for cards / icons) */
    function animScaleBounce(el, delay = 0) {
        el.style.cssText += `
            opacity:0; transform:scale(0.8) translateY(20px);
            transition: opacity 0.7s ${delay}s ease,
                        transform 0.7s ${delay}s ${EASE_OUT_BACK};
        `;
        return () => { el.style.opacity='1'; el.style.transform='scale(1) translateY(0)'; };
    }

    /** Counter number animation for stats */
    function animCounter(el, target, delay = 0) {
        el.style.opacity = '0';
        el.style.transition = `opacity 0.4s ${delay}s ease`;
        return () => {
            el.style.opacity = '1';
            let start = null;
            const step = ts => {
                if (!start) start = ts;
                const prog = Math.min((ts - start) / 2000, 1);
                const eased = 1 - Math.pow(1 - prog, 3);
                el.textContent = Math.ceil(eased * target);
                if (prog < 1) requestAnimationFrame(step);
                else el.textContent = target;
            };
            requestAnimationFrame(step);
        };
    }

    /* ─── REGISTER OBSERVERS per section ─── */

    function onceVisible(el, callback, threshold = 0.15) {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { callback(); obs.disconnect(); }
            });
        }, { threshold, rootMargin: '0px 0px -50px 0px' });
        obs.observe(el);
    }

    /* ═══════════════════════════════════════════════════════
       SECTION A: TRUSTED BY LEADERS (clients-strip)
       Animation: fade-in header + scale-pulse on entry
    ═══════════════════════════════════════════════════════ */
    const clientsStrip = document.querySelector('.clients-strip');
    if (clientsStrip) {
        const h4 = clientsStrip.querySelector('h4');
        if (h4) {
            const trigger = animSlideRight(h4, 0);
            onceVisible(clientsStrip, trigger, 0.3);
        }
    }

    /* ═══════════════════════════════════════════════════════
       SECTION B: STARTUP SUPPORT
       H2 → Clip-path reveal | Tagline → char stagger
       Para → blur-fade | Cards → scale bounce stagger
    ═══════════════════════════════════════════════════════ */
    const startupSec = document.querySelector('.startup-support');
    if (startupSec) {
        const tagEl = startupSec.querySelector('.tagline');
        const h2El  = startupSec.querySelector('h2');
        const pEl   = startupSec.querySelector('.section-head p');
        const cards = startupSec.querySelectorAll('.startup-card');

        if (tagEl) { const t = animClipH2(tagEl, 0); onceVisible(tagEl, t); }
        if (h2El)  { const t = animChars(h2El, 0.15); onceVisible(h2El, t); }
        if (pEl)   { const t = animBlurPara(pEl, 0.35); onceVisible(pEl, t); }

        cards.forEach((card, i) => {
            const t = animScaleBounce(card, i * 0.12);
            onceVisible(card, t, 0.1);
        });

        onceVisible(startupSec, () => startupSec.classList.add('in-view'));
    }

    /* ═══════════════════════════════════════════════════════
       SECTION C: SERVICES
       Heading → slide from left | Para → blur-fade
       Cards → alternating slide (odd left, even right)
    ═══════════════════════════════════════════════════════ */
    const servicesSec = document.querySelector('.services-section');
    if (servicesSec) {
        const h2El = servicesSec.querySelector('.head-left h2');
        const pEl  = servicesSec.querySelector('.head-left p');
        const btn  = servicesSec.querySelector('.btn-get-started');
        const cards = servicesSec.querySelectorAll('.s-card');

        if (h2El) { const t = animChars(h2El, 0); onceVisible(h2El, t); }
        if (pEl)  { const t = animBlurPara(pEl, 0.2); onceVisible(pEl, t); }
        if (btn)  { const t = animSlideRight(btn, 0.3); onceVisible(btn, t); }

        cards.forEach((card, i) => {
            const fn = i % 2 === 0 ? animSlideLeft : animSlideRight;
            const t = fn(card, (i * 0.1));
            onceVisible(card, t, 0.1);
        });

    }

    /* ═══════════════════════════════════════════════════════
       SECTION D: TESTIMONIALS
       Tagline → char stagger | H2 → clip-path
       Stars & badges → scale bounce | Cards → blur-fade stagger
    ═══════════════════════════════════════════════════════ */
    const testimonialsSec = document.querySelector('.testimonials');
    if (testimonialsSec) {
        const tagEl = testimonialsSec.querySelector('.tagline');
        const h2El  = testimonialsSec.querySelector('h2');
        const stars = testimonialsSec.querySelector('.rating-info');
        const tCards = testimonialsSec.querySelectorAll('.t-card');

        if (tagEl) { const t = animClipH2(tagEl, 0); onceVisible(tagEl, t); }
        if (h2El)  { const t = animChars(h2El, 0.2); onceVisible(h2El, t); }
        if (stars) { const t = animScaleBounce(stars, 0.5); onceVisible(stars, t, 0.2); }

        tCards.forEach((card, i) => {
            const t = animBlurPara(card, i * 0.15);
            onceVisible(card, t, 0.1);
        });
    }

    /* ═══════════════════════════════════════════════════════
       SECTION E: CTA SECTION (Ready for Structural Excellence)
       Tagline → chars | H2 → clip-path | Para → blur
       Buttons → scale bounce
    ═══════════════════════════════════════════════════════ */
    const ctaSec = document.querySelector('section[style*="bg-lavender"], main > section:last-of-type');
    if (ctaSec) {
        const tagEl   = ctaSec.querySelector('.tagline');
        const h2El    = ctaSec.querySelector('h2');
        const pEl     = ctaSec.querySelector('p');
        const btns    = ctaSec.querySelectorAll('.btn-cta');

        if (tagEl) { const t = animClipH2(tagEl, 0); onceVisible(tagEl, t); }
        if (h2El)  { const t = animChars(h2El, 0.2); onceVisible(h2El, t); }
        if (pEl)   { const t = animBlurPara(pEl, 0.4); onceVisible(pEl, t); }
        btns.forEach((btn, i) => { const t = animScaleBounce(btn, 0.55 + i*0.1); onceVisible(btn, t); });
    }

    /* ═══════════════════════════════════════════════════════
       SECTION F: FOOTER
       Logo → slide from left | Cols → stagger fade up
       Links → each item slides up with delay
    ═══════════════════════════════════════════════════════ */
    const footerEl = document.querySelector('footer');
    if (footerEl) {
        const logo = footerEl.querySelector('.footer-logo');
        const desc = footerEl.querySelector('p');
        const cols = footerEl.querySelectorAll('.footer-links');

        if (logo) { const t = animSlideRight(logo, 0); onceVisible(logo, t, 0.2); }
        if (desc) { const t = animBlurPara(desc, 0.15); onceVisible(desc, t, 0.2); }

        cols.forEach((col, ci) => {
            const h4 = col.querySelector('h4');
            const items = col.querySelectorAll('li');
            if (h4) { const t = animSlideRight(h4, ci * 0.1); onceVisible(h4, t, 0.2); }
            items.forEach((li, li_i) => {
                li.style.opacity = '0';
                li.style.transform = 'translateY(12px)';
                li.style.transition = `opacity 0.5s ${(ci*0.1 + li_i*0.06 + 0.25).toFixed(2)}s ease, transform 0.5s ${(ci*0.1 + li_i*0.06 + 0.25).toFixed(2)}s ${EASE_OUT_EXPO}`;
            });
        });

        onceVisible(footerEl, () => {
            footerEl.querySelectorAll('.footer-links li').forEach(li => {
                li.style.opacity = '1'; li.style.transform = 'translateY(0)';
            });
        }, 0.1);
    }

    /* ═══════════════════════════════════════════════════════
       9. STAT COUNTER ANIMATION
    ═══════════════════════════════════════════════════════ */
    document.querySelectorAll('.stat-num').forEach(el => {
        const target = +(el.dataset.val || el.textContent);
        el.dataset.val = target;
        el.textContent = '0';
        const t = animCounter(el, target, 0);
        onceVisible(el, t, 0.5);
    });

    /* ═══════════════════════════════════════════════════════
       10. GENERIC .reveal FALLBACK (backwards compat)
    ═══════════════════════════════════════════════════════ */
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));


    /* ═══════════════════════════════════════════════════════
       12. STARTUP CARDS — text inside animate on card entry
    ═══════════════════════════════════════════════════════ */
    document.querySelectorAll('.startup-card').forEach(card => {
        const h4 = card.querySelector('h4');
        const p  = card.querySelector('p');
        const lis = card.querySelectorAll('li');
        if (h4) h4.style.cssText += 'opacity:0;transform:translateX(50px);transition:opacity 0.8s 0.1s ease,transform 0.8s 0.1s '+EASE_OUT_EXPO+';';
        if (p)  p.style.cssText  += 'opacity:0;transform:translateX(-15px);transition:opacity 0.5s 0.2s ease,transform 0.5s 0.2s '+EASE_OUT_EXPO+';';
        lis.forEach((li, i) => {
            li.style.cssText += `opacity:0;transform:translateX(-15px);transition:opacity 0.4s ${0.3+i*0.06}s ease,transform 0.4s ${0.3+i*0.06}s ${EASE_OUT_EXPO};`;
        });

        onceVisible(card, () => {
            if (h4) { h4.style.opacity='1'; h4.style.transform='translateX(0)'; }
            if (p)  { p.style.opacity='1';  p.style.transform='translateX(0)'; }
            lis.forEach(li => { li.style.opacity='1'; li.style.transform='translateX(0)'; });
        }, 0.2);
    });

    /* ═══════════════════════════════════════════════════════
       13. SERVICE CARDS — text inside slides up on card entry, plus clickability
    ═══════════════════════════════════════════════════════ */
    document.querySelectorAll('.s-card').forEach(card => {
        // Enforce full-card clickability
        card.addEventListener('click', () => {
            const link = card.querySelector('.learn-more');
            if (link && link.href) {
                window.location.href = link.href;
            }
        });

        const h3 = card.querySelector('h3');
        const p  = card.querySelector('p');
        const a  = card.querySelector('a');
        if (h3) h3.style.cssText += 'opacity:0;transform:translateX(50px);transition:opacity 0.8s 0.1s ease,transform 0.8s 0.1s '+EASE_OUT_EXPO+';';
        if (p)  p.style.cssText  += 'opacity:0;transform:translateY(12px);transition:opacity 0.5s 0.2s ease,transform 0.5s 0.2s '+EASE_OUT_EXPO+';';
        if (a)  a.style.cssText  += 'opacity:0;transform:translateY(8px);transition:opacity 0.4s 0.3s ease,transform 0.4s 0.3s ease;';

        onceVisible(card, () => {
            if (h3) { h3.style.opacity='1'; h3.style.transform='translateY(0)'; }
            if (p)  { p.style.opacity='1';  p.style.transform='translateY(0)'; }
            if (a)  { a.style.opacity='1';  a.style.transform='translateY(0)'; }
        }, 0.2);
    });

    /* ═══════════════════════════════════════════════════════
       14. TESTIMONIAL QUOTE WORDS — word-by-word on scroll
    ═══════════════════════════════════════════════════════ */
    document.querySelectorAll('.t-card .quote').forEach(quote => {
        const words = quote.textContent.trim().split(' ');
        quote.innerHTML = words.map((w, i) =>
            `<span class="word-wrap"><span class="word" style="transition-delay:${0.04*i}s">${w}</span></span>`
        ).join(' ');
        onceVisible(quote, () => {
            quote.querySelectorAll('.word').forEach(w => w.classList.add('revealed'));
        }, 0.2);
    });

    /* ═══════════════════════════════════════════════════════
       15. NAV — section-based active state
    ═══════════════════════════════════════════════════════ */
    const allSections = document.querySelectorAll('section[id]');
    if (allSections.length) {
        const navObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
                    const m = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
                    if (m) m.classList.add('active');
                }
            });
        }, { threshold: 0.5 });
        allSections.forEach(s => navObs.observe(s));
    }

    /* ═══════════════════════════════════════════════════════
       16. SERVICES CAROUSEL HORIZONTAL SCROLL
    ═══════════════════════════════════════════════════════ */
    const servPrev = document.getElementById('servPrev');
    const servNext = document.getElementById('servNext');
    const servicesGrid = document.getElementById('servicesGrid');

    if (servPrev && servNext && servicesGrid) {
        servNext.addEventListener('click', () => {
            const firstCard = servicesGrid.querySelector('.s-card');
            if(firstCard) {
                const scrollAmt = firstCard.offsetWidth + 32; // card width + 2rem gap
                servicesGrid.scrollBy({ left: scrollAmt, behavior: 'smooth' });
            }
        });
        servPrev.addEventListener('click', () => {
            const firstCard = servicesGrid.querySelector('.s-card');
            if(firstCard) {
                const scrollAmt = firstCard.offsetWidth + 32;
                servicesGrid.scrollBy({ left: -scrollAmt, behavior: 'smooth' });
            }
        });
    }

});
