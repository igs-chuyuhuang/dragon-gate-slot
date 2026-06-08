function getPassMult(gap) {
  if (gap <= 1) return 10;
  if (gap <= 3) return 5;
  if (gap <= 7) return 2.5;
  return 1;
}

export class BonusGame {
  constructor(bet, pool) {
    this.chips = bet * 50;
    this.winnings = 0;
    this.pool = pool;
    this.roundBet = 0;
    this.roundTime = 10;
    this.maxRounds = 12;
    this.rounds = 0;
    this.active = true;
    this.left = 0;
    this.right = 0;
    this.mid = 0;
  }

  deal() {
    this.left = Math.floor(Math.random() * 13) + 1;
    this.right = Math.floor(Math.random() * 13) + 1;
    return { left: this.left, right: this.right };
  }

  getGateInfo() {
    const l = this.left, r = this.right;
    if (l === r) return { type: 'same', gap: 11, label: '同值門', mult: 1 };
    const gap = Math.abs(l - r) - 1;
    const mult = getPassMult(gap);
    let label = '寬門';
    if (gap <= 1) label = '極窄門';
    else if (gap <= 3) label = '窄門';
    else if (gap <= 7) label = '中門';
    return { type: 'normal', gap, label, mult };
  }

  reveal() {
    this.mid = Math.floor(Math.random() * 13) + 1;
    return this.judge();
  }

  judge() {
    const l = this.left, m = this.mid, r = this.right;
    if (l === r) {
      if (m === l) return { type: 'same-hit', mult: -3, mid: m };
      return { type: 'through', mult: 1, mid: m }; // same-gate through = wide
    }
    const lo = Math.min(l, r), hi = Math.max(l, r);
    const gap = hi - lo - 1;
    if (m === lo || m === hi) return { type: 'wall', mult: -2, mid: m };
    if (m > lo && m < hi) return { type: 'through', mult: getPassMult(gap), mid: m };
    return { type: 'miss', mult: -1, mid: m };
  }

  applyResult(result) {
    if (result.mult > 0) {
      const win = this.roundBet * result.mult;
      const actual = Math.min(win, this.pool);
      this.winnings += actual;
      this.chips += actual;
      this.pool -= actual;
    } else {
      this.chips += this.roundBet * result.mult;
      if (this.chips < 0) this.chips = 0;
    }
    this.rounds++;
    if (this.chips <= 0 || this.rounds >= this.maxRounds) this.active = false;
  }

  cashOut() {
    this.active = false;
    return this.winnings;
  }
}
