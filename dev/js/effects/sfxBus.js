// sfxBus.js — Sound effect bus with layered playback
const cache = {};

function getAudio(name) {
  if (!cache[name]) {
    cache[name] = (window.SFX_CACHE && window.SFX_CACHE[name]) || new Audio(`assets/sfx/${name}.mp3`);
  }
  return cache[name];
}

export function playSfx(name, { volume = 1, rate = 1, loop = false } = {}) {
  const a = getAudio(name);
  a.volume = volume;
  a.playbackRate = rate;
  a.loop = loop;
  a.currentTime = 0;
  a.play().catch(() => {});
  return a;
}

export function stopSfx(name) {
  const a = cache[name];
  if (a) { a.pause(); a.loop = false; }
}

export function playLayered(layers) {
  return layers.map(({ name, delay = 0, volume = 1, rate = 1, loop = false }) => {
    if (delay === 0) return playSfx(name, { volume, rate, loop });
    let a;
    setTimeout(() => { a = playSfx(name, { volume, rate, loop }); }, delay);
    return { get audio() { return a; } };
  });
}
