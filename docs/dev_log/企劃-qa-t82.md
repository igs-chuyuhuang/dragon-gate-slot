# 企劃-qa-t82 開發紀錄

### [2026-05-21] — 修正程式邏輯對齊技術規格書

**環節：** 程式
**AI 工具：** Kiro Agent
**做了什麼：** 根據技術規格書修正 4 個核心模組：JP 賠付改分段式、碰壁改正面結果、下注分配改 bet/3、餘額檢查改 bet×3
**Before：** JP 用線性 ratio (pool/9×ratio)、碰壁扣款 -2、下注直接傳 betPerRow、餘額檢查 bet×6
**After：** JP 分段式 (pool/7 × 60%/30%/10%)、碰壁 ×1.2 正面結果、calculate(bet) 內部 /3、canSpin >= bet×3
**關鍵 prompt / 指令：** 根據技術規格書修正程式邏輯（JP分段、碰壁正面、bet/3分配、餘額×3）
**人工修正：** 無
**耗時：** ~5 分鐘

### [2026-05-22] — 修復 Q symbol 盤面顯示消失問題

**環節：** 測試 / 美術
**AI 工具：** Kiro Agent
**做了什麼：** 排查 Q symbol 在盤面上不顯示的 bug。逐步檢查圖片資源、symlink、設定檔對應、程式碼載入邏輯，最終用 Python PIL 分析像素發現 CD-03_queen.png 圖片內容幾乎全黑（中心亮度 11.1，明亮像素僅 0.7%），是最近「重新生成全部 13 張牌面」時 Q 圖生成失敗。已用 PIL 重新生成替代圖並 push。
**Before：** Q 卡面圖片幾乎全黑，盤面上 Q 位置只看到空框
**After：** 重新生成 CD-03_queen.png（金色 Q 字、黑底、金框），Q 可正常顯示
**關鍵 prompt / 指令：** 排查 Q symbol 顯示不見原因，檢查圖片/設定/程式碼，找到根因後修復
**人工修正：** 無（建議美術 Agent 後續用 AI 生圖重新生成風格統一版本）
**耗時：** ~10 分鐘

### [2026-05-22] — 修復 Symbol「4」顯示為「44」的 Visual Bug

**環節：** 測試
**AI 工具：** Kiro Agent
**做了什麼：** 使用者回報盤面「4」symbol 顯示異常（看起來像「44」）。排查後發現 uiController.js 的 cellToImg() 同時渲染了 cell-label 文字標籤和圖片（圖片本身已有數字），造成視覺重疊。移除多餘的 cell-label span 修復問題。
**Before：** cellToImg() 輸出 `<span class="cell-label">4</span><img ...>`，文字與圖片數字重疊
**After：** cellToImg() 只輸出 `<img ...>`，移除 randomCellHtml() 中的 label 也一併處理
**關鍵 prompt / 指令：** 使用者回報盤面上「4」symbol 顯示異常，看起來像「44」，請進行 Visual QA
**人工修正：** 無
**耗時：** ~10 分鐘

### [2026-05-25] — Visual QA Report V2 + 建立 CURRENT_STATUS.md

**環節：** 測試 / 企劃
**AI 工具：** Kiro Agent
**做了什麼：** 完成 Visual QA Report V2（全面重新評估遊戲視覺品質，總評 6.5/10，列出 P0~P3 待修項目）。建立 `docs/CURRENT_STATUS.md` 即時狀態總覽文件，彙整各模組進度與待辦事項。
**Before：** 無系統性 QA 報告、無即時狀態追蹤機制
**After：** visual_qa_report.md V2 完成（7 大項目評分 + 優先級待修清單）、CURRENT_STATUS.md 上線（各模組狀態 + 待辦 + 最近完成）
**關鍵 prompt / 指令：** 進行完整 Visual QA 評估；建立專案即時狀態文件供所有 Agent 共用
**人工修正：** 無
**耗時：** ~15 分鐘

### [2026-05-25] — Visual QA Report V2 + DRAGON WIN 文字截斷修復

