import { judgeBoard } from './dragonGateJudge.js';
import { calculate } from './payoutCalculator.js';

const MULTIPLIERS = [2, 3, 5, 10];

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
    if (!this.active) return null;
    this.spinsLeft--;
    const multiplier = MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)];
    const judgments = judgeBoard(board);
    const basePayout = calculate(judgments, bet, board);
    const spinScore = basePayout * multiplier;
    this.totalScore += spinScore;
    if (this.spinsLeft <= 0) this.active = false;
    return { spinScore, multiplier, totalScore: this.totalScore, spinsLeft: this.spinsLeft, judgments };
  }
}
