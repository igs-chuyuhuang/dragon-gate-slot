import { judgeBoard } from './dragonGateJudge.js';
import { calculate } from './payoutCalculator.js';

export const FG_SYMBOLS = ['×2','×3','×5','×10','+15','+30','+60','+90','—'];

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

  scoreSpin(board, bet, bonusSymbol) {
    if (!this.active) return null;
    this.spinsLeft--;
    const judgments = judgeBoard(board);
    const basePayout = calculate(judgments, bet, board);
    let spinScore = basePayout;
    if (basePayout > 0 && bonusSymbol !== '—') {
      if (bonusSymbol.startsWith('×')) spinScore = basePayout * parseInt(bonusSymbol.slice(1));
      else if (bonusSymbol.startsWith('+')) spinScore = basePayout + parseInt(bonusSymbol.slice(1));
    }
    this.totalScore += spinScore;
    if (this.spinsLeft <= 0) this.active = false;
    return { spinScore, bonusSymbol, totalScore: this.totalScore, spinsLeft: this.spinsLeft, judgments };
  }
}
