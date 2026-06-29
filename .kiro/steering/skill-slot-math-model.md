# Slot 數學模型設計

## 核心參數

| 參數 | MG | FG | BG |
|------|-----|-----|-----|
| MISS_BIAS | 20% | 30% | N/A |
| SCATTER_RATE | 5% | N/A | N/A |
| 穿門倍率 | 10/5/2/1 | N/A | ×1 |
| 獎勵池 | — | [0.2,0.33,0.5,1.0,1.5,0] | — |
| 初始/保底 | — | — | bet×2 |

## 穿門倍率設計

```
gap=1（極窄門）: ×10  → 出現率低，高倍率補償
gap 2-3（窄門）: ×5   → 中低頻率
gap 4-7（普通門）: ×2  → 最常出現，×2 控制 RTP 不爆
gap 8+（寬門）: ×1    → 高頻低獎
同值門: ×1            → 穿門率 92% 但倍率低
```

**決策：為何普通門用 ×2？**
普通門佔 ~40% 門寬分佈，×3 會讓 RTP > 100%。×2 搭配 MISS_BIAS=0.20 讓期望值 ≈ 0.7×bet/3。

## MISS_BIAS 波動率控制

每列有 X% 機率強制中間牌改為門外值：
- MG: 20% → 降低穿門率 ~15%，RTP ≈ 85-92%
- FG: 30% → FG 免費轉需更多控制避免爆獎

## FG 期望值

8 轉免費，每列穿門時獲得 bet × 倍率的獎勵。
- 平均獎勵 = (0.2+0.33+0.5+1.0+1.5+0)/6 = 0.588
- 穿門率(含 MISS_BIAS 30%) ≈ 35%
- 每轉期望 ≈ 3 × 0.588 × 0.35 × bet/3 ≈ 0.206×bet
- 8 轉總期望 ≈ 1.65×bet

## BG 期望值

12 局，初始/保底 = bet×2，穿門×1，碰壁-2×，同值-3×，未中-1×。
- 純隨機穿門率 ≈ 45%
- 每局淨值 ≈ 0.45×1 - 0.15×2 - 0.05×3 - 0.35×1 = -0.20×下注
- 保底確保最差 = bet×2

## JP 機率設計

Symbol pool 三格獨立抽，三同中獎：
- Pool 大小固定 15 個，依 bet 級距調整 JP symbol 數量
- bet<300: 無 GRAND（只有 MAJOR+MINI 各 1 個 + 13 normal）
- bet≥300: 加入 GRAND
- bet≥600/1200: 提高 JP symbol 比例
- 三同機率 ≈ (jp_count/15)³

觸發條件：3 列全為窄門（gap≤3）

## Bet Sizing Exploit 分析

- JP pool 依 bet 線性加權，不會因低注高頻 exploit
- BG 保底 = bet×2，高注 BG 不會無風險套利
- GRAND 門檻 bet≥300 防止低注刷 JP

## Python 模擬範本

```python
import random

MISS_BIAS = 0.20
MULT = {1:10, 2:5, 3:5, 4:2, 5:2, 6:2, 7:2}

def sim(bet=30, n=100000):
    total_win, total_bet = 0, 0
    for _ in range(n):
        total_bet += bet
        for _ in range(3):
            l, r = random.randint(1,13), random.randint(1,13)
            m = random.randint(1,13)
            if l != r and random.random() < MISS_BIAS:
                lo, hi = min(l,r), max(l,r)
                out = [v for v in range(1,14) if v<lo or v>hi]
                if out: m = random.choice(out)
            if l == r:
                if m != l: total_win += bet/3*1 + bet/3
            else:
                lo, hi = min(l,r), max(l,r)
                gap = hi-lo-1
                if lo < m < hi:
                    total_win += bet/3*MULT.get(gap,1) + bet/3
    print(f"RTP: {total_win/total_bet*100:.1f}%")

sim()
```
