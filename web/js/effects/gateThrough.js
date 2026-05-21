// gateThrough.js — 穿門成功：4-stage layered VFX (anticipation → impact → reward → settle)
import { anime, getPixi } from '../gameFeel.js';

const throughAudio = new Audio('assets/sfx/gate_through.mp3');
const flyAudio = new Audio('assets/sfx/score_fly.mp3');
const dragonAudio = new Audio('assets/sfx/dragon_roar.mp3');

export function playGateThrough(row, mult) {
  const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
  const board = document.querySelector('.board');
  const midRect = cells[1].getBoundingClientRect();
  const cx = midRect.left + midRect.width / 2;
  const cy = midRect.top + midRect.height / 2;

  // === ANTICIPATION (80ms) ===
  anime({ targets: cells, backgroundColor: '#3a2800', duration: 80, easing: 'easeOutQuad' });
  const darken = mkOverlay('rgba(0,0,0,0.3)');
  anime({ targets: darken, opacity: [0, 0.3], duration: 80, easing: 'easeOutQuad' });

  setTimeout(() => {
    // === IMPACT (200ms) ===
    throughAudio.currentTime = 0;
    throughAudio.play().catch(() => {});

    // Hit stop 80ms (freeze via no further updates)
    setTimeout(() => {
      // Layer 1: Gold flash
      const flash = mkOverlay('rgba(255,215,0,0.4)');
      anime({ targets: flash, opacity: [0.4, 0], duration: 250, easing: 'easeOutQuad', complete: () => flash.remove() });

      // Layer 2: Cell glow
      anime({
        targets: cells,
        backgroundColor: ['#ffd700', '#16213e'],
        boxShadow: ['0 0 30px 12px #ffd700', '0 0 0px transparent'],
        duration: 400, easing: 'easeOutExpo'
      });

      // Layer 3: Board shake 8px
      anime({
        targets: board,
        translateX: [{ value: -8, duration: 25 }, { value: 8, duration: 25 }, { value: -5, duration: 25 }, { value: 5, duration: 25 }, { value: -2, duration: 25 }, { value: 0, duration: 30 }],
        easing: 'easeOutQuad'
      });

      // Layer 4: Shockwave (DOM)
      const sw = document.createElement('div');
      sw.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:40px;height:40px;border-radius:50%;border:3px solid #ffd700;transform:translate(-50%,-50%) scale(1);z-index:910;pointer-events:none;box-shadow:0 0 8px #ffd700`;
      document.body.appendChild(sw);
      anime({ targets: sw, scale: [1, 6], opacity: [1, 0], duration: 350, easing: 'easeOutQuad', complete: () => sw.remove() });

      // Layer 5: Particles (PixiJS Graphics — sparks + streaks + debris)
      spawnParticles(cx, cy);

      // === REWARD (400ms delay) ===
      setTimeout(() => {
        flyAudio.currentTime = 0;
        flyAudio.play().catch(() => {});
        flyNumberWithGhosts(cx, cy, mult);

        // Big Hit for mult >= 4
        if (mult >= 4) playBigHit(cx, cy);
      }, 150);

      // === SETTLE (after 500ms) ===
      anime({ targets: darken, opacity: 0, duration: 300, delay: 400, easing: 'easeInQuad', complete: () => darken.remove() });
    }, 80); // hit stop
  }, 80); // anticipation
}

function flyNumberWithGhosts(cx, cy, mult) {
  const winRect = document.getElementById('win').getBoundingClientRect();
  const tx = winRect.left + winRect.width / 2;
  const ty = winRect.top;

  // Main number — explode out then fly
  const main = mkText(`×${mult}`, cx, cy, 38);
  anime({ targets: main, scale: [0, 1.8, 1.2], duration: 200, easing: 'easeOutBack' });
  setTimeout(() => {
    anime({ targets: main, left: tx, top: ty, scale: [1.2, 0.7], opacity: [1, 0], duration: 400, easing: 'easeOutExpo', complete: () => main.remove() });
  }, 200);

  // 4 ghost trails
  for (let i = 0; i < 4; i++) {
    const ghost = mkText(`×${mult}`, cx, cy, 38);
    ghost.style.opacity = 0.4 - i * 0.08;
    ghost.style.filter = 'blur(1.5px)';
    anime({ targets: ghost, left: tx, top: ty, scale: [1.8 - i * 0.15, 0.5], opacity: 0, duration: 450 + i * 40, delay: 50 + i * 30, easing: 'easeOutExpo', complete: () => ghost.remove() });
  }
}

