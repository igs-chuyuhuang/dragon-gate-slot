const SCATTER_RATE = 0.05;

export function spin(fgMode = false) {
  const board = [];
  for (let r = 0; r < 3; r++) {
    board[r] = [];
    for (let c = 0; c < 3; c++)
      board[r][c] = { value: Math.floor(Math.random() * 13) + 1, isScatter: !fgMode && Math.random() < SCATTER_RATE };
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
