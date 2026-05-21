// wallHit.js — 碰壁強化：壓扁反彈 + 大推開 + 裂痕擴大 + chromatic aberration + hit stop
import { anime, getPixi } from '../gameFeel.js';

const hitAudio = new Audio('assets/sfx/wall_hit.mp3');
const crackAudio = new Audio('assets/sfx/crack.mp3');

export function playWallHit(row) {
  const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
  const [left, mid, right] = cells;
  const board = document.querySelector('.board');

  hitAudio.currentTime = 0;
  hitAudio.play().catch(() => {});

  // === Hit stop: 100ms freeze ===
  mid.style.transition = 'none';

  // 1. Mid cell squash: scaleX 1.25 / scaleY 0.85 → bounce back
  anime({
    targets: mid,
    scaleX: [1, 1.25, 0.9, 1.05, 1],
    scaleY: [1, 0.85, 1.1, 0.97, 1],
    borderColor: ['#0f3460', '#e94560', '#e94560', '#0f3460'],
    duration: 400,
    delay: 100, // hit stop
    easing: 'easeOutElastic(1, 0.6)'
  });

  // 2. Left/right pushed 12px+
  anime({ targets: left, translateX: [-14, 2, 0], duration: 350, delay: 100, easing: 'easeOutBack' });
  anime({ targets: right, translateX: [14, -2, 0], duration: 350, delay: 100, easing: 'easeOutBack' });

  // 3. Board shake 10px
  anime({
    targets: board,
    translateX: [
      { value: -10, duration: 25 }, { value: 10, duration: 25 },
      { value: -7, duration: 25 }, { value: 7, duration: 25 },
      { value: -3, duration: 25 }, { value: 0, duration: 30 }
    ],
    delay: 100,
    easing: 'easeOutQuad'
  });

  // 4. Red vignette
  const vignette = document.createElement('div');
  vignette.className = 'wall-vignette';
  document.body.appendChild(vignette);
  anime({ targets: vignette, opacity: [0.6, 0], duration: 600, delay: 100, easing: 'easeOutQuad', complete: () => vignette.remove() });

  // 5. Chromatic aberration / RGB split on mid cell
  mid.classList.add('chromatic');
  setTimeout(() => mid.classList.remove('chromatic'), 500);

  // 6. Crack effect (expanded, 700ms)
  setTimeout(() => {
    crackAudio.currentTime = 0;
    crackAudio.play().catch(() => {});
    mid.classList.add('cracked-large');
    setTimeout(() => mid.classList.remove('cracked-large'), 700);
  }, 120);

  // 7. Debris particles
  const rect = mid.getBoundingClientRect();
  spawnDebris(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

async function spawnDebris(cx, cy) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;

  for (let i = 0; i < 15; i++) {
    const g = new PIXI.Graphics();
    g.beginFill([0x8b0000, 0x444444, 0x666666][i % 3]);
    g.drawRect(0, 0, 3 + Math.random() * 5, 2 + Math.random() * 4);
    g.endFill();
    g.position.set(cx, cy);
    g.rotation = Math.random() * Math.PI;
    app.stage.addChild(g);

    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 80;
    anime({
      targets: g.position,
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist + 20 + Math.random() * 30,
      duration: 400 + Math.random() * 300,
      easing: 'easeOutQuad'
    });
    anime({
      targets: g,
      alpha: 0, rotation: g.rotation + Math.random() * 3,
      duration: 600, easing: 'easeOutQuad',
      complete: () => { app.stage.removeChild(g); g.destroy(); }
    });
  }
}
