// gateThrough.js — 穿門成功 using VFX systems
import { anime } from '../gameFeel.js';
import { burst, shockwave, glowAt } from './particlePool.js';
import { hitStop, shakeBoard, flashScreen, dimBackground, restoreDim, focusRow, shockwaveDOM } from './cameraFeel.js';
import { flyNumber } from './vfxTypo.js';
import { playLayered } from './sfxBus.js';

export async function playGateThrough(row, mult) {
  const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
  const midRect = cells[1].getBoundingClientRect();
  const cx = midRect.left + midRect.width / 2;
  const cy = midRect.top + midRect.height / 2;

  // === ANTICIPATION ===
  const unfocus = focusRow(row);
  const dim = dimBackground(0.3, 80);
  anime({ targets: cells, backgroundColor: '#3a2800', duration: 80, easing: 'easeOutQuad' });

  await hitStop(80);

  // === IMPACT ===
  playLayered([{ name: 'gate_through' }, { name: 'score_fly', delay: 150, volume: 0.5 }]);
  flashScreen('#ffd700', 0.4, 250);
  shakeBoard(8 + mult, 200);
  shockwaveDOM(cx, cy, '#ffd700', 6, 350);
  shockwave(cx, cy, { scale: 5, duration: 350 });
  glowAt(cx, cy, { startScale: 1, endScale: 4, duration: 300 });

  // Cell glow
  anime({ targets: cells, backgroundColor: ['#ffd700', '#16213e'], boxShadow: ['0 0 30px 12px #ffd700', '0 0 0px transparent'], duration: 400, easing: 'easeOutExpo' });

  // Particles: sparks + streaks + debris
  burst(cx, cy, { texture: 'spark', count: 25, spread: 120, duration: 350, sizeMin: 0.5, sizeMax: 1.2 });
  burst(cx, cy, { texture: 'streak', count: 12, spread: 100, duration: 280, sizeMin: 0.8, sizeMax: 1.5 });
  burst(cx, cy, { texture: 'debris', count: 15, spread: 80, duration: 400, gravity: 20, sizeMin: 0.6, sizeMax: 1 });

  // === REWARD ===
  setTimeout(() => {
    const winRect = document.getElementById('win').getBoundingClientRect();
    flyNumber(`×${mult}`, { fromX: cx, fromY: cy, toX: winRect.left + winRect.width / 2, toY: winRect.top, size: 38 });
  }, 150);

  // Big Hit for mult >= 4
  if (mult >= 4) {
    playLayered([{ name: 'dragon_roar', delay: 100, volume: 0.7 }]);
    flashScreen('#ffd700', 0.5, 400);
    shockwaveDOM(cx, cy, '#ffd700', 8, 500);
    burst(cx, cy, { texture: 'glow', count: 8, spread: 150, duration: 500, sizeMin: 1, sizeMax: 2.5 });
  }

  // === SETTLE ===
  setTimeout(() => { restoreDim(200); unfocus(); }, 500);
}
