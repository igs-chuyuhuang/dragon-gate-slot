# 《射龍門 Slot》AI Agent 輔助遊戲開發規劃藍圖

## 專案背景與競賽目標

本專案為 AI 老虎機遊戲競賽的開發規劃，目標不是單純使用 AI 產圖或寫程式，而是建立一套完整的 **AI 輔助遊戲開發流程**。以《射龍門》為主題，透過多角色 AI Agent 分工協作，最終完成可展示的 Web 遊戲原型（HTML5）。

### 競賽定位
- 以《射龍門》作為 Slot 遊戲主題
- 使用 AI Agent 分工處理不同開發任務
- 最終完成可展示的 Web 遊戲原型（HTML5）

### 報告呈現重點
- AI 工具選擇與應用環節說明
- AI 生成內容與人工修正前後對比
- 各階段實際開發成效與成果展示

## AI Agent 開發團隊架構

AI Producer Agent 作為統籌核心，負責任務拆解、工作分派與成果彙整。下方串接專業 Agent，各司其職完成遊戲開發。

| Agent 角色 | 職責 |
|-----------|------|
| AI Producer Agent | 統籌協調、任務拆解、成果彙整 |
| Game Designer Agent | 遊戲規格整理、玩法規則 |
| Math Designer Agent | 賠付表、RTP 模擬、機率驗算 |
| Art Prompt Agent | 美術素材 prompt、AI 生圖 |
| Web Developer Agent | HTML5 遊戲程式開發（JS + Anime.js + PixiJS） |
| QA Test Agent | 測試計畫、Bug 追蹤 |
| Creative Director Agent | 創新玩法設計、wow moment、視覺節奏互動亮點 |
| Game Feel Agent | 特效爽感設計、動畫時間軸、easing 曲線、音效觸發點 |

## AI 工具應用規劃

各開發階段採用最適合的 AI 工具，確保產出品質與開發效率。

## 開發流程藍圖

六大階段從企劃到成果彙整，每階段產出明確交付物，確保開發進度可追蹤、成果可驗證。

### Phase 1：企劃輸入與任務拆解

由 AI Producer Agent 讀取既有遊戲企劃，拆解成企劃、數學、美術、程式、測試五大工作項目。

**產出：** `agent_task_plan.md`、`development_scope.md`

### Phase 2：遊戲規格整理

由 Game Designer Agent 整理遊戲主題、核心玩法、符號設定、Free Game 與 JP 規則。

**產出：** `game_design.md`

### Phase 3：數學模型與機率驗算

由 Math Designer Agent 規劃賠付表、命中率、Scatter 觸發率、倍率與簡易 RTP 模擬。

**產出：** `paytable.md`、`rtp_simulation.py`、`rtp_report.md`

### Phase 4：AI 美術素材產出

由 Art Prompt Agent 產生背景、符號、UI、JP 圖示等素材 prompt，並記錄 AI 生成與人工修正過程。

**產出：** `art_prompts.md`、`asset_list.md`、`generated_assets/`

### Phase 5：Web 遊戲原型開發

由 Web Developer Agent 將規格轉換成 HTML5/JS 開發任務，搭配程式協助完成實作。

**產出：** Web Prototype、JavaScript modules、README、Demo build

### Phase 6：QA 測試與成果彙整

由 QA Test Agent 產生測試項目，驗證 Spin、穿門判定、Scatter、Free Game、JP 與派彩結算流程。最後由 AI Producer Agent 彙整成果。

**產出：** `test_plan.md`、`bug_list.md`、`final_report`、`demo_video`

## 專案成果預期輸出

1. **多 Agent 開發工作流** — AI Producer Agent 統籌協調，專業 Agent 分工合作
2. **完整遊戲規格書** — 涵蓋玩法、符號、賠付表、Free Game、Bonus Game 與 JP 規則
3. **數學模型與 RTP 模擬報告** — Python 模擬數據、命中率分析、Scatter 觸發率與彩金分配
4. **AI 美術素材與 Prompt 紀錄** — AI 生成素材、人工修正過程、最終美術資源清單
5. **Web 遊戲原型** — 可執行 3x3 Slot 原型，含完整 Spin、穿門判定、Scatter、Free Game 與 JP 流程
6. **QA 測試文件與成果報告** — 測試計畫、Bug 清單、最終報告與 Demo 展示影片
