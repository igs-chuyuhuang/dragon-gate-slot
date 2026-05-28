"""
波動性調整蒙地卡羅模擬 v2
- 確認目前基礎 RTP 問題
- 提出 RTP ~96% 的調整方案
"""
import random
import statistics
import json

SPINS = 1_000_000
BET = 30
BET_PER_ROW = BET / 3
SYMBOLS = 13


def judge_row(left, mid, right):
    if left == right:
        if mid == left: return 'same-hit'
        return 'same-miss'
    lo, hi = min(left, right), max(left, right)
    gap = hi - lo - 1
    if mid == lo or mid == hi: return ('wall', gap)
    if lo < mid < hi: return ('through', gap)
    return 'miss'


def spin_current():
    """目前機制"""
    net = -BET
    for _ in range(3):
        l, m, r = random.randint(1,SYMBOLS), random.randint(1,SYMBOLS), random.randint(1,SYMBOLS)
        res = judge_row(l, m, r)
        if isinstance(res, tuple):
            if res[0] == 'wall': net += BET_PER_ROW * 1.2
            elif res[0] == 'through':
                gap = res[1]
                if gap <= 1: mult = 6
                elif gap <= 3: mult = 4
                elif gap <= 7: mult = 2
                else: mult = 1
                net += BET_PER_ROW * mult
        elif res == 'same-hit': net -= BET * 3
    return net


def spin_B2():
    """方案B2: 穿門高賠率 (極窄8x,窄5x,中3x,寬1.5x) + 碰壁+1.2 + same-hit-1x
    目標: 高波動, RTP~96%"""
    net = -BET
    for _ in range(3):
        l, m, r = random.randint(1,SYMBOLS), random.randint(1,SYMBOLS), random.randint(1,SYMBOLS)
        res = judge_row(l, m, r)
        if isinstance(res, tuple):
            if res[0] == 'wall': net += BET_PER_ROW * 1.2
            elif res[0] == 'through':
                gap = res[1]
                if gap <= 1: mult = 8
                elif gap <= 3: mult = 5
                elif gap <= 7: mult = 3
                else: mult = 1.5
                net += BET_PER_ROW * mult
        elif res == 'same-hit': net -= BET * 1
    return net


def spin_C():
    """方案C: 碰壁改+2x(正面回報) + 穿門維持6/4/2/1 + same-hit-1x
    目標: 碰壁不再是懲罰"""
    net = -BET
    for _ in range(3):
        l, m, r = random.randint(1,SYMBOLS), random.randint(1,SYMBOLS), random.randint(1,SYMBOLS)
        res = judge_row(l, m, r)
        if isinstance(res, tuple):
            if res[0] == 'wall': net += BET_PER_ROW * 2.0
            elif res[0] == 'through':
                gap = res[1]
                if gap <= 1: mult = 6
                elif gap <= 3: mult = 4
                elif gap <= 7: mult = 2
                else: mult = 1
                net += BET_PER_ROW * mult
        elif res == 'same-hit': net -= BET * 1
    return net


def spin_E2():
    """方案E2(推薦): 高波動組合
    - 碰壁: +2x (正面! 差一點也有獎)
    - 穿門: 極窄10x, 窄6x, 中3x, 寬1.5x (大贏機會)
    - same-hit: 0 (不額外扣, 已扣的bet/3就是代價)
    - miss/same-miss: 0
    """
    net = -BET
    for _ in range(3):
        l, m, r = random.randint(1,SYMBOLS), random.randint(1,SYMBOLS), random.randint(1,SYMBOLS)
        res = judge_row(l, m, r)
        if isinstance(res, tuple):
            if res[0] == 'wall': net += BET_PER_ROW * 2.0
            elif res[0] == 'through':
                gap = res[1]
                if gap <= 1: mult = 10
                elif gap <= 3: mult = 6
                elif gap <= 7: mult = 3
                else: mult = 1.5
                net += BET_PER_ROW * mult
        elif res == 'same-hit': net += 0  # 不額外扣
    return net


