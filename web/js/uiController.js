import { cellToString } from './slotEngine.js';
import { JudgeResult } from './dragonGateJudge.js';
import { GameManager } from './gameManager.js';

const gm = new GameManager();
const $ = id => document.getElementById(id);

const resultLabels = {
  [JudgeResult.Pass]: '✓ 穿門',
  [JudgeResult.HitWall]: '⚡ 碰壁',
  [JudgeResult.Miss]: '✗ 未穿',
  [JudgeResult.SameValueHit]: '💀 同值命中',
};

function updateUI() {
  $('balance').textContent = gm.balance.toFixed(1);
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

function renderJudgments(judgments, payout, scatterCount) {
  const lines = judgments.map(j => {
    let text = `列${j.row + 1}: ${resultLabels[j.result]}`;
    if (j.result === JudgeResult.Pass) text += ` (gap=${j.gap})`;
    return text;
  });
  lines.push(`─── 派彩: ${payout >= 0 ? '+' : ''}${payout.toFixed(1)} ───`);
  if (scatterCount > 0) lines.push(`🐉 Scatter × ${scatterCount}${scatterCount >= 3 ? ' → Free Game!' : ''}`);
  $('results').textContent = lines.join('\n');
}

function onSpin() {
  const result = gm.executeSpin();
  if (!result) return;
  renderBoard(result.board);
  renderJudgments(result.judgments, result.payout, result.scatterCount);
  $('win').textContent = result.payout.toFixed(1);
  updateUI();
}

export function init() {
  $('spin-btn').addEventListener('click', onSpin);
  $('bet-up').addEventListener('click', () => { gm.setBetIndex(gm.betIndex + 1); updateUI(); });
  $('bet-down').addEventListener('click', () => { gm.setBetIndex(gm.betIndex - 1); updateUI(); });
  updateUI();
}
