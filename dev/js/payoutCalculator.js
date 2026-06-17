export function calculate(judgments, bet, board) {
  const betPerRow = bet / 3;
  let net = 0;
  for (const j of judgments) {
    const rowHasScatter = board[j.row].some(c => c.isScatter);
    if (rowHasScatter) continue; // scatter rows: no win/loss
    if (j.type === 'through') {
      net += betPerRow * j.mult; // pure win, no deduction
    } else {
      net -= betPerRow; // wall/miss/same-hit: lose stake
    }
  }
  return net;
}
