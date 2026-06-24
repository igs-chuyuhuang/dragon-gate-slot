# 射龍門 Slot — 專案即時狀態

> 最後更新：2026-06-04 16:13 by 企劃-qa-t82

## 目前版本：V2 → V3 開發中

## 各模組狀態

### 程式核心
- ✅ 核心邏輯完成：SlotEngine、DragonGateJudge、PayoutCalculator、GameManager
- ✅ JP 系統（三層：Basic/Major/Grand）
- ✅ Free Game v2.0：中輪自帶💰金額、穿門贏獎錢幣飛移動畫
- ✅ Bonus Game 完整可玩：籌碼下注、瞇牌揭曉、穿門/碰壁判定、倒數計時、收手
- ✅ FG/BG 選擇畫面（Scatter 觸發時二選一）
- ✅ Web 版完整可玩（HTML5 + JS ESM）

### 程式前端/UI
- ✅ 3×3 盤面 + 產品級 reel 動畫 v12
- ✅ FG 中輪 symbol 自帶分數標籤跟著轉動
- ✅ FG 全螢幕結算 overlay（數字跳動 + BIG WIN）
- ✅ BG 全螢幕結算 overlay（共用 FG 結算畫面）
- ✅ BG inline UI：bonus game.png 背景 + 三張牌 + SPIN→「發」+ 籌碼按鈕
- ✅ 手機版 + 桌面版適配
- ✅ Scatter 進度環（SVG 10段圓弧 + 龍圖）

### 美術音效
- ✅ 13 張牌面素材統一國潮風格
- ✅ Scatter 龍圖片、特效素材、背景圖、bonus game.png
- ✅ 音效：spin_release、dragon_roar

### 數學模型
- ✅ RTP 96.4% 設計完成
- ✅ 賠付表定義（極窄15x/窄6x/中3x/寬1x）
- ✅ Scatter 累積收集制模擬完成

### 企劃/QA
- ✅ 企劃規格書 v2.0（三種玩法：Main/Free/Bonus）
- ✅ FG/BG 功能實作完成
- ✅ 玩法大改提案分析 + 挑戰者辯論（結論：6/23 前維持現有）
- ⏳ Visual QA P1/P2 issues 待修

### 特效爽感
- ✅ 8 大特效模組、gameFeel.js 架構
- ⏳ P1: 碰壁特效太弱、Scatter 缺獨立揭曉動畫

## 待辦事項

### Visual QA 待修
- [x] P0: Big Win 文字截斷 ✅
- [ ] P1: 碰壁特效太弱，需加 camera shake + 裂痕
- [ ] P1: Scatter 缺少獨立揭曉動畫
- [ ] P2: 穿門 flash 太強（透明度降低 30%）
- [ ] P2: 高 Combo 光暈太濃
- [ ] P3: JP 進度條精緻度
- [ ] P3: 高牌專屬角色圖案

### V3 DEMO 版目標 (6/23)
- [ ] FG/BG 流程測試 + bug 修復
- [ ] 微調所有特效品質
- [ ] 音效完善
- [ ] 整體流暢度優化
- [ ] 可展示狀態

## 最近完成
- [6/3] FG 中輪自帶分數（💰標籤跟著轉動）+ 錢幣飛移到 badge 動畫
- [6/2] FG v2.0 重寫 + Bonus Game 完整實作
- [6/2] FG 全螢幕結算 overlay + BG 結算 overlay
- [6/2] BG inline UI（bonus game.png + 三張牌 + 籌碼按鈕 + SPIN→發）
- [6/1] Scatter 進度環 Visual QA + 音訊轉文字環境設定
- [5/29] 玩法大改提案分析 + 挑戰者辯論
- [5/28] 企劃規格書 v2.0 + dev/ 版本重構
