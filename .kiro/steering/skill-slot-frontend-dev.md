# Slot 前端技術實作

## 架構

```
dev/
├── game.html           # 主遊戲（單 HTML + inline module script）
├── rules.html          # 圖文規則（iframe 嵌入）
├── leaderboard.html    # 排行榜
├── css/game.css        # 樣式
├── js/
│   ├── slotEngine.js       # 盤面產生 + MISS_BIAS
│   ├── dragonGateJudge.js  # 穿門判定
│   ├── payoutCalculator.js # 派彩（winnings + refund）
│   ├── gameManager.js      # 狀態管理
│   ├── freeGame.js         # FG 邏輯
│   ├── bonusGame.js        # BG 邏輯
│   └── effects/            # 特效模組
└── assets/img/ sfx/ audio/
```

純邏輯模組不依賴 DOM，game.html inline script 負責 UI。

## 轉輪動畫引擎

- reel = overflow:hidden 容器，reel-strip 內部滾動
- `buildStripN()`: 建立 final 3 cells + N random cells
- translateY(-N×cellH) → animate to 0
- 側輪: fast linear → decel ease-out → overshoot → settle
- 中輪: 5s ease-out 單曲線
- Turbo: 跳過動畫直接顯示
- `getCellH()` 用 Math.floor 避免 sub-pixel
- `onSidesStop` callback: 側輪停後觸發中門閃爍/JP注入

## 特效系統

- **winLine.js**: gold sweep + glow + particles + badge pop
- **wallHit.js**: 紅色 flash + shake
- **scatterReveal.js**: 逐格揭示 + 飛向收集器
- **BIG WIN**: 三級（ratio≥5/15/30），金幣雨+爆炸+數字動畫，3秒自動收集
- **JP**: 紅金閃爍(jpFlashRedGold) + 符號注入滾動 + 飛移動畫

## 手機自適應

- 所有尺寸用 % 定位（game-root 基準）
- 字體 clamp() 響應式
- 按鈕 ≥ 44px 觸控友好
- viewport 禁止縮放
- .reel overflow:hidden 裁切

## Google Apps Script 排行榜

- POST: mode:'no-cors', Content-Type:'text/plain'（繞 CORS）
- GET: 直接 fetch JSON
- 姓名加 \u200B 防 Sheets 轉數字
- score 用 Number() 防字串拼接
- 重試 3 次（間隔 1/2/3s）
- 組別平均分排名

## 效能優化

- SPIN 前清除殘留 DOM（.win-sweep, .win-particle 等）
- z-index > 9000 的 fixed 元素強制移除
- 圖片/音效預載
- SFX_CACHE 避免重複 new Audio
