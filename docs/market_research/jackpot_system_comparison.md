# 4 層 JP 系統競品設計比較

> 調查日期：2026-06-04  
> 用途：供數學模型 Agent 設計射龍門 JP 參數時參考

---

## 一、主流 JP 系統架構總覽

### 1.1 業界標準 4 層結構

| 層級 | 通用命名 | 典型 Seed | 典型中獎範圍 | 心理定位 |
|------|----------|-----------|-------------|----------|
| Tier 1 | Mini | 10-50x bet | 10-100x | 「隨時可能中」— 維持參與感 |
| Tier 2 | Minor | 50-200x bet | 50-500x | 「小驚喜」— 延長遊玩時間 |
| Tier 3 | Major | 200-2,000x bet | 200-5,000x | 「今天運氣好」— 興奮記憶點 |
| Tier 4 | Grand | 1,000-10,000x+ | 1,000x-無上限 | 「改變人生」— 長期留存引力 |

### 1.2 JP 類型分類

| 類型 | 說明 | 代表 | 優劣 |
|------|------|------|------|
| Fixed（固定） | 獎金固定不變 | 部分 Hold & Spin | 可預測，但缺乏成長感 |
| Progressive（累進） | 每注貢獻一定比例使獎池成長 | Mega Moolah、Age of Gods | 有夢想感，但中獎後重置 |
| Stand-alone（獨立） | 單機累進，僅該遊戲貢獻 | 部分 Spadegaming | 成長慢，但運營商可控 |
| Network（跨站聯網） | 多運營商共同貢獻同一獎池 | Mega Moolah、Age of Gods | 獎池大但貢獻分散 |
| Local/Operator（營運商級） | 單一營運商旗下所有玩家貢獻 | Pragmatic Jackpot Play | 成長適中，運營商可客製 |

---

## 二、競品 JP 系統詳細分析

### 2.1 Pragmatic Play — Jackpot Play

**系統類型**：Operator-level Progressive（營運商級累進）

| 項目 | 設計 |
|------|------|
| 層數 | 4 層 |
| 命名 | 由營運商自訂（典型：Mini/Minor/Major/Grand） |
| 觸發方式 | **隨機觸發**（任何 spin 後均可能） |
| 觸發介面 | 4×3 寶石 Grid → 玩家 Pick 翻開 → 集齊 3 同層 JP 即中 |
| 觸發機率 | 投注越高機率越大（非線性） |
| Seed 設定 | 由營運商設定（可客製） |
| 貢獻率 | 由營運商設定（典型 1-3%） |
| 跨遊戲 | ✅ 連接 Pragmatic 多款 Slot |
| 可控性 | 營運商可調整 seed/貢獻率/觸發機率 |

**機制特點：**
- 純隨機觸發，無需特定符號組合
- Mini-game 形式增加互動感（Pick & Match）
- 30 秒計時器：時間到自動揭獎（防棄獎）
- 支援 Buy-in 模式（加價提升觸發率）

**數學模型參考：**
- 隨機觸發讓每次 spin 都有 JP 期待
- 投注金額影響觸發機率 → 鼓勵高額投注
- 4×3 Grid 12 格中需匹配 3 個 → 每層機率不同（Grand 最稀有）

---

### 2.2 Aristocrat — Lightning Link（Hold & Spin JP）

**系統類型**：Fixed + Progressive 混合

| 項目 | 設計 |
|------|------|
| 層數 | 4 層 |
| 命名 | Mini / Minor / Major / Grand |
| Seed | Mini: $10 / Minor: $50 / Major: $1,000 / Grand: $10,000（典型配置） |
| 觸發方式 | 6+ 特殊 Coin 符號觸發 Hold & Spin |
| Hold & Spin 機制 | 3 次 Respin，每落一個 Coin 重置為 3 次 |
| Grand 條件 | 填滿整個盤面（全 Coin） |
| Mini/Minor | 標示在 Coin 符號上（落地即得） |
| Major/Grand | Progressive 累進 |

**機制特點：**
- Hold & Spin 讓玩家「看著 JP 逐步接近」
- Coin 符號本身帶有數值（cash-on-reels）
- 填滿盤面 = Grand → 視覺上非常明確的目標感
- Major/Grand 為 Progressive，Mini/Minor 為 Fixed 標示在符號上

**數學模型參考：**
- 觸發條件明確（6+ Coins）→ 玩家知道何時「接近」
- Grand 需要填滿全盤 → 極低機率但視覺感知清晰
- Fixed Mini/Minor 嵌在 Coin 上 → 高頻小獎維持參與感
- 典型 Hold & Spin 觸發頻率：每 100-200 spin 一次

