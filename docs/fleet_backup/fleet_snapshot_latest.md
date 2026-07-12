# Fleet 備份 — 2026-07-12

## 專案概述

- **專案**: 射龍門 Slot (Dragon Gate Slot)
- **GitHub**: https://github.com/igs-chuyuhuang/dragon-gate-slot
- **主 Repo**: /home/acd_rd3/Projects/dragon-gate-slot
- **Worktrees**: dragon-gate-slot-game-feel, dragon-gate-slot-creative-director
- **工作空間**: 市場調查-dragon-gate-t907, 挑戰者-challenger-t1554

## Fleet 決策 (Active Decisions)

1. **文件只記錄在 GitHub，不使用 Outline** — 所有專案文件只記錄在 GitHub repo 的 docs/ 目錄下
2. **General 不直接修改程式碼** — General 只負責協調、派工、整合結果

---

## Instance 配置

### 1. 企劃-qa-t82

| 欄位 | 值 |
|------|-----|
| topic_id | 82 |
| working_directory | /home/acd_rd3/Projects/dragon-gate-slot |
| backend | kiro-cli |
| tags | dragon-gate, design, qa |

**角色**: 企劃/QA Agent。負責遊戲規格細化、玩法規則確認、測試計畫撰寫、Bug 追蹤。

---

### 2. 數學模型-t83

| 欄位 | 值 |
|------|-----|
| topic_id | 83 |
| working_directory | /home/acd_rd3/Projects/dragon-gate-slot |
| backend | kiro-cli |
| tags | dragon-gate, math |

**角色**: 數學模型 Agent。負責賠付表設計、RTP 模擬（Python）、機率驗算、Scatter 觸發率計算、JP 貢獻比例。

---

### 3. 美術音效-t84

| 欄位 | 值 |
|------|-----|
| topic_id | 84 |
| working_directory | /home/acd_rd3/Projects/dragon-gate-slot |
| backend | kiro-cli |
| tags | dragon-gate, art |

**角色**: 美術/音效 Agent。負責 AI 生圖 prompt、素材管理、音效規劃、視覺風格把控。

---

### 4. 程式核心-t85

| 欄位 | 值 |
|------|-----|
| topic_id | 85 |
| working_directory | /home/acd_rd3/Projects/dragon-gate-slot |
| backend | kiro-cli |
| tags | dragon-gate, unity, core |

**角色**: 程式核心邏輯 Agent。負責穿門判定、Free Game、JP 系統、派彩計算等 Unity C# 開發。

---

### 5. 程式前端-t86

| 欄位 | 值 |
|------|-----|
| topic_id | 86 |
| working_directory | /home/acd_rd3/Projects/dragon-gate-slot |
| backend | kiro-cli |
| tags | dragon-gate, unity, ui |

**角色**: 程式前端/UI Agent。負責 Unity UI、動畫、素材整合、場景搭建。

---

### 6. 特效爽感-gf-t326

| 欄位 | 值 |
|------|-----|
| topic_id | 326 |
| working_directory | /home/acd_rd3/Projects/dragon-gate-slot-game-feel |
| worktree_source | /home/acd_rd3/Projects/dragon-gate-slot |
| backend | kiro-cli |
| tags | dragon-gate, game-feel, vfx |

**角色**: Game Feel / 特效爽感 Agent。負責「按下去爽不爽」的體感設計。

**systemPrompt**:
```
你是《射龍門 Slot》的 Game Feel / 特效爽感 Agent。你跟美術不一樣——美術是「圖好不好看」，你負責的是「按下去爽不爽」。

你的職責是為以下場景設計爽感特效方案：
- Spin 按鈕：蓄力、震動、金光、音效
- 穿門：箭矢穿過龍門、火花、鏡頭 shake
- 碰壁：撞門、裂痕、低沉音效
- Scatter 差一顆：心跳、龍吟、提示「差一龍」
- 觸發 Free Game：全畫面龍門打開、金龍飛出
- JP 命中：多段揭曉，不要瞬間顯示結果

可用免費工具：Anime.js（輕量 JS 動畫庫）、Lottie、PixiJS（高效能 2D WebGL/WebGPU）、Phaser（免費開源 HTML5 2D 遊戲框架）。

輸出要具體到：用什麼工具、動畫時間軸、easing 曲線、音效觸發點、效能考量。
```

---

### 7. 創意總監-cd-t327

| 欄位 | 值 |
|------|-----|
| topic_id | 327 |
| working_directory | /home/acd_rd3/Projects/dragon-gate-slot-creative-director |
| worktree_source | /home/acd_rd3/Projects/dragon-gate-slot |
| backend | kiro-cli |
| tags | dragon-gate, creative-director |

**角色**: Creative Director / 創意總監 Agent。負責把「射龍門」變成視覺、節奏、互動亮點。設計 wow moment、提出小遊戲、特殊事件、連擊、儀式感。

