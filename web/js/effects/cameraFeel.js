// cameraFeel.js — Camera system: stackable screen effects
import { anime } from '../gameFeel.js';

const board = () => document.querySelector('.board');
let dimEl = null;

export function hitStop(ms = 80) {
  return new Promise(r => setTimeout(r, ms));
}

export function shakeBoard(intensity = 8, duration = 200) {
  const b = board();
  if (!b) return;
  // Use longer keyframes so shake is visible in 150ms capture intervals
  const steps = Math.max(8, Math.ceil(duration / 25));
  const kfX = [], kfY = [];
  for (let i = 0; i < steps; i++) {
    const decay = 1 - (i / steps) * 0.5; // slower decay = visible longer
    const angle = Math.random() * Math.PI * 2;
    kfX.push({ value: Math.round(Math.cos(angle) * intensity * decay), duration: 25 });
    kfY.push({ value: Math.round(Math.sin(angle) * intensity * decay * 0.7), duration: 25 });
  }
  kfX.push({ value: 0, duration: 40 });
  kfY.push({ value: 0, duration: 40 });
  anime.remove(b); // clear any existing shake
  anime({ targets: b, translateX: kfX, translateY: kfY, easing: 'linear' });
}

export function flashScreen(color = '#ffd700', alpha = 0.4, duration = 250) {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;inset:0;background:${color};opacity:${alpha};z-index:899;pointer-events:none`;
  document.body.appendChild(el);
  anime({ targets: el, opacity: [alpha, 0], duration, easing: 'easeOutQuad', complete: () => el.remove() });
}

export function dimBackground(alpha = 0.4, duration = 200) {
  if (dimEl) dimEl.remove();
  dimEl = document.createElement('div');
  dimEl.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,${alpha});z-index:850;pointer-events:none;opacity:0`;
  document.body.appendChild(dimEl);
  anime({ targets: dimEl, opacity: [0, 1], duration, easing: 'easeOutQuad' });
  return dimEl;
}

export function restoreDim(duration = 200) {
  if (!dimEl) return;
  const el = dimEl;
  dimEl = null;
  anime({ targets: el, opacity: 0, duration, easing: 'easeInQuad', complete: () => el.remove() });
}

export function focusRow(row) {
  const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
  cells.forEach(c => { if (c) c.style.zIndex = '10'; });
  return () => cells.forEach(c => { if (c) c.style.zIndex = ''; });
}

export function pulseScreen(color = '#ffd700', count = 2) {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;inset:0;background:${color};opacity:0;z-index:899;pointer-events:none`;
  document.body.appendChild(el);
  anime({ targets: el, opacity: [0, 0.2, 0], duration: 350, loop: count, easing: 'easeInOutSine', complete: () => el.remove() });
}

export function shockwaveDOM(cx, cy, color = '#ffd700', scale = 6, duration = 400) {
  const sw = document.createElement('div');
  sw.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:40px;height:40px;border-radius:50%;border:3px solid ${color};transform:translate(-50%,-50%) scale(1);z-index:910;pointer-events:none;box-shadow:0 0 12px ${color}`;
  document.body.appendChild(sw);
  anime({ targets: sw, scale: [1, scale], opacity: [1, 0], duration, easing: 'easeOutQuad', complete: () => sw.remove() });
}
