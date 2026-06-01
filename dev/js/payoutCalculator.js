export function calculate(judgments, bet, board) {
  const betPerRow = bet / 3;
  let total = 0;
  for (const j of judgments) {
    if (j.type === 'through') {
      const rowHasScatter = board[j.row].some(c => c.isScatter);
      if (!rowHasScatter) total += betPerRow * j.mult;
    }
  }
  return total;
}
