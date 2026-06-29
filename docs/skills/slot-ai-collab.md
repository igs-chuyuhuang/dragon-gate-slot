# AI 協作開發 Slot 遊戲

## 11 Agent Fleet 架構

| Agent | 職責 |
|-------|------|
| General (Coordinator) | 接收需求、拆解派工、品質把關 |
| 數學模型 | RTP、機率、波動率 |
| 美術音效 | UI 方向、素材規格 |
| 程式核心 | 邏輯架構、模組設計 |
| 程式前端 | UI 實作、動畫、排行榜 |
| 企劃 QA | 規格確認、Bug 回報 |
| 特效爽感 | 視覺回饋、慶祝動畫 |
| 挑戰者 | 壓力測試、exploit 檢查 |
| 創意總監 | 風格一致性 |
| 市場調查 | 競品分析 |
| 知識庫 | 文件管理 |

## Coordinator 派工方法

1. 用戶透過 Telegram 發送需求
2. General 接收後拆解為具體任務
3. 用 `send_to_instance` 派給對應 agent
4. Agent 執行 → commit + push → 回報完成
5. General 彙整結果回報用戶

### 派工原則
- 單一任務單一 agent（避免衝突）
- 明確指定檔案和修改內容
- 附帶 commit message 格式
- 需要跨 agent 協作時由 coordinator 串接

## 開發流程與迭代

### 日常流程
```
用戶需求（TG）→ 拆解 → 派工 → 執行 → Push → 確認 → 下一個
```

### 快速迭代特色
- Bug 回報到修正 < 5 分鐘
- RTP 調參：改一個數字 → commit → 測試 → 再調
- 一天可完成 10-30 個任務

### 每日 dev_log
- 每天 18:00 自動觸發 dev_log 更新
- 各 agent 記錄當天完成的任務
- 格式統一：做了什麼 / Before / After / 耗時

## 常見問題與解法

### 1. Agent context 爆滿
- 症狀：agent 回應變慢或忘記之前的修改
- 解法：定期 /compact，或 restart agent

### 2. MCP 工具在 compaction 後遺失
- 症狀：agent 無法回覆 Telegram
- 解法：kill agent pane → daemon respawn 新 session

### 3. 多 agent 同時改同一檔案
- 症狀：git conflict
- 解法：coordinator 確保同時只有一個 agent 改同一檔案

### 4. 前端 ES module 中 window 變數不可見
- 症狀：slotEngine.js 中 window._debugX 無效
- 解法：把 debug 邏輯移到 game.html inline script

### 5. Google Apps Script CORS
- 症狀：POST 被 preflight 擋
- 解法：mode:'no-cors' + Content-Type:'text/plain'

### 6. RTP 調校循環
- 問題：改了倍率但體感沒變
- 解法：用 Python 模擬跑 10 萬次確認，再調

## 成果數據

- 34 天完成完整遊戲
- 731+ commits
- 5000+ 行程式碼
- 81 素材檔案
- 1 人操作 11 AI agent
