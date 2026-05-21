// jpReveal.js — JP 開獎儀式 using VFX systems
import { anime } from '../gameFeel.js';
import { burst, rain, shockwave, glowAt } from './particlePool.js';
import { hitStop, shakeBoard, flashScreen, shockwaveDOM, pulseScreen } from './cameraFeel.js';
import { explodeText, countUp } from './vfxTypo.js';
import { playSfx, stopSfx, playLayered } from './sfxBus.js';

const GATES = [
  { tier: 'basic', lo: 60, hi: 120, pos: 25, color: '#4488ff', label: 'BASIC' },
  { tier: 'major', lo: 130, hi: 200, pos: 55, color: '#ff8c00', label: 'MAJOR' },
  { tier: 'grand', lo: 210, hi: 320, pos: 85, color: '#dc143c', label: 'GRAND' },
];

let knockedGates = new Set();

export function playJpReveal(score, jpResult) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'jp-reveal-overlay';
    overlay.innerHTML = `<div class="jp-score-display">${score} 分</div><div class="jp-bar-container"><div class="jp-bar-track"><div class="jp-beam"></div></div></div>`;
    document.body.appendChild(overlay);
    anime({ targets: overlay, opacity: [0, 1], duration: 400, easing: 'easeOutQuad' });

    const beam = overlay.querySelector('.jp-beam');
    const track = overlay.querySelector('.jp-bar-track');
    const scoreDisplay = overlay.querySelector('.jp-score-display');

    // Gates appear
    setTimeout(() => {
      GATES.forEach((gate, i) => {
        setTimeout(() => {
          const el = document.createElement('div');
          el.className = 'jp-gate';
          el.style.bottom = gate.pos + '%';
          el.style.borderColor = gate.color;
          el.style.color = gate.color;
          el.innerHTML = `<span>${gate.label}</span>`;
          track.appendChild(el);
          anime({ targets: el, scaleX: [0, 1], opacity: [0, 1], duration: 300, easing: 'easeOutBack' });
        }, i * 250);
      });
    }, 500);

    // Beam rises
    knockedGates.clear();
    const targetPct = Math.min(95, (score / 320) * 95);
    setTimeout(() => {
      playSfx('drum_roll', { loop: true, volume: 0.6 });
      anime({
        targets: beam, height: [0, targetPct + '%'], duration: 2500, easing: 'easeOutExpo',
        update: () => {
          const h = parseFloat(beam.style.height) || 0;
          GATES.forEach(g => { if (h >= g.pos - 1 && h <= g.pos + 1 && !knockedGates.has(g.tier)) { knockedGates.add(g.tier); playSfx('gate_open'); shakeBoard(3, 100); } });
        },
        complete: () => { stopSfx('drum_roll'); setTimeout(() => showHitResult(overlay, scoreDisplay, jpResult, resolve), 300); }
      });
    }, 1400);
  });
}

async function showHitResult(overlay, scoreDisplay, jpResult, resolve) {
  knockedGates.clear();

  if (!jpResult.tier || jpResult.payout <= 0) {
    scoreDisplay.textContent = jpResult.msg;
    scoreDisplay.style.color = '#888';
    setTimeout(() => cleanup(overlay, resolve), 1200);
    return;
  }

  const gate = GATES.find(g => g.tier === jpResult.tier) || GATES[0];
  const isPerfect = jpResult.perfect === true;

  // === IMPACT ===
  playLayered([{ name: 'jp_win' }, ...(isPerfect ? [{ name: 'dragon_roar', delay: 100, volume: 0.8 }] : [])]);
  flashScreen(isPerfect ? '#ffd700' : gate.color, isPerfect ? 0.6 : 0.4, isPerfect ? 600 : 400);
  shockwaveDOM(window.innerWidth / 2, window.innerHeight / 2, isPerfect ? '#ffd700' : gate.color, isPerfect ? 10 : 7, 500);
  if (isPerfect) setTimeout(() => shockwaveDOM(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 8, 400), 150);

  shakeBoard(isPerfect ? 12 : 8, isPerfect ? 2000 : 300);
  burst(window.innerWidth / 2, window.innerHeight / 2, { texture: 'spark', count: isPerfect ? 60 : 30, spread: 150, duration: 450 });
  glowAt(window.innerWidth / 2, window.innerHeight / 2, { startScale: 1, endScale: isPerfect ? 5 : 3, duration: 400 });

  // PERFECT text
  if (isPerfect) {
    explodeText('PERFECT!', { size: 56, color: '#ffd700', holdMs: 1800 });
    pulseScreen('#ffd700', 3);
  }

  // Tier label
  scoreDisplay.innerHTML = `<div style="font-size:48px;font-weight:900;color:${gate.color};text-shadow:0 0 20px ${gate.color}">${gate.label}</div>`;
  anime({ targets: scoreDisplay.firstChild, scale: [0.3, 1.2, 1], duration: 500, easing: 'easeOutElastic(1, 0.4)' });

  // Count-up
  setTimeout(() => {
    playSfx('coin_count', { loop: true, volume: 0.5 });
    const numEl = countUp(jpResult.payout, { container: overlay, duration: isPerfect ? 2500 : 1500, suffix: isPerfect ? ' ×3' : '', size: 52 });

    setTimeout(() => {
      stopSfx('coin_count');
      anime({ targets: numEl, scale: [1, 1.3, 1], duration: 300, easing: 'easeOutElastic(1, 0.5)' });
      rain({ texture: 'coin', count: isPerfect ? 80 : 40, duration: 1400, stagger: isPerfect ? 1200 : 600 });
      setTimeout(() => cleanup(overlay, resolve), isPerfect ? 3500 : 2000);
    }, isPerfect ? 2500 : 1500);
  }, isPerfect ? 1000 : 700);
}

function cleanup(overlay, resolve) {
  anime({ targets: overlay, opacity: 0, duration: 400, easing: 'easeInQuad', complete: () => { overlay.remove(); resolve(); } });
  setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 1000);
}
