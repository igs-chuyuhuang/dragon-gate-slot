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

### [2026-05-28] — 企劃規格書 v1.5：Scatter 累積收集制

**環節：** 企劃
**AI 工具：** Kiro Agent
**做了什麼：** 更新企劃規格書，將 Scatter 觸發機制從「單轉出現 3 個直接觸發」改為「累積收集制」。新增碰壁扣 1 燈、同值撞柱扣 2 燈規則，門檻數值標註待數學模型確認。
**Before：** v1.4，Scatter ×3 直接觸發選擇畫面
**After：** v1.5，Scatter 累積收集制（+1/-1/-2），達門檻觸發 FG/BG 二選一，歸零重新收集
**關鍵 prompt / 指令：** Scatter 改累積收集制，碰壁扣1燈、同值扣2燈
**人工修正：** 無
**耗時：** ~5 分鐘

### [2026-05-29] — 底部控制面板 UI 全面升級

**環節：** 程式 / 企劃
**AI 工具：** Kiro Agent
**做了什麼：** 重新設計底部控制面板 UI，從簡單按鈕升級為華麗中國風金色金屬質感，經過多輪座標微調對齊參考圖
**Before：** 簡單的文字按鈕和基本佈局
**After：** 精確定位的控制面板（餘額/自動/SPIN/投注區/贏分 + 下排音量/i），透明背景顯示原有紅色裝飾框
**關鍵 prompt / 指令：** 用戶提供參考圖和精確 viewport 390×844 座標，反覆微調至 ±5px 精度
**人工修正：** 多次座標微調由用戶指定
**耗時：** 約 3 小時（含多輪微調）

### [2026-05-29] — 小龍吉祥物加入

**環節：** 程式
**AI 工具：** Kiro Agent
**做了什麼：** 加入小龍吉祥物圖片（MS-01_mascot_dragon.png），經多輪位置/尺寸調整
**Before：** 無吉祥物
**After：** 小龍顯示在左下角 (left:-6.4%, top:66.9%, width:40%)
**關鍵 prompt / 指令：** 加入圖片並反覆調整位置大小
**人工修正：** 多次位置微調由用戶指定
**耗時：** 約 20 分鐘

### [2026-05-29] — v1.6 遊戲邏輯更新

**環節：** 程式
**AI 工具：** Kiro Agent
**做了什麼：** 依據企劃規格書 v1.6 更新核心邏輯：碰壁/同值改扣燈、Scatter 累積制（門檻10）、Free Game 簡化
**Before：** 碰壁 ×1.2 賠付、同值 -bet×3、Scatter 3個直接觸發 FG
**After：** 碰壁扣1燈、同值扣2燈、Scatter +1 燈累積到10觸發 FG、FG 中只有穿門/未穿
**關鍵 prompt / 指令：** 根據 docs/game_design.md v1.6 規格更新 dragonGateJudge/payoutCalculator/gameManager/freeGame/slotEngine
**人工修正：** 無
**耗時：** 約 15 分鐘

### [2026-05-29] — 音效整合 + winLine 特效

**環節：** 程式
**AI 工具：** Kiro Agent
**做了什麼：** 整合 sfxBus 音效系統（7 個觸發點）+ winLine 視覺特效（穿門贏分金色掃光）
**Before：** 無音效、無贏分特效
**After：** spin/stop/wall/gate/scatter/win/FG 音效 + 穿門贏分金色掃光+發光+粒子動畫
**關鍵 prompt / 指令：** 只加音效不加視覺特效（第一步），再整合 winLine（第二步）
**人工修正：** 無
**耗時：** 約 15 分鐘

### [2026-05-29] — i 按鈕多頁規則彈窗

**環節：** 程式 / 企劃
**AI 工具：** Kiro Agent
**做了什麼：** 把 i 按鈕從 alert 改為全螢幕 overlay 多頁彈窗（玩法/計分/Free Game）
**Before：** alert 顯示簡單文字
**After：** 3 頁 tab 切換彈窗，深色底+金色邊框，可點擊外部關閉
**關鍵 prompt / 指令：** 改為獨立彈窗視窗，3 頁 tab，內容參考 v1.6 規格
**人工修正：** 無
**耗時：** 約 10 分鐘

