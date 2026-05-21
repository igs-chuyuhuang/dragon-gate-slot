// jpReveal.js — JP 開獎儀式：layered VFX, Graphics particles, no images
import { anime, getPixi } from '../gameFeel.js';

const drumRoll = new Audio('assets/sfx/drum_roll.mp3');
const gateOpen = new Audio('assets/sfx/gate_open.mp3');
const jpWin = new Audio('assets/sfx/jp_win.mp3');
const dragonRoar = new Audio('assets/sfx/dragon_roar.mp3');
const coinCount = new Audio('assets/sfx/coin_count.mp3');
coinCount.loop = true;

const GATES = [
  { tier: 'basic', lo: 60, hi: 120, pos: 25, color: '#4488ff', label: 'BASIC' },
  { tier: 'major', lo: 130, hi: 200, pos: 55, color: '#ff8c00', label: 'MAJOR' },
  { tier: 'grand', lo: 210, hi: 320, pos: 85, color: '#dc143c', label: 'GRAND' },
];

let knockedGates = new Set();

export function playJpReveal(score, jpResult) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'jp-reveal-overlay';
    overlay.innerHTML = `<div class="jp-score-display">${score} 分</div><div class="jp-bar-container"><div class="jp-bar-track"><div class="jp-beam"></div></div></div>`;
    document.body.appendChild(overlay);
    anime({ targets: overlay, opacity: [0, 1], duration: 400, easing: 'easeOutQuad' });

    const beam = overlay.querySelector('.jp-beam');
    const track = overlay.querySelector('.jp-bar-track');
    const scoreDisplay = overlay.querySelector('.jp-score-display');

    // Gates appear
    setTimeout(() => {
      GATES.forEach((gate, i) => {
        setTimeout(() => {
          const el = document.createElement('div');
          el.className = 'jp-gate';
          el.style.bottom = gate.pos + '%';
          el.style.borderColor = gate.color;
          el.style.color = gate.color;
          el.innerHTML = `<span>${gate.label}</span>`;
          track.appendChild(el);
          anime({ targets: el, scaleX: [0, 1], opacity: [0, 1], duration: 300, easing: 'easeOutBack' });
        }, i * 250);
      });
    }, 500);

    // Beam rises
    knockedGates.clear();
    const targetPct = Math.min(95, (score / 320) * 95);
    setTimeout(() => {
      drumRoll.currentTime = 0;
      drumRoll.play().catch(() => {});
      anime({
        targets: beam, height: [0, targetPct + '%'], duration: 2500, easing: 'easeOutExpo',
        update: () => {
          const h = parseFloat(beam.style.height) || 0;
          GATES.forEach(g => { if (h >= g.pos - 1 && h <= g.pos + 1 && !knockedGates.has(g.tier)) { knockedGates.add(g.tier); knockGate(g); } });
        },
        complete: () => { drumRoll.pause(); setTimeout(() => showHitResult(overlay, scoreDisplay, jpResult, resolve), 300); }
      });
    }, 1400);
  });
}

function knockGate(gate) {
  gateOpen.currentTime = 0;
  gateOpen.play().catch(() => {});
  anime({ targets: document.querySelector('.board'), translateY: [{ value: -3, duration: 30 }, { value: 3, duration: 30 }, { value: 0, duration: 30 }] });
}

