// gateThrough.js — 三段式穿門：anticipation → impact → reward + Big Hit
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

  // === Stage 1: Anticipation (80ms) ===
  anime({ targets: cells, backgroundColor: '#3a2800', duration: 80, easing: 'easeOutQuad' });

  setTimeout(() => {
    // === Stage 2: Impact ===
    throughAudio.currentTime = 0;
    throughAudio.play().catch(() => {});

    // Gold slash across row
    const slash = document.createElement('div');
    slash.className = 'gate-slash';
    slash.style.top = cy + 'px';
    document.body.appendChild(slash);
    anime({ targets: slash, scaleX: [0, 3], opacity: [1, 0], duration: 300, easing: 'easeOutExpo', complete: () => slash.remove() });

    // Screen flash
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;background:rgba(255,215,0,0.35);z-index:899;pointer-events:none';
    document.body.appendChild(flash);
    anime({ targets: flash, opacity: [0.35, 0], duration: 250, easing: 'easeOutQuad', complete: () => flash.remove() });

    // Cell glow
    anime({
      targets: cells,
      backgroundColor: ['#ffd700', '#16213e'],
      boxShadow: ['0 0 30px 12px #ffd700', '0 0 0px transparent'],
      duration: 500, easing: 'easeOutExpo'
    });

    // Board shake 8~14px based on mult
    const shakeAmp = Math.min(14, 8 + mult * 1.5);
    anime({
      targets: board,
      translateX: [
        { value: -shakeAmp, duration: 25 }, { value: shakeAmp, duration: 25 },
        { value: -shakeAmp * 0.7, duration: 25 }, { value: shakeAmp * 0.7, duration: 25 },
        { value: -shakeAmp * 0.3, duration: 25 }, { value: 0, duration: 30 }
      ],
      easing: 'easeOutQuad'
    });

    // Particles: 80+ (sparks + streaks + shockwave ring + debris)
    spawnImpactParticles(cx, cy);

    // === Stage 3: Reward (after 200ms) ===
    setTimeout(() => {
      flyAudio.currentTime = 0;
      flyAudio.play().catch(() => {});
      flyNumberWithGhosts(cx, cy, mult);
    }, 200);

    // Big Hit for mult >= 4
    if (mult >= 4) {
      setTimeout(() => playBigHit(), 100);
    }
  }, 80);
}

function flyNumberWithGhosts(cx, cy, mult) {
  const winRect = document.getElementById('win').getBoundingClientRect();
  const tx = winRect.left + winRect.width / 2;
  const ty = winRect.top;

  // Main number
  const main = document.createElement('div');
  main.className = 'fly-number fly-number-main';
  main.textContent = `×${mult}`;
  main.style.left = cx + 'px';
  main.style.top = cy + 'px';
  document.body.appendChild(main);

  // Ghost trail (6 fading copies)
  for (let i = 0; i < 6; i++) {
    const ghost = document.createElement('div');
    ghost.className = 'fly-number fly-number-ghost';
    ghost.textContent = `×${mult}`;
    ghost.style.left = cx + 'px';
    ghost.style.top = cy + 'px';
    ghost.style.opacity = 0.5 - i * 0.07;
    document.body.appendChild(ghost);
    anime({
      targets: ghost,
      left: tx, top: ty,
      scale: [1.8 - i * 0.1, 0.6],
      opacity: 0,
      duration: 500 + i * 40,
      delay: i * 30,
      easing: 'easeOutExpo',
      complete: () => ghost.remove()
    });
  }

  // Main flies last
  anime({
    targets: main,
    left: tx, top: ty,
    scale: [1.8, 0.8],
    opacity: [1, 0],
    duration: 500,
    delay: 180,
    easing: 'easeOutExpo',
    complete: () => main.remove()
  });
}

function playBigHit() {
  dragonAudio.currentTime = 0;
  dragonAudio.play().catch(() => {});

  // Dragon shadow overlay
  const overlay = document.createElement('div');
  overlay.className = 'big-hit-overlay';
  document.body.appendChild(overlay);

  // Full screen gold flash
  const flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;inset:0;background:rgba(255,215,0,0.5);z-index:901;pointer-events:none';
  document.body.appendChild(flash);
  anime({ targets: flash, opacity: [0.5, 0], duration: 400, easing: 'easeOutQuad', complete: () => flash.remove() });

  // Low freq body shake
  anime({
    targets: document.body,
    translateX: [
      { value: -3, duration: 40 }, { value: 3, duration: 40 },
      { value: -2, duration: 40 }, { value: 2, duration: 40 },
      { value: 0, duration: 50 }
    ]
  });

  setTimeout(() => {
    anime({ targets: overlay, opacity: 0, duration: 400, easing: 'easeInQuad', complete: () => overlay.remove() });
  }, 600);
}

async function spawnImpactParticles(cx, cy) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;
  const sparkTex = PIXI.Texture.from('assets/img/effects/spark.png');

  // Sparks (60) using spark.png
  for (let i = 0; i < 60; i++) {
    const s = new PIXI.Sprite(sparkTex);
    s.anchor.set(0.5);
    s.width = 8 + Math.random() * 12;
    s.height = s.width;
    s.position.set(cx, cy);
    s.rotation = Math.random() * Math.PI * 2;
    app.stage.addChild(s);
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 130;
    anime({ targets: s.position, x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist, duration: 300 + Math.random() * 250, easing: 'easeOutQuad' });
    anime({ targets: s, alpha: 0, rotation: s.rotation + Math.random() * 2, duration: 450, easing: 'easeOutQuad', complete: () => { app.stage.removeChild(s); s.destroy(); } });
  }

  // Gold debris (20) using spark.png stretched
  for (let i = 0; i < 20; i++) {
    const s = new PIXI.Sprite(sparkTex);
    s.anchor.set(0.5);
    s.width = 6 + Math.random() * 8;
    s.height = 3 + Math.random() * 4;
    s.position.set(cx, cy);
    s.rotation = Math.random() * Math.PI;
    app.stage.addChild(s);
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 80;
    anime({ targets: s.position, x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist + 30, duration: 500 + Math.random() * 300, easing: 'easeOutQuad' });
    anime({ targets: s, alpha: 0, duration: 600, easing: 'easeOutQuad', complete: () => { app.stage.removeChild(s); s.destroy(); } });
  }

  // Shockwave ring using DOM img
  const ring = document.createElement('img');
  ring.src = 'assets/img/effects/shockwave.png';
  ring.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:60px;height:60px;transform:translate(-50%,-50%) scale(1);z-index:910;pointer-events:none`;
  document.body.appendChild(ring);
  anime({ targets: ring, scale: [1, 5], opacity: [1, 0], duration: 400, easing: 'easeOutQuad', complete: () => ring.remove() });
}