### [2026-05-29] — Scatter 圓形進度環

**環節：** 程式
**AI 工具：** Kiro Agent
**做了什麼：** 把「🐉 X/10」文字改為 SVG 圓形進度環（10 段弧形，亮格=收集數）
**Before：** 文字顯示「🐉 3/10」
**After：** 40px 圓形環，10 段弧形（金色=已收集，暗色=未收集），中央數字
**關鍵 prompt / 指令：** 用 SVG 10 段弧形實作圓形進度環
**人工修正：** 無
**耗時：** 約 10 分鐘

### [2026-05-29] — 前端規格書

**環節：** 企劃
**AI 工具：** Kiro Agent
**做了什麼：** 建立 docs/dev-spec.md 前端規格書（素材清單、座標、動畫、功能、tokens、檔案結構）
**Before：** 無規格書
**After：** docs/dev-spec.md 完整規格書
**關鍵 prompt / 指令：** 從 index.html 和 game.css 整理出完整規格書
**人工修正：** 無
**耗時：** 約 5 分鐘

### [2026-05-29] — 玩法大改提案可行性分析 + 挑戰者辯論

**環節：** 企劃
**AI 工具：** Kiro Agent
**做了什麼：** 分析用戶 liaohuanjie 提出的玩法大改方案（Main Game 改傳統 Slot + Bonus Game 改射龍門互動），產出完整可行性報告。隨後與挑戰者 Agent 進行兩輪辯論，修正立場。
**Before：** 無正式的方案評估紀錄
**After：** 完成分析報告（遊戲節奏影響、追加賭注風險平衡、與 v1.6 差異、建議）。經辯論後立場收斂為：6/23 前維持現有架構交付 V3 DEMO，6/23 後以預設評估框架認真評估大改方案（需定義保留/改動指標、playtest 方法）
**關鍵 prompt / 指令：** 分析玩法大改方案可行性；回應挑戰者對時程、辨識度、折衷方案的質疑
**人工修正：** 無
**耗時：** ~20 分鐘

### [2026-06-01] — 設定音檔轉文字環境 + AgEnD STT 設定

**環節：** 企劃 / 環境設定
**AI 工具：** Kiro Agent
**做了什麼：** 應用戶需求設定會議錄音轉文字整理功能：找到 OpenAI API Key（~/.openai_key）、加入 ~/.bashrc 自動載入、加入 .agend/.env、在 fleet.yaml 加入 stt 設定區塊（provider: openai）、確認 ffmpeg 已安裝。
**Before：** 環境無 STT 能力，無法處理音檔
**After：** OPENAI_API_KEY 自動載入、ffmpeg 就緒、fleet.yaml 含 stt 設定。Agent 可用 Whisper API 處理 m4a 附件轉文字。
**關鍵 prompt / 指令：** 用戶要求能直接傳 m4a 錄音檔整理會議重點
**人工修正：** 用戶自行安裝 ffmpeg、重啟 bot
**耗時：** ~10 分鐘

### [2026-06-01] — 音訊轉文字功能設定

**環節：** 企劃 / 環境設定
**AI 工具：** Kiro Agent
**做了什麼：** 為用戶 chuyu 設定會議錄音轉文字功能：找到 OpenAI API Key（~/.openai_key）、加入 ~/.bashrc 自動載入、加入 AgEnD bot .env、確認 ffmpeg 安裝、在 fleet.yaml 加入 STT 設定區塊（provider: openai）。
**Before：** 無法處理語音/音訊檔案，環境無 ffmpeg、無 API Key 環境變數
**After：** ffmpeg 已安裝、OPENAI_API_KEY 自動載入（.bashrc + .agend/.env）、fleet.yaml 加入 stt config。Agent 可用 Whisper API 處理 m4a 附件。Bot 層級 STT 待用戶重啟驗證。
**關鍵 prompt / 指令：** 用戶要求能直接傳 m4a 錄音檔整理會議重點
**人工修正：** 用戶自行安裝 ffmpeg、重啟 bot
**耗時：** ~10 分鐘

