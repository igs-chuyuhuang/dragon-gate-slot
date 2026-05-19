export function calculate(judgments, betPerRow) {
  let total = 0;
  for (const j of judgments) {
    if (j.type === 'through') total += betPerRow * j.mult;
    else if (j.type === 'wall') total -= betPerRow * 2;
    else if (j.type === 'same-hit') total -= betPerRow * 3;
  }
  return total;
}
