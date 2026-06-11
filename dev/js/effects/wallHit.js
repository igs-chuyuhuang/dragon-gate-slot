// wallHit.js — 碰壁強化版：~900ms total, double shake + chromatic + persistent crack
import { anime } from '../gameFeel.js';
import { burst } from './particlePool.js';
import { hitStop, shakeBoard, flashScreen, shockwaveDOM } from './cameraFeel.js';
import { playLayered } from './sfxBus.js';

export async function playWallHit(row) {
  const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
  if (!cells[1]) return;
  const [left, mid, right] = cells;
  const midRect = mid.getBoundingClientRect();
  const cx = midRect.left + midRect.width / 2;
  const cy = midRect.top + midRect.height / 2;

  // === ANTICIPATION (80ms) — red warning ===
  anime({ targets: mid, backgroundColor: '#5c1a1a', boxShadow: '0 0 18px 8px rgba(233,69,96,0.6)', duration: 80, easing: 'easeOutQuad' });
  flashScreen('#e94560', 0.18, 150);
  await hitStop(80);

  // === HIT STOP (100ms) — freeze frame ===
  await hitStop(100);

  // === IMPACT (500ms) ===
  playLayered([{ name: 'wall_hit' }, { name: 'crack', delay: 60, volume: 0.9 }]);

  // Double flash: initial burst + aftershock
  flashScreen('#e94560', 0.5, 200);
  setTimeout(() => flashScreen('#ff2244', 0.3, 300), 150);

  // Primary shake 16px/350ms + secondary aftershock
  shakeBoard(16, 350);
  setTimeout(() => shakeBoard(8, 200), 300);

  // Red shockwave from impact point
  shockwaveDOM(cx, cy, '#e94560', 6, 400);

  // Chromatic aberration flash (red/cyan split)
  const chroma = document.createElement('div');
  chroma.style.cssText = `position:fixed;inset:0;z-index:899;pointer-events:none;mix-blend-mode:screen;
    background:linear-gradient(90deg, rgba(255,0,0,0.15) 0%, transparent 40%, transparent 60%, rgba(0,255,255,0.15) 100%)`;
  document.body.appendChild(chroma);
  anime({ targets: chroma, opacity: [1, 0], duration: 300, easing: 'easeOutQuad', complete: () => chroma.remove() });

  // Multi-path crack overlay — persists 1.5s
  const crackSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 5 L47 25 L40 38 L50 50 L43 62 L50 78 L46 95' stroke='%23e94560' stroke-width='2.5' fill='none'/%3E%3Cpath d='M50 50 L62 55 L75 50' stroke='%23e94560' stroke-width='2' fill='none'/%3E%3Cpath d='M50 50 L38 58 L28 55' stroke='%23e94560' stroke-width='1.5' fill='none'/%3E%3Cpath d='M47 25 L35 20 L28 25' stroke='%23e94560' stroke-width='1.5' fill='none'/%3E%3C/svg%3E`;
  const crack = document.createElement('div');
  crack.style.cssText = `position:absolute;inset:-10%;width:120%;height:120%;background:url("${crackSvg}") center/contain no-repeat;z-index:5;pointer-events:none;opacity:0`;
  mid.style.position = 'relative';
  mid.appendChild(crack);
  anime({ targets: crack, opacity: [0, 1], duration: 80, easing: 'easeOutQuad' });
  anime({ targets: crack, opacity: [1, 0], duration: 1500, delay: 400, easing: 'easeInCubic', complete: () => crack.remove() });

  // Heavy red vignette
  const vig = document.createElement('div');
  vig.style.cssText = 'position:fixed;inset:0;background:radial-gradient(ellipse at center,transparent 30%,rgba(233,69,96,0.5) 100%);z-index:898;pointer-events:none';
  document.body.appendChild(vig);
  anime({ targets: vig, opacity: [0.8, 0], duration: 600, easing: 'easeOutQuad', complete: () => vig.remove() });

  // Squash mid cell — more exaggerated
  anime({ targets: mid, scaleX: [1, 1.35, 0.85, 1.06, 1], scaleY: [1, 0.75, 1.15, 0.96, 1], borderColor: ['#e94560', '#0f3460'], backgroundColor: ['#5c1a1a', 'transparent'], boxShadow: ['0 0 12px 5px rgba(233,69,96,0.5)', '0 0 0px transparent'], duration: 500, easing: 'easeOutElastic(1, 0.55)', complete: () => { mid.style.backgroundColor = 'transparent'; mid.style.boxShadow = ''; mid.style.transform = ''; } });

  // Push left/right 18px
  anime({ targets: left, translateX: [-18, 4, 0], duration: 450, easing: 'easeOutBack' });
  anime({ targets: right, translateX: [18, -4, 0], duration: 450, easing: 'easeOutBack' });

  // Heavy debris burst
  burst(cx, cy, { texture: 'triangle', count: 20, spread: 100, duration: 450, gravity: 30, sizeMin: 0.7, sizeMax: 1.4, tint: [0x8b0000, 0x555555, 0xe94560] });
  burst(cx, cy, { texture: 'redSpark', count: 24, spread: 120, duration: 420, sizeMin: 0.5, sizeMax: 1.3 });
  burst(cx, cy, { texture: 'debris', count: 14, spread: 90, duration: 500, gravity: 25, tint: [0x333333, 0x666666, 0x8b0000] });
}
