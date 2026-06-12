import { judgeBoard } from './dragonGateJudge.js';

export const FG_SYMBOLS = [0.17, 0.33, 0.5, 0.83, 1.33, 0];

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

  scoreSpin(board, bet, bonusSymbols) {
    if (!this.active) return null;
    this.spinsLeft--;
    const judgments = judgeBoard(board);
    let spinScore = 0;
    for (const j of judgments) {
      if (j.type === 'through') {
        if (board[j.row].some(c => c.isScatter)) continue;
        const mult = bonusSymbols[j.row];
        if (mult > 0) spinScore += Math.round(bet * mult);
      }
    }
    this.totalScore += spinScore;
    if (this.spinsLeft <= 0) this.active = false;
    return { spinScore, bonusSymbols, totalScore: this.totalScore, spinsLeft: this.spinsLeft, judgments };
  }
}
