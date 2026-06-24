# 射龍門 Slot — 前端開發規格書

> 最後更新：2026-05-29

## 1. 素材清單

### 圖片素材 (dev/assets/img/)

| 檔名 | 用途 |
|------|------|
| BG.png | 主背景 |
| BG-01_main_bg_mobile.png | 手機版背景 |
| FR-01_slot_frame_mobile.png | Slot 外框 |
| SC-01_scatter_dragon.png | Scatter 龍符號 |
| CD-01_ace.png | 牌面：A |
| CD-02_king.png | 牌面：K |
| CD-03_queen.png | 牌面：Q |
| CD-04_jack.png | 牌面：J |
| CD-05_num2.png ~ CD-13_num10.png | 牌面：2~10 |
| MS-01_mascot_dragon.png | 小龍吉祥物 |
| UI-01_bottom_bar_bg.png | 底部紅色裝飾框 |
| UI-04_spin_btn_normal.png | SPIN 按鈕圖 |
| BTN-06_plus.png | + 按鈕 |
| BTN-07_minus.png | - 按鈕 |
| effects/ | 特效圖片目錄 |

### 音效素材 (dev/assets/sfx/)

| 檔名 | 觸發時機 |
|------|---------|
| spin_charge | Spin 開始蓄力 |
| spin_release | 轉軸停止 |
| wall_hit | 碰壁 |
| gate_through | 穿門 |
| gate_open | 門開啟 |
| dragon_roar | 龍吼（FG觸發） |
| dragon_growl | 龍低吼（Scatter） |
| dragon_fly | 龍飛行 |
| heartbeat | 心跳（緊張時刻） |
| drum_hit | 鼓擊 |
| drum_roll | 鼓滾 |
| coin_count | 贏分計數 |
| combo_hit | 連擊 |
| score_fly | 分數飛出 |
| crack | 碰壁裂痕 |
| crowd_cheer | 群眾歡呼 |
| jp_win | JP 中獎 |

每個音效同時提供 .wav 和 .mp3 格式。

---

## 2. 畫面佈局 (Viewport 390×844)

### 遊戲區域

| 元素 | left | top | width | height |
|------|------|-----|-------|--------|
| 背景 (BG) | 0 | 0 | 100% | 100% |
| 轉軸 #0 (左) | 17.2% | 34.0% | 17.5% | 35.8% |
| 轉軸 #1 (中) | 36.3% | 34.0% | 17.7% | 35.8% |
| 轉軸 #2 (右) | 55.6% | 34.0% | 17.5% | 35.8% |
| Badge #0 | 77.6% | 35.4% | 14.4% | 10.1% |
| Badge #1 | 77.6% | 48.3% | 14.4% | 9.9% |
| Badge #2 | 77.6% | 61.0% | 14.4% | 9.7% |
| 小龍吉祥物 | -6.4% | 66.9% | 40% | auto |

### 底部控制面板

| 元素 | left | top | width | height |
|------|------|-----|-------|--------|
| 餘額 | 7.7% | 87.9% | — | — |
| 自動按鈕 | 26.7% | 89.8% | 12.3% | 2.6% |
| SPIN | 50% (translateX -50%) | 87.0% | 13.3% | 13.3% |
| 投注區 | 56.9% | 87.9% | 20% | — |
| − 按鈕 | 59.7% | 90.8% | 18px | 18px |
| + 按鈕 | 70.8% | 90.8% | 18px | 18px |
| 贏分 | 80.8% | 87.9% | — | — |
| 音量按鈕 | 9.7% | 96.2% | 11.8% | 3.8% |
| i 資訊按鈕 | 79.5% | 96.2% | 8.7% | 3.8% |

---

## 3. 動畫系統

### 轉軸動畫參數

- 符號數量：側輪 30 個、中輪 50 個
- 高速階段：線性，速度 = sideScrollDist / 700ms
- 減速階段：
  - 側輪：9 格距離，1350ms，`cubic-bezier(0.22, 1, 0.36, 1)`
  - 中輪：18 格距離，2400ms，`cubic-bezier(0.16, 1, 0.3, 1)`
- Overshoot：格高 × 5%
- Bounce back：90ms，`cubic-bezier(0.33, 1, 0.68, 1)`
- 停軸衝擊：board shake translateY(1px) 50ms

