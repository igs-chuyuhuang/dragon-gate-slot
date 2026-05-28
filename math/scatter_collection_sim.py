"""
Scatter 累積收集制 蒙地卡羅模擬
- 盤面 3×3 = 9 格
- 每格 Scatter 出現率: 可調 (default 5%)
- 每轉 3 row 判定: 穿門/碰壁/同值撞柱
- 累積燈號: Scatter +1, 碰壁 -1, 同值撞柱 -2
- 累積到門檻觸發 Bonus，歸零
"""
import random
import statistics
from collections import defaultdict

SIMULATIONS = 2_000_000  # 每個配置跑 200 萬轉
THRESHOLDS = [5, 8, 10, 12, 15]
SCATTER_RATES = [0.03, 0.04, 0.05, 0.06, 0.07]

# 遊戲參數
GRID_ROWS = 3
GRID_COLS = 3
# 碰壁機率 per row: 15.4%
WALL_HIT_RATE = 0.154
# 同值撞柱機率 per row: 0.59%
SAME_VALUE_PILLAR_RATE = 0.0059


def simulate(threshold, scatter_rate, num_spins):
    """模擬累積收集制，回傳每次觸發所需轉數列表"""
    triggers = []
    meter = 0
    spins_since_last = 0

    for _ in range(num_spins):
        spins_since_last += 1

        # Scatter 出現數 (9 格各自獨立)
        scatter_count = sum(1 for _ in range(GRID_ROWS * GRID_COLS) if random.random() < scatter_rate)
        meter += scatter_count

        # 碰壁扣燈 (3 row 各自判定)
        wall_hits = sum(1 for _ in range(GRID_ROWS) if random.random() < WALL_HIT_RATE)
        meter -= wall_hits

        # 同值撞柱扣燈 (3 row 各自判定, 每次 -2)
        pillar_hits = sum(1 for _ in range(GRID_ROWS) if random.random() < SAME_VALUE_PILLAR_RATE)
        meter -= pillar_hits * 2

        # 燈號不能低於 0
        meter = max(0, meter)

        # 檢查是否觸發
        if meter >= threshold:
            triggers.append(spins_since_last)
            meter = 0
            spins_since_last = 0

    return triggers


def run_all():
    results = {}

    # 1. 不同門檻 (固定 scatter_rate=5%)
    print("=== 不同門檻分析 (Scatter Rate = 5%) ===")
    for th in THRESHOLDS:
        triggers = simulate(th, 0.05, SIMULATIONS)
        if triggers:
            avg = statistics.mean(triggers)
            med = statistics.median(triggers)
            p25 = sorted(triggers)[len(triggers) // 4]
            p75 = sorted(triggers)[len(triggers) * 3 // 4]
            count = len(triggers)
        else:
            avg = med = p25 = p75 = float('inf')
            count = 0
        results[('threshold', th, 0.05)] = {
            'avg': avg, 'median': med, 'p25': p25, 'p75': p75,
            'count': count, 'freq': SIMULATIONS / count if count else float('inf')
        }
        print(f"  門檻={th:2d}: 平均{avg:7.1f}轉 | 中位數{med:6.0f} | P25={p25} P75={p75} | 觸發{count}次 | 頻率≈{SIMULATIONS/count if count else 0:.0f}轉/次")

    # 2. 不同 Scatter Rate × 門檻
    print("\n=== Scatter Rate × 門檻 交叉分析 ===")
    for sr in SCATTER_RATES:
        for th in THRESHOLDS:
            if ('threshold', th, sr) in results:
                continue
            triggers = simulate(th, sr, SIMULATIONS)
            if triggers:
                avg = statistics.mean(triggers)
                count = len(triggers)
            else:
                avg = float('inf')
                count = 0
            results[('threshold', th, sr)] = {
                'avg': avg, 'count': count,
                'freq': SIMULATIONS / count if count else float('inf')
            }
        print(f"  SR={sr*100:.0f}%: " + " | ".join(
            f"門檻{th}={results[('threshold', th, sr)]['avg']:.0f}轉"
            for th in THRESHOLDS
        ))

    # 3. 無扣燈對照組 (純累積)
    print("\n=== 無扣燈對照組 (Scatter Rate = 5%) ===")
    for th in THRESHOLDS:
        # 純累積: 每轉期望 +0.45, 無扣除
        # 理論值: th / 0.45
        theoretical = th / 0.45
        triggers_no_deduct = []
        meter = 0
        spins = 0
        for _ in range(SIMULATIONS):
            spins += 1
            scatter_count = sum(1 for _ in range(9) if random.random() < 0.05)
            meter += scatter_count
            if meter >= th:
                triggers_no_deduct.append(spins)
                meter = 0
                spins = 0
        avg_no = statistics.mean(triggers_no_deduct) if triggers_no_deduct else float('inf')
        avg_with = results[('threshold', th, 0.05)]['avg']
        impact = ((avg_with - avg_no) / avg_no * 100) if avg_no != float('inf') else 0
        results[('no_deduct', th)] = {'avg': avg_no, 'theoretical': theoretical, 'impact_pct': impact}
        print(f"  門檻={th:2d}: 無扣燈={avg_no:.1f}轉 | 有扣燈={avg_with:.1f}轉 | 扣燈影響=+{impact:.1f}%")

    return results


if __name__ == '__main__':
    results = run_all()

    # 輸出 JSON 供報告使用
    import json
    output = {}
    for key, val in results.items():
        str_key = str(key)
        output[str_key] = val
    with open('math/scatter_sim_results.json', 'w') as f:
        json.dump(output, f, indent=2, default=str)
    print("\n結果已存到 math/scatter_sim_results.json")
