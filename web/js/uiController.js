import { cellToString } from './slotEngine.js';
import { GameManager } from './gameManager.js';

const gm = new GameManager();
const $ = id => document.getElementById(id);

const typeLabels = {
  'through': '✓ 穿門',
  'wall': '⚡ 碰壁 (賠雙)',
  'miss': '✗ 未穿',
  'same-hit': '💀 同值命中',
  'same-miss': '✗ 同值未中',
  'sc': '🐉 Scatter (跳過)',
};

function updateUI() {
  $('balance').textContent = gm.balance.toFixed(0);
  $('bet').textContent = gm.bet;
  $('spin-btn').disabled = !gm.canSpin();
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

function renderJudgments(judgments, totalPayout, betPerRow) {
  const lines = judgments.map(j => {
    let text = `列${j.row + 1}: ${typeLabels[j.type]}`;
    if (j.type === 'through') text += ` +${betPerRow * j.mult}`;
    else if (j.type === 'wall') text += ` -${betPerRow * 2}`;
    else if (j.type === 'same-hit') text += ` -${betPerRow * 3}`;
    return text;
  });
  const sign = totalPayout >= 0 ? '+' : '';
  lines.push(`─── 結算: ${sign}${totalPayout} (已扣注 ${betPerRow * 3}) ───`);
  $('results').textContent = lines.join('\n');
}

function onSpin() {
  const result = gm.executeSpin();
  if (!result) return;
  renderBoard(result.board);
  renderJudgments(result.judgments, result.totalPayout, gm.bet);
  $('win').textContent = result.totalPayout >= 0 ? `+${result.totalPayout}` : `${result.totalPayout}`;
  updateUI();
}

export function init() {
  $('spin-btn').addEventListener('click', onSpin);
  $('bet-up').addEventListener('click', () => { gm.setBetIndex(gm.betIndex + 1); updateUI(); });
  $('bet-down').addEventListener('click', () => { gm.setBetIndex(gm.betIndex - 1); updateUI(); });
  updateUI();
}
