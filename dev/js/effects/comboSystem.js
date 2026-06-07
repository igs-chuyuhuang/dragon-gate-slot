// comboSystem.js — 5-level Combo: 850ms per trigger (50ms hitStop + 500ms expand + 300ms hold)
import { anime } from '../gameFeel.js';
import { burst, shockwave } from './particlePool.js';
import { hitStop, shakeBoard, flashScreen, shockwaveDOM, pulseScreen } from './cameraFeel.js';
import { explodeText } from './vfxTypo.js';
import { playSfx } from './sfxBus.js';
import { playGateThrough } from './gateThrough.js';

let comboCount = 0;
let comboTimer = null;
let burningTimer = null;

export function registerThrough(row, mult) {
  comboCount++;
  clearTimeout(comboTimer);
  playGateThrough(row, mult);
  if (comboCount >= 2) applyLevel(comboCount);
  comboTimer = setTimeout(() => breakCombo(), 3500);
}

export function resetCombo() {
  if (comboCount >= 2) breakCombo();
  else { comboCount = 0; clearTimeout(comboTimer); }
}

async function applyLevel(count) {
  playSfx('combo_hit', { rate: 1 + (count - 2) * 0.08 });
  const cx = window.innerWidth / 2, cy = window.innerHeight * 0.35;

  if (count === 2) {
    await hitStop(50);
    flashScreen('#ffd700', 0.2, 250);
    burst(cx, cy, { texture: 'star', count: 15, spread: 90, duration: 350 });
    explodeText('2 COMBO!', { size: 48, holdMs: 800 });
  } else if (count === 3) {
    await hitStop(50);
    playSfx('dragon_growl', { volume: 0.5 });
    flashScreen('#ffd700', 0.3, 300);
    shakeBoard(4, 150);
    burst(cx, cy, { texture: 'star', count: 30, spread: 110, duration: 380 });
    burst(cx, cy, { texture: 'streak', count: 8, spread: 80, duration: 300 });
    explodeText('3 COMBO!', { size: 52, holdMs: 900 });
  } else if (count === 4) {
    await hitStop(80);
    flashScreen('#ffd700', 0.3, 350);
    shockwaveDOM(cx, cy, '#ffd700', 9, 500);
    shakeBoard(12, 300);
    burst(cx, cy, { texture: 'star', count: 50, spread: 140, duration: 420 });
    burst(cx, cy, { texture: 'streak', count: 12, spread: 110, duration: 350 });
    burst(cx, cy, { texture: 'diamond', count: 10, spread: 100, duration: 400 });
    explodeText('4 COMBO!', { size: 56, color: '#fffacd', holdMs: 1000 });
  } else {
    await hitStop(100);
    playSfx('dragon_growl', { volume: 0.7 });
    flashScreen('#fffacd', 0.35, 400);
    shockwaveDOM(cx, cy, '#ffd700', 11, 550);
    setTimeout(() => shockwaveDOM(cx, cy, '#ffd700', 8, 450), 130);
    shakeBoard(14, 350);
    burst(cx, cy, { texture: 'star', count: 60, spread: 160, duration: 450 });
    burst(cx, cy, { texture: 'glow', count: 6, spread: 130, duration: 500, sizeMin: 0.8, sizeMax: 1.8 });
    burst(cx, cy, { texture: 'diamond', count: 15, spread: 120, duration: 420 });
    explodeText(`🐉 龍門狂熱 ×${count}!`, { size: 64, color: '#ff4444', holdMs: 1200 });
    // Burning border 3s
    const board = document.querySelector('.board');
    board.classList.add('combo-burning');
    clearTimeout(burningTimer);
    burningTimer = setTimeout(() => board.classList.remove('combo-burning'), 3000);
  }
}

function breakCombo() {
  if (comboCount < 2) { comboCount = 0; return; }
  comboCount = 0;
  clearTimeout(comboTimer);
  clearTimeout(burningTimer);
  document.querySelector('.board')?.classList.remove('combo-burning');
  const cx = window.innerWidth / 2, cy = window.innerHeight * 0.35;
  burst(cx, cy, { texture: 'smoke', count: 15, spread: 90, duration: 550, sizeMin: 0.8, sizeMax: 1.8 });
}
