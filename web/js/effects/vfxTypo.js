// vfxTypo.js — Market-grade slot typography with ghost trails
import { anime } from '../gameFeel.js';

export function explodeText(text, { x, y, size = 48, color, duration = 600, holdMs = 900 } = {}) {
  const cx = x ?? window.innerWidth / 2;
  const cy = y ?? window.innerHeight * 0.32;

  const el = document.createElement('div');
  el.className = 'vfx-text';
  el.textContent = text;
  if (size !== 48) el.style.fontSize = size + 'px';
  if (color) el.style.setProperty('--vfx-color', color);
  el.style.left = cx + 'px';
  el.style.top = cy + 'px';
  document.body.appendChild(el);

  // Ghost trails (4)
  for (let i = 0; i < 4; i++) {
    const ghost = el.cloneNode(true);
    ghost.classList.add('vfx-text-ghost');
    ghost.style.opacity = 0.4 - i * 0.08;
    ghost.style.filter = `blur(${1 + i}px)`;
    document.body.appendChild(ghost);
    anime({ targets: ghost, scale: [0.5, 1.5 + i * 0.15], opacity: 0, duration: duration * 0.8, delay: i * 40, easing: 'easeOutQuad', complete: () => ghost.remove() });
  }

  // Main text
  anime({ targets: el, scale: [0, 1.5, 1], opacity: [0, 1], duration, easing: 'easeOutElastic(1, 0.4)' });
  setTimeout(() => anime({ targets: el, opacity: 0, translateY: -20, scale: 0.9, duration: 300, easing: 'easeInQuad', complete: () => el.remove() }), holdMs);
  return el;
}

export function flyNumber(text, { fromX, fromY, toX, toY, size = 36 } = {}) {
  const el = document.createElement('div');
  el.className = 'vfx-text';
  el.textContent = text;
  el.style.fontSize = size + 'px';
  el.style.left = fromX + 'px';
  el.style.top = fromY + 'px';
  document.body.appendChild(el);

  // Explode out
  anime({ targets: el, scale: [0, 1.8, 1.2], duration: 180, easing: 'easeOutBack' });

  // Ghost trail during fly
  setTimeout(() => {
    for (let i = 0; i < 4; i++) {
      const ghost = el.cloneNode(true);
      ghost.classList.add('vfx-text-ghost');
      ghost.style.opacity = 0.35 - i * 0.07;
      ghost.style.filter = `blur(${1 + i}px)`;
      document.body.appendChild(ghost);
      anime({ targets: ghost, left: toX, top: toY, scale: [1.2 - i * 0.1, 0.5], opacity: 0, duration: 420 + i * 35, delay: i * 25, easing: 'easeOutExpo', complete: () => ghost.remove() });
    }
    anime({ targets: el, left: toX, top: toY, scale: [1.2, 0.7], opacity: [1, 0], duration: 420, delay: 100, easing: 'easeOutExpo', complete: () => el.remove() });
  }, 180);
}

export function countUp(target, { container, duration = 1500, prefix = '', suffix = '', size = 52 } = {}) {
  const el = document.createElement('div');
  el.className = 'vfx-text vfx-countup';
  if (size !== 52) el.style.fontSize = size + 'px';
  el.textContent = prefix + '0' + suffix;
  (container || document.body).appendChild(el);

  const counter = { val: 0 };
  anime({
    targets: counter, val: target,
    duration, easing: 'easeOutExpo', round: 1,
    update: () => { el.textContent = prefix + Math.round(counter.val).toLocaleString() + suffix; }
  });
  return el;
}
