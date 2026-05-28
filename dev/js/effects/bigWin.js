// bigWin.js — 分級 Big Win: 3000ms (500ms expand + 2000ms count-up + 500ms settle)
import { anime } from '../gameFeel.js';
import { burst, rain } from './particlePool.js';
import { shakeBoard, flashScreen, shockwaveDOM } from './cameraFeel.js';
import { explodeText, countUp } from './vfxTypo.js';
import { playSfx, stopSfx } from './sfxBus.js';

const TIERS = [
  { threshold: 10, label: 'BIG WIN', color: '#ffd700', shake: 6, particles: 50 },
  { threshold: 30, label: 'MEGA WIN', color: '#ff6b35', shake: 10, particles: 80 },
  { threshold: 80, label: '🐉 DRAGON WIN 🐉', color: '#ff2222', shake: 14, particles: 120 },
];

export function playBigWin(payout, bet) {
  const ratio = payout / bet;
  const tier = [...TIERS].reverse().find(t => ratio >= t.threshold);
  if (!tier) return Promise.resolve();

  return new Promise(resolve => {
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;

    // === EXPAND (500ms) ===
    // Dark overlay — centered flex
    const overlay = document.createElement('div');
    overlay.className = 'bigwin-overlay';
    document.body.appendChild(overlay);
    anime({ targets: overlay, opacity: [0, 1], duration: 300, easing: 'easeOutQuad' });

    // Shockwave + flash
    setTimeout(() => {
      shockwaveDOM(cx, cy, tier.color, 9, 550);
      flashScreen(tier.color, 0.35, 350);
    }, 250);

    // Tier label (500ms in)
    setTimeout(() => explodeText(tier.label, { size: 56, color: tier.color, holdMs: 2800 }), 400);

    // === COUNT-UP (2000ms) ===
    setTimeout(() => {
      playSfx('coin_count', { loop: true, volume: 0.6 });
      const numEl = countUp(payout, { container: overlay, duration: 2000, size: 56 });

      // Sustained shake
      const shk = setInterval(() => shakeBoard(tier.shake, 100), 130);

      // Coin rain from sides
      rain({ texture: 'coin', count: tier.particles, duration: 1600, stagger: 800, tint: [0xffd700, 0xffaa00] });
      burst(cx, cy, { texture: 'star', count: 20, spread: 150, duration: 500 });

      // === SETTLE (500ms) ===
      setTimeout(() => {
        clearInterval(shk);
        stopSfx('coin_count');
        playSfx('jp_win');
        anime({ targets: numEl, scale: [1, 1.4, 1], duration: 350, easing: 'easeOutElastic(1, 0.5)' });
        setTimeout(() => {
          anime({ targets: overlay, opacity: 0, duration: 400, easing: 'easeInQuad', complete: () => { overlay.remove(); resolve(); } });
        }, 500);
      }, 2000);
    }, 600);
  });
}
