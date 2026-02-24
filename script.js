// ============================================
//  SPACE PORTFOLIO — SCRIPTS v4
// ============================================

// ---- Page Loader ----
window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) { loader.classList.add('hidden'); setTimeout(() => loader.remove(), 600); }
});

// ---- Starfield + Shooting Stars ----
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, stars = [], shootingStars = [];
  const STAR_COUNT = 280;

  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.0015 + 0.0005,
      phase: Math.random() * Math.PI * 2,
    });
  }

  let scrollOffset = 0;
  window.addEventListener('scroll', () => { scrollOffset = window.pageYOffset * 0.03; }, { passive: true });

  // Shooting stars
  function spawnShootingStar() {
    const x = Math.random() * w * 0.7 + w * 0.15;
    const y = Math.random() * h * 0.5;
    const angle = Math.PI * 0.2 + Math.random() * 0.3;
    shootingStars.push({ x, y, angle, len: 60 + Math.random() * 80, speed: 8 + Math.random() * 6, life: 1, decay: 0.015 + Math.random() * 0.01 });
    setTimeout(spawnShootingStar, 3000 + Math.random() * 5000);
  }
  setTimeout(spawnShootingStar, 2000);

  function draw(time) {
    ctx.clearRect(0, 0, w, h);
    // Stars
    stars.forEach(s => {
      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(time * s.speed + s.phase));
      const sy = ((s.y - scrollOffset * (0.5 + s.r * 0.5)) % h + h) % h;
      const sx = ((s.x + Math.sin(time * 0.0002 + s.phase) * 1.5) % w + w) % w;
      ctx.beginPath(); ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${twinkle * 0.85})`; ctx.fill();
      if (s.r > 1.1) { ctx.beginPath(); ctx.arc(sx, sy, s.r * 3, 0, Math.PI * 2); ctx.fillStyle = `rgba(180,210,255,${twinkle * 0.06})`; ctx.fill(); }
    });
    // Shooting stars
    shootingStars = shootingStars.filter(ss => {
      ss.life -= ss.decay;
      if (ss.life <= 0) return false;
      const dx = Math.cos(ss.angle) * ss.len;
      const dy = Math.sin(ss.angle) * ss.len;
      const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x + dx, ss.y + dy);
      grad.addColorStop(0, `rgba(255,255,255,0)`);
      grad.addColorStop(0.4, `rgba(200,220,255,${ss.life * 0.6})`);
      grad.addColorStop(1, `rgba(255,255,255,${ss.life * 0.9})`);
      ctx.beginPath(); ctx.moveTo(ss.x, ss.y); ctx.lineTo(ss.x + dx, ss.y + dy);
      ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.stroke();
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      return true;
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

// ---- Cursor Glow Trail ----
(function initCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, { passive: true });
})();

// ---- Mouse-Position Card Glare ----
(function initCardGlare() {
  document.querySelectorAll('.glass, .subcard, .exp-card').forEach(card => {
    if (!card.querySelector('.card-glare')) {
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      card.appendChild(glare);
    }
  });
  document.addEventListener('mousemove', e => {
    document.querySelectorAll('.glass, .subcard, .exp-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--gx', x + '%');
      card.style.setProperty('--gy', y + '%');
    });
  }, { passive: true });
})();

// ---- Parallax Background ----
(function initParallaxBg() {
  const bgLayer = document.querySelector('.bg-scroll-layer');
  if (!bgLayer) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(() => { bgLayer.style.transform = `translateY(${window.pageYOffset * -0.1}px)`; ticking = false; }); ticking = true; }
  }, { passive: true });
})();

// ---- Scroll Reveal ----
(function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale');
  const sectionHeaders = document.querySelectorAll('.section-header');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  reveals.forEach(el => observer.observe(el));
  sectionHeaders.forEach(el => observer.observe(el));
})();

// ---- Animated Counters ----
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = '1';
        const target = parseInt(entry.target.dataset.count, 10);
        const suffix = entry.target.dataset.suffix || '';
        let current = 0;
        const step = () => {
          current++; entry.target.textContent = current + suffix;
          if (current < target) requestAnimationFrame(step);
        };
        step();
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
})();

// ---- 3D Tilt Effect ----
(function initTilt() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

// ---- Navbar Scroll + Sliding Bubble ----
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const buttons = document.querySelectorAll('.nav-item');
  const bubble = document.getElementById('navBubble');
  const sections = document.querySelectorAll('section[id]');

  // Scroll class and Scroll-driven Logo Color
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', scrollY > 30);

    // Update logo color based on scroll distance (moves faster and loops)
    const logo = document.querySelector('.nav-logo');
    if (logo) {
      // Shift background 15% for every 100px scrolled
      logo.style.setProperty('--scroll-prog', (scrollY * 0.15) + '%');
    }
  }, { passive: true });

  // Bubble positioning
  function moveBubble(btn) {
    if (!bubble || !btn) return;
    const li = btn.closest('li');
    if (!li) return;
    bubble.style.width = li.offsetWidth + 'px';
    bubble.style.transform = `translateX(${li.offsetLeft}px)`;
  }

  // Click nav
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.section);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      moveBubble(btn);
    });
  });

  // Active section detection
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        buttons.forEach(b => {
          b.classList.toggle('active', b.dataset.section === id);
          if (b.dataset.section === id) moveBubble(b);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-20% 0px -50% 0px' });
  sections.forEach(s => sectionObserver.observe(s));

  // Initial position
  const active = document.querySelector('.nav-item.active');
  if (active) setTimeout(() => moveBubble(active), 200);
})();

// ---- Buttons ----
(function initButtons() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousedown', function () { this.style.transform = 'scale(0.95)'; });
    btn.addEventListener('mouseup', function () { this.style.transform = ''; });
  });
})();

// ---- Typing Effect ----
(function initTyping() {
  const el = document.getElementById('heroTagline');
  if (!el) return;
  const text = el.dataset.text;
  if (!text) return;
  el.textContent = '';
  let i = 0;
  function type() {
    if (i < text.length) { el.textContent += text[i]; i++; setTimeout(type, 50); }
  }
  setTimeout(type, 800);
})();

// ---- Interactive News Timeline ----
(function initNewsTimeline() {
  const newsItems = document.querySelectorAll('.news-item');
  const beamTraveler = document.querySelector('.beam-traveler');
  const timeline = document.querySelector('.news-timeline');
  const newsSection = document.getElementById('news');
  if (!newsItems.length || !beamTraveler || !timeline || !newsSection) return;

  let currentActiveIndex = -1;
  let revealed = false;

  // -- Staggered entrance when section first scrolls in --
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !revealed) {
        revealed = true;
        newsItems.forEach((item, i) => {
          setTimeout(() => {
            item.classList.add('news-revealed');
          }, i * 120);
        });
        // Set first item active after entrance animation
        setTimeout(() => {
          setActive(0);
          updateBeamPosition(0);
        }, 200);
        sectionObserver.disconnect();
      }
    });
  }, { threshold: 0.1 });
  sectionObserver.observe(newsSection);

  // -- Set the active item by index (sequential, never skips) --
  function setActive(index) {
    index = Math.max(0, Math.min(index, newsItems.length - 1));
    if (index === currentActiveIndex) return;
    currentActiveIndex = index;
    newsItems.forEach((item, i) => {
      if (i === index) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // -- Update beam traveler position smoothly --
  function updateBeamPosition(index) {
    const timelineRect = timeline.getBoundingClientRect();
    const itemRect = newsItems[index].getBoundingClientRect();
    // Position beam at the center of the active item relative to the timeline
    const centerY = (itemRect.top + itemRect.height / 2) - timelineRect.top;
    beamTraveler.style.top = (centerY - 30) + 'px';
  }

  // -- Scroll handler: determine which item should be active --
  function onScroll() {
    const viewportCenter = window.innerHeight * 0.45;
    let closestIndex = 0;
    let closestDist = Infinity;

    newsItems.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const dist = Math.abs(itemCenter - viewportCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    });

    setActive(closestIndex);
    updateBeamPosition(closestIndex);
  }

  // -- Throttled scroll listener at ~60fps --
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

// ---- News Modal ----
(function initNewsModal() {
  const btn = document.getElementById('newsViewMoreBtn');
  const modal = document.getElementById('newsModal');
  const close = document.getElementById('newsModalClose');
  if (!btn || !modal || !close) return;

  btn.addEventListener('click', () => modal.classList.add('active'));
  close.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.remove('active');
  });
})();
