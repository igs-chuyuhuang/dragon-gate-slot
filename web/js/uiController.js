import { cellToString } from './slotEngine.js';
import { GameManager } from './gameManager.js';
import { initSpinButton } from './effects/spinButton.js';
import { registerThrough, resetCombo } from './effects/comboSystem.js';
import { playWallHit } from './effects/wallHit.js';
import { playGateThrough } from './effects/gateThrough.js';
import { anime } from './gameFeel.js';
import { onSpinStart, onColumnStop, onSpinEnd } from './effects/reelStop.js';
import { revealScatters, initScatterDebug } from './effects/scatterReveal.js';
import { playFreeGameTransition } from './effects/freeGameTransition.js';
import { playBigWin } from './effects/bigWin.js';
import { playJpReveal } from './effects/jpReveal.js';
import { showFgMeter, updateFgMeter, hideFgMeter, initFgMeterDebug } from './effects/fgMeter.js';

const gm = new GameManager();
const $ = id => document.getElementById(id);
let spinning = false;
let autoSpins = 0;
let autoStopped = false;
let autoCount = 10;

// Card value → image file mapping
const CARD_IMG = {
  1: 'CD-01_ace.png', 2: 'CD-05_num2.png', 3: 'CD-06_num3.png',
  4: 'CD-07_num4.png', 5: 'CD-08_num5.png', 6: 'CD-09_num6.png',
  7: 'CD-10_num7.png', 8: 'CD-11_num8.png', 9: 'CD-12_num9.png',
  10: 'CD-13_num10.png', 11: 'CD-04_jack.png', 12: 'CD-03_queen.png', 13: 'CD-02_king.png'
};
const SC_IMG = 'SC-01_scatter_dragon.png';
const ALL_IMGS = Object.values(CARD_IMG);

// Audio
const scatterAudio = new Audio('assets/sfx/dragon_roar.mp3');
scatterAudio.volume = 0.6;

const CARD_LABELS = { 1:'A', 2:'2', 3:'3', 4:'4', 5:'5', 6:'6', 7:'7', 8:'8', 9:'9', 10:'10', 11:'J', 12:'Q', 13:'K' };

function cellToImg(cell) {
  const src = cell.isScatter ? SC_IMG : CARD_IMG[cell.value];
  return `<img src="assets/img/${src}" alt="${cellToString(cell)}">`;
}

function randomCellHtml() {
  const val = Math.floor(Math.random() * 13) + 1;
  return `<img src="assets/img/${ALL_IMGS[val - 1]}">`;
}

function fmt(n) { return Math.round(n).toLocaleString(); }

function updateUI() {
  $('balance').textContent = fmt(gm.balance);
  $('bet').textContent = fmt(gm.bet);
  $('spin-btn').disabled = spinning || !gm.canSpin();
  const label = $('spin-btn').querySelector('.spin-label');
  if (label) label.textContent = gm.fg.active ? `FG (${gm.fg.spinsLeft})` : 'SPIN';
  $('jp-basic').textContent = fmt(gm.jp.pools.basic);
  $('jp-major').textContent = fmt(gm.jp.pools.major);
  $('jp-grand').textContent = fmt(gm.jp.pools.grand);
  const fgEl = $('fg-info');
  if (gm.fg.active) {
    fgEl.style.display = 'block';
    fgEl.textContent = `🎰 Free Game: 剩餘 ${gm.fg.spinsLeft} 轉 | 累積 ${fmt(gm.fg.totalScore)} 分 | 延伸 ${gm.fg.extensions}/2`;
  } else { fgEl.style.display = 'none'; }
  document.body.classList.toggle('fg-mode', gm.fg.active);
  const autoEl = $('auto-btn');
  autoEl.textContent = autoSpins > 0 ? `Stop` : 'Auto';
  autoEl.classList.toggle('running', autoSpins > 0);
}

// === Real Reel Scrolling Animation ===
const CELL_H = 110;
const GAP = 3;
const CELL_TOTAL = CELL_H + GAP; // 113px per cell
const REEL_SYMBOLS = 40; // lots of symbols for continuous reel feel