function playBigHit(cx, cy) {
  dragonAudio.currentTime = 0;
  dragonAudio.play().catch(() => {});
  // Extra flash
  const flash = mkOverlay('rgba(255,215,0,0.5)');
  anime({ targets: flash, opacity: [0.5, 0], duration: 400, easing: 'easeOutQuad', complete: () => flash.remove() });
  // Extra shockwave
  const sw = document.createElement('div');
  sw.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:50px;height:50px;border-radius:50%;border:4px solid #ffd700;transform:translate(-50%,-50%);z-index:911;pointer-events:none`;
  document.body.appendChild(sw);
  anime({ targets: sw, scale: [1, 8], opacity: [1, 0], duration: 500, easing: 'easeOutQuad', complete: () => sw.remove() });
  // Body shake
  anime({ targets: document.body, translateX: [{ value: -3, duration: 40 }, { value: 3, duration: 40 }, { value: -2, duration: 40 }, { value: 0, duration: 50 }] });
}

async function spawnParticles(cx, cy) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;

  // Sparks (30 small circles)
  for (let i = 0; i < 30; i++) {
    const g = new PIXI.Graphics();
    g.beginFill([0xffd700, 0xff6b35, 0xfffacd][i % 3]);
    g.drawCircle(0, 0, 1.5 + Math.random() * 2.5);
    g.endFill();
    g.position.set(cx, cy);
    app.stage.addChild(g);
    const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 120;
    anime({ targets: g.position, x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, duration: 280 + Math.random() * 200, easing: 'easeOutQuad' });
    anime({ targets: g, alpha: 0, duration: 400, easing: 'easeOutQuad', complete: () => { app.stage.removeChild(g); g.destroy(); } });
  }
  // Streaks (15 lines)
  for (let i = 0; i < 15; i++) {
    const g = new PIXI.Graphics();
    g.beginFill(0xffd700);
    g.drawRect(-1, -8, 2, 16);
    g.endFill();
    const a = Math.random() * Math.PI * 2;
    g.rotation = a;
    g.position.set(cx, cy);
    app.stage.addChild(g);
    const d = 70 + Math.random() * 100;
    anime({ targets: g.position, x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, duration: 220 + Math.random() * 150, easing: 'easeOutQuad' });
    anime({ targets: g, alpha: 0, duration: 320, easing: 'easeOutQuad', complete: () => { app.stage.removeChild(g); g.destroy(); } });
  }
  // Debris (15 rectangles)
  for (let i = 0; i < 15; i++) {
    const g = new PIXI.Graphics();
    g.beginFill([0xffd700, 0xff8c00][i % 2]);
    g.drawRect(0, 0, 3 + Math.random() * 4, 2 + Math.random() * 3);
    g.endFill();
    g.rotation = Math.random() * Math.PI;
    g.position.set(cx, cy);
    app.stage.addChild(g);
    const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 80;
    anime({ targets: g.position, x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d + 20, duration: 400 + Math.random() * 200, easing: 'easeOutQuad' });
    anime({ targets: g, alpha: 0, rotation: g.rotation + 2, duration: 500, easing: 'easeOutQuad', complete: () => { app.stage.removeChild(g); g.destroy(); } });
  }
}

// Helpers
function mkOverlay(bg) {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;inset:0;background:${bg};z-index:899;pointer-events:none`;
  document.body.appendChild(el);
  return el;
}
function mkText(text, x, y, size) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = `position:fixed;left:${x}px;top:${y}px;font-size:${size}px;font-weight:900;color:#ffd700;z-index:950;pointer-events:none;text-shadow:0 0 8px #ff6b35,0 2px 4px rgba(0,0,0,0.8);transform:translate(-50%,-50%)`;
  document.body.appendChild(el);
  return el;
}
