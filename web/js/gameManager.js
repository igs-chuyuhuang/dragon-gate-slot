import { spin } from './slotEngine.js';
import { judgeBoard } from './dragonGateJudge.js';
import { calculate } from './payoutCalculator.js';

const BET_OPTIONS = [5, 10, 20, 50, 100];

export class GameManager {
  constructor() {
    this.balance = 1000;
    this.betIndex = 1;
  }

  get bet() { return BET_OPTIONS[this.betIndex]; }

  setBetIndex(i) {
    this.betIndex = Math.max(0, Math.min(i, BET_OPTIONS.length - 1));
  }

  canSpin() {
    return this.balance >= this.bet * 3;
  }

  executeSpin() {
    if (!this.canSpin()) return null;

    this.balance -= this.bet;
    const board = spin();
    const { judgments, scatterCount } = judgeBoard(board);
    const payout = calculate(judgments, this.bet);
    this.balance += payout;

    return { board, judgments, payout, scatterCount };
  }
}
