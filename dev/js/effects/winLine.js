// winLine.js — Win line celebration animation
import { anime } from '../gameFeel.js';

// Play win animation for a single row
export function playWinLine(row, badgeEl) {
  return new Promise(resolve => {
    const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
    const board = document.querySelector('.board');

    // 1. Dim non-winning cells
    board.classList.add('win-dimmed');
    cells.forEach(c => c.classList.add('win-active'));

    // 2. Gold sweep line on each cell
    cells.forEach((cell, i) => {
      setTimeout(() => {
        const sweep = document.createElement('div');
        sweep.className = 'win-sweep';
        cell.style.position = 'relative';
        cell.appendChild(sweep);
        setTimeout(() => sweep.remove(), 550);
      }, i * 80);
    });

    // 3. Glow + pulse on winning cells
    setTimeout(() => {
      cells.forEach(c => { c.classList.add('win-glow', 'win-pulse'); });
    }, 200);

    // 4. Particles burst from row
    setTimeout(() => {
      cells.forEach(cell => {
        for (let i = 0; i < 5; i++) {
          const p = document.createElement('div');
          p.className = 'win-particle';
          p.style.setProperty('--px', (Math.random() * 60 - 30) + 'px');
          p.style.setProperty('--py', (Math.random() * -40 - 10) + 'px');
          p.style.left = (Math.random() * 80 + 10) + '%';
          p.style.top = (Math.random() * 80 + 10) + '%';
          cell.style.position = 'relative';
          cell.appendChild(p);
          setTimeout(() => p.remove(), 750);
        }
      });
    }, 250);

    // 5. Badge pop animation
    if (badgeEl) {
      setTimeout(() => {
        badgeEl.classList.add('win-pop');
      }, 350);
    }

    // Cleanup after animation
    setTimeout(() => {
      cells.forEach(c => { c.classList.remove('win-glow', 'win-pulse', 'win-active'); });
      board.classList.remove('win-dimmed');
      resolve();
    }, 800);
  });
}

// Play win lines sequentially for multiple winning rows
export async function playWinLines(winRows) {
  if (winRows.length === 0) return;
  for (let i = 0; i < winRows.length; i++) {
    await playWinLine(winRows[i].row, winRows[i].badgeEl);
    if (i < winRows.length - 1) await delay(200);
  }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
