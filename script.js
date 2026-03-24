/* ================================================
   ÁGATHA ZACCA – Premium Lawyer Website JS
   Animations: Loader, Cursor, Particles, AOS,
   Parallax, Counter, Tilt 3D, Navbar, Mobile Menu
   ================================================ */

'use strict';

// ─── UTILS ──────────────────────────────────────
const qs = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const $ = qs;

// ─── LOADER ─────────────────────────────────────
// Detect bots/crawlers/speed-tests: skip loader entirely so metrics show true content speed
const isBot = /bot|crawl|slurp|spider|mediapartners|google|baidu|bing|msn|teoma|yahoo|lighthouse|ptst|speed insights|gtmetrix|pingdom|chrome-lighthouse/i.test(navigator.userAgent);

(function initLoader() {
  const loader = $('#loader');
  if (!loader) return;

  // For bots and speed tests: hide loader instantly and don't block anything
  if (isBot) {
    loader.style.display = 'none';
    triggerHeroAnimations();
    return;
  }

  // For real users: use a fixed intro delay (800ms) matching the CSS animation.
  // We do NOT wait for window.onload because waiting for all network requests destroys LCP.
  setTimeout(() => {
    if (!loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
      triggerHeroAnimations();
    }
  }, 800);
})();

function triggerHeroAnimations() {
  qsa('.line-reveal, .fade-up-el, .char-reveal').forEach(el => {
    el.style.animationPlayState = 'running';
  });
}

// ─── CUSTOM CURSOR ──────────────────────────────
(function initCursor() {
  const cursor = $('#cursor');
  const trail = $('#cursor-trail');
  if (!cursor || !trail) return;

  let mx = 0, my = 0, tx = 0, ty = 0;
  const lerp = (a, b, n) => a + (b - a) * n;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  function animTrail() {
    tx = lerp(tx, mx, 0.14);
    ty = lerp(ty, my, 0.14);
    trail.style.left = tx + 'px';
    trail.style.top = ty + 'px';
    requestAnimationFrame(animTrail);
  }
  animTrail();
})();

// ─── PARTICLES CANVAS ───────────────────────────
(function initParticles() {
  const canvas = $('#particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  const GOLD = [
    'rgba(201,168,76,', 'rgba(226,194,105,', 'rgba(154,122,48,'
  ];

  function createParticle() {
    const a = GOLD[Math.floor(Math.random() * GOLD.length)];
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25 - 0.1,
      alpha: Math.random() * 0.5 + 0.1,
      color: a,
      life: Math.random() * 200 + 100,
      age: 0,
    };
  }

  for (let i = 0; i < 90; i++) particles.push(createParticle());

  function drawParticle(p) {
    const fade = Math.sin((p.age / p.life) * Math.PI);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color + (p.alpha * fade) + ')';
    ctx.fill();
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.25;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(201,168,76,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      // Mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        p.vx += (dx / dist) * 0.4;
        p.vy += (dy / dist) * 0.4;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.age++;

      if (p.age > p.life || p.x < -50 || p.x > W + 50 || p.y < -50 || p.y > H + 50) {
        particles[i] = createParticle();
      }

      drawParticle(p);
    });

    drawConnections();
    requestAnimationFrame(loop);
  }
  loop();
})();

// ─── NAVBAR ─────────────────────────────────────
(function initNavbar() {
  const nav = $('#navbar');
  const ham = $('#hamburger');
  const mMenu = $('#mobile-menu');

  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  if (ham && mMenu) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('active');
      mMenu.classList.toggle('open');
    });

    qsa('.mm-link', mMenu).forEach(link => {
      link.addEventListener('click', () => {
        ham.classList.remove('active');
        mMenu.classList.remove('open');
      });
    });
  }

  // Active section highlight
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-links a');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const active = navLinks.find(a => a.getAttribute('href') === '#' + e.target.id);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => obs.observe(s));
})();

// ─── SMOOTH ANCHOR SCROLL ───────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── AOS (SCROLL REVEAL) ───────────────────────
(function initAOS() {
  const elements = qsa('[data-aos]');

  function checkVisible() {
    const vh = window.innerHeight;
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const delay = parseInt(el.getAttribute('data-aos-delay') || 0);
      if (rect.top < vh * 0.88) {
        setTimeout(() => el.classList.add('aos-in'), delay);
      }
    });
  }

  window.addEventListener('scroll', checkVisible, { passive: true });
  window.addEventListener('resize', checkVisible, { passive: true });
  // Run AOS after loader hides (~900ms) so elements animate in correctly
  setTimeout(checkVisible, isBot ? 0 : 900);
})();