### 特效模組 (dev/js/effects/)

| 模組 | 功能 | 觸發時機 |
|------|------|---------|
| sfxBus.js | 音效播放 (playSfx/stopSfx/playLayered) | 全域 |
| spinButton.js | SPIN 按鈕特效 (initSpinButton) | 初始化 |
| reelStop.js | 轉軸停止特效 (onSpinStart/onColumnStop/onSpinEnd) | Spin 流程 |
| wallHit.js | 碰壁特效 (playWallHit(row)) | 碰壁判定 |
| gateThrough.js | 穿門特效 (playGateThrough(row, mult)) | 穿門判定 |
| winLine.js | 贏線特效 (playWinLine/playWinLines) | 贏分 |
| scatterReveal.js | Scatter 揭示 (revealScatters(board, count)) | Scatter ≥ 3 |
| comboSystem.js | 連擊系統 | 連續贏分 |
| bigWin.js | 大獎特效 | 高額贏分 |
| freeGameTransition.js | FG 轉場 | FG 觸發/結束 |
| cameraFeel.js | 鏡頭震動 | 碰壁/大獎 |
| particlePool.js | 粒子池 | 各特效共用 |
| vfxTypo.js | 文字特效 | 贏分顯示 |
| fgMeter.js | FG 計量條 | FG 進行中 |
| jpReveal.js | JP 多段揭曉 | JP 中獎 |

---

## 4. 遊戲功能

### 核心邏輯

- **盤面**：3×3 Slot
- **符號**：1~13（A, 2~10, J, Q, K）+ Scatter 龍
- **Scatter 機率**：5%

### 投注系統

- 投注選項：5 / 10 / 20 / 50 / 100
- 每次 Spin 扣除：bet × 3（三列各一注）
- 餘額檢查：balance ≥ bet × 3

### 判定規則（射龍門）

- 左右欄決定「門寬」，中欄判定穿門
- **穿門**：中欄值在左右欄值之間
  - 極窄（差1）：×6
  - 窄（差2）：×4
  - 中（差3~4）：×2
  - 寬（差5+）：×1
- **碰壁**：中欄值等於左或右欄值 → ×1.2
- **未中**：中欄值在門外 → 無賠付

### JP 系統

- 三層：Basic / Major / Grand
- 每次 Spin 貢獻 bet×3 到 JP 池
- FG 結束時評估 JP Gate

### Free Game

- Scatter ≥ 3 觸發，8 轉
- FG 中可延長
- FG 結束後結算總分 + JP 評估

### Auto Spin

- 可設定 10~100 局（步進 10）
- 進行中可隨時取消

---

## 5. 設計 Tokens

| Token | 值 |
|-------|---|
| 主色（金色漸層） | #C8A84B → #FFD700 |
| 背景色 | 透明（使用遊戲背景紅色裝飾框） |
| 文字主色 | #FFFFFF |
| 文字副色（標籤） | 金色漸層 (gradient clip) |
| 按鈕邊框 | 1.5px solid #C8A84B |
| 按鈕背景 | rgba(13,9,6,0.8) |
| 按鈕圓角 | 50px (pill) |
| SPIN 文字 | #FFD700, 900 weight, 2px letter-spacing |
| 數值文字 | #FFF, bold, text-shadow rgba(255,215,0,0.2) |
| 字體 | Noto Sans TC |

---

## 6. 檔案結構

```
dev/
├── index.html              ← 主頁面（遊戲 + UI + 邏輯）
├── css/
│   └── game.css            ← 全部樣式
├── js/
│   ├── slotEngine.js       ← 盤面生成（spin, countScatters）
│   ├── gameManager.js      ← 遊戲管理（餘額、投注、FG、JP）
│   ├── dragonGateJudge.js  ← 穿門判定
│   ├── payoutCalculator.js ← 派彩計算
│   ├── freeGame.js         ← Free Game 系統
│   ├── jpSystem.js         ← JP 彩金系統
│   ├── gameFeel.js         ← 特效主模組
│   └── effects/            ← 特效子模組（15 個）
├── assets/
│   ├── img/                ← 圖片素材（牌面、背景、UI、特效）
│   └── sfx/                ← 音效素材（17 個，wav + mp3）
```
