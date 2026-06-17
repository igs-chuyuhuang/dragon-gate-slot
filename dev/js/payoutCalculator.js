export function calculate(judgments, bet, board) {
  const betPerRow = bet / 3;
  let total = 0;
  for (const j of judgments) {
    const rowHasScatter = board[j.row].some(c => c.isScatter);
    if (rowHasScatter) continue;
    if (j.type === 'through') {
      total += betPerRow * j.mult + betPerRow; // 倍率獎勵 + 歸還本金
    }
    // 非穿門: 不歸還（已扣）
  }
  return total;
}