---

### 2.3 Playtech — Age of the Gods

**系統類型**：Network Progressive（跨站聯網）

| 項目 | 設計 |
|------|------|
| 層數 | 4 層 |
| 命名 | Power / Extra Power / Super Power / Ultimate Power |
| Ultimate Power Seed | €100,000 起跳 |
| 觸發方式 | **完全隨機**（Mystery Trigger） |
| 觸發介面 | 翻金幣遊戲（20 枚金幣，翻到 3 同花色即中） |
| 跨遊戲 | ✅ 8+ 遊戲 + Live Casino + Poker 共用同一獎池 |
| 跨品類 | ✅ Slots + Roulette + Poker 共享 |
| 貢獻率 | 每筆投注的一小部分 |
| 累計派出 | 已超過數千萬歐元 |

**機制特點：**
- 跨品類共享（Slot + Live Casino + Poker）→ 獎池增長極快
- Mystery Trigger：任何投注金額、任何時刻都可能觸發
- 翻金幣 Mini-game 增加懸念（20 枚幣中翻 3 同色）
- 投注越高觸發機率越大
- Omni-channel：手機/電腦/平板均可觸發

**數學模型參考：**
- Network 模式下獎池增長速度遠超 Stand-alone
- Ultimate Power 從 €100K 起跳 → 頭獎永遠很有吸引力
- 完全隨機觸發 → 小注也有機會（吸引休閒玩家）
- 翻幣 Mini-game 20C3 組合 → 機率可精確計算

---

### 2.4 Games Global (Microgaming) — Mega Moolah

**系統類型**：Network Progressive（全球聯網）

| 項目 | 設計 |
|------|------|
| 層數 | 4 層 |
| 命名 | Mini / Minor / Major / Mega |
| Seed 值 | Mini: $10 / Minor: $100 / Major: $10,000 / **Mega: $2,000,000** |
| 觸發方式 | 隨機觸發 Jackpot Wheel |
| 觸發介面 | 四色轉盤（每色代表一層 JP） |
| 貢獻率 | 約 0.8% 每筆投注 → 80% 進 Mega 池、20% 留下次 |
| 歷史最高 | €19,430,723.60（2021 年） |
| 累計派出 | 超過 AU$2 Billion |
| 基礎 RTP | 88-94%（因 JP 貢獻扣除） |

**機制特點：**
- 全球最大的 Progressive JP 系統之一
- Mega 層 Seed $2M → 永遠是百萬級獎金
- Jackpot Wheel 四色區域面積不同 → 視覺化機率
- 基礎 RTP 因 JP 貢獻而偏低（88-94%）→ 玩家用 RTP 換 JP 機會
- 投注越高觸發 Wheel 機率越高（但最低注也有機會）

**數學模型參考：**
- 0.8% 貢獻率：每 $100 投注 → $0.80 進 JP 池
- Mega Seed $2M 意味著：即使剛被中走，下一位也至少玩 $2M
- 基礎 RTP 犧牲 2-8% 來資助 JP → 需確保整體 RTP 仍符合玩家預期
- 轉盤各色面積比例 = 各層中獎機率

---

### 2.5 NetEnt — Mega Fortune / Divine Fortune

**系統類型**：Network Progressive

| 項目 | Mega Fortune | Divine Fortune Gold |
|------|-------------|-------------------|
| 層數 | 3 層 | 3 層 |
| 命名 | Rapid / Major / Mega | Minor / Major / Mega |
| Mega Seed | €數十萬 | 動態 |
| 觸發方式 | 3 Bonus 符號 → Wheel Game | Free Spins 中觸發 |
| 觸發介面 | **三層同心圓轉盤**（由外到內） | Falling Jackpot 視覺 |
| 貢獻率 | 約 3.7%（Divine Fortune Gold 資料） |
| 特色 | 三層轉盤層層推進的懸念感 | |

**三層同心圓轉盤機制（Mega Fortune）：**
1. **外圈**先轉停 → 可能中 Rapid JP 或「進入中圈」
2. **中圈**再轉停 → 可能中 Major JP 或「進入內圈」
3. **內圈**最後轉 → 中 Mega JP

**機制特點：**
- 三層推進設計 → 每一層都是一次心跳加速
- 「差一步就進內圈」的 Near-miss 效應極強
- 不是純隨機觸發，需要 3 Bonus 符號 → 有追求目標
- 視覺上非常清晰：往中心 = 越大獎

**數學模型參考：**
- 3.7% 貢獻率比 Mega Moolah 高 → 獎池增長更快
- 三層推進機率：外圈停在「進入」的機率 > 中圈 > 內圈（漸減）
- 需要符號觸發 → 觸發頻率可由 Scatter 機率控制
- 20% of contribution 留給下次 Seed → 保底機制

