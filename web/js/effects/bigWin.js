// bigWin.js — 分級 Big Win count-up + 粒子噴射
import { anime, getPixi } from '../gameFeel.js';

const coinAudio = new Audio('assets/sfx/coin_count.mp3');
const jpWin = new Audio('assets/sfx/jp_win.mp3');
coinAudio.loop = true;

const TIERS = [
  { threshold: 10, label: 'BIG WIN', color: '#ffd700', shake: 4, particles: 40 },
  { threshold: 30, label: 'MEGA WIN', color: '#ff6b35', shake: 8, particles: 80 },
  { threshold: 80, label: '🐉 DRAGON WIN 🐉', color: '#ff2222', shake: 12, particles: 120 },
];

export function playBigWin(payout, bet) {
  const ratio = payout / bet;
  const tier = [...TIERS].reverse().find(t => ratio >= t.threshold);
  if (!tier) return Promise.resolve(); // Not a big win

  return new Promise(resolve => {
    coinAudio.currentTime = 0;
    coinAudio.play().catch(() => {});

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'bigwin-overlay';
    document.body.appendChild(overlay);
    anime({ targets: overlay, opacity: [0, 1], duration: 200, easing: 'easeOutQuad' });

    // Tier label
    const label = document.createElement('div');
    label.className = 'bigwin-label';
    label.textContent = tier.label;
    label.style.color = tier.color;
    overlay.appendChild(label);
    anime({ targets: label, scale: [0.2, 1.2, 1], opacity: [0, 1], duration: 500, easing: 'easeOutElastic(1, 0.4)' });

    // Count-up number
    const numEl = document.createElement('div');
    numEl.className = 'bigwin-number';
    numEl.textContent = '0';
    overlay.appendChild(numEl);

    // Count-up animation (1.5s)
    const countUp = { val: 0 };
    anime({
      targets: countUp,
      val: payout,
      duration: 1500,
      easing: 'easeOutExpo',
      round: 1,
      update: () => { numEl.textContent = Math.round(countUp.val).toLocaleString(); }
    });

    // Shake during count
    anime({
      targets: document.querySelector('.board'),
      translateX: [
        { value: -tier.shake, duration: 50 }, { value: tier.shake, duration: 50 },
        { value: -tier.shake * 0.7, duration: 50 }, { value: tier.shake * 0.7, duration: 50 }
      ],
      loop: 8,
      easing: 'easeInOutSine'
    });

    // Particles burst from sides
    spawnSideBurst(tier.particles);

    // End after 2.5s
    setTimeout(() => {
      coinAudio.pause();
      jpWin.currentTime = 0;
      jpWin.play().catch(() => {});

      // Final number pop
      anime({ targets: numEl, scale: [1, 1.3, 1], duration: 300, easing: 'easeOutElastic(1, 0.5)' });

      // Fade out
      setTimeout(() => {
        anime({ targets: overlay, opacity: 0, duration: 400, easing: 'easeInQuad', complete: () => { overlay.remove(); resolve(); } });
      }, 800);
    }, 1800);
  });
}

async function spawnSideBurst(count) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;

  const w = window.innerWidth;
  const h = window.innerHeight;
  const half = Math.floor(count / 2);

  // Left side burst
  for (let i = 0; i < half; i++) {
    spawnCoin(app, PIXI, 0, h * 0.3 + Math.random() * h * 0.4, 1, i);
  }
  // Right side burst
  for (let i = 0; i < half; i++) {
    spawnCoin(app, PIXI, w, h * 0.3 + Math.random() * h * 0.4, -1, i);
  }
}

function spawnCoin(app, PIXI, startX, startY, dir, i) {
  const texture = PIXI.Texture.from('assets/img/effects/coin_gold.png');
  const coin = new PIXI.Sprite(texture);
  coin.anchor.set(0.5);
  coin.width = 14 + Math.random() * 10;
  coin.height = coin.width;
  coin.position.set(startX, startY);
  coin.rotation = Math.random() * Math.PI;
  app.stage.addChild(coin);

  const tx = startX + dir * (100 + Math.random() * 200);
  const ty = startY + (Math.random() - 0.5) * 150 - 50;

  anime({
    targets: coin.position,
    x: tx, y: [startY, ty, ty + 100],
    duration: 1200 + Math.random() * 600,
    delay: Math.random() * 300,
    easing: 'easeOutQuad'
  });
  anime({
    targets: coin, alpha: 0,
    duration: 1500, delay: Math.random() * 300,
    easing: 'easeInQuad',
    complete: () => { app.stage.removeChild(coin); coin.destroy(); }
  });
}
