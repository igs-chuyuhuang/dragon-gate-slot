namespace DragonGateSlot.Core
{
    public static class PayoutCalculator
    {
        /// <summary>Calculate total payout for one spin. Returns net amount (can be negative for same-value hit).</summary>
        public static float Calculate(RowJudgment[] judgments, float bet)
        {
            float total = 0f;
            for (int i = 0; i < judgments.Length; i++)
                total += CalculateRow(judgments[i], bet);
            return total;
        }

        static float CalculateRow(RowJudgment j, float bet)
        {
            switch (j.Result)
            {
                case JudgeResult.Pass:
                    return bet * GetPassMultiplier(j.Gap);
                case JudgeResult.HitWall:
                    return bet * 1.2f;
                case JudgeResult.SameValueHit:
                    return bet * -3f;
                default: // Miss
                    return 0f;
            }
        }

        static float GetPassMultiplier(int gap)
        {
            if (gap <= 2) return 6f;       // 極窄門 gap=2
            if (gap <= 4) return 4f;       // 窄門 gap 3~4
            if (gap <= 8) return 2f;       // 中門 gap 5~8
            return 1f;                      // 寬門 gap 9~12
        }
    }
}
