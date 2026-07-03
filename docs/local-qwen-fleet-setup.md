# 地端 Qwen Agent Fleet 建置指南

## 目的

證明「地端開源模型（Qwen）也能完成完整遊戲開發」，不依賴雲端付費 LLM。

具體做法：參考現有射龍門 Slot 的規格文件與程式碼架構，用地端 Qwen 模型做出一版不同風格的 Slot 遊戲。用地端 Qwen 模型根據現有 skill 和規格做出一版品質堪用的 Slot 遊戲。

---

## ⚠️ 絕對遵守規則

```
1. 所有文字生成、程式撰寫、推理、分析、QA 等任務 → 一律使用地端 Qwen（Ollama）
2. 只有「生成圖片」的任務 → 可以接 OpenAI API（DALL-E / GPT Image 2.0）
3. 除了生圖以外，絕對不可以呼叫任何雲端 LLM API

簡單判斷：
- 要產出圖片 → OpenAI API ✅
- 其他所有事 → 地端 Qwen ✅、雲端 ❌
```

---

## 參考資料使用規範

GitHub Repo：https://github.com/igs-chuyuhuang/dragon-gate-slot

### ✅ 可以參考的（讀懂後自己重做）

| 資料 | 路徑 | 怎麼用 |
|------|------|--------|
| 企劃規格 v2.0 | docs/game_design.md | 完整遊戲規則，可沿用規則設計 |
| 前端開發規格 | docs/dev-spec.md | UI/動畫設計參考，風格自己定 |
| 賠付表 | math/paytable.md | 數學邏輯可沿用或自行調整 |
| 開發計畫 | docs/development_plan.md | 參考六階段流程 |
| 美術清單 | art/asset_list.md | 參考需要哪些素材，自己用不同風格重新生成 |
| 音效規劃 | docs/v2_audio_plan.md | 參考音效種類和觸發時機 |
| Skill: 數學模型 | docs/skills/slot-math-model.md | RTP/倍率/MISS_BIAS 設計方法 |
| Skill: 遊戲設計 | docs/skills/slot-game-design.md | MG/FG/BG/JP/Scatter 完整機制 |
| Skill: 前端實作 | docs/skills/slot-frontend-dev.md | 架構+轉輪動畫+特效系統 |
| Skill: 美術音效 | docs/skills/slot-art-audio.md | 產圖 prompt + PIL + 音效合成 |
| Skill: 特效系統 | docs/skills/slot-effects.md | CSS粒子/Camera feel/JP演出 |
| Skill: QA測試 | docs/skills/slot-qa-exploit.md | RTP模擬/exploit防護 |
| Skill: 排行榜 | docs/skills/slot-leaderboard.md | Google Apps Script 完整做法 |
| 程式碼架構 | dev/js/*.js | 參考模組拆分方式，程式碼自己重寫 |
| CSS 佈局 | dev/game.html (inline style) | 參考佈局方式，樣式自己重做 |

### ❌ 不可以做的

- 不可以直接複製貼上原始程式碼
- 不可以用相同的美術素材
- 不可以用相同的視覺風格（國潮）— 請換一個新主題
- 不可以呼叫雲端 LLM（生圖除外）

### 🎯 最終產物要求

- 獨立運行的 HTML5 Slot 遊戲（不依賴原 repo 任何檔案）
- 不同的視覺主題風格
- 核心機制可相同（射龍門規則），但程式碼是自己寫的
- 包含至少：Main Game + 一種副遊戲（FG 或 BG）
- RTP 有蒙地卡羅模擬驗證

## 前置條件

- 已有 Ollama 安裝且可運行
- 已有 AgEnD 安裝
- 有一個新的 Telegram bot token（或 Discord bot token）
- 有 OpenAI API key（僅供生圖用）

---

## Step 1：確認 Ollama 跑 Qwen

```bash
# 下載 Qwen 模型（選一個，看 GPU 記憶體）
ollama pull qwen3:32b        # 32B 需要 ~20GB VRAM
# 或
ollama pull qwen3:14b        # 14B 需要 ~10GB VRAM
# 或
ollama pull qwen3:8b         # 8B 需要 ~6GB VRAM

# 確認模型能跑
ollama run qwen3:32b "hello"

# 確認 API endpoint 可用
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3:32b","messages":[{"role":"user","content":"hi"}]}'
```

---

## Step 2：安裝 opencode

```bash
curl -fsSL https://opencode.ai/install | bash
```

---

## Step 3：設定 opencode 連接 Ollama

```bash
# 建立 opencode 設定檔
mkdir -p ~/.config/opencode
cat > ~/.config/opencode/config.json << 'EOF'
{
  "provider": "openai-compatible",
  "model": "qwen3:32b",
  "baseUrl": "http://localhost:11434/v1",
  "apiKey": "ollama"
}
EOF
```

---

## Step 4：建立第二個 Fleet

```bash
# 建立新的 AGEND_HOME
export AGEND_HOME=~/.agend-local
mkdir -p $AGEND_HOME

# 建立 .env（放新 bot token + OpenAI key 僅供生圖）
cat > $AGEND_HOME/.env << 'EOF'
AGEND_BOT_TOKEN=你的新TG_Bot_Token
OPENAI_API_KEY=你的OpenAI_API_Key_僅供生圖
EOF

# 建立 fleet.yaml
cat > $AGEND_HOME/fleet.yaml << 'EOF'
channel:
  - type: telegram
    mode: topic
    bot_token_env: AGEND_BOT_TOKEN
    group_id: '你的新TG群組ID'
    access:
      mode: locked
      allowed_users:
        - '你的TG_User_ID'
    id: telegram

defaults:
  backend: opencode

instances:
  general:
    working_directory: ~/.agend-local/general
    topic_id: 1
    general_topic: true
EOF

# 建立 general workspace
mkdir -p $AGEND_HOME/general
```

---

## Step 5：啟動第二個 Fleet

```bash
AGEND_HOME=~/.agend-local agend fleet start
```

---

## Step 6：驗證

1. 去新的 TG 群組發訊息
2. 新 fleet 的 general 應該用地端 Qwen 回覆
3. 確認能讀寫檔案、執行指令
4. 測試生圖：請 agent 呼叫 OpenAI API 生成一張圖片，確認 API key 可用

---

## Step 7：生圖功能設定

在 general 的 workspace 加入 artifex-mcp（圖片生成 MCP server）：

```bash
mkdir -p $AGEND_HOME/general/.kiro/settings
cat > $AGEND_HOME/general/.kiro/settings/mcp.json << 'EOF'
{
  "mcpServers": {
    "artifex": {
      "command": "npx",
      "args": ["artifex-mcp"],
      "env": {
        "OPENAI_API_KEY": "你的OpenAI_API_Key",
        "DEFAULT_IMAGE_PROVIDER": "openai"
      }
    }
  }
}
EOF
```

---

## 注意事項

- 兩個 fleet 互不干擾，各自獨立
- 第二個 fleet 的 bot token **不能**跟第一個相同
- 第二個 fleet 的 TG 群組也建議用新的（避免路由混亂）
- Ollama 必須持續在背景跑（`ollama serve`）
- GPU 記憶體被 Qwen 佔用時，如果同時跑太多請求會 OOM
- OpenAI API key 僅用於生圖，絕不用於文字生成
- Fleet 1（kiro-cli）用雲端不吃本地 GPU，兩個 fleet 不會搶 GPU

---

## 日常使用

```bash
# 啟動（每次重開機後）
ollama serve &                              # 先啟動 Ollama
AGEND_HOME=~/.agend-local agend fleet start # 再啟動 Fleet 2

# 停止
AGEND_HOME=~/.agend-local agend fleet stop

# 查看狀態
AGEND_HOME=~/.agend-local agend fleet status
```

---

## 架構圖

```
你的主機
├── Fleet 1（現有，雲端）
│   ├── AGEND_HOME=~/.agend
│   ├── Runtime: kiro-cli
│   ├── LLM: Claude Opus 4.6（AWS 雲端）
│   └── 用途：現有 agent 們
│
└── Fleet 2（新建，地端）
    ├── AGEND_HOME=~/.agend-local
    ├── Runtime: opencode
    ├── LLM: Qwen（Ollama 地端）
    ├── 生圖: OpenAI API（唯一允許的雲端呼叫）
    └── 用途：地端版 Slot 遊戲（不同風格）
```

---

## 開發策略建議

1. **先做核心邏輯驗證**：SlotEngine + DragonGateJudge + PayoutCalculator
2. **確認能正確運行後再擴展**：加 UI → 加 FG/BG → 加特效
3. **記錄過程**：每個階段花了多少迭代、哪裡卡住、人工介入了什麼