**環節：** 測試
**AI 工具：** Kiro Agent
**做了什麼：** 執行第二輪 Visual QA，產出完整報告（總評 6.5/10），列出 P0~P3 共 7 項待修問題。同時修復 P0 項目：Big Win「DRAGON」文字被截斷——將文字特效位置移到盤面上方居中 (top 15%)，z-index 提升到 1150。
**Before：** DRAGON WIN 文字被盤面遮擋/截斷；無系統性 QA 報告
**After：** Visual QA Report V2 完成（docs/visual_qa_report.md）；DRAGON WIN 文字正常顯示於盤面上方
**關鍵 prompt / 指令：** 執行 Visual QA 第二輪，產出報告並修復 P0 問題
**人工修正：** 無
**耗時：** ~15 分鐘

### [2026-05-25] — 建立專案即時狀態文件 CURRENT_STATUS.md

**環節：** 企劃
**AI 工具：** Kiro Agent
**做了什麼：** 建立 docs/CURRENT_STATUS.md，彙整所有模組（程式核心、前端UI、美術音效、數學模型、企劃QA、特效爽感、創意總監）的即時狀態、待辦事項、最近完成項目。
**Before：** 各 Agent 進度散落在各自 dev_log，無統一狀態總覽
**After：** docs/CURRENT_STATUS.md 上線，所有 Agent 可快速了解全局進度
**關鍵 prompt / 指令：** 新規則生效——啟動時讀 CURRENT_STATUS.md，完成任務後更新
**人工修正：** 無
**耗時：** ~5 分鐘

### [2026-05-25] — DRAGON WIN 文字特效位置修正

**環節：** 程式
**AI 工具：** Kiro Agent
**做了什麼：** 修正 Big Win「DRAGON WIN」文字特效位置，從盤面右側中間移到畫面最上方居中，z-index 提升到 1150 確保不被截斷
**Before：** DRAGON WIN 文字出現在盤面右側中間，被截斷
**After：** 文字顯示在盤面上方居中（top 15%），z-index 1150 在最上層
**關鍵 prompt / 指令：** 大獎文字特效要顯示在畫面最上方，確保完整顯示不被截斷
**人工修正：** 無
**耗時：** ~5 分鐘

### [2026-05-25] — 轉輪停止動畫迭代（v1→v5）

**環節：** 程式
**AI 工具：** Kiro Agent
**做了什麼：** 經過 5 次迭代，將轉輪停止動畫從基礎版升級到產品級：
- v1: 6段物理慣性（被否決：像平滑 scroll）
- v2: 格子節奏 tick（被否決：像跳格換圖）
- v3: 連續滑動 + motion blur（方向正確）
- v4: 產品版打磨（中輪焦點導引、停輪衝擊感、blur 加強、回彈俐落）
- v5: 漸進式減速緩衝（消除高速→慢格斷裂感，blur 隨速度同步漸消）
**Before：** 基礎 3 段動畫（加速→巡航→簡單 bounce），無慣性感
**After：** 產品級動畫：高速 blur 3px → easeOutCubic 減速緩衝 → 逐格揭曉 → overshoot 18% → 衝擊回彈 90ms + shake + flash。左右同停、中輪最後停（焦點導引 glow + 壓暗）
**關鍵 prompt / 指令：** 多次使用者反饋迭代：要連續滑動不要跳格、要格子節奏、要漸進減速無斷點
**人工修正：** 每版使用者反饋後調整方向（共 5 次迭代）
**耗時：** ~40 分鐘（含 5 次迭代）

### [2026-05-26] — 轉輪動畫 v11~v12 + UI 大改 + 中獎線演出系統

