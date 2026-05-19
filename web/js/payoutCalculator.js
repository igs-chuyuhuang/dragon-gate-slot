import { JudgeResult } from './dragonGateJudge.js';

export function calculate(judgments, bet) {
  return judgments.reduce((total, j) => total + calculateRow(j, bet), 0);
}

function calculateRow(j, bet) {
  switch (j.result) {
    case JudgeResult.Pass: return bet * getPassMultiplier(j.gap);
    case JudgeResult.HitWall: return bet * 1.2;
    case JudgeResult.SameValueHit: return bet * -3;
    default: return 0;
  }
}

function getPassMultiplier(gap) {
  if (gap <= 2) return 6;   // 極窄門 gap=2
  if (gap <= 4) return 4;   // 窄門 gap 3~4
  if (gap <= 8) return 2;   // 中門 gap 5~8
  return 1;                  // 寬門 gap 9~12
}
