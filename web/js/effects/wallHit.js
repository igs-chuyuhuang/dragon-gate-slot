// wallHit.js — 碰壁 using VFX systems
import { anime } from '../gameFeel.js';
import { burst } from './particlePool.js';
import { hitStop, shakeBoard, flashScreen, shockwaveDOM } from './cameraFeel.js';
import { playLayered } from './sfxBus.js';

export async function playWallHit(row) {
  const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
  const [left, mid, right] = cells;
  const midRect = mid.getBoundingClientRect();
  const cx = midRect.left + midRect.width / 2;
  const cy = midRect.top + midRect.height / 2;

  // === ANTICIPATION ===
  anime({ targets: mid, backgroundColor: '#5c1a1a', duration: 60, easing: 'easeOutQuad' });

  await hitStop(100);

  // === IMPACT ===
  playLayered([{ name: 'wall_hit' }, { name: 'crack', delay: 80, volume: 0.7 }]);
  flashScreen('#e94560', 0.3, 300);
  shakeBoard(10, 220);

  // Red vignette
  const vig = document.createElement('div');
  vig.style.cssText = 'position:fixed;inset:0;background:radial-gradient(ellipse at center,transparent 40%,rgba(233,69,96,0.35) 100%);z-index:898;pointer-events:none';
  document.body.appendChild(vig);
  anime({ targets: vig, opacity: [0.6, 0], duration: 600, easing: 'easeOutQuad', complete: () => vig.remove() });

  // Squash mid cell
  anime({ targets: mid, scaleX: [1, 1.3, 0.9, 1.05, 1], scaleY: [1, 0.8, 1.1, 0.97, 1], borderColor: ['#e94560', '#0f3460'], backgroundColor: ['#5c1a1a', '#16213e'], duration: 400, easing: 'easeOutElastic(1, 0.6)' });

  // Push left/right
  anime({ targets: left, translateX: [-14, 2, 0], duration: 350, easing: 'easeOutBack' });
  anime({ targets: right, translateX: [14, -2, 0], duration: 350, easing: 'easeOutBack' });

  // Red debris particles
  burst(cx, cy, { texture: 'redSpark', count: 20, spread: 90, duration: 400, sizeMin: 0.5, sizeMax: 1.2 });
  burst(cx, cy, { texture: 'debris', count: 15, spread: 70, duration: 450, gravity: 25, sizeMin: 0.6, sizeMax: 1, tint: [0x8b0000, 0x555555, 0xe94560] });
}
