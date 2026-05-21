// comboSystem.js — Combo Meter 5 級 + 斷裂效果
import { anime, getPixi } from '../gameFeel.js';
import { playGateThrough } from './gateThrough.js';

let comboCount = 0;
let comboTimer = null;
let burningTimer = null;

const comboAudio = new Audio('assets/sfx/combo_hit.mp3');
const dragonGateAudio = new Audio('assets/sfx/dragon_growl.mp3');

export function registerThrough(row, mult) {
  comboCount++;
  clearTimeout(comboTimer);

  // Always play base gate through
  playGateThrough(row, mult);

  // Combo effects based on level
  if (comboCount >= 2) {
    showComboMeter(comboCount);
    applyComboLevel(comboCount);
  }

  // 3.5s timeout to break
  comboTimer = setTimeout(() => breakCombo(), 3500);
}

export function resetCombo() {
  if (comboCount >= 2) breakCombo();
  else { comboCount = 0; clearTimeout(comboTimer); }
}

function applyComboLevel(count) {
  const board = document.querySelector('.board');

  if (count === 2) {
    // Level 2: gold sparks
    comboAudio.currentTime = 0;
    comboAudio.play().catch(() => {});
    spawnComboSparks(15);
  } else if (count === 3) {
    // Level 3: bigger text, vignette, dragon gate sound
    comboAudio.currentTime = 0;
    comboAudio.play().catch(() => {});
    dragonGateAudio.currentTime = 0;
    dragonGateAudio.play().catch(() => {});
    board.classList.add('combo-vignette');
    setTimeout(() => board.classList.remove('combo-vignette'), 800);
    spawnComboSparks(30);
  } else if (count === 4) {
    // Level 4: white-gold flash + shockwave + big shake
    comboAudio.playbackRate = 1.2;
    comboAudio.currentTime = 0;
    comboAudio.play().catch(() => {});
    flashWhiteGold();
    spawnShockwave();
    anime({
      targets: board,
      translateX: [{ value: -12, duration: 25 }, { value: 12, duration: 25 }, { value: -8, duration: 25 }, { value: 8, duration: 25 }, { value: 0, duration: 30 }],
      easing: 'easeOutQuad'
    });
    spawnComboSparks(60);
  } else if (count >= 5) {
    // Level 5+: 「龍門狂熱」burning border 3s
    comboAudio.playbackRate = 1.3;
    comboAudio.currentTime = 0;
    comboAudio.play().catch(() => {});
    dragonGateAudio.currentTime = 0;
    dragonGateAudio.play().catch(() => {});
    flashWhiteGold();
    spawnShockwave();
    board.classList.add('combo-burning');
    clearTimeout(burningTimer);
    burningTimer = setTimeout(() => board.classList.remove('combo-burning'), 3000);
    spawnComboSparks(80);
  }
}

function showComboMeter(count) {
  const el = document.createElement('div');
  el.className = 'combo-text';
  if (count >= 5) {
    el.textContent = `🐉 龍門狂熱 ×${count}!`;
    el.classList.add('combo-frenzy');
  } else {
    el.textContent = `${count} COMBO!`;
  }
  el.dataset.level = Math.min(count, 5);
  document.body.appendChild(el);

  anime({
    targets: el,
    scale: [0.2, 1.3, 1],
    opacity: [0, 1],
    duration: 400,
    easing: 'easeOutElastic(1, 0.4)'
  });

  setTimeout(() => {
    anime({ targets: el, opacity: 0, translateY: -30, scale: 0.8, duration: 300, easing: 'easeInQuad', complete: () => el.remove() });
  }, 900);
}

function breakCombo() {
  if (comboCount < 2) { comboCount = 0; return; }
  comboCount = 0;
  clearTimeout(comboTimer);
  clearTimeout(burningTimer);

  const board = document.querySelector('.board');
  board.classList.remove('combo-burning', 'combo-vignette');

  // "Energy dissipate" effect
  const el = document.createElement('div');
  el.className = 'combo-break';
  document.body.appendChild(el);
  anime({ targets: el, opacity: [0.4, 0], scale: [1, 1.5], duration: 500, easing: 'easeOutQuad', complete: () => el.remove() });

  // Scatter particles outward
  spawnBreakParticles();
}

function flashWhiteGold() {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.3),rgba(255,215,0,0.3));z-index:899;pointer-events:none';
  document.body.appendChild(el);
  anime({ targets: el, opacity: [1, 0], duration: 200, easing: 'easeOutExpo', complete: () => el.remove() });
}

async function spawnShockwave() {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  const ring = new PIXI.Graphics();
  ring.lineStyle(4, 0xffd700, 1);
  ring.drawCircle(0, 0, 15);
  ring.position.set(cx, cy);
  app.stage.addChild(ring);
  anime({ targets: ring.scale, x: [1, 12], y: [1, 12], duration: 500, easing: 'easeOutQuad' });
  anime({ targets: ring, alpha: [1, 0], duration: 500, easing: 'easeOutQuad', complete: () => { app.stage.removeChild(ring); ring.destroy(); } });
}

async function spawnComboSparks(count) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;
  const cx = window.innerWidth / 2, cy = window.innerHeight * 0.4;

  for (let i = 0; i < count; i++) {
    const g = new PIXI.Graphics();
    g.beginFill([0xffd700, 0xff6b35, 0xfffacd, 0xff4444][i % 4]);
    g.drawCircle(0, 0, 1.5 + Math.random() * 3);
    g.endFill();
    g.position.set(cx + (Math.random() - 0.5) * 60, cy);
    app.stage.addChild(g);
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 120;
    anime({ targets: g.position, x: g.position.x + Math.cos(angle) * dist, y: g.position.y + Math.sin(angle) * dist, duration: 300 + Math.random() * 300, easing: 'easeOutQuad' });
    anime({ targets: g, alpha: 0, duration: 500, easing: 'easeOutQuad', complete: () => { app.stage.removeChild(g); g.destroy(); } });
  }
}

async function spawnBreakParticles() {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;
  const cx = window.innerWidth / 2, cy = window.innerHeight * 0.4;

  for (let i = 0; i < 20; i++) {
    const g = new PIXI.Graphics();
    g.beginFill(0x888888);
    g.drawCircle(0, 0, 2 + Math.random() * 2);
    g.endFill();
    g.position.set(cx + (Math.random() - 0.5) * 40, cy);
    app.stage.addChild(g);
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 100;
    anime({ targets: g.position, x: g.position.x + Math.cos(angle) * dist, y: g.position.y + Math.sin(angle) * dist + 30, duration: 500, easing: 'easeOutQuad' });
    anime({ targets: g, alpha: 0, duration: 600, easing: 'easeOutQuad', complete: () => { app.stage.removeChild(g); g.destroy(); } });
  }
}
