# BG/FG 功能 QA 報告 — 2026-06-04

## 測試範圍
- Bonus Game 完整流程（進入→選籌碼→發牌→判定→下一局→結束）
- Free Game 完整流程（進入→8轉→中輪錢幣→飛移→結算）
- 邊界情況：籌碼歸零、時間到、快速連點

---

## 已修復 Bug

### BG-001: 競態條件 — 翻牌動畫中 totalTimer 歸零導致 crash ⚠️ 已修
**嚴重度：** P0（會 crash）
**描述：** 如果 90 秒總時間在翻牌動畫的 750ms 內到期，`bgEnd()` 會將 `bgInstance = null`，隨後 setTimeout 回調中 `bgInstance.reveal()` 會拋出 TypeError。
**修復：** 在 bgDeal 的 setTimeout 回調中加入 `if (!bgInstance) return;` guard。

### BG-002: bgEnd 可能被重複呼叫 ⚠️ 已修
**嚴重度：** P1
**描述：** totalTimer 和 roundTimer 都可能觸發 bgEnd，若幾乎同時到期可能重複呼叫。
**修復：** bgEnd 開頭加 `if (!bgInstance) return;`。

### BG-003: 自動下注與手動下注競態 ⚠️ 已修
**嚴重度：** P1
**描述：** 如果玩家在 roundTimer 最後一秒點擊 DEAL，同時 roundTimer 也觸發自動下注，可能導致 bgDeal 被呼叫兩次。
**修復：** bgDeal 開頭加 `if (!bgInstance || !bgInstance.active) return;`。

---

## 待確認/觀察項目

### BG-004: 籌碼歸零流程 ⚠️ 待確認
**嚴重度：** P2
**描述：** 當碰壁/同值撞柱導致 `chips` 變為負數（被夾到 0），`applyResult` 設 `active = false`。2 秒後 `bgNewRound` 檢查到 `!active` 會呼叫 `bgEnd`。流程正確，但玩家可能不理解為什麼突然結束 — 建議加一個「籌碼用盡」提示。

### BG-005: 彩金池耗盡
**嚴重度：** P3
**描述：** 如果 `pool` 被穿門贏完（理論上很難），後續穿門 `actual = Math.min(win, pool)` 會給 0。邏輯正確但玩家可能困惑。

### BG-006: 同值門判定
**嚴重度：** P2（設計問題）
**描述：** 同值門（左=右）時，任何非同值的中牌都算「穿門×1」。這意味著同值門的穿門機率 = 12/13 ≈ 92%，只有 1/13 機率撞柱（扣3倍）。期望值 = 0.92×1 - 0.077×3 = 0.69。**同值門對玩家有利**，可能需要數學模型評估是否影響 RTP。

---

## FG 流程確認

### FG-001: 中輪錢幣標籤 ✅ 正常
- buildStripN 正確為隨機格和最終格加上 cell-bonus 標籤
- 標籤跟著 strip 轉動

### FG-002: 錢幣飛移動畫 ✅ 正常
- 只飛移穿門且非「—」的列
- 新建小 span（不 clone 整個 cell）
- 飛移到 badge 區後顯示金額

### FG-003: FG 結算 overlay ✅ 正常
- 8 轉結束彈出全螢幕結算
- 數字跳動 2 秒 + BIG WIN 判定

### FG-004: FG 期間不出 Scatter ✅ 正常
- `spin(true)` 確保 fgMode 下 Scatter 不出現

---

## V3 待修 Issue（需其他 Agent 處理）

| ID | 優先級 | 描述 | 負責 |
|---|---|---|---|
| VFX-001 | P1 | 碰壁特效太弱（<200ms），需加 camera shake + 裂痕 overlay | 特效爽感 |
| VFX-002 | P1 | Scatter 缺獨立揭曉動畫（光柱+震動+逐一揭曉） | 特效爽感 |
| VFX-003 | P2 | 穿門 flash 太強遮蓋盤面（透明度降低 30%） | 程式前端 |
| VFX-004 | P2 | 高 Combo 光暈太濃導致盤面不可見 | 程式前端 |
| UX-001 | P2 | BG 籌碼歸零時缺少「籌碼用盡」提示文字 | 企劃QA |
| MATH-001 | P2 | BG 同值門期望值偏高（92% 穿門率），需評估 RTP 影響 | 數學模型 |

---

## Visual QA — FG/BG 新功能（2026-06-04）

### FG 視覺品質

| 項目 | 評分 | 備註 |
|------|------|------|
| 中輪 💰 標籤可見性 | 5/10 | font-size 10px 太小，轉動時幾乎看不到。建議至少 12-14px，或加背景 padding 增大面積 |
| 錢幣飛移動畫 | 7/10 | 飛移方向正確、時間合理。但 13px 的飛行物太小，飛行中不夠醒目 |
| FG 結算 overlay | 8/10 | 金色光暈 + 數字跳動效果好，BIG WIN 判定正確 |
| FG info 顯示 | 7/10 | 只顯示轉數，贏分在底部 WIN 更新，清楚但不夠突出 |

### BG 視覺品質

| 項目 | 評分 | 備註 |
|------|------|------|
| bonus game.png 背景 | 7/10 | 定位正確，與主背景融合。但尺寸用固定 %，極端螢幕比可能不完美 |
| 三張牌 | 6/10 | 固定 87×129px 不響應。手機 OK 但桌面版偏小 |
| 牌面翻轉動畫 | 6/10 | cardFlip 只是 rotateY，沒有 3D perspective。看起來像壓扁而非真正翻轉 |
| 籌碼按鈕 | 5/10 | 36×36px 固定、透明背景。位置靠 absolute %，可能在不同機型偏移 |
| 門寬/結果文字 | 7/10 | 金色+文字 shadow 清楚，clamp 響應式 OK |
| BG 結算 overlay | 8/10 | 共用 FG 結算，效果一致，標題正確切換 |
| BG 資訊列 | 6/10 | 籌碼/已贏/倒數擠在一行，手機上可能擁擠 |

### 具體改善建議

| 優先級 | 項目 | 建議 |
|--------|------|------|
| P2 | FG 中輪 💰 標籤太小 | font-size 改 clamp(11px, 2.5vw, 14px)，padding 加大 |
| P2 | BG 牌面翻轉缺 3D | 父容器加 `perspective: 800px`，牌面加 `transform-style: preserve-3d` |
| P2 | BG 三張牌不響應 | 改用 % 或 vw 單位（如 width: 18vw; max-width: 100px） |
| P3 | 錢幣飛移物太小 | 飛行中 font-size 改 16-18px |
| P3 | BG 籌碼按鈕大小 | 改 clamp(32px, 8vw, 48px) |

### 總評：6.5/10
FG/BG 功能完整可用，視覺品質達「能展示」但不精緻。主要問題是尺寸固定（不響應）和動畫缺乏深度感（翻牌無 3D）。V3 DEMO 建議至少修 P2 項目。
