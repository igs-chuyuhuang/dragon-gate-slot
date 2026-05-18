using UnityEngine;

namespace DragonGateSlot.Core
{
    public class SpinResult
    {
        public Cell[,] Board;
        public RowJudgment[] Judgments;
        public float Payout;
    }

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

        public void SetBet(float bet) => _bet = bet;

        /// <summary>Execute a spin and return results for UI display. Returns null if cannot spin.</summary>
        public SpinResult ExecuteSpin()
        {
            if (_balance < _bet)
                return null;

            _balance -= _bet;

            var board = _slotEngine.Spin();
            var judgments = DragonGateJudge.JudgeBoard(board);
            float payout = PayoutCalculator.Calculate(judgments, _bet);
            _balance += payout;

            return new SpinResult { Board = board, Judgments = judgments, Payout = payout };
        }
    }
}
