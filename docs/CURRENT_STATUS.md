# 射龍門 Slot — 專案即時狀態

> 最後更新：2026-06-04 16:13 by 企劃-qa-t82

## 目前版本：V2 → V3 開發中

## 各模組狀態

### 程式核心
- ✅ 核心邏輯完成：SlotEngine、DragonGateJudge、PayoutCalculator、GameManager
- ✅ JP 系統（三層：Basic/Major/Grand）
- ✅ Free Game v2.0：中輪自帶💰獎金、穿門時錢幣飛移到 badge
- ✅ Bonus Game 完整：籌碼下注、瞇牌揭曉、穿門/碰壁判定、倒數計時、收手機制
- ✅ FG/BG 選擇畫面（Scatter 觸發時二選一）
- ✅ Web 版完整可玩（HTML5 + JS ESM）

### 程式前端/UI
- ✅ 3×3 盤面 + 產品級 reel 動畫 v12
- ✅ FG 結算全螢幕 overlay（數字跳動 + BIG WIN）
- ✅ BG 結算全螢幕 overlay（共用 FG 結算畫面）
- ✅ BG inline UI：三張牌在轉軸區域、SPIN→「發」、籌碼圓形按鈕
- ✅ BG 進場 bonus game.png 背景
- ✅ 手機版 + 桌面版適配
- ✅ Scatter 進度環（SVG 10 段圓弧 + 龍圖）

### 美術音效
- ✅ 13 張牌面素材（國潮風格）
- ✅ Scatter 龍圖片 + bonus game.png
- ✅ 背景圖 + 特效圖片素材
- ✅ 音效：spin_release、dragon_roar

### 數學模型
- ✅ RTP 96.4% 設計完成
- ✅ 賠付表定義（極窄15x/窄6x/中3x/寬1x）
- ✅ FG 獎金符號池：+15/+30/+60/+90/+120/+200/+500/—

### 企劃/QA
- ✅ 企劃規格書 v2.0（三種玩法：Main/Free/Bonus）
- ✅ Visual QA Report V2
- ✅ Scatter 進度環 Visual QA（發現桌面版尺寸 bug）
- ⏳ 待推進：V3 品質微調、特效打磨

## 待辦事項

### Visual QA 待修（P1/P2）
- [ ] P1: 碰壁特效太弱，需加 camera shake + 裂痕 overlay
- [ ] P1: Scatter 缺少獨立揭曉動畫
- [ ] P2: 穿門 flash 太強遮蓋盤面
- [ ] P2: 高 Combo 光暈太濃

### V3 DEMO 版目標 (6/23)
- [ ] 微調所有特效品質
- [ ] 音效完善（各特效配音）
- [ ] 整體流暢度優化
- [ ] BG 牌面動畫精緻化
- [ ] 可展示狀態

## 最近完成
- [6/3] FG 中輪自帶分數 + 錢幣飛移動畫
- [6/2] FG v2.0 重寫（三格獨立獎勵→中輪自帶）+ FG/BG 結算 overlay
- [6/2] Bonus Game 完整實作（inline UI + 籌碼 + 瞇牌 + 倒數 + 收手）
- [6/1] Scatter 進度環 Visual QA + 音訊轉文字環境設定
- [5/29] 玩法大改提案可行性分析 + 挑戰者辯論
