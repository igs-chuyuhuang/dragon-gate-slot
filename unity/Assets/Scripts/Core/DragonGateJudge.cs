namespace DragonGateSlot.Core
{
    public enum JudgeResult { Pass, HitWall, Miss, SameValueHit }

    public struct RowJudgment
    {
        public int Row;
        public JudgeResult Result;
        public int Gap; // hi - lo, meaningful only for Pass
        public bool HasScatter; // any cell in this row is Scatter
    }

    public static class DragonGateJudge
    {
        /// <summary>Judge all 3 rows. Returns array of 3 RowJudgments.</summary>
        public static RowJudgment[] JudgeBoard(Cell[,] board)
        {
            var results = new RowJudgment[3];
            for (int r = 0; r < 3; r++)
                results[r] = JudgeRow(r, board[r, 0], board[r, 1], board[r, 2]);
            return results;
        }

        static RowJudgment JudgeRow(int row, Cell left, Cell mid, Cell right)
        {
            var j = new RowJudgment { Row = row };
            j.HasScatter = left.Type == CellType.Scatter ||
                           mid.Type == CellType.Scatter ||
                           right.Type == CellType.Scatter;

            // If any cell is Scatter, this row is not judged (treated as miss)
            if (j.HasScatter)
            {
                j.Result = JudgeResult.Miss;
                return j;
            }

            int l = left.Value, m = mid.Value, r2 = right.Value;

            // Same-value gate
            if (l == r2)
            {
                j.Result = (m == l) ? JudgeResult.SameValueHit : JudgeResult.Miss;
                return j;
            }

            // Normal gate
            int lo = l < r2 ? l : r2;
            int hi = l > r2 ? l : r2;

            if (m == lo || m == hi)
            {
                j.Result = JudgeResult.HitWall;
            }
            else if (m > lo && m < hi)
            {
                j.Result = JudgeResult.Pass;
                j.Gap = hi - lo;
            }
            else
            {
                j.Result = JudgeResult.Miss;
            }
            return j;
        }
    }
}
