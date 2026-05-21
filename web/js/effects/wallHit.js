// wallHit.js — 碰壁：4-stage layered VFX (anticipation → impact → reward → settle)
import { anime, getPixi } from '../gameFeel.js';

const hitAudio = new Audio('assets/sfx/wall_hit.mp3');
const crackAudio = new Audio('assets/sfx/crack.mp3');

export function playWallHit(row) {
  const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
  const [left, mid, right] = cells;
  const board = document.querySelector('.board');
  const midRect = mid.getBoundingClientRect();
  const cx = midRect.left + midRect.width / 2;
  const cy = midRect.top + midRect.height / 2;

  // === ANTICIPATION (60ms) ===
  anime({ targets: mid, backgroundColor: '#5c1a1a', duration: 60, easing: 'easeOutQuad' });

  setTimeout(() => {
    // === IMPACT ===
    hitAudio.currentTime = 0;
    hitAudio.play().catch(() => {});

    // Hit stop 100ms
    setTimeout(() => {
      // Layer 1: Red flash
      const flash = document.createElement('div');
      flash.style.cssText = 'position:fixed;inset:0;background:rgba(233,69,96,0.3);z-index:899;pointer-events:none';
      document.body.appendChild(flash);
      anime({ targets: flash, opacity: [0.3, 0], duration: 300, easing: 'easeOutQuad', complete: () => flash.remove() });

      // Layer 2: Mid cell squash
      anime({
        targets: mid,
        scaleX: [1, 1.3, 0.9, 1.05, 1],
        scaleY: [1, 0.8, 1.1, 0.97, 1],
        borderColor: ['#e94560', '#0f3460'],
        backgroundColor: ['#5c1a1a', '#16213e'],
        duration: 400, easing: 'easeOutElastic(1, 0.6)'
      });

      // Layer 3: Left/right push 14px
      anime({ targets: left, translateX: [-14, 2, 0], duration: 350, easing: 'easeOutBack' });
      anime({ targets: right, translateX: [14, -2, 0], duration: 350, easing: 'easeOutBack' });

      // Layer 4: Board shake 10px
      anime({
        targets: board,
        translateX: [{ value: -10, duration: 25 }, { value: 10, duration: 25 }, { value: -7, duration: 25 }, { value: 7, duration: 25 }, { value: -3, duration: 25 }, { value: 0, duration: 30 }],
        easing: 'easeOutQuad'
      });

      // Layer 5: Red vignette
      const vignette = document.createElement('div');
      vignette.style.cssText = 'position:fixed;inset:0;background:radial-gradient(ellipse at center,transparent 40%,rgba(233,69,96,0.35) 100%);z-index:898;pointer-events:none';
      document.body.appendChild(vignette);
      anime({ targets: vignette, opacity: [0.6, 0], duration: 600, easing: 'easeOutQuad', complete: () => vignette.remove() });

      // Layer 6: Debris particles (30)
      spawnDebris(cx, cy);

      // === REWARD: Crack lines (PixiJS Graphics) ===
      setTimeout(() => {
        crackAudio.currentTime = 0;
        crackAudio.play().catch(() => {});
        drawCrackLines(cx, cy);
      }, 80);

      // === SETTLE (after 500ms) ===
      // All animations auto-settle via their durations
    }, 100); // hit stop
  }, 60); // anticipation
}

async function spawnDebris(cx, cy) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;

  for (let i = 0; i < 30; i++) {
    const g = new PIXI.Graphics();
    g.beginFill([0x8b0000, 0x555555, 0xe94560, 0x333333][i % 4]);
    // Mix shapes: rects and triangles
    if (i % 3 === 0) {
      g.drawPolygon([0, 0, 4 + Math.random() * 3, 0, 2, 4 + Math.random() * 3]);
    } else {
      g.drawRect(0, 0, 3 + Math.random() * 5, 2 + Math.random() * 4);
    }
    g.endFill();
    g.position.set(cx, cy);
    g.rotation = Math.random() * Math.PI;
    app.stage.addChild(g);

    const a = Math.random() * Math.PI * 2;
    const d = 40 + Math.random() * 90;
    anime({ targets: g.position, x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d + 15 + Math.random() * 20, duration: 350 + Math.random() * 250, easing: 'easeOutQuad' });
    anime({ targets: g, alpha: 0, rotation: g.rotation + Math.random() * 3, duration: 550, easing: 'easeOutQuad', complete: () => { app.stage.removeChild(g); g.destroy(); } });
  }
}

async function drawCrackLines(cx, cy) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;

  const crack = new PIXI.Graphics();
  crack.position.set(cx, cy);
  app.stage.addChild(crack);

  // Draw jagged crack lines
  const lines = [
    [[0, -20], [-3, -8], [4, 0], [-2, 10], [1, 22]],
    [[0, 0], [8, 5], [14, 12]],
    [[0, 0], [-7, 6], [-12, 14]],
  ];
  crack.lineStyle(2, 0xe94560, 1);
  lines.forEach(pts => {
    crack.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) crack.lineTo(pts[i][0], pts[i][1]);
  });

  anime({ targets: crack, alpha: [1, 0], duration: 700, delay: 100, easing: 'easeInQuad', complete: () => { app.stage.removeChild(crack); crack.destroy(); } });
}
