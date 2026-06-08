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
       2. SCROLL PROGRESS BAR (REMOVED)
    ═══════════════════════════════════════════════════════ */

    /* ═══════════════════════════════════════════════════════
       3. HERO — SPLIT WORD REVEAL (immediate on load)
    ═══════════════════════════════════════════════════════ */
    // Hero H1 — Standard Corporate Reveal
    const heroH1 = document.querySelector('.hero h1');
    if (heroH1) {
        heroH1.style.cssText += `opacity: 0; transform: translateY(20px); transition: opacity 0.8s ease, transform 0.8s ${EASE_OUT_EXPO};`;
        setTimeout(() => {
            heroH1.style.opacity = '1';
            heroH1.style.transform = 'translateY(0)';
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
       5. HERO — PARALLAX (REMOVED)
    ═══════════════════════════════════════════════════════ */
    const heroSec = document.querySelector('.hero');
    if (heroSec) {
        // Parallax removed per user request
    }

    /* ═══════════════════════════════════════════════════════
       6. MAGNETIC BUTTONS (REMOVED)
    ═══════════════════════════════════════════════════════ */

    /* ═══════════════════════════════════════════════════════
       7. 3D CARD TILT (REMOVED FOR CORPORATE STABILITY)
    ═══════════════════════════════════════════════════════ */

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
        const parts = el.innerHTML.split(/<br\s*\/?>/i).map(p => p.trim());
        let charIndex = 0;
        el.innerHTML = parts.map(part => {
            return part.split('').map(c => {
                if (c === ' ') return '&nbsp;';
                if (c === '\n' || c === '\t') return '';
                const html = `<span class="char" style="display:inline-block;opacity:0;transform:translateY(15px);transition:opacity 0.4s ${(delay + charIndex*0.025).toFixed(3)}s ease,transform 0.5s ${(delay + charIndex*0.025).toFixed(3)}s ${EASE_OUT_EXPO}">${c}</span>`;
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
            opacity:0; filter:blur(10px); transform:translateY(30px);
            transition: opacity 1.2s ${delay}s ease,
                        filter 1.2s ${delay}s ease,
                        transform 1.2s ${delay}s ${EASE_OUT_EXPO};
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
            opacity:0; transform:scale(0.92) translateY(30px);
            transition: opacity 0.8s ${delay}s ease,
                        transform 0.8s ${delay}s ${EASE_OUT_EXPO};
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
        if (h2El)  { const t = animClipH2(h2El, 0.15); onceVisible(h2El, t); }
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
       13b. EVENT CARDS — text inside slides up on card entry
    ═══════════════════════════════════════════════════════ */
    document.querySelectorAll('.event-card').forEach(card => {
        const h3 = card.querySelector('h3');
        const p  = card.querySelector('p');
        const link = card.querySelector('.learn-more');
        if (h3) h3.style.cssText += 'opacity:0;transform:translateX(50px);transition:opacity 0.8s 0.1s ease,transform 0.8s 0.1s '+EASE_OUT_EXPO+';';
        if (p)  p.style.cssText  += 'opacity:0;transform:translateY(12px);transition:opacity 0.5s 0.2s ease,transform 0.5s 0.2s '+EASE_OUT_EXPO+';';
        if (link) link.style.cssText += 'opacity:0;transform:translateY(8px);transition:opacity 0.4s 0.3s ease,transform 0.4s 0.3s ease;';

        onceVisible(card, () => {
            if (h3) { h3.style.opacity='1'; h3.style.transform='translateY(0)'; }
            if (p)  { p.style.opacity='1';  p.style.transform='translateY(0)'; }
            if (link) { link.style.opacity='1';  link.style.transform='translateY(0)'; }
        }, 0.2);
    });

    /* ═══════════════════════════════════════════════════════
       14. TESTIMONIAL QUOTE WORDS (DISABLED for long text)
    ═══════════════════════════════════════════════════════ */
    /* document.querySelectorAll('.t-card.small .quote').forEach(quote => {
        const words = quote.textContent.trim().split(' ');
        quote.innerHTML = words.map((w, i) =>
            `<span class="word-wrap"><span class="word" style="transition-delay:${0.04*i}s">${w}</span></span>`
        ).join(' ');
        onceVisible(quote, () => {
            quote.querySelectorAll('.word').forEach(w => w.classList.add('revealed'));
        }, 0.2);
    }); */

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

    /* ═══════════════════════════════════════════════════════
       HYDRATION ENGINE: Load JSON data with Static Fallbacks
       ═══════════════════════════════════════════════════════ */

    // Helper: Safe fetch
    async function safeFetch(url) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            return await res.json();
        } catch (e) {
            console.warn(`[CMS Fallback] Failed to fetch ${url}, keeping static HTML.`, e);
            return null;
        }
    }

    // 1. Hydrate Homepage Hero
    async function hydrateHero() {
        const titleEl = document.getElementById('hero-title-el');
        const leadEl = document.getElementById('hero-lead-el');
        const pCta = document.getElementById('hero-primary-cta');
        const sCta = document.getElementById('hero-secondary-cta');

        if (!titleEl && !leadEl) return;

        const data = await safeFetch('/data/hero.json');
        if (!data) return;

        if (titleEl && data.title) titleEl.textContent = data.title;
        if (leadEl && data.lead) leadEl.textContent = data.lead;
        if (pCta && data.primaryCtaText) {
            pCta.innerHTML = `${data.primaryCtaText} <i class="fas fa-chevron-right"></i>`;
            pCta.href = data.primaryCtaLink || '#contact';
        }
        if (sCta && data.secondaryCtaText) {
            sCta.innerHTML = `${data.secondaryCtaText} <i class="fas fa-chevron-right"></i>`;
            sCta.href = data.secondaryCtaLink || 'services.html';
        }
    }

    // 2. Hydrate Events Ticker
    async function hydrateEvents() {
        const track = document.querySelector('.events-ticker-track');
        if (!track) return;

        const data = await safeFetch('/data/events.json');
        if (!data || data.length === 0) return;

        const renderEventCard = (ev, isDup) => `
            <a href="${ev.link || '#contact'}" class="event-card" aria-label="Register for ${ev.title} in ${ev.location} on ${ev.month} ${ev.day}${isDup ? ' - Duplicate' : ''}">
              <div class="event-card-img">
                <img src="${ev.image || 'img/hr_compliance_event.png'}" alt="${ev.title}" />
              </div>
              <div class="event-card-overlay"></div>
              <div class="event-date-badge">
                <span class="day">${ev.day}</span>
                <span class="month">${ev.month}</span>
              </div>
              <div class="event-card-content">
                <span class="event-badge">${ev.badge}</span>
                <h3>${ev.title}</h3>
                <p>${ev.description}</p>
                <div class="event-meta-info">
                  <span><i class="fas fa-map-marker-alt"></i> ${ev.location}</span>
                  <span><i class="fas fa-users"></i> ${ev.platform}</span>
                </div>
                <div class="event-action-row">
                  <span class="learn-more">Register <i class="fas fa-arrow-right"></i></span>
                </div>
              </div>
            </a>
        `;

        // Build duplicates for seamless scrolling track
        let html = '';
        data.forEach(ev => html += renderEventCard(ev, false));
        data.forEach(ev => html += renderEventCard(ev, true));

        track.innerHTML = html;

        // Rebind anti-copy protection on new images
        track.querySelectorAll('img').forEach(img => {
            img.addEventListener('contextmenu', e => e.preventDefault());
            img.addEventListener('dragstart', e => e.preventDefault());
        });

        // Rebind scroll animations on new cards
        track.querySelectorAll('.event-card').forEach(card => {
            const h3 = card.querySelector('h3');
            const p  = card.querySelector('p');
            const link = card.querySelector('.learn-more');
            if (h3) h3.style.cssText += 'opacity:0;transform:translateX(50px);transition:opacity 0.8s 0.1s ease,transform 0.8s 0.1s cubic-bezier(0.16, 1, 0.3, 1);';
            if (p)  p.style.cssText  += 'opacity:0;transform:translateY(12px);transition:opacity 0.5s 0.2s ease,transform 0.5s 0.2s cubic-bezier(0.16, 1, 0.3, 1);';
            if (link) link.style.cssText += 'opacity:0;transform:translateY(8px);transition:opacity 0.4s 0.3s ease,transform 0.4s 0.3s ease;';

            onceVisible(card, () => {
                if (h3) { h3.style.opacity='1'; h3.style.transform='translateY(0)'; }
                if (p)  { p.style.opacity='1';  p.style.transform='translateY(0)'; }
                if (link) { link.style.opacity='1';  link.style.transform='translateY(0)'; }
            }, 0.2);
        });
    }

    // 3. Hydrate Services (Carousel & Details page)
    async function hydrateServices() {
        const data = await safeFetch('/data/services.json');
        if (!data || data.length === 0) return;

        // 3a. Index Page Carousel
        const carouselGrid = document.getElementById('servicesGrid');
        if (carouselGrid) {
            carouselGrid.innerHTML = data.map(service => `
                <div class="s-card reveal">
                    <div class="s-card-img">
                        <img src="${service.image}" alt="${service.title}" />
                    </div>
                    <div class="s-card-content">
                        <h3>${service.title}</h3>
                        <p>${service.description}</p>
                        <a href="${service.link}" class="learn-more"><i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            `).join('');

            // Rebind clickability and animations on carousel cards
            carouselGrid.querySelectorAll('.s-card').forEach(card => {
                card.addEventListener('click', () => {
                    const link = card.querySelector('.learn-more');
                    if (link && link.href) window.location.href = link.href;
                });

                const h3 = card.querySelector('h3');
                const p  = card.querySelector('p');
                const a  = card.querySelector('a');
                if (h3) h3.style.cssText += 'opacity:0;transform:translateX(50px);transition:opacity 0.8s 0.1s ease,transform 0.8s 0.1s cubic-bezier(0.16, 1, 0.3, 1);';
                if (p)  p.style.cssText  += 'opacity:0;transform:translateY(12px);transition:opacity 0.5s 0.2s ease,transform 0.5s 0.2s cubic-bezier(0.16, 1, 0.3, 1);';
                if (a)  a.style.cssText  += 'opacity:0;transform:translateY(8px);transition:opacity 0.4s 0.3s ease,transform 0.4s 0.3s ease;';

                onceVisible(card, () => {
                    if (h3) { h3.style.opacity='1'; h3.style.transform='translateY(0)'; }
                    if (p)  { p.style.opacity='1';  p.style.transform='translateY(0)'; }
                    if (a)  { a.style.opacity='1';  a.style.transform='translateY(0)'; }
                }, 0.2);

                obs.observe(card);
            });
        }

        // 3b. Services details page hydration
        data.forEach(service => {
            const block = document.getElementById(service.id);
            if (!block) return;

            const leadEl = block.querySelector('.service-lead');
            if (leadEl) leadEl.textContent = service.description;

            const gridEl = document.getElementById(`grid-${service.id}`);
            if (gridEl) {
                gridEl.innerHTML = (service.subServices || []).map(sub => `
                    <div class="sub-item">
                        <h4>${sub.title}</h4>
                        <p>${sub.description}</p>
                    </div>
                `).join('');
            }
        });
    }

    // 4. Hydrate Testimonials
    async function hydrateTestimonials() {
        const section = document.querySelector('.testimonials');
        if (!section) return;

        const data = await safeFetch('/data/testimonials.json');
        if (!data || data.length === 0) return;

        // 4a. Hydrate Featured Review
        const featured = data.find(t => t.isFeatured);
        const featCard = section.querySelector('.t-card.featured');
        if (featured && featCard) {
            const quoteEl = featCard.querySelector('.quote');
            const authorEl = featCard.querySelector('.t-author strong');
            const roleEl = featCard.querySelector('.t-author span');
            const imgEl = featCard.querySelector('.t-video-placeholder img');

            if (quoteEl) quoteEl.textContent = `"${featured.quote}"`;
            if (authorEl) authorEl.textContent = featured.authorName;
            if (roleEl) roleEl.textContent = `${featured.designation} at ${featured.company}`;
            if (imgEl && featured.authorImage) imgEl.src = featured.authorImage;
        }

        // 4b. Hydrate standard reviews grid
        const rightGrid = section.querySelector('.t-grid-right');
        if (rightGrid) {
            const standardReviews = data.filter(t => !t.isFeatured);
            rightGrid.innerHTML = standardReviews.map(test => `
                <div class="t-card small reveal" style="height: 380px; display: flex; flex-direction: column; background: linear-gradient(135deg, #fdfdff 0%, #f4f6fc 100%); border: 1px solid rgba(78, 47, 218, 0.12); margin-bottom: 2rem;">
                    <div style="margin-bottom: 1.2rem; display: flex; align-items: center; justify-content: flex-start; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(78, 47, 218, 0.05);">
                        ${test.companyLogo ? `<img src="${test.companyLogo}" alt="${test.company} Logo" style="height: 48px; width: auto; max-width: 140px; object-fit: contain; border-radius: 4px;" />` : `<h4 style="color:var(--color-navy); font-weight:700;">${test.company}</h4>`}
                    </div>
                    <div class="quote" style="flex: 1; overflow-y: auto; padding-right: 10px; margin-bottom: 1rem; font-style: normal; font-size: 1rem; line-height: 1.6; scrollbar-width: thin; text-align: left;">
                        <p>${test.quote}</p>
                    </div>
                    <div class="t-author" style="margin-top: auto; padding-top: 0.8rem; text-align: left;">
                        <div>
                            <strong style="font-size: 0.9rem; display: block; color: var(--color-purple);">${test.authorName}</strong>
                            <span style="font-size: 0.75rem; color: var(--color-text-muted)">${test.designation}, ${test.company}</span>
                        </div>
                    </div>
                </div>
            `).join('');

            // Re-apply slide reveals observers
            rightGrid.querySelectorAll('.t-card').forEach(card => {
                obs.observe(card);
            });
        }
    }

    // 5. Hydrate About Us Page
    async function hydrateAbout() {
        const subEl = document.getElementById('about-missionSubtitle');
        const titEl = document.getElementById('about-missionTitle');
        const desEl = document.getElementById('about-missionDescription');

        if (!subEl && !document.getElementById('founder-name')) return;

        const data = await safeFetch('/data/about.json');
        if (!data) return;

        if (subEl && data.missionSubtitle) subEl.textContent = data.missionSubtitle;
        if (titEl && data.missionTitle) titEl.textContent = data.missionTitle;
        if (desEl && data.missionDescription) desEl.textContent = data.missionDescription;

        // Founder specific fields
        const imgEl = document.getElementById('founder-img');
        const nameEl = document.getElementById('founder-name');
        const titleEl = document.getElementById('founder-title');
        const locEl = document.getElementById('founder-location');
        const headEl = document.getElementById('founder-headline');
        const bioEl = document.getElementById('founder-bio');
        const accEl = document.getElementById('founder-accolades');

        if (imgEl && data.founderImage) imgEl.src = data.founderImage;
        if (nameEl && data.founderName) nameEl.textContent = data.founderName;
        if (titleEl && data.founderTitle) titleEl.textContent = data.founderTitle;
        if (locEl && data.founderLocation) locEl.textContent = data.founderLocation;
        if (headEl && data.founderSummary) headEl.textContent = data.founderSummary;

        if (bioEl && data.founderAboutParagraphs) {
            bioEl.innerHTML = data.founderAboutParagraphs.map(p => `<p style="margin-bottom: 2rem">${p}</p>`).join('');
        }

        if (accEl && data.accolades) {
            accEl.innerHTML = data.accolades.map(acc => `
                <li style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1.5rem;">
                    <i class="fas fa-balance-scale" style="color: var(--color-purple); margin-top: 0.25rem"></i>
                    <span>${acc}</span>
                </li>
            `).join('');
        }
    }

    // 6. Hydrate Resources Page
    async function hydrateResources() {
        const calendarDesc = document.getElementById('res-calendar-desc');
        if (!calendarDesc) return;

        // 6a. Main Resources PPT
        const data = await safeFetch('/data/resources.json');
        if (data && data.length >= 2) {
            const cal = data.find(r => r.id === 'compliance-calendar') || data[0];
            const gui = data.find(r => r.id === 'startup-guide') || data[1];

            if (calendarDesc) calendarDesc.textContent = cal.description;
            const calView = document.getElementById('res-calendar-view');
            const calDl = document.getElementById('res-calendar-dl');
            if (calView) calView.setAttribute('onclick', `openPPT('${cal.file}', '${cal.title}')`);
            if (calDl) { calDl.href = cal.file; }

            const guideDesc = document.getElementById('res-guide-desc');
            if (guideDesc) guideDesc.textContent = gui.description;
            const guiView = document.getElementById('res-guide-view');
            const guiDl = document.getElementById('res-guide-dl');
            if (guiView) guiView.setAttribute('onclick', `openPPT('${gui.file}', '${gui.title}')`);
            if (guiDl) { guiDl.href = gui.file; }
        }

        // 6b. Glossary Terminology List
        const glossEl = document.getElementById('list-glossary');
        if (glossEl) {
            const glossary = await safeFetch('/data/glossary.json');
            if (glossary && glossary.length > 0) {
                glossEl.innerHTML = glossary.map(item => `
                    <div class="glossary-item">
                        <dt>${item.term}</dt>
                        <dd>${item.definition}</dd>
                    </div>
                `).join('');
            }
        }

        // 6c. Expert Tips & Guides Bento
        const tipsEl = document.getElementById('grid-expert-tips');
        const toolEl = document.getElementById('grid-startup-toolkits');

        const tips = await safeFetch('/data/tips.json');
        if (tips) {
            if (tipsEl && tips.expertTips) {
                tipsEl.innerHTML = tips.expertTips.map((tip, idx) => `
                    <div class="bento-item reveal stagger-${idx + 1}">
                        <i class="${tip.icon}"></i>
                        <h4>${tip.title}</h4>
                        <p>${tip.description}</p>
                    </div>
                `).join('');
                
                // Rebind scroll observation
                tipsEl.querySelectorAll('.bento-item').forEach(item => obs.observe(item));
            }
            if (toolEl && tips.startupToolkits) {
                toolEl.innerHTML = tips.startupToolkits.map((tool, idx) => `
                    <div class="bento-item reveal stagger-${idx + 1}">
                        <i class="${tool.icon}"></i>
                        <h4>${tool.title}</h4>
                        <p>${tool.description}</p>
                    </div>
                `).join('');
                
                // Rebind scroll observation
                toolEl.querySelectorAll('.bento-item').forEach(item => obs.observe(item));
            }
        }
    }

    // Launch page-wide dynamic data loads
    hydrateHero();
    hydrateEvents();
    hydrateServices();
    hydrateTestimonials();
    hydrateAbout();
    hydrateResources();

});