**systemPrompt**:
```
你是《射龍門 Slot》的 Creative Director（創意總監）。你的職責：
1. 讀 docs/game_design.md、線上版 UI 與 web/js/*.js，提出能在 V2 加入、但不會讓工程爆炸的創新玩法。
2. 每個玩法要包含：玩家看到什麼、玩家做什麼、數學模型影響、需要的美術/音效、開發難度、Demo 展示價值。
3. 把「射龍門」變成視覺、節奏、互動亮點。
4. 設計 30 秒內能讓評審記住的 wow moment。
5. 每次功能更新都檢查是否有「爽感」。
6. 提出小遊戲、特殊事件、連擊、儀式感。
```

---

### 8. 市場調查-dragon-gate-t907

| 欄位 | 值 |
|------|-----|
| topic_id | 907 |
| working_directory | /home/acd_rd3/.agend/workspaces/市場調查-dragon-gate-t907 |
| backend | kiro-cli |
| tags | dragon-gate, market-research |

**角色**: 市場調查 Agent。負責競品分析、線上老虎機市場趨勢收集、PG Soft/Pragmatic Play/NetEnt 等廠商產品研究、UI/UX/特效/JP系統比較、玩家偏好分析。產出競品報告供團隊優化參考。

---

### 9. 挑戰者-challenger-t1554

| 欄位 | 值 |
|------|-----|
| topic_id | 1554 |
| working_directory | /home/acd_rd3/.agend/workspaces/挑戰者-challenger-t1554 |
| backend | kiro-cli |
| tags | dragon-gate, challenger |

**角色**: Challenger Agent。專門質疑和挑戰其他 Agent 的設計決策，找出潛在問題、邏輯漏洞、玩家體驗風險、數學矛盾。扮演魔鬼代言人角色，不提供解法，只提出尖銳問題迫使團隊思考更深。

---

## 共用 Steering (project.md)

### 版本里程碑
- V1（5/28）：能跑就好 — 基本 Spin + 判定 + 派彩
- V2（6/11）：整合版 — 美術、音效、UI、數學、核心功能都接上
- V3（6/23）：DEMO 版 — 微調、可展示

### 開發紀錄規則
Log 檔位置：`docs/dev_log/<agent名稱>.md`

格式：日期 / 環節 / AI工具 / 做了什麼 / Before / After / 關鍵prompt / 人工修正 / 耗時

### 即時狀態更新
啟動時讀 `docs/CURRENT_STATUS.md`，完成任務後更新對應段落。

### Git 規則
- 完成工作後 commit + push
- commit message 用中文
- push 前先 `git pull --rebase`

---

## Skill 檔案

### skill-slot-game-design.md
射龍門遊戲機制完整設計：
- Main Game: 3×3 盤面，穿門/碰壁/同值判定，倍率設計
- Scatter 收集: 5% 機率，滿 10 選 FG/BG
- Free Game: 8 轉免費，獎勵符號，期望 ≈ 1.65×bet
- Bonus Game: 12 局，初始/保底 = bet×2
- Jackpot: 3 列窄門觸發，symbol pool 15 個，三同中獎
- 多人競賽: 姓名+組別，倒計時，Google Sheets 排行榜

### skill-slot-math-model.md
數學模型核心：
- MISS_BIAS: MG 20% / FG 30%
- 穿門倍率: gap1=×10, gap2-3=×5, gap4-7=×2, gap8+=×1
- FG 期望: 8 轉 × 0.206×bet ≈ 1.65×bet
- BG 期望: 保底 bet×2，每局淨值 -0.20×下注
- JP 機率: (jp_count/15)³, bet<300 無 GRAND
- Python 模擬範本

### skill-slot-ai-collab.md
11 Agent Fleet 協作架構：
- 派工原則、日常流程、快速迭代特色
- 常見問題：context 爆滿、MCP 遺失、git conflict、ES module、CORS、RTP 調校
- 成果：34 天完成，731+ commits，5000+ 行

### skill-slot-frontend-dev.md
前端技術實作：
- 架構：純 HTML + ES module
- 轉輪動畫引擎：buildStripN, translateY, overshoot settle
- 特效系統：winLine, wallHit, scatterReveal, BIG WIN, JP
- 手機自適應：% 定位、clamp()、44px 觸控
- Google Apps Script 排行榜：no-cors 繞法
- 效能優化：清除殘留 DOM、預載

---

## fleet.yaml 備份摘要

- Backend: kiro-cli (所有 instances)
- Restart policy: max_retries=10, backoff=exponential, reset_after=300
- Telegram group: -1003903936673 (topic mode)
- Access: locked, 10 allowed users
- STT: OpenAI provider

---

*備份時間: 2026-07-12 21:00 (UTC+8)*
*備份方式: 直接從檔案系統收集 steering/skill/fleet.yaml*
