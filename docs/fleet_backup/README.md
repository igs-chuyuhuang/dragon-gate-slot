# Fleet 備份

最後更新日期：2026-07-11

## 說明

此目錄包含 AgEnD Fleet 的完整配置備份，用於災難恢復或新環境部署。

## 檔案結構

```
fleet_backup/
├── README.md                   ← 本檔案
├── fleet_snapshot_latest.md    ← 最新完整快照
├── fleet_config.yaml           ← ~/.agend/fleet.yaml 備份
├── project_steering.md         ← .kiro/steering/project.md 備份
├── shared_decisions.md         ← Fleet 共用決策紀錄
└── agents/                     ← 各 Agent 角色描述與 steering
    ├── 企劃-qa-t82.md
    ├── 數學模型-t83.md
    ├── 美術音效-t84.md
    ├── 程式核心-t85.md
    ├── 程式前端-t86.md
    ├── 特效爽感-gf-t326.md
    ├── 創意總監-cd-t327.md
    ├── 市場調查-dragon-gate-t907.md
    └── 挑戰者-challenger-t1554.md
```

## 恢復步驟

1. 將 `fleet_config.yaml` 複製回 `~/.agend/fleet.yaml`
2. 將 `project_steering.md` 複製回 `.kiro/steering/project.md`
3. 各 agent 的 steering 檔案依需要恢復到 `.kiro/steering/`
4. 重啟 agend daemon

## 備份頻率

每日 21:00 (UTC+8) 由 General 觸發更新。
