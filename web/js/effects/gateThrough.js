// gateThrough.js — 穿門成功特效（火花 + shake + 數字飛出）
import { anime, getPixi } from '../gameFeel.js';

let pixiReady = null;

export function playGateThrough(row, mult) {
  const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
  const board = document.querySelector('.board');

  // 1. Cell 金色閃光
  anime({
    targets: cells,
    backgroundColor: ['#16213e', '#ffd700', '#16213e'],
    boxShadow: ['0 0 0px #ffd700', '0 0 24px 8px #ffd700', '0 0 0px transparent'],
    duration: 500,
    easing: 'easeOutExpo'
  });

  // 2. 鏡頭 shake
  anime({
    targets: board,
    translateX: [
      { value: -4, duration: 30 },
      { value: 4, duration: 30 },
      { value: -3, duration: 30 },
      { value: 3, duration: 30 },
      { value: -1, duration: 30 },
      { value: 0, duration: 30 }
    ],
    easing: 'easeOutQuad',
    delay: 30
  });

  // 3. 火花粒子（lazy load PixiJS）
  const midCell = cells[1];
  const rect = midCell.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  spawnSparks(cx, cy, 25);

  // 4. 倍率數字飛出
  setTimeout(() => flyNumber(cx, cy, mult), 150);
}

function flyNumber(cx, cy, mult) {
  const el = document.createElement('div');
  el.className = 'fly-number';
  el.textContent = `×${mult}`;
  el.style.left = cx + 'px';
  el.style.top = cy + 'px';
  document.body.appendChild(el);

  const winEl = document.getElementById('win');
  const winRect = winEl.getBoundingClientRect();

  anime({
    targets: el,
    left: winRect.left + winRect.width / 2,
    top: winRect.top,
    scale: [1.4, 0.7],
    opacity: [1, 0],
    duration: 450,
    easing: 'easeOutBack',
    complete: () => el.remove()
  });
}

async function spawnSparks(cx, cy, count) {
  if (!pixiReady) pixiReady = getPixi();
  let pixi;
  try { pixi = await pixiReady; } catch { return; } // graceful fallback if PixiJS fails

  const { app, PIXI } = pixi;
  for (let i = 0; i < count; i++) {
    const g = new PIXI.Graphics();
    g.beginFill(i % 2 === 0 ? 0xffd700 : 0xff6b35);
    g.drawCircle(0, 0, 2 + Math.random() * 3);
    g.endFill();
    g.position.set(cx, cy);
    app.stage.addChild(g);

    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 80;
    anime({
      targets: g.position,
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      duration: 250 + Math.random() * 200,
      easing: 'linear'
    });
    anime({
      targets: g,
      alpha: 0,
      duration: 400,
      easing: 'easeOutQuad',
      complete: () => { app.stage.removeChild(g); g.destroy(); }
    });
  }
}