**環節：** 程式 / 企劃
**AI 工具：** Kiro Agent
**做了什麼：**
1. 轉輪動畫 v11：左右輪改為單一 easeOutCubic 連續減速，去除卡頓
2. 轉輪動畫 v12：decel 終點改為 overshoot position，消除「先停再彈」
3. Overshoot 微調（18%→15%→10%→5% CELL_TOTAL）
4. 押注區改為 +/- 按鈕操作（移除 5 個快捷按鈕）
5. 遊戲說明改為 i 按鈕 + 5 頁式 modal（箭頭翻頁、dots）
6. Auto 改為 stepper 設定面板（+/- 局數 10~100）
7. i 按鈕從轉輪框右上角移到底部操作列
8. 中獎資訊改為每列旁邊 badge 顯示（穿門金/碰壁橙/未中灰/Scatter紫）
9. 中獎線演出動畫系統（壓暗+金光掃線+glow pulse+粒子+badge pop）
10. 背景層次分離（blur+暗角+降飽和度，轉輪加強金色外發光）
11. 緊急修復：.reel-rolling::before 與 body::before 衝突導致 spin 黑屏
**Before：** 基礎 UI（快捷按鈕、單頁規則、無中獎演出）
**After：** 產品級 UI（+/- 控制、多頁 modal、stepper auto、badge+動畫中獎演出、層次分離背景）
**關鍵 prompt / 指令：** 多項 UI 改造需求 + 中獎線演出動畫系統 + 背景層次分離
**人工修正：** overshoot 數值經使用者反饋多次微調
**耗時：** ~3 小時（含多項任務）

### [2026-05-26] — 競品市場調查報告

**環節：** 企劃
**AI 工具：** Kiro Agent
**做了什麼：** 完成射龍門 Slot 競品市場調查報告，涵蓋亞洲主題老虎機市場概覽、重點競品分析（PG Soft/Pragmatic Play/JILI/Spadegaming）、3×3 盤面設計趨勢、JP 系統設計對標、撲克牌混合玩法參考、以及對射龍門的具體建議。
**Before：** 無系統性競品分析，設計決策缺乏市場依據
**After：** docs/market_research.md（383 行），含市場數據、競品對標表、差異化建議
**關鍵 prompt / 指令：** 進行競品市場調查，分析亞洲主題老虎機市場趨勢與設計標準
**人工修正：** 無
**耗時：** ~15 分鐘

### [2026-05-27] — 美術風格規格 + 差異分析 + Free Game 自動轉修復

**環節：** 企劃 / 測試
**AI 工具：** Kiro Agent
**做了什麼：** 
1. 根據 reference 圖產出美術風格規格書（docs/art_direction.md）與目前版本差異分析（docs/art_gap_analysis.md），定義「翡翠龍門國潮仙境」視覺方向。
2. 修復 Free Game 自動轉 bug：FG 模式下需手動按 SPIN → 改為自動連續 spin（400ms 間隔）。
**Before：** 無明確美術風格規格，各素材風格不統一；FG 需手動按 SPIN
**After：** art_direction.md（180 行）+ art_gap_analysis.md（172 行）完成；FG 自動連續轉正常運作
**關鍵 prompt / 指令：** 基於 reference 圖分析美術風格差異、產出規格書；修復 FG 自動轉
**人工修正：** 無
**耗時：** ~20 分鐘

### [2026-05-27] — assetsv2 新素材重做遊戲畫面 + Free Game 自動轉修復

**環節：** 程式 / 美術整合
**AI 工具：** Kiro Agent
**做了什麼：**
1. 用 art/assetsv2/ 的 22 張新素材（翡翠龍門國潮風）重做整個遊戲畫面
2. HTML/CSS 完全重寫為手機版 9:16 佈局（龍門牌坊外框、翡翠牌面、紅金操作列、小龍吉祥物）
3. 建立 21 個 symlink 指向 assetsv2
4. JS 更新 CELL_H=98, GAP=2, CELL_TOTAL=100
5. 修復 Free Game 自動轉停頓（doSpin 結束後 400ms 自動觸發下一轉）
6. 修正畫面佈局問題（背景填滿、gap=0 緊湊排列、外框緊貼盤面）
**Before：** 舊版暗色金框風格（assetsv1），FG 需手動按 SPIN
**After：** 翡翠龍門國潮風格（assetsv2），FG 自動連續轉，佈局緊湊無空白
**關鍵 prompt / 指令：** 用 assetsv2 新素材重做遊戲畫面（手機版 9:16）+ 修復 FG 自動轉 + 修正佈局空白
**人工修正：** 使用者截圖反饋佈局問題後修正
**耗時：** ~30 分鐘