### [2026-06-01] — 音檔轉文字功能設定 + 排查 bot STT 問題

**環節：** 企劃 / 測試
**AI 工具：** Kiro Agent
**做了什麼：** 用戶需求：傳 m4a 會議錄音讓 Agent 整理重點。排查 AgEnD bot 語音轉文字失敗原因，最終確認三個問題：(1) bot STT 用的是 GROQ_API_KEY 非 OPENAI_API_KEY (2) Telegram 把 .m4a 歸類為 audio 觸發 STT 流程 (3) Telegram Bot API 有 20MB 下載限制，36.9MB 檔案無法下載。已設定 OpenAI Key 到 ~/.bashrc、安裝 ffmpeg、提供替代方案。
**Before：** 無法處理用戶傳送的音檔
**After：** 確認 OpenAI Whisper API 可用（環境就緒）、找到 bot 限制（需 GROQ_API_KEY + 20MB 上限）、提供用戶分割檔案/雲端/SSH 三種替代方案
**關鍵 prompt / 指令：** 用戶要求能直接傳 m4a 檔案整理會議重點
**人工修正：** 無
**耗時：** ~30 分鐘

### [2026-06-01] — Scatter 進度環 Visual QA + 音訊轉文字環境設定

**環節：** 測試 / 環境設定
**AI 工具：** Kiro Agent
**做了什麼：**
1. 為用戶 chuyu 設定音訊轉文字環境：找到 OpenAI API Key（~/.openai_key），加入 ~/.bashrc 自動載入，加入 .agend/.env，在 fleet.yaml 加入 STT 設定區塊，確認 ffmpeg 已安裝
2. Visual QA 檢查 dev/index.html 的 Scatter 進度環元件：驗算 SVG 圓環幾何（radius=47, stroke-width=5, icon 88%），確認圓環可見且緊貼圖片（間隙僅 0.5 unit），但發現桌面版尺寸問題（scatter-ring 用 vw 而盤面用 %，導致桌面版進度環比 symbol 大近 2 倍）
**Before：** 無 STT 設定；Scatter 進度環未經 QA 驗證
**After：** STT 環境就緒（待 bot 重啟生效）；回報美術 Agent 桌面版尺寸 bug + 修復建議（改用 % 相對 game-root）
**關鍵 prompt / 指令：** 設定音訊轉文字讓 agent 能處理 m4a；檢查 Scatter 進度環可見性、間隙、尺寸一致性
**人工修正：** 無
**耗時：** ~20 分鐘

### [2026-06-01] — Scatter 進度環 UI 實作 + 音訊轉文字環境設定

**環節：** 程式 / 企劃
**AI 工具：** Kiro Agent
**做了什麼：**
1. **Scatter 進度環 UI**：將原本「🐉 0/10」文字改為視覺化環形進度條。中間放 Scatter 龍圖，外圍 SVG 10 段圓弧進度條，收集 Scatter +1 格、碰壁 -1 格、同值撞柱 -2 格。經多次迭代調整：大小（symbol 1.2 倍）、位置、圓環粗細（stroke-width 9）、深色底盤、白底 x/10 文字標籤移到上方、進度尾端龍珠、青綠光暈改用 SVG filter 消除直角裁切。
2. **音訊轉文字環境設定**：找到 OpenAI API Key（~/.openai_key），加入 ~/.bashrc 自動載入，加入 AgEnD bot .env + fleet.yaml STT 設定，安裝 ffmpeg。
**Before：** Scatter 累積用純文字「🐉 0/10」顯示；無音訊轉文字能力
**After：** 視覺化環形進度條（SVG 圓弧 + 龍圖 + 龍珠 + 青綠光暈 + 深色底盤）；環境具備 Whisper API 轉文字能力
**關鍵 prompt / 指令：** 用戶多次截圖反饋調整大小、位置、光暈效果、加底盤、加龍珠、文字位置
**人工修正：** 用戶截圖反饋 8+ 次微調（大小、位置、光暈直角、文字位置）
**耗時：** ~1.5 小時（含多次迭代）