---

### 2.6 Spadegaming — Random Trigger JP

**系統類型**：Stand-alone Random

| 項目 | 設計 |
|------|------|
| 層數 | 3-4 層（依遊戲而異） |
| 觸發方式 | 完全隨機（任何 spin 後） |
| 觸發介面 | 各遊戲不同（Lucky Koi: JP 選擇遊戲 / Cai Shen: Wild 觸發） |
| 特色 | 簡單直接，無需學習 |
| 跨遊戲 | ❌ 每款遊戲獨立 |

**Cai Shen 888 觸發機制：**
- 2 Scatter + 1 Special Scatter 觸發 Caishen Bonus
- Bonus 中進入 JP 選擇
- 財神 Wild 可直接觸發 JP Wheel

**Lucky Koi 觸發機制：**
- 任意 spin 後隨機觸發 JP 小遊戲
- 不需要任何特定組合
- 每次 spin 都有機會 → 維持期待感

---

## 三、JP 觸發機制比較矩陣

| 系統 | 觸發方式 | 玩家控制感 | 懸念設計 | 觸發頻率 | 適合遊戲類型 |
|------|----------|-----------|----------|----------|-------------|
| Pragmatic Jackpot Play | 隨機 + Pick Grid | 低（純運氣） | 中（Pick 過程） | 中 | 多款 Slot 共用 |
| Lightning Link | 符號觸發 Hold & Spin | 中（看 Coin 累積） | 高（逐步填滿） | 中高（H&S 頻繁） | 單一 Slot |
| Age of the Gods | 完全隨機 + 翻幣 | 低 | 中（翻幣匹配） | 低 | 跨品類網路 |
| Mega Moolah | 隨機 + Wheel | 低 | 中（轉盤） | 極低（Mega） | Network JP |
| Mega Fortune | 符號觸發 + 三層 Wheel | 中（需 Bonus 觸發） | **極高（三層推進）** | 中（Bonus 頻率） | 單一 Slot |
| Spadegaming | 隨機/符號混合 | 低 | 低-中 | 中-高 | Stand-alone |

---

## 四、關鍵數學參數比較

### 4.1 Seed 值（重置後起始金額）

| 系統 | Mini | Minor | Major | Grand/Mega |
|------|------|-------|-------|-----------|
| Pragmatic JP Play | 營運商設定 | 營運商設定 | 營運商設定 | 營運商設定 |
| Lightning Link | $10（fixed） | $50（fixed） | $1,000 | $10,000 |
| Age of the Gods | 低 | 中 | 高 | €100,000 |
| Mega Moolah | $10 | $100 | $10,000 | **$2,000,000** |
| Mega Fortune | €數十 | €數百 | €數十萬 | - |

### 4.2 貢獻率（Contribution Rate）

| 系統 | 貢獻率 | 對基礎 RTP 影響 | 說明 |
|------|--------|----------------|------|
| Mega Moolah | ~0.8% | RTP 降至 88-94% | 低貢獻但全球分攤 |
| Mega Fortune / Divine Fortune | ~3.7% | RTP 約 93-96% | 較高貢獻，獎池增長快 |
| Age of the Gods | ~1-2%（估計） | RTP 約 94-95% | 跨品類分攤 |
| Lightning Link | 內建在 RTP 中 | RTP 約 95-96% | Fixed JP 不需外部貢獻 |
| Pragmatic JP Play | 1-3%（營運商設） | 視設定而異 | 最靈活可調 |

### 4.3 中獎機率（估計範圍）

| 層級 | 典型觸發頻率 | 每 N spin 約中一次 |
|------|-------------|------------------|
| Mini | 高 | 每 100-500 spin |
| Minor | 中 | 每 500-2,000 spin |
| Major | 低 | 每 2,000-10,000 spin |
| Grand/Mega | 極低 | 每 10,000-50,000+ spin |

**注意**：具體機率因系統而異，上表為業界觀察值範圍。

---

## 五、對射龍門 JP 系統的設計建議

### 5.1 推薦架構

基於競品分析，建議射龍門採用 **「觸發型 + 三層推進」混合設計**：

| 項目 | 建議 | 理由 |
|------|------|------|
| 層數 | 4 層 | 亞洲市場標配 |
| 命名 | 🐉 龍門 / 🥇 金門 / 🥈 銀門 / 🥉 銅門 | 主題化命名提升品牌識別 |
| 類型 | Top 2 Progressive + Bottom 2 Fixed | 大獎有成長感，小獎可預期 |
| 觸發方式 | **射龍門成功時機率觸發**（非純隨機） | 結合核心玩法，有參與感 |
| 觸發介面 | **雙層停轉 Wheel**（外圈定層級、內圈定倍率） | 參考 Mega Fortune 三層懸念，簡化為兩層 |
| 連射加成 | Streak 越長觸發機率越高 | 鼓勵連射追求 |

