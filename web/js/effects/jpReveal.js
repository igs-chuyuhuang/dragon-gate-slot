// jpReveal.js — JP 開獎儀式：暗場 → 三道門 → 光柱上升 → 命中/未命中
import { anime, getPixi } from '../gameFeel.js';

const drumRoll = new Audio('assets/sfx/drum_roll.mp3');
const gateOpen = new Audio('assets/sfx/gate_open.mp3');
const jpWin = new Audio('assets/sfx/jp_win.mp3');
const coinCount = new Audio('assets/sfx/coin_count.mp3');
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
          gateEl.innerHTML = `<span>${gate.label}</span>`;
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
    // Miss: beam fades out
    const beam = overlay.querySelector('.jp-beam');
    anime({ targets: beam, opacity: [1, 0.3], duration: 500, easing: 'easeInQuad' });
    scoreDisplay.textContent = jpResult.msg;
    scoreDisplay.style.color = '#888';
    setTimeout(() => cleanup(overlay, resolve), 1500);
    return;
  }

  // Hit! Find the gate color
  const gate = GATES.find(g => g.tier === jpResult.tier) || GATES[0];
  jpWin.currentTime = 0;
  jpWin.play().catch(() => {});

  // Flash the beam in gate color
  const beam = overlay.querySelector('.jp-beam');
  beam.style.background = gate.color;
  anime({ targets: beam, opacity: [1, 0.6, 1], duration: 300, loop: 3 });

  // Screen flash
  const flash = document.createElement('div');
  flash.style.cssText = `position:absolute;inset:0;background:${gate.color};opacity:0.4;pointer-events:none`;
  overlay.appendChild(flash);
  anime({ targets: flash, opacity: [0.4, 0], duration: 500, easing: 'easeOutQuad', complete: () => flash.remove() });

  // Shake
  anime({
    targets: document.querySelector('.board'),
    translateX: [{ value: -8, duration: 30 }, { value: 8, duration: 30 }, { value: -5, duration: 30 }, { value: 5, duration: 30 }, { value: 0, duration: 40 }]
  });

  // Show tier label
  scoreDisplay.innerHTML = `<div class="jp-tier-label" style="color:${gate.color}">${gate.label}</div>`;
  anime({ targets: scoreDisplay.querySelector('.jp-tier-label'), scale: [0.3, 1.2, 1], duration: 500, easing: 'easeOutElastic(1, 0.4)' });

  // Count-up payout
  setTimeout(() => {
    coinCount.currentTime = 0;
    coinCount.play().catch(() => {});

    const numEl = document.createElement('div');
    numEl.className = 'jp-payout-number';
    numEl.textContent = '0';
    overlay.appendChild(numEl);

    const counter = { val: 0 };
    anime({
      targets: counter, val: jpResult.payout,
      duration: 1500, easing: 'easeOutExpo', round: 1,
      update: () => { numEl.textContent = Math.round(counter.val).toLocaleString(); },
      complete: () => {
        coinCount.pause();
        anime({ targets: numEl, scale: [1, 1.3, 1], duration: 300, easing: 'easeOutElastic(1, 0.5)' });
        // Gold rain
        spawnCoinRain(overlay);
        setTimeout(() => cleanup(overlay, resolve), 2000);
      }
    });
  }, 700);
}

async function spawnCoinRain(overlay) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;

  for (let i = 0; i < 40; i++) {
    const g = new PIXI.Graphics();
    g.beginFill([0xffd700, 0xffaa00, 0xfffacd][i % 3]);
    g.drawCircle(0, 0, 3 + Math.random() * 3);
    g.endFill();
    g.position.set(Math.random() * window.innerWidth, -10);
    app.stage.addChild(g);

    anime({
      targets: g.position,
      y: window.innerHeight + 20,
      x: g.position.x + (Math.random() - 0.5) * 80,
      duration: 1200 + Math.random() * 800,
      delay: Math.random() * 500,
      easing: 'easeInQuad',
      complete: () => { app.stage.removeChild(g); g.destroy(); }
    });
  }
}

function cleanup(overlay, resolve) {
  anime({
    targets: overlay, opacity: 0, duration: 400, easing: 'easeInQuad',
    complete: () => { overlay.remove(); resolve(); }
  });
}
