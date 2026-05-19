import { CellType } from './slotEngine.js';

export const JudgeResult = { Pass: 'Pass', HitWall: 'HitWall', Miss: 'Miss', SameValueHit: 'SameValueHit' };

export function judgeBoard(board) {
  return [0, 1, 2].map(r => judgeRow(r, board[r][0], board[r][1], board[r][2]));
}

function judgeRow(row, left, mid, right) {
  const j = { row, result: JudgeResult.Miss, gap: 0, hasScatter: false };

  j.hasScatter = left.type === CellType.Scatter ||
                 mid.type === CellType.Scatter ||
                 right.type === CellType.Scatter;

  if (j.hasScatter) return j;

  const l = left.value, m = mid.value, r2 = right.value;

  // Same-value gate
  if (l === r2) {
    j.result = (m === l) ? JudgeResult.SameValueHit : JudgeResult.Miss;
    return j;
  }

  // Normal gate
  const lo = Math.min(l, r2);
  const hi = Math.max(l, r2);

  if (m === lo || m === hi) {
    j.result = JudgeResult.HitWall;
  } else if (m > lo && m < hi) {
    j.result = JudgeResult.Pass;
    j.gap = hi - lo;
  }
  return j;
}
