if (typeof GLightbox === 'function') {
  GLightbox({
    selector: '.gallery .glightbox',
    touchNavigation: true,
    loop: true,
    zoomable: true,
    moreInfo: false
  });
}

const gate = document.querySelector('#gate');
const openButton = document.querySelector('#openInvitation');
const audio = document.querySelector('#weddingAudio');
const audioToggle = document.querySelector('#audioToggle');

const petalSymbols = ['🌸', '🌸', '🌿', '🌸', '🌼', '🌿', '🌸'];
const floatingPetals = document.querySelector('#floatingPetals');
for (let index = 0; index < 18; index += 1) {
  const petal = document.createElement('span');
  petal.className = 'floating-petal';
  petal.textContent = petalSymbols[index % petalSymbols.length];
  petal.style.left = `${Math.random() * 100}%`;
  petal.style.fontSize = `${14 + Math.random() * 22}px`;
  petal.style.animationDuration = `${14 + Math.random() * 16}s`;
  petal.style.animationDelay = `${Math.random() * 12}s`;
  floatingPetals.appendChild(petal);
}

let musicStarted = false;

function syncAudioToggle(muted) {
  audioToggle.classList.toggle('is-muted', muted);
  audioToggle.textContent = muted ? '🔇' : '🔊';
  audioToggle.setAttribute('aria-label', muted ? 'Unmute background music' : 'Mute background music');
  audioToggle.setAttribute('aria-pressed', String(muted));
}

function startMusic() {
  if (!audio || musicStarted) return;
  audio.loop = true;
  audio.muted = false;
  audio.volume = 0.45;
  const attempt = () => {
    const playPromise = audio.play();
    if (!playPromise || typeof playPromise.then !== 'function') {
      musicStarted = !audio.paused;
      return;
    }
    playPromise.then(() => {
      musicStarted = true;
      syncAudioToggle(false);
    }).catch(() => {
      const retry = () => {
        audio.play().then(() => {
          musicStarted = true;
          syncAudioToggle(false);
        }).catch(() => {});
      };
      audio.addEventListener('canplay', retry, { once: true });
      audio.addEventListener('canplaythrough', retry, { once: true });
      try { audio.load(); } catch {}
    });
  };
  attempt();
}

if (audio) {
  audio.volume = 0.45;
  audio.loop = true;
  try { audio.load(); } catch {}
}

openButton.addEventListener('click', () => {
  if (gate.classList.contains('is-opening') || document.body.classList.contains('is-unlocked')) return;
  gate.classList.add('is-opening');
  startMusic();
  setTimeout(() => {
    gate.classList.add('is-open');
    gate.setAttribute('aria-hidden', 'true');
    document.body.classList.add('is-unlocked');
    startMusic();
  }, 900);
});

audioToggle.addEventListener('click', () => {
  if (!audio) return;
  if (!musicStarted || audio.paused) {
    startMusic();
    audio.muted = false;
    syncAudioToggle(false);
    return;
  }
  audio.muted = !audio.muted;
  syncAudioToggle(audio.muted);
});

