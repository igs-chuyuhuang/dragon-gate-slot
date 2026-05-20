// comboSystem.js — 連擊追蹤與遞增爽感
import { anime, getPixi } from '../gameFeel.js';
import { playGateThrough } from './gateThrough.js';

let comboCount = 0;
let comboTimer = null;

const LEVELS = [
  null,
  { shake: 4, particles: 25, pitch: 1.0 },
  { shake: 6, particles: 45, pitch: 1.1 },
  { shake: 8, particles: 70, pitch: 1.2 },
  { shake: 10, particles: 100, pitch: 1.3 },
];

function getLevel(n) { return LEVELS[Math.min(n, 4)]; }

export function registerThrough(row, mult) {
  comboCount++;
  clearTimeout(comboTimer);

  const level = getLevel(comboCount);

  // 基本穿門特效（第一擊用標準版）
  if (comboCount === 1) {
    playGateThrough(row, mult);
  } else {
    // 加強版：更大 shake + 更多粒子
    playEnhanced(row, mult, level);
    showComboText(comboCount);
    if (comboCount >= 4) flashWhite();
  }

  // 3 秒無穿門則重置
  comboTimer = setTimeout(() => { comboCount = 0; }, 3000);
}

export function resetCombo() { comboCount = 0; clearTimeout(comboTimer); }

function playEnhanced(row, mult, level) {
  const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
  const board = document.querySelector('.board');
  const s = level.shake;

  // 加強閃光
  anime({
    targets: cells,
    backgroundColor: ['#16213e', '#ffd700', '#16213e'],
    boxShadow: ['0 0 0px #ffd700', `0 0 ${s * 4}px ${s * 2}px #ffd700`, '0 0 0px transparent'],
    duration: 500,
    easing: 'easeOutExpo'
  });

  // 加強 shake
  anime({
    targets: board,
    translateX: [
      { value: -s, duration: 30 }, { value: s, duration: 30 },
      { value: -s * 0.7, duration: 30 }, { value: s * 0.7, duration: 30 },
      { value: 0, duration: 40 }
    ],
    easing: 'easeOutQuad'
  });

  // 加強粒子
  const rect = cells[1].getBoundingClientRect();
  spawnEnhancedSparks(rect.left + rect.width / 2, rect.top + rect.height / 2, level.particles);

  // 飛出數字
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  const el = document.createElement('div');
  el.className = 'fly-number';
  el.textContent = `×${mult}`;
  el.style.left = cx + 'px';
  el.style.top = cy + 'px';
  document.body.appendChild(el);
  const winRect = document.getElementById('win').getBoundingClientRect();
  anime({
    targets: el,
    left: winRect.left + winRect.width / 2,
    top: winRect.top,
    scale: [1.6, 0.7],
    opacity: [1, 0],
    duration: 400,
    easing: 'easeOutBack',
    complete: () => el.remove()
  });
}

function showComboText(count) {
  const el = document.createElement('div');
  el.className = 'fly-number';
  el.textContent = `${count} COMBO!`;
  el.style.left = '50%';
  el.style.top = '35%';
  el.style.transform = 'translate(-50%, -50%)';
  el.style.fontSize = '38px';
  el.style.color = count >= 4 ? '#ff4444' : '#ffd700';
  document.body.appendChild(el);

  anime({
    targets: el,
    scale: [0.3, 1.2, 1],
    opacity: [0, 1],
    duration: 350,
    easing: 'easeOutElastic(1, 0.4)'
  });
  setTimeout(() => {
    anime({ targets: el, opacity: 0, translateY: -20, duration: 250, easing: 'easeInQuad', complete: () => el.remove() });
  }, 700);
}

function flashWhite() {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.25);z-index:899;pointer-events:none';
  document.body.appendChild(el);
  anime({ targets: el, opacity: [1, 0], duration: 180, easing: 'easeOutExpo', complete: () => el.remove() });
}

async function spawnEnhancedSparks(cx, cy, count) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  const { app, PIXI } = pixi;

  for (let i = 0; i < count; i++) {
    const g = new PIXI.Graphics();
    g.beginFill([0xffd700, 0xff6b35, 0xff4444][i % 3]);
    g.drawCircle(0, 0, 2 + Math.random() * 4);
    g.endFill();
    g.position.set(cx, cy);
    app.stage.addChild(g);

    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 100;
    anime({ targets: g.position, x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist, duration: 280 + Math.random() * 250, easing: 'linear' });
    anime({ targets: g, alpha: 0, duration: 450, easing: 'easeOutQuad', complete: () => { app.stage.removeChild(g); g.destroy(); } });
  }
}
