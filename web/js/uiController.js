import { cellToString } from './slotEngine.js';
import { GameManager } from './gameManager.js';
import { initSpinButton } from './effects/spinButton.js';
import { registerThrough, resetCombo } from './effects/comboSystem.js';
import { playWallHit } from './effects/wallHit.js';
import { anime } from './gameFeel.js';

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
const EXTRA_SYMBOLS = 12; // extra symbols for scrolling illusion

function buildReelStrip(col, finalCells) {
  // Strip: [12 random symbols on top] + [3 final symbols at bottom]
  // Reel shows bottom 3 cells. Animation starts with strip pulled up (showing randoms),
  // then slides down to 0 (showing finals at bottom) = symbols fall from top to bottom.
  const strip = document.querySelector(`#reel-${col} .reel-strip`);
  strip.innerHTML = '';
  // Random symbols on top (scroll past during spin)
  for (let i = 0; i < EXTRA_SYMBOLS; i++) {
    const div = document.createElement('div');
    div.className = 'cell';
    div.innerHTML = `<img src="assets/img/${randomImg()}">`;
    strip.appendChild(div);
  }
  // Final 3 symbols at bottom (row 0, 1, 2 for this column)
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

function animateSpin(board) {
  return new Promise(resolve => {
    spinning = true;
    // Strip has 15 cells total. Reel viewport shows bottom 3.
    // At rest (translateY=0), bottom 3 (finals) are visible.
    // Start offset: pull strip UP so random symbols are visible instead.
    const startY = -(EXTRA_SYMBOLS * CELL_TOTAL);

    for (let col = 0; col < 3; col++) {
      const finalCells = [board[0][col], board[1][col], board[2][col]];
      const strip = buildReelStrip(col, finalCells);
      strip.style.transform = `translateY(${startY}px)`;
    }

    // Animate: translateY from negative (pulled up) to 0 (finals at bottom visible)
    // Visually: symbols scroll downward (fall from top)
    const delays = [0, 200, 400];
    const durations = [800, 1000, 1200];
    let completed = 0;

    for (let col = 0; col < 3; col++) {
      const strip = document.querySelector(`#reel-${col} .reel-strip`);
      anime({
        targets: strip,
        translateY: [startY, 0],
        duration: durations[col],
        delay: delays[col],
        easing: 'cubicBezier(0.2, 0.6, 0.3, 1)',
        complete: () => {
          // Add bounce effect to final cells (last 3 in strip)
          const cells = strip.querySelectorAll('.cell');
          const finalCells = Array.from(cells).slice(-3);
          finalCells.forEach(c => {
            if (c.querySelector('img[alt*="🐉"]') || board.some((row, r) => row[col].isScatter && c.id === `cell-${r}-${col}`)) {
              c.classList.add('scatter', 'sc-flash');
            }
            c.classList.add('stop-bounce');
          });

          // Play scatter sound if scatter in this column
          for (let r = 0; r < 3; r++) {
            if (board[r][col].isScatter) {
              scatterAudio.currentTime = 0;
              scatterAudio.play().catch(() => {});
              break;
            }
          }

          completed++;
          if (completed === 3) {
            setTimeout(() => { spinning = false; resolve(); }, 250);
          }
        }
      });
    }
  });
}

// === Free Game Transition ===
function showFGTransition() {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'fg-transition-overlay';
    overlay.innerHTML = '<img src="assets/img/FG-01_free_game.png" alt="Free Game">';
    document.body.appendChild(overlay);

    const img = overlay.querySelector('img');
    anime.set(overlay, { opacity: 0 });
    anime.set(img, { scale: 0.5, opacity: 0 });

    anime.timeline({ complete: () => { overlay.remove(); resolve(); } })
      .add({ targets: overlay, opacity: [0, 1], duration: 400, easing: 'easeOutQuad' })
      .add({ targets: img, scale: [0.5, 1.05, 1], opacity: [0, 1], duration: 800, easing: 'easeOutElastic(1, 0.6)' }, 0)
      .add({ targets: overlay, opacity: 0, duration: 500, easing: 'easeInQuad', delay: 1500 });
  });
}

async function doSpin() {
  if (spinning || !gm.canSpin()) return;
  updateUI();
  const result = gm.executeSpin();
  if (!result) return;
  await animateSpin(result.board);
  showResult(result);
  updateUI();

  // FG transition after showing result
  if (result.fgTriggered) {
    await showFGTransition();
  }

  return result;
}

function showResult(result) {
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
  } else {
    // 特效觸發
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

    if (result.totalPayout > 0) {
      const hasHighMult = result.judgments.some(j => j.type === 'through' && j.mult >= 4);
      if (hasHighMult) { showCelebration(); showWinPopup(result.totalPayout); }
      else if (result.totalPayout >= gm.bet * 5) { showWinPopup(result.totalPayout); }
    }
  }
}

function showCelebration() {
  document.querySelector('.celebrate-overlay')?.remove();
  const el = document.createElement('div');
  el.className = 'celebrate-overlay';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

function showWinPopup(amount) {
  const popup = $('win-popup');
  const amountEl = $('win-popup-amount');
  amountEl.textContent = fmt(amount);
  popup.style.display = 'flex';
  popup.onclick = () => { popup.style.display = 'none'; };
  setTimeout(() => { popup.style.display = 'none'; }, 3000);
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
  initSpinButton($('spin-btn'));
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

  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && !e.repeat) { e.preventDefault(); doSpin(); }
    if ((e.key === 'f' || e.key === 'F') && !gm.fg.active && !spinning) {
      gm.triggerFreeGame();
      $('results').innerHTML = '<div class="row-result r-sc">🐉 Free Game 觸發！（測試）</div><div class="row-result">按 SPIN 開始</div>';
      updateUI();
    }
  });

  // Initialize reel strips with placeholder content
  for (let col = 0; col < 3; col++) {
    const strip = document.querySelector(`#reel-${col} .reel-strip`);
    for (let r = 0; r < 3; r++) {
      const cell = $(`cell-${r}-${col}`);
      cell.innerHTML = `<img src="assets/img/${ALL_IMGS[Math.floor(Math.random() * ALL_IMGS.length)]}">`;
    }
  }

  updateUI();
}
