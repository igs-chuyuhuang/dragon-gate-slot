function getPassMult(gap) { return gap > 0 ? 1 : 0; }

export class BonusGame {
  constructor(bet, pool) {
    this.chips = bet * 2;
    this.initialChips = this.chips;
    this.guarantee = bet * 2;
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
    // Ensure gap >= 1 (avoid gap=0 dead gate)
    let l, r;
    do {
      l = Math.floor(Math.random() * 13) + 1;
      r = Math.floor(Math.random() * 13) + 1;
    } while (l !== r && Math.abs(l - r) <= 1);
    this.left = l;
    this.right = r;
    return { left: this.left, right: this.right };
  }

  getGateInfo() {
    const l = this.left, r = this.right;
    if (l === r) return { type: 'same', gap: 11, label: '同值門', mult: 1 };
    const gap = Math.abs(l - r) - 1;
    const mult = getPassMult(gap);
    let label = '寬門';
    if (gap <= 0) label = '死門';
    else if (gap === 1) label = '極窄門';
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
      this.winnings += win;
      this.chips += win;
    } else {
      if (this.roundBet >= this.chips) {
        // All in 輸：保底，BG 結束
        this.winnings = this.guarantee;
        this.chips = 0;
        this.active = false;
      } else {
        const loss = this.roundBet * Math.abs(result.mult);
        this.chips -= loss;
        if (this.chips < 0) this.chips = 0;
      }
    }
    this.rounds++;
    if (this.chips <= 0 || this.rounds >= this.maxRounds) this.active = false;
  }

  cashOut() {
    this.active = false;
    return Math.max(this.winnings, this.guarantee);
  }
}
