// spinButton.js — 三階段蓄力 + 強化釋放
// 光暈用獨立 overlay div，release 時直接 remove，100% 不殘留
import { anime, getPixi } from '../gameFeel.js';

let chargeStart = 0;
let stage = 0;
let particleInterval = null;
let glowEl = null;
let rafId = null;

const chargeAudio = new Audio('assets/sfx/spin_charge.mp3');
const releaseAudio = new Audio('assets/sfx/spin_release.mp3');
chargeAudio.loop = true;

export function initSpinButton(btnEl) {
  const board = document.querySelector('.board');

  btnEl.addEventListener('pointerdown', () => {
    if (btnEl.disabled) return;
    chargeStart = Date.now();
    stage = 0;
    chargeAudio.volume = 0;
    chargeAudio.currentTime = 0;
    chargeAudio.play().catch(() => {});

    // Create glow overlay (positioned behind button)
    if (glowEl) glowEl.remove();
    glowEl = document.createElement('div');
    glowEl.className = 'spin-glow';
    btnEl.parentElement.style.position = 'relative';
    btnEl.insertAdjacentElement('beforebegin', glowEl);

    // Shrink button
    btnEl.classList.add('spin-charging');

    // Progressive tick
    const tick = () => {
      if (!chargeStart) return;
      const elapsed = Date.now() - chargeStart;
      chargeAudio.volume = Math.min(0.7, elapsed / 1200);

      if (elapsed > 300 && stage < 1) { stage = 1; board.classList.add('charge-stage1'); }
      if (elapsed > 800 && stage < 2) {
        stage = 2;
        board.classList.add('charge-stage2');
        if (!particleInterval) particleInterval = setInterval(() => spawnConvergingParticle(btnEl), 80);
      }

      // Progressive shake on button
      const shakeAmp = stage === 0 ? 2 : stage === 1 ? Math.min(5, 2 + (elapsed - 300) / 200) : 5;
      btnEl.style.transform = `scale(${stage === 0 ? 0.88 : 0.85}) translateX(${(Math.random() - 0.5) * shakeAmp * 2}px)`;

      // Glow intensity (CSS variable drives the size)
      if (glowEl) {
        const intensity = Math.min(1, elapsed / 800);
        glowEl.style.opacity = intensity;
        glowEl.style.transform = `scale(${1 + intensity * 0.3})`;
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  });

  const release = () => {
    if (!chargeStart) return;
    chargeStart = 0;
    chargeAudio.pause();
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (particleInterval) { clearInterval(particleInterval); particleInterval = null; }

    // === NUCLEAR CLEANUP: remove glow overlay entirely ===
    if (glowEl) { glowEl.remove(); glowEl = null; }

    // Remove all CSS classes
    board.classList.remove('charge-stage1', 'charge-stage2');
    btnEl.classList.remove('spin-charging');

    // Reset button inline styles completely
    anime.remove(btnEl);
    btnEl.style.transform = '';
    btnEl.style.boxShadow = '';
    btnEl.style.filter = '';

    releaseAudio.currentTime = 0;
    releaseAudio.play().catch(() => {});

    // Hit stop 80ms → flash → bounce
    setTimeout(() => {
      const flash = document.createElement('div');
      flash.className = 'spin-release-flash';
      document.body.appendChild(flash);
      anime({ targets: flash, opacity: [0.6, 0], scale: [0.5, 2], duration: 250, easing: 'easeOutExpo', complete: () => flash.remove() });

      anime({
        targets: btnEl,
        scale: [1.18, 0.96, 1],
        duration: 350,
        easing: 'easeOutElastic(1, 0.5)'
      });
    }, 80);

    // Final insurance: force-clear everything after 500ms
    setTimeout(() => {
      btnEl.style.boxShadow = '';
      btnEl.style.filter = '';
      if (glowEl) { glowEl.remove(); glowEl = null; }
    }, 500);
  };

  btnEl.addEventListener('pointerup', release);
  btnEl.addEventListener('pointerleave', release);
  btnEl.addEventListener('pointercancel', release);
}

async function spawnConvergingParticle(btnEl) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;

  const btnRect = btnEl.getBoundingClientRect();
  const tx = btnRect.left + btnRect.width / 2;
  const ty = btnRect.top + btnRect.height / 2;
  const angle = Math.random() * Math.PI * 2;
  const dist = 120 + Math.random() * 80;
  const sx = tx + Math.cos(angle) * dist;
  const sy = ty + Math.sin(angle) * dist;

  const g = new PIXI.Graphics();
  g.beginFill(0xffd700);
  g.drawCircle(0, 0, 2 + Math.random() * 2);
  g.endFill();
  g.position.set(sx, sy);
  app.stage.addChild(g);

  anime({
    targets: g.position, x: tx, y: ty,
    duration: 400 + Math.random() * 200, easing: 'easeInQuad',
    complete: () => { app.stage.removeChild(g); g.destroy(); }
  });
  anime({ targets: g, alpha: [1, 0.3], duration: 500, easing: 'linear' });
}
