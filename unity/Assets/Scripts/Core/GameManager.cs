using UnityEngine;

namespace DragonGateSlot.Core
{
    public class GameManager : MonoBehaviour
    {
        [SerializeField] float _balance = 1000f;
        [SerializeField] float _bet = 10f;

        SlotEngine _slotEngine;

        public float Balance => _balance;
        public float Bet => _bet;

        void Awake()
        {
            _slotEngine = GetComponent<SlotEngine>();
            if (_slotEngine == null)
                _slotEngine = gameObject.AddComponent<SlotEngine>();
        }

        void Update()
        {
            if (Input.GetKeyDown(KeyCode.Space))
                TrySpin();
        }

        public bool TrySpin()
        {
            // Check balance: need at least bet + 3*bet for potential same-value penalty
            if (_balance < _bet)
            {
                Debug.Log("[DragonGate] Insufficient balance.");
                return false;
            }

            // Deduct bet
            _balance -= _bet;

            // Spin
            var board = _slotEngine.Spin();
            LogBoard(board);

            // Judge
            var judgments = DragonGateJudge.JudgeBoard(board);

            // Calculate payout
            float payout = PayoutCalculator.Calculate(judgments, _bet);

            // Update balance
            _balance += payout;

            // Log results
            for (int i = 0; i < judgments.Length; i++)
            {
                var j = judgments[i];
                Debug.Log($"[Row {j.Row}] {j.Result} (GateWidth={j.GateWidth})");
            }
            Debug.Log($"[DragonGate] Payout: {payout:+0.##;-0.##;0} | Balance: {_balance:F2}");

            return true;
        }

        void LogBoard(Cell[,] board)
        {
            string s = "[DragonGate] Board:\n";
            for (int r = 0; r < 3; r++)
                s += $"  [{board[r, 0]}] [{board[r, 1]}] [{board[r, 2]}]\n";
            Debug.Log(s);
        }
    }
}
