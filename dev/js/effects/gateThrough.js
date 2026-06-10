// gateThrough.js — 穿門成功：800ms total (200ms anticipation + 100ms hitStop + 300ms impact + 200ms settle)
import { anime } from '../gameFeel.js';
import { burst, shockwave, glowAt } from './particlePool.js';
import { hitStop, shakeBoard, flashScreen, dimBackground, restoreDim, focusRow, shockwaveDOM } from './cameraFeel.js';
import { flyNumber } from './vfxTypo.js';
import { playLayered } from './sfxBus.js';

export async function playGateThrough(row, mult) {
  const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
  if (!cells[1]) return; // guard: cells must exist
  const midRect = cells[1].getBoundingClientRect();
  const cx = midRect.left + midRect.width / 2;
  const cy = midRect.top + midRect.height / 2;

  // === ANTICIPATION (80ms) — immediate visual ===
  const unfocus = focusRow(row);
  dimBackground(0.35, 80);
  anime({ targets: cells, backgroundColor: ['transparent', '#3a2800'], boxShadow: ['0 0 0px transparent', '0 0 16px 6px rgba(255,215,0,0.5)'], duration: 80, easing: 'easeOutQuad' });
  flashScreen('#ffd700', 0.15, 150); // immediate subtle flash so screenshot catches it

  await hitStop(80);

  // === HIT STOP (80ms) ===
  await hitStop(80);

  // === IMPACT (300ms) ===
  playLayered([{ name: 'gate_through' }, { name: 'score_fly', delay: 200, volume: 0.5 }]);

  // Flash — reduced opacity to avoid covering board
  flashScreen('#ffd700', 0.28, 300);

  // Shockwave
  shockwaveDOM(cx, cy, '#ffd700', 7, 400);
  shockwave(cx, cy, { scale: 6, duration: 400 });

  // Glow bloom
  glowAt(cx, cy, { startScale: 1, endScale: 5, duration: 350, alpha: 0.9 });

  // Board shake 8px
  shakeBoard(8, 200);

  // Cell glow
  anime({ targets: cells, backgroundColor: ['#ffd700', 'transparent'], boxShadow: ['0 0 30px 14px #ffd700', '0 0 0px transparent'], duration: 400, easing: 'easeOutExpo' });

  // Particles: star sparks + streaks + debris (mixed shapes)
  burst(cx, cy, { texture: 'star', count: 20, spread: 130, duration: 400, sizeMin: 0.5, sizeMax: 1.3 });
  burst(cx, cy, { texture: 'streak', count: 15, spread: 110, duration: 320, sizeMin: 0.8, sizeMax: 1.5 });
  burst(cx, cy, { texture: 'debris', count: 15, spread: 90, duration: 450, gravity: 20, sizeMin: 0.6, sizeMax: 1 });
  burst(cx, cy, { texture: 'spark', count: 12, spread: 140, duration: 380, sizeMin: 0.4, sizeMax: 1 });

  // === REWARD (after 200ms) ===
  setTimeout(() => {
    const winRect = document.getElementById('win').getBoundingClientRect();
    flyNumber(`×${mult}`, { fromX: cx, fromY: cy, toX: winRect.left + winRect.width / 2, toY: winRect.top, size: 42 });
  }, 200);

  // Big Hit for mult >= 4
  if (mult >= 4) {
    playLayered([{ name: 'dragon_roar', delay: 100, volume: 0.7 }]);
    flashScreen('#ffd700', 0.55, 450);
    shockwaveDOM(cx, cy, '#ffd700', 9, 550);
    shakeBoard(12, 300);
    burst(cx, cy, { texture: 'glow', count: 10, spread: 160, duration: 500, sizeMin: 1.2, sizeMax: 2.5 });
  }

  // === SETTLE (200ms) ===
  setTimeout(() => { restoreDim(200); unfocus(); }, 500);
}
