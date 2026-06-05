import { cellToString } from './slotEngine.js';
import { GameManager } from './gameManager.js';
// import { initSpinButton } from './effects/spinButton.js'; // disabled: charge effect breaks mobile tap
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
import { playWinLines } from './effects/winLine.js';

const gm = new GameManager();
const $ = id => document.getElementById(id);
let spinning = false;
let autoSpins = 0;
let autoStopped = false;
let autoCount = 50;

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
  $('bet-dec').disabled = spinning || gm.betIndex <= 0;
  $('bet-inc').disabled = spinning || gm.betIndex >= 4;
  $('spin-btn').disabled = spinning || !gm.canSpin();
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
  autoEl.textContent = autoSpins > 0 ? `Auto ${autoSpins}` : 'Auto';
  autoEl.classList.toggle('running', autoSpins > 0);
}

// === Real Reel Scrolling Animation ===
const CELL_H = 240;
const GAP = 0;
let CELL_TOTAL = CELL_H + GAP; // default, recalculated on init

function recalcCellTotal() {
  const reel = document.querySelector('.reel');
  if (reel) {
    const reelH = reel.offsetHeight;
    const cellH = Math.floor(reelH / 3);
    CELL_TOTAL = cellH; // no gap, cells fill reel exactly
    // Set all cell heights
    document.querySelectorAll('.cell').forEach(c => { c.style.height = cellH + 'px'; });
  }
}
const REEL_SYMBOLS = 40; // lots of symbols for continuous reel feel