function buildReelStrip(col, finalCells) {
  const strip = document.querySelector(`#reel-${col} .reel-strip`);
  strip.innerHTML = '';
  // Random symbols on top (visible during spin at translateY=0)
  for (let i = 0; i < REEL_SYMBOLS; i++) {
    const div = document.createElement('div');
    div.className = 'cell';
    div.innerHTML = randomCellHtml();
    strip.appendChild(div);
  }
  // Final 3 symbols at bottom (visible when translateY = -SCROLL_DIST)
  for (let r = 0; r < 3; r++) {
    const cell = finalCells[r];
    const div = document.createElement('div');
    div.className = 'cell';
    div.id = `cell-${r}-${col}`;
    div.innerHTML = cellToImg(cell);
    strip.appendChild(div);
  }
  return strip;
}

function highlightRow(row, type) {
  const cls = type === 'win' ? 'win-highlight' : 'wall-highlight';
  const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
  cells.forEach(c => { if (c) c.classList.add(cls); });
  setTimeout(() => cells.forEach(c => { if (c) c.classList.remove(cls); }), 1500);
}

// With top:0: at translateY=0, first cells (randoms) visible.
// Animate to translateY=-SCROLL_DIST to show final 3 at bottom.
const SCROLL_DIST = REEL_SYMBOLS * CELL_TOTAL; // ~4520px
const stopAudio = new Audio('assets/sfx/spin_release.mp3');
stopAudio.volume = 0.5;

