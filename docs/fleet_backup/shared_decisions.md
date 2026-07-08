# Fleet 共用決策 (Shared Decisions)

最後更新：2026-07-08

---

## 1. 文件只記錄在 GitHub，不使用 Outline

**決策日期**: 2026 年 6 月
**影響範圍**: 全 Fleet

所有專案文件（企劃規格、前端規格、dev log 等）只記錄在 GitHub repo 的 `docs/` 目錄下，不再使用 Outline。Outline 上的文件已被刪除。

**原因**: 集中管理、版本追蹤、避免資訊分散。

---

## 2. General 不直接修改程式碼

**決策日期**: 2026 年 6 月
**影響範圍**: General instance

General（fleet coordinator）不自己直接修改程式碼或執行開發工作。所有程式修改、bug 修正、檔案操作都必須指派給專門的 agent（程式核心、程式前端、美術音效等）來執行。General 只負責協調、派工、整合結果。

**原因**: 職責分離、避免衝突、確保專業品質。
