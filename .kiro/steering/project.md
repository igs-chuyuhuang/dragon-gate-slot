# 射龍門 Slot 專案 — Agent 共用規則

## 專案資訊
- Repo：/home/acd_rd3/Projects/dragon-gate-slot
- GitHub：https://github.com/igs-chuyuhuang/dragon-gate-slot

## 版本里程碑
- V1（5/28）：能跑就好 — 基本 Spin + 判定 + 派彩
- V2（6/11）：整合版 — 美術、音效、UI、數學、核心功能都接上
- V3（6/23）：DEMO 版 — 微調、可展示

## 開發紀錄規則

每次完成一個工作項目後，必須在對應的 log 檔 append 一筆紀錄並 commit + push。

Log 檔位置：`docs/dev_log/<你的名稱>.md`

紀錄格式：
```
### [日期] — [工作項目名稱]

**環節：** 企劃 / 數學 / 美術 / 程式 / 測試
**AI 工具：** Kiro Agent / 其他工具名稱
**做了什麼：** 描述
**Before：** 介入前的狀態
**After：** 產出了什麼（檔案名稱）
**關鍵 prompt / 指令：** 人給你的核心指示
**人工修正：** 產出後人改了什麼（沒改就寫「無」）
**耗時：** 從提問到完成大約多久
```

## 即時狀態更新規則

**啟動時：** 第一件事讀取 `docs/CURRENT_STATUS.md`，了解目前專案進度和你負責模組的狀態。

**完成任務後：** 立即更新 `docs/CURRENT_STATUS.md` 中你負責的段落，包含：
- 你剛完成了什麼
- 目前狀態變成什麼
- 有無新增待辦事項

更新後 commit + push（可與任務本身的 commit 合併）。

## Git 規則

- 完成工作後 commit + push
- commit message 用中文，簡述做了什麼
- push 前先 `git pull --rebase` 避免衝突