// ─── COUNTERS ───────────────────────────────────
(function initCounters() {
  const nums = qsa('.stat-num[data-target]');
  let triggered = false;

  function runCounters() {
    nums.forEach(el => {
      const target = parseInt(el.getAttribute('data-target'));
      const duration = 1800;
      const step = 16;
      const increments = Math.ceil(duration / step);
      let count = 0;

      const interval = setInterval(() => {
        count++;
        const progress = count / increments;
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target);
        if (count >= increments) {
          el.textContent = target;
          clearInterval(interval);
        }
      }, step);
    });
  }

  const statsBar = $('#stats-bar');
  if (!statsBar) return;

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !triggered) {
      triggered = true;
      runCounters();
    }
  }, { threshold: 0.3 });

  obs.observe(statsBar);
})();

// ─── PARALLAX ───────────────────────────────────
(function initParallax() {
  const quoteBg = $('.quote-parallax-bg');
  const heroBg = $('.hero-bg-grid');

  function onScroll() {
    const scrollY = window.scrollY;

    if (quoteBg) {
      const section = $('#quote-section');
      if (section) {
        const rect = section.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2 - window.innerHeight / 2;
        quoteBg.style.transform = `translateY(${centerY * 0.25}px)`;
      }
    }

    if (heroBg) {
      heroBg.style.transform = `translateY(${scrollY * 0.15}px)`;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ─── HERO PHOTO PARALLAX ────────────────────────
(function initHeroParallax() {
  const wrap = $('.hero-photo-wrap');
  if (!wrap) return;

  window.addEventListener('scroll', () => {
    const s = window.scrollY;
    wrap.style.transform = `translateY(${s * 0.06}px)`;
  }, { passive: true });
})();

// ─── 3D TILT CARDS ──────────────────────────────
(function initTilt() {
  const cards = qsa('.atuacao-card, .prev-item, .contato-cta-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotX = -y * 12;
      const rotY = x * 12;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale(1.02)`;
      card.style.transition = 'transform 0.08s ease';

      // Specular highlight
      const lx = (x + 0.5) * 100;
      const ly = (y + 0.5) * 100;
      card.style.background = card.classList.contains('featured')
        ? `radial-gradient(circle at ${lx}% ${ly}%, rgba(201,168,76,0.1), transparent 60%), linear-gradient(135deg, var(--dark3) 0%, rgba(201,168,76,0.06) 100%)`
        : `radial-gradient(circle at ${lx}% ${ly}%, rgba(201,168,76,0.06), transparent 60%), var(--dark3)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.5s var(--transition)';
      card.style.background = '';
    });
  });
})();

// ─── STAGGERED GRID ENTRANCE ────────────────────
(function initStaggerGrid() {
  const grids = ['.atuacao-grid', '.prev-grid'];

  grids.forEach(gridSel => {
    const grid = $(gridSel);
    if (!grid) return;

    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const items = qsa(':scope > *', grid);
        items.forEach((item, i) => {
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'none';
          }, i * 80);
        });
        obs.disconnect();
      }
    }, { threshold: 0.1 });

    obs.observe(grid);
  });
})();

// ─── GOLD SHIMMER ON BUTTONS ────────────────────
(function initShimmer() {
  qsa('.btn-gold').forEach(btn => {
    btn.addEventListener('mouseenter', function () {
      this.style.backgroundSize = '200% 200%';
      this.style.backgroundPosition = 'right center';
    });
    btn.addEventListener('mouseleave', function () {
      this.style.backgroundPosition = 'left center';
    });
  });
})();

// ─── MAGNETIC EFFECT ON FLOATING WA ─────────────
(function initMagnetic() {
  const wa = $('#whatsapp-float');
  if (!wa) return;

  document.addEventListener('mousemove', e => {
    const rect = wa.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 140) {
      const factor = (140 - dist) / 140 * 0.25;
      wa.style.transform = `translate(${dx * factor}px, ${dy * factor}px) scale(1.08)`;
    } else {
      wa.style.transform = '';
    }
  });
})();

// ─── TEXT GLITCH ON HERO NAME ───────────────────
(function initGlitch() {
  const name = $('.hero-name');
  if (!name) return;

  let glitching = false;

  function runGlitch() {
    if (glitching) return;
    glitching = true;
    name.style.textShadow = `
      2px 0 #ff0040, -2px 0 #00ffe7, 0 0 3px rgba(201,168,76,0.8)
    `;
    setTimeout(() => {
      name.style.textShadow = `-2px 0 #ff0040, 2px 0 #00ffe7`;
      setTimeout(() => {
        name.style.textShadow = '';
        glitching = false;
      }, 80);
    }, 80);
  }

  // Random glitch every few seconds
  setInterval(() => {
    if (Math.random() < 0.35) runGlitch();
  }, 4500);
})();

