// scatterReveal.js — Scatter flash + fly to ring
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
      setTimeout(() => flashAndFly(sc.el), delay);
      delay += 400;
    });
    setTimeout(resolve, delay + 600);
  });
}

function flashAndFly(el) {
  if (!el) return;
  // Yellow flash on cell
  const flash = document.createElement('div');
  flash.style.cssText = 'position:absolute;inset:0;background:rgba(255,215,0,0.7);z-index:10;pointer-events:none;border-radius:4px;';
  el.style.position = 'relative';
  el.appendChild(flash);
  setTimeout(() => flash.remove(), 300);

  // After flash, fly scatter icon to ring
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
      // Ring glow
      ring.style.boxShadow = '0 0 20px rgba(255,215,0,0.9)';
      setTimeout(() => { ring.style.boxShadow = ''; }, 400);
    }, 550);
  }, 300);
}

export function initScatterDebug() {}
