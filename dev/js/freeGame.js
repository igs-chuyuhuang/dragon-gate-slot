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

  scoreSpin(board, bet) {
    if (!this.active) return 0;
    this.spinsLeft--;
    let spinScore = 0;
    for (let r = 0; r < 3; r++)
      spinScore += scoreFGRow(board[r][0], board[r][1], board[r][2], bet);
    this.totalScore += spinScore;
    if (this.spinsLeft <= 0) this.active = false;
    return spinScore;
  }
}

function scoreFGRow(left, mid, right, bet) {
  const l = left.value, m = mid.value, r2 = right.value;
  if (l === r2) return 0; // same-value: no payout in FG
  const lo = Math.min(l, r2), hi = Math.max(l, r2);
  if (m > lo && m < hi) return bet / 3 * getPassMult(hi - lo - 1); // through
  return 0; // miss or wall — no payout
}

function getPassMult(gap) {
  if (gap <= 1) return 15;
  if (gap <= 3) return 10;
  if (gap <= 7) return 4;
  if (gap <= 9) return 2;
  return 1;
}
