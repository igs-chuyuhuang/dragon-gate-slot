import { cellToString } from './slotEngine.js';
import { GameManager } from './gameManager.js';
import { initSpinButton } from './effects/spinButton.js';
import { registerThrough, resetCombo } from './effects/comboSystem.js';
import { playWallHit } from './effects/wallHit.js';
import { anime } from './gameFeel.js';
import { onSpinStart, onColumnStop, onSpinEnd } from './effects/reelStop.js';
import { revealScatters, initScatterDebug } from './effects/scatterReveal.js';
import { playFreeGameTransition } from './effects/freeGameTransition.js';
import { playBigWin } from './effects/bigWin.js';

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

function cellToImg(cell) {
  const src = cell.isScatter ? SC_IMG : CARD_IMG[cell.value];
  return `<img src="assets/img/${src}" alt="${cellToString(cell)}">`;
}

function randomImg() {
  return ALL_IMGS[Math.floor(Math.random() * ALL_IMGS.length)];
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
  $('auto-btn').textContent = autoSpins > 0 ? `停止 (${autoSpins})` : '自動';
}

// === Real Reel Scrolling Animation ===
const CELL_H = 110;
const GAP = 3;
const CELL_TOTAL = CELL_H + GAP; // 113px per cell
const REEL_SYMBOLS = 20; // random symbols before final 3
const OVERSHOOT = 18; // px overshoot on stop

function buildReelStrip(col, finalCells) {
  const strip = document.querySelector(`#reel-${col} .reel-strip`);
  strip.innerHTML = '';
  for (let i = 0; i < REEL_SYMBOLS; i++) {
    const div = document.createElement('div');
    div.className = 'cell';
    div.innerHTML = `<img src="assets/img/${randomImg()}">`;
    strip.appendChild(div);
  }
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

const TARGET_Y = -(REEL_SYMBOLS * CELL_TOTAL);

function animateSpin(board) {
  return new Promise(resolve => {
    spinning = true;
    onSpinStart(); // B. vignette + motion blur

    for (let col = 0; col < 3; col++) {
      const finalCells = [board[0][col], board[1][col], board[2][col]];
      const strip = buildReelStrip(col, finalCells);
      strip.style.transform = 'translateY(0px)';
    }

    document.querySelector('#reel-0 .reel-strip').offsetHeight; // force reflow

    const delays = [0, 250, 500];
    let completed = 0;

    for (let col = 0; col < 3; col++) {
      const strip = document.querySelector(`#reel-${col} .reel-strip`);

      anime({
        targets: strip,
        translateY: [
          { value: TARGET_Y - OVERSHOOT, duration: 800 + col * 200, easing: 'easeInOutQuad' },
          { value: TARGET_Y, duration: 250, easing: 'easeOutBounce' }
        ],
        delay: delays[col],
        complete: () => {
          const cells = strip.querySelectorAll('.cell');
          const finalCells = Array.from(cells).slice(-3);
          finalCells.forEach(c => {
            if (board.some((row, r) => row[col].isScatter && c.id === `cell-${r}-${col}`)) {
              c.classList.add('scatter', 'sc-flash');
            }
            c.classList.add('stop-bounce');
          });

          onColumnStop(col); // B. column impact

          for (let r = 0; r < 3; r++) {
            if (board[r][col].isScatter) {
              scatterAudio.currentTime = 0;
              scatterAudio.play().catch(() => {});
              break;
            }
          }

          completed++;
          if (completed === 3) {
            setTimeout(() => { spinning = false; onSpinEnd(); resolve(); }, 200);
          }
        }
      });
    }
  });
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

    // H. Big Win on FG end
    if (result.fgDone && result.jpResult && result.jpResult.payout > 0) {
      await playBigWin(result.jpResult.payout, gm.bet);
    }
  } else {
    // F. Scatter reveal (if any scatters)
    if (result.scatterCount > 0) {
      await revealScatters(result.board, result.scatterCount);
    }

    // C/D/E. 特效觸發
    let hasThrough = false;
    result.judgments.forEach(j => {
      if (j.type === 'through') { registerThrough(j.row, j.mult); hasThrough = true; }
      else if (j.type === 'wall') { playWallHit(j.row); }
    });
    if (!hasThrough) resetCombo();

    let html = '';
    result.judgments.forEach(j => {
      let cls, text;
      switch (j.type) {
        case 'through':
          cls = 'r-pass'; text = `✓ 穿門 ×${j.mult} (+${fmt(gm.bet * j.mult)})`;
          break;
        case 'wall':
          cls = 'r-wall'; text = `⚡ 碰壁 賠雙 (-${fmt(gm.bet * 2)})`;
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
    if (autoSpins > 0 && !autoStopped) await delay(600);
  }
  autoSpins = 0;
  updateUI();
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

export function init() {
  $('spin-btn').addEventListener('click', doSpin);
  initSpinButton($('spin-btn')); // A. Spin charge
  $('auto-btn').addEventListener('click', autoSpin);
  $('bet-up').addEventListener('click', () => { if (!spinning) { gm.setBetIndex(gm.betIndex + 1); updateUI(); } });
  $('bet-down').addEventListener('click', () => { if (!spinning) { gm.setBetIndex(gm.betIndex - 1); updateUI(); } });

  document.querySelectorAll('.auto-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      autoCount = parseInt(btn.dataset.count);
      document.querySelectorAll('.auto-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Hotkeys
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && !e.repeat) { e.preventDefault(); doSpin(); }
    if ((e.key === 'f' || e.key === 'F') && !gm.fg.active && !spinning) {
      gm.triggerFreeGame();
      $('results').innerHTML = '<div class="row-result r-sc">🐉 Free Game 觸發！（測試）</div>';
      updateUI();
    }
  });

  // F. Scatter debug hotkey
  initScatterDebug();

  // Initialize reel strips with visible symbols
  for (let col = 0; col < 3; col++) {
    const strip = document.querySelector(`#reel-${col} .reel-strip`);
    strip.style.transform = 'translateY(0px)';
    for (let r = 0; r < 3; r++) {
      const cell = $(`cell-${r}-${col}`);
      cell.innerHTML = `<img src="assets/img/${ALL_IMGS[Math.floor(Math.random() * ALL_IMGS.length)]}">`;
    }
  }

  updateUI();
}
