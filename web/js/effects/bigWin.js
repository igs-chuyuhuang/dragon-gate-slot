// bigWin.js — 分級 Big Win using VFX systems
import { anime } from '../gameFeel.js';
import { burst, rain, shockwave } from './particlePool.js';
import { shakeBoard, flashScreen, shockwaveDOM } from './cameraFeel.js';
import { explodeText, countUp } from './vfxTypo.js';
import { playSfx, stopSfx } from './sfxBus.js';

const TIERS = [
  { threshold: 10, label: 'BIG WIN', color: '#ffd700', shake: 5, particles: 40 },
  { threshold: 30, label: 'MEGA WIN', color: '#ff6b35', shake: 8, particles: 70 },
  { threshold: 80, label: '🐉 DRAGON WIN 🐉', color: '#ff2222', shake: 12, particles: 100 },
];

export function playBigWin(payout, bet) {
  const ratio = payout / bet;
  const tier = [...TIERS].reverse().find(t => ratio >= t.threshold);
  if (!tier) return Promise.resolve();

  return new Promise(resolve => {
    // Dark overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:1100;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0';
    document.body.appendChild(overlay);
    anime({ targets: overlay, opacity: [0, 1], duration: 250, easing: 'easeOutQuad' });

    // Shockwave
    setTimeout(() => {
      shockwaveDOM(window.innerWidth / 2, window.innerHeight / 2, tier.color, 8, 500);
      flashScreen(tier.color, 0.3, 300);
    }, 200);

    // Tier label
    setTimeout(() => explodeText(tier.label, { size: 50, color: tier.color, holdMs: 2500 }), 350);

    // Count-up
    setTimeout(() => {
      playSfx('coin_count', { loop: true, volume: 0.6 });
      const numEl = countUp(payout, { container: overlay, duration: 1500, size: 54 });

      // Shake during count
      const shk = setInterval(() => shakeBoard(tier.shake, 100), 120);

      // Side particles
      rain({ texture: 'coin', count: tier.particles, duration: 1400, stagger: 600, tint: [0xffd700, 0xffaa00] });

      // Finish
      setTimeout(() => {
        clearInterval(shk);
        stopSfx('coin_count');
        playSfx('jp_win');
        anime({ targets: numEl, scale: [1, 1.3, 1], duration: 300, easing: 'easeOutElastic(1, 0.5)' });
        setTimeout(() => {
          anime({ targets: overlay, opacity: 0, duration: 400, easing: 'easeInQuad', complete: () => { overlay.remove(); resolve(); } });
        }, 800);
      }, 1800);
    }, 600);
  });
}
