// gameFeel.js — 特效爽感主模組
import anime from 'https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.es.js';

let pixiCache = null;

async function getPixi() {
  if (pixiCache) return pixiCache;
  const PIXI = await import('https://cdn.jsdelivr.net/npm/pixi.js@7.3.2/dist/pixi.min.mjs');
  const app = new PIXI.Application({ backgroundAlpha: 0, resizeTo: window });
  app.view.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:900';
  document.body.appendChild(app.view);
  pixiCache = { app, PIXI };
  return pixiCache;
}

export { anime, getPixi };