### [2026-06-02] — Free Game v2.0 重寫 + FG 轉軸系統 + Bonus Game 完整實作

**環節：** 程式 / 企劃
**AI 工具：** Kiro Agent
**做了什麼：**
1. Free Game 重寫：改用 judgeBoard+calculate 判定，每轉隨機倍率 → 改為右側三格獨立獎勵轉軸（×2/×3/×5/×10/+15/+30/+60/+90/—）
2. FG 全螢幕結算 overlay（數字跳動 + BIG WIN）
3. FG 右側轉軸動畫：定位修正（覆蓋三格 badge）、四軸同步轉動（左右→中→右側最後停）
4. Bonus Game 完整實作：bonusGame.js（籌碼/發牌/判定/賠付）、FG/BG 選擇畫面、瞇牌 flip 動畫、每局15秒+總90秒倒數、收手機制
5. BG 全螢幕結算 overlay（共用 FG 結算畫面）
6. BG 進場改為 inline UI：bonus game.png 在轉軸區域、三張牌定位、SPIN→「發」、BET→五個圓形籌碼按鈕
**Before：** FG 用舊版 scoreFGRow 邏輯、無 Bonus Game、無 FG/BG 選擇
**After：** FG v2.0（三格獨立獎勵轉軸 + 四軸同步動畫 + 結算 overlay）、BG 完整可玩（inline UI + 籌碼下注 + 瞇牌 + 倒數 + 收手 + 結算）
**關鍵 prompt / 指令：** 依 v2.0 規格重寫 FG；實作完整 BG 功能；FG 轉軸四軸同步；BG UI 改 inline 不用 overlay
**人工修正：** FG 轉軸位置/時序經多次迭代調整；BG 從 overlay 改 inline 經用戶反饋修正
**耗時：** ~3 小時（含多次迭代）

### [2026-06-03] — FG 中輪自帶分數 + 錢幣飛移動畫

**環節：** 程式
**AI 工具：** Kiro Agent
**做了什麼：**
1. FG 移除右側獎勵轉軸，改為中輪 symbol 自帶分數（💰金額標籤在 cell 右下角）
2. 錢幣標籤在 buildStripN 生成 strip 時就加入，跟著 symbol 一起轉動
3. 穿門贏獎時錢幣飛移動畫：從中輪飛到右側 badge 區（600ms easeOut + scale 1.3）
4. 修正飛移動畫：改為新建小 span（💰金額），不 clone 整個 cell
**Before：** FG 用右側獨立轉軸顯示獎勵符號，停止後才顯示錢幣
**After：** 中輪格子直接帶💰金額標籤跟著轉動，穿門時錢幣飛移到 badge 區
**關鍵 prompt / 指令：** 移除右側轉軸改中輪自帶分數；錢幣跟著轉動；穿門時飛移到 badge
**人工修正：** 飛移動畫從 clone 整個 cell 改為只飛小 span
**耗時：** ~20 分鐘

### [2026-06-04] — 修正碰壁特效 P1 + 狀態更新

**環節：** 測試 / 程式
**AI 工具：** Kiro Agent
**做了什麼：** 修正 Visual QA P1「碰壁特效太弱」問題。根因：playWallHit() 沒有 await，動畫 fire-and-forget 被後續流程覆蓋。改為 await playWallHit(j.row) 逐列等待，確保 680ms 完整動畫可見（camera shake + red flash + squash + particles）。
**Before：** playWallHit 是 fire-and-forget，效果被立即覆蓋幾乎看不到
**After：** await 逐列播放，碰壁特效完整可見
**關鍵 prompt / 指令：** 推進 V3 品質微調，修正 Visual QA P1 待修項目
**人工修正：** 無
**耗時：** ~10 分鐘

