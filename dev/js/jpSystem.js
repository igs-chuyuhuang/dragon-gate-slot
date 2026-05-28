export class JpSystem {
  constructor(bet) {
    this.bet = bet;
    this.pools = {
      basic: 50 * bet,
      major: 200 * bet,
      grand: 1000 * bet,
    };
  }

  get caps() {
    return { basic: 250 * this.bet, major: 1000 * this.bet, grand: 5000 * this.bet };
  }

  contribute(totalWager) {
    const caps = this.caps;
    this.pools.basic = Math.min(this.pools.basic + totalWager * 0.03, caps.basic);
    this.pools.major = Math.min(this.pools.major + totalWager * 0.015, caps.major);
    this.pools.grand = Math.min(this.pools.grand + totalWager * 0.005, caps.grand);
  }

  evalJpGate(score) {
    if (score < 60) return { tier: null, payout: 0, msg: '未達門檻' };
    if (score <= 120) return this._calc('basic', score, 90, 60, 120);
    if (score <= 129) return { tier: null, payout: 0, msg: '空隙' };
    if (score <= 200) return this._calc('major', score, 165, 130, 200);
    if (score <= 209) return { tier: null, payout: 0, msg: '空隙' };
    if (score <= 320) return this._calc('grand', score, 265, 210, 320);
    // >320 保底
    const payout = this.pools.basic;
    this.pools.basic = 50 * this.bet;
    return { tier: 'bonus', payout, msg: '超越 Grand！保底彩金' };
  }

  _calc(tier, score, center, lo, hi) {
    const pool = this.pools[tier];
    const seed = [50, 200, 1000][['basic', 'major', 'grand'].indexOf(tier)] * this.bet;
    if (score === center) {
      const payout = pool * 3;
      this.pools[tier] = seed;
      return { tier, payout, perfect: true, msg: `🎯 精準命中 ${tier.toUpperCase()} 中心！×3` };
    }
    // Segmented payout based on distance percentage
    const halfWidth = (hi - lo) / 2;
    const distPct = Math.abs(score - center) / halfWidth;
    const prizeBase = pool / 7;
    let payout;
    if (distPct <= 0.33) payout = prizeBase * 0.60;
    else if (distPct <= 0.67) payout = prizeBase * 0.30;
    else payout = prizeBase * 0.10;
    this.pools[tier] = Math.max(0, this.pools[tier] - payout);
    const segment = distPct <= 0.33 ? '近段' : distPct <= 0.67 ? '中段' : '遠段';
    return { tier, payout, msg: `${tier.toUpperCase()} ${segment}` };
  }
}
