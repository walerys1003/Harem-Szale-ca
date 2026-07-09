/* ================================================================
   CINEMATICS.JS — Web Awards level scroll dynamics
   6 zabiegów: scroll-driven parallax, pinned tetralogy fan,
   word-reveal, liquid-glass magnet, ambient particles, cursor mag.
   ================================================================ */
(function () {
  'use strict';
  const rMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (rMotion) return; // szacunek dla ustawień systemowych

  /* ============== 1. SCROLL-DRIVEN CINEMATIC ZOOM (manifest) ============== */
  function initManifestParallax() {
    const wrapper = document.querySelector('.manifest-wide-img');
    const img = wrapper && wrapper.querySelector('img');
    if (!wrapper || !img) return;

    // Obraz zaczyna zoomowany, gdy sekcja się przewija do środka — spokojnie się „ustawia"
    const state = { progress: 0, target: 0 };
    function onScroll() {
      const r = wrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 gdy sekcja wchodzi od dołu, 1 gdy wychodzi górą
      const raw = 1 - (r.top + r.height / 2) / vh;
      state.target = Math.max(0, Math.min(1, raw));
    }
    function loop() {
      state.progress += (state.target - state.progress) * 0.08;
      // scale: 1.15 → 1.0 → 1.08 (delikatny „oddech")
      const scale = 1.15 - state.progress * 0.15 + Math.max(0, state.progress - 0.7) * 0.27;
      // subtle translateY parallax
      const ty = (state.progress - 0.5) * 40;
      img.style.transform = `scale(${scale.toFixed(4)}) translate3d(0, ${ty.toFixed(2)}px, 0)`;
      requestAnimationFrame(loop);
    }
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    loop();
  }

  /* ============== 2. WORD-REVEAL SCROLL ANIMATION ============== */
  function initWordReveal() {
    const selectors = [
      '.mnfx-quote .mnfx-l',
      '.hero-hook-line',
      '.t-h1', '.t-h2', '.t-lead'
    ];
    const targets = document.querySelectorAll(selectors.join(','));
    if (!targets.length || !('IntersectionObserver' in window)) return;

    // Splituj tekst na słowa i wpakuj w <span class="w"> ... </span>
    targets.forEach((el) => {
      if (el.dataset.wordSplit) return;
      el.dataset.wordSplit = '1';
      const html = el.innerHTML;
      // Prosty split: nie dziel wewnątrz <em>/<span>/<br> — tylko topowego tekstu
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      const nodes = [];
      let node;
      while ((node = walker.nextNode())) nodes.push(node);
      nodes.forEach((n) => {
        const txt = n.nodeValue;
        if (!txt.trim()) return;
        const frag = document.createDocumentFragment();
        const parts = txt.split(/(\s+)/);
        parts.forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) {
            frag.appendChild(document.createTextNode(p));
          } else {
            const span = document.createElement('span');
            span.className = 'w';
            span.textContent = p;
            frag.appendChild(span);
          }
        });
        n.parentNode.replaceChild(frag, n);
      });
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const words = entry.target.querySelectorAll('.w');
          words.forEach((w, i) => {
            setTimeout(() => w.classList.add('in'), i * 55);
          });
          io.unobserve(entry.target);
        }
      });
    }, { threshold: [0, 0.05, 0.15, 0.35], rootMargin: '0px 0px -4% 0px' });

    targets.forEach((el) => io.observe(el));

    // Fallback: gdy IO nie firing (np. sekcja duża > viewport), użyj scroll listener
    let scrollFallbackDone = false;
    function checkVisible() {
      const vh = window.innerHeight;
      targets.forEach((el) => {
        if (el.dataset.wordDone) return;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.85 && r.bottom > vh * 0.1) {
          el.dataset.wordDone = '1';
          const words = el.querySelectorAll('.w');
          words.forEach((w, i) => setTimeout(() => w.classList.add('in'), i * 45));
        }
      });
    }
    document.addEventListener('scroll', checkVisible, { passive: true });
    checkVisible();
  }

  /* ============== 3. TETRALOGY 3D FAN SCROLL-PIN ============== */
  function initTetralogyFan() {
    const section = document.querySelector('.tetra-intro');
    const strip = section && (section.querySelector('.tetra-covers-strip') || section.querySelector('.tetra-intro-strip'));
    if (!section || !strip) return;

    // Wrap książek — złap covers wewnątrz strip
    const covers = strip.querySelectorAll('img');
    if (covers.length < 4) return;

    covers.forEach((img, i) => {
      img.style.transition = 'transform 0.9s cubic-bezier(.22,.61,.36,1), opacity 0.9s';
      img.style.willChange = 'transform, opacity';
    });

    const state = { progress: 0, target: 0 };
    function onScroll() {
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = 1 - (r.top + r.height / 2) / vh;
      state.target = Math.max(0, Math.min(1, raw));
    }
    function loop() {
      state.progress += (state.target - state.progress) * 0.09;
      covers.forEach((img, i) => {
        const centerIdx = 1.5;
        const dist = i - centerIdx; // -1.5, -0.5, 0.5, 1.5
        const p = state.progress;
        // Book „opens" — spread + tilt as scroll progresses
        const spread = p * 60 * dist; // px
        const rotY = (1 - p) * -18 * dist; // fan effect
        const rotZ = (1 - p) * -3 * dist;
        const z = (1 - p) * -50 * Math.abs(dist);
        const opacity = 0.5 + p * 0.5;
        img.style.transform = `perspective(1200px) translate3d(${spread}px, 0, ${z}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`;
        img.style.opacity = opacity.toFixed(3);
      });
      requestAnimationFrame(loop);
    }
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    loop();
  }

  /* ============== 4. HERO KENBURNS + MAGNETIC CTA ============== */
  function initHeroKenburns() {
    const heroTrio = document.querySelector('#heroTrioFrame img');
    if (!heroTrio) return;
    let t = 0;
    function loop() {
      t += 0.0018;
      const scale = 1.02 + Math.sin(t) * 0.02;
      const tx = Math.sin(t * 0.7) * 8;
      const ty = Math.cos(t * 0.9) * 6;
      heroTrio.style.transform = `scale(${scale}) translate3d(${tx}px, ${ty}px, 0)`;
      requestAnimationFrame(loop);
    }
    loop();
  }

  function initMagneticButtons() {
    const magnets = document.querySelectorAll('.btn-imperial, .btn-imperial-ghost, .btn-conv');
    if (!magnets.length) return;

    magnets.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate3d(${mx * 0.18}px, ${my * 0.18}px, 0)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  /* ============== 5. LIQUID-GLASS NAVBAR ON SCROLL ============== */
  function initGlassNav() {
    const nav = document.querySelector('.imperial-nav, .nav-imperial, nav.nav, .site-nav');
    if (!nav) return;
    function onScroll() {
      if (window.scrollY > 80) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
    }
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============== 7. CURSOR SPOTLIGHT (Hero — złota pochodnia) ============== */
  function initHeroSpotlight() {
    const hero = document.querySelector('#hero');
    if (!hero) return;
    if (matchMedia('(max-width: 900px)').matches) return; // desktop only
    const spot = document.createElement('div');
    spot.className = 'hero-spotlight';
    hero.appendChild(spot);

    let sx = window.innerWidth / 2, sy = window.innerHeight / 2;
    let tx = sx, ty = sy;
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    });
    function loop() {
      sx += (tx - sx) * 0.08;
      sy += (ty - sy) * 0.08;
      spot.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ============== 8. SECTION FADE-IN ON SCROLL ============== */
  function initSectionReveal() {
    const sections = document.querySelectorAll('section');
    if (!sections.length || !('IntersectionObserver' in window)) return;
    sections.forEach((s, i) => {
      if (i === 0) return; // pierwsza sekcja od razu widoczna
      s.classList.add('sec-reveal');
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('sec-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.sec-reveal').forEach((el) => io.observe(el));
  }

  /* ============== 9. GOLDEN STROKE UNDER H2 ============== */
  function initStrokeUnderline() {
    const heads = document.querySelectorAll('.t-h1, .t-h2');
    if (!heads.length || !('IntersectionObserver' in window)) return;
    heads.forEach((h) => {
      if (h.querySelector('.stroke-underline')) return;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'stroke-underline');
      svg.setAttribute('viewBox', '0 0 400 12');
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.innerHTML = '<path d="M0 6 C 80 2, 160 10, 240 6 S 380 2, 400 6" stroke="url(#soGrad)" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
        '<defs><linearGradient id="soGrad" x1="0" x2="1" y1="0" y2="0">' +
        '<stop offset="0" stop-color="rgba(212,175,55,0)"/>' +
        '<stop offset="0.5" stop-color="rgba(212,175,55,0.85)"/>' +
        '<stop offset="1" stop-color="rgba(212,175,55,0)"/>' +
        '</linearGradient></defs>';
      h.appendChild(svg);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('stroke-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    heads.forEach((h) => io.observe(h));
  }

  /* ============== 10. PERSONA HOVER AUREOLE — DISABLED (kicz, usunięte) ============== */
  function initPersonaAureole() {
    // Usuń istniejące aureole jeśli powstały we wcześniejszych wizytach
    document.querySelectorAll('.persona-aureole').forEach((el) => el.remove());
  }

  /* ============== 6. AMBIENT SCROLL PROGRESS INDICATOR ============== */
  function initScrollProgress() {
    let bar = document.querySelector('.scroll-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'scroll-progress';
      bar.innerHTML = '<span class="scroll-progress-fill"></span>';
      document.body.appendChild(bar);
    }
    const fill = bar.querySelector('.scroll-progress-fill');
    function onScroll() {
      const h = document.documentElement;
      const p = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
      fill.style.transform = `scaleX(${Math.max(0, Math.min(1, p))})`;
    }
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============== 13. HAMBURGER MOBILE MENU ============== */
  function initHamburger() {
    const btn = document.querySelector('#hamburgerBtn');
    const menu = document.querySelector('#mobileMenu');
    if (!btn || !menu) return;
    const links = menu.querySelectorAll('.mobile-menu-link');

    function open() {
      btn.classList.add('is-active');
      btn.setAttribute('aria-expanded', 'true');
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
    }
    function close() {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
    }
    function toggle() {
      if (menu.classList.contains('is-open')) close();
      else open();
    }

    btn.addEventListener('click', toggle);
    // Zamykaj przy kliknięciu w link
    links.forEach((a) => a.addEventListener('click', () => setTimeout(close, 200)));
    // Escape zamyka
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
    });
    // Zamykaj gdy przewinięto powyżej breakpoint (desktop)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && menu.classList.contains('is-open')) close();
    });
  }

  /* ============== BOOT ============== */
  function boot() {
    try { initManifestParallax(); } catch (e) { console.warn('[cin] parallax', e); }
    try { initWordReveal(); } catch (e) { console.warn('[cin] words', e); }
    // initTetralogyFan wyłączony — powoduje artefakty renderingu na okładkach PNG z transparent tłem
    try { initHeroKenburns(); } catch (e) { console.warn('[cin] kenburns', e); }
    try { initMagneticButtons(); } catch (e) { console.warn('[cin] magnet', e); }
    try { initGlassNav(); } catch (e) { console.warn('[cin] nav', e); }
    try { initScrollProgress(); } catch (e) { console.warn('[cin] progress', e); }
    try { initHeroSpotlight(); } catch (e) { console.warn('[cin] spot', e); }
    try { initSectionReveal(); } catch (e) { console.warn('[cin] secReveal', e); }
    try { initStrokeUnderline(); } catch (e) { console.warn('[cin] stroke', e); }
    try { initPersonaAureole(); } catch (e) { console.warn('[cin] aureole', e); }
    try { initHamburger(); } catch (e) { console.warn('[cin] hamburger', e); }
    window.__cinematicsBooted = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
