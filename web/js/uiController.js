import { cellToString } from './slotEngine.js';
import { GameManager } from './gameManager.js';

const gm = new GameManager();
const $ = id => document.getElementById(id);
let spinning = false;
let autoSpins = 0;
let autoStopped = false;

const typeLabels = {
  'through': '✓ 穿門', 'wall': '⚡ 碰壁 (賠雙)', 'miss': '✗ 未穿',
  'same-hit': '💀 同值命中', 'same-miss': '✗ 同值未中',
};

function updateUI() {
  $('balance').textContent = gm.balance.toFixed(0);
  $('bet').textContent = gm.bet;
  $('spin-btn').disabled = spinning || !gm.canSpin();
  $('spin-btn').textContent = gm.fg.active ? `FG SPIN (${gm.fg.spinsLeft})` : 'SPIN';
  $('jp-basic').textContent = gm.jp.pools.basic.toFixed(0);
  $('jp-major').textContent = gm.jp.pools.major.toFixed(0);
  $('jp-grand').textContent = gm.jp.pools.grand.toFixed(0);
  const scEl = $('sc-counter');
  scEl.textContent = `🐉 ${gm.scatterCounter}/3`;
  scEl.classList.toggle('almost', gm.scatterCounter === 2);
  const fgEl = $('fg-info');
  if (gm.fg.active) {
    fgEl.style.display = 'block';
    fgEl.textContent = `🎰 Free Game: 剩餘 ${gm.fg.spinsLeft} 轉 | 累積 ${gm.fg.totalScore} 分 | 延伸 ${gm.fg.extensions}/2`;
  } else { fgEl.style.display = 'none'; }
  document.body.classList.toggle('fg-mode', gm.fg.active);
  $('auto-btn').textContent = autoSpins > 0 ? `停止 (${autoSpins})` : '自動';
}

// Reel animation: rapidly cycle random values then stop col by col
function animateSpin(board) {
  return new Promise(resolve => {
    spinning = true;
    const names = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const intervals = [];

    // Start all cells cycling
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        const el = $(`cell-${r}-${c}`);
        el.className = 'cell rolling';
        const iv = setInterval(() => { el.textContent = names[Math.floor(Math.random() * 13)]; }, 60);
        intervals.push({ r, c, iv, el });
      }

    // Stop columns sequentially
    const stopCol = (col, delay) => setTimeout(() => {
      intervals.filter(x => x.c === col).forEach(x => {
        clearInterval(x.iv);
        const cell = board[x.r][x.c];
        x.el.textContent = cellToString(cell);
        x.el.className = 'cell stop-bounce' + (cell.isScatter ? ' scatter sc-flash' : '');
      });
      if (col === 2) setTimeout(() => { spinning = false; resolve(); }, 200);
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
  if (result.mode === 'fg') {
    let lines = [`FG 本轉得分: +${result.spinScore}`, `累積總分: ${result.totalScore}`, `剩餘: ${result.spinsLeft} 轉`];
    if (result.extended) lines.push('🐉 延伸 +8 轉！');
    if (result.fgDone) {
      lines.push('═══ Free Game 結束 ═══', `最終累積: ${result.totalScore} 分`);
      if (result.jpResult) {
        lines.push(`JP Gate: ${result.jpResult.msg}`);
        if (result.jpResult.payout > 0) lines.push(`🏆 獎金: +${result.jpResult.payout.toFixed(0)}`);
      }
    }
    $('results').textContent = lines.join('\n');
    $('win').textContent = result.fgDone && result.jpResult ? `+${result.jpResult.payout.toFixed(0)}` : '-';
  } else {
    const lines = result.judgments.map(j => {
      let text = `列${j.row + 1}: ${typeLabels[j.type]}`;
      if (j.type === 'through') text += ` +${gm.bet * j.mult}`;
      else if (j.type === 'wall') text += ` -${gm.bet * 2}`;
      else if (j.type === 'same-hit') text += ` -${gm.bet * 3}`;
      return text;
    });
    lines.push(`─── 結算: ${result.totalPayout >= 0 ? '+' : ''}${result.totalPayout} ───`);
    if (result.scatterCount > 0) lines.push(`🐉 SC × ${result.scatterCount} (累積 ${gm.scatterCounter}/3)`);
    if (result.fgTriggered) lines.push('🎰 Free Game 觸發！');
    $('results').textContent = lines.join('\n');
    $('win').textContent = result.totalPayout >= 0 ? `+${result.totalPayout}` : `${result.totalPayout}`;
  }
}

async function autoSpin() {
  const count = parseInt($('auto-count').value) || 10;
  if (autoSpins > 0) { autoStopped = true; autoSpins = 0; updateUI(); return; }
  autoSpins = count;
  autoStopped = false;

  while (autoSpins > 0 && !autoStopped && gm.canSpin()) {
    const result = await doSpin();
    autoSpins--;
    updateUI();
    // Pause on FG trigger
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
  document.addEventListener('keydown', e => {
    if ((e.key === 'f' || e.key === 'F') && !gm.fg.active && !spinning) {
      gm.triggerFreeGame();
      $('results').textContent = '🐉 Free Game 觸發！（測試）\n按 SPIN 開始';
      updateUI();
    }
  });
  updateUI();
}
