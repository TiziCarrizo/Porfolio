document.addEventListener('DOMContentLoaded', () => {
  // ══════════ LIQUID ETHER BACKGROUND ══════════
  const etherContainer = document.getElementById('liquid-ether-container');
  if (etherContainer && typeof LiquidEther !== 'undefined') {
    new LiquidEther(etherContainer, {
      colors: ['#5227FF', '#FF9FFC', '#B497CF'],
      mouseForce: 20,
      cursorSize: 100,
      isViscous: true,
      viscous: 30,
      iterationsViscous: 32,
      iterationsPoisson: 32,
      dt: 0.014,
      BFECC: true,
      resolution: 0.5,
      isBounce: false,
      autoDemo: true,
      autoSpeed: 0.5,
      autoIntensity: 2.2,
      takeoverDuration: 0.25,
      autoResumeDelay: 3000,
      autoRampDuration: 0.6
    });
  }


  // ══════════ ELECTRIC BORDER ══════════
  document.querySelectorAll('[data-electric]').forEach(container => {
    const cvs = container.querySelector('.eb-canvas-wrap canvas');
    if (!cvs) return;
    const ectx = cvs.getContext('2d');
    let time = 0, lastFrame = 0;
    const borderOffset = 50, chaos = 0.12, speed = 0.8, borderRadius = 20;

    function random(x) { return (Math.sin(x * 12.9898) * 43758.5453) % 1; }
    function noise2D(x, y) {
      const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
      const a = random(i + j * 57), b = random(i + 1 + j * 57);
      const c = random(i + (j + 1) * 57), d = random(i + 1 + (j + 1) * 57);
      const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
      return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
    }
    function octNoise(x, t, seed) {
      let y = 0, amp = chaos, freq = 10;
      for (let i = 0; i < 8; i++) {
        y += amp * (i === 0 ? 0 : 1) * noise2D(freq * x + seed * 100, t * freq * 0.3);
        freq *= 1.6; amp *= 0.7;
      }
      return y;
    }
    function getRRPoint(t, l, tp, w, h, r) {
      const sw = w - 2 * r, sh = h - 2 * r, ca = Math.PI * r / 2;
      const total = 2 * sw + 2 * sh + 4 * ca, dist = t * total;
      let acc = 0;
      if (dist <= acc + sw) return { x: l + r + (dist - acc) / sw * sw, y: tp };
      acc += sw;
      if (dist <= acc + ca) { const p = (dist - acc) / ca, a = -Math.PI / 2 + p * Math.PI / 2; return { x: l + w - r + r * Math.cos(a), y: tp + r + r * Math.sin(a) }; }
      acc += ca;
      if (dist <= acc + sh) return { x: l + w, y: tp + r + (dist - acc) / sh * sh };
      acc += sh;
      if (dist <= acc + ca) { const p = (dist - acc) / ca, a = p * Math.PI / 2; return { x: l + w - r + r * Math.cos(a), y: tp + h - r + r * Math.sin(a) }; }
      acc += ca;
      if (dist <= acc + sw) return { x: l + w - r - (dist - acc) / sw * sw, y: tp + h };
      acc += sw;
      if (dist <= acc + ca) { const p = (dist - acc) / ca, a = Math.PI / 2 + p * Math.PI / 2; return { x: l + r + r * Math.cos(a), y: tp + h - r + r * Math.sin(a) }; }
      acc += ca;
      if (dist <= acc + sh) return { x: l, y: tp + h - r - (dist - acc) / sh * sh };
      acc += sh;
      const p = (dist - acc) / ca, a = Math.PI + p * Math.PI / 2;
      return { x: l + r + r * Math.cos(a), y: tp + r + r * Math.sin(a) };
    }

    function updateSize() {
      const rect = container.getBoundingClientRect();
      const w = rect.width + borderOffset * 2, h = rect.height + borderOffset * 2;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cvs.width = w * dpr; cvs.height = h * dpr;
      cvs.style.width = w + 'px'; cvs.style.height = h + 'px';
      return { w, h, dpr };
    }
    let { w, h, dpr } = updateSize();
    new ResizeObserver(() => { const s = updateSize(); w = s.w; h = s.h; dpr = s.dpr; }).observe(container);

    function drawEB(ts) {
      const dt = (ts - lastFrame) / 1000; time += dt * speed; lastFrame = ts;
      ectx.setTransform(1, 0, 0, 1, 0, 0);
      ectx.clearRect(0, 0, cvs.width, cvs.height);
      ectx.scale(dpr, dpr);
      ectx.strokeStyle = 'rgba(139,92,246,0.6)'; ectx.lineWidth = 1;
      ectx.lineCap = 'round'; ectx.lineJoin = 'round';
      const bw = w - 2 * borderOffset, bh = h - 2 * borderOffset;
      const r = Math.min(borderRadius, Math.min(bw, bh) / 2);
      const samples = Math.floor((2 * (bw + bh) + 2 * Math.PI * r) / 2);
      ectx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const prog = i / samples;
        const pt = getRRPoint(prog, borderOffset, borderOffset, bw, bh, r);
        const nx = octNoise(prog * 8, time, 0), ny = octNoise(prog * 8, time, 1);
        const dx = pt.x + nx * 50, dy = pt.y + ny * 50;
        i === 0 ? ectx.moveTo(dx, dy) : ectx.lineTo(dx, dy);
      }
      ectx.closePath(); ectx.stroke();
      requestAnimationFrame(drawEB);
    }
    requestAnimationFrame(drawEB);
  });

  // ══════════ NAVBAR SCROLL ══════════
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // ══════════ MOBILE NAV ══════════
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active'); navLinks.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => {
      toggle.classList.remove('active'); navLinks.classList.remove('active');
    }));
  }

  // ══════════ TYPING EFFECT ══════════
  const typingEl = document.getElementById('typingText');
  if (typingEl) {
    const phrases = ['Frontend Developer', 'UX/UI Designer', 'Data Analyst', 'CDO & Co-Founder'];
    let pi = 0, ci = 0, del = false;
    function type() {
      const cur = phrases[pi];
      if (!del) {
        typingEl.textContent = cur.substring(0, ci + 1); ci++;
        if (ci === cur.length) { del = true; setTimeout(type, 2000); return; }
        setTimeout(type, 80);
      } else {
        typingEl.textContent = cur.substring(0, ci - 1); ci--;
        if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; setTimeout(type, 400); return; }
        setTimeout(type, 40);
      }
    }
    setTimeout(type, 800);
  }

  // ══════════ INTERSECTION OBSERVER ══════════
  const fadeEls = document.querySelectorAll('.fade-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  fadeEls.forEach(el => observer.observe(el));

  // ══════════ SMOOTH SCROLL ══════════
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ══════════ EDUCATION PROGRESS BAR ══════════
  const progressBar = document.querySelector('.edu-progress-bar');
  if (progressBar) {
    const po = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { progressBar.style.width = '90%'; po.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    po.observe(progressBar.parentElement);
  }

  // ══════════ PHOTO 3D SCROLL REVEAL ══════════
  const photoImg = document.querySelector('.photo-img');
  if (photoImg) {
    const photoObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          photoImg.classList.add('revealed');
          photoObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    photoObs.observe(photoImg.parentElement);
  }

  // ══════════ ACTIVE NAV LINK ══════════
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) current = s.id; });
    navItems.forEach(item => {
      item.style.color = '';
      if (item.getAttribute('href') === '#' + current) item.style.color = 'var(--violet-600)';
    });
  }, { passive: true });
});
