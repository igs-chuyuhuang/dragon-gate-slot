const SCATTER_RATE = 0.05;

export function spin() {
  const board = [];
  for (let r = 0; r < 3; r++) {
    board[r] = [];
    for (let c = 0; c < 3; c++) {
      if (Math.random() < SCATTER_RATE)
        board[r][c] = { value: 0, isScatter: true };
      else
        board[r][c] = { value: Math.floor(Math.random() * 13) + 1, isScatter: false };
    }
  }
  return board;
}

export function cellToString(cell) {
  if (cell.isScatter) return '🐉';
  const names = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  return names[cell.value];
}
