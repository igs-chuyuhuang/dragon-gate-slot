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
                    return bet * GetPassMultiplier(j.GateWidth);
                case JudgeResult.HitWall:
                    return bet * 1.2f;
                case JudgeResult.SameValueHit:
                    return bet * -3f;
                default: // Miss
                    return 0f;
            }
        }

        static float GetPassMultiplier(int gateWidth)
        {
            if (gateWidth <= 1) return 6f;       // 極窄門 diff=1 → width=0 or 1 inner slots
            if (gateWidth <= 3) return 4f;       // 窄門 diff 2~3
            if (gateWidth <= 7) return 2f;       // 中門 diff 4~7
            return 1f;                            // 寬門 diff 8~11
        }
    }
}
