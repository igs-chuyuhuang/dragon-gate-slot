// bigWin.js — 分級 Big Win: layered ceremony with Graphics particles
import { anime, getPixi } from '../gameFeel.js';

const coinAudio = new Audio('assets/sfx/coin_count.mp3');
const jpWin = new Audio('assets/sfx/jp_win.mp3');
coinAudio.loop = true;

const TIERS = [
  { threshold: 10, label: 'BIG WIN', color: '#ffd700', shake: 4, particles: 40 },
  { threshold: 30, label: 'MEGA WIN', color: '#ff6b35', shake: 8, particles: 70 },
  { threshold: 80, label: '🐉 DRAGON WIN 🐉', color: '#ff2222', shake: 12, particles: 100 },
];

export function playBigWin(payout, bet) {
  const ratio = payout / bet;
  const tier = [...TIERS].reverse().find(t => ratio >= t.threshold);
  if (!tier) return Promise.resolve();

  return new Promise(resolve => {
    // === Layer 1: Dark overlay ===
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:1100;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0';
    document.body.appendChild(overlay);
    anime({ targets: overlay, opacity: [0, 1], duration: 250, easing: 'easeOutQuad' });

    // === Layer 2: Shockwave ===
    setTimeout(() => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      const sw = document.createElement('div');
      sw.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:50px;height:50px;border-radius:50%;border:3px solid ${tier.color};transform:translate(-50%,-50%);z-index:1101;pointer-events:none;box-shadow:0 0 10px ${tier.color}`;
      document.body.appendChild(sw);
      anime({ targets: sw, scale: [1, 8], opacity: [1, 0], duration: 500, easing: 'easeOutQuad', complete: () => sw.remove() });
    }, 200);

    // === Layer 3: Tier label explode ===
    const label = document.createElement('div');
    label.textContent = tier.label;
    label.style.cssText = `font-size:48px;font-weight:900;color:${tier.color};text-shadow:0 0 20px ${tier.color},0 4px 8px rgba(0,0,0,0.8);pointer-events:none`;
    overlay.appendChild(label);
    anime({ targets: label, scale: [0.2, 1.3, 1], opacity: [0, 1], duration: 500, delay: 300, easing: 'easeOutElastic(1, 0.4)' });

    // === Layer 4: Count-up number + ghost ===
    const numEl = document.createElement('div');
    numEl.style.cssText = 'font-size:56px;font-weight:bold;color:#fff;text-shadow:0 0 12px #ffd700;margin-top:12px;pointer-events:none';
    numEl.textContent = '0';
    overlay.appendChild(numEl);

    setTimeout(() => {
      coinAudio.currentTime = 0;
      coinAudio.play().catch(() => {});

      const counter = { val: 0 };
      anime({
        targets: counter, val: payout, duration: 1500, easing: 'easeOutExpo', round: 1,
        update: () => { numEl.textContent = Math.round(counter.val).toLocaleString(); }
      });

      // === Layer 5: Board shake during count ===
      const board = document.querySelector('.board');
      const shk = anime({
        targets: board,
        translateX: [{ value: -tier.shake, duration: 50 }, { value: tier.shake, duration: 50 }],
        loop: 8, easing: 'easeInOutSine'
      });

      // === Layer 6: Particles from sides ===
      spawnSideParticles(tier.particles, tier.color);

      // === Finish ===
      setTimeout(() => {
        coinAudio.pause();
        shk.pause();
        anime({ targets: board, translateX: 0, duration: 100 });
        jpWin.currentTime = 0;
        jpWin.play().catch(() => {});
        anime({ targets: numEl, scale: [1, 1.3, 1], duration: 300, easing: 'easeOutElastic(1, 0.5)' });
        setTimeout(() => {
          anime({ targets: overlay, opacity: 0, duration: 400, easing: 'easeInQuad', complete: () => overlay.remove() });
          resolve();
        }, 800);
      }, 1800);
    }, 600);
  });
}

async function spawnSideParticles(count, color) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;
  const w = window.innerWidth, h = window.innerHeight;
  const hex = parseInt(color.replace('#', ''), 16);

  for (let i = 0; i < count; i++) {
    const g = new PIXI.Graphics();
    g.beginFill(i % 3 === 0 ? hex : [0xffd700, 0xfffacd][i % 2]);
    g.drawCircle(0, 0, 3 + Math.random() * 4);
    g.endFill();
    const fromLeft = i % 2 === 0;
    const sx = fromLeft ? 0 : w;
    const sy = h * 0.3 + Math.random() * h * 0.4;
    g.position.set(sx, sy);
    app.stage.addChild(g);

    const dir = fromLeft ? 1 : -1;
    const tx = sx + dir * (80 + Math.random() * 180);
    const ty = sy + (Math.random() - 0.5) * 120 - 40;
    anime({ targets: g.position, x: tx, y: [sy, ty, ty + 60], duration: 1100 + Math.random() * 500, delay: Math.random() * 400, easing: 'easeOutQuad' });
    anime({ targets: g, alpha: 0, duration: 1400, delay: Math.random() * 400, easing: 'easeInQuad', complete: () => { app.stage.removeChild(g); g.destroy(); } });
  }
}
