# Fleet Agent 備份

備份日期：2026-06-05
備份內容：各 Agent 的 steering files、system prompts、fleet config、shared decisions。

## 目錄結構
- `fleet_config.yaml` — fleet.yaml 完整配置（已移除敏感資訊）
- `shared_decisions.md` — Fleet 共享決策
- `general/` — Fleet Coordinator (general) 的 steering
- `project_steering/` — 專案共用 steering (project.md)
- `agents/` — 各 Agent 的角色定義與 system prompt
