// wallHit.js — 碰壁：680ms total (100ms anticipation + 80ms hitStop + 300ms impact + 200ms settle)
import { anime } from '../gameFeel.js';
import { burst } from './particlePool.js';
import { hitStop, shakeBoard, flashScreen, shockwaveDOM } from './cameraFeel.js';
import { playLayered } from './sfxBus.js';

export async function playWallHit(row) {
  const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
  if (!cells[1]) return; // guard
  const [left, mid, right] = cells;
  const midRect = mid.getBoundingClientRect();
  const cx = midRect.left + midRect.width / 2;
  const cy = midRect.top + midRect.height / 2;

  // === ANTICIPATION (60ms) — immediate red flash ===
  anime({ targets: mid, backgroundColor: '#5c1a1a', boxShadow: '0 0 14px 6px rgba(233,69,96,0.5)', duration: 60, easing: 'easeOutQuad' });
  flashScreen('#e94560', 0.12, 120); // immediate so screenshot catches it

  await hitStop(60);

  // === HIT STOP (60ms) ===
  await hitStop(60);

  // === IMPACT (300ms) ===
  playLayered([{ name: 'wall_hit' }, { name: 'crack', delay: 80, volume: 0.7 }]);

  // Red flash
  flashScreen('#e94560', 0.35, 300);

  // Board shake 10px
  shakeBoard(10, 150);

  // Red vignette
  const vig = document.createElement('div');
  vig.style.cssText = 'position:fixed;inset:0;background:radial-gradient(ellipse at center,transparent 35%,rgba(233,69,96,0.4) 100%);z-index:898;pointer-events:none';
  document.body.appendChild(vig);
  anime({ targets: vig, opacity: [0.7, 0], duration: 500, easing: 'easeOutQuad', complete: () => vig.remove() });

  // Squash mid cell
  anime({ targets: mid, scaleX: [1, 1.3, 0.88, 1.05, 1], scaleY: [1, 0.8, 1.12, 0.97, 1], borderColor: ['#e94560', '#0f3460'], backgroundColor: ['#5c1a1a', '#16213e'], boxShadow: ['0 0 10px 4px rgba(233,69,96,0.4)', '0 0 0px transparent'], duration: 450, easing: 'easeOutElastic(1, 0.6)' });

  // Push left/right 14px
  anime({ targets: left, translateX: [-14, 3, 0], duration: 400, easing: 'easeOutBack' });
  anime({ targets: right, translateX: [14, -3, 0], duration: 400, easing: 'easeOutBack' });

  // Debris: triangle + redSpark (mixed shapes)
  burst(cx, cy, { texture: 'triangle', count: 15, spread: 80, duration: 400, gravity: 25, sizeMin: 0.6, sizeMax: 1.2, tint: [0x8b0000, 0x555555, 0xe94560] });
  burst(cx, cy, { texture: 'redSpark', count: 18, spread: 100, duration: 380, sizeMin: 0.5, sizeMax: 1.2 });
  burst(cx, cy, { texture: 'debris', count: 10, spread: 70, duration: 450, gravity: 20, tint: [0x444444, 0x666666] });

  // === SETTLE (200ms) — auto via animation durations ===
}
