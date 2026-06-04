# 射龍門 Slot — 專案即時狀態

> 最後更新：2026-06-04 16:13 by 企劃-qa-t82

## 目前版本：V2 → V3 進行中

## 各模組狀態

### 程式核心
- ✅ SlotEngine、DragonGateJudge、PayoutCalculator、GameManager
- ✅ JP 系統（三層：Basic/Major/Grand）
- ✅ Free Game v2.0：中輪自帶💰分數、穿門贏獎錢幣飛移動畫
- ✅ Bonus Game：籌碼下注、三張牌瞇牌、穿門/碰壁判定、倒數計時、收手機制
- ✅ FG/BG 選擇畫面（Scatter 累積觸發後二選一）
- ✅ Scatter 累積收集制（碰壁扣1燈、同值扣2燈）

### 程式前端/UI
- ✅ 3×3 盤面 + 產品級 reel 動畫 v12
- ✅ FG 全螢幕結算 overlay（數字跳動 + BIG WIN）
- ✅ BG 全螢幕結算 overlay（共用 FG 結算畫面）
- ✅ BG inline UI（bonus game.png 背景 + 三張牌 + SPIN→「發」+ 籌碼按鈕）
- ✅ Scatter 進度環（SVG 圓弧 + 龍圖）
- ✅ 押注 +/- 按鈕、Auto stepper、遊戲說明 modal
- ✅ 手機版 + 桌面版適配

### 美術音效
- ✅ 13 張牌面素材統一國潮風格
- ✅ Scatter 龍圖片、特效圖片、背景圖
- ✅ bonus game.png（BG 進場背景）
- ✅ BG 牌面圖片（正面/牌背）
- ✅ 音效：spin_release、dragon_roar

### 數學模型
- ✅ RTP 96.4% 設計完成
- ✅ 賠付表、JP 貢獻比例、Scatter 觸發率

### 企劃/QA
- ✅ 企劃規格書 v2.0（Main/Free/Bonus 三種玩法）
- ✅ Visual QA Report V2
- ✅ FG/BG 功能 QA 通過

## 待辦事項

### V3 DEMO 版目標 (6/23) — 剩 19 天
- [ ] P1: 碰壁特效強化（camera shake + 裂痕 overlay）
- [ ] P1: Scatter 獨立揭曉動畫（光柱+震動+逐一揭曉）
- [ ] P2: 穿門 flash 透明度降低 30%
- [ ] P2: 高 Combo 光暈太濃導致盤面不可見
- [ ] 音效完善（各特效配音：穿門、碰壁、BG 發牌、FG 錢幣飛移）
- [ ] BG 視覺打磨（牌面翻轉動畫優化、結果文字特效）
- [ ] FG 中輪錢幣視覺優化（更大、更醒目）
- [ ] 整體流暢度優化
- [ ] 可展示狀態最終檢查

## 最近完成
- [6/3] FG 中輪自帶分數（💰標籤跟著轉動）+ 穿門錢幣飛移動畫
- [6/2] Free Game v2.0 重寫（judgeBoard + 三格獨立獎勵）
- [6/2] FG 全螢幕結算 overlay + BG 全螢幕結算
- [6/2] Bonus Game 完整實作（inline UI + 籌碼 + 瞇牌 + 倒數 + 收手）
- [6/2] FG 右側轉軸（後移除，改中輪自帶分數）
- [6/1] Scatter 進度環 Visual QA + 音訊轉文字環境設定
- [5/29] 玩法大改提案分析 + 挑戰者辯論
