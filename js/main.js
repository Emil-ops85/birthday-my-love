const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const bg = document.getElementById('bg');
const final = document.getElementById('final');
let current = 0;

// ---------- Прогресс ----------
const progress = document.getElementById('progress');
for (let i = 0; i < slides.length; i++) {
  const dot = document.createElement('span');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  progress.appendChild(dot);
}
const dotEls = progress.querySelectorAll('.dot');

// Плавное появление заголовка целиком (без побуквенной печати)
function typeTitle(slide) {
  const title = slide.querySelector('.title');
  if (!title || title.dataset.typed) return;
  title.dataset.typed = '1';
  // триггерим CSS-анимацию появления заголовка
  title.classList.add('title-in');
}

function goTo(index) {
  if (index === -1) {
    showFinal();
    return;
  }
  slides[current].classList.remove('active');
  dotEls[current].classList.remove('active');

  current = index;
  slides[current].classList.add('active');
  dotEls[current].classList.add('active');

  // Запускаем видео-котика на активном слайде с самого начала
  const video = slides[current].querySelector('video.cat');
  if (video) {
    video.play().catch(() => {});
  }

  // Печатаем заголовок по буквам
  typeTitle(slides[current]);
  playClick();

  // Плавно меняем цвет фона
  bg.style.filter = 'blur(4px)';
  setTimeout(() => {
    bg.style.background = `linear-gradient(135deg, ${slides[current].dataset.bg}, ${slides[current].dataset.bg}cc)`;
    bg.style.filter = 'blur(0px)';
  }, 300);
}

// ---------- Финальный сюрприз ----------
const typeText =
  'Любимая моя, с каждым днём я всё больше понимаю, как мне повезло, что ты рядом. ' +
  'Ты — моё вдохновение, моя радость и мой самый тёплый лучик света. ' +
  'Пусть твоя жизнь будет такой же нежной и уютной, как этот сайт — ' +
  'полной счастья, улыбок и маленьких кошечек, которые делают мир добрее. 🐱 ' +
  'Я благодарен за каждый миг, проведённый с тобой.';

function showFinal() {
  slides[current].classList.remove('active');
  dotEls[current].classList.remove('active');
  final.classList.remove('hidden');
  launchConfetti();
  typeWriter();
  playPop();
}

function typeWriter() {
  const el = document.getElementById('typewriter');
  el.textContent = '';
  let i = 0;
  const speed = 28;
  const timer = setInterval(() => {
    el.textContent += typeText[i];
    i++;
    if (i >= typeText.length) {
      clearInterval(timer);
      el.classList.remove('typewriter');
      el.classList.add('typewriter', 'done');
    }
  }, speed);
}

function restart() {
  final.classList.add('hidden');
  goTo(0);
}

// ---------- Обработчики ----------
document.querySelectorAll('.btn[data-next]').forEach(btn => {
  btn.addEventListener('click', () => goTo(parseInt(btn.dataset.next)));
});

document.querySelector('[data-restart]').addEventListener('click', restart);

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    goTo(Math.min(current + 1, slides.length - 1));
  }
  if (e.key === 'ArrowLeft') {
    goTo(Math.max(current - 1, 0));
  }
});

// ---------- Свайп-навигация для телефона ----------
let touchStartX = 0;
let touchStartY = 0;
document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const dist = Math.abs(dx);
  // Свайп влево = дальше, свайп вправо = назад (горизонтальный, не вертикальный)
  if (dist > 50 && Math.abs(dy) < 80) {
    if (dx < 0) {
      goTo(Math.min(current + 1, slides.length - 1));
    } else {
      goTo(Math.max(current - 1, 0));
    }
  }
}, { passive: true });

