// spinButton.js — Spin 蓄力/釋放特效
import { anime } from '../gameFeel.js';

let chargeAnim = null;

export function initSpinButton(btnEl) {
  btnEl.addEventListener('pointerdown', () => {
    if (btnEl.disabled) return;
    chargeAnim = anime.timeline({ loop: true })
      .add({
        targets: btnEl,
        translateX: [{ value: -2, duration: 40 }, { value: 2, duration: 40 }, { value: 0, duration: 40 }],
        easing: 'easeInOutSine'
      })
      .add({
        targets: btnEl,
        boxShadow: ['0 0 0px #ffd700', '0 0 20px 8px #ffd700'],
        duration: 600,
        easing: 'easeInQuad',
        direction: 'alternate'
      }, 0);

    anime({ targets: btnEl, scale: 0.92, duration: 100, easing: 'easeOutCubic' });
  });

  const release = () => {
    if (chargeAnim) { chargeAnim.pause(); chargeAnim = null; }
    anime.remove(btnEl);
    anime({
      targets: btnEl,
      scale: [1.05, 1.0],
      translateX: 0,
      boxShadow: ['0 0 30px 12px #ffd700', '0 0 0px transparent'],
      duration: 250,
      easing: 'easeOutElastic(1, 0.5)'
    });
  };

  btnEl.addEventListener('pointerup', release);
  btnEl.addEventListener('pointerleave', release);
}