def spin_F():
    """方案F: 保守高波動
    - 碰壁: +1.8x
    - 穿門: 極窄8x, 窄5x, 中2.5x, 寬1.2x
    - same-hit: 0 (不額外扣)
    - 目標 RTP ~94-96%
    """
    net = -BET
    for _ in range(3):
        l, m, r = random.randint(1,SYMBOLS), random.randint(1,SYMBOLS), random.randint(1,SYMBOLS)
        res = judge_row(l, m, r)
        if isinstance(res, tuple):
            if res[0] == 'wall': net += BET_PER_ROW * 1.8
            elif res[0] == 'through':
                gap = res[1]
                if gap <= 1: mult = 8
                elif gap <= 3: mult = 5
                elif gap <= 7: mult = 2.5
                else: mult = 1.2
                net += BET_PER_ROW * mult
        elif res == 'same-hit': net += 0
    return net


def analyze(spin_func, label):
    results = []
    win_count = 0
    ten_spin_changes = []
    ten_sum = 0
    consecutive_wins = []
    consecutive_losses = []
    streak = 0
    streak_type = None

    for i in range(SPINS):
        net = spin_func()
        results.append(net)
        if net > 0: win_count += 1

        # streaks
        t = 'win' if net > 0 else 'loss'
        if t == streak_type:
            streak += 1
        else:
            if streak_type == 'win' and streak > 0: consecutive_wins.append(streak)
            elif streak_type == 'loss' and streak > 0: consecutive_losses.append(streak)
            streak = 1
            streak_type = t

        ten_sum += net
        if (i+1) % 10 == 0:
            ten_spin_changes.append(ten_sum)
            ten_sum = 0

    # 10K players × 100 spins
    b100 = []
    for _ in range(10000):
        b = 0
        for _ in range(100): b += spin_func()
        b100.append(b)

    avg = statistics.mean(results)
    rtp = (BET + avg) / BET
    std = statistics.stdev(results)
    ten_pos = sum(1 for x in ten_spin_changes if x > 0) / len(ten_spin_changes) * 100
    ten_std = statistics.stdev(ten_spin_changes)
    b100_profit = sum(1 for x in b100 if x > 0) / len(b100) * 100
    b100_std = statistics.stdev(b100)
    avg_wstreak = statistics.mean(consecutive_wins) if consecutive_wins else 0
    max_wstreak = max(consecutive_wins) if consecutive_wins else 0
    avg_lstreak = statistics.mean(consecutive_losses) if consecutive_losses else 0
    max_lstreak = max(consecutive_losses) if consecutive_losses else 0

    s = {
        'label': label, 'rtp': round(rtp*100, 2),
        'avg_net': round(avg, 2), 'std_spin': round(std, 2),
        'win_rate': round(win_count/SPINS*100, 1),
        'ten_pos_pct': round(ten_pos, 1), 'ten_std': round(ten_std, 1),
        'avg_win_streak': round(avg_wstreak, 1), 'max_win_streak': max_wstreak,
        'avg_loss_streak': round(avg_lstreak, 1), 'max_loss_streak': max_lstreak,
        'b100_profit_pct': round(b100_profit, 1), 'b100_std': round(b100_std, 0),
    }
    print(f"\n{'='*60}")
    print(f"  {label}")
    print(f"{'='*60}")
    print(f"  RTP: {s['rtp']}% | 每轉淨值: {s['avg_net']} | σ/spin: {s['std_spin']}")
    print(f"  單轉贏率: {s['win_rate']}% | 10轉正收益: {s['ten_pos_pct']}% | 10轉σ: {s['ten_std']}")
    print(f"  連贏 avg/max: {s['avg_win_streak']}/{s['max_win_streak']} | 連輸 avg/max: {s['avg_loss_streak']}/{s['max_loss_streak']}")
    print(f"  100轉獲利率: {s['b100_profit_pct']}% | 100轉σ: {s['b100_std']}")
    return s


if __name__ == '__main__':
    all_stats = []
    all_stats.append(analyze(spin_current, "目前機制"))
    all_stats.append(analyze(spin_B2, "B2: 穿門8/5/3/1.5x + same-hit-1x"))
    all_stats.append(analyze(spin_C, "C: 碰壁+2x + same-hit-1x"))
    all_stats.append(analyze(spin_E2, "E2: 碰壁+2x + 穿門10/6/3/1.5x + same-hit不扣"))
    all_stats.append(analyze(spin_F, "F: 碰壁+1.8x + 穿門8/5/2.5/1.2x + same-hit不扣"))

    with open('math/volatility_sim_results.json', 'w') as f:
        json.dump(all_stats, f, indent=2, ensure_ascii=False)
    print("\n\n結果已存到 math/volatility_sim_results.json")
