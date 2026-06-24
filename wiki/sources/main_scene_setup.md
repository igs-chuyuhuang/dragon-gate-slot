# MainScene 場景設定指南

## 快速設定步驟

### 1. 建立場景
- File → New Scene → Save as `Assets/Scenes/MainScene.unity`

### 2. 建立 GameManager 物件
- 建立空 GameObject，命名 `GameManager`
- 掛載 `GameManager.cs`（會自動加 SlotEngine）

### 3. 建立 Canvas
- GameObject → UI → Canvas
- Canvas Scaler: Scale With Screen Size, Reference 1920×1080

### 4. 盤面區域（3×3 Grid）
在 Canvas 下建立：
```
Canvas
└── BoardPanel (Panel, 居中)
    ├── Cell_0 (Text) — Row1 Left
    ├── Cell_1 (Text) — Row1 Mid
    ├── Cell_2 (Text) — Row1 Right
    ├── Cell_3 (Text) — Row2 Left
    ├── Cell_4 (Text) — Row2 Mid
    ├── Cell_5 (Text) — Row2 Right
    ├── Cell_6 (Text) — Row3 Left
    ├── Cell_7 (Text) — Row3 Mid
    └── Cell_8 (Text) — Row3 Right
```
- 每個 Cell Text: Font Size 48, Alignment Center, 建議 150×150 大小
- BoardPanel 加 Grid Layout Group: Cell Size 150×150, Spacing 10×10

### 5. 資訊顯示區
```
Canvas
├── BalanceText (Text) — 左上角，顯示餘額
├── BetText (Text) — 左上角餘額下方
├── WinText (Text) — 盤面下方居中，顯示贏分
└── ResultText (Text) — 盤面右側，顯示每列判定
```

### 6. 按鈕區
```
Canvas
├── SpinButton (Button) — 右下角大按鈕，Text="SPIN"
├── BetUpButton (Button) — 下注旁 "+"
└── BetDownButton (Button) — 下注旁 "-"
```

### 7. 掛載 MainUIController
- 在 Canvas 上掛載 `MainUIController.cs`
- 拖曳指定：
  - Game Manager → GameManager 物件
  - Cell Texts [0~8] → 對應的 9 個 Text
  - Balance Text, Bet Text, Win Text, Result Text
  - Spin Button, Bet Up Button, Bet Down Button

## 驗證
1. Play → 畫面顯示 Balance: 1000, Bet: 10
2. 按 SPIN → 盤面出現牌值，Result 顯示判定
3. 按 +/- 調整下注額
4. 餘額不足時 SPIN 按鈕變灰
