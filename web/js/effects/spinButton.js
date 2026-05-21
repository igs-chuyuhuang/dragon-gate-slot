// spinButton.js — 三階段蓄力 + 強化釋放
import { anime, getPixi } from '../gameFeel.js';

let chargeAnim = null;
let stageAnims = [];
let chargeStart = 0;
let stage = 0;
let particleInterval = null;

const chargeAudio = new Audio('assets/sfx/spin_charge.mp3');
const releaseAudio = new Audio('assets/sfx/spin_release.mp3');
chargeAudio.loop = true;

export function initSpinButton(btnEl) {
  const board = document.querySelector('.board');

  btnEl.addEventListener('pointerdown', () => {
    if (btnEl.disabled) return;
    chargeStart = Date.now();
    stage = 0;
    chargeAudio.volume = 0;
    chargeAudio.currentTime = 0;
    chargeAudio.play().catch(() => {});

    // Stage 1: 0~300ms — shrink + outer glow
    anime({ targets: btnEl, scale: 0.88, duration: 300, easing: 'easeOutCubic' });
    chargeAnim = anime({
      targets: btnEl,
      boxShadow: ['0 0 0px #ffd700', '0 0 16px 6px #ffd700'],
      duration: 300, easing: 'easeInQuad'
    });

    // Progressive shake + stage upgrades
    const tick = () => {
      if (!chargeStart) return;
      const elapsed = Date.now() - chargeStart;
      // Volume fade in
      chargeAudio.volume = Math.min(0.7, elapsed / 1200);

      if (elapsed > 300 && stage < 1) {
        stage = 1;
        enterStage1(btnEl, board);
      }
      if (elapsed > 800 && stage < 2) {
        stage = 2;
        enterStage2(btnEl, board);
      }
      // Progressive shake
      const shakeAmp = stage === 0 ? 2 : stage === 1 ? Math.min(5, 2 + (elapsed - 300) / 200) : 5;
      btnEl.style.transform = `scale(${stage === 0 ? 0.88 : 0.85}) translateX(${(Math.random() - 0.5) * shakeAmp * 2}px)`;

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  const release = () => {
    if (!chargeStart) return;
    const elapsed = Date.now() - chargeStart;
    chargeStart = 0;
    chargeAudio.pause();
    if (chargeAnim) { chargeAnim.pause(); chargeAnim = null; }
    stageAnims.forEach(a => a.pause());
    stageAnims = [];
    if (particleInterval) { clearInterval(particleInterval); particleInterval = null; }

    // Clean up stage effects
    board.classList.remove('charge-stage1', 'charge-stage2');
    document.querySelectorAll('.energy-line').forEach(e => e.remove());

    // Release: hit stop 80ms → flash → bounce
    anime.remove(btnEl);
    btnEl.style.transform = `scale(${elapsed > 300 ? 0.85 : 0.88})`;
    btnEl.style.boxShadow = '0 0 0px transparent';

    releaseAudio.currentTime = 0;
    releaseAudio.play().catch(() => {});

    // Hit stop freeze
    setTimeout(() => {
      // Radial flash
      const flash = document.createElement('div');
      flash.className = 'spin-release-flash';
      document.body.appendChild(flash);
      anime({ targets: flash, opacity: [0.6, 0], scale: [0.5, 2.5], duration: 300, easing: 'easeOutExpo', complete: () => flash.remove() });

      // Bounce back
      anime({
        targets: btnEl,
        scale: [1.18, 0.96, 1],
        translateX: 0,
        boxShadow: '0 0 0px transparent',
        duration: 350,
        easing: 'easeOutElastic(1, 0.5)'
      });
    }, 80);
  };

  btnEl.addEventListener('pointerup', release);
  btnEl.addEventListener('pointerleave', release);
}

function enterStage1(btnEl, board) {
  board.classList.add('charge-stage1');
  const a = anime({
    targets: btnEl,
    boxShadow: ['0 0 0px #ffd700', '0 0 30px 12px #ffd700'],
    duration: 300, easing: 'easeOutQuad'
  });
  stageAnims.push(a);
}

function enterStage2(btnEl, board) {
  board.classList.add('charge-stage2');
  const a = anime({
    targets: btnEl,
    boxShadow: ['0 0 30px 12px #ffd700', '0 0 40px 16px #fffacd'],
    duration: 300, easing: 'easeOutQuad'
  });
  stageAnims.push(a);

  // Spawn converging particles
  particleInterval = setInterval(() => spawnConvergingParticle(btnEl), 80);
}

async function spawnConvergingParticle(btnEl) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;

  const btnRect = btnEl.getBoundingClientRect();
  const tx = btnRect.left + btnRect.width / 2;
  const ty = btnRect.top + btnRect.height / 2;
  const angle = Math.random() * Math.PI * 2;
  const dist = 120 + Math.random() * 80;
  const sx = tx + Math.cos(angle) * dist;
  const sy = ty + Math.sin(angle) * dist;

  const g = new PIXI.Graphics();
  g.beginFill(0xffd700);
  g.drawCircle(0, 0, 2 + Math.random() * 2);
  g.endFill();
  g.position.set(sx, sy);
  app.stage.addChild(g);

  anime({
    targets: g.position, x: tx, y: ty,
    duration: 400 + Math.random() * 200, easing: 'easeInQuad',
    complete: () => { app.stage.removeChild(g); g.destroy(); }
  });
  anime({ targets: g, alpha: [1, 0.3], duration: 500, easing: 'linear' });
}
