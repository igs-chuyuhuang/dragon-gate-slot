// fgMeter.js — FG 期間 JP 進度條 + 差異化門突破特效 + debug 熱鍵
import { anime, getPixi } from '../gameFeel.js';
import { playJpReveal } from './jpReveal.js';

const gateAudio = new Audio('assets/sfx/gate_open.mp3');
const growlAudio = new Audio('assets/sfx/dragon_growl.mp3');
const roarAudio = new Audio('assets/sfx/dragon_roar.mp3');
const MAX_SCORE = 320;

const ZONES = [
  { id: 'basic', lo: 60, hi: 120, color: '#4488ff', label: 'Basic' },
  { id: 'major', lo: 130, hi: 200, color: '#ff8c00', label: 'Major' },
  { id: 'grand', lo: 210, hi: 320, color: '#dc143c', label: 'Grand' },
];

let meterEl = null;
let beamEl = null;
let hintEl = null;
let trackEl = null;
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
  trackEl = meterEl.querySelector('.fg-meter-track');

  anime({ targets: meterEl, opacity: [0, 1], translateX: [20, 0], duration: 400, easing: 'easeOutQuad' });
}

export function updateFgMeter(score) {
  if (!meterEl) return;
  const prev = lastScore;
  lastScore = score;

  anime({ targets: beamEl, height: pct(score) + '%', duration: 500, easing: 'easeOutBack' });

  ZONES.forEach(z => {
    const zoneEl = meterEl.querySelector(`[data-zone="${z.id}"]`);
    const wasInside = prev >= z.lo;
    const isInside = score >= z.lo;
    const isNear = score >= z.lo - 10 && score < z.lo;

    if (isNear && !enteredZones.has(z.id)) {
      zoneEl.classList.add('fg-meter-zone-near');
      showHint(`快到 ${z.label} 了！`, z.color);
    } else if (isInside && !enteredZones.has(z.id)) {
      enteredZones.add(z.id);
      zoneEl.classList.remove('fg-meter-zone-near');
      zoneEl.classList.add('fg-meter-zone-active');
      playBreakthrough(z);
    }

    if (score >= z.lo && score <= z.hi) zoneEl.classList.add('fg-meter-zone-active');
  });
}

export function hideFgMeter() {
  if (!meterEl) return;
  const el = meterEl;
  meterEl = null; beamEl = null; hintEl = null; trackEl = null;
  anime({
    targets: el, opacity: 0, translateX: 20,
    duration: 300, easing: 'easeInQuad',
    complete: () => el.remove()
  });
  setTimeout(() => { if (el.parentNode) el.remove(); }, 500);
}

// === Differentiated breakthrough effects ===
function playBreakthrough(zone) {
  const board = document.querySelector('.board');

  if (zone.id === 'basic') {
    gateAudio.currentTime = 0;
    gateAudio.play().catch(() => {});
    showHint('進入 Basic！', zone.color);
    // Blue wave from meter
    screenFlash(zone.color, 0.2);
    anime({ targets: board, translateX: [{ value: -3, duration: 30 }, { value: 3, duration: 30 }, { value: 0, duration: 30 }] });
    pulseTrack(zone.color);
  } else if (zone.id === 'major') {
    gateAudio.currentTime = 0;
    gateAudio.play().catch(() => {});
    setTimeout(() => { growlAudio.currentTime = 0; growlAudio.play().catch(() => {}); }, 150);
    showHint('突破到 Major！', zone.color);
    screenFlash(zone.color, 0.35);
    anime({ targets: board, translateX: [{ value: -6, duration: 30 }, { value: 6, duration: 30 }, { value: -4, duration: 30 }, { value: 4, duration: 30 }, { value: 0, duration: 30 }] });
    // Meter border glow orange
    if (trackEl) trackEl.style.boxShadow = `0 0 12px 4px ${zone.color}`;
    spawnBreakthroughParticles(zone.color, 25);
    pulseTrack(zone.color);
  } else if (zone.id === 'grand') {
    roarAudio.currentTime = 0;
    roarAudio.play().catch(() => {});
    showBigText('挑戰 Grand！', zone.color);
    screenFlash('#ffd700', 0.5);
    // Darken then restore
    const dark = document.createElement('div');
    dark.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:840;pointer-events:none';
    document.body.appendChild(dark);
    anime({ targets: dark, opacity: [0.4, 0], duration: 800, delay: 300, easing: 'easeInQuad', complete: () => dark.remove() });
    // Big shake
    anime({ targets: board, translateX: [{ value: -10, duration: 25 }, { value: 10, duration: 25 }, { value: -7, duration: 25 }, { value: 7, duration: 25 }, { value: -3, duration: 25 }, { value: 0, duration: 30 }] });
    // Shockwave
    spawnShockwave();
    // Meter border burning red
    if (trackEl) { trackEl.style.boxShadow = `0 0 16px 6px ${zone.color}`; trackEl.classList.add('fg-meter-burning'); }
    spawnBreakthroughParticles(zone.color, 50);
  }
}

