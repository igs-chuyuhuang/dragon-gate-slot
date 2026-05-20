import { cellToString } from './slotEngine.js';
import { GameManager } from './gameManager.js';

const gm = new GameManager();
const $ = id => document.getElementById(id);
let spinning = false;
let autoSpins = 0;
let autoStopped = false;
let autoCount = 10;

function fmt(n) { return Math.round(n).toLocaleString(); }

function updateUI() {
  $('balance').textContent = fmt(gm.balance);
  $('bet').textContent = fmt(gm.bet);
  $('spin-btn').disabled = spinning || !gm.canSpin();
  $('spin-btn').textContent = gm.fg.active ? `FG SPIN (${gm.fg.spinsLeft})` : 'SPIN';
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

function animateSpin(board) {
  return new Promise(resolve => {
    spinning = true;
    const names = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const intervals = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        const el = $(`cell-${r}-${c}`);
        el.className = 'cell rolling';
        const iv = setInterval(() => { el.textContent = names[Math.floor(Math.random() * 13)]; }, 60);
        intervals.push({ r, c, iv, el });
      }
    const stopCol = (col, delay) => setTimeout(() => {
      intervals.filter(x => x.c === col).forEach(x => {
        clearInterval(x.iv);
        const cell = board[x.r][x.c];
        x.el.textContent = cellToString(cell);
        x.el.className = 'cell stop-bounce' + (cell.isScatter ? ' scatter sc-flash' : '');
      });
      if (col === 2) setTimeout(() => { spinning = false; resolve(); }, 250);
    }, delay);
    stopCol(0, 800);
    stopCol(1, 1200);
    stopCol(2, 1600);
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
      // Check for scatter in row
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
    winEl.className = result.totalPayout > 0 ? 'win-positive win-countup' : result.totalPayout < 0 ? 'win-negative' : '';

    // #7 慶祝動畫
    if (result.totalPayout > 0) {
      const hasHighMult = result.judgments.some(j => j.type === 'through' && j.mult >= 4);
      if (hasHighMult) showCelebration();
    }
    if (result.fgTriggered) showFGOverlay();
  }
}

function showCelebration() {
  const el = document.createElement('div');
  el.className = 'celebrate-overlay';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

function showFGOverlay() {
  const el = document.createElement('div');
  el.className = 'fg-trigger-overlay';
  el.innerHTML = '<span>🐉 Free Game！</span>';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
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
  $('auto-btn').addEventListener('click', autoSpin);
  $('bet-up').addEventListener('click', () => { if (!spinning) { gm.setBetIndex(gm.betIndex + 1); updateUI(); } });
  $('bet-down').addEventListener('click', () => { if (!spinning) { gm.setBetIndex(gm.betIndex - 1); updateUI(); } });

  // 自動按鈕組
  document.querySelectorAll('.auto-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      autoCount = parseInt(btn.dataset.count);
      document.querySelectorAll('.auto-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // #2 空白鍵 = SPIN
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && !e.repeat) { e.preventDefault(); doSpin(); }
    if ((e.key === 'f' || e.key === 'F') && !gm.fg.active && !spinning) {
      gm.triggerFreeGame();
      $('results').innerHTML = '<div class="row-result r-sc">🐉 Free Game 觸發！（測試）</div><div class="row-result">按 SPIN 開始</div>';
      updateUI();
    }
  });

  updateUI();
}
