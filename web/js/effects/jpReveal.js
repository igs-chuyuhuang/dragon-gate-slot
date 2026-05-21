// jpReveal.js — JP 開獎儀式：暗場 → 三道門 → 光柱上升 → 命中/未命中
import { anime, getPixi } from '../gameFeel.js';

const drumRoll = new Audio('assets/sfx/drum_roll.mp3');
const gateOpen = new Audio('assets/sfx/gate_open.mp3');
const jpWin = new Audio('assets/sfx/jp_win.mp3');
const coinCount = new Audio('assets/sfx/coin_count.mp3');
const dragonRoar = new Audio('assets/sfx/dragon_roar.mp3');
coinCount.loop = true;

// Gate positions as % of bar height (0=bottom, 100=top)
const GATES = [
  { tier: 'basic', lo: 60, hi: 120, pos: 25, color: '#4488ff', label: 'BASIC' },
  { tier: 'major', lo: 130, hi: 200, pos: 55, color: '#ff8c00', label: 'MAJOR' },
  { tier: 'grand', lo: 210, hi: 320, pos: 85, color: '#dc143c', label: 'GRAND' },
];

export function playJpReveal(score, jpResult) {
  return new Promise(resolve => {
    // === 1. Dark overlay + score display ===
    const overlay = document.createElement('div');
    overlay.className = 'jp-reveal-overlay';
    overlay.innerHTML = `
      <div class="jp-score-display">${score} 分</div>
      <div class="jp-bar-container">
        <div class="jp-bar-track">
          <div class="jp-beam"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    anime({ targets: overlay, opacity: [0, 1], duration: 400, easing: 'easeOutQuad' });

    const beam = overlay.querySelector('.jp-beam');
    const track = overlay.querySelector('.jp-bar-track');
    const scoreDisplay = overlay.querySelector('.jp-score-display');

    // === 2. Gates appear sequentially ===
    setTimeout(() => {
      GATES.forEach((gate, i) => {
        setTimeout(() => {
          const gateEl = document.createElement('div');
          gateEl.className = 'jp-gate';
          gateEl.style.bottom = gate.pos + '%';
          gateEl.style.borderColor = gate.color;
          gateEl.style.color = gate.color;
          gateEl.innerHTML = `<img src="assets/img/effects/gate_frame.png" class="jp-gate-img" style="filter:drop-shadow(0 0 4px ${gate.color})"><span>${gate.label}</span>`;
          track.appendChild(gateEl);
          anime({ targets: gateEl, scaleX: [0, 1], opacity: [0, 1], duration: 300, easing: 'easeOutBack' });
        }, i * 250);
      });
    }, 500);

    // === 3. Beam rises (after gates appear) ===
    const targetPercent = scoreToPercent(score);
    setTimeout(() => {
      drumRoll.currentTime = 0;
      drumRoll.play().catch(() => {});

      // Beam rises: fast start, slow near target (easeOutExpo)
      anime({
        targets: beam,
        height: [0, targetPercent + '%'],
        duration: 2500,
        easing: 'easeOutExpo',
        update: (anim) => {
          const currentH = parseFloat(beam.style.height) || 0;
          // Check gate crossings for knock effect
          GATES.forEach(gate => {
            const gatePercent = gate.pos;
            if (currentH >= gatePercent - 1 && currentH <= gatePercent + 1) {
              knockGate(track, gate);
            }
          });
        },
        complete: () => {
          drumRoll.pause();
          // === 4. Hit or miss ===
          setTimeout(() => showResult(overlay, scoreDisplay, score, jpResult, resolve), 300);
        }
      });
    }, 1400);
  });
}

function scoreToPercent(score) {
  // Map score 0~320 to 0~95% of bar
  return Math.min(95, (score / 320) * 95);
}

let knockedGates = new Set();
function knockGate(track, gate) {
  if (knockedGates.has(gate.tier)) return;
  knockedGates.add(gate.tier);

  gateOpen.currentTime = 0;
  gateOpen.play().catch(() => {});

  const gateEl = track.querySelector(`.jp-gate[style*="bottom: ${gate.pos}%"]`) ||
    [...track.querySelectorAll('.jp-gate')].find(el => el.style.bottom === gate.pos + '%');
  if (gateEl) {
    anime({
      targets: gateEl,
      translateX: [{ value: -4, duration: 30 }, { value: 4, duration: 30 }, { value: -2, duration: 30 }, { value: 0, duration: 30 }]
    });
  }
  // Board shake
  anime({
    targets: document.querySelector('.board'),
    translateY: [{ value: -3, duration: 30 }, { value: 3, duration: 30 }, { value: 0, duration: 30 }]
  });
}

function showResult(overlay, scoreDisplay, score, jpResult, resolve) {
  knockedGates.clear();

  if (!jpResult.tier || jpResult.payout <= 0) {
    const beam = overlay.querySelector('.jp-beam');
    anime({ targets: beam, opacity: [1, 0.3], duration: 500, easing: 'easeInQuad' });
    scoreDisplay.textContent = jpResult.msg;
    scoreDisplay.style.color = '#888';
    setTimeout(() => cleanup(overlay, resolve), 1500);
    return;
  }

  const gate = GATES.find(g => g.tier === jpResult.tier) || GATES[0];
  const isPerfect = jpResult.perfect === true;

  jpWin.currentTime = 0;
  jpWin.play().catch(() => {});
  if (isPerfect) { dragonRoar.currentTime = 0; dragonRoar.play().catch(() => {}); }

  const beam = overlay.querySelector('.jp-beam');
  beam.style.background = isPerfect ? '#ffd700' : gate.color;
  anime({ targets: beam, opacity: [1, 0.6, 1], duration: 300, loop: isPerfect ? 5 : 3 });

  // Screen flash (perfect = bigger)
  const flash = document.createElement('div');
  const flashAlpha = isPerfect ? 0.6 : 0.4;
  flash.style.cssText = `position:absolute;inset:0;background:${isPerfect ? '#ffd700' : gate.color};opacity:${flashAlpha};pointer-events:none`;
  overlay.appendChild(flash);
  anime({ targets: flash, opacity: [flashAlpha, 0], duration: isPerfect ? 700 : 500, easing: 'easeOutQuad', complete: () => flash.remove() });

  // Shake (perfect = 2 seconds sustained)
  const board = document.querySelector('.board');
  if (isPerfect) {
    const shakeLoop = anime({
      targets: board,
      translateX: [{ value: -6, duration: 40 }, { value: 6, duration: 40 }, { value: -4, duration: 40 }, { value: 4, duration: 40 }, { value: 0, duration: 40 }],
      loop: 10, easing: 'easeInOutSine'
    });
    setTimeout(() => shakeLoop.pause(), 2000);
  } else {
    anime({ targets: board, translateX: [{ value: -8, duration: 30 }, { value: 8, duration: 30 }, { value: -5, duration: 30 }, { value: 5, duration: 30 }, { value: 0, duration: 40 }] });
  }

  // Perfect: PERFECT! text + dragon shadow + shockwave
  if (isPerfect) {
    showPerfectText(overlay);
    showDragonShadow(overlay);
    spawnPerfectShockwave();
  }

  // Tier label
  scoreDisplay.innerHTML = `<div class="jp-tier-label" style="color:${gate.color}">${gate.label}${isPerfect ? ' <span style="color:#ffd700">PERFECT!</span>' : ''}</div>`;
  anime({ targets: scoreDisplay.querySelector('.jp-tier-label'), scale: [0.3, 1.3, 1], duration: 600, easing: 'easeOutElastic(1, 0.4)' });

  // Count-up (perfect = slower for suspense)
  setTimeout(() => {
    coinCount.currentTime = 0;
    coinCount.play().catch(() => {});

    const numEl = document.createElement('div');
    numEl.className = 'jp-payout-number';
    if (isPerfect) numEl.innerHTML = '0 <span style="font-size:28px;color:#ffd700">×3</span>';
    else numEl.textContent = '0';
    overlay.appendChild(numEl);

    const counter = { val: 0 };
    anime({
      targets: counter, val: jpResult.payout,
      duration: isPerfect ? 2500 : 1500,
      easing: isPerfect ? 'easeInOutQuad' : 'easeOutExpo',
      round: 1,
      update: () => {
        const txt = Math.round(counter.val).toLocaleString();
        numEl.innerHTML = isPerfect ? `${txt} <span style="font-size:28px;color:#ffd700">×3</span>` : txt;
      },
      complete: () => {
        coinCount.pause();
        anime({ targets: numEl, scale: [1, 1.4, 1], duration: 400, easing: 'easeOutElastic(1, 0.5)' });
        spawnCoinRain(isPerfect ? 80 : 40, isPerfect ? 2500 : 1500);
        setTimeout(() => cleanup(overlay, resolve), isPerfect ? 3500 : 2000);
      }
    });
  }, isPerfect ? 1000 : 700);
}

function showPerfectText(overlay) {
  const el = document.createElement('img');
  el.src = 'assets/img/effects/perfect_badge.png';
  el.className = 'jp-perfect-text';
  overlay.appendChild(el);
  anime({ targets: el, scale: [0.2, 1.4, 1.1], opacity: [0, 1], duration: 600, easing: 'easeOutElastic(1, 0.4)' });
  setTimeout(() => { anime({ targets: el, opacity: 0, scale: 0.9, duration: 400, easing: 'easeInQuad', complete: () => el.remove() }); }, 1800);
}

function showDragonShadow(overlay) {
  const el = document.createElement('img');
  el.src = 'assets/img/effects/dragon_gold.png';
  el.className = 'jp-dragon-shadow';
  overlay.appendChild(el);
  anime({ targets: el, translateX: ['-120%', '120%'], opacity: [0, 0.7, 0], duration: 1000, easing: 'easeInOutQuad', complete: () => el.remove() });
}

async function spawnPerfectShockwave() {
  const el = document.createElement('img');
  el.src = 'assets/img/effects/shockwave.png';
  el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.2);width:300px;height:300px;z-index:1201;pointer-events:none;opacity:1';
  document.body.appendChild(el);
  anime({ targets: el, scale: [0.2, 3], opacity: [1, 0], duration: 600, easing: 'easeOutQuad', complete: () => el.remove() });
}

async function spawnCoinRain(count, duration) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;
  const texture = PIXI.Texture.from('assets/img/effects/coin_gold.png');

  for (let i = 0; i < count; i++) {
    const coin = new PIXI.Sprite(texture);
    coin.anchor.set(0.5);
    coin.width = 16 + Math.random() * 12;
    coin.height = coin.width;
    coin.position.set(Math.random() * window.innerWidth, -20);
    coin.rotation = Math.random() * Math.PI;
    app.stage.addChild(coin);

    anime({
      targets: coin.position,
      y: window.innerHeight + 30,
      x: coin.position.x + (Math.random() - 0.5) * 80,
      duration: 1000 + Math.random() * 1000,
      delay: Math.random() * (duration * 0.6),
      easing: 'easeInQuad',
      complete: () => { app.stage.removeChild(coin); coin.destroy(); }
    });
    anime({ targets: coin, rotation: coin.rotation + Math.random() * 4, duration: 1500, easing: 'linear' });
  }
}

function cleanup(overlay, resolve) {
  anime({
    targets: overlay, opacity: 0, duration: 400, easing: 'easeInQuad',
    complete: () => { overlay.remove(); resolve(); }
  });
  // Safety: force remove after 1s no matter what
  setTimeout(() => {
    if (overlay.parentNode) overlay.remove();
    document.querySelectorAll('.jp-reveal-overlay, .fg-meter').forEach(el => el.remove());
  }, 1000);
}
}