### [2026-06-04] — CURRENT_STATUS 更新 + 市場調查整合 + RTP 調參

**環節：** 企劃 / 程式
**AI 工具：** Kiro Agent
**做了什麼：**
1. 更新 CURRENT_STATUS.md 反映 6/1~6/3 所有進度（FG v2.0、BG、錢幣飛移等）
2. 整合市場調查 agent 報告到主 repo（2025-2026_slot_market_trends.md、jackpot_system_comparison.md）
3. RTP 調參套用：FG 獎金 [+5/+10/+15/+30/+50/—]、BG 賠率 ×10/×5/×2.5/×1 + 15局上限、Scatter 門檻改 12（RTP 122.6%→96.15%）
**Before：** CURRENT_STATUS 停在 5/28；市場調查報告在外部 workspace；RTP 122.6%
**After：** 狀態文件最新；市場報告整合到 docs/market_research/；RTP 降至 96.15%
**關鍵 prompt / 指令：** 更新狀態；copy 市場調查報告到主 repo；套用 RTP 調參配置
**人工修正：** 無
**耗時：** ~15 分鐘

### [2026-06-04] — 合併 Visual QA 修正 + V3 Phase 1 可行性評估

**環節：** 測試 / 企劃
**AI 工具：** Kiro Agent
**做了什麼：**
1. 更新 CURRENT_STATUS.md 反映 6/1~6/3 所有進展
2. 修復 P1 碰壁特效：發現 playWallHit 從未被 import/呼叫（只有 sfx），接入主迴圈
3. Cherry-pick game-feel 分支的 Visual QA P1+P2 修正（Scatter 光柱、穿門降透明、Combo 降光暈、碰壁強化）到 main，同步 dev/ 和 web/
4. 帶入 docs/v3_animation_specs.md 到 main
5. 評估 Phase 1（瞇牌節奏改造 ~1.5天 + 龍息連擊 ~1天）的實作可行性、風險、依賴
**Before：** Visual QA P1/P2 修正只在 game-feel 分支；playWallHit 從未被呼叫；無 Phase 1 評估
**After：** 4 個 effect 檔案修正合併到 main；碰壁特效完整接入；Phase 1 評估報告完成（建議暫緩連擊、先做瞇牌骨架）
**關鍵 prompt / 指令：** 確認合併無衝突；評估 Phase 1 可行性和工時
**人工修正：** 無
**耗時：** ~20 分鐘

### [2026-06-04] — RTP 綜合模擬 v3 + 調參找到達標配置

**環節：** 數學 / 測試
**AI 工具：** Kiro Agent
**做了什麼：**
1. 更新 CURRENT_STATUS.md 反映 6/1~6/3 進度
2. 撰寫 RTP 綜合模擬 v3（math/rtp_sim_v3.py）：含 Main Game + FG v2.0 + BG，200 萬轉模擬發現整體 RTP 122.6%（嚴重超標）
3. 撰寫 RTP 調參腳本（math/rtp_tuning_v3.py）：掃描多組 FG/BG/門檻參數組合
4. 找到達標配置 G1（500 萬轉驗證 RTP 96.15%）：FG 符號池 [+5,+10,+15,+30,+50,0]、BG 賠率降低（極窄×10/窄×5/中×2.5/寬×1）、Scatter 門檻 12、BG 最大 15 局
**Before：** FG/BG 實作完成但未驗證 RTP，實際 RTP 122.6%（賠爆）
**After：** 確認問題並找到修正方案（G1 配置 96.15%），待程式碼套用新參數
**關鍵 prompt / 指令：** 跑最新版 RTP 模擬確認數值；精算調參使 RTP 回到 96.4%
**人工修正：** 無
**耗時：** ~30 分鐘

### [2026-06-04] — BG 競態 bug 修復 + QA 報告 + P2 視覺修正 + Scatter 揭曉接入 + RTP 驗證

