import { cellToString } from './slotEngine.js';
import { GameManager } from './gameManager.js';

const gm = new GameManager();
const $ = id => document.getElementById(id);

const typeLabels = {
  'through': '✓ 穿門', 'wall': '⚡ 碰壁 (賠雙)', 'miss': '✗ 未穿',
  'same-hit': '💀 同值命中', 'same-miss': '✗ 同值未中',
};

function updateUI() {
  $('balance').textContent = gm.balance.toFixed(0);
  $('bet').textContent = gm.bet;
  $('spin-btn').disabled = !gm.canSpin();
  $('spin-btn').textContent = gm.fg.active ? `FG SPIN (${gm.fg.spinsLeft})` : 'SPIN';
  $('jp-basic').textContent = gm.jp.pools.basic.toFixed(0);
  $('jp-major').textContent = gm.jp.pools.major.toFixed(0);
  $('jp-grand').textContent = gm.jp.pools.grand.toFixed(0);

  // SC counter
  const scEl = $('sc-counter');
  scEl.textContent = `🐉 ${gm.scatterCounter}/3`;
  scEl.classList.toggle('almost', gm.scatterCounter === 2);

  // FG info
  const fgEl = $('fg-info');
  if (gm.fg.active) {
    fgEl.style.display = 'block';
    fgEl.textContent = `🎰 Free Game: 剩餘 ${gm.fg.spinsLeft} 轉 | 累積 ${gm.fg.totalScore} 分 | 延伸 ${gm.fg.extensions}/2`;
  } else {
    fgEl.style.display = 'none';
  }
  document.body.classList.toggle('fg-mode', gm.fg.active);

  // Stop buttons visibility
  const stopVisible = gm.spinning;
  $('stop-controls').style.display = stopVisible ? 'flex' : 'none';
  if (stopVisible) {
    $('stop-left').disabled = gm.revealedCols[0];
    $('stop-mid').disabled = gm.revealedCols[1];
    $('stop-right').disabled = gm.revealedCols[2];
  }
}

function renderBoard(board, revealedCols) {
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const el = $(`cell-${r}-${c}`);
      if (revealedCols[c]) {
        const cell = board[r][c];
        el.textContent = cellToString(cell);
        el.className = 'cell' + (cell.isScatter ? ' scatter' : '');
      } else {
        el.textContent = '?';
        el.className = 'cell hidden';
      }
    }
}

function onSpin() {
  const board = gm.startSpin();
  if (!board) return;
  renderBoard(board, [false, false, false]);
  $('results').textContent = '選擇停輪順序，或按「全停」';
  $('win').textContent = '-';
  updateUI();
}

function onStopCol(col) {
  const result = gm.revealCol(col);
  if (!result) return;
  renderBoard(gm.pendingBoard, gm.revealedCols);
  if (!gm.spinning) showResult(result);
  updateUI();
}

function onStopAll() {
  const result = gm.revealAll();
  if (!result) return;
  renderBoard(gm.pendingBoard, [true, true, true]);
  showResult(result);
  updateUI();
}

function showResult(result) {
  if (result.mode === 'fg') {
    let lines = [`FG 本轉得分: +${result.spinScore}`, `累積總分: ${result.totalScore}`, `剩餘: ${result.spinsLeft} 轉`];
    if (result.extended) lines.push('🐉 延伸 +8 轉！');
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
    if (result.scatterCount > 0) lines.push(`🐉 SC × ${result.scatterCount} (累積 ${gm.scatterCounter}/3)`);
    if (result.fgTriggered) lines.push('🎰 Free Game 觸發！');
    $('results').textContent = lines.join('\n');
    $('win').textContent = result.totalPayout >= 0 ? `+${result.totalPayout}` : `${result.totalPayout}`;
  }
}

export function init() {
  $('spin-btn').addEventListener('click', onSpin);
  $('bet-up').addEventListener('click', () => { gm.setBetIndex(gm.betIndex + 1); updateUI(); });
  $('bet-down').addEventListener('click', () => { gm.setBetIndex(gm.betIndex - 1); updateUI(); });
  $('stop-left').addEventListener('click', () => onStopCol(0));
  $('stop-mid').addEventListener('click', () => onStopCol(1));
  $('stop-right').addEventListener('click', () => onStopCol(2));
  $('stop-all').addEventListener('click', onStopAll);
  document.addEventListener('keydown', e => {
    if ((e.key === 'f' || e.key === 'F') && !gm.fg.active && !gm.spinning) {
      gm.triggerFreeGame();
      $('results').textContent = '🐉 Free Game 觸發！（測試）\n按 SPIN 開始';
      updateUI();
    }
  });
  updateUI();
}
