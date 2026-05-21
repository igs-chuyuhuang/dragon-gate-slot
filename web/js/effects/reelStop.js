// reelStop.js — 轉軸停止強化：column impact + vignette + motion blur + slow-mo
import { anime } from '../gameFeel.js';

const impactAudio = new Audio('assets/sfx/spin_release.mp3');

// Call when spin starts rolling
export function onSpinStart() {
  document.body.classList.add('reel-rolling');
}

// Call when a column stops. col = 0,1,2
export function onColumnStop(col) {
  const shakeAmp = [2, 4, 6][col];
  const board = document.querySelector('.board');
  const cells = [0, 1, 2].map(r => document.getElementById(`cell-${r}-${col}`));

  // Column impact: vertical gold sweep
  cells.forEach(cell => {
    cell.classList.add('col-impact');
    setTimeout(() => cell.classList.remove('col-impact'), 400);
  });

  // ScaleY bounce
  anime({
    targets: cells,
    scaleY: [0.92, 1.08, 1],
    duration: 250,
    easing: 'easeOutElastic(1, 0.6)'
  });

  // Board shake (increasing per column)
  anime({
    targets: board,
    translateY: [
      { value: -shakeAmp, duration: 25 },
      { value: shakeAmp, duration: 25 },
      { value: -shakeAmp * 0.5, duration: 25 },
      { value: 0, duration: 30 }
    ],
    easing: 'easeOutQuad'
  });

  // Last column: slow-mo pause
  if (col === 2) {
    onLastColumnStop(cells);
  }
}

function onLastColumnStop(cells) {
  // 120ms slow-mo freeze effect
  document.body.classList.add('reel-slowmo');
  impactAudio.currentTime = 0;
  impactAudio.play().catch(() => {});

  setTimeout(() => {
    document.body.classList.remove('reel-rolling', 'reel-slowmo');
  }, 120);
}

// Call when entire spin animation is done
export function onSpinEnd() {
  document.body.classList.remove('reel-rolling', 'reel-slowmo');
}
