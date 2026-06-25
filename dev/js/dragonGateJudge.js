export function judgeBoard(board) {
  return [0, 1, 2].map(r => judgeRow(r, board[r][0], board[r][1], board[r][2]));
}

function judgeRow(row, left, mid, right) {
  // 有 Scatter 的列不做穿門/碰壁判定
  if (left.isScatter || mid.isScatter || right.isScatter) {
    return { row, type: 'scatter', lampChange: 0, gap: 0 };
  }

  const l = left.value, m = mid.value, r2 = right.value;

  // Same-value gate
  if (l === r2) {
    if (m === l) return { row, type: 'same-hit', lampChange: -2, gap: 0 };
    return { row, type: 'through', mult: 1, gap: 12 }; // 視為寬門穿門
  }

  // Normal gate
  const lo = Math.min(l, r2), hi = Math.max(l, r2);
  const gap = hi - lo - 1;

  if (m === lo || m === hi) return { row, type: 'wall', lampChange: -1, gap };
  if (m > lo && m < hi) return { row, type: 'through', mult: getPassMult(gap), gap };
  return { row, type: 'miss', lampChange: 0, gap };
}

function getPassMult(gap) {
  if (gap <= 0) return 0;
  if (gap === 1) return 10;
  if (gap <= 3) return 5;
  if (gap <= 7) return 2;
  return 1;
}
