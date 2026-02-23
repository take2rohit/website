/* ============================================
   SPACE PORTFOLIO — SCRIPTS (v3)
   ============================================ */

// ---- Page Loader ----
window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 500);
    setTimeout(() => loader.remove(), 1100);
  }
});

// ---- Starfield Canvas with Shooting Stars ----
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, stars = [], shootingStars = [];
  const STAR_COUNT = 200;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Create static stars
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.001 + 0.0005,
      phase: Math.random() * Math.PI * 2,
      layer: Math.random()
    });
  }

  // Scroll parallax
  let scrollOffset = 0;
  window.addEventListener('scroll', () => { scrollOffset = window.pageYOffset; }, { passive: true });

  // Spawn small shooting stars randomly
  function spawnShootingStar() {
    shootingStars.push({
      x: Math.random() * w * 0.8,
      y: Math.random() * h * 0.6,
      len: 40 + Math.random() * 60,
      speed: 4 + Math.random() * 4,
      angle: (Math.PI / 6) + Math.random() * (Math.PI / 6), // 30-60 degrees
      life: 0,
      maxLife: 30 + Math.random() * 20,
      opacity: 0.6 + Math.random() * 0.4
    });
  }

  // Random interval for shooting stars (every 3-7 seconds)
  function scheduleShootingStar() {
    const delay = 3000 + Math.random() * 4000;
    setTimeout(() => {
      spawnShootingStar();
      scheduleShootingStar();
    }, delay);
  }
  scheduleShootingStar();
  // Start with 1 after a bit
  setTimeout(spawnShootingStar, 1500);

  function draw(time) {
    ctx.clearRect(0, 0, w, h);

    // Draw stars
    stars.forEach(s => {
      const twinkle = 0.5 + 0.5 * Math.abs(Math.sin(time * s.speed + s.phase));
      const parallaxFactor = 0.02 + s.layer * 0.04;
      const sy = ((s.y - scrollOffset * parallaxFactor) % h + h) % h;
      const sx = ((s.x + Math.sin(time * 0.0001 + s.phase) * 1.5) % w + w) % w;

      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${twinkle * 0.8})`;
      ctx.fill();

      // Subtle glow on bigger stars
      if (s.r > 1.1) {
        ctx.beginPath();
        ctx.arc(sx, sy, s.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,215,255,${twinkle * 0.04})`;
        ctx.fill();
      }
    });

    // Draw shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.life++;
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;

      const progress = ss.life / ss.maxLife;
      const alpha = ss.opacity * (progress < 0.3 ? progress / 0.3 : (1 - progress) / 0.7);

      const tailX = ss.x - Math.cos(ss.angle) * ss.len;
      const tailY = ss.y - Math.sin(ss.angle) * ss.len;

      const gradient = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      gradient.addColorStop(0, `rgba(255,255,255,0)`);
      gradient.addColorStop(0.7, `rgba(255,255,255,${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(255,255,255,${alpha})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(ss.x, ss.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Small bright dot at head
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();

      if (ss.life >= ss.maxLife) {
        shootingStars.splice(i, 1);
      }
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

// ---- Custom Cursor ----
(function initCursor() {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const glow = document.querySelector('.cursor-glow');
  if (!dot || !ring) return;

  let mx = -100, my = -100, ringX = -100, ringY = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    if (glow) { glow.style.left = mx + 'px'; glow.style.top = my + 'px'; }
  });

  function animateRing() {
    ringX += (mx - ringX) * 0.12;
    ringY += (my - ringY) * 0.12;
    ring.style.left = ringX + 'px'; ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverTargets = 'a, button, .btn, .social-btn, .subcard, .nav-item, .skill-node, .news-item';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) { dot.classList.add('hovering'); ring.classList.add('hovering'); }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) { dot.classList.remove('hovering'); ring.classList.remove('hovering'); }
  });
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

// ---- Mouse-Position Card Glare ----
(function initCardGlare() {
  document.querySelectorAll('.glass, .subcard').forEach(card => {
    if (!card.querySelector('.card-glare')) {
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      card.appendChild(glare);
    }
  });
  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.glass, .subcard');
    if (!card) return;
    const glare = card.querySelector('.card-glare');
    if (!glare) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    glare.style.setProperty('--gx', x + '%');
    glare.style.setProperty('--gy', y + '%');
  });
})();

// ---- Parallax Background ----
(function initParallaxBg() {
  const bgLayer = document.querySelector('.bg-scroll-layer');
  if (!bgLayer) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        bgLayer.style.transform = `translateY(${window.pageYOffset * -0.12}px)`;
        ticking = false;
      });
      ticking = true;
    }
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
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        const target = parseInt(entry.target.dataset.count);
        const suffix = entry.target.dataset.suffix || '';
        let current = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const interval = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(interval); }
          entry.target.textContent = current + suffix;
        }, 30);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
})();

// ---- 3D Tilt ----
(function initTilt() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top - r.height / 2) / r.height) * -3;
      const ry = ((e.clientX - r.left - r.width / 2) / r.width) * 3;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
})();

// ---- Navbar ----
(function initNavScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
})();

// ---- Nav Bubble ----
(function initNavBubble() {
  const navBubble = document.getElementById('navBubble');
  const navItems = document.querySelectorAll('.nav-item');
  const sections = Array.from(document.querySelectorAll('section[id]'));
  if (!navBubble || !navItems.length) return;

  let isUserScrolling = false, scrollTimeout = null, lastKnown = 'about';

  function updateBubble(btn, immediate) {
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const p = btn.closest('.nav-links');
    const pr = p.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(p).paddingLeft);
    const tx = r.left - pr.left - pad, w = r.width;
    if (immediate) {
      navBubble.style.transition = 'none';
      navBubble.style.transform = `translateX(${tx}px)`;
      navBubble.style.width = `${w}px`;
      requestAnimationFrame(() => { navBubble.style.transition = ''; });
    } else {
      navBubble.style.transform = `translateX(${tx}px)`;
      navBubble.style.width = `${w}px`;
    }
  }

  function getActive() {
    const sy = window.pageYOffset + 200, wh = window.innerHeight, dh = document.documentElement.scrollHeight;
    if (sy < 300) return sections[0]?.id || 'about';
    if (sy + wh >= dh - 100) return sections[sections.length - 1]?.id;
    let best = lastKnown, max = -Infinity;
    sections.forEach(s => {
      const r = s.getBoundingClientRect();
      const vis = Math.max(0, Math.min(wh, r.bottom) - Math.max(0, r.top));
      const cd = Math.abs((r.top + r.bottom) / 2 - wh / 2);
      const score = vis - cd * 0.3;
      if (score > max) { max = score; best = s.id; }
    });
    return best;
  }

  const ab = document.querySelector('.nav-item.active');
  if (ab) updateBubble(ab, true);

  navItems.forEach(btn => {
    btn.addEventListener('click', function () {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      isUserScrolling = true;
      const sid = this.dataset.section;
      navItems.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      lastKnown = sid;
      updateBubble(this);
      const sec = document.getElementById(sid);
      if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.pageYOffset - 100, behavior: 'smooth' });
      scrollTimeout = setTimeout(() => { isUserScrolling = false; }, 1500);
    });
  });

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (!isUserScrolling) {
          const cs = getActive();
          if (cs && cs !== lastKnown) {
            const btn = document.querySelector(`.nav-item[data-section="${cs}"]`);
            if (btn) {
              navItems.forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              updateBubble(btn);
              lastKnown = cs;
            }
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { const a = document.querySelector('.nav-item.active'); if (a) updateBubble(a, true); }, 150); });
  window.addEventListener('load', () => { setTimeout(() => { const a = document.querySelector('.nav-item.active'); if (a) updateBubble(a, true); }, 200); });
})();

// ---- Ripple + Particles ----
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn, .social-btn');
  if (!btn) return;
  const ripple = document.createElement('span');
  const r = btn.getBoundingClientRect();
  const sz = Math.max(r.width, r.height) * 1.5;
  Object.assign(ripple.style, {
    position: 'absolute', width: sz + 'px', height: sz + 'px',
    left: (e.clientX - r.left - sz / 2) + 'px', top: (e.clientY - r.top - sz / 2) + 'px',
    borderRadius: '50%', background: 'rgba(255,255,255,0.2)', transform: 'scale(0)',
    animation: 'rippleAnim 0.6s ease-out', pointerEvents: 'none', zIndex: '10'
  });
  btn.style.position = btn.style.position || 'relative';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});
const rs = document.createElement('style');
rs.textContent = `@keyframes rippleAnim{to{transform:scale(3);opacity:0;}}`;
document.head.appendChild(rs);

// ---- Typing Animation ----
(function initTyping() {
  const el = document.getElementById('heroTagline');
  if (!el) return;
  const text = el.dataset.text || el.textContent;
  el.textContent = '';
  el.style.borderRight = '2px solid var(--accent)';
  let i = 0;
  function type() {
    if (i < text.length) { el.textContent += text[i]; i++; setTimeout(type, 45 + Math.random() * 35); }
    else { setTimeout(() => { el.style.borderRight = '2px solid transparent'; }, 2000); }
  }
  setTimeout(type, 700);
})();
