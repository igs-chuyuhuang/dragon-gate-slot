import { cellToString } from './slotEngine.js';
import { GameManager } from './gameManager.js';

const gm = new GameManager();
const $ = id => document.getElementById(id);

const typeLabels = {
  'through': '✓ 穿門', 'wall': '⚡ 碰壁 (賠雙)', 'miss': '✗ 未穿',
  'same-hit': '💀 同值命中', 'same-miss': '✗ 同值未中', 'sc': '🐉 Scatter (跳過)',
};

function updateUI() {
  $('balance').textContent = gm.balance.toFixed(0);
  $('bet').textContent = gm.bet;
  $('spin-btn').disabled = !gm.canSpin();
  $('spin-btn').textContent = gm.fg.active ? `FG SPIN (${gm.fg.spinsLeft})` : 'SPIN';
  // JP pools
  $('jp-basic').textContent = gm.jp.pools.basic.toFixed(0);
  $('jp-major').textContent = gm.jp.pools.major.toFixed(0);
  $('jp-grand').textContent = gm.jp.pools.grand.toFixed(0);
  // FG info
  const fgEl = $('fg-info');
  if (gm.fg.active) {
    fgEl.style.display = 'block';
    fgEl.textContent = `🎰 Free Game: 剩餘 ${gm.fg.spinsLeft} 轉 | 累積 ${gm.fg.totalScore} 分`;
  } else {
    fgEl.style.display = 'none';
  }
  document.body.classList.toggle('fg-mode', gm.fg.active);
}

function renderBoard(board) {
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const cell = board[r][c];
      const el = $(`cell-${r}-${c}`);
      el.textContent = cellToString(cell);
      el.className = 'cell' + (cell.isScatter ? ' scatter' : '');
    }
}

function onSpin() {
  const result = gm.executeSpin();
  if (!result) return;
  renderBoard(result.board);

  if (result.mode === 'fg') {
    let lines = [`FG 本轉得分: +${result.spinScore}`, `累積總分: ${result.totalScore}`, `剩餘: ${result.spinsLeft} 轉`];
    if (result.fgDone) {
      lines.push('═══ Free Game 結束 ═══');
      lines.push(`最終累積: ${result.totalScore} 分`);
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
    if (result.scatterCount > 0) lines.push(`🐉 SC × ${result.scatterCount}${result.fgTriggered ? ' → Free Game 觸發！' : ''}`);
    $('results').textContent = lines.join('\n');
    $('win').textContent = result.totalPayout >= 0 ? `+${result.totalPayout}` : `${result.totalPayout}`;
  }
  updateUI();
}

export function init() {
  $('spin-btn').addEventListener('click', onSpin);
  $('bet-up').addEventListener('click', () => { gm.setBetIndex(gm.betIndex + 1); updateUI(); });
  $('bet-down').addEventListener('click', () => { gm.setBetIndex(gm.betIndex - 1); updateUI(); });
  document.addEventListener('keydown', e => {
    if ((e.key === 'f' || e.key === 'F') && !gm.fg.active) {
      gm.triggerFreeGame();
      $('results').textContent = '🐉 Free Game 觸發！（測試）\n按 SPIN 開始';
      updateUI();
    }
  });
  updateUI();
}
