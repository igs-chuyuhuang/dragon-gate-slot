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
  flashScreen('#e94560', 0.15, 150);

  await hitStop(80);

  // === HIT STOP (80ms) ===
  await hitStop(80);

  // === IMPACT (450ms) ===
  playLayered([{ name: 'wall_hit' }, { name: 'crack', delay: 80, volume: 0.8 }]);

  // Red flash — stronger + longer
  flashScreen('#e94560', 0.4, 400);

  // Board shake 14px, 300ms — much more visible
  shakeBoard(14, 300);

  // Crack overlay — persists 1.2s so player sees it
  const crack = document.createElement('div');
  crack.style.cssText = `position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 10 L48 30 L42 45 L50 50 L45 65 L50 80 L47 95' stroke='%23e94560' stroke-width='2' fill='none'/%3E%3Cpath d='M50 50 L60 55 L70 52' stroke='%23e94560' stroke-width='1.5' fill='none'/%3E%3C/svg%3E") center/contain no-repeat;z-index:5;pointer-events:none;opacity:0.9`;
  mid.style.position = 'relative';
  mid.appendChild(crack);
  anime({ targets: crack, opacity: [0.9, 0], duration: 1200, delay: 200, easing: 'easeInQuad', complete: () => crack.remove() });

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
