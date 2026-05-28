export function calculate(judgments, bet) {
  const betPerRow = bet / 3;
  let total = 0;
  for (const j of judgments) {
    if (j.type === 'through') total += betPerRow * j.mult;
    else if (j.type === 'wall') total += betPerRow * 1.2;
    else if (j.type === 'same-hit') total -= bet * 3;
  }
  return total;
}
