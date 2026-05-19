export class FreeGame {
  constructor() { this.reset(); }

  reset() {
    this.active = false;
    this.spinsLeft = 0;
    this.totalScore = 0;
  }

  start() {
    this.active = true;
    this.spinsLeft = 8;
    this.totalScore = 0;
  }

  scoreSpin(board) {
    if (!this.active) return 0;
    this.spinsLeft--;
    let spinScore = 0;
    for (let r = 0; r < 3; r++)
      spinScore += scoreRow(board[r][0], board[r][1], board[r][2]);
    this.totalScore += spinScore;
    if (this.spinsLeft <= 0) this.active = false;
    return spinScore;
  }
}

function scoreRow(left, mid, right) {
  if (left.isScatter || mid.isScatter || right.isScatter) return 0;
  const l = left.value, m = mid.value, r2 = right.value;

  // Same-value gate
  if (l === r2) return (m === l) ? m : 0;

  const lo = Math.min(l, r2), hi = Math.max(l, r2);
  if (m === lo || m === hi) return m * 3;  // 碰壁 M×3
  if (m > lo && m < hi) return m;           // 穿門 M×1
  return 0;                                  // 未穿
}
