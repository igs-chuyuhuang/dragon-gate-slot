// particlePool.js — Texture-based particle system with object pool + additive blending
import { anime, getPixi } from '../gameFeel.js';

let textures = null;
let pool = [];
const MAX_ACTIVE = 200;
let active = 0;
let degraded = false;

// FPS monitor — degrade if < 30fps
let lastFrame = 0, frameCount = 0, fps = 60;
function monitorFps() {
  frameCount++;
  const now = performance.now();
  if (now - lastFrame > 1000) { fps = frameCount; frameCount = 0; lastFrame = now; degraded = fps < 30; }
  requestAnimationFrame(monitorFps);
}
monitorFps();

function getTextures(PIXI) {
  if (textures) return textures;
  textures = {
    spark: createTex(16, ctx => { const g = ctx.createRadialGradient(8,8,0,8,8,8); g.addColorStop(0,'rgba(255,255,200,1)'); g.addColorStop(0.5,'rgba(255,200,0,0.6)'); g.addColorStop(1,'rgba(255,100,0,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,16,16); }, PIXI),
    glow: createTex(32, ctx => { const g = ctx.createRadialGradient(16,16,0,16,16,16); g.addColorStop(0,'rgba(255,215,0,0.9)'); g.addColorStop(0.4,'rgba(255,150,0,0.4)'); g.addColorStop(1,'rgba(255,100,0,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,32,32); }, PIXI),
    streak: createTex(4, ctx => { const g = ctx.createLinearGradient(0,0,0,24); g.addColorStop(0,'rgba(255,255,200,0)'); g.addColorStop(0.5,'rgba(255,215,0,1)'); g.addColorStop(1,'rgba(255,255,200,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,4,24); }, PIXI, 4, 24),
    coin: createTex(12, ctx => { ctx.beginPath(); ctx.arc(6,6,5,0,Math.PI*2); ctx.fillStyle='#ffd700'; ctx.fill(); ctx.strokeStyle='#b8860b'; ctx.lineWidth=1; ctx.stroke(); }, PIXI, 12, 12),
    debris: createTex(8, ctx => { ctx.fillStyle='#ffd700'; ctx.beginPath(); ctx.moveTo(1,7); ctx.lineTo(4,0); ctx.lineTo(7,6); ctx.lineTo(3,8); ctx.fill(); }, PIXI, 8, 8),
    smoke: createTex(24, ctx => { const g = ctx.createRadialGradient(12,12,0,12,12,12); g.addColorStop(0,'rgba(200,200,200,0.3)'); g.addColorStop(1,'rgba(100,100,100,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,24,24); }, PIXI),
    ring: createTex(32, ctx => { ctx.beginPath(); ctx.arc(16,16,13,0,Math.PI*2); ctx.strokeStyle='rgba(255,215,0,0.8)'; ctx.lineWidth=3; ctx.stroke(); }, PIXI),
    redSpark: createTex(16, ctx => { const g = ctx.createRadialGradient(8,8,0,8,8,8); g.addColorStop(0,'rgba(255,100,100,1)'); g.addColorStop(0.5,'rgba(233,69,96,0.6)'); g.addColorStop(1,'rgba(200,0,0,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,16,16); }, PIXI),
    star: createTex(16, ctx => { ctx.fillStyle='#ffd700'; ctx.beginPath(); for(let i=0;i<5;i++){const a=Math.PI*2*i/5-Math.PI/2;ctx.lineTo(8+Math.cos(a)*7,8+Math.sin(a)*7);const b=a+Math.PI/5;ctx.lineTo(8+Math.cos(b)*3,8+Math.sin(b)*3);} ctx.closePath(); ctx.fill(); }, PIXI),
    diamond: createTex(12, ctx => { ctx.fillStyle='#ffd700'; ctx.beginPath(); ctx.moveTo(6,0); ctx.lineTo(12,6); ctx.lineTo(6,12); ctx.lineTo(0,6); ctx.closePath(); ctx.fill(); }, PIXI, 12, 12),
    triangle: createTex(10, ctx => { ctx.fillStyle='#ff8c00'; ctx.beginPath(); ctx.moveTo(5,0); ctx.lineTo(10,9); ctx.lineTo(0,9); ctx.closePath(); ctx.fill(); }, PIXI, 10, 10),
  };
  return textures;
}

function createTex(w, draw, PIXI, cw, ch) {
  const c = document.createElement('canvas');
  c.width = cw || w; c.height = ch || w;
  draw(c.getContext('2d'));
  return PIXI.Texture.from(c);
}

// Get a sprite from pool or create new
function getSprite(app, PIXI, texName) {
  if (active >= MAX_ACTIVE) return null;
  const tex = getTextures(PIXI)[texName];
  if (!tex) return null;

  let sprite;
  if (pool.length > 0) {
    sprite = pool.pop();
    sprite.texture = tex;
    sprite.alpha = 1;
    sprite.scale.set(1);
    sprite.rotation = 0;
    sprite.visible = true;
  } else {
    sprite = new PIXI.Sprite(tex);
    sprite.anchor.set(0.5);
  }
  sprite.blendMode = PIXI.BLEND_MODES.ADD;
  app.stage.addChild(sprite);
  active++;
  return sprite;
}

function releaseSprite(app, sprite) {
  sprite.visible = false;
  app.stage.removeChild(sprite);
  pool.push(sprite);
  active--;
}

// === Public API ===

export async function burst(cx, cy, config) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;

  const count = degraded ? Math.floor(config.count * 0.4) : config.count;
  const tex = config.texture || 'spark';
  const spread = config.spread || 100;
  const dur = config.duration || 400;
  const sizeMin = config.sizeMin || 0.3;
  const sizeMax = config.sizeMax || 1;

  for (let i = 0; i < count; i++) {
    const s = getSprite(app, PIXI, tex);
    if (!s) break;
    s.position.set(cx, cy);
    const scale = sizeMin + Math.random() * (sizeMax - sizeMin);
    s.scale.set(scale);
    s.rotation = Math.random() * Math.PI * 2;
    if (config.tint) s.tint = Array.isArray(config.tint) ? config.tint[i % config.tint.length] : config.tint;

    const angle = Math.random() * Math.PI * 2;
    const dist = spread * 0.4 + Math.random() * spread * 0.6;
    const d = dur + Math.random() * dur * 0.5;
    anime({ targets: s.position, x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist + (config.gravity || 0), duration: d, easing: 'easeOutQuad' });
    anime({ targets: s, alpha: 0, duration: d * 1.1, easing: 'easeInQuad', complete: () => releaseSprite(app, s) });
  }
}

export async function rain(config) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;

  const count = degraded ? Math.floor(config.count * 0.4) : config.count;
  const tex = config.texture || 'coin';
  const dur = config.duration || 1500;
  const w = window.innerWidth, h = window.innerHeight;

  for (let i = 0; i < count; i++) {
    const s = getSprite(app, PIXI, tex);
    if (!s) break;
    s.position.set(Math.random() * w, -15);
    s.scale.set(0.5 + Math.random() * 0.8);
    if (config.tint) s.tint = Array.isArray(config.tint) ? config.tint[i % config.tint.length] : config.tint;

    const del = Math.random() * (config.stagger || 800);
    anime({ targets: s.position, y: h + 20, x: s.position.x + (Math.random() - 0.5) * 60, duration: dur + Math.random() * 600, delay: del, easing: 'easeInQuad' });
    anime({ targets: s, rotation: s.rotation + Math.random() * 4, alpha: 0, duration: dur + 400, delay: del, easing: 'easeInQuad', complete: () => releaseSprite(app, s) });
  }
}

export async function shockwave(cx, cy, config = {}) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;

  const s = getSprite(app, PIXI, 'ring');
  if (!s) return;
  s.position.set(cx, cy);
  s.scale.set(0.5);
  if (config.tint) s.tint = config.tint;
  anime({ targets: s.scale, x: [0.5, config.scale || 6], y: [0.5, config.scale || 6], duration: config.duration || 400, easing: 'easeOutQuad' });
  anime({ targets: s, alpha: [1, 0], duration: (config.duration || 400) * 1.1, easing: 'easeOutQuad', complete: () => releaseSprite(app, s) });
}

export async function glowAt(cx, cy, config = {}) {
  let pixi;
  try { pixi = await getPixi(); } catch { return; }
  if (!pixi || !pixi.PIXI) return;
  const { app, PIXI } = pixi;

  const s = getSprite(app, PIXI, 'glow');
  if (!s) return;
  s.position.set(cx, cy);
  s.scale.set(config.startScale || 1);
  if (config.tint) s.tint = config.tint;
  anime({ targets: s.scale, x: [s.scale.x, config.endScale || 3], y: [s.scale.y, config.endScale || 3], duration: config.duration || 300, easing: 'easeOutQuad' });
  anime({ targets: s, alpha: [config.alpha || 0.8, 0], duration: (config.duration || 300) * 1.2, easing: 'easeOutQuad', complete: () => releaseSprite(app, s) });
}

export function getActiveCount() { return active; }
export function isDegraded() { return degraded; }
