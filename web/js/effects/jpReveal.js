// jpReveal.js — JP 開獎儀式：full-screen centered, 5~8s
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
    // Full-screen centered overlay
    const overlay = document.createElement('div');
    overlay.className = 'jp-reveal-overlay';
    overlay.innerHTML = `
      <div class="jp-score-display">${score} 分</div>
      <div class="jp-bar-container">
        <div class="jp-bar-track"><div class="jp-beam"></div></div>
      </div>`;
    document.body.appendChild(overlay);
    anime({ targets: overlay, opacity: [0, 1], duration: 400, easing: 'easeOutQuad' });

    const beam = overlay.querySelector('.jp-beam');
    const track = overlay.querySelector('.jp-bar-track');
    const scoreDisplay = overlay.querySelector('.jp-score-display');

    // Gates appear sequentially
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
        }, i * 300);
      });
    }, 500);

    // Beam rises
    knockedGates.clear();
    const targetPct = Math.min(95, (score / 320) * 95);
    setTimeout(() => {
      playSfx('drum_roll', { loop: true, volume: 0.6 });
      anime({
        targets: beam, height: [0, targetPct + '%'], duration: 2800, easing: 'easeOutExpo',
        update: () => {
          const h = parseFloat(beam.style.height) || 0;
          GATES.forEach(g => {
            if (h >= g.pos - 1 && h <= g.pos + 1 && !knockedGates.has(g.tier)) {
              knockedGates.add(g.tier);
              playSfx('gate_open');
              shakeBoard(5, 120);
              flashScreen(g.color, 0.15, 200);
            }
          });
        },
        complete: () => { stopSfx('drum_roll'); setTimeout(() => showHitResult(overlay, scoreDisplay, jpResult, resolve), 400); }
      });
    }, 1600);
  });
}

async function showHitResult(overlay, scoreDisplay, jpResult, resolve) {
  knockedGates.clear();

  if (!jpResult.tier || jpResult.payout <= 0) {
    scoreDisplay.textContent = jpResult.msg;
    scoreDisplay.style.color = '#888';
    setTimeout(() => cleanup(overlay, resolve), 1500);
    return;
  }

  const gate = GATES.find(g => g.tier === jpResult.tier) || GATES[0];
  const isPerfect = jpResult.perfect === true;
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;

  // === IMPACT ===
  playLayered([{ name: 'jp_win' }, ...(isPerfect ? [{ name: 'dragon_roar', delay: 100, volume: 0.8 }] : [])]);

  // Flash (stronger)
  flashScreen(isPerfect ? '#ffd700' : gate.color, isPerfect ? 0.6 : 0.45, isPerfect ? 600 : 400);

  // Shockwave(s)
  shockwaveDOM(cx, cy, isPerfect ? '#ffd700' : gate.color, isPerfect ? 11 : 8, 550);
  if (isPerfect) { setTimeout(() => shockwaveDOM(cx, cy, '#ffd700', 9, 450), 150); setTimeout(() => shockwaveDOM(cx, cy, '#fffacd', 7, 400), 300); }

  // Board shake 15px on hit
  shakeBoard(isPerfect ? 15 : 12, isPerfect ? 2000 : 500);

  // Particle burst
  burst(cx, cy, { texture: 'star', count: isPerfect ? 50 : 25, spread: 160, duration: 500 });
  burst(cx, cy, { texture: 'spark', count: isPerfect ? 30 : 15, spread: 140, duration: 400 });
  glowAt(cx, cy, { startScale: 1, endScale: isPerfect ? 6 : 4, duration: 450, alpha: 0.9 });

  // PERFECT extras
  if (isPerfect) {
    explodeText('PERFECT!', { size: 64, color: '#ffd700', holdMs: 2000 });
    pulseScreen('#ffd700', 3);
    burst(cx, cy, { texture: 'glow', count: 12, spread: 180, duration: 600, sizeMin: 1.5, sizeMax: 3 });
  }

  // Tier label
  scoreDisplay.innerHTML = `<div style="font-size:52px;font-weight:900;color:${gate.color};text-shadow:0 0 20px ${gate.color},0 4px 8px rgba(0,0,0,0.8)">${gate.label}</div>`;
  anime({ targets: scoreDisplay.firstChild, scale: [0.2, 1.3, 1], duration: 600, easing: 'easeOutElastic(1, 0.4)' });

  // === REWARD: Count-up ===
  setTimeout(() => {
    playSfx('coin_count', { loop: true, volume: 0.5 });
    const numEl = countUp(jpResult.payout, { container: overlay, duration: isPerfect ? 2800 : 1800, suffix: isPerfect ? ' ×3' : '', size: 56 });

    setTimeout(() => {
      stopSfx('coin_count');
      anime({ targets: numEl, scale: [1, 1.4, 1], duration: 350, easing: 'easeOutElastic(1, 0.5)' });
      rain({ texture: 'coin', count: isPerfect ? 100 : 50, duration: isPerfect ? 2000 : 1400, stagger: isPerfect ? 1500 : 800 });
      setTimeout(() => cleanup(overlay, resolve), isPerfect ? 3500 : 2200);
    }, isPerfect ? 2800 : 1800);
  }, isPerfect ? 1200 : 800);
}

function cleanup(overlay, resolve) {
  anime({ targets: overlay, opacity: 0, duration: 400, easing: 'easeInQuad', complete: () => { overlay.remove(); resolve(); } });
  setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 1000);
}