function buildReelStrip(col, finalCells, numSymbols) {
  const count = numSymbols || REEL_SYMBOLS;
  const strip = document.querySelector(`#reel-${col} .reel-strip`);
  strip.innerHTML = '';
  const cellH = CELL_TOTAL + 'px';
  for (let i = 0; i < count; i++) {
    const div = document.createElement('div');
    div.className = 'cell';
    div.style.height = cellH;
    div.innerHTML = randomCellHtml();
    strip.appendChild(div);
  }
  for (let r = 0; r < 3; r++) {
    const cell = finalCells[r];
    const div = document.createElement('div');
    div.className = 'cell';
    div.style.height = cellH;
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
// SCROLL_DIST computed dynamically from CELL_TOTAL
const stopAudio = new Audio('assets/sfx/spin_release.mp3');
stopAudio.volume = 0.5;

function animateSpin(board) {
  return new Promise(resolve => {
    spinning = true;
    onSpinStart();
    recalcCellTotal();
    const SCROLL_DIST = REEL_SYMBOLS * CELL_TOTAL;

    // Middle reel gets longer strip so it spins longer at same speed
    const MID_SYMBOLS = 80;

    for (let col = 0; col < 3; col++) {
      const finalCells = [board[0][col], board[1][col], board[2][col]];
      const numSym = col === 1 ? MID_SYMBOLS : REEL_SYMBOLS;
      const strip = buildReelStrip(col, finalCells, numSym);
      strip.style.transform = `translateY(0px)`;
    }

    document.querySelector('#reel-0 .reel-strip').offsetHeight;

    let completed = 0;
    const overshootDist = Math.round(CELL_TOTAL * 0.05);

    // Config per reel
    const configs = [
      { lastSymbols: 4, bridgeDist: 5, bridgeDur: 450, bridgeEase: 'easeOutCubic', tickMs: 900, isMiddle: false },
      { lastSymbols: 6, bridgeDist: 12, bridgeDur: 800, bridgeEase: 'easeOutQuart', tickMs: 1600, isMiddle: true },
      { lastSymbols: 4, bridgeDist: 5, bridgeDur: 450, bridgeEase: 'easeOutCubic', tickMs: 900, isMiddle: false },
    ];

    // Unified high speed from side reels
    const sideScrollDist = REEL_SYMBOLS * CELL_TOTAL;
    const sideDecelDist = (configs[0].bridgeDist + configs[0].lastSymbols) * CELL_TOTAL;
    const sideFastDist = sideScrollDist - sideDecelDist;
    const SIDE_FAST_DUR = 700;
    const HIGH_SPEED = sideFastDist / SIDE_FAST_DUR; // px/ms

    for (let col = 0; col < 3; col++) {
      const strip = document.querySelector(`#reel-${col} .reel-strip`);
      const reel = strip.parentElement;
      const cfg = configs[col];
      const scrollDist = (col === 1 ? MID_SYMBOLS : REEL_SYMBOLS) * CELL_TOTAL;
      const targetY = -scrollDist;

      strip.style.filter = 'blur(3px)';

      const decelDist = (cfg.bridgeDist + cfg.lastSymbols) * CELL_TOTAL;
      const encoreSymbols = cfg.isMiddle ? 12 : 0; // middle reel reserves symbols for encore
      const encoreDist = encoreSymbols * CELL_TOTAL;
      const fastDist = scrollDist - decelDist - encoreDist;
      const fastDur = Math.round(fastDist / HIGH_SPEED); // same px/s, middle runs longer

      anime({
        targets: strip,
        translateY: -fastDist,
        duration: fastDur,
        easing: 'linear',
        complete: () => {
          if (cfg.isMiddle) {
            activateMiddleFocus(col);
            middleReelSequence(strip, reel, col, fastDist, cfg, targetY, overshootDist, board, onDone);
          } else {
            sideReelStop(strip, reel, col, fastDist, cfg, targetY, overshootDist, board, onDone);
          }
        }
      });
    }

    function onDone(col, cfg) {
      completed++;
      if (completed === 3) {
        setTimeout(() => { spinning = false; onSpinEnd(); resolve(); }, 80);
      }
    }
  });
}

// Side reels: single continuous deceleration ending at overshoot position
function sideReelStop(strip, reel, col, fastDist, cfg, targetY, overshootDist, board, onDone) {
  const decelDist = (cfg.bridgeDist + cfg.lastSymbols) * CELL_TOTAL + overshootDist;
  const decelEnd = targetY - overshootDist; // slide past target
  const decelMs = cfg.bridgeDur + cfg.tickMs;

  anime({
    targets: strip,
    translateY: decelEnd,
    duration: decelMs,
    easing: 'easeOutCubic',
    update: (anim) => {
      const p = anim.progress / 100;
      if (p < 0.4) {
        strip.style.filter = `blur(${3 * (1 - p / 0.4)}px)`;
      } else {
        strip.style.filter = 'none';
      }
    },
    complete: () => {
      strip.style.filter = 'none';
      reelBounce(strip, reel, col, targetY, board, cfg, onDone);
    }
  });
}

// Middle reel: encore spin (linear, same speed) → easeOutQuart decel
// Encore gives "still spinning fast" feel after sides stop
function middleReelSequence(strip, reel, col, fastDist, cfg, targetY, overshootDist, board, onDone) {
  const decelDist = (cfg.bridgeDist + cfg.lastSymbols) * CELL_TOTAL;
  const scrollDist = Math.abs(targetY);
  const encoreDist = scrollDist - fastDist - decelDist;
  // Encore at same HIGH_SPEED (5 px/ms) — visible "still spinning" after sides stop
  const encoreDur = Math.round(encoreDist / 5); // ~650ms at 5px/ms

  // Phase A: Linear encore spin (same speed as before, blur stays)
  anime({
    targets: strip,
    translateY: -(fastDist + encoreDist),
    duration: encoreDur,
    easing: 'linear',
    complete: () => {
      // Phase B: easeOutQuart deceleration ending at overshoot position
      const decelEnd = targetY - overshootDist;
      const totalDecelMs = cfg.bridgeDur + cfg.tickMs;

      anime({
        targets: strip,
        translateY: decelEnd,
        duration: totalDecelMs,
        easing: 'easeOutQuart',
        update: (anim) => {
          const p = anim.progress / 100;
          if (p < 0.4) {
            strip.style.filter = `blur(${3 * (1 - p / 0.4)}px)`;
          } else {
            strip.style.filter = 'none';
          }
        },
        complete: () => {
          strip.style.filter = 'none';
          reelBounce(strip, reel, col, targetY, board, cfg, onDone);
        }
      });
    }
  });
}

// Bounce back from overshoot position to target + impact
function reelBounce(strip, reel, col, targetY, board, cfg, onDone) {
  reelImpact(reel, col);
  anime({
    targets: strip,
    translateY: targetY,
    duration: 90,
    easing: 'easeOutCubic',
    complete: () => {
      if (cfg.isMiddle) deactivateMiddleFocus();
      onReelStopped(strip, col, board, () => {
        onDone(col, cfg);
      });
    }
  });
}

// Continuous deceleration: last symbol of middle reel gets extra duration
function slideDecelerate(strip, startY, symbolCount, totalMs, isMiddle, onDone) {
  // Gentle 1.35x ratio: continuous deceleration without huge jumps
  // 6 symbols → ~120, 160, 220, 295, 400, 540ms feel
  const ratios = [];
  for (let i = 0; i < symbolCount; i++) ratios.push(Math.pow(1.35, i));
  const ratioSum = ratios.reduce((a, b) => a + b, 0);
  const durations = ratios.map(r => Math.round((r / ratioSum) * totalMs));

  let i = 0;
  const step = () => {
    if (i >= symbolCount) { onDone(); return; }
    anime({
      targets: strip,
      translateY: startY - (i + 1) * CELL_TOTAL,
      duration: durations[i],
      easing: 'linear', // linear per-symbol = continuous sliding, no pause between symbols
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

  // Auto-continue Free Game spins
  if (result.fgTriggered || (result.mode === 'fg' && gm.fg.active)) {
    await delay(400);
    doSpin(); // fire-and-forget next FG spin
  }

  return result;
}

async function showResult(result) {
  const winEl = $('win');
  const resEl = $('results');

  // Clear row badges
  for (let r = 0; r < 3; r++) { const b = $(`badge-${r}`); b.className = 'row-badge'; b.textContent = ''; }

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

    // Update row badges
    result.judgments.forEach(j => {
      const badge = $(`badge-${j.row}`);
      const rowCells = [result.board[j.row][0], result.board[j.row][1], result.board[j.row][2]];
      const hasSC = rowCells.some(c => c.isScatter);
      badge.className = 'row-badge';
      if (hasSC) {
        badge.classList.add('scatter');
        badge.textContent = '🐉 龍 ×1';
      } else {
        switch (j.type) {
          case 'through':
            badge.classList.add('win');
            badge.textContent = `穿門 +${fmt(Math.round(gm.bet / 3 * j.mult))}`;
            break;
          case 'wall':
            badge.classList.add('wall');
            badge.textContent = `碰壁 +${fmt(Math.round(gm.bet / 3 * 1.2))}`;
            break;
          case 'same-hit':
            badge.classList.add('loss');
            badge.textContent = `同值 -${fmt(gm.bet * 3)}`;
            break;
          default:
            badge.textContent = '—';
        }
      }
    });

    // Win line animation for winning rows
    const winRows = result.judgments
      .filter(j => j.type === 'through' || j.type === 'wall')
      .filter(j => !([result.board[j.row][0], result.board[j.row][1], result.board[j.row][2]].some(c => c.isScatter)))
      .map(j => ({ row: j.row, badgeEl: $(`badge-${j.row}`) }));
    if (winRows.length > 0) {
      await playWinLines(winRows);
    }

    // Simplified bottom results (summary only)
    let html = '';
    if (result.totalPayout > 0) {
      html = `<div class="r-summary r-pass">本局贏得 +${fmt(result.totalPayout)}</div>`;
    } else if (result.totalPayout < 0) {
      html = `<div class="r-summary r-wall">本局 ${fmt(result.totalPayout)}</div>`;
    } else {
      html = `<div class="r-summary">本局未中獎</div>`;
    }
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
  recalcCellTotal();
  $('spin-btn').addEventListener('click', doSpin);
  // initSpinButton($('spin-btn')); // disabled: charge effect breaks mobile tap
  // Bet +/- controls
  $('bet-dec').addEventListener('click', () => {
    if (spinning) return;
    gm.setBetIndex(gm.betIndex - 1); updateUI();
  });
  $('bet-inc').addEventListener('click', () => {
    if (spinning) return;
    gm.setBetIndex(gm.betIndex + 1); updateUI();
  });

  // Auto panel
  const autoPanel = $('auto-panel');
  const autoDisplay = $('auto-count-display');
  function updateAutoPanel() {
    autoDisplay.textContent = autoCount + ' 局';
    $('auto-dec').disabled = autoCount <= 10;
    $('auto-inc').disabled = autoCount >= 100;
  }
  $('auto-btn').addEventListener('click', () => {
    if (autoSpins > 0) { autoStopped = true; autoSpins = 0; updateUI(); return; }
    autoPanel.style.display = autoPanel.style.display === 'none' ? '' : 'none';
    updateAutoPanel();
  });
  $('auto-dec').addEventListener('click', () => { autoCount = Math.max(10, autoCount - 10); updateAutoPanel(); });
  $('auto-inc').addEventListener('click', () => { autoCount = Math.min(100, autoCount + 10); updateAutoPanel(); });
  $('auto-start').addEventListener('click', () => { autoPanel.style.display = 'none'; autoSpin(); });
  $('auto-cancel').addEventListener('click', () => { autoPanel.style.display = 'none'; });

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
      setTimeout(() => doSpin(), 500);
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