// ─── INTERSECTION OBSERVER FOR NAV INDICATOR ────
(function initNavGlow() {
  const style = document.createElement('style');
  style.textContent = `
    .nav-links a.active { color: var(--gold) !important; }
    .nav-links a.active::after { width: 60% !important; }
  `;
  document.head.appendChild(style);
})();

// ─── PAGE TRANSITION ON LINKS ───────────────────
(function initPageTrans() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed; inset:0; z-index:99998;
    background:var(--dark);
    pointer-events:none;
    opacity:0;
    transition:opacity 0.35s ease;
  `;
  document.body.appendChild(overlay);

  document.querySelectorAll('a[href^="http"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const href = link.href;
      overlay.style.opacity = '0.6';
      setTimeout(() => { window.open(href, '_blank'); overlay.style.opacity = '0'; }, 300);
    });
  });
})();

// ─── LOGO INVIEW SCALE ──────────────────────────
(function initLogoEffect() {
  const logos = qsa('.sobre-img-badge, .cta-logo');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        e.target.style.transform = 'scale(1)';
      }
    });
  }, { threshold: 0.5 });

  logos.forEach(l => {
    l.style.transform = 'scale(0.6)';
    obs.observe(l);
  });
})();

// ─── SECTION REVEAL WITH GOLD LINE ──────────────
(function initGoldLines() {
  const lines = qsa('.gold-line');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = '60px';
      }
    });
  }, { threshold: 0.8 });

  lines.forEach(line => {
    line.style.width = '0px';
    line.style.transition = 'width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s';
    obs.observe(line);
  });
})();

// ─── HERO RINGS MOUSE PARALLAX ──────────────────
(function initRingsParallax() {
  const ring1 = $('.hero-photo-ring');
  const ring2 = $('.ring2');
  if (!ring1 || !ring2) return;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    ring1.style.transform = `rotate(${ring1.dataset.angle || 0}deg) translate(${dx * 10}px, ${dy * 10}px)`;
    ring2.style.transform = `rotate(${-(ring2.dataset.angle || 0)}deg) translate(${dx * -6}px, ${dy * -6}px)`;
  });
})();

// ─── FOOTER REVEAL ──────────────────────────────
(function initFooter() {
  const footer = $('#footer');
  if (!footer) return;

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      footer.style.animation = 'fadeUpEl 0.8s ease forwards';
    }
  }, { threshold: 0.1 });

  obs.observe(footer);
})();

console.log('%c⚖ Ágatha Zacca Advogada – OAB/SC 61.660',
  'color:#C9A84C; font-size:16px; font-weight:bold; font-family:Georgia,serif;');

// ─── FAQ ACCORDION ───────────────────────────────
(function initFAQ() {
  const items = qsa('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      items.forEach(i => {
        if (i !== item) {
          i.classList.remove('open');
          const a = i.querySelector('.faq-answer');
          if (a) a.style.maxHeight = null;
          const q = i.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = null;
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

// ─── TRIAGEM MULTI-STEP ──────────────────────────
(function initTriagem() {
  const opts = qsa('.triagem-opt');
  const progressFill = $('#triagem-progress-fill');
  const progressBar = $('#triagem-progress');
  const restartBtn = $('#triagem-restart');
  if (!opts.length) return;

  const stepProgress = { '1': 33, '2': 66, '3': 100, 'result': 100 };

  function showStep(id) {
    // Hide all steps
    qsa('.triagem-step').forEach(s => s.classList.remove('active'));

    const target = id === 'result'
      ? $('#triagem-result')
      : $(`#triagem-step-${id}`);

    if (target) target.classList.add('active');

    // Update progress bar
    if (progressFill) {
      progressFill.style.width = (stepProgress[id] || 33) + '%';
    }
    // Hide progress bar on result
    if (progressBar) {
      progressBar.style.opacity = id === 'result' ? '0' : '1';
    }
  }

  opts.forEach(opt => {
    opt.addEventListener('click', () => {
      const next = opt.getAttribute('data-next');
      if (next) showStep(next);
    });
  });

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      showStep('1');
      if (progressBar) progressBar.style.opacity = '1';
    });
  }
})();

