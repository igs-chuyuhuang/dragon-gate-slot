// fgMeter.js — FG 期間 JP 進度條
import { anime } from '../gameFeel.js';

const gateAudio = new Audio('assets/sfx/gate_open.mp3');
const MAX_SCORE = 320;

const ZONES = [
  { id: 'basic', lo: 60, hi: 120, color: '#4488ff', label: 'Basic' },
  { id: 'major', lo: 130, hi: 200, color: '#ff8c00', label: 'Major' },
  { id: 'grand', lo: 210, hi: 320, color: '#dc143c', label: 'Grand' },
];

let meterEl = null;
let beamEl = null;
let hintEl = null;
let lastScore = 0;
let enteredZones = new Set();

export function showFgMeter() {
  if (meterEl) meterEl.remove();
  lastScore = 0;
  enteredZones.clear();

  meterEl = document.createElement('div');
  meterEl.className = 'fg-meter';
  meterEl.innerHTML = `
    <div class="fg-meter-track">
      ${ZONES.map(z => `
        <div class="fg-meter-zone" data-zone="${z.id}"
          style="bottom:${pct(z.lo)}%;height:${pct(z.hi) - pct(z.lo)}%;background:${z.color}22;border:1px solid ${z.color}">
          <span class="fg-meter-label" style="color:${z.color}">${z.label}</span>
        </div>
      `).join('')}
      <div class="fg-meter-beam"></div>
    </div>
    <div class="fg-meter-hint"></div>
  `;
  document.body.appendChild(meterEl);
  beamEl = meterEl.querySelector('.fg-meter-beam');
  hintEl = meterEl.querySelector('.fg-meter-hint');

  anime({ targets: meterEl, opacity: [0, 1], translateX: [20, 0], duration: 400, easing: 'easeOutQuad' });
}

export function updateFgMeter(score) {
  if (!meterEl) return;
  const prev = lastScore;
  lastScore = score;

  // Animate beam to new position
  anime({
    targets: beamEl,
    height: pct(score) + '%',
    duration: 500,
    easing: 'easeOutBack'
  });

  // Check zone entry/proximity
  ZONES.forEach(z => {
    const zoneEl = meterEl.querySelector(`[data-zone="${z.id}"]`);
    const wasInside = prev >= z.lo && prev <= z.hi;
    const isInside = score >= z.lo && score <= z.hi;
    const isNear = score >= z.lo - 10 && score < z.lo;

    if (isNear && !isInside) {
      // Approaching gate
      zoneEl.classList.add('fg-meter-zone-near');
      showHint(`快到 ${z.label} 了！`, z.color);
    } else if (isInside && !wasInside && !enteredZones.has(z.id)) {
      // Just entered gate
      enteredZones.add(z.id);
      zoneEl.classList.remove('fg-meter-zone-near');
      zoneEl.classList.add('fg-meter-zone-active');
      gateAudio.currentTime = 0;
      gateAudio.play().catch(() => {});
      showHint(`進入 ${z.label}！`, z.color);
      anime({ targets: zoneEl, scale: [1, 1.05, 1], duration: 300, easing: 'easeOutElastic(1, 0.6)' });
    } else if (!isNear && !isInside) {
      zoneEl.classList.remove('fg-meter-zone-near');
    }

    // Keep active if still inside
    if (isInside) zoneEl.classList.add('fg-meter-zone-active');
  });
}

export function hideFgMeter() {
  if (!meterEl) return;
  anime({
    targets: meterEl, opacity: 0, translateX: 20,
    duration: 300, easing: 'easeInQuad',
    complete: () => { meterEl.remove(); meterEl = null; beamEl = null; hintEl = null; }
  });
}

function pct(score) {
  return Math.min(100, (score / MAX_SCORE) * 100);
}

function showHint(text, color) {
  if (!hintEl) return;
  hintEl.textContent = text;
  hintEl.style.color = color;
  anime({ targets: hintEl, opacity: [0, 1], translateY: [5, 0], duration: 250, easing: 'easeOutQuad' });
  setTimeout(() => { anime({ targets: hintEl, opacity: 0, duration: 400, easing: 'easeInQuad' }); }, 1500);
}
