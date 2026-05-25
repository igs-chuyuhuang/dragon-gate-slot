# 射龍門 Slot — 專案即時狀態

> 最後更新：2026-05-25 16:55 by 企劃-qa-t82

## 目前版本：V2

## 各模組狀態

### 程式核心
- ✅ 核心邏輯完成：SlotEngine、DragonGateJudge、PayoutCalculator、GameManager
- ✅ JP 系統（三層：Basic/Major/Grand，分段式賠付）
- ✅ Free Game 系統
- ✅ 碰壁改正面結果（×1.2）、bet/3 分配、餘額檢查 bet×3
- ✅ Web 版完整可玩（HTML5 + JS ESM）

### 程式前端/UI
- ✅ 3×3 盤面 + 垂直滾動 strip 動畫（格子節奏感：快轉→tick逐格減速→overshoot→乾淨回彈）
- ✅ 停軸順序左+右同停→中輪最後（中輪 5 tick 加強期待感）
- ✅ 規則說明頁面（右上角 ? 按鈕）
- ✅ 下注按鈕式 UI、Auto spin、JP 顯示
- ✅ 手機版 (390×844) + 桌面版 (1280×720) 適配
- ✅ 節奏對標大廠（spin ~1s、停軸間隔 150ms、thud 音效）

### 美術音效
- ✅ 13 張牌面素材統一國潮風格（Pollinations.ai）
- ✅ Scatter 龍圖片
- ✅ 7 張特效圖片素材
- ✅ 背景圖（中式宮殿門樓）
- ✅ 音效：spin_release、dragon_roar

### 數學模型
- ✅ RTP 96.4% 設計完成
- ✅ 賠付表定義（極窄6x/窄4x/中2x/寬1x/碰壁1.2x）
- ✅ JP 貢獻比例、Scatter 觸發率

### 企劃/QA
- ✅ 技術規格書完成
- ✅ Visual QA Report V2 完成（總評 6.5/10）
- ✅ Symbol 重疊 bug 已修復（5/22）

### 特效爽感
- ✅ 8 大特效模組實作完成：Spin 蓄力、穿門火花、碰壁裂痕、Combo 連擊、Big Win、Scatter 揭曉、JP 多段揭曉、Free Game 轉場
- ✅ gameFeel.js + effects/ 模組化架構
- ✅ Playwright Visual QA 測試腳本

### 創意總監
- 尚無獨立產出紀錄

## 待辦事項

### 來自 Visual QA Report V2 (2026-05-25)
- [x] P0: Big Win「DRAGON」文字截斷修復 ✅ (5/25 已修正位置到盤面上方)
- [ ] P1: 碰壁特效太弱（<200ms 幾乎看不到），需加 camera shake + 裂痕 overlay
- [ ] P1: Scatter 缺少獨立揭曉動畫（光柱+震動+逐一揭曉）
- [ ] P2: 穿門 flash 太強遮蓋盤面（透明度降低 30%）
- [ ] P2: 高 Combo 光暈太濃導致盤面不可見
- [ ] P3: JP 進度條視覺精緻度提升
- [ ] P3: 高牌（J/Q/K/A）加入專屬角色圖案

### V3 DEMO 版目標 (6/23)
- [ ] 微調所有特效品質
- [ ] 音效完善（各特效配音）
- [ ] 整體流暢度優化
- [ ] 可展示狀態

## 最近完成
- [5/25] 轉輪動畫 v2：改為格子節奏感 tick-by-tick（取代平滑 scroll 版）
- [5/25] 重寫轉輪停止動畫：6段物理慣性感（已被 v2 取代）
- [5/25] 修正 DRAGON WIN 文字特效位置（移到盤面上方居中）
- [5/25] Visual QA Report V2 完成
- [5/22] 修復 Symbol「4」顯示為「44」重複渲染 bug
- [5/22] 美術重新生成 4 牌面 + 全牌面審核
- [5/21] 程式邏輯對齊技術規格書（JP分段、碰壁正面、bet/3、餘額×3）
- [5/21] 特效大改版：8 大項全面強化
- [5/20] 特效爽感規格書 + 首批 4 項特效實作
- [5/18] V1 核心邏輯完成（Spin→判定→派彩）
