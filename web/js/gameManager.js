import { spin } from './slotEngine.js';
import { judgeBoard } from './dragonGateJudge.js';
import { calculate } from './payoutCalculator.js';
import { FreeGame } from './freeGame.js';
import { JpSystem } from './jpSystem.js';

const BET_OPTIONS = [5, 10, 20, 50, 100];

export class GameManager {
  constructor() {
    this.balance = 1000;
    this.betIndex = 1;
    this.fg = new FreeGame();
    this.jp = new JpSystem(this.bet);
  }

  get bet() { return BET_OPTIONS[this.betIndex]; }

  setBetIndex(i) {
    this.betIndex = Math.max(0, Math.min(i, BET_OPTIONS.length - 1));
    this.jp.bet = this.bet;
  }

  canSpin() {
    if (this.fg.active) return true;
    return this.balance >= this.bet * 3;
  }

  executeSpin() {
    if (!this.canSpin()) return null;

    const board = spin();
    const isFG = this.fg.active;

    if (isFG) {
      // Free Game spin: no bet, no JP contribution, just score
      const spinScore = this.fg.scoreSpin(board);
      const fgDone = !this.fg.active;
      let jpResult = null;
      if (fgDone) {
        jpResult = this.jp.evalJpGate(this.fg.totalScore);
        this.balance += jpResult.payout;
      }
      return { board, mode: 'fg', spinScore, totalScore: this.fg.totalScore, spinsLeft: this.fg.spinsLeft, fgDone, jpResult };
    }

    // Normal spin
    const betPerRow = this.bet;
    this.balance -= betPerRow * 3;
    this.jp.contribute(betPerRow * 3);

    const judgments = judgeBoard(board);
    const totalPayout = calculate(judgments, betPerRow);
    this.balance += totalPayout;

    // Check scatter trigger
    let scatterCount = 0;
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        if (board[r][c].isScatter) scatterCount++;

    let fgTriggered = false;
    if (scatterCount >= 3) {
      this.fg.start();
      fgTriggered = true;
    }

    return { board, mode: 'normal', judgments, totalPayout, scatterCount, fgTriggered };
  }
}
