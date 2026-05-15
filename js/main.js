// ===== Navbar scroll state =====
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  if (window.scrollY > 30) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');

  // Active section
  const y = window.scrollY + 140;
  let current = sections[0]?.id;
  sections.forEach(s => {
    if (y >= s.offsetTop) current = s.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.dataset.section === current);
  });
}, { passive: true });

// ===== Reveal on scroll =====
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal-up').forEach(el => io.observe(el));

// ===== Mobile menu =====
const menuBtn = document.getElementById('menuBtn');
const navLinksEl = document.querySelector('.nav-links');

menuBtn?.addEventListener('click', () => {
  navLinksEl.classList.toggle('open');
});

// Close on nav link click
navLinks.forEach(a => a.addEventListener('click', () => {
  navLinksEl.classList.remove('open');
}));

// Close when resizing back to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 960) navLinksEl.classList.remove('open');
}, { passive: true });

// ===== Cord wave animation (cross-browser, matches swing timing) =====
const cordPath = document.querySelector('.cord-path');
if (cordPath) {
  const PERIOD = 5000; // must match swing CSS duration (5s)
  function animateCord(ts) {
    const t = (ts % PERIOD) / PERIOD;
    // cosine gives 1→-1→1, matching swing phase: card left = cord curves right
    const cx = 5 + 3 * Math.cos(2 * Math.PI * t);
    cordPath.setAttribute('d', `M5,0 Q${cx.toFixed(2)},14 5,28`);
    requestAnimationFrame(animateCord);
  }
  requestAnimationFrame(animateCord);
}

// ===== ID Card 3D tilt (Readymag style) =====
const idCard = document.querySelector('.id-card');
const idWrap = document.querySelector('.id-wrap');

if (idCard && idWrap) {
  const shine = document.createElement('div');
  shine.className = 'id-shine';
  idCard.appendChild(shine);

  idCard.addEventListener('mouseenter', () => {
    idWrap.classList.add('tilting');
  });

  idCard.addEventListener('mousemove', (e) => {
    const rect = idCard.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    const rotX = -dy * 14;
    const rotY = dx * 14;

    idCard.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`;
    idCard.style.boxShadow = `
      ${-rotY * 1.5}px ${rotX * 1.5}px 60px rgba(0,0,0,0.7),
      0 0 0 1px rgba(245,200,0,0.5)
    `;

    const sx = ((dx + 1) / 2) * 100;
    const sy = ((dy + 1) / 2) * 100;
    shine.style.background = `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.2) 0%, transparent 65%)`;
    shine.style.opacity = '1';
  });

  idCard.addEventListener('mouseleave', () => {
    idWrap.classList.remove('tilting');
    idCard.style.transform = '';
    idCard.style.boxShadow = '';
    shine.style.opacity = '0';
  });
}
