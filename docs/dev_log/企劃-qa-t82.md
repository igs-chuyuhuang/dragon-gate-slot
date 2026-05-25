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
