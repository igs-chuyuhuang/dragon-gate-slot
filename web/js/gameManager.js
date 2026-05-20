import { spin, countScatters } from './slotEngine.js';
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
    return this.balance >= this.bet * 6;
  }

  executeSpin() {
    if (!this.canSpin()) return null;

    const board = spin();
    const isFG = this.fg.active;

    if (!isFG) {
      this.balance -= this.bet * 3;
      this.jp.contribute(this.bet * 3);
    }

    const sc = countScatters(board);

    if (isFG) {
      const spinScore = this.fg.scoreSpin(board);
      let extended = false;
      if (sc >= 3) extended = this.fg.extend();
      if (extended) this.fg.active = true;
      const fgDone = !this.fg.active;
      let jpResult = null;
      if (fgDone) {
        jpResult = this.jp.evalJpGate(this.fg.totalScore);
        this.balance += jpResult.payout;
      }
      return { board, mode: 'fg', spinScore, totalScore: this.fg.totalScore, spinsLeft: this.fg.spinsLeft, fgDone, jpResult, scatterCount: sc, extended };
    }

    const judgments = judgeBoard(board);
    const totalPayout = calculate(judgments, this.bet);
    this.balance += totalPayout;

    let fgTriggered = false;
    if (sc >= 3) {
      this.fg.start();
      fgTriggered = true;
    }

    return { board, mode: 'normal', judgments, totalPayout, scatterCount: sc, fgTriggered };
  }

  triggerFreeGame() {
    if (!this.fg.active) { this.fg.start(); return true; }
    return false;
  }
}
