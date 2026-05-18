using UnityEngine;

namespace DragonGateSlot.Core
{
    public enum CellType { Card, Scatter }

    public struct Cell
    {
        public CellType Type;
        public int Value; // 1(A)~13(K), 0 for Scatter

        public override string ToString() =>
            Type == CellType.Scatter ? "SC" : Value.ToString();
    }

    public class SlotEngine : MonoBehaviour
    {
        const float ScatterRate = 0.05f;
        const int MinCard = 1;
        const int MaxCard = 13;

        Cell[,] _board = new Cell[3, 3]; // [row, col]

        public Cell[,] Board => _board;

        public Cell[,] Spin()
        {
            for (int r = 0; r < 3; r++)
                for (int c = 0; c < 3; c++)
                    _board[r, c] = GenerateCell();
            return _board;
        }

        Cell GenerateCell()
        {
            if (Random.value < ScatterRate)
                return new Cell { Type = CellType.Scatter, Value = 0 };
            return new Cell { Type = CellType.Card, Value = Random.Range(MinCard, MaxCard + 1) };
        }
    }
}
