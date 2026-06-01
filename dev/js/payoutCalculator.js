export function calculate(judgments, bet) {
  let total = 0;
  for (const j of judgments) {
    if (j.type === 'through') total += bet * j.mult;
  }
  return total;
}
