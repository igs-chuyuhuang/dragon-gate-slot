import { JudgeResult } from './dragonGateJudge.js';

export function calculate(judgments, bet) {
  const sumMult = judgments.reduce((s, j) => s + getMultiplier(j), 0);
  return sumMult / 3 * bet;
}

function getMultiplier(j) {
  switch (j.result) {
    case JudgeResult.Pass: return getPassMultiplier(j.gap);
    case JudgeResult.HitWall: return 1.2;
    case JudgeResult.SameValueHit: return -3.0;
    default: return 0;
  }
}

function getPassMultiplier(gap) {
  if (gap <= 1) return 6;   // 極窄門 gap=1
  if (gap <= 3) return 4;   // 窄門 gap 2~3
  if (gap <= 7) return 2;   // 中門 gap 4~7
  return 1;                  // 寬門 gap 8~11
}
