export const JudgeResult = { Pass: 'Pass', HitWall: 'HitWall', Miss: 'Miss', SameValueHit: 'SameValueHit' };

export function judgeBoard(board) {
  const judgments = [0, 1, 2].map(r => judgeRow(r, board[r][0], board[r][1], board[r][2]));
  let scatterCount = 0;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (board[r][c].isScatter) scatterCount++;
  return { judgments, scatterCount };
}

function judgeRow(row, left, mid, right) {
  const j = { row, result: JudgeResult.Miss, gap: 0 };
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
    j.gap = hi - lo - 1;
  }
  return j;
}
