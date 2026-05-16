// ===== Theme toggle =====
const html = document.documentElement;
const themeBtn = document.getElementById('themeBtn');

const savedTheme = localStorage.getItem('theme');
if (savedTheme) html.setAttribute('data-theme', savedTheme);

themeBtn?.addEventListener('click', () => {
  html.classList.add('theme-transitioning');
  setTimeout(() => html.classList.remove('theme-transitioning'), 400);

  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

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

// ===== Dynamic Island Music Player =====
(function () {
  const audio    = document.getElementById('diAudio');
  const player   = document.getElementById('diPlayer');
  const seek     = document.getElementById('diSeek');
  const vol      = document.getElementById('diVol');
  const muteBtn  = document.getElementById('diMute');
  const likeBtn  = document.getElementById('diLike');
  const closeBtn = document.getElementById('diClose');
  const prevBtn  = document.getElementById('diPrev');
  const nextBtn  = document.getElementById('diNext');
  const currentEl  = document.getElementById('diCurrent');
  const durationEl = document.getElementById('diDuration');
  const hint     = document.getElementById('diHint');
  const ring     = document.getElementById('diRing');
  const playBtns = document.querySelectorAll('.di-play-btn');

  if (!audio || !player) return;

  let playing = false;
  let muted   = false;
  let firstClick = false;

  function syncRing() {
    if (!ring) return;
    ring.classList.toggle('pulsing', playing && !player.classList.contains('di-open'));
  }
  let autoCloseTimer;

  audio.volume = 0.7;

  // Try autoplay immediately — works if browser permits it
  audio.play().then(() => {
    playing = true;
    firstClick = true;
    player.classList.add('playing');
    syncRing();
    document.removeEventListener('click', handleFirstInteraction);
    document.removeEventListener('keydown', handleFirstInteraction);
    document.removeEventListener('touchstart', handleFirstInteraction);
  }).catch(() => {
    // Autoplay blocked — fall back to first-interaction
  });

  // Slide in after 1.5s; only show hint if autoplay was blocked
  setTimeout(() => {
    player.classList.add('di-visible');
    if (!firstClick) setTimeout(() => hint?.classList.add('di-hint-show'), 800);
  }, 1500);

  // First user interaction → start playing (fallback)
  function handleFirstInteraction() {
    if (firstClick) return;
    firstClick = true;
    document.removeEventListener('click', handleFirstInteraction);
    document.removeEventListener('keydown', handleFirstInteraction);
    document.removeEventListener('touchstart', handleFirstInteraction);
    hint?.classList.remove('di-hint-show');
    hint?.classList.add('di-hint-hide');
    startPlay();
  }
  document.addEventListener('click', handleFirstInteraction);
  document.addEventListener('keydown', handleFirstInteraction);
  document.addEventListener('touchstart', handleFirstInteraction, { passive: true });

  function startPlay() {
    audio.play().then(() => {
      playing = true;
      player.classList.add('playing');
      syncRing();
    }).catch(() => {});
  }

  function setPlaying(state) {
    playing = state;
    player.classList.toggle('playing', state);
    if (state) audio.play().catch(() => {}); else audio.pause();
    syncRing();
  }

  // Click compact circle → expand
  function openIsland() {
    player.classList.add('di-open');
    syncRing();
    clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(closeIsland, 8000);
  }
  function closeIsland() {
    player.classList.remove('di-open');
    syncRing();
    clearTimeout(autoCloseTimer);
  }

  player.addEventListener('click', () => {
    if (!player.classList.contains('di-open')) openIsland();
  });

  // Click outside → collapse
  document.addEventListener('click', e => {
    if (player.classList.contains('di-open') && !player.contains(e.target)) closeIsland();
  });

  // Play buttons (compact + expanded)
  playBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (!firstClick) { handleFirstInteraction(); return; }
      setPlaying(!playing);
      clearTimeout(autoCloseTimer);
      autoCloseTimer = setTimeout(closeIsland, 8000);
    });
  });

  // Progress bar
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    if (seek) {
      seek.value = pct;
      seek.style.background = `linear-gradient(to right,var(--sp-green) ${pct}%,rgba(255,255,255,0.15) ${pct}%)`;
    }
    if (currentEl) currentEl.textContent = fmtTime(audio.currentTime);
  });
  audio.addEventListener('loadedmetadata', () => {
    if (durationEl) durationEl.textContent = fmtTime(audio.duration);
  });

  // Seek
  seek?.addEventListener('input', e => {
    e.stopPropagation();
    if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
    seek.style.background = `linear-gradient(to right,var(--sp-green) ${seek.value}%,rgba(255,255,255,0.15) ${seek.value}%)`;
  });

  // Volume
  if (vol) vol.style.background = 'linear-gradient(to right,var(--sp-green) 70%,rgba(255,255,255,0.15) 70%)';
  vol?.addEventListener('input', e => {
    e.stopPropagation();
    audio.volume = vol.value / 100;
    vol.style.background = `linear-gradient(to right,var(--sp-green) ${vol.value}%,rgba(255,255,255,0.15) ${vol.value}%)`;
    if (audio.volume > 0 && muted) { muted = false; audio.muted = false; syncMute(); }
  });

  // Mute
  function syncMute() {
    const v = muteBtn?.querySelector('.di-vol-icon');
    const m = muteBtn?.querySelector('.di-muted-icon');
    if (v) v.style.display = muted ? 'none' : '';
    if (m) m.style.display = muted ? '' : 'none';
  }
  muteBtn?.addEventListener('click', e => {
    e.stopPropagation();
    muted = !muted; audio.muted = muted; syncMute();
  });

  // Like
  likeBtn?.addEventListener('click', e => {
    e.stopPropagation();
    likeBtn.classList.toggle('liked');
  });

  // Prev / Next (single track — restart)
  prevBtn?.addEventListener('click', e => { e.stopPropagation(); audio.currentTime = 0; });
  nextBtn?.addEventListener('click', e => { e.stopPropagation(); audio.currentTime = 0; });

  // Close
  closeBtn?.addEventListener('click', e => {
    e.stopPropagation();
    setPlaying(false);
    player.classList.remove('di-visible', 'di-open');
    hint?.classList.remove('di-hint-show');
    clearTimeout(autoCloseTimer);
  });

  // Drag to reposition (mouse + touch)
  let dragStartX, dragStartY, origLeft, origTop, isDragging = false;

  function startDrag(clientX, clientY) {
    const rect = player.getBoundingClientRect();
    dragStartX = clientX;
    dragStartY = clientY;
    origLeft   = rect.left;
    origTop    = rect.top;
    isDragging = false;
    return rect;
  }

  function moveDrag(clientX, clientY, rect) {
    const dx = clientX - dragStartX;
    const dy = clientY - dragStartY;
    if (!isDragging && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
    isDragging = true;
    player.classList.add('di-dragging');
    const maxX   = window.innerWidth  - rect.width;
    const maxY   = window.innerHeight - rect.height;
    const newLeft = Math.max(0, Math.min(maxX, origLeft + dx));
    const newTop  = Math.max(0, Math.min(maxY, origTop  + dy));
    player.style.right     = 'auto';
    player.style.bottom    = 'auto';
    player.style.left      = newLeft + 'px';
    player.style.top       = newTop  + 'px';
    player.style.transform = 'none';
    if (ring) {
      ring.style.right  = 'auto';
      ring.style.bottom = 'auto';
      ring.style.left   = newLeft + 'px';
      ring.style.top    = newTop  + 'px';
    }
    if (hint) {
      hint.style.bottom    = 'auto';
      hint.style.right     = 'auto';
      hint.style.left      = newLeft + 'px';
      hint.style.top       = (newTop - 44) + 'px';
      hint.style.transform = 'none';
    }
  }

  // Mouse drag
  player.addEventListener('mousedown', e => {
    if (e.target.closest('button, input')) return;
    const rect = startDrag(e.clientX, e.clientY);

    function onMove(e)  { moveDrag(e.clientX, e.clientY, rect); }
    function onUp()     {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      setTimeout(() => { isDragging = false; }, 0);
      player.classList.remove('di-dragging');
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // Touch drag
  player.addEventListener('touchstart', e => {
    if (e.target.closest('button, input')) return;
    const t = e.touches[0];
    const rect = startDrag(t.clientX, t.clientY);

    function onTouchMove(e) {
      const t = e.touches[0];
      moveDrag(t.clientX, t.clientY, rect);
      if (isDragging) e.preventDefault();
    }
    function onTouchEnd() {
      player.removeEventListener('touchmove', onTouchMove);
      player.removeEventListener('touchend', onTouchEnd);
      setTimeout(() => { isDragging = false; }, 0);
      player.classList.remove('di-dragging');
    }
    player.addEventListener('touchmove', onTouchMove, { passive: false });
    player.addEventListener('touchend', onTouchEnd);
  }, { passive: true });

  // Prevent click-to-open firing after a drag
  player.addEventListener('click', e => {
    if (isDragging) e.stopImmediatePropagation();
  }, true);

  function fmtTime(s) {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  }
})();

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
