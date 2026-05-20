// wallHit.js — 碰壁撞擊特效（膨脹 + 裂痕 + 推開）
import { anime } from '../gameFeel.js';

const hitAudio = new Audio('assets/sfx/wall_hit.mp3');
const crackAudio = new Audio('assets/sfx/crack.mp3');

export function playWallHit(row) {
  hitAudio.currentTime = 0;
  hitAudio.play().catch(() => {});
  const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
  const [left, mid, right] = cells;

  // 1. 中間 cell 撞擊膨脹 + 紅色邊框
  anime({
    targets: mid,
    scale: [1, 1.15, 1],
    borderColor: ['#0f3460', '#e94560', '#0f3460'],
    duration: 300,
    easing: 'easeOutExpo'
  });

  // 2. 左右被推開
  anime({ targets: left, translateX: [-3, 0], duration: 200, easing: 'easeOutBack' });
  anime({ targets: right, translateX: [3, 0], duration: 200, easing: 'easeOutBack' });

  // 3. 裂痕 class（CSS handles the visual）
  setTimeout(() => {
    crackAudio.currentTime = 0;
    crackAudio.play().catch(() => {});
    mid.classList.add('cracked');
    // 微弱餘震
    anime({
      targets: mid,
      translateX: [{ value: -1, duration: 30 }, { value: 1, duration: 30 }, { value: 0, duration: 30 }]
    });
    setTimeout(() => mid.classList.remove('cracked'), 400);
  }, 80);
}
