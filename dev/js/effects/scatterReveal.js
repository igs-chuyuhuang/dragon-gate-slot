// scatterReveal.js — Scatter flash + fly to ring
import { anime } from '../gameFeel.js';

export function revealScatters(board, scatterCount) {
  const scCells = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (board[r][c].isScatter)
        scCells.push({ r, c, el: document.getElementById(`cell-${r}-${c}`) });

  if (scCells.length === 0) return Promise.resolve();

  return new Promise(resolve => {
    let delay = 0;
    scCells.forEach(() => { delay += 400; });
    scCells.forEach((sc, i) => {
      setTimeout(() => flashAndFly(sc.el), i * 400);
    });
    setTimeout(resolve, delay + 1000);
  });
}

function flashAndFly(el) {
  if (!el) return;

  anime({
    targets: el,
    backgroundColor: ['#16213e', '#3a2800', '#16213e'],
    boxShadow: ['0 0 0px transparent', '0 0 16px 6px rgba(255,215,0,0.5)', '0 0 0px transparent'],
    duration: 500,
    easing: 'easeOutQuad'
  });

  setTimeout(() => {
    const ring = document.querySelector('.scatter-ring');
    if (!ring) return;
    const srcRect = el.getBoundingClientRect();
    const dstRect = ring.getBoundingClientRect();
    const flyer = document.createElement('img');
    flyer.src = 'assets/img/SC-01_scatter_dragon.png';
    flyer.style.cssText = `position:fixed;left:${srcRect.left}px;top:${srcRect.top}px;width:${srcRect.width}px;height:${srcRect.height}px;z-index:9999;object-fit:contain;transition:all 500ms cubic-bezier(0.25,1,0.5,1);pointer-events:none;`;
    document.body.appendChild(flyer);
    requestAnimationFrame(() => {
      flyer.style.left = (dstRect.left + dstRect.width / 2 - srcRect.width / 4) + 'px';
      flyer.style.top = (dstRect.top + dstRect.height / 2 - srcRect.height / 4) + 'px';
      flyer.style.width = (srcRect.width / 2) + 'px';
      flyer.style.height = (srcRect.height / 2) + 'px';
      flyer.style.opacity = '0.8';
    });
    setTimeout(() => {
      flyer.remove();
      ring.style.boxShadow = '0 0 20px rgba(255,215,0,0.9)';
      setTimeout(() => { ring.style.boxShadow = ''; }, 400);
    }, 550);
  }, 500);
}

export function initScatterDebug() {}
