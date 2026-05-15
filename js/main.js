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
