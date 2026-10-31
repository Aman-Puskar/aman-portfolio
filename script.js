  //  Aman Puskar – Portfolio JavaScript

//  Animated Canvas Background 
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const DOT_COUNT = 90;
  const dots = Array.from({ length: DOT_COUNT }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    r: Math.random() * 1.8 + 0.8,
    alpha: Math.random() * 0.5 + 0.1,
  }));

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (const d of dots) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0) d.x = W;
      if (d.x > W) d.x = 0;
      if (d.y < 0) d.y = H;
      if (d.y > H) d.y = 0;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96,165,250,${d.alpha})`;
      ctx.fill();
    }

    // Dot-to-dot connections
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(59,130,246,${0.12 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Mouse connections
      const mdx = dots[i].x - mouse.x;
      const mdy = dots[i].y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 180) {
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(96,165,250,${0.28 * (1 - mdist / 180)})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

// Typed Text Animation 
(function () {
  const phrases = [
    'Building RAG systems & NLP pipelines',
    'Crafting real-time WebSocket apps',
    'Solving 760+ DSA challenges',
    'React · Spring Boot · Python · Pinecone',
    'Turning ideas into intelligent systems',
  ];
  let pi = 0, ci = 0, deleting = false;
  const el = document.getElementById('typed');
  if (!el) return;

  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ci + 1);
      ci++;
      if (ci === phrase.length) {
        deleting = true;
        setTimeout(tick, 2400);
        return;
      }
      setTimeout(tick, 52);
    } else {
      el.textContent = phrase.slice(0, ci - 1);
      ci--;
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 28);
    }
  }
  setTimeout(tick, 1400);
})();

// ── 3. Navbar scroll behaviour ───────────────────────────────
(function () {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
})();

// ── 4. Mobile nav toggle ─────────────────────────────────────
(function () {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });

  // Close on link click
  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
})();

// ── 5. Scroll Reveal ─────────────────────────────────────────
(function () {
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => observer.observe(el));
})();

// ── 6. Skill Bar Animations ──────────────────────────────────
(function () {
  const fills = document.querySelectorAll('.skill-fill');
  const skillsGrid = document.querySelector('.skills-grid');
  if (!skillsGrid) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          fills.forEach((fill) => {
            const w = fill.dataset.width || 0;
            fill.style.width = w + '%';
          });
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.25 }
  );
  observer.observe(skillsGrid);
})();

// ── 7. Hero Counter Animation ────────────────────────────────
(function () {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  let triggered = false;

  function animate(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const duration = 1600;
    const step = target / (duration / 16);

    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + suffix;
      if (current >= target) clearInterval(interval);
    }, 16);
  }

  const heroSection = document.getElementById('hero');
  if (!heroSection) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !triggered) {
          triggered = true;
          setTimeout(() => counters.forEach(animate), 600);
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  observer.observe(heroSection);
})();

// ── 8. Smooth active nav link highlight ─────────────────────
(function () {
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 140;
      if (window.scrollY >= top) current = section.id;
    });
    navLinks.forEach((link) => {
      link.style.color = link.getAttribute('href') === '#' + current
        ? 'var(--accent2)'
        : '';
    });
  });
})();