function screenFlash(color, alpha) {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;inset:0;background:${color};opacity:${alpha};z-index:899;pointer-events:none`;
  document.body.appendChild(el);
  anime({ targets: el, opacity: [alpha, 0], duration: 300, easing: 'easeOutQuad', complete: () => el.remove() });
}

function pulseTrack(color) {
  if (!trackEl) return;
  anime({ targets: trackEl, borderColor: [color, 'rgba(255,255,255,0.1)'], duration: 600, easing: 'easeOutQuad' });
}

function showBigText(text, color) {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;top:35%;left:50%;transform:translate(-50%,-50%);font-size:40px;font-weight:900;color:${color};z-index:960;pointer-events:none;text-shadow:0 0 16px ${color}`;
  el.textContent = text;
  document.body.appendChild(el);
  anime({ targets: el, scale: [0.3, 1.1, 1], opacity: [0, 1], duration: 400, easing: 'easeOutElastic(1, 0.4)' });
  setTimeout(() => { anime({ targets: el, opacity: 0, translateY: -20, duration: 300, easing: 'easeInQuad', complete: () => el.remove() }); }, 1200);
}

async function spawnShockwave() {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  const ring = new PIXI.Graphics();
  ring.lineStyle(3, 0xdc143c, 1);
  ring.drawCircle(0, 0, 12);
  ring.position.set(cx, cy);
  app.stage.addChild(ring);
  anime({ targets: ring.scale, x: [1, 10], y: [1, 10], duration: 500, easing: 'easeOutQuad' });
  anime({ targets: ring, alpha: [1, 0], duration: 500, easing: 'easeOutQuad', complete: () => { app.stage.removeChild(ring); ring.destroy(); } });
}

async function spawnBreakthroughParticles(color, count) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;

  // Spawn from meter position (right side)
  const cx = window.innerWidth - 40, cy = window.innerHeight / 2;
  const hex = parseInt(color.replace('#', ''), 16);

  for (let i = 0; i < count; i++) {
    const g = new PIXI.Graphics();
    g.beginFill(i % 2 === 0 ? hex : 0xffd700);
    g.drawCircle(0, 0, 2 + Math.random() * 3);
    g.endFill();
    g.position.set(cx, cy + (Math.random() - 0.5) * 100);
    app.stage.addChild(g);
    const angle = Math.PI + (Math.random() - 0.5) * 1.5; // spray leftward
    const dist = 60 + Math.random() * 120;
    anime({ targets: g.position, x: cx + Math.cos(angle) * dist, y: g.position.y + Math.sin(angle) * dist, duration: 400 + Math.random() * 300, easing: 'easeOutQuad' });
    anime({ targets: g, alpha: 0, duration: 600, easing: 'easeOutQuad', complete: () => { app.stage.removeChild(g); g.destroy(); } });
  }
}

function pct(score) { return Math.min(100, (score / MAX_SCORE) * 100); }

function showHint(text, color) {
  if (!hintEl) return;
  hintEl.textContent = text;
  hintEl.style.color = color;
  anime({ targets: hintEl, opacity: [0, 1], translateY: [5, 0], duration: 250, easing: 'easeOutQuad' });
  setTimeout(() => { anime({ targets: hintEl, opacity: 0, duration: 400, easing: 'easeInQuad' }); }, 1500);
}

// === Debug hotkeys ===
export function initFgMeterDebug(gm) {
  document.addEventListener('keydown', async (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const scores = { '1': 85, '2': 160, '3': 260, '4': 90, '5': 265 };
    if (!scores[e.key]) return;

    const targetScore = scores[e.key];
    showFgMeter();

    // Animate through gates sequentially
    const steps = [];
    if (targetScore >= 60) steps.push(65);
    if (targetScore >= 130) steps.push(135);
    if (targetScore >= 210) steps.push(215);
    steps.push(targetScore);

    for (const s of steps) {
      await delay(600);
      updateFgMeter(s);
    }

    // Wait for effects to finish, then JP reveal
    await delay(1500);
    hideFgMeter();
    await delay(400);

    // Simulate jpResult
    const jpResult = gm.jp.evalJpGate(targetScore);
    await playJpReveal(targetScore, jpResult);

    // Safety: force cleanup any leftover overlays
    setTimeout(() => {
      document.querySelectorAll('.jp-reveal-overlay, .fg-meter, .bigwin-overlay').forEach(el => el.remove());
    }, 500);
  });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