**環節：** 測試 / 程式
**AI 工具：** Kiro Agent
**做了什麼：**
1. BG 流程完整性測試：發現並修復 3 個競態條件 crash bug（翻牌中 timer 歸零、bgEnd 重複呼叫、自動下注與手動競態）
2. 產出 BG/FG QA 報告（docs/qa_report_bg_fg_20240604.md）：功能測試 + Visual QA 6.5/10
3. UX-001 修復：BG 籌碼歸零顯示「💸 籌碼用盡！」提示
4. P2 CSS 修正：FG 💰標籤加大（clamp 11-14px）、BG 翻牌加 perspective 3D、BG 牌面+籌碼改響應式
5. Scatter 揭曉動畫接入 dev/index.html（import revealScatters + await 呼叫）
6. RTP 驗證模擬（10M 轉）：確認調參後 RTP 96.81%，合規通過
7. 更新 CURRENT_STATUS.md 反映 6/1~6/3 所有進度
**Before：** BG 有競態 crash 風險、Scatter 揭曉未接入 dev/、RTP 未驗證
**After：** BG 穩定不 crash、Scatter 光柱動畫正常觸發、RTP 96.81% 確認合規、QA 報告+改善建議完整
**關鍵 prompt / 指令：** BG 流程完整性測試→Visual QA→P1 追蹤；Scatter 接入；RTP 重跑驗證
**人工修正：** 無
**耗時：** ~40 分鐘

### [2026-06-05] — BGM 設計與實作 + 碰壁特效修正 + 配置備份

**環節：** 程式 / 音效
**AI 工具：** Kiro Agent
**做了什麼：**
1. 碰壁特效 P1 修正：playWallHit 改為 await 逐列播放，確保 680ms 動畫完整可見
2. BGM 實作（多次迭代）：
   - v1: Web Audio API 五聲音階生成（被否決：太單調）
   - v2: Python 合成中式財運風格（古箏+笛子+低鼓+風鈴+鑼）（被否決：不夠緊張）
   - v3: Python 合成緊張澎湃風格（鋼琴ostinato+弦樂tremolo+銅管staccato+鼓），130bpm D小調
   - v4: 移除 kick drum + 裁剪前 6 秒 → 最終版 6.75 秒循環
3. 完整配置備份回報（角色、steering、decisions、設定檔）
**Before：** 無背景音樂；碰壁特效 fire-and-forget 看不到
**After：** dev/assets/audio/bgm.mp3（6.75秒循環，緊張澎湃風格）；碰壁特效完整可見
**關鍵 prompt / 指令：** 設計並加入 BGM（多次風格調整）；碰壁特效太弱修正
**人工修正：** BGM 經用戶 4+ 次反饋迭代（風格/音量/裁剪）
**耗時：** ~1.5 小時（含多次 BGM 迭代）

### [2026-06-05] — 配置備份 + BG 局數模擬推薦

**環節：** 數學 / 企劃
**AI 工具：** Kiro Agent
**做了什麼：**
1. 回報完整配置資訊供 GitHub 備份（角色、steering、決策、設定檔）
2. BG 局數模擬：測試 5/8/10/12/15 局對 RTP 影響（200 萬轉），推薦 12 局（RTP 95.82%，體驗 ~50-60 秒）
**Before：** BG 用「總時間 90 秒」限制，實際局數不確定
**After：** 推薦改為固定 12 局，RTP 95.82% 達標
**關鍵 prompt / 指令：** BG 總時間改固定局數，計算幾局恰當
**人工修正：** 無
**耗時：** ~15 分鐘

### [2026-06-05] — 固定舞台等比縮放（feature branch）+ 備份配置

**環節：** 程式 / 企劃
**AI 工具：** Kiro Agent
**做了什麼：**
1. 回報完整配置備份（角色、steering、decisions、設定檔）供 GitHub 備份
2. 在 feature/fixed-stage-scaling 分支實作「固定舞台等比縮放」，經 3 次迭代：
   - v2: 固定 390×844 + transform:scale + 所有 vw→px（失敗：getBoundingClientRect 受 scale 影響）
   - v3: 不動佈局，只加 container-type:inline-size + vw→cqw（解決左右縮放）
   - v4: container-type:size + 固定 px 改 cqw/cqh（解決上下縮放）
