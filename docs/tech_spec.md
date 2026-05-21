# 射龍門 Slot — 技術規格文件

> v1.0 ｜ 2026.04.21 ｜ 供程式工程師實作參考

## 目錄

1. [系統架構總覽 Module Overview](#1-系統架構總覽)
2. [符號定義與牌值對照 Symbol & Value Map](#2-符號定義與牌值對照)
3. [RNG 規格 Random Number Generation](#3-rng-規格)
4. [主遊戲判定邏輯 Main Game Win Evaluation](#4-主遊戲判定邏輯)
5. [Scatter 判定與 Free Game 觸發](#5-scatter-判定與-free-game-觸發)
6. [Free Game 計分流程 Free Game Scoring](#6-free-game-計分流程)
7. [JP 大龍門系統 Jackpot Gate System](#7-jp-大龍門系統)
8. [JP 池管理 JP Pool Management](#8-jp-池管理)
9. [可調參數總表 Tuning Parameters](#9-可調參數總表)
10. [素材代號對照表 Asset Reference](#10-素材代號對照表)

---

## 1. 系統架構總覽

### Game State Machine

```
IDLE → SPIN → EVAL → SC×3? → FREE GAME (8轉計分) → JP GATE (大龍門) → IDLE
等待投注   RNG產值  三列判定
```

- **SC×3 未達成**：EVAL → IDLE（直接結算，無 Free Game）
- **Free Game 觸發**：EVAL → FREE GAME（8轉） → JP GATE → IDLE

### Module Breakdown

| 模組 | 職責 |
|------|------|
| RNG_MODULE | 產生 9 個獨立亂數（1–13）+ 9 個 SC 疊加判定（5%） |
| EVAL_MODULE | 主遊戲三列勝負判定，輸出賠率乘數×3 |
| FG_MODULE | Free Game 8轉管理，累積計分器 |
| JP_MODULE | 三層 JP 池管理，大龍門門判定 |
| PAYOUT_MODULE | 結算下注 × 乘數，更新代幣餘額 |
| UI_MODULE | 盤面動畫、計分板、壓注欄、分數欄 |

---

## 2. 符號定義與牌值對照

### Symbol Enum

| 代號 | 符號 | 數值 (int) | 素材檔 |
|------|------|-----------|--------|
| SYM_A | A（Ace） | 1 | cd-01-A.png |
| SYM_2 | 2 | 2 | cd-13-2.png |
| SYM_3 | 3 | 3 | cd-12-3.png |
| SYM_4 | 4 | 4 | cd-11-4.png |
| SYM_5 | 5 | 5 | cd-10-5.png |
| SYM_6 | 6 | 6 | cd-09-6.png |
| SYM_7 | 7 | 7 | cd-08-7.png |
| SYM_8 | 8 | 8 | cd-07-8.png |
| SYM_9 | 9 | 9 | cd-06-9.png |
| SYM_10 | 10 | 10 | cd-05-10.png |
| SYM_J | J（Jack） | 11 | cd-04-J.png |
| SYM_Q | Q（Queen） | 12 | cd-03-Q.png |
| SYM_K | K（King） | 13 | cd-02-K.png |

### Scatter Symbol

| 代號 | 說明 | 素材檔 |
|------|------|--------|
| SYM_SC | 龍符號（Scatter），疊加層，不佔用主格位 | sc-01.png |

**設計說明：**
SC 為**疊加層（overlay）**，每格有 5% 機率顯示。主格位仍持有一個正常牌值符號（SYM_A～SYM_K），用於主遊戲判定。SC 僅用於計算盤面總 SC 數量，達 3 個觸發 Free Game。

**資料結構建議：**
每格儲存：`{ value: int(1~13), is_scatter: bool }`

---

## 3. RNG 規格

### Spin RNG 輸入輸出

| 項目 | 規格 |
|------|------|
| 盤面格數 | 3 列 × 3 欄 = **9 格** |
| 主格亂數範圍 | int ∈ [1, 13]，均勻分布 |
| 各格獨立性 | 9 格完全獨立，相互無關 |
| SC 疊加 | 每格獨立，P(SC) = 5% |
| 每轉呼叫次數 | 主格 9 次 + SC 9 次 = **18 次** |
| Free Game 每轉 | 同主遊戲，共 **18 × 8 = 144 次** |

### 盤面欄位定義

| 欄位 | 索引 | 角色 |
|------|------|------|
| 左欄（Left） | col[0] | 龍門左界 |
| 中欄（Mid） | col[1] | 投擲的球（判定主角） |
| 右欄（Right） | col[2] | 龍門右界 |

- 3 列（row[0], row[1], row[2]）各自獨立判定，結果互不影響
- 同一轉內三列可能有不同結果（穿門、碰壁、未穿混合）

### Spin Result Struct（建議）

```javascript
// 每轉結果資料結構
struct CellData {
  value: int       // 1~13
  is_scatter: bool
}

struct SpinResult {
  grid: CellData[3][3]   // [row][col] col: 0=Left, 1=Mid, 2=Right
  scatter_cnt: int       // 0~9
  row_results: RowResult[3]
  total_mult: float      // sum of all row multipliers
  payout: float          // bet × total_mult / 3 (per-row bet share)
  trigger_fg: bool       // scatter_cnt >= 3
}
```

**下注分配說明：** 1 注（bet）平均分配給 3 列，每列 bet/3。各列賠率乘數作用於 bet/3，合計即為本轉總賠付。例：bet=1，三列分別 ×6 / ×2 / ×0 → 總賠付 = (6+2+0)/3 × 1 = 2.67 倍。

**⚠ 同值命中懲罰（-3.0）說明：**
乘數為負值代表**玩家賠莊家**。total_payout 若為負，代表額外從玩家餘額扣款。
**投注前必須檢查：balance >= 3 × bet**，餘額不足時不允許開始這轉。

---

## 4. 主遊戲判定邏輯

### eval_row 虛擬碼

```python
function eval_row(L: int, M: int, R: int) -> float:
    // ── 同值門（左 = 右）─────────────────────────────
    if L == R:
        if M == L:
            return -3.0    // 同值命中：玩家賠莊家 3 倍押注（扣款）
        else:
            return 0.0     // 同值未中，判輸

    // ── 正常門（左 ≠ 右）─────────────────────────────
    lo = min(L, R)
    hi = max(L, R)

    if M == lo or M == hi:
        return 1.2         // 碰壁（中欄 = 任一界值）

    if lo < M < hi:        // 穿門
        gap = hi - lo - 1  // 可穿位置數量
        if gap == 1:
            return 6.0     // 極窄門
        elif gap <= 3:
            return 4.0     // 窄門
        elif gap <= 7:
            return 2.0     // 中門
        else:
            return 1.0     // 寬門

    return 0.0             // 未穿（M 超出範圍）
```

### 賠率對照表（精確版）

| 判定結果 | 條件 | gap 值 | 機率（均勻分布 1~13） | 乘數 |
|---------|------|--------|---------------------|------|
| **極窄門穿門** | lo < M < hi，gap = 1 | hi - lo = 2 | 1/13 ≈ 7.69%（對 M） | × 6.0 |
| **窄門穿門** | lo < M < hi，gap 2~3 | hi - lo = 3~4 | 2~3/13 = 15.4%~23.1% | × 4.0 |
| **中門穿門** | lo < M < hi，gap 4~7 | hi - lo = 5~8 | 4~7/13 = 30.8%~53.8% | × 2.0 |
| **寬門穿門** | lo < M < hi，gap 8~11 | hi - lo = 9~12 | 8~11/13 = 61.5%~84.6% | × 1.0 |
| **碰壁** | M == lo or M == hi | — | 2/13 ≈ 15.38%（每列） | × 1.2 |
| **同值命中**（玩家賠莊家） | L == R and M == L | — | (1/13)² ≈ 0.59%（單列） | 玩家付 3× 押注（乘數 -3.0，扣款） |
| 未穿 / 同值未中 | 其他 | — | 依當局組合 | × 0 |

⚠ **gap = hi - lo - 1**，例如 L=3, R=6 → hi-lo=3，gap=2 → 窄門 ×4

⚠ **M 範圍**是 1~13 均勻分布，同一轉左右欄也影響門寬分布，非固定機率

⚠ **同值命中（-3.0）**：呼叫端需先確認 balance ≥ 3 × bet，否則禁止轉動

---

## 5. Scatter 判定與 Free Game 觸發

### SC 判定規則

```python
function count_scatter(grid: CellData[3][3]) -> int:
    cnt = 0
    for row in [0,1,2]:
        for col in [0,1,2]:
            if grid[row][col].is_scatter:
                cnt += 1
    return cnt

// Free Game 觸發條件
trigger_fg = count_scatter(grid) >= 3
```

### 觸發機率

| 計算方式 | 數值 |
|---------|------|
| 每格 SC 出現率 | 5% |
| 總格數 | 9 |
| ≥3 個 SC 機率 | ≈ 0.82% |
| 平均觸發間距 | ≈ 122 轉 |
| 同一轉 SC 最多 | 9 個（理論值，機率極低） |

- SC 計數使用全 9 格（左欄、中欄、右欄均計入）
- SC 與主遊戲勝負判定完全獨立，同轉可同時發生

---

## 6. Free Game 計分流程

### 單轉計分規則

```python
function calc_fg_score_row(L: int, M: int, R: int) -> int:
    """
    Free Game 中每列貢獻的累積點數
    注意：計分只用 M（中欄牌值），不計賠率
    """
    if L == R:                    // 同值門
        if M == L:
            return M * 1          // 同值命中 = M × 1（同穿門）
        else:
            return 0

    lo = min(L, R)
    hi = max(L, R)

    if M == lo or M == hi:
        return M * 3              // 碰壁：中欄牌值 × 3
    elif lo < M < hi:
        return M * 1              // 穿門：中欄牌值 × 1
    return 0                      // 未穿：0

function run_free_game() -> int:
    total_score = 0
    for spin in range(8):         // 固定 8 轉
        result = spin_rng()
        for row in [0,1,2]:
            L = result.grid[row][0].value
            M = result.grid[row][1].value
            R = result.grid[row][2].value
            total_score += calc_fg_score_row(L, M, R)
    return total_score            // 進入 JP_GATE 判定
```

### 累積點數範圍參考

| 情境 | 條件假設 | 估計得分 | 對應 JP 層 |
|------|---------|---------|-----------|
| 全未穿 | 8轉 × 3列全 ×0 | 0 | 保底小彩金 |
| 中等表現 | 以中門穿門為主，M 平均 ≈ 7 | ~70~90 | Basic JP 門 |
| 優異表現 | 多次碰壁或高牌穿門 | ~130~200 | Major JP 門 |
| 極佳表現 | 大量碰壁 + 高牌值 | ~210~320 | Grand JP 門 |
| 理論最大 | 8轉 × 3列全碰壁，M=13 | 936 | 保底中彩金 |

⚠ 實際分布需蒙地卡羅模擬驗證。上表為極端情境估算，非統計均值。

---

## 7. JP 大龍門系統

### JP Gate 判定虛擬碼

```python
function gate_payout(score: int, center: int, gate_L: int, gate_R: int, pool: float) -> float:
    """計算單一 JP 門的賠付，呼叫前已確認 gate_L <= score <= gate_R"""

    // ── 精準命中中心 → 清池 × 3 ─────────────────────
    if score == center:
        reset_pool(tier)          // 重置回 seed 值
        return pool * 3.0

    // ── 計算距中心比例 ──────────────────────────────────
    half_width = (gate_R - gate_L) / 2.0
    dist_pct = abs(score - center) / half_width    // 0.0 ~ 1.0

    // ── 依比例分段，取 1/7 池值派發 ──────────────────
    prize_base = pool / 7.0       // 每次最多扣池的 1/7（F方案定案）

    if dist_pct <= 0.33:
        return prize_base * 0.60  // 近段
    elif dist_pct <= 0.67:
        return prize_base * 0.30  // 中段
    else:
        return prize_base * 0.10  // 遠段
    // 非中心命中：池繼續累積，不重置

function eval_jp_gate(score: int, jp_pool: JPPool) -> float:
    if score < 60:
        return 0                  // 門外
    elif 60 <= score <= 120:
        return gate_payout(score, 90, 60, 120, jp_pool.basic)
    elif score <= 129:
        return 0                  // 空隙
    elif 130 <= score <= 200:
        return gate_payout(score, 165, 130, 200, jp_pool.major)
    elif score <= 209:
        return 0                  // 空隙
    elif 210 <= score <= 320:
        return gate_payout(score, 265, 210, 320, jp_pool.grand)
    else:
        return 0                  // score > 320，保底中彩金（待定）
```

- ✅ **空隙區（121~129, 201~209）**：沒中獎（return 0）
- ✅ **精準命中中心（score == 90/165/265）**：全池 × 3，池重置回 seed 值
- ✅ **門內其他分數**：依距中心比例分段，派發 1/7 池值（60% / 30% / 10%），池**繼續累積不重置**

### JP 門參數對照

| JP 層 | 分數範圍 | 中心值 | 半寬 | 門內賠付（非中心） | 精準命中中心 |
|-------|---------|--------|------|-------------------|------------|
| 🔵 Basic JP | 60 ~ 120 | 90 | 30 點 | 近段 pool/7×60%、中段 pool/7×30%、遠段 pool/7×10% | pool × 3.0，重置 |
| 🟠 Major JP | 130 ~ 200 | 165 | 35 點 | 近段 pool/7×60%、中段 pool/7×30%、遠段 pool/7×10% | pool × 3.0，重置 |
| 🔴 Grand JP | 210 ~ 320 | 265 | 55 點 | 近段 pool/7×60%、中段 pool/7×30%、遠段 pool/7×10% | pool × 3.0，重置 |

- **近段**：dist_pct ≤ 33%（距中心 ≤ 1/3 半寬）
- **中段**：dist_pct 33%~67%
- **遠段**：dist_pct 67%~100%（緊貼門邊）
- 非中心命中不重置池，池繼續累積

---

## 8. JP 池管理

### JP Pool Struct

```javascript
struct JPPool {
    // Basic
    basic: float          // 當前池值（bet 倍數）
    basic_seed: float     // 初始值 = 50x
    basic_cap: float      // 上限 = 250x
    basic_rate: float     // 貢獻率 = 0.03

    // Major
    major: float          // 當前池值
    major_seed: float     // 初始值 = 200x
    major_cap: float      // 上限 = 1000x
    major_rate: float     // 貢獻率 = 0.015

    // Grand
    grand: float          // 當前池值
    grand_seed: float     // 初始值 = 1000x
    grand_cap: float      // 上限 = 5000x
    grand_rate: float     // 貢獻率 = 0.005
}
```

### 每轉貢獻邏輯

```python
function contribute_to_pool(bet: float):
    // 每注 5% 分配至三層池
    jp.basic += bet * jp.basic_rate    // 3.0%
    jp.major += bet * jp.major_rate    // 1.5%
    jp.grand += bet * jp.grand_rate    // 0.5%

    // 上限截斷
    jp.basic = min(jp.basic, jp.basic_cap)
    jp.major = min(jp.major, jp.major_cap)
    jp.grand = min(jp.grand, jp.grand_cap)

function reset_pool(tier: str):
    // JP 打出後重置至 seed 值
    if tier == "basic": jp.basic = jp.basic_seed
    if tier == "major": jp.major = jp.major_seed
    if tier == "grand": jp.grand = jp.grand_seed
```

- JP 打出只重置當層，其餘兩層維持不變
- 上限觸達後停止累積（不溢出）

### JP 池三層參數總表

| 層級 | 初始值 | 上限 | 貢獻率 | 預計打出頻率（參考） |
|------|--------|------|--------|-------------------|
| **Basic JP** | 50× 下注 | 250× 下注 | 3.0% | 相對頻繁（平均得分最易達 60~120） |
| **Major JP** | 200× 下注 | 1,000× 下注 | 1.5% | 中頻（需表現優異） |
| **Grand JP** | 1,000× 下注 | 5,000× 下注 | 0.5% | 稀有（8轉須大量碰壁） |

---

## 9. 可調參數總表

| 參數名稱 | 預設值 | 說明 | 狀態 |
|---------|--------|------|------|
| SYMBOL_COUNT | 13 | 盤面符號種類（A~K） | 已定案 |
| SCATTER_RATE | 5% | 每格 SC 出現率 | 已定案 |
| SCATTER_TRIGGER | 3 | 觸發 Free Game 的 SC 最低數量 | 已定案 |
| FG_SPINS | 8 | Free Game 轉數 | 已定案 |
| WALL_MULT | 1.2 | 主遊戲碰壁賠率乘數 | 已定案 |
| WIDE_GATE_MULT | 1.0 | 主遊戲寬門（gap 8~11）穿門賠率乘數 | 已定案 |
| WALL_SCORE_MULT | 3 | Free Game 碰壁計分乘數 | 已定案 |
| JP_BASIC_SEED | 50x | Basic JP 初始池值 | 已定案 |
| JP_BASIC_CAP | 250x | Basic JP 上限 | 已定案 |
| JP_BASIC_RATE | 3.0% | Basic JP 每注貢獻率 | 已定案 |
| JP_MAJOR_SEED | 200x | Major JP 初始池值 | 已定案 |
| JP_MAJOR_CAP | 1,000x | Major JP 上限 | 已定案 |
| JP_MAJOR_RATE | 1.5% | Major JP 每注貢獻率 | 已定案 |
| JP_GRAND_SEED | 1,000x | Grand JP 初始池值 | 已定案 |
| JP_GRAND_CAP | 5,000x | Grand JP 上限 | 已定案 |
| JP_GRAND_RATE | 0.5% | Grand JP 每注貢獻率 | 已定案 |
| GATE_BASIC_L | 60 | Basic JP 門左界（分數） | 已定案 |
| GATE_BASIC_R | 120 | Basic JP 門右界 | 已定案 |
| GATE_BASIC_CTR | 90 | Basic JP 門中心（精確命中 × 3，容差 = 0） | 已定案 |
| GATE_MAJOR_L | 130 | Major JP 門左界 | 已定案 |
| GATE_MAJOR_R | 200 | Major JP 門右界 | 已定案 |
| GATE_MAJOR_CTR | 165 | Major JP 門中心（精確命中 × 3，容差 = 0） | 已定案 |
| GATE_GRAND_L | 210 | Grand JP 門左界 | 已定案 |
| GATE_GRAND_R | 320 | Grand JP 門右界 | 已定案 |
| GATE_GRAND_CTR | 265 | Grand JP 門中心（精確命中 × 3，容差 = 0） | 已定案 |
| GATE_GAP_RULE | 0（沒中獎） | 空隙區（121~129, 201~209）不給賠付 | 已定案 |
| CTR_HIT_MARGIN | 0 | 中心命中容差 = 0（精確等於中心值才給 × 3） | 已定案 |
| SAME_VAL_PENALTY | -3.0 | 同值命中乘數（玩家賠莊家 3 倍押注） | 已定案 |
| MIN_BALANCE_MULT | 3× | 最低餘額門檻 = 3 × bet（投注前檢查，不足禁轉） | 已定案 |
| JP_PAYOUT_NEAR | 60% | 門內近段（dist_pct ≤ 33%）派發比例，取自 pool/7 | 已定案 |
| JP_PAYOUT_MID | 30% | 門內中段（33% < dist_pct ≤ 67%）派發比例 | 已定案 |
| JP_PAYOUT_FAR | 10% | 門內遠段（dist_pct > 67%）派發比例 | 已定案 |
| JP_PAYOUT_BASE | 1/7 | 非中心命中每次最多扣池的比例（F方案定案） | 已定案 |
| TARGET_RTP | 96.4% | 蒙地卡羅驗算結果（1,000萬轉）：主遊戲 71.7% + JP 24.7% | 已定案 |

---

## 10. 素材代號對照表

### Symbol Assets

| 代號 | 檔名 | 用途 |
|------|------|------|
| SC-01 | sc-01.png | Scatter 龍符號 |
| CD-01 | cd-01-A.png | A（數值 1） |
| CD-13 | cd-13-2.png | 2（數值 2） |
| CD-12 | cd-12-3.png | 3（數值 3） |
| CD-11 | cd-11-4.png | 4（數值 4） |
| CD-10 | cd-10-5.png | 5（數值 5） |
| CD-09 | cd-09-6.png | 6（數值 6） |
| CD-08 | cd-08-7.png | 7（數值 7） |
| CD-07 | cd-07-8.png | 8（數值 8） |
| CD-06 | cd-06-9.png | 9（數值 9） |
| CD-05 | cd-05-10.png | 10（數值 10） |
| CD-04 | cd-04-J.png | J（數值 11） |
| CD-03 | cd-03-Q.png | Q（數值 12） |
| CD-02 | cd-02-K.png | K（數值 13） |

### Background / JP / UI Assets

| 代號 | 檔名 | 用途 |
|------|------|------|
| BG-01 | bg/bg-01.png | 主遊戲背景 |
| FG-01 | bg/fg-01.png | Free Game 入場畫面 |
| JP-01 | jp/jp-01-basic.png | Basic JP 圖示 |
| JP-02 | jp/jp-02-major.png | Major JP 圖示 |
| JP-03 | jp/jp-03-grand.png | Grand JP 圖示 |
| UI-01 | ui/ui-01-scoreboard.png | Free Game 計分板底板 |
| UI-02 | ui/ui-02-bet.png | 壓注欄底板（下注額） |
| UI-03 | ui/ui-03-balance.png | 分數欄底板（代幣餘額） |

- 全部 22 張素材由 Pollinations.ai 自動生成
- 素材路徑根目錄：`assets/`

---

> 射龍門 Slot — 技術規格文件 v1.0
> AI 輔助開發驗證專案 ｜ 2026.04.21 ｜ 企劃：slot企劃專員 ｜ 執行：slot遊戲專員
