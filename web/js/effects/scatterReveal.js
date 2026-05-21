// scatterReveal.js — Scatter 依序 reveal 三顆 + debug 熱鍵
import { anime } from '../gameFeel.js';

const dragonGrowl = new Audio('assets/sfx/dragon_growl.mp3');
const heartbeat = new Audio('assets/sfx/heartbeat.mp3');
const dragonRoar = new Audio('assets/sfx/dragon_roar.mp3');
heartbeat.loop = true;

// Reveal scatter cells sequentially based on count
export function revealScatters(board, scatterCount) {
  const scCells = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (board[r][c].isScatter)
        scCells.push({ r, c, el: document.getElementById(`cell-${r}-${c}`) });

  if (scCells.length === 0) return Promise.resolve();

  return new Promise(resolve => {
    let delay = 0;
    scCells.forEach((sc, i) => {
      setTimeout(() => {
        if (i === 0) revealFirst(sc.el);
        else if (i === 1) revealSecond(sc.el, scCells.length);
        else if (i === 2) revealThird(sc.el, scCells, resolve);
      }, delay);
      delay += i === 1 ? 600 : 400;
    });

    // If less than 3, resolve after last
    if (scCells.length < 3) setTimeout(resolve, delay + 500);
  });
}

function revealFirst(el) {
  // Gold frame + dragon growl tail
  dragonGrowl.currentTime = 0;
  dragonGrowl.volume = 0.4;
  dragonGrowl.play().catch(() => {});

  el.classList.add('sc-reveal');
  anime({
    targets: el,
    boxShadow: ['0 0 0px #ffd700', '0 0 20px 8px #ffd700'],
    scale: [1, 1.1, 1],
    duration: 400,
    easing: 'easeOutElastic(1, 0.6)'
  });
}

function revealSecond(el, totalCount) {
  // Darken screen + heartbeat + "再一龍！"
  heartbeat.currentTime = 0;
  heartbeat.play().catch(() => {});

  el.classList.add('sc-reveal');
  anime({
    targets: el,
    boxShadow: ['0 0 0px #ffd700', '0 0 24px 10px #ffd700'],
    scale: [1, 1.15, 1],
    duration: 400,
    easing: 'easeOutElastic(1, 0.6)'
  });

  // Darken overlay
  const overlay = document.createElement('div');
  overlay.className = 'sc-darken';
  document.body.appendChild(overlay);
  anime({ targets: overlay, opacity: [0, 0.4], duration: 300, easing: 'easeOutQuad' });

  // "再一龍！" text if only 2 total
  if (totalCount === 2) {
    const txt = document.createElement('div');
    txt.className = 'sc-hint-text';
    txt.textContent = '🐉 再一龍！';
    document.body.appendChild(txt);
    anime({ targets: txt, scale: [0.3, 1], opacity: [0, 1], duration: 350, easing: 'easeOutElastic(1, 0.5)' });
    setTimeout(() => {
      heartbeat.pause();
      anime({ targets: [txt, overlay], opacity: 0, duration: 400, easing: 'easeInQuad', complete: () => { txt.remove(); overlay.remove(); } });
    }, 1200);
  } else {
    // Will be cleaned up by third reveal
    setTimeout(() => { heartbeat.pause(); overlay.remove(); }, 1500);
  }
}

function revealThird(el, allCells, resolve) {
  heartbeat.pause();
  dragonRoar.currentTime = 0;
  dragonRoar.play().catch(() => {});

  // Remove any existing overlays
  document.querySelectorAll('.sc-darken, .sc-hint-text').forEach(e => e.remove());

  el.classList.add('sc-reveal');

  // 300ms freeze
  const board = document.querySelector('.board');
  board.classList.add('sc-freeze');

  anime({
    targets: el,
    boxShadow: ['0 0 0px #ffd700', '0 0 30px 14px #ffd700'],
    scale: [1, 1.2, 1],
    duration: 500,
    easing: 'easeOutElastic(1, 0.5)'
  });

  // Connect line between 3 scatters
  setTimeout(() => {
    // Dragon shadow sweep
    const sweep = document.createElement('div');
    sweep.className = 'dragon-sweep';
    document.body.appendChild(sweep);
    anime({ targets: sweep, translateX: ['-100%', '100%'], opacity: [0.6, 0], duration: 600, easing: 'easeOutQuad', complete: () => sweep.remove() });

    board.classList.remove('sc-freeze');
    allCells.forEach(sc => sc.el.classList.remove('sc-reveal'));
    resolve();
  }, 300);
}

// Debug hotkey: press 'S' to simulate scatter reveal
export function initScatterDebug(board) {
  document.addEventListener('keydown', e => {
    if (e.key !== 's' && e.key !== 'S') return;
    if (e.ctrlKey || e.altKey) return;

    // Simulate 3 scatters at random positions
    const fakeBoard = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => ({ value: 5, isScatter: false })));
    const positions = [[0, 0], [1, 1], [2, 2]];
    positions.forEach(([r, c]) => { fakeBoard[r][c].isScatter = true; });
    revealScatters(fakeBoard, 3);
  });
}
