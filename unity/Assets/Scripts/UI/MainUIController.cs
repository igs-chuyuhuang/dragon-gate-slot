using UnityEngine;
using UnityEngine.UI;
using DragonGateSlot.Core;

namespace DragonGateSlot.UI
{
    public class MainUIController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] GameManager _gameManager;

        [Header("Board Display (3x3)")]
        [SerializeField] Text[] _cellTexts = new Text[9]; // row-major: [0,1,2],[3,4,5],[6,7,8]

        [Header("Info Display")]
        [SerializeField] Text _balanceText;
        [SerializeField] Text _betText;
        [SerializeField] Text _winText;
        [SerializeField] Text _resultText; // per-row judgments

        [Header("Buttons")]
        [SerializeField] Button _spinButton;
        [SerializeField] Button _betUpButton;
        [SerializeField] Button _betDownButton;

        static readonly float[] BetOptions = { 5f, 10f, 20f, 50f, 100f };
        int _betIndex = 1; // default 10

        void Start()
        {
            _spinButton.onClick.AddListener(OnSpinClicked);
            _betUpButton.onClick.AddListener(OnBetUp);
            _betDownButton.onClick.AddListener(OnBetDown);
            RefreshUI();
        }

        void OnSpinClicked()
        {
            var result = _gameManager.ExecuteSpin();
            if (result == null) return;

            DisplayBoard(result.Board);
            DisplayJudgments(result.Judgments);
            _winText.text = result.Payout >= 0 ? $"+{result.Payout:F0}" : $"{result.Payout:F0}";
            RefreshUI();
        }

        void OnBetUp()
        {
            if (_betIndex < BetOptions.Length - 1)
            {
                _betIndex++;
                _gameManager.SetBet(BetOptions[_betIndex]);
                RefreshUI();
            }
        }

        void OnBetDown()
        {
            if (_betIndex > 0)
            {
                _betIndex--;
                _gameManager.SetBet(BetOptions[_betIndex]);
                RefreshUI();
            }
        }

        void RefreshUI()
        {
            _balanceText.text = $"Balance: {_gameManager.Balance:F0}";
            _betText.text = $"Bet: {_gameManager.Bet:F0}";
            // Disable spin if balance insufficient (need bet + 3*bet reserve for same-value)
            _spinButton.interactable = _gameManager.Balance >= _gameManager.Bet;
        }

        void DisplayBoard(Cell[,] board)
        {
            for (int r = 0; r < 3; r++)
                for (int c = 0; c < 3; c++)
                    _cellTexts[r * 3 + c].text = CellToString(board[r, c]);
        }

        void DisplayJudgments(RowJudgment[] judgments)
        {
            string s = "";
            for (int i = 0; i < judgments.Length; i++)
            {
                var j = judgments[i];
                string label = j.Result switch
                {
                    JudgeResult.Pass => $"穿門 (x{GetMultiplier(j.GateWidth)})",
                    JudgeResult.HitWall => "碰壁 (x1.2)",
                    JudgeResult.SameValueHit => "同值命中 (-3x)",
                    _ => "未穿"
                };
                s += $"Row {i + 1}: {label}\n";
            }
            _resultText.text = s;
        }

        static string CellToString(Cell cell) =>
            cell.Type == CellType.Scatter ? "龍" : cell.Value switch
            {
                1 => "A", 11 => "J", 12 => "Q", 13 => "K",
                _ => cell.Value.ToString()
            };

        static float GetMultiplier(int gateWidth) =>
            gateWidth <= 1 ? 6f : gateWidth <= 3 ? 4f : gateWidth <= 7 ? 2f : 1f;
    }
}
