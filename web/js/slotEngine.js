const SCATTER_RATE = 0.05;
const MIN_CARD = 1;
const MAX_CARD = 13;

export const CellType = { Card: 'Card', Scatter: 'Scatter' };

export function createCell(type, value) {
  return { type, value };
}

export function cellToString(cell) {
  if (cell.type === CellType.Scatter) return 'SC';
  const names = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  return names[cell.value];
}

export function spin() {
  const board = [];
  for (let r = 0; r < 3; r++) {
    board[r] = [];
    for (let c = 0; c < 3; c++) {
      board[r][c] = generateCell();
    }
  }
  return board;
}

function generateCell() {
  if (Math.random() < SCATTER_RATE)
    return createCell(CellType.Scatter, 0);
  return createCell(CellType.Card, Math.floor(Math.random() * MAX_CARD) + MIN_CARD);
}
