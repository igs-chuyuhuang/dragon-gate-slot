# 射龍門 Slot — LLM Wiki Schema

## 結構
- wiki/sources/ — 原始資料（不可修改）
- wiki/pages/ — LLM 產生的知識頁面
- wiki/INDEX.md — 所有頁面索引
- wiki/LOG.md — 操作紀錄

## 頁面類型
- overview.md — 專案總覽
- entity/ — 實體頁（每個遊戲系統一頁）
- topic/ — 主題頁（機率、UI、架構等）
- decision/ — 決策紀錄
- qa/ — 常見問題

## 操作規則
### Ingest（加入新資料）
1. 讀取 sources/ 中的新檔案
2. 摘要重點
3. 更新相關頁面（交叉引用）
4. 更新 INDEX.md
5. 記錄到 LOG.md

### Query（查詢）
1. 搜尋相關 wiki 頁面
2. 綜合回答
3. 有價值的回答存為新頁面

### Lint（健檢）
1. 檢查頁面間是否有矛盾
2. 找出過時資訊
3. 補充缺少的交叉引用

## 命名規則
- 檔名用英文 kebab-case
- 頁面內用中文
- 用 [[連結]] 做交叉引用
