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

### [2026-05-28] — 企劃規格書 v1.5 + Agent 協作總結

**環節：** 企劃
**AI 工具：** Kiro Agent
**做了什麼：** 更新企劃規格書至 v1.5，將 Scatter 機制從「3 顆觸發」改為「累積收集制」（碰壁扣 1 燈、同值扣 2 燈、門檻待數學確認）。另新增 Agent 協作總結文件，記錄各 Agent 分工與協作流程。
**Before：** Scatter 為傳統 3 顆觸發制；無協作流程文件
**After：** game_design.md v1.5（Scatter 累積收集制）、agent_workflow_summary.md 新增
**關鍵 prompt / 指令：** Scatter 改為累積收集制，整合數學模型 Agent 的機率分析結果（推薦門檻 8 + SR 5%）
**人工修正：** 無
**耗時：** ~10 分鐘

### [2026-05-28] — dev/ 版本完全重構（固定座標系→純CSS responsive→BG底圖架構）

**環節：** 程式
**AI 工具：** Kiro Agent
**做了什麼：**
1. dev/ 改為固定 1080×1920 座標系 + responsive scale（後因手機不生效而放棄）
2. 改為純 CSS responsive（vw/vh/%），移除 JS transform scale
3. 修復手機版 3×3 顯示問題（cell 高度=reel/3 精確填滿）
4. 修復功能性問題（SPIN z-index、pointer-events、+/- 按鈕）
5. 盤面重構：reel 背景透明，cell 獨立深紅背景+金框
6. 最終改為 BG.png 底圖 + absolute positioned cells 架構
7. 整合完整遊戲邏輯（SPIN、結算、badge、押注、Auto、FG）
8. 轉輪動畫改回 translateY 滾動式（reel strip）
9. 動畫升級為 v12 風格（統一高速→easeOut減速→overshoot→bounce，左右同停中輪最後）
**Before：** dev/ 版型不穩定，手機顯示跑掉，動畫用圖片切換
**After：** BG.png 底圖 + absolute reels + v12 滾動動畫，手機/電腦都正常，完整可玩
**關鍵 prompt / 指令：** 多次迭代：固定座標系→純CSS→BG底圖，最終確定 BG.png + absolute positioning 架構
**人工修正：** 使用者多次截圖反饋佈局問題，經 5+ 次迭代確定最終方案
**耗時：** ~3 小時（含多次架構重構）

### [2026-05-28] — Scatter 累積收集制機率分析

**環節：** 數學
**AI 工具：** Kiro Agent
**做了什麼：** 蒙地卡羅模擬（200 萬轉/配置）分析 Scatter 累積收集制不同門檻（5/8/10/12/15）× 不同出現率（3~7%）的觸發頻率，含碰壁扣燈影響評估。
**Before：** 無數據支撐門檻設定
**After：** docs/scatter_collection_analysis.md + math/scatter_collection_sim.py。推薦門檻 8 + SR 5%（平均 123 轉觸發，落在業界 80~150 區間）
**關鍵 prompt / 指令：** 評估 Scatter 累積收集制的機率設計，模擬不同門檻觸發頻率
**人工修正：** 無
**耗時：** ~15 分鐘

### [2026-05-28] — 波動性調整分析（診斷基礎 RTP 僅 68%）

**環節：** 數學 / 企劃
**AI 工具：** Kiro Agent
**做了什麼：** 玩家反饋「錢變少太快」，蒙地卡羅模擬（100 萬轉 + 1 萬玩家×100 轉）診斷出基礎 RTP 僅 68.18%（非設計目標 96.4%）。提出 5 種調整方案並模擬比較，推薦方案 F。
**Before：** 基礎 RTP 68%，10 轉正收益僅 9.1%，100 轉獲利率 0%
**After：** docs/volatility_tuning.md + math/volatility_sim.py。方案 F（碰壁+1.8x、穿門 8/5/2.5/1.2x、same-hit 不扣）→ RTP 96.25%，10 轉正收益 42.2%，100 轉獲利率 32.5%
**關鍵 prompt / 指令：** 玩家反饋錢變少太快，分析原因並提出調整方案
**人工修正：** 無
**耗時：** ~20 分鐘