3. 最終方案：CSS container queries（cqw/cqh），不需 JS，不改佈局邏輯
**Before：** 桌機縮小視窗時元素跑位（clamp(vw) 參照 viewport 而非容器）
**After：** feature/fixed-stage-scaling 分支 commit 563366d，待合併測試
**關鍵 prompt / 指令：** 讓遊戲畫面在任何視窗大小下等比縮放不跑位
**人工修正：** 每次迭代後用戶測試反饋方向調整（3 次）
**耗時：** ~1.5 小時（含 3 次迭代）

### [2026-06-05] — Fleet 備份 + RTP 調參 + BG 規則更新 + 固定舞台縮放 + Scatter 特效 + FG/BG 資訊按鈕

**環節：** 程式 / 企劃
**AI 工具：** Kiro Agent
**做了什麼：**
1. Fleet 備份：建立 docs/fleet_backup/（14 個檔案，含 fleet config、agent 角色定義、shared decisions）
2. 整合市場調查報告（2025-2026_slot_market_trends.md、jackpot_system_comparison.md）
3. RTP 調參：FG 獎金降低 [+5/+10/+15/+30/+50/—]、BG 賠率 ×10/×5/×2.5/×1 + 15→12局、Scatter 門檻 10→12
4. BG 規則更新：移除 90 秒倒數改固定 12 局、每局 10 秒、UI 改局數 X/12
5. BG 籌碼按鈕座標微調（x/y 多次迭代）
6. 固定舞台縮放方案：多次嘗試（transform scale / zoom / min-size），最終用 min-size 390×844 + scale 縮小方案
7. FG/BG 選擇畫面加 ℹ️ 資訊按鈕（點擊顯示模式介紹）
8. Scatter 特效重寫：移除複雜光柱/震動/心跳，改為單格 cell 金色光效 → 龍圖飛向進度環 → 環閃亮
**Before：** 無 fleet 備份；RTP 122.6%；BG 用 90 秒倒數；無舞台縮放；Scatter 特效過度複雜
**After：** Fleet 備份完整；RTP 96.15%；BG 12局制；舞台可縮放；Scatter 特效簡潔（flash+fly+glow）；FG/BG 有說明按鈕
**關鍵 prompt / 指令：** 備份 fleet；套用 RTP 調參；BG 改固定局數；加舞台縮放；Scatter 特效簡化同穿門風格
**人工修正：** 舞台縮放方案經 6 次嘗試+revert 才定案（最終 min-size + scale）；Scatter flash 經 3 次修正
**耗時：** ~4 小時（含多次縮放迭代）

### [2026-06-07] — Cherry-pick 碰壁特效到 main

**環節：** 程式
**AI 工具：** Kiro Agent
**做了什麼：** 將 game-feel branch 的碰壁特效強化（double shake + chromatic aberration + shockwave + 多路裂痕）cherry-pick 到 main branch，解決 wallHit.js 合併衝突（取用強化版）
**Before：** 碰壁特效強化只在 game-feel branch，main 上是舊版
**After：** main 已有最新碰壁特效（commit f683a87 + 27cc897）
**關鍵 prompt / 指令：** 把 game-feel branch 的修改 merge 或 cherry-pick 到 main
**人工修正：** 無
**耗時：** ~5 分鐘

### [2026-06-08] — JP 系統完整實作 + 中輪獨立轉動 + JP 爬升動畫

