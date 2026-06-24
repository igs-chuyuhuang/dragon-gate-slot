# 射龍門 Slot — 專案總覽

> 自動產生於 2026-06-24，來源：docs/ 目錄下現有文件

## 專案定位

AI 輔助老虎機遊戲開發競賽專案。以「射龍門」傳統撲克牌遊戲為主題，結合 Slot Machine 機制，透過多角色 AI Agent 分工協作完成 Web 可玩原型（HTML5）。

## 遊戲核心規格

| 項目 | 規格 |
|------|------|
| 遊戲名稱 | 射龍門 Slot / Dragon Gate Slot |
| 盤面配置 | 3×3 |
| 牌值範圍 | A（1）→ K（13） |
| 三種玩法 | Main Game / Free Game / Bonus Game |
| 觸發條件 | 收集 10 個 Scatter → 玩家選擇 FG 或 BG |
| 投注選項 | 15 / 30 / 60 / 150 / 300 |
| RTP 目標 | 96.4% |
| 彩金池 | 3 級（Basic / Major / Grand） |

## 玩法簡述

### Main Game
- 3×3 轉軸，左右欄定「門寬」，中欄判定穿門
- 穿門賠率：極窄 ×15 / 窄 ×6 / 中 ×3 / 寬 ×1
- 碰壁（中=左或右）：不扣錢，但扣 Scatter 燈號
- Scatter 龍符號累積制，集滿 10 個觸發特殊玩法

### Free Game（8 轉加強版）
- 中間門自帶額外倍率（×5、×10 等）
- 穿門時基本賠付 × 額外倍率
- 不出現 Scatter

### Bonus Game（真實射龍門牌局）
- 系統給予 bet×50 籌碼
- 90 秒限時，每局 15 秒決策
- 穿門贏彩金池、碰壁扣 2 倍、撞柱扣 3 倍
- 可隨時收手帶走已贏金額

## 技術架構

- **前端**：HTML5 + CSS + JavaScript ESM（無框架）
- **目錄**：`dev/` 為主要開發版本
- **動畫**：原生 CSS + JS requestAnimationFrame
- **風格**：Modern Guochao（現代國潮：墨黑底／中國紅／燙金）
- **字體**：Noto Sans TC

### 核心模組

| 模組 | 職責 |
|------|------|
| slotEngine.js | 盤面生成（RNG、Scatter 判定） |
| gameManager.js | 遊戲狀態管理（餘額、投注、流程） |
| dragonGateJudge.js | 穿門/碰壁判定邏輯 |
| payoutCalculator.js | 派彩計算 |
| freeGame.js | Free Game 系統 |
| jpSystem.js | Jackpot 彩金池系統 |
| gameFeel.js | 特效主控（15 個子模組） |

## 目前狀態（截至 2026-06-04）

- ✅ Main Game / Free Game / Bonus Game 全部可玩
- ✅ JP 三層系統完成
- ✅ Web 版完整可玩
- ✅ 手機版 + 桌面版適配
- ✅ RTP 96.4% 驗證完成
- ⏳ Visual QA P1/P2 待修（碰壁特效、Scatter 動畫）
- ⏳ V3 DEMO 版整體打磨中

## 團隊結構（AI Agent）

| Agent | 職責 |
|-------|------|
| AI Producer | 統籌協調、任務拆解 |
| 企劃 QA | 規格書、測試驗證 |
| 數學模型 | RTP、賠付表、機率模擬 |
| 程式核心 | 遊戲邏輯實作 |
| 程式前端 | UI/動畫/特效 |
| 美術音效 | 素材生成與調整 |
| 創意總監 | 玩法創新、wow moment |
| 特效爽感 | 動畫節奏、easing、音效 |
| 市場調查 | 競品分析、趨勢研究 |
| 挑戰者 | 辯證提案、壓力測試 |

## 相關頁面

- [[entity/main-game]] — Main Game 詳細規則
- [[entity/free-game]] — Free Game 系統
- [[entity/bonus-game]] — Bonus Game 系統
- [[entity/jackpot]] — Jackpot 彩金池
- [[topic/rtp-math]] — RTP 數學模型
- [[topic/visual-effects]] — 特效系統
- [[topic/ui-layout]] — UI 佈局規格