function showHitResult(overlay, scoreDisplay, jpResult, resolve) {
  if (!jpResult.tier || jpResult.payout <= 0) {
    scoreDisplay.textContent = jpResult.msg;
    scoreDisplay.style.color = '#888';
    setTimeout(() => cleanup(overlay, resolve), 1200);
    return;
  }

  const gate = GATES.find(g => g.tier === jpResult.tier) || GATES[0];
  const isPerfect = jpResult.perfect === true;

  // === IMPACT LAYERS ===
  jpWin.currentTime = 0;
  jpWin.play().catch(() => {});
  if (isPerfect) { dragonRoar.currentTime = 0; dragonRoar.play().catch(() => {}); }

  // Layer 1: Flash
  const flashAlpha = isPerfect ? 0.6 : 0.4;
  const flash = document.createElement('div');
  flash.style.cssText = `position:absolute;inset:0;background:${isPerfect ? '#ffd700' : gate.color};opacity:${flashAlpha};pointer-events:none`;
  overlay.appendChild(flash);
  anime({ targets: flash, opacity: [flashAlpha, 0], duration: isPerfect ? 600 : 400, easing: 'easeOutQuad', complete: () => flash.remove() });

  // Layer 2: Shockwave(s)
  spawnDomShockwave(isPerfect ? '#ffd700' : gate.color);
  if (isPerfect) setTimeout(() => spawnDomShockwave('#ffd700'), 150);

  // Layer 3: Board shake
  const board = document.querySelector('.board');
  if (isPerfect) {
    const shk = anime({ targets: board, translateX: [{ value: -6, duration: 40 }, { value: 6, duration: 40 }, { value: -4, duration: 40 }, { value: 4, duration: 40 }, { value: 0, duration: 40 }], loop: 10 });
    setTimeout(() => shk.pause(), 2000);
  } else {
    anime({ targets: board, translateX: [{ value: -8, duration: 30 }, { value: 8, duration: 30 }, { value: -5, duration: 30 }, { value: 0, duration: 40 }] });
  }

  // Layer 4: Particles burst
  spawnBurstParticles(isPerfect ? 60 : 30);

  // Layer 5: PERFECT text
  if (isPerfect) {
    const pt = document.createElement('div');
    pt.textContent = 'PERFECT!';
    pt.style.cssText = 'position:absolute;top:22%;left:50%;transform:translate(-50%,-50%);font-size:52px;font-weight:900;color:#ffd700;text-shadow:0 0 20px #ffd700,0 0 40px #ff6b35,2px 2px 0 #000;z-index:10;pointer-events:none';
    overlay.appendChild(pt);
    anime({ targets: pt, scale: [0.2, 1.4, 1.1], opacity: [0, 1], duration: 500, easing: 'easeOutElastic(1, 0.4)' });
    setTimeout(() => anime({ targets: pt, opacity: 0, duration: 400, complete: () => pt.remove() }), 1800);
  }

  // === REWARD: Tier label + count-up ===
  scoreDisplay.innerHTML = `<div style="font-size:48px;font-weight:900;color:${gate.color};text-shadow:0 0 20px ${gate.color}">${gate.label}</div>`;
  anime({ targets: scoreDisplay.firstChild, scale: [0.3, 1.2, 1], duration: 500, easing: 'easeOutElastic(1, 0.4)' });

  setTimeout(() => {
    coinCount.currentTime = 0;
    coinCount.play().catch(() => {});
    const numEl = document.createElement('div');
    numEl.style.cssText = 'font-size:52px;font-weight:bold;color:#fff;text-shadow:0 0 12px #ffd700;pointer-events:none';
    numEl.textContent = '0';
    overlay.appendChild(numEl);

    // Ghost trail on number
    const counter = { val: 0 };
    anime({
      targets: counter, val: jpResult.payout,
      duration: isPerfect ? 2500 : 1500, easing: isPerfect ? 'easeInOutQuad' : 'easeOutExpo', round: 1,
      update: () => { numEl.textContent = Math.round(counter.val).toLocaleString() + (isPerfect ? ' ×3' : ''); },
      complete: () => {
        coinCount.pause();
        anime({ targets: numEl, scale: [1, 1.3, 1], duration: 300, easing: 'easeOutElastic(1, 0.5)' });
        spawnCoinRain(isPerfect ? 80 : 40);
        setTimeout(() => cleanup(overlay, resolve), isPerfect ? 3500 : 2000);
      }
    });
  }, isPerfect ? 1000 : 700);
}

function spawnDomShockwave(color) {
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  const sw = document.createElement('div');
  sw.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:50px;height:50px;border-radius:50%;border:3px solid ${color};transform:translate(-50%,-50%);z-index:1201;pointer-events:none;box-shadow:0 0 8px ${color}`;
  document.body.appendChild(sw);
  anime({ targets: sw, scale: [1, 10], opacity: [1, 0], duration: 500, easing: 'easeOutQuad', complete: () => sw.remove() });
}

async function spawnBurstParticles(count) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;

  for (let i = 0; i < count; i++) {
    const g = new PIXI.Graphics();
    g.beginFill([0xffd700, 0xff6b35, 0xfffacd, 0xff4444][i % 4]);
    g.drawCircle(0, 0, 2 + Math.random() * 3);
    g.endFill();
    g.position.set(cx, cy);
    app.stage.addChild(g);
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const d = 80 + Math.random() * 150;
    anime({ targets: g.position, x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, duration: 400 + Math.random() * 300, easing: 'easeOutQuad' });
    anime({ targets: g, alpha: 0, duration: 600, delay: 100, easing: 'easeOutQuad', complete: () => { app.stage.removeChild(g); g.destroy(); } });
  }
}

async function spawnCoinRain(count) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;

  for (let i = 0; i < count; i++) {
    const g = new PIXI.Graphics();
    g.beginFill([0xffd700, 0xffaa00, 0xfffacd][i % 3]);
    g.drawCircle(0, 0, 4 + Math.random() * 3);
    g.endFill();
    g.position.set(Math.random() * window.innerWidth, -15);
    app.stage.addChild(g);

    const dur = 1000 + Math.random() * 1200;
    const del = Math.random() * 800;
    anime({ targets: g.position, y: window.innerHeight + 20, x: g.position.x + (Math.random() - 0.5) * 60, duration: dur, delay: del, easing: 'easeInQuad' });
    anime({ targets: g, alpha: 0, duration: dur, delay: del + dur * 0.7, easing: 'easeInQuad', complete: () => { app.stage.removeChild(g); g.destroy(); } });
  }
}

function cleanup(overlay, resolve) {
  anime({ targets: overlay, opacity: 0, duration: 400, easing: 'easeInQuad', complete: () => { overlay.remove(); resolve(); } });
  setTimeout(() => { if (overlay.parentNode) overlay.remove(); document.querySelectorAll('.jp-reveal-overlay').forEach(el => el.remove()); }, 1000);
}
