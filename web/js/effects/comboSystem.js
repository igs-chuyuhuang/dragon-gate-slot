// comboSystem.js — 5-level Combo Meter with layered VFX escalation
import { anime, getPixi } from '../gameFeel.js';
import { playGateThrough } from './gateThrough.js';

let comboCount = 0;
let comboTimer = null;
let burningTimer = null;

const comboAudio = new Audio('assets/sfx/combo_hit.mp3');
const growlAudio = new Audio('assets/sfx/dragon_growl.mp3');

export function registerThrough(row, mult) {
  comboCount++;
  clearTimeout(comboTimer);
  playGateThrough(row, mult);
  if (comboCount >= 2) applyComboLevel(comboCount);
  comboTimer = setTimeout(() => breakCombo(), 3500);
}

export function resetCombo() {
  if (comboCount >= 2) breakCombo();
  else { comboCount = 0; clearTimeout(comboTimer); }
}

function applyComboLevel(count) {
  const board = document.querySelector('.board');
  comboAudio.currentTime = 0;
  comboAudio.play().catch(() => {});

  // Show combo text (all levels)
  showComboText(count);

  if (count === 2) {
    // Small flash + few particles
    flash('rgba(255,215,0,0.15)', 200);
    spawnParticles(12);
  } else if (count === 3) {
    // Vignette + medium flash + more particles + shake
    flash('rgba(255,215,0,0.25)', 250);
    vignette(600);
    growlAudio.currentTime = 0;
    growlAudio.play().catch(() => {});
    anime({ targets: board, translateX: [{ value: -4, duration: 30 }, { value: 4, duration: 30 }, { value: 0, duration: 30 }] });
    spawnParticles(30);
  } else if (count === 4) {
    // Big flash + shockwave + lots of particles + shake + hit stop
    flash('rgba(255,215,0,0.4)', 300);
    shockwave();
    anime({ targets: board, translateX: [{ value: -8, duration: 25 }, { value: 8, duration: 25 }, { value: -5, duration: 25 }, { value: 5, duration: 25 }, { value: 0, duration: 30 }] });
    spawnParticles(60);
  } else if (count >= 5) {
    // Full screen white-gold + multi shockwave + burning border + big shake
    flash('rgba(255,250,205,0.5)', 350);
    shockwave();
    setTimeout(() => shockwave(), 120);
    growlAudio.currentTime = 0;
    growlAudio.play().catch(() => {});
    anime({ targets: board, translateX: [{ value: -10, duration: 25 }, { value: 10, duration: 25 }, { value: -7, duration: 25 }, { value: 7, duration: 25 }, { value: -3, duration: 25 }, { value: 0, duration: 30 }] });
    board.classList.add('combo-burning');
    clearTimeout(burningTimer);
    burningTimer = setTimeout(() => board.classList.remove('combo-burning'), 3000);
    spawnParticles(80);
  }
}

function showComboText(count) {
  const el = document.createElement('div');
  el.textContent = count >= 5 ? `🐉 龍門狂熱 ×${count}!` : `${count} COMBO!`;
  const size = Math.min(54, 32 + count * 4);
  const color = count >= 5 ? '#ff4444' : count >= 4 ? '#fffacd' : '#ffd700';
  el.style.cssText = `position:fixed;top:32%;left:50%;transform:translate(-50%,-50%);font-size:${size}px;font-weight:900;color:${color};z-index:960;pointer-events:none;text-shadow:0 0 10px ${color},2px 2px 0 #000;-webkit-text-stroke:1px rgba(0,0,0,0.4)`;
  document.body.appendChild(el);
  anime({ targets: el, scale: [0.2, 1.3, 1], opacity: [0, 1], duration: 350, easing: 'easeOutElastic(1, 0.4)' });
  setTimeout(() => anime({ targets: el, opacity: 0, translateY: -25, duration: 280, easing: 'easeInQuad', complete: () => el.remove() }), 900);
}

function breakCombo() {
  if (comboCount < 2) { comboCount = 0; return; }
  comboCount = 0;
  clearTimeout(comboTimer);
  clearTimeout(burningTimer);
  document.querySelector('.board')?.classList.remove('combo-burning');
  // Dissipate effect
  spawnBreakParticles();
}

function flash(bg, dur) {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;inset:0;background:${bg};z-index:899;pointer-events:none`;
  document.body.appendChild(el);
  anime({ targets: el, opacity: [1, 0], duration: dur, easing: 'easeOutExpo', complete: () => el.remove() });
}

function vignette(dur) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,0.4) 100%);z-index:898;pointer-events:none';
  document.body.appendChild(el);
  anime({ targets: el, opacity: [0.6, 0], duration: dur, easing: 'easeOutQuad', complete: () => el.remove() });
}

function shockwave() {
  const cx = window.innerWidth / 2, cy = window.innerHeight * 0.4;
  const sw = document.createElement('div');
  sw.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:40px;height:40px;border-radius:50%;border:3px solid #ffd700;transform:translate(-50%,-50%);z-index:910;pointer-events:none;box-shadow:0 0 8px #ffd700`;
  document.body.appendChild(sw);
  anime({ targets: sw, scale: [1, 10], opacity: [1, 0], duration: 450, easing: 'easeOutQuad', complete: () => sw.remove() });
}

async function spawnParticles(count) {
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
    g.position.set(cx + (Math.random() - 0.5) * 50, cy);
    app.stage.addChild(g);
    const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 120;
    anime({ targets: g.position, x: g.position.x + Math.cos(a) * d, y: g.position.y + Math.sin(a) * d, duration: 300 + Math.random() * 250, easing: 'easeOutQuad' });
    anime({ targets: g, alpha: 0, duration: 500, easing: 'easeOutQuad', complete: () => { app.stage.removeChild(g); g.destroy(); } });
  }
}

async function spawnBreakParticles() {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;
  const cx = window.innerWidth / 2, cy = window.innerHeight * 0.4;
  for (let i = 0; i < 15; i++) {
    const g = new PIXI.Graphics();
    g.beginFill(0x666666);
    g.drawCircle(0, 0, 2 + Math.random() * 2);
    g.endFill();
    g.position.set(cx + (Math.random() - 0.5) * 30, cy);
    app.stage.addChild(g);
    const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 80;
    anime({ targets: g.position, x: g.position.x + Math.cos(a) * d, y: g.position.y + Math.sin(a) * d + 20, duration: 450, easing: 'easeOutQuad' });
    anime({ targets: g, alpha: 0, duration: 550, easing: 'easeOutQuad', complete: () => { app.stage.removeChild(g); g.destroy(); } });
  }
}
