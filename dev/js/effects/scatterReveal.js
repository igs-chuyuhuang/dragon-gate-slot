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
  // Yellow border glow on cell (square, outline only)
  el.style.position = 'relative';
  el.style.boxShadow = '0 0 20px 8px rgba(255,215,0,0.9), inset 0 0 8px rgba(255,215,0,0.3)';
  setTimeout(() => { el.style.boxShadow = ''; }, 300);

  // After flash, fly scatter icon to ring
  setTimeout(() => {
    const ring = document.querySelector('.scatter-ring');
    if (!ring) return;
    const srcRect = el.getBoundingClientRect();
    const dstRect = ring.getBoundingClientRect();
    const flyer = document.createElement('img');
    flyer.src = 'assets/img/SC-01_scatter_dragon.png';
    flyer.style.cssText = `position:fixed;left:${srcRect.left}px;top:${srcRect.top}px;width:${srcRect.width}px;height:${srcRect.height}px;z-index:9999;object-fit:contain;pointer-events:none;transition:none;`;
    document.body.appendChild(flyer);
    // Animate along a curved path using keyframes
    const dx = (dstRect.left + dstRect.width / 2 - srcRect.width / 4) - srcRect.left;
    const dy = (dstRect.top + dstRect.height / 2 - srcRect.height / 4) - srcRect.top;
    const anim = flyer.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.3}px, ${dy * 0.5 - 30}px) scale(0.8)`, opacity: 1, offset: 0.4 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.5)`, opacity: 0.8 }
    ], { duration: 800, easing: 'ease-in-out', fill: 'forwards' });
    anim.onfinish = () => {
      flyer.remove();
      ring.style.boxShadow = '0 0 20px 8px rgba(255,215,0,0.9)';
      ring.style.borderRadius = '50%';
      setTimeout(() => { ring.style.boxShadow = ''; }, 400);
    };
  }, 300);
}

export function initScatterDebug() {}
