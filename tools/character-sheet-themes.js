/* character-sheet-themes.js — theme picker, palette switching, particles */

let _particleCanvas = null;
let _particleAnim = null;

function getCurrentTheme() {
  return document.body.dataset.theme || '';
}

function applyTheme(name) {
  if (name) {
    document.body.dataset.theme = name;
  } else {
    delete document.body.dataset.theme;
  }
  localStorage.setItem('dnd-sheet-theme', name || '');
  document.querySelectorAll('.theme-swatch').forEach(sw => {
    sw.classList.toggle('active', sw.dataset.theme === (name || ''));
  });
  applyThemeDecorations(name);
}

function injectThemePicker() {
  if (document.querySelector('.theme-picker')) return;
  const themes = [
    { id: '',           label: 'Vanilla',   dot: '#c4a87d' },
    //{ id: 'draconic',  label: 'Draconic',  dot: '#7a2000' },
    //{ id: 'abyss',     label: 'Abyss',     dot: '#4a28a0' },
    //{ id: 'fairy',     label: 'Fairy',     dot: '#c880b0' },
    { id: 'underdark', label: 'Underdark',  dot: '#3a9e8e' },
  ];
  const current = getCurrentTheme();
  const picker = document.createElement('div');
  picker.className = 'theme-picker';
  picker.innerHTML = `
    <button class="theme-picker-btn" onclick="this.nextElementSibling.classList.toggle('open')" title="Change Theme">🎨</button>
    <div class="theme-picker-panel">
      ${themes.map(t => `
        <div class="theme-swatch ${current === t.id ? 'active' : ''}" data-theme="${t.id}"
             onclick="applyTheme('${t.id}');this.closest('.theme-picker-panel').classList.remove('open');">
          <div class="theme-swatch-dot" style="background:${t.dot};"></div>
          ${t.label}
        </div>
      `).join('')}
    </div>
  `;
  document.body.appendChild(picker);
  document.addEventListener('click', e => {
    if (!picker.contains(e.target)) {
      picker.querySelector('.theme-picker-panel').classList.remove('open');
    }
  });
}

// Only particles remain — no SVG corner ornaments or dividers
function applyThemeDecorations(theme) {
  stopParticles();
  if (!theme) return;
  if (theme === 'draconic') startParticles('ember');
  if (theme === 'fairy')    startParticles('sparkle');
}

function startParticles(type) {
  stopParticles();
  const canvas = document.createElement('canvas');
  canvas.className = 'theme-particles';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  _particleCanvas = canvas;
  const ctx = canvas.getContext('2d');

  if (type === 'ember') {
    const particles = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height * (0.2 + Math.random() * 0.8),
      size: Math.random() * 1.8 + 0.8,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: -(Math.random() * 0.6 + 0.25),
      life: Math.random()
    }));
    function loopEmber() {
      if (!_particleCanvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX + Math.sin(Date.now() * 0.001 + p.size) * 0.15;
        p.y += p.speedY;
        p.life -= 0.004;
        if (p.life <= 0 || p.y < -10) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 5;
          p.life = 0.4 + Math.random() * 0.5;
        }
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        g.addColorStop(0, `rgba(200,90,20,${(p.life * 0.5).toFixed(2)})`);
        g.addColorStop(0.5, `rgba(160,45,0,${(p.life * 0.2).toFixed(2)})`);
        g.addColorStop(1, 'rgba(130,14,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      _particleAnim = requestAnimationFrame(loopEmber);
    }
    loopEmber();

  } else if (type === 'sparkle') {
    const cols = ['#dca0b8', '#b0a0d8', '#88c8a8', '#d8c080', '#d0d0f0'];
    const particles = Array.from({ length: 26 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.4 + 0.5,
      speedX: (Math.random() - 0.5) * 0.22,
      speedY: (Math.random() - 0.5) * 0.22,
      phase: Math.random() * Math.PI * 2,
      color: cols[i % cols.length]
    }));
    function loopSparkle() {
      if (!_particleCanvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() * 0.001;
      particles.forEach(p => {
        p.x = (p.x + p.speedX + canvas.width)  % canvas.width;
        p.y = (p.y + p.speedY + canvas.height) % canvas.height;
        const glow = (Math.sin(t + p.phase) + 1) / 2;
        const alpha = Math.floor(glow * 110).toString(16).padStart(2, '0');
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
        g.addColorStop(0, `${p.color}${alpha}`);
        g.addColorStop(1, `${p.color}00`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
      _particleAnim = requestAnimationFrame(loopSparkle);
    }
    loopSparkle();
  }
}

function stopParticles() {
  if (_particleAnim) { cancelAnimationFrame(_particleAnim); _particleAnim = null; }
  if (_particleCanvas) { _particleCanvas.remove(); _particleCanvas = null; }
}
