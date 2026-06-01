import { spin, countScatters } from './slotEngine.js';
import { judgeBoard } from './dragonGateJudge.js';
import { calculate } from './payoutCalculator.js';
import { FreeGame } from './freeGame.js';
import { JpSystem } from './jpSystem.js';

const BET_OPTIONS = [15, 30, 60, 150, 300];
const SCATTER_LAMP_THRESHOLD = 10;

export class GameManager {
  constructor() {
    this.balance = 1000;
    this.betIndex = 1;
    this.scatterLamps = 0;
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
    return this.balance >= this.bet;
  }

  executeSpin() {
    if (!this.canSpin()) return null;

    const isFG = this.fg.active;
    const board = spin(isFG);

    if (!isFG) {
      this.balance -= this.bet;
      this.jp.contribute(this.bet);
    }

    if (isFG) {
      const spinScore = this.fg.scoreSpin(board, this.bet);
      const fgDone = !this.fg.active;
      let jpResult = null;
      if (fgDone) {
        jpResult = this.jp.evalJpGate(this.fg.totalScore);
        this.balance += this.fg.totalScore + jpResult.payout;
      }
      return { board, mode: 'fg', spinScore, totalScore: this.fg.totalScore, spinsLeft: this.fg.spinsLeft, fgDone, jpResult };
    }

    // Normal mode
    const judgments = judgeBoard(board);
    const totalPayout = calculate(judgments, this.bet, board);
    this.balance += totalPayout;

    // Scatter lamp accumulation
    const sc = countScatters(board);
    let lampDelta = sc; // each scatter +1
    for (const j of judgments) {
      if (j.lampChange) lampDelta += j.lampChange;
    }
    this.scatterLamps = Math.max(0, this.scatterLamps + lampDelta);

    // Check FG trigger
    let fgTriggered = false;
    if (this.scatterLamps >= SCATTER_LAMP_THRESHOLD) {
      this.scatterLamps = 0;
      this.fg.start();
      fgTriggered = true;
    }

    return { board, mode: 'normal', judgments, totalPayout, scatterCount: sc, fgTriggered, scatterLamps: this.scatterLamps, lampDelta };
  }

  triggerFreeGame() {
    if (!this.fg.active) { this.fg.start(); return true; }
    return false;
  }
}
