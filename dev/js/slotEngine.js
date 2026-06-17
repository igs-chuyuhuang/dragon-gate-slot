const SCATTER_RATE = 0.05;
const MISS_BIAS = 0.25;

export function spin(fgMode = false) {
  const board = [];
  for (let r = 0; r < 3; r++) {
    board[r] = [];
    for (let c = 0; c < 3; c++) {
      const isScatter = !fgMode && Math.random() < SCATTER_RATE;
      board[r][c] = isScatter
        ? { value: null, isScatter: true }
        : { value: Math.floor(Math.random() * 13) + 1, isScatter: false };
    }
    if (!fgMode && !board[r][0].isScatter && !board[r][2].isScatter) {
      const l = board[r][0].value, ri = board[r][2].value;
      if (l !== ri && Math.random() < MISS_BIAS) {
        const lo = Math.min(l, ri), hi = Math.max(l, ri);
        const outside = [];
        for (let v = 1; v <= 13; v++) { if (v < lo || v > hi) outside.push(v); }
        if (outside.length > 0) {
          board[r][1] = { value: outside[Math.floor(Math.random() * outside.length)], isScatter: false };
        }
      }
    }
  }
  return board;
}

export function cellToString(cell) {
  const names = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  return cell.isScatter ? names[cell.value] + '🐉' : names[cell.value];
}

export function countScatters(board) {
  let n = 0;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (board[r][c].isScatter) n++;
  return n;
}
