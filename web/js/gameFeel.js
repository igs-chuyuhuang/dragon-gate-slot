// gameFeel.js — 特效爽感主模組
import anime from 'https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.es.js';

let pixiApp = null;

async function getPixi() {
  if (pixiApp) return pixiApp;
  const PIXI = await import('https://cdn.jsdelivr.net/npm/pixi.js@7.3.2/dist/pixi.min.mjs');
  pixiApp = new PIXI.Application({ backgroundAlpha: 0, resizeTo: window });
  pixiApp.view.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:900';
  document.body.appendChild(pixiApp.view);
  return { app: pixiApp, PIXI };
}

export { anime, getPixi };
