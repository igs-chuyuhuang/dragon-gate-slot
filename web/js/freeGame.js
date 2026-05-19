export class FreeGame {
  constructor() { this.reset(); }

  reset() {
    this.active = false;
    this.spinsLeft = 0;
    this.totalScore = 0;
    this.extensions = 0;
  }

  start() {
    this.active = true;
    this.spinsLeft = 8;
    this.totalScore = 0;
    this.extensions = 0;
  }

  extend() {
    if (this.extensions >= 2) return false;
    this.extensions++;
    this.spinsLeft += 8;
    return true;
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
  const l = left.value, m = mid.value, r2 = right.value;

  if (l === r2) return (m === l) ? m : 0;

  const lo = Math.min(l, r2), hi = Math.max(l, r2);
  if (m === lo || m === hi) return m * 3;
  if (m > lo && m < hi) return m;
  return 0;
}