**環節：** 程式
**AI 工具：** Kiro Agent
**做了什麼：**
1. JP Pool 自動爬升：三層獨立 timer（Mini 2~4s/Major 5~10s/Grand 10~20s）+ easeOutCubic countUp 動畫
2. JP Badge 系統（v1→移除）→ JP Slot 系統（極窄/窄門時中輪顯示 GRAND/MAJOR/MINI 圖片）
3. 中輪改 3 格獨立 requestAnimationFrame 循環轉動（pixPerFrame 12~15 超高速）
4. 左右停後 onSidesStop callback 判斷門寬，窄門 cell 立刻金色閃爍 + 混入 JP 圖片繼續轉
5. 中輪停輪改 14 格 decel strip + 1900ms easeOut 漸慢動畫
6. JP per-row 獨立判斷（只有窄門的那一列才出 JP）
7. JP 列不計穿門分數（jp-none/jp-win type）
8. JP 閃爍持續到結算（沒中獎立刻消、中獎保持到 overlay 後清）
9. Debug J/M/N 鍵預設下一轉強制 JP 中獎
**Before：** 無 JP 視覺系統、中輪用整條 strip 一起滾
**After：** 完整 JP Slot 流程（爬升+觸發+獨立轉動+閃爍+減速+判定+結算）
**關鍵 prompt / 指令：** JP 爬升效果；JP badge→JP Slot 大改；中輪獨立轉動；閃爍/速度/減速多次迭代
**人工修正：** JP 邏輯經 5+ 次修正（badge→slot→per-row→type覆蓋→revert→最終版）
**耗時：** ~4 小時

### [2026-06-09] — 龍門特效加強 + 音效合成（BIG WIN/龍門/countup/coin fly）

**環節：** 程式 / 音效
**AI 工具：** Kiro Agent
**做了什麼：**
1. 金龍素材生成（PIL，800×600 透明背景 placeholder）
2. playDragonGateOpening 特效全面加強 5 倍：門 80vw×60vh、shake 60px、100 粒子、衝擊波 scale5、門縫光芒 blur、金閃光 overlay
3. 合成 5 個新音效：bigwin/megawin/supermegawin（fanfare+金幣）、gate_rise（隆隆+金屬摩擦）、gate_open_sfx（boom+衝擊）
4. 合成 countup.mp3（0.5s 8 tick 金幣計數聲），BIG WIN 得分時循環播放
5. 合成 coin_fly.mp3（0.4s whoosh+金屬尾音），FG 錢幣飛移時播放
6. 所有音效接入 game.html 對應觸發點
**Before：** 龍門特效小（160×240px）、無 win/gate 音效、無計數音效、無飛行音效
**After：** 龍門特效佔滿畫面、7 個新音效全部接入播放
**關鍵 prompt / 指令：** 龍門特效加強 5 倍；為各特效加入音效；countup 計數聲；coin fly 咻聲
**人工修正：** 無
**耗時：** ~40 分鐘

### [2026-06-09] — 手機 debug 面板 + F 鍵改散集 + BIG WIN 動畫 + 龍門開啟特效 + BG 得分動畫

**環節：** 程式
**AI 工具：** Kiro Agent
**做了什麼：**
1. 手機 debug 面板：長按 2 秒彈出 F/J/M/N/S 按鈕
2. F 鍵改為填進度到 11/12 + 下一轉出 1 顆 Scatter 觸發完整流程
3. BIG WIN 動畫系統（≥5x/15x/30x bet）：霓虹金字+星星+金幣雨+噴射+得分按鈕倒數歸零
4. 金幣顏色分級：棕(BIG)/銀(MEGA)/金(SUPER MEGA)
5. BIG WIN 整合到 FG/BG/JP 所有結算場景
6. 龍門開啟特效 playDragonGateOpening：dim+門板升起+開門衝擊波+shake+金龍飛出+粒子拖尾（3.2s）
7. BG 得分/扣分改漸進動畫（countUp 900ms + countup.mp3 loop）
**Before：** 無 BIG WIN 動畫、觸發 FG/BG 直接跳選擇、BG 結果一次跳到目標值
**After：** 華麗 BIG WIN 分級慶祝特效、龍門開啟儀式感、BG 數字漸進動畫
**關鍵 prompt / 指令：** BIG WIN 金幣雨+得分按鈕；龍門開啟完整時間軸；BG countUp 動畫
**人工修正：** BIG WIN 經 3 次迭代（加金幣→重做華麗版→加得分按鈕倒數）
**耗時：** ~3 小時
