# 射龍門 Slot (Dragon Gate Slot)

AI Agent 輔助遊戲開發專案

## 專案結構

```
docs/          ← 企劃規格、任務計畫
math/          ← RTP 模擬 Python、賠付表
art/           ← 美術素材、prompt、音效
  assets/      ← 生成的圖片/音效檔案
unity/         ← Unity 專案 (DragonGateSlot)
qa/            ← 測試文件、Bug 清單
```

## 開發團隊 (AI Agent + Human)

| 角色 | Agent | 負責內容 |
|------|-------|---------|
| 統籌 | Producer Agent | 進度追蹤、整合協調 |
| 企劃/QA | Game Designer + QA Agent | 規格細化、測試 |
| 數學模型 | Math Designer Agent | 賠付表、RTP 模擬 |
| 美術/音效 | Art + Audio Agent | AI 生圖/音效 |
| 程式-核心邏輯 | Unity Developer Agent | 穿門判定、Free Game、JP |
| 程式-前端/UI | Unity Developer Agent | UI、動畫、素材整合 |
| 創意總監 | Creative Director Agent | 創新玩法設計、wow moment、小遊戲、連擊儀式感 |
| 特效爽感 | Game Feel Agent | 體感特效設計（Spin 蓄力、穿門火花、碰壁裂痕、JP 多段揭曉）|

## 遊戲規格

- 3×3 Slot，射龍門判定機制
- RTP 96.4%
- 三層 JP 彩金 (Basic / Major / Grand)
- Free Game 大龍門挑戰