// ---------- Звуковые эффекты (мягкий pop, без файлов) ----------
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function playPop() {
  try {
    ensureAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    // мягкий, деликатный звук
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {}
}

function playClick() {
  try {
    ensureAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(640, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } catch (e) {}
}

// Печатаем заголовок первого слайда при загрузке
typeTitle(slides[0]);

// ---------- Плавающие сердечки (только справа) ----------
const isMobile = innerWidth <= 600;
const hearts = ['💕', '💖', '💗', '💞'];
const heartLayer = document.getElementById('floating-hearts');

function spawnHeart() {
  const h = document.createElement('div');
  h.className = 'float-heart';
  h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
  // Спавним ТОЛЬКО в правой половине экрана (50–100%), слева сердечек нет
  h.style.left = (50 + Math.random() * 50) + '%';
  h.style.fontSize = (isMobile ? Math.random() * 12 + 10 : Math.random() * 18 + 12) + 'px';
  h.style.animationDuration = Math.random() * 9 + 9 + 's';
  h.style.animationDelay = Math.random() * 4 + 's';
  heartLayer.appendChild(h);
  setTimeout(() => h.remove(), 20000);
}
for (let i = 0; i < (isMobile ? 5 : 8); i++) spawnHeart();
setInterval(spawnHeart, isMobile ? 2200 : 1400);

// ---------- Мерцающие звёздочки ----------
const sparkleLayer = document.getElementById('sparkles');
const sparkles = ['✦', '✧', '★', '☆', '✨'];

function spawnSparkle() {
  const s = document.createElement('span');
  s.className = 'sparkle';
  s.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
  s.style.left = Math.random() * 100 + '%';
  s.style.top = Math.random() * 100 + '%';
  s.style.fontSize = Math.random() * 18 + 8 + 'px';
  s.style.animationDuration = Math.random() * 3 + 2 + 's';
  s.style.animationDelay = Math.random() * 2 + 's';
  sparkleLayer.appendChild(s);
  setTimeout(() => s.remove(), 6000);
}
for (let i = 0; i < 24; i++) spawnSparkle();
setInterval(spawnSparkle, 300);

// ---------- Плавающие блёстки/конфетти ----------
const glitterLayer = document.getElementById('glitters');
const glitterColors = ['#f9a8d4', '#fbcfe8', '#fde68a', '#c4b5fd', '#fecdd3', '#f5d0fe'];

function spawnGlitter() {
  const g = document.createElement('div');
  g.className = 'glitter';
  g.style.left = Math.random() * 100 + '%';
  g.style.width = Math.random() * 7 + 4 + 'px';
  g.style.height = Math.random() * 7 + 4 + 'px';
  g.style.background = glitterColors[Math.floor(Math.random() * glitterColors.length)];
  g.style.animationDuration = Math.random() * 8 + 7 + 's';
  g.style.animationDelay = Math.random() * 6 + 's';
  glitterLayer.appendChild(g);
  setTimeout(() => g.remove(), 16000);
}
for (let i = 0; i < (isMobile ? 14 : 26); i++) spawnGlitter();
setInterval(spawnGlitter, isMobile ? 650 : 350);

// ---------- Проплывающие котики на фоне ----------
const bgCats = document.getElementById('bg-cats');
const bgCatEmojis = ['🐱', '🐈', '😺', '😻', '🐈‍⬛'];

function spawnBgCat() {
  const c = document.createElement('div');
  c.className = 'bg-cat';
  c.textContent = bgCatEmojis[Math.floor(Math.random() * bgCatEmojis.length)];
  c.style.left = Math.random() * 100 + '%';
  c.style.fontSize = Math.random() * 34 + 26 + 'px';
  c.style.animationDuration = Math.random() * 14 + 14 + 's';
  c.style.animationDelay = Math.random() * 8 + 's';
  bgCats.appendChild(c);
  setTimeout(() => c.remove(), 30000);
}
for (let i = 0; i < (isMobile ? 4 : 7); i++) spawnBgCat();
setInterval(spawnBgCat, isMobile ? 2400 : 1400);

// ---------- След из сердечек за курсором (только на устройствах с мышью) ----------
const trailHearts = ['💗', '💕', '💞', '💖'];
let trailPos = { x: -100, y: -100 };   // плавная позиция следа
let lastSpawnX = -100, lastSpawnY = -100;

const hasPointer = window.matchMedia('(pointer: fine)').matches;

document.addEventListener('mousemove', e => {
  if (!hasPointer) return; // на телефоне следа нет
  // Плавно тянем след к курсору, чтобы сердечки шли ровным шлейфом
  trailPos.x += (e.clientX - trailPos.x) * 0.25;
  trailPos.y += (e.clientY - trailPos.y) * 0.25;
});

// Подача сердечек в след: только при движении и на определённом расстоянии
setInterval(() => {
  if (!hasPointer) return;
  const dx = trailPos.x - lastSpawnX;
  const dy = trailPos.y - lastSpawnY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Если мышь не двигается — не плодим сердечки
  if (dist < 14) return;

  lastSpawnX = trailPos.x;
  lastSpawnY = trailPos.y;

  const trail = document.createElement('div');
  trail.className = 'heart-trail';
  trail.textContent = trailHearts[Math.floor(Math.random() * trailHearts.length)];
  trail.style.left = trailPos.x + 'px';
  trail.style.top = trailPos.y + 'px';
  document.body.appendChild(trail);
  setTimeout(() => trail.remove(), 1400);
}, 45);

// ---------- Фоновая музыка ----------
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
let musicPlaying = false;
let autoplayBlocked = false;

function startMusic() {
  music.play().then(() => {
    musicPlaying = true;
    musicToggle.classList.remove('muted');
    musicToggle.textContent = '🎶';
  }).catch(() => {
    // Браузер заблокировал автоплей — ждём первого взаимодействия
    autoplayBlocked = true;
  });
}

function stopMusic() {
  music.pause();
  musicPlaying = false;
  musicToggle.classList.add('muted');
  musicToggle.textContent = '🎵';
}

function toggleMusic() {
  if (musicPlaying) {
    stopMusic();
  } else {
    startMusic();
  }
}

musicToggle.addEventListener('click', e => {
  e.stopPropagation();
  toggleMusic();
});

// Пытаемся запустить музыку сразу при загрузке
music.addEventListener('loadeddata', startMusic);
startMusic();

// Если автоплей заблокирован браузером — запустим по первому взаимодействию
// (клик, нажатие клавиши, скролл, тап), чтобы музыка заиграла как можно раньше
function tryAutoplayOnFirstGesture() {
  if (!musicPlaying && autoplayBlocked) {
    startMusic();
  }
}
const firstGestureEvents = ['click', 'keydown', 'scroll', 'touchstart', 'mousedown'];
firstGestureEvents.forEach(evt =>
  document.addEventListener(evt, tryAutoplayOnFirstGesture, { once: true, passive: true })
);

// ---------- Кнопка-сердечко: взрыв сердечек ----------
const heartButton = document.getElementById('heart-button');
const explodeLayer = document.getElementById('heart-explode');
const explodeHearts = ['💗', '💕', '💖', '💞', '❤️'];

heartButton.addEventListener('click', e => {
  e.stopPropagation();
  heartButton.classList.remove('pressed');
  void heartButton.offsetWidth; // перезапуск анимации
  heartButton.classList.add('pressed');
  playClick();

  // Получаем позицию кнопки — сердечки взрываются прямо из неё
  const rect = heartButton.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  // Взрыв сердечек из кнопки
  for (let i = 0; i < 26; i++) {
    const h = document.createElement('div');
    h.className = 'explode-heart';
    h.textContent = explodeHearts[Math.floor(Math.random() * explodeHearts.length)];
    h.style.left = cx + 'px';
    h.style.top = cy + 'px';
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 160 + 80;
    h.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    h.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    h.style.fontSize = Math.random() * 22 + 16 + 'px';
    explodeLayer.appendChild(h);
    setTimeout(() => h.remove(), 1300);
  }
});

// ---------- Конфетти ----------
const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#22c55e', '#ec4899', '#facc15'];
function launchConfetti() {
  const container = document.querySelector('.confetti-container');
  container.innerHTML = '';
  for (let i = 0; i < 180; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = Math.random() * 10 + 6 + 'px';
    piece.style.height = Math.random() * 12 + 8 + 'px';
    piece.style.animationDuration = Math.random() * 3 + 2 + 's';
    piece.style.animationDelay = Math.random() * 3 + 's';
    piece.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    container.appendChild(piece);
  }
}