### 5.2 建議參數範圍（供數學模型調整）

| 參數 | 銅門 | 銀門 | 金門 | 龍門 |
|------|------|------|------|------|
| 類型 | Fixed | Fixed | Progressive | Progressive |
| Seed / 固定值 | 50x bet | 200x bet | 500x bet（seed） | 2,000x bet（seed） |
| 目標中獎範圍 | 50x | 200x | 500-1,000x | 2,000-5,000x+ |
| 中獎頻率目標 | 每 200-500 spin | 每 1,000-2,000 spin | 每 5,000-10,000 spin | 每 20,000+ spin |
| 貢獻率（Progressive） | - | - | 1.0% | 1.5% |
| Total JP 貢獻 | - | - | 2.5% total | ← |

### 5.3 觸發機制建議

```
Base Game Spin
    ↓
射龍門機會出現（每 5-8 spin）
    ↓
射中？ ──No──→ 繼續 Base Game
    ↓ Yes
    ↓
JP 觸發判定（基礎機率 P）
    ↓
P = P_base × Streak_multiplier
    ↓
觸發？ ──No──→ 獲得射中獎金，繼續
    ↓ Yes
    ↓
進入 JP Wheel
    ↓
外圈停轉 → 決定層級（銅/銀/金/龍）
    ↓
內圈停轉 → 決定具體倍率
    ↓
派獎 + 慶祝動畫
```

**Streak Multiplier 建議：**

| 連射次數 | JP 觸發機率加成 |
|----------|----------------|
| 1 次 | ×1.0（基礎） |
| 2 次 | ×1.5 |
| 3 次 | ×2.0 |
| 4 次 | ×3.0 |
| 5 次 | **必定觸發 JP Wheel** |

### 5.4 JP Wheel 各層機率建議

外圈停轉機率（以面積比例呈現）：

| 層級 | 面積佔比 | 中獎機率 |
|------|----------|----------|
| 銅門 | 50% | 1/2 |
| 銀門 | 30% | 3/10 |
| 金門 | 15% | 3/20 |
| 龍門 | 5% | 1/20 |

### 5.5 RTP 影響估算

| 項目 | 佔比 |
|------|------|
| Base Game RTP | 約 91.5% |
| 射龍門 Bonus 回饋 | 約 3.0% |
| JP 系統回饋 | 約 2.5% |
| **整體 RTP** | **約 97.0%** |

**注意**：以上為初步建議，需由數學模型 Agent 進行蒙特卡洛模擬驗證。

### 5.6 與競品的差異化優勢

| 維度 | 射龍門 JP | 競品典型 JP | 優勢 |
|------|----------|------------|------|
| 觸發連結 | 與核心玩法（射中）綁定 | 純隨機/符號觸發 | 有參與感，不是「等 RNG」|
| Streak 加成 | 連射提升觸發率 | 無（固定機率） | 鼓勵連續遊玩 |
| 視覺目標 | 雙層 Wheel + 4 色門 | 各式各樣 | 簡潔但有層次 |
| 品牌化命名 | 龍門/金門/銀門/銅門 | Generic Mini/Major | 主題沉浸感 |
| 控制性 | 營運商可調觸發基礎機率 | 多數系統較固定 | 營運靈活度高 |

---

## 六、風險提醒

1. **JP 貢獻率 vs RTP 平衡**：Total JP 貢獻建議不超過 2.5-3%，否則 Base Game RTP 會被壓得太低，亞洲玩家對「長期乾轉」敏感
2. **Progressive 獎池增長速度**：Stand-alone 模式下，如果玩家量不夠大，Grand JP 可能長期不被觸發 → 考慮設定 Must-Hit-By 上限
3. **連射 5 必定觸發**：需確保連射 5 的數學期望值不會讓 RTP 失衡 → 連射 5 的出現機率本身就極低
4. **合規性**：Streak 提升觸發率不影響 RNG 認證（仍是機率事件），但需確保 regulator 審計時可清楚說明機率模型

---

*報告完成。建議數學模型 Agent 以本文參數為起點進行模擬，特別驗證：*
1. *整體 RTP 在 96.5-97.0% 範圍內*
2. *Grand JP「龍門」的觸發頻率在可接受範圍*
3. *Streak 5 必觸發的 EV 影響*
