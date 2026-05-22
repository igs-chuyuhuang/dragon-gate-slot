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