# 射龍門 Slot — 專案即時狀態

> 最後更新：2026-05-26 15:33 by 企劃-qa-t82

## 目前版本：V2

## 各模組狀態

### 程式核心
- ✅ 核心邏輯完成：SlotEngine、DragonGateJudge、PayoutCalculator、GameManager
- ✅ JP 系統（三層：Basic/Major/Grand，分段式賠付）
- ✅ Free Game 系統
- ✅ 碰壁改正面結果（×1.2）、bet/3 分配、餘額檢查 bet×3
- ✅ Web 版完整可玩（HTML5 + JS ESM）

### 程式前端/UI
- ✅ 3×3 盤面 + 產品級 reel 動畫 v12（decel 直達 overshoot → bounce 回彈，無「先停再彈」卡頓）
- ✅ 中輪左右停後 ~3.3s 定格（700ms 高速encore + 2400ms 減速 + 170ms overshoot）
- ✅ 遊戲說明 i 按鈕 + 5 頁式 modal（箭頭翻頁、dots、遊戲風格）
- ✅ 押注 +/- 按鈕 UI（遊戲風格、到極值 disabled）、Auto stepper 面板（±10局）、JP 顯示
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
- ✅ 企劃規格書 v1.4 更新（5/25）：碰壁改-2倍、Scatter 二選一、Free Game/Bonus Game 重新定義、列旁結算顯示、JP 跳動動畫

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
- [5/25] 企劃規格書 v1.4：碰壁-2倍、Scatter 二選一、FG/BG 重定義、列旁結算、JP 動畫
- [5/26] 中獎線演出動畫系統（壓暗+金光+glow+粒子+badge pop，多列依序）
- [5/26] 中獎資訊改為每列旁邊 badge 顯示（穿門金/碰壁橙/未中灰/Scatter紫）
- [5/26] Auto 改為 stepper 設定面板（+/- 局數、開始/取消）
- [5/26] 遊戲說明改為 i 按鈕 + 5 頁式 modal
- [5/26] 押注區改為 +/- 按鈕操作（移除快捷按鈕）
- [5/26] 轉輪動畫 v12：decel 直達 overshoot，消除「先停再彈」
- [5/26] 轉輪動畫 v11：左右輪改單一 easeOutCubic 連續減速，去除卡頓
- [5/25] 轉輪動畫 v5：漸進式減速緩衝消除斷裂感，blur 隨速度同步
- [5/25] 重寫轉輪停止動畫：6段物理慣性感（已被 v2 取代）
- [5/25] 修正 DRAGON WIN 文字特效位置（移到盤面上方居中）
- [5/25] Visual QA Report V2 完成
- [5/22] 修復 Symbol「4」顯示為「44」重複渲染 bug
- [5/22] 美術重新生成 4 牌面 + 全牌面審核
- [5/21] 程式邏輯對齊技術規格書（JP分段、碰壁正面、bet/3、餘額×3）
- [5/21] 特效大改版：8 大項全面強化
- [5/20] 特效爽感規格書 + 首批 4 項特效實作
- [5/18] V1 核心邏輯完成（Spin→判定→派彩）
