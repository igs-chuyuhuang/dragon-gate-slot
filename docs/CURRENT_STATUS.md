# 射龍門 Slot — 專案即時狀態

> 最後更新：2026-06-04 16:13 by 企劃-qa-t82

## 目前版本：V2 → V3 開發中

## 各模組狀態

### 程式核心
- ✅ 核心邏輯完成：SlotEngine、DragonGateJudge、PayoutCalculator、GameManager
- ✅ JP 系統（三層：Basic/Major/Grand）
- ✅ Free Game v2.0：中輪自帶💰分數標籤（跟著轉動）、穿門時錢幣飛移到 badge
- ✅ Bonus Game 完整實作：bonusGame.js、籌碼下注、瞇牌 flip、倒數計時、收手機制
- ✅ FG/BG 選擇畫面（Scatter 觸發時二選一）
- ✅ Web 版完整可玩（HTML5 + JS ESM）

### 程式前端/UI
- ✅ 3×3 盤面 + 產品級 reel 動畫 v12
- ✅ FG 全螢幕結算 overlay（數字跳動 + BIG WIN）
- ✅ BG 全螢幕結算 overlay（共用 FG 結算畫面）
- ✅ BG inline UI：bonus game.png 背景 + 三張牌 + SPIN→「發」+ 圓形籌碼按鈕
- ✅ 手機版 + 桌面版適配
- ✅ Scatter 進度環（SVG 10 段圓弧 + 龍圖）

### 美術音效
- ✅ 13 張牌面素材統一國潮風格
- ✅ Scatter 龍圖片、特效圖片、背景圖
- ✅ bonus game.png 背景
- ✅ 音效：spin_release、dragon_roar

### 數學模型
- ✅ RTP 96.4% 設計完成
- ✅ 賠付表、JP 貢獻比例、Scatter 觸發率
- ✅ Scatter 累積收集制模擬（推薦門檻 8 + SR 5%）

### 企劃/QA
- ✅ 企劃規格書 v2.0（三種玩法 Main/Free/Bonus）
- ✅ Visual QA Report V2（總評 6.5/10）
- ✅ 玩法大改提案分析 + 挑戰者辯論（結論：6/23 前維持現有）
- ⏳ Visual QA P1/P2 待修項目（見下方待辦）

### 特效爽感
- ✅ 8 大特效模組實作完成
- ✅ FG 錢幣飛移動畫（中輪→badge，600ms easeOut + scale）

## 待辦事項

### Visual QA P1/P2 待修
- [ ] P1: 碰壁特效太弱（<200ms），需加 camera shake + 裂痕 overlay
- [ ] P1: Scatter 缺少獨立揭曉動畫（光柱+震動+逐一揭曉）
- [ ] P2: 穿門 flash 太強遮蓋盤面（透明度降低 30%）
- [ ] P2: 高 Combo 光暈太濃導致盤面不可見

### V3 DEMO 版目標 (6/23)
- [ ] 微調所有特效品質
- [ ] 音效完善（各特效配音）
- [ ] 整體流暢度優化
- [ ] 可展示狀態

## 最近完成
- [6/3] FG 中輪自帶分數（💰標籤跟著轉動）+ 錢幣飛移動畫
- [6/2] FG v2.0 重寫（三格獨立獎勵→中輪自帶）+ 四軸同步動畫
- [6/2] Bonus Game 完整實作（inline UI + 籌碼 + 瞇牌 + 倒數 + 結算）
- [6/2] FG/BG 全螢幕結算 overlay
- [6/1] Scatter 進度環 Visual QA + 音訊轉文字環境設定
- [5/29] 玩法大改提案可行性分析 + 挑戰者辯論