function animateSpin(board) {
  return new Promise(resolve => {
    spinning = true;
    onSpinStart();

    for (let col = 0; col < 3; col++) {
      const finalCells = [board[0][col], board[1][col], board[2][col]];
      const strip = buildReelStrip(col, finalCells);
      strip.style.transform = `translateY(0px)`;
    }

    document.querySelector('#reel-0 .reel-strip').offsetHeight;

    // All 3 start together. Left+Right stop together, Middle stops last.
    const colConfigs = [
      { stopDelay: 0,   lastSymbols: 4, isMiddle: false },
      { stopDelay: 700, lastSymbols: 5, isMiddle: true },
      { stopDelay: 0,   lastSymbols: 4, isMiddle: false },
    ];
    let completed = 0;
    let sidesStoppedCount = 0;
    const targetY = -SCROLL_DIST;
    const overshootDist = Math.round(CELL_TOTAL * 0.18);

    for (let col = 0; col < 3; col++) {
      const strip = document.querySelector(`#reel-${col} .reel-strip`);
      const reel = strip.parentElement;
      const cfg = colConfigs[col];

      // Motion blur on strip only (not reel border)
      strip.style.filter = 'blur(3px)';

      const slowdownDist = cfg.lastSymbols * CELL_TOTAL;
      const bufferDist = 6 * CELL_TOTAL; // ~6 symbols of deceleration buffer
      const fastDist = Math.abs(targetY) - bufferDist - slowdownDist;
      const fastDur = 600 + cfg.stopDelay;
      const bufferDur = cfg.isMiddle ? 550 : 450; // gradual decel buffer

      // Phase 1: High-speed scroll (blur stays at 3px)
      anime({
        targets: strip,
        translateY: -fastDist,
        duration: fastDur,
        easing: 'linear',
        complete: () => {
          // Phase 2: Deceleration buffer — speed drops smoothly, blur fades with it
          anime({
            targets: strip,
            translateY: -(fastDist + bufferDist),
            duration: bufferDur,
            easing: 'easeOutCubic',
            update: (anim) => {
              // Blur syncs with deceleration: 3px → 0px
              strip.style.filter = `blur(${3 * (1 - anim.progress / 100)}px)`;
            },
            complete: () => {
              strip.style.filter = 'none';

              // Middle reel focus: when sides have stopped, highlight middle
              if (cfg.isMiddle) activateMiddleFocus(col);

              // Phase 3: Tick deceleration slide (last N symbols)
              const totalSlowMs = cfg.isMiddle ? 1100 : 1000;
              slideDecelerate(strip, -(fastDist + bufferDist), cfg.lastSymbols, totalSlowMs, cfg.isMiddle, () => {

                // Phase 4: Overshoot — same direction as scroll
                anime({
                  targets: strip,
                  translateY: targetY - overshootDist,
                  duration: 80,
                  easing: 'easeOutQuad',
                  complete: () => {

                    // Phase 5: Snap back
                    anime({
                      targets: strip,
                      translateY: targetY,
                      duration: 90,
                      easing: 'easeOutCubic',
                      complete: () => {
                        reelImpact(reel, col);

                        if (cfg.isMiddle) deactivateMiddleFocus();

                        onReelStopped(strip, col, board, () => {
                      if (!cfg.isMiddle) sidesStoppedCount++;
                      completed++;
                      if (completed === 3) {
                        setTimeout(() => { spinning = false; onSpinEnd(); resolve(); }, 80);
                      }
                    });
                  }
                });
              }
            });
          });
        }
      });
    }
  });
}

// Continuous deceleration: last symbol of middle reel gets extra duration
function slideDecelerate(strip, startY, symbolCount, totalMs, isMiddle, onDone) {
  const ratios = [];
  for (let i = 0; i < symbolCount; i++) ratios.push(Math.pow(1.6, i));
  // Middle reel: boost last symbol ratio for extra suspense (600-700ms feel)
  if (isMiddle) ratios[ratios.length - 1] *= 7;
  const ratioSum = ratios.reduce((a, b) => a + b, 0);
  const durations = ratios.map(r => Math.round((r / ratioSum) * totalMs));

  let i = 0;
  const step = () => {
    if (i >= symbolCount) { onDone(); return; }
    anime({
      targets: strip,
      translateY: startY - (i + 1) * CELL_TOTAL,
      duration: durations[i],
      easing: 'easeOutSine',
      complete: () => { i++; step(); }
    });
  };
  step();
}

// Middle reel focus: glow border + dim sides
function activateMiddleFocus(middleCol) {
  for (let c = 0; c < 3; c++) {
    const reel = document.querySelector(`#reel-${c}`);
    if (c === middleCol) {
      reel.style.boxShadow = '0 0 12px 3px rgba(255,215,0,0.6)';
      reel.style.borderColor = '#ffd700';
      reel.style.transition = 'box-shadow 0.2s, border-color 0.2s';
    } else {
      reel.style.filter = 'brightness(0.6)';
      reel.style.transition = 'filter 0.2s';
    }
  }
}

function deactivateMiddleFocus() {
  for (let c = 0; c < 3; c++) {
    const reel = document.querySelector(`#reel-${c}`);
    reel.style.boxShadow = '';
    reel.style.borderColor = '';
    reel.style.filter = '';
  }
}

// Stop impact: short shake + border flash
function reelImpact(reel, col) {
  // Board micro-shake (2-3px, 60ms)
  const board = document.querySelector('.board');
  board.style.transform = 'translateY(2px)';
  setTimeout(() => { board.style.transform = 'translateY(-1px)'; }, 30);
  setTimeout(() => { board.style.transform = ''; }, 60);

  // Border flash (gold glow 100ms)
  reel.style.boxShadow = '0 0 14px 4px rgba(255,215,0,0.8)';
  setTimeout(() => { reel.style.boxShadow = ''; }, 100);

  // Thud audio
  const thud = stopAudio.cloneNode();
  thud.volume = 0.6;
  thud.play().catch(() => {});
}

function onReelStopped(strip, col, board, done) {
  const cells = strip.querySelectorAll('.cell');
  const finalCells = Array.from(cells).slice(-3);
  finalCells.forEach(c => {
    if (board.some((row, r) => row[col].isScatter && c.id === `cell-${r}-${col}`)) {
      c.classList.add('scatter', 'sc-flash');
    }
    c.classList.add('stop-bounce');
  });

  onColumnStop(col);

  for (let r = 0; r < 3; r++) {
    if (board[r][col].isScatter) {
      scatterAudio.currentTime = 0;
      scatterAudio.play().catch(() => {});
      break;
    }
  }

  done();
}

async function doSpin() {
  if (spinning || !gm.canSpin()) return;
  updateUI();
  const result = gm.executeSpin();
  if (!result) return;
  await animateSpin(result.board);
  await showResult(result);
  updateUI();
  return result;
}

async function showResult(result) {
  const winEl = $('win');
  const resEl = $('results');

  if (result.mode === 'fg') {
    // Update FG meter with current score
    updateFgMeter(result.totalScore);

    let html = `<div class="row-result r-sc">FG 本轉得分: +${fmt(result.spinScore)}</div>`;
    html += `<div class="row-result">累積總分: ${fmt(result.totalScore)}</div>`;
    html += `<div class="row-result">剩餘: ${result.spinsLeft} 轉</div>`;
    if (result.extended) html += `<div class="row-result r-sc">🐉 延伸 +8 轉！</div>`;
    if (result.fgDone) {
      html += `<div class="r-summary">═══ Free Game 結束 ═══</div>`;
      html += `<div class="row-result">最終累積: ${fmt(result.totalScore)} 分</div>`;
      if (result.jpResult) {
        html += `<div class="row-result">${result.jpResult.msg}</div>`;
        if (result.jpResult.payout > 0) html += `<div class="row-result r-pass">🏆 獎金: +${fmt(result.jpResult.payout)}</div>`;
      }
    }
    resEl.innerHTML = html;
    winEl.textContent = result.fgDone && result.jpResult ? `+${fmt(result.jpResult.payout)}` : '-';
    winEl.className = result.jpResult && result.jpResult.payout > 0 ? 'win-positive' : '';

    // JP Reveal ceremony on FG end
    if (result.fgDone && result.jpResult) {
      hideFgMeter();
      await playJpReveal(result.totalScore, result.jpResult);
    }
  } else {
    // F. Scatter reveal (if any scatters)
    if (result.scatterCount > 0) {
      await revealScatters(result.board, result.scatterCount);
    }

    // C/D/E. 特效觸發
    let hasThrough = false;
    result.judgments.forEach(j => {
      if (j.type === 'through') { registerThrough(j.row, j.mult); hasThrough = true; highlightRow(j.row, 'win'); }
      else if (j.type === 'wall') { playWallHit(j.row); highlightRow(j.row, 'wall'); }
    });
    if (!hasThrough) resetCombo();

    let html = '';
    result.judgments.forEach(j => {
      let cls, text;
      switch (j.type) {
        case 'through':
          cls = 'r-pass'; text = `✓ 穿門 ×${j.mult} (+${fmt(Math.round(gm.bet / 3 * j.mult))})`;
          break;
        case 'wall':
          cls = 'r-wall'; text = `⚡ 碰壁 ×1.2 (+${fmt(Math.round(gm.bet / 3 * 1.2))})`;
          break;
        case 'same-hit':
          cls = 'r-same'; text = `💀 同值命中 賠4 (-${fmt(gm.bet * 3)})`;
          break;
        case 'same-miss':
          cls = 'r-miss'; text = `✗ 同值未中`;
          break;
        default:
          cls = 'r-miss'; text = `✗ 未穿`;
      }
      const rowCells = [result.board[j.row][0], result.board[j.row][1], result.board[j.row][2]];
      const hasSC = rowCells.some(c => c.isScatter);
      if (hasSC) { cls = 'r-sc'; text = `🐉 龍符號（不判定）`; }
      html += `<div class="row-result ${cls}">列${j.row + 1}: ${text}</div>`;
    });

    const pClass = result.totalPayout >= 0 ? 'r-pass' : 'r-wall';
    html += `<div class="r-summary ${pClass}">結算: ${result.totalPayout >= 0 ? '+' : ''}${fmt(result.totalPayout)}</div>`;
    if (result.scatterCount > 0) html += `<div class="row-result r-sc">🐉 SC × ${result.scatterCount}</div>`;
    if (result.fgTriggered) html += `<div class="row-result r-sc">🎰 Free Game 觸發！</div>`;
    resEl.innerHTML = html;

    winEl.textContent = `${result.totalPayout >= 0 ? '+' : ''}${fmt(result.totalPayout)}`;
    winEl.classList.remove('win-positive', 'win-negative', 'win-countup');
    void winEl.offsetWidth;
    if (result.totalPayout > 0) winEl.classList.add('win-positive', 'win-countup');
    else if (result.totalPayout < 0) winEl.classList.add('win-negative');

    // H. Big Win check (normal mode)
    if (result.totalPayout > gm.bet * 10) {
      await playBigWin(result.totalPayout, gm.bet);
    }

    // G. Free Game transition
    if (result.fgTriggered) {
      const scCells = [];
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++)
          if (result.board[r][c].isScatter) scCells.push({ r, c });
      await playFreeGameTransition(scCells);
      showFgMeter();
    }
  }
}

async function autoSpin() {
  if (autoSpins > 0) { autoStopped = true; autoSpins = 0; updateUI(); return; }
  autoSpins = autoCount;
  autoStopped = false;
  while (autoSpins > 0 && !autoStopped && gm.canSpin()) {
    const result = await doSpin();
    autoSpins--;
    updateUI();
    if (result && result.fgTriggered) {
      while (gm.fg.active && !autoStopped) { await doSpin(); updateUI(); }
    }
    if (autoSpins > 0 && !autoStopped) await delay(300);
  }
  autoSpins = 0;
  updateUI();
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

export function init() {
  $('spin-btn').addEventListener('click', doSpin);
  initSpinButton($('spin-btn')); // A. Spin charge
  $('auto-btn').addEventListener('click', autoSpin);
  // Bet presets
  document.querySelectorAll('.bet-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (spinning) return;
      const val = parseInt(btn.dataset.bet);
      const idx = [5, 10, 20, 50, 100].indexOf(val);
      if (idx >= 0) { gm.setBetIndex(idx); updateUI(); }
      document.querySelectorAll('.bet-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.querySelectorAll('.auto-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      autoCount = parseInt(btn.dataset.count);
      document.querySelectorAll('.auto-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Hotkeys
  document.addEventListener('keydown', e => {
    console.log('[KEY]', e.key, e.code);
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.code === 'Space' && !e.repeat) { e.preventDefault(); doSpin(); }
    if ((e.key === 'f' || e.key === 'F') && !gm.fg.active && !spinning) {
      gm.triggerFreeGame();
      showFgMeter();
      $('results').innerHTML = '<div class="row-result r-sc">🐉 Free Game 觸發！（測試）</div>';
      updateUI();
    }
    // Debug hotkeys
    if (e.key === 't' || e.key === 'T') {
      console.log('[DEBUG] 穿門特效 row=1 mult=4');
      try { playGateThrough(1, 4); } catch (err) { console.error('[DEBUG T]', err); }
    }
    if (e.key === 'w' || e.key === 'W') {
      console.log('[DEBUG] 碰壁特效 row=1');
      try { playWallHit(1); } catch (err) { console.error('[DEBUG W]', err); }
    }
    if (e.key === 'c' || e.key === 'C') {
      console.log('[DEBUG] Combo 5連擊');
      try { resetCombo(); for (let i = 0; i < 5; i++) setTimeout(() => { try { registerThrough(1, 2 + i); } catch (err) { console.error('[DEBUG C]', err); } }, i * 300); } catch (err) { console.error('[DEBUG C]', err); }
    }
    if (e.key === 'b' || e.key === 'B') {
      console.log('[DEBUG] Big Win DRAGON級');
      try { playBigWin(gm.bet * 80, gm.bet); } catch (err) { console.error('[DEBUG B]', err); }
    }
    if (e.key === 'j' || e.key === 'J') {
      console.log('[DEBUG] JP Win');
      try { playBigWin(gm.bet * 100, gm.bet); } catch (err) { console.error('[DEBUG J]', err); }
    }
  });

  // F. Scatter debug hotkey
  initScatterDebug();
  initFgMeterDebug(gm);

  // Initialize reel strips with visible symbols
  for (let col = 0; col < 3; col++) {
    const strip = document.querySelector(`#reel-${col} .reel-strip`);
    strip.style.transform = 'translateY(0px)';
    for (let r = 0; r < 3; r++) {
      const cell = $(`cell-${r}-${col}`);
      cell.innerHTML = randomCellHtml();
    }
  }

  updateUI();
  console.log('[INIT] uiController loaded. Debug keys: T W C B J F S');
  console.log('[INIT] Functions:', { playGateThrough, playWallHit, registerThrough, playBigWin });
}
