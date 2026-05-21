// freeGameTransition.js — Free Game 三段儀式轉場 (2.7s total)
import { anime, getPixi } from '../gameFeel.js';

const gateAudio = new Audio('assets/sfx/gate_open.mp3');
const dragonFly = new Audio('assets/sfx/dragon_fly.mp3');
const cheerAudio = new Audio('assets/sfx/crowd_cheer.mp3');

export function playFreeGameTransition(scatterCells) {
  return new Promise(resolve => {
    const board = document.querySelector('.board');

    // === Beat 1 (0~900ms): Gold gate frame wraps board ===
    gateAudio.currentTime = 0;
    gateAudio.play().catch(() => {});

    const frame = document.createElement('div');
    frame.className = 'fg-gate-frame';
    board.parentElement.insertBefore(frame, board);

    anime({
      targets: frame,
      opacity: [0, 1],
      scale: [1.3, 1],
      duration: 500,
      easing: 'easeOutBack'
    });

    // === Beat 2 (900~1800ms): Scatters become light orbs flying to center ===
    setTimeout(() => {
      dragonFly.currentTime = 0;
      dragonFly.play().catch(() => {});

      const boardRect = board.getBoundingClientRect();
      const centerX = boardRect.left + boardRect.width / 2;
      const centerY = boardRect.top + boardRect.height / 2;

      // Create orbs from scatter positions (or default positions)
      const orbPositions = scatterCells && scatterCells.length >= 3
        ? scatterCells.map(sc => {
            const el = document.getElementById(`cell-${sc.r}-${sc.c}`);
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          })
        : [
            { x: centerX - 80, y: centerY - 60 },
            { x: centerX + 80, y: centerY },
            { x: centerX, y: centerY + 60 }
          ];

      orbPositions.forEach((pos, i) => {
        const orb = document.createElement('div');
        orb.className = 'fg-orb';
        orb.style.left = pos.x + 'px';
        orb.style.top = pos.y + 'px';
        document.body.appendChild(orb);

        anime({
          targets: orb,
          left: centerX,
          top: centerY,
          scale: [1, 0.5],
          opacity: [1, 0.8],
          duration: 600,
          delay: i * 100,
          easing: 'easeInQuad',
          complete: () => orb.remove()
        });
      });

      // Center flash when orbs converge
      setTimeout(() => {
        const flash = document.createElement('div');
        flash.style.cssText = `position:fixed;left:${centerX}px;top:${centerY}px;width:20px;height:20px;border-radius:50%;background:radial-gradient(#fff,#ffd700);z-index:1001;pointer-events:none;transform:translate(-50%,-50%)`;
        document.body.appendChild(flash);
        anime({ targets: flash, scale: [1, 15], opacity: [1, 0], duration: 400, easing: 'easeOutExpo', complete: () => flash.remove() });
      }, 500);
    }, 900);

    // === Beat 3 (1800~2700ms): FG burst out, background switch ===
    setTimeout(() => {
      cheerAudio.currentTime = 0;
      cheerAudio.play().catch(() => {});

      // FG title burst
      const title = document.createElement('div');
      title.className = 'fg-title-burst';
      title.textContent = '🐉 FREE GAME 🐉';
      document.body.appendChild(title);

      anime({
        targets: title,
        scale: [0.2, 1.1, 1],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutElastic(1, 0.4)'
      });

      // Board shake
      anime({
        targets: board,
        translateX: [{ value: -6, duration: 30 }, { value: 6, duration: 30 }, { value: -3, duration: 30 }, { value: 0, duration: 30 }]
      });

      // Cleanup and resolve
      setTimeout(() => {
        anime({
          targets: [frame, title],
          opacity: 0,
          duration: 400,
          easing: 'easeInQuad',
          complete: () => { frame.remove(); title.remove(); resolve(); }
        });
      }, 600);
    }, 1800);
  });
}