const weddingDate = new Date('2026-11-20T05:30:00+05:30');
function updateCountdown() {
  const remaining = Math.max(0, weddingDate - new Date());
  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor(remaining / 3600000) % 24,
    minutes: Math.floor(remaining / 60000) % 60,
    seconds: Math.floor(remaining / 1000) % 60
  };
  Object.entries(values).forEach(([unit, value]) => {
    const node = document.querySelector(`[data-unit="${unit}"]`);
    if (node) node.textContent = String(value).padStart(2, '0');
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);

function launchConfetti() {
  let canvas = document.querySelector('#confettiCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confettiCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100';
    document.body.appendChild(canvas);
  }
  const context = canvas.getContext('2d');
  const fit = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  fit();

  const palette = [
    [212, 165, 116],
    [245, 209, 153],
    [199, 90, 107],
    [122, 138, 106],
    [255, 255, 255]
  ];
  const particles = [];

  const spawn = (originX, originY) => {
    for (let index = 0; index < 120; index += 1) {
      const theta = ((90 - 45 + Math.random() * 90) * Math.PI) / 180;
      const speed = 45 * (0.45 + Math.random() * 0.55);
      particles.push({
        x: originX * window.innerWidth,
        y: originY * window.innerHeight,
        vx: Math.cos(theta) * speed,
        vy: -Math.sin(theta) * speed,
        width: (4 + Math.random() * 8) * 1.1,
        height: (4 + Math.random() * 6) * 1.1,
        color: palette[index % palette.length],
        circle: index % 5 === 0,
        tilt: Math.random() * 360,
        tiltSpeed: (Math.random() - 0.5) * 14,
        life: 200
      });
    }
  };

  spawn(0.2, 0.4);
  spawn(0.5, 0.3);
  spawn(0.8, 0.4);
  setTimeout(() => spawn(0.5, 0.5), 250);

  const tick = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const piece = particles[index];
      piece.vx *= 0.9;
      piece.vy += 0.35;
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.tilt += piece.tiltSpeed;
      piece.life -= 1;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate((piece.tilt * Math.PI) / 180);
      context.fillStyle = `rgb(${piece.color.join(',')})`;
      if (piece.circle) {
        context.beginPath();
        context.arc(0, 0, piece.width / 2, 0, Math.PI * 2);
        context.fill();
      } else {
        context.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
      }
      context.restore();
      if (piece.life <= 0 || piece.y > window.innerHeight + 24) particles.splice(index, 1);
    }
    if (particles.length) requestAnimationFrame(tick);
    else context.clearRect(0, 0, canvas.width, canvas.height);
  };
  requestAnimationFrame(tick);
}

const scratchCanvas = document.querySelector('#scratchCanvas');
const scratchCard = document.querySelector('#scratchCard');
const dateSection = document.querySelector('#date');
if (scratchCanvas && scratchCard) {
  const context = scratchCanvas.getContext('2d', { willReadFrequently: true });
  let scratching = false;
  let revealed = false;
  let painted = false;

  const paint = () => {
    if (revealed || scratching) return;
    const rect = scratchCard.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    scratchCanvas.width = rect.width * scale;
    scratchCanvas.height = rect.height * scale;
    scratchCanvas.style.width = `${rect.width}px`;
    scratchCanvas.style.height = `${rect.height}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const gradient = context.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#d4a574');
    gradient.addColorStop(0.5, '#f5d199');
    gradient.addColorStop(1, '#b8853f');
    context.fillStyle = gradient;
    context.fillRect(0, 0, rect.width, rect.height);
    context.fillStyle = 'rgba(255,255,255,.35)';
    context.font = '600 14px Cinzel, serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('✦  SCRATCH TO REVEAL  ✦', rect.width / 2, rect.height / 2);
    painted = true;
  };

  const coverage = () => {
    const pixels = context.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
    let transparent = 0;
    let sampled = 0;
    for (let index = 3; index < pixels.length; index += 160) {
      sampled += 1;
      if (pixels[index] < 60) transparent += 1;
    }
    return sampled ? transparent / sampled : 0;
  };

  const reveal = () => {
    if (revealed) return;
    revealed = true;
    context.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    scratchCard.classList.add('revealed');
    dateSection?.classList.add('date-revealed');
    launchConfetti();
  };

  const erase = (clientX, clientY) => {
    if (revealed) return;
    const rect = scratchCanvas.getBoundingClientRect();
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.arc(clientX - rect.left, clientY - rect.top, 28, 0, Math.PI * 2);
    context.fill();
    if (coverage() > 0.45) reveal();
  };

  scratchCanvas.addEventListener('pointerdown', (event) => {
    scratching = true;
    try { scratchCanvas.setPointerCapture(event.pointerId); } catch {}
    erase(event.clientX, event.clientY);
  });
  scratchCanvas.addEventListener('pointermove', (event) => {
    if (!scratching) return;
    event.preventDefault();
    erase(event.clientX, event.clientY);
  });
  scratchCanvas.addEventListener('pointerup', () => {
    scratching = false;
    if (!revealed && painted && coverage() > 0.45) reveal();
  });
  scratchCanvas.addEventListener('pointerleave', () => { scratching = false; });
  paint();
  window.addEventListener('resize', paint);
}
