export function calculate(judgments, bet) {
  const betPerRow = bet / 3;
  let total = 0;
  for (const j of judgments) {
    if (j.type === 'through') total += betPerRow * j.mult;
  }
  return total;
}
