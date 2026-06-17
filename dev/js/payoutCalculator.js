export function calculate(judgments, bet, board) {
  const betPerRow = bet / 3;
  let winnings = 0;
  let refund = 0;
  for (const j of judgments) {
    const rowHasScatter = board[j.row].some(c => c.isScatter);
    if (rowHasScatter) continue;
    if (j.type === 'through') {
      winnings += betPerRow * j.mult;
      refund += betPerRow;
    }
  }
  return { winnings, refund, total: winnings + refund };
}
