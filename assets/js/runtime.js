/* ================================================================
   HAREM SZALEŃCA — RUNTIME
   Preloader · Custom Cursor · Particles · Reveals · Shaders
   ================================================================ */

(() => {
  'use strict';

  /* ============== PRELOADER ============== */
  function initPreloader() {
    const preloader = document.querySelector('.preloader');
    if (!preloader) return;
    const path = preloader.querySelector('.star-path');
    if (path) {
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      requestAnimationFrame(() => {
        path.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(0.16, 1, 0.3, 1)';
        path.style.strokeDashoffset = '0';
      });
    }
    // Szybki intro — błyskawiczne ładowanie
    setTimeout(() => preloader.classList.add('reveal'), 200);
    setTimeout(() => {
      preloader.classList.add('done');
      document.body.classList.add('loaded');
    }, 500);
  }

  /* ============== CUSTOM CURSOR ============== (WYŁĄCZONE — zwykły wskaźnik) */
  function initCursor() {
    // Wyłączony custom cursor — user chce standardowy wskaźnik myszy
    document.documentElement.style.cursor = 'auto';
    document.body.style.cursor = 'auto';
    return;
    // legacy — nieużywany
    if (matchMedia('(max-width: 768px)').matches) return;
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.append(cursor, ring);

    let cx = 0, cy = 0, rx = 0, ry = 0;
    let tx = 0, ty = 0;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
    });

    function loop() {
      cx += (tx - cx) * 0.32;
      cy += (ty - cy) * 0.32;
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      cursor.style.transform = `translate(${cx - 4}px, ${cy - 4}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();

    const activate = () => ring.classList.add('active');
    const deactivate = () => ring.classList.remove('active');
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .tome-card, .shadow-card, .topo-hotspot, .btn-imperial, .btn-conv')) activate();
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, .tome-card, .shadow-card, .topo-hotspot, .btn-imperial, .btn-conv')) deactivate();
    });
  }

  /* ============== ZŁOTY PYŁ (canvas particles) ============== */
  function initParticles() {
    const canvas = document.querySelector('.particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    });

    const COUNT = 55;
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18 - 0.05,
        size: Math.random() * 2 + 1.4,
        alpha: Math.random() * 0.05 + 0.02,
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    let mx = -1000, my = -1000;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

    function drawOctagon(x, y, r) {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    function tick() {
      if (document.hidden) { requestAnimationFrame(tick); return; }
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const dpr = window.devicePixelRatio || 1;
      for (const p of particles) {
        // Magnetism (repel from cursor)
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80 && dist > 0) {
          const force = (80 - dist) / 80 * 0.4;
          p.vx += (dx / dist) * force * 0.05;
          p.vy += (dy / dist) * force * 0.05;
        }
        p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy;
        p.twinkle += 0.012;
        if (p.x < -10) p.x = window.innerWidth + 10;
        if (p.x > window.innerWidth + 10) p.x = -10;
        if (p.y < -10) p.y = window.innerHeight + 10;
        if (p.y > window.innerHeight + 10) p.y = -10;
        const a = p.alpha * (0.5 + 0.5 * Math.sin(p.twinkle));
        ctx.fillStyle = `rgba(212, 175, 55, ${a})`;
        drawOctagon(p.x, p.y, p.size);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ============== JEDWABNA MGŁA — WebGL shader ============== */
  function initSilkShader(canvasEl, palette = 'noir') {
    if (!canvasEl) return;
    // failIfMajorPerformanceCaveat: true — przeglądarka ODMÓWI stworzenia
    // kontekstu, jeśli dostępny jest tylko software rendering (SwiftShader/
    // LLVMpipe, brak realnego GPU), zamiast wolno go tworzyć i renderować
    // programowo (co realnie zamulało całą stronę na słabszych maszynach/
    // VM/sesjach zdalnych). Zostaje wtedy tylko CSS fallback (patrz .bg-canvas
    // w imperium.css) — wizualnie bardzo zbliżony, zero ryzyka zawieszenia.
    const glOpts = { failIfMajorPerformanceCaveat: true };
    const gl = canvasEl.getContext('webgl', glOpts) || canvasEl.getContext('experimental-webgl', glOpts);
    if (!gl) return; // brak GPU lub tylko software — canvas zostaje przezroczysty

    // Dodatkowa asekuracja: część przeglądarek honoruje flagę tylko częściowo
    // i wciąż zgłasza software renderer — w takim wypadku też się wycofujemy.
    try {
      const dbgInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (dbgInfo) {
        const renderer = gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL) || '';
        if (/swiftshader|llvmpipe|software/i.test(renderer)) {
          return;
        }
      }
    } catch (e) { /* ignoruj — kontynuuj normalnie */ }

    const palettes = {
      noir:   { a: [0.020, 0.020, 0.031], b: [0.084, 0.110, 0.184], c: [0.420, 0.115, 0.184] },
      gold:   { a: [0.020, 0.020, 0.031], b: [0.420, 0.115, 0.184], c: [0.788, 0.659, 0.298] },
      water:  { a: [0.020, 0.020, 0.031], b: [0.040, 0.060, 0.090], c: [0.788, 0.659, 0.298] },
    };
    const P = palettes[palette] || palettes.noir;

    const vert = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;
    const frag = `
      precision highp float;
      uniform vec2 u_res;
      uniform float u_t;
      uniform vec3 u_a;
      uniform vec3 u_b;
      uniform vec3 u_c;

      // 2D noise
      vec2 hash(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(dot(hash(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
              dot(hash(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
          mix(dot(hash(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
              dot(hash(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x),
          u.y
        );
      }
      float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.0; a *= 0.5;
        }
        return v;
      }
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        vec2 p = uv * 2.5;
        float t = u_t * 0.03;
        vec2 q = vec2(fbm(p + t), fbm(p - t));
        vec2 r = vec2(fbm(p + 1.5 * q + vec2(1.7, 9.2) + t * 0.5),
                      fbm(p + 1.5 * q + vec2(8.3, 2.8) + t * 0.3));
        float f = fbm(p + r);
        vec3 col = mix(u_a, u_b, smoothstep(-0.2, 0.6, f));
        col = mix(col, u_c, smoothstep(0.4, 1.0, length(r)));
        col *= 1.1;
        // Vignette
        float vig = smoothstep(1.4, 0.4, length(uv - 0.5));
        col *= vig;
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }
    const vs = compile(gl.VERTEX_SHADER, vert);
    const fs = compile(gl.FRAGMENT_SHADER, frag);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uT = gl.getUniformLocation(prog, 'u_t');
    const uA = gl.getUniformLocation(prog, 'u_a');
    const uB = gl.getUniformLocation(prog, 'u_b');
    const uC = gl.getUniformLocation(prog, 'u_c');

    gl.uniform3fv(uA, P.a);
    gl.uniform3fv(uB, P.b);
    gl.uniform3fv(uC, P.c);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvasEl.clientWidth * dpr;
      const h = canvasEl.clientHeight * dpr;
      if (canvasEl.width !== w || canvasEl.height !== h) {
        canvasEl.width = w; canvasEl.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
      }
    }

    const start = performance.now();
    let isVisible = true; // domyślnie true, IO poprawi po pierwszym callbacku
    let rafId = null;
    const FRAME_MS = 1000 / 30; // throttle do ~30fps — shader jest tłem, nie wymaga 60fps
    let lastFrame = 0;
    let firstFrameDone = false;

    function frame(now) {
      rafId = requestAnimationFrame(frame);
      if (!isVisible) return;
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;
      resize();
      gl.uniform1f(uT, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!firstFrameDone) {
        firstFrameDone = true;
        // Shader realnie renderuje — teraz można bezpiecznie wygasić CSS
        // fallback (gradient) pod spodem, canvas przejmuje rolę tła.
        canvasEl.classList.add('bg-canvas--gl');
      }
    }
    rafId = requestAnimationFrame(frame);

    // Renderuj tylko gdy canvas jest w viewporcie (lub blisko niego) —
    // zapobiega zamuleniu CPU/GPU przez wiele równoległych shaderów offscreen
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { isVisible = e.isIntersecting; });
      }, { rootMargin: '200px 0px 200px 0px', threshold: 0 });
      io.observe(canvasEl);
    }
    // Pauza całkowita gdy karta w tle (np. przełączenie zakładki)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) isVisible = false;
    });
  }

  /* ============== REVEAL ON SCROLL ============== */
  function initReveal() {
    const els = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ============== MUZYKA W TLE ============== */
  function initMusic() {
    const audio = document.getElementById('bgMusic');
    const btn = document.getElementById('musicToggle');
    if (!audio || !btn) return;

    const TARGET_VOLUME = 0.35; // odpowiedni poziom głośności — ambient, nie dominujący
    const STORAGE_KEY = 'hsMusicMuted';
    audio.volume = 0;

    let userMuted = false;
    try {
      userMuted = localStorage.getItem(STORAGE_KEY) === '1';
    } catch (_) { /* localStorage niedostępny (np. Safari private mode) — ignoruj */ }

    function fadeVolumeTo(target, duration = 900) {
      const start = audio.volume;
      const startTime = performance.now();
      function step(now) {
        const t = Math.min(1, (now - startTime) / duration);
        audio.volume = start + (target - start) * t;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function setUIState(playing, muted) {
      btn.classList.toggle('is-playing', playing && !muted);
      btn.classList.toggle('is-muted', muted || !playing);
      btn.setAttribute('aria-pressed', (!muted && playing) ? 'true' : 'false');
    }

    function persistMuted(val) {
      try { localStorage.setItem(STORAGE_KEY, val ? '1' : '0'); } catch (_) {}
    }

    function tryAutoplay() {
      if (userMuted) {
        setUIState(false, true);
        return;
      }
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => {
          fadeVolumeTo(TARGET_VOLUME, 1400);
          setUIState(true, false);
        }).catch(() => {
          // Przeglądarka zablokowała autoplay z dźwiękiem (typowa polityka mobile/Chrome/Safari) —
          // czekamy na pierwszą interakcję użytkownika (klik/tap/scroll/klawisz) i wtedy startujemy.
          setUIState(false, false);
          const resume = () => {
            if (userMuted) { cleanup(); return; }
            audio.play().then(() => {
              fadeVolumeTo(TARGET_VOLUME, 1400);
              setUIState(true, false);
            }).catch(() => {});
            cleanup();
          };
          function cleanup() {
            window.removeEventListener('pointerdown', resume);
            window.removeEventListener('keydown', resume);
            window.removeEventListener('scroll', resume);
          }
          window.addEventListener('pointerdown', resume, { once: true, passive: true });
          window.addEventListener('keydown', resume, { once: true });
          window.addEventListener('scroll', resume, { once: true, passive: true });
        });
      }
    }

    btn.addEventListener('click', () => {
      if (audio.paused || userMuted) {
        userMuted = false;
        persistMuted(false);
        audio.play().then(() => {
          fadeVolumeTo(TARGET_VOLUME, 700);
          setUIState(true, false);
        }).catch(() => {});
      } else {
        userMuted = true;
        persistMuted(true);
        fadeVolumeTo(0, 500);
        setTimeout(() => { if (userMuted) audio.pause(); }, 520);
        setUIState(false, true);
      }
    });

    // Wstrzymaj muzykę gdy karta w tle, wznów po powrocie (jeśli nie wyciszona ręcznie)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        audio.pause();
      } else if (!userMuted && audio.paused) {
        audio.play().then(() => fadeVolumeTo(TARGET_VOLUME, 800)).catch(() => {});
      }
    });

    tryAutoplay();
  }

  /* ============== NAV SCROLL STATE ============== */
  function initNav() {
    const nav = document.querySelector('.imperial-nav');
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 60) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============== PARALLAX ============== */
  function initParallax() {
    const els = document.querySelectorAll('[data-parallax]');
    function onScroll() {
      const sy = window.scrollY;
      els.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        const rect = el.getBoundingClientRect();
        const top = rect.top + sy;
        const offset = (sy - top) * speed;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============== HORIZONTAL SCROLL-JACK (Tetralogia) ============== */
  function initTetraScroll() {
    const section = document.querySelector('.tetra-scroll');
    if (!section) return;
    const track = section.querySelector('#tetraTrack');
    const fill = section.querySelector('#tetraFill');
    const curEl = section.querySelector('#tetraCur');
    const labelEl = section.querySelector('#tetraLabel');
    if (!track) return;
    const panels = track.querySelectorAll('.tetra-panel');
    const panelCount = panels.length;
    const labels = ['Kafes', 'Tron', 'Otchłań', 'Upadek'];

    // skip on mobile (stacked)
    if (matchMedia('(max-width: 1000px)').matches) return;

    let curIdx = 0;

    function update() {
      const rect = section.getBoundingClientRect();
      const sectionHeight = rect.height;
      const viewportHeight = window.innerHeight;
      const scrollableDist = sectionHeight - viewportHeight;
      // progress 0..1 while section is being scrolled through
      const progressRaw = -rect.top / scrollableDist;
      const progress = Math.max(0, Math.min(1, progressRaw));

      // Track translateX: 0% at start → -(panelCount-1) * 100vw at end
      const maxShiftVw = (panelCount - 1) * 100;
      const shift = -progress * maxShiftVw;
      track.style.transform = `translate3d(${shift}vw, 0, 0)`;

      // Progress bar fill
      if (fill) fill.style.width = (progress * 100).toFixed(1) + '%';

      // Current panel idx (snap to nearest)
      const newIdx = Math.min(panelCount - 1, Math.round(progress * (panelCount - 1)));
      if (newIdx !== curIdx) {
        curIdx = newIdx;
        if (curEl) curEl.textContent = '0' + (newIdx + 1);
        if (labelEl) labelEl.textContent = labels[newIdx] || '';
      }

      // Per-panel 3D book tilt based on position
      panels.forEach((panel, i) => {
        const book = panel.querySelector('.book3d');
        if (!book) return;
        // each panel spans 1/(N-1) of progress
        const localProgress = progress * (panelCount - 1) - i; // -inf..1..+inf, ~0 means centered
        const tilt = -22 + localProgress * 18; // tilt swings
        book.style.transform = `rotateY(${tilt}deg) rotateX(${4 - Math.abs(localProgress) * 2}deg)`;
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ============== DRAMATIS — HORIZONTAL SCROLL (Cienie Pałacu) ==============
     Sekcja "Cienie Pałacu" (10 kart) — kółko myszy nad torem kart przesuwa
     karty w bok (konwersja wheel deltaY → scrollLeft), 1:1, bez cooldownu.
     Listener jest PODCZEPIONY NA .dramatis-track-wrap (nie na window), więc
     działa dokładnie wtedy, gdy kursor jest nad sekcją — bez żadnego
     "czy sekcja jest wycentrowana" viewport-checku. Na krawędziach (pierwsza/
     ostatnia karta) puszczamy naturalny scroll strony (brak preventDefault),
     więc można swobodnie wyjechać z sekcji w dół/górę.
     Dodatkowo: drag myszką i swipe (touch, natywny) bezpośrednio na torze.
     ============================================================= */
  function initDramatis() {
    const wrap = document.querySelector('.dramatis-track-wrap');
    if (!wrap) return;
    window.__dramatisInited = 'started';
    try {
      const fill = document.querySelector('#dramatisFill');
      const currentEl = document.querySelector('#dramatisCurrent');
      const totalEl = document.querySelector('#dramatisTotal');
      const track = document.querySelector('#dramatisTrack');
      const cards = track ? track.children : [];
      const cardCount = cards.length;
      if (totalEl && cardCount > 0) totalEl.textContent = String(cardCount);

      // Progress bar + counter — aktualizowane na natywny scroll wewnątrz wrap
      function updateProgress() {
        const max = wrap.scrollWidth - wrap.clientWidth;
        if (max <= 0) return;
        const p = Math.min(1, Math.max(0, wrap.scrollLeft / max));
        if (fill) fill.style.width = (p * 100).toFixed(1) + '%';
        if (currentEl && cardCount > 0) {
          const idx = Math.min(cardCount, Math.max(1, Math.round(p * (cardCount - 1)) + 1));
          currentEl.textContent = String(idx);
        }
      }
      wrap.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();

      // WHEEL → HORIZONTAL SCROLL (scoped na .dramatis-track-wrap, NIE window).
      // Aktywuje się precyzyjnie wtedy, gdy kursor jest nad torem kart — bez
      // żadnego "czy sekcja jest wycentrowana" viewport-checku (fragile, dawał
      // uczucie "trzeba przewinąć dwa razy"). Płynne mapowanie 1:1, zero
      // cooldownu/throttle — każdy tik kółka/trackpada jest respektowany od
      // razu. Na krawędziach (początek/koniec toru) NIE wołamy preventDefault,
      // więc naturalny scroll strony przejmuje kontrolę i można wyjechać z
      // sekcji dalej w dół / wrócić w górę bez żadnego "zawieszenia".
      wrap.addEventListener('wheel', (e) => {
        const delta = e.deltaY;
        if (delta === 0) return;
        const max = wrap.scrollWidth - wrap.clientWidth;
        if (max <= 0) return; // brak overflow — nic do przewijania
        const atStart = wrap.scrollLeft <= 0;
        const atEnd = wrap.scrollLeft >= max - 1;
        if ((atStart && delta < 0) || (atEnd && delta > 0)) {
          return; // krawędź — puszczamy naturalny scroll strony
        }
        e.preventDefault();
        // scrollTo() (nie zwykłe przypisanie scrollLeft +=) — to jedyny sposób,
        // żeby przewijanie realnie ruszało przy KAŻDYM, nawet najmniejszym
        // ruchu kółka myszy. BEZ żadnego auto-snap/auto-centrowania po ruchu —
        // wcześniejsza wersja z "dośrodkowaniem karty po zatrzymaniu scrolla"
        // powodowała, że po jednym małym ruchu myszką tor odjeżdżał, a potem
        // sam wracał do tej samej karty, co wyglądało jak "scroll nie działa".
        // Teraz przewijanie jest w 100% swobodne — jedzie tam, gdzie user
        // przewinie, bez żadnego przyciągania z powrotem.
        wrap.scrollTo({ left: wrap.scrollLeft + delta, behavior: 'auto' });
      }, { passive: false });

      // DRAG myszką — działa tylko wewnątrz toru kart, NIE wpływa na scroll strony
      let isDown = false, startX = 0, scrollLeftStart = 0, dragMoved = false;
      wrap.addEventListener('mousedown', (e) => {
        isDown = true;
        dragMoved = false;
        wrap.style.cursor = 'grabbing';
        startX = e.pageX;
        scrollLeftStart = wrap.scrollLeft;
      });
      window.addEventListener('mouseup', () => {
        isDown = false;
        wrap.style.cursor = 'grab';
      });
      window.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const dx = e.pageX - startX;
        if (Math.abs(dx) > 3) dragMoved = true;
        if (!dragMoved) return;
        e.preventDefault();
        wrap.scrollTo({ left: scrollLeftStart - dx * 1.4, behavior: 'auto' });
      });

      window.__dramatisInited = true;
    } catch (err) {
      console.error('[dramatis] init failed:', err);
      window.__dramatisInited = 'error:' + (err && err.message ? err.message : String(err));
    }
  }

  /* ============== BOOT ============== */
  function boot() {
    initPreloader();
    initCursor();
    initParticles();
    initMusic();
    initNav();
    initReveal();
    initParallax();
    initDramatis();
    // initLazyShaders() — WYŁĄCZONE CAŁKOWICIE.
    // Zmierzony realny czas samego canvas.getContext('webgl', {...}) na
    // maszynie bez sprzętowego GPU (VM / sesja zdalna / słabe sterowniki —
    // dokładnie to zgłosił użytkownik): ~7-8 sekund, ZANIM jakikolwiek
    // shader zaczął się renderować. To wywołanie jest synchroniczne i nie
    // da się go "przetimeoutować" z JS ani ominąć flagą
    // failIfMajorPerformanceCaveat (część przeglądarek/GPU stacków ją
    // ignoruje). Efekt wizualny ("jedwabna mgła") jest subtelnym tłem
    // (opacity 0.25-0.55) — nie jest wart ryzyka zawieszenia strony u
    // nieznanego % odwiedzających. CSS fallback (.bg-canvas gradient w
    // imperium.css) daje bardzo zbliżony nastrój i renderuje się od razu,
    // bez żadnego ryzyka. Kod shadera zostaje w pliku (nieużywany) —
    // można go bezpiecznie przywrócić w przyszłości pod jawnym opt-in
    // (np. przełącznik w ustawieniach), ale NIE jako default-on.
  }

  /* ============== LAZY SHADER INIT (NIEUŻYWANE — patrz komentarz w boot()) === */
  function initLazyShaders() {
    const canvases = document.querySelectorAll('[data-shader]');
    if (!canvases.length) return;
    if (!('IntersectionObserver' in window)) {
      // Brak wsparcia IO — fallback: inicjalizuj wszystkie (stare zachowanie)
      canvases.forEach(c => initSilkShader(c, c.dataset.shader));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const canvas = entry.target;
          io.unobserve(canvas);
          initSilkShader(canvas, canvas.dataset.shader);
        }
      });
    }, { rootMargin: '300px 0px 300px 0px', threshold: 0 });
    canvases.forEach(c => io.observe(c));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else boot();
})();
