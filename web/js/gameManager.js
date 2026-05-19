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
    this.scatterCounter = 0;
    // Reel stop state
    this.pendingBoard = null;
    this.revealedCols = [false, false, false];
    this.spinning = false;
  }

  get bet() { return BET_OPTIONS[this.betIndex]; }

  setBetIndex(i) {
    this.betIndex = Math.max(0, Math.min(i, BET_OPTIONS.length - 1));
    this.jp.bet = this.bet;
  }

  canSpin() {
    if (this.spinning) return false;
    if (this.fg.active) return true;
    return this.balance >= this.bet * 3;
  }

  // Start spin: generate board, enter spinning state
  startSpin() {
    if (!this.canSpin()) return null;
    this.pendingBoard = spin();
    this.revealedCols = [false, false, false];
    this.spinning = true;

    if (!this.fg.active) {
      this.balance -= this.bet * 3;
      this.jp.contribute(this.bet * 3);
    }
    return this.pendingBoard;
  }

  // Reveal a column (0=left, 1=mid, 2=right)
  revealCol(col) {
    if (!this.spinning || this.revealedCols[col]) return false;
    this.revealedCols[col] = true;
    if (this.revealedCols.every(Boolean)) return this.settle();
    return true;
  }

  // Reveal all at once
  revealAll() {
    if (!this.spinning) return false;
    this.revealedCols = [true, true, true];
    return this.settle();
  }

  // Settle after all columns revealed
  settle() {
    this.spinning = false;
    const board = this.pendingBoard;

    // Count and accumulate scatters
    const sc = countScatters(board);
    this.scatterCounter += sc;

    const isFG = this.fg.active;

    if (isFG) {
      const spinScore = this.fg.scoreSpin(board);
      // Check FG extension
      let extended = false;
      if (this.scatterCounter >= 3) {
        this.scatterCounter -= 3;
        extended = this.fg.extend();
        if (extended) this.fg.active = true; // re-activate if was about to end
      }
      const fgDone = !this.fg.active;
      let jpResult = null;
      if (fgDone) {
        jpResult = this.jp.evalJpGate(this.fg.totalScore);
        this.balance += jpResult.payout;
      }
      return { board, mode: 'fg', spinScore, totalScore: this.fg.totalScore, spinsLeft: this.fg.spinsLeft, fgDone, jpResult, scatterCount: sc, extended };
    }

    // Normal game
    const judgments = judgeBoard(board);
    const totalPayout = calculate(judgments, this.bet);
    this.balance += totalPayout;

    // Check FG trigger
    let fgTriggered = false;
    if (this.scatterCounter >= 3) {
      this.scatterCounter -= 3;
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
