// comboSystem.js — 5-level Combo using VFX systems
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
  const cx = window.innerWidth / 2, cy = window.innerHeight * 0.38;

  if (count === 2) {
    flashScreen('#ffd700', 0.15, 200);
    burst(cx, cy, { texture: 'spark', count: 12, spread: 80, duration: 300 });
    explodeText('2 COMBO!', { size: 36 });
  } else if (count === 3) {
    playSfx('dragon_growl', { volume: 0.5 });
    flashScreen('#ffd700', 0.25, 250);
    shakeBoard(4, 150);
    burst(cx, cy, { texture: 'spark', count: 30, spread: 100, duration: 350 });
    explodeText('3 COMBO!', { size: 42 });
  } else if (count === 4) {
    await hitStop(80);
    flashScreen('#ffd700', 0.4, 300);
    shockwaveDOM(cx, cy, '#ffd700', 8, 450);
    shakeBoard(8, 200);
    burst(cx, cy, { texture: 'spark', count: 50, spread: 130, duration: 400 });
    burst(cx, cy, { texture: 'streak', count: 10, spread: 100, duration: 300 });
    explodeText('4 COMBO!', { size: 48, color: '#fffacd' });
  } else {
    await hitStop(100);
    playSfx('dragon_growl', { volume: 0.7 });
    flashScreen('#fffacd', 0.5, 350);
    shockwaveDOM(cx, cy, '#ffd700', 10, 500);
    setTimeout(() => shockwaveDOM(cx, cy, '#ffd700', 8, 400), 120);
    shakeBoard(12, 250);
    burst(cx, cy, { texture: 'spark', count: 70, spread: 150, duration: 450 });
    burst(cx, cy, { texture: 'glow', count: 8, spread: 120, duration: 500, sizeMin: 1, sizeMax: 2 });
    explodeText(`🐉 龍門狂熱 ×${count}!`, { size: 52, color: '#ff4444', holdMs: 1200 });
    // Burning border
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
  // Dissipate
  const cx = window.innerWidth / 2, cy = window.innerHeight * 0.38;
  burst(cx, cy, { texture: 'smoke', count: 12, spread: 80, duration: 500, sizeMin: 0.8, sizeMax: 1.5 });
}
