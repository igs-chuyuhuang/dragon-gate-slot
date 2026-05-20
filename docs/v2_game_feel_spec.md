# V2 Game Feel 特效爽感規格書

> 版本：V2（目標 6/11）  
> 負責：爽感設計師 Agent  
> 核心原則：**按下去爽不爽** > 圖好不好看

---

## 目錄

1. [架構整合策略](#架構整合策略)
2. [Scenario 1: Spin 按鈕蓄力](#scenario-1-spin-按鈕蓄力)
3. [Scenario 2: 穿門成功](#scenario-2-穿門成功)
4. [Scenario 3: 碰壁](#scenario-3-碰壁)
5. [Scenario 4: Scatter 差一顆](#scenario-4-scatter-差一顆)
6. [Scenario 5: 觸發 Free Game](#scenario-5-觸發-free-game)
7. [Scenario 6: JP 命中](#scenario-6-jp-命中)
8. [Scenario 7: 連續穿門（連擊）](#scenario-7-連續穿門連擊)
9. [效能預算](#效能預算)
10. [音效資源清單](#音效資源清單)

---

## 架構整合策略

### 現有架構

- 純 DOM + vanilla ES modules（無 build tool）
- 3×3 grid，CSS animations（bounce, flash）
- `animateSpin()` 用 setInterval 滾動 + setTimeout 逐列停止
- 已有 overlay 機制（celebrate-overlay, fg-trigger-overlay）

### 工具選擇

| 工具 | 用途 | 大小 | 載入方式 |
|------|------|------|----------|
| **Anime.js v3** | 主力動畫引擎（DOM 動畫、時間軸編排） | ~17KB min+gz | ESM CDN import |
| **PixiJS v8** | 粒子特效 overlay canvas（火花、金幣） | ~150KB min+gz | ESM CDN import, lazy load |
| **Lottie-web light** | 預烘焙複雜動畫（金龍飛出） | ~50KB min+gz | ESM CDN import, lazy load |

### 不用 Phaser 的理由

Phaser 是完整遊戲框架（~1MB），我們只需要在現有 DOM app 上疊加特效層。PixiJS 的 particle system 已足夠處理粒子需求。

### 整合架構

```
index.html
├── DOM Layer（現有 .board, .cell, buttons）
│   └── Anime.js 控制所有 DOM 動畫
├── Canvas Overlay（position: fixed, pointer-events: none）
│   └── PixiJS 處理粒子效果
└── Lottie Container（絕對定位）
    └── 金龍等預烘焙動畫
```

### 初始化程式碼

```javascript
// web/js/gameFeel.js — 特效爽感主模組
import anime from 'https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.es.js';

let pixiApp = null;
let lottiePlayer = null;

// Lazy load PixiJS（首次需要粒子時才載入）
async function getPixi() {
  if (pixiApp) return pixiApp;
  const PIXI = await import('https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.min.mjs');
  pixiApp = new PIXI.Application();
  await pixiApp.init({ backgroundAlpha: 0, resizeTo: window });
  pixiApp.canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:900';
  document.body.appendChild(pixiApp.canvas);
  return pixiApp;
}

// Lazy load Lottie
async function getLottie() {
  if (lottiePlayer) return lottiePlayer;
  const lottie = await import('https://cdn.jsdelivr.net/npm/lottie-web@5/build/player/lottie_light.min.js');
  lottiePlayer = lottie.default || lottie;
  return lottiePlayer;
}

export { anime, getPixi, getLottie };
```

---

## Scenario 1: Spin 按鈕蓄力

### 設計意圖

讓玩家感受到「能量正在蓄積」→「釋放」的爽感循環。按下瞬間要有重量感。

### 工具

**Anime.js**（純 DOM 動畫，無需 canvas）

### 時間軸

```
[按下 mousedown/touchstart]
  0ms    → 按鈕 scale(0.92), 金光 glow 開始蓄積
  0-∞ms  → 持續按住：震動 + 金光漸強（loop）
[放開 mouseup/touchup → 觸發 spin]
  0ms    → 🔊 spin_release.mp3
  0ms    → scale 彈回 1.05 → 1.0
  0ms    → 金光爆發 flash
  50ms   → 震動停止
  200ms  → 回歸靜止
```

### Easing 曲線

- 按下壓縮：`easeOutCubic`（快速壓下）
- 彈回：`easeOutElastic(1, 0.5)`（彈性回彈，有肉感）
- 震動：`easeInOutSine`（自然往復）
- 金光蓄積：`easeInQuad`（越來越亮）

### 音效觸發點

| 時間點 | 音效 | 說明 |
|--------|------|------|
| mousedown | `spin_charge.mp3` | 低頻蓄力音，loop |
| mouseup (release) | `spin_release.mp3` | 爆發釋放音，短促有力 |

### 效能考量

- 僅操作 `transform` 和 `box-shadow`，不觸發 layout reflow
- 震動用 `translateX` 交替 ±2px，GPU 加速
- 金光用 `box-shadow` 而非 `filter`（避免全元素重繪）

### 實作程式碼

```javascript
// web/js/effects/spinButton.js
import { anime } from '../gameFeel.js';

let chargeAnim = null;
const spinBtn = document.getElementById('spin-btn');

export function initSpinButton(onSpin) {
  const chargeAudio = new Audio('assets/sfx/spin_charge.mp3');
  const releaseAudio = new Audio('assets/sfx/spin_release.mp3');
  chargeAudio.loop = true;

  spinBtn.addEventListener('pointerdown', () => {
    chargeAudio.currentTime = 0;
    chargeAudio.play();

    chargeAnim = anime.timeline({ loop: true })
      .add({
        targets: spinBtn,
        translateX: [
          { value: -2, duration: 40 },
          { value: 2, duration: 40 },
          { value: 0, duration: 40 }
        ],
        easing: 'easeInOutSine'
      })
      .add({
        targets: spinBtn,
        boxShadow: ['0 0 0px #ffd700', '0 0 20px 8px #ffd700'],
        duration: 600,
        easing: 'easeInQuad',
        direction: 'alternate'
      }, 0);

    anime({
      targets: spinBtn,
      scale: 0.92,
      duration: 100,
      easing: 'easeOutCubic'
    });
  });

  spinBtn.addEventListener('pointerup', () => {
    chargeAudio.pause();
    if (chargeAnim) { chargeAnim.pause(); chargeAnim = null; }

    releaseAudio.currentTime = 0;
    releaseAudio.play();

    anime({
      targets: spinBtn,
      scale: [1.05, 1.0],
      boxShadow: ['0 0 30px 12px #ffd700', '0 0 0px #ffd700'],
      duration: 200,
      easing: 'easeOutElastic(1, 0.5)'
    });

    onSpin();
  });
}
```

---

## Scenario 2: 穿門成功

### 設計意圖

穿門是核心正回饋。要讓玩家感受到「衝破」的力道 — 火花四射 + 鏡頭震動 + 數字飛出。

### 工具

- **Anime.js**：DOM 動畫（cell 閃光、鏡頭 shake、數字飛出）
- **PixiJS**：火花粒子（canvas overlay）

### 時間軸

```
[判定穿門成功，該列停止後]
  0ms    → 🔊 gate_through.mp3
  0ms    → 該列 3 個 cell 同時金色閃光
  0ms    → PixiJS 火花粒子從中間 cell 爆發
  30ms   → 鏡頭 shake（整個 .board 震動）
  200ms  → 倍率數字從 cell 飛出到贏分區
  400ms  → 火花粒子消散
  500ms  → 閃光結束，cell 回歸
  600ms  → 整體動畫結束
```

### Easing 曲線

- Cell 閃光：`easeOutExpo`（瞬間亮起，緩慢消退）
- 鏡頭 shake：`easeOutQuad` 衰減（先猛後弱）
- 數字飛出：`easeOutBack`（帶回彈的拋物線）
- 火花粒子：線性擴散 + `easeOutQuad` 透明度衰減

### 音效觸發點

| 時間點 | 音效 | 說明 |
|--------|------|------|
| 0ms | `gate_through.mp3` | 金屬穿透音 + 火花聲 |
| 200ms | `score_fly.mp3` | 數字飛出的 whoosh 音 |

### 效能考量

- 火花粒子限制 30 個，生命週期 400ms 後自動回收
- 鏡頭 shake 用 `transform: translate3d()` 確保 GPU 合成
- 多列同時穿門時，粒子共用同一個 PixiJS Application

### 實作程式碼

```javascript
// web/js/effects/gateThrough.js
import { anime, getPixi } from '../gameFeel.js';

const throughAudio = new Audio('assets/sfx/gate_through.mp3');
const flyAudio = new Audio('assets/sfx/score_fly.mp3');

export async function playGateThrough(row, mult) {
  throughAudio.currentTime = 0;
  throughAudio.play();

  const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
  const board = document.querySelector('.board');

  // 1. Cell 金色閃光
  anime({
    targets: cells,
    backgroundColor: ['#16213e', '#ffd700', '#16213e'],
    boxShadow: ['0 0 0px #ffd700', '0 0 24px 8px #ffd700', '0 0 0px #ffd700'],
    duration: 500,
    easing: 'easeOutExpo'
  });

  // 2. 鏡頭 shake
  anime({
    targets: board,
    translateX: [
      { value: -4, duration: 30 },
      { value: 4, duration: 30 },
      { value: -3, duration: 30 },
      { value: 3, duration: 30 },
      { value: -1, duration: 30 },
      { value: 0, duration: 30 }
    ],
    easing: 'easeOutQuad',
    delay: 30
  });

  // 3. 火花粒子
  const app = await getPixi();
  const midCell = cells[1].getBoundingClientRect();
  const cx = midCell.left + midCell.width / 2;
  const cy = midCell.top + midCell.height / 2;
  spawnSparks(app, cx, cy, 30);

  // 4. 倍率數字飛出
  setTimeout(() => {
    flyAudio.currentTime = 0;
    flyAudio.play();
    const numEl = document.createElement('div');
    numEl.className = 'fly-number';
    numEl.textContent = `×${mult}`;
    numEl.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;font-size:28px;font-weight:bold;color:#ffd700;z-index:950;pointer-events:none`;
    document.body.appendChild(numEl);

    const winEl = document.getElementById('win').getBoundingClientRect();
    anime({
      targets: numEl,
      left: winEl.left + winEl.width / 2,
      top: winEl.top,
      scale: [1.5, 0.8],
      opacity: [1, 0],
      duration: 400,
      easing: 'easeOutBack',
      complete: () => numEl.remove()
    });
  }, 200);
}

function spawnSparks(app, cx, cy, count) {
  const { Graphics } = app.renderer.constructor === undefined ? PIXI : await import('pixi.js');
  for (let i = 0; i < count; i++) {
    const spark = new Graphics();
    spark.beginFill(Math.random() > 0.5 ? 0xffd700 : 0xff6b35);
    spark.drawCircle(0, 0, 2 + Math.random() * 3);
    spark.endFill();
    spark.position.set(cx, cy);
    app.stage.addChild(spark);

    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 80;
    anime({
      targets: spark.position,
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      duration: 300 + Math.random() * 200,
      easing: 'linear'
    });
    anime({
      targets: spark,
      alpha: 0,
      duration: 400,
      easing: 'easeOutQuad',
      complete: () => { app.stage.removeChild(spark); spark.destroy(); }
    });
  }
}
```

---

## Scenario 3: 碰壁

### 設計意圖

碰壁是負回饋但不能讓玩家沮喪。要有「撞擊感」但帶點戲劇性 — 像撞到牆壁彈回來，有裂痕但不至於崩塌。

### 工具

**Anime.js**（純 DOM，碰壁不需要粒子）

### 時間軸

```
[判定碰壁，該列停止後]
  0ms    → 🔊 wall_hit.mp3（低沉撞擊）
  0ms    → 中間 cell 猛烈放大 scale(1.15) + 紅色邊框
  0ms    → 左右 cell 被「推開」translateX ±3px
  50ms   → 整列回彈 + 裂痕 CSS class 加上
  100ms  → 🔊 crack.mp3（細微裂痕音）
  150ms  → 微弱餘震
  400ms  → 裂痕淡出
  500ms  → 回歸靜止
```

### Easing 曲線

- 撞擊放大：`easeOutExpo`（瞬間膨脹）
- 回彈：`easeOutBounce`（物理彈跳感）
- 裂痕淡出：`easeInQuad`（自然消失）
- 左右推開：`easeOutBack`（被彈開的感覺）

### 音效觸發點

| 時間點 | 音效 | 說明 |
|--------|------|------|
| 0ms | `wall_hit.mp3` | 低頻撞擊音（80-150Hz 為主） |
| 100ms | `crack.mp3` | 細微裂痕/碎裂音 |

### 效能考量

- 純 CSS transform + border 操作，零 layout reflow
- 裂痕用 CSS `::after` pseudo-element + background-image SVG
- 不使用 canvas，保持輕量

### 實作程式碼

```javascript
// web/js/effects/wallHit.js
import { anime } from '../gameFeel.js';

const hitAudio = new Audio('assets/sfx/wall_hit.mp3');
const crackAudio = new Audio('assets/sfx/crack.mp3');

export function playWallHit(row) {
  hitAudio.currentTime = 0;
  hitAudio.play();

  const cells = [0, 1, 2].map(c => document.getElementById(`cell-${row}-${c}`));
  const midCell = cells[1];
  const leftCell = cells[0];
  const rightCell = cells[2];

  // 1. 中間 cell 撞擊膨脹
  anime({
    targets: midCell,
    scale: [1, 1.15, 1],
    borderColor: ['#0f3460', '#e94560', '#0f3460'],
    duration: 300,
    easing: 'easeOutExpo'
  });

  // 2. 左右被推開
  anime({
    targets: leftCell,
    translateX: [-3, 0],
    duration: 200,
    easing: 'easeOutBack'
  });
  anime({
    targets: rightCell,
    translateX: [3, 0],
    duration: 200,
    easing: 'easeOutBack'
  });

  // 3. 裂痕效果
  setTimeout(() => {
    crackAudio.currentTime = 0;
    crackAudio.play();
    midCell.classList.add('cracked');
    anime({
      targets: midCell,
      translateX: [
        { value: -1, duration: 30 },
        { value: 1, duration: 30 },
        { value: 0, duration: 30 }
      ],
      delay: 50
    });
  }, 100);

  // 4. 裂痕淡出
  setTimeout(() => {
    midCell.classList.remove('cracked');
  }, 500);
}
```

### 需要的 CSS

```css
.cell.cracked::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,...") center/contain no-repeat; /* 裂痕 SVG */
  opacity: 0.7;
  animation: crack-fade 400ms ease-in forwards;
}
@keyframes crack-fade { to { opacity: 0; } }
```

---

## Scenario 4: Scatter 差一顆

### 設計意圖

「差一點就中了」是 slot 最強的心理鉤子。要製造緊張感 — 心跳加速、龍吟低鳴、畫面暗下來聚焦在缺少的那個位置。讓玩家覺得「下一把一定中」。

### 觸發條件

`countScatters(board) === 2`（需要 3 顆觸發 Free Game，目前只有 2 顆）

### 工具

**Anime.js**（DOM 動畫 + 音效編排）

### 時間軸

```
[所有列停止後，判定 SC=2]
  0ms    → 🔊 heartbeat.mp3（開始循環）
  0ms    → 畫面整體暗下 (body overlay opacity 0.4)
  0ms    → 已有的 2 顆 SC cell 持續脈動發光
  200ms  → 🔊 dragon_growl.mp3（低沉龍吟）
  300ms  → 非 SC 的 cell 全部 desaturate
  500ms  → 「差一龍！」文字從底部彈出
  1200ms → 🔊 heartbeat 停止
  1500ms → 畫面恢復正常
  1800ms → 文字淡出
  2000ms → 動畫結束
```

### Easing 曲線

- 畫面暗下：`easeOutQuad`（快速進入氛圍）
- SC cell 脈動：`easeInOutSine`（心跳節奏）
- 文字彈出：`easeOutElastic(1, 0.6)`（彈性出現）
- 恢復正常：`easeInOutQuad`（平滑過渡）

### 音效觸發點

| 時間點 | 音效 | 說明 |
|--------|------|------|
| 0ms | `heartbeat.mp3` | 心跳音 loop，BPM 120 |
| 200ms | `dragon_growl.mp3` | 低沉龍吟，營造期待感 |

### 效能考量

- 暗化用 `mix-blend-mode` 或簡單 overlay div，不影響 cell 動畫
- 脈動動畫用 `box-shadow` + `scale`，GPU 合成層
- 文字元素動畫結束後立即 `remove()`

### 實作程式碼

```javascript
// web/js/effects/scatterNearMiss.js
import { anime } from '../gameFeel.js';

const heartbeat = new Audio('assets/sfx/heartbeat.mp3');
const dragonGrowl = new Audio('assets/sfx/dragon_growl.mp3');
heartbeat.loop = true;

export function playScatterNearMiss(board) {
  // 找出 SC 位置
  const scCells = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (board[r][c].isScatter)
        scCells.push(document.getElementById(`cell-${r}-${c}`));

  heartbeat.currentTime = 0;
  heartbeat.play();

  // 1. 畫面暗下
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0);z-index:800;pointer-events:none';
  document.body.appendChild(overlay);
  anime({ targets: overlay, backgroundColor: 'rgba(0,0,0,0.4)', duration: 200, easing: 'easeOutQuad' });

  // 2. SC cell 脈動
  const pulse = anime({
    targets: scCells,
    scale: [1, 1.1, 1],
    boxShadow: ['0 0 0px #ffd700', '0 0 20px 6px #ffd700', '0 0 0px #ffd700'],
    duration: 600,
    easing: 'easeInOutSine',
    loop: 3
  });

  // 3. 龍吟
  setTimeout(() => { dragonGrowl.currentTime = 0; dragonGrowl.play(); }, 200);

  // 4.「差一龍！」文字
  setTimeout(() => {
    const txt = document.createElement('div');
    txt.textContent = '🐉 差一龍！';
    txt.style.cssText = 'position:fixed;bottom:30%;left:50%;transform:translateX(-50%);font-size:36px;font-weight:bold;color:#ffd700;z-index:850;pointer-events:none;text-shadow:0 0 12px #ff6b35';
    document.body.appendChild(txt);

    anime({
      targets: txt,
      scale: [0.3, 1],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutElastic(1, 0.6)'
    });

    // 淡出
    setTimeout(() => {
      anime({
        targets: txt,
        opacity: 0,
        scale: 0.8,
        duration: 300,
        easing: 'easeInQuad',
        complete: () => txt.remove()
      });
    }, 1300);
  }, 500);

  // 5. 恢復
  setTimeout(() => {
    heartbeat.pause();
    anime({
      targets: overlay,
      backgroundColor: 'rgba(0,0,0,0)',
      duration: 300,
      easing: 'easeInOutQuad',
      complete: () => overlay.remove()
    });
  }, 1500);
}
```

---

## Scenario 5: 觸發 Free Game

### 設計意圖

Free Game 是最大獎勵事件。要有「龍門大開、金龍飛出」的史詩感。全畫面接管，讓玩家知道「大事要發生了」。

### 工具

- **Anime.js**：DOM 動畫（門開、畫面震動、文字）
- **Lottie-web**：金龍飛出動畫（預烘焙 JSON）
- **PixiJS**：金幣粒子雨

### 時間軸

```
[SC ≥ 3，觸發 Free Game]
  0ms    → 🔊 dragon_roar.mp3（龍吼）
  0ms    → 畫面全黑 overlay
  200ms  → 龍門 DOM 元素從兩側滑入
  500ms  → 🔊 gate_open.mp3（門開音效）
  500ms  → 龍門打開動畫（左右門板向外旋轉）
  800ms  → Lottie 金龍從門中飛出
  800ms  → 鏡頭大幅 shake
  1000ms → 🔊 dragon_fly.mp3（龍飛過音效）
  1200ms → PixiJS 金幣粒子雨開始
  1500ms → 「FREE GAME」文字爆炸出現
  2000ms → 🔊 crowd_cheer.mp3
  2500ms → 金幣雨持續
  3000ms → 龍門淡出，Lottie 結束
  3500ms → overlay 淡出，進入 FG 模式
  4000ms → 動畫完全結束
```

### Easing 曲線

- 龍門滑入：`easeOutExpo`（快速到位）
- 門板打開：`easeOutBack`（帶回彈的開門）
- 鏡頭 shake：`easeOutQuad` 衰減
- 文字出現：`easeOutElastic(1, 0.4)`（強彈性）
- 整體淡出：`easeInOutQuad`

### 音效觸發點

| 時間點 | 音效 | 說明 |
|--------|------|------|
| 0ms | `dragon_roar.mp3` | 龍吼，低頻震撼 |
| 500ms | `gate_open.mp3` | 石門開啟的厚重聲 |
| 1000ms | `dragon_fly.mp3` | 龍飛過的風聲 |
| 2000ms | `crowd_cheer.mp3` | 歡呼聲，正回饋 |

### 效能考量

- Lottie 動畫預載（在遊戲初始化時 fetch JSON，不 render）
- 金幣粒子限制 50 個，用 object pool 回收
- 整個序列用 `anime.timeline()` 編排，確保時序精確
- 動畫結束後清除所有 DOM 元素和 PixiJS 物件

### 實作程式碼

```javascript
// web/js/effects/freeGameTrigger.js
import { anime, getPixi, getLottie } from '../gameFeel.js';

const roarAudio = new Audio('assets/sfx/dragon_roar.mp3');
const gateAudio = new Audio('assets/sfx/gate_open.mp3');
const flyAudio = new Audio('assets/sfx/dragon_fly.mp3');
const cheerAudio = new Audio('assets/sfx/crowd_cheer.mp3');

export async function playFreeGameTrigger() {
  roarAudio.play();

  // 1. 全黑 overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0);z-index:1000;display:flex;align-items:center;justify-content:center';
  document.body.appendChild(overlay);
  anime({ targets: overlay, backgroundColor: 'rgba(0,0,0,0.85)', duration: 200, easing: 'easeOutQuad' });

  // 2. 龍門滑入
  const gateLeft = document.createElement('div');
  const gateRight = document.createElement('div');
  const gateStyle = 'position:absolute;top:10%;width:40%;height:80%;background:linear-gradient(135deg,#2d1b00,#5c3a1a);border:4px solid #ffd700;';
  gateLeft.style.cssText = gateStyle + 'left:-40%;border-radius:0 20px 20px 0;transform-origin:left center';
  gateRight.style.cssText = gateStyle + 'right:-40%;border-radius:20px 0 0 20px;transform-origin:right center';
  overlay.appendChild(gateLeft);
  overlay.appendChild(gateRight);

  await anime({
    targets: gateLeft, left: '10%', duration: 300, delay: 200, easing: 'easeOutExpo'
  }).finished;
  anime({ targets: gateRight, right: '10%', duration: 300, easing: 'easeOutExpo' });

  // 3. 門打開
  setTimeout(() => gateAudio.play(), 300);
  await new Promise(r => setTimeout(r, 500));
  anime({ targets: gateLeft, rotateY: -70, duration: 600, easing: 'easeOutBack' });
  anime({ targets: gateRight, rotateY: 70, duration: 600, easing: 'easeOutBack' });

  // 4. Lottie 金龍
  const lottie = await getLottie();
  const dragonContainer = document.createElement('div');
  dragonContainer.style.cssText = 'position:absolute;width:60%;height:60%;z-index:1001';
  overlay.appendChild(dragonContainer);
  const dragonAnim = lottie.loadAnimation({
    container: dragonContainer,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: 'assets/lottie/golden_dragon.json'
  });

  // 5. 鏡頭 shake
  setTimeout(() => flyAudio.play(), 200);
  anime({
    targets: document.body,
    translateX: [{ value: -6, duration: 40 }, { value: 6, duration: 40 }, { value: -4, duration: 40 }, { value: 4, duration: 40 }, { value: 0, duration: 60 }],
    delay: 300
  });

  // 6. 金幣粒子雨
  setTimeout(async () => {
    const app = await getPixi();
    spawnCoinRain(app, 50);
  }, 1200);

  // 7.「FREE GAME」文字
  setTimeout(() => {
    cheerAudio.play();
    const txt = document.createElement('div');
    txt.textContent = '🐉 FREE GAME 🐉';
    txt.style.cssText = 'position:absolute;font-size:48px;font-weight:bold;color:#ffd700;text-shadow:0 0 20px #ff6b35,0 4px 8px rgba(0,0,0,0.8);z-index:1002;pointer-events:none';
    overlay.appendChild(txt);
    anime({ targets: txt, scale: [0.2, 1], opacity: [0, 1], duration: 500, easing: 'easeOutElastic(1, 0.4)' });
  }, 1500);

  // 8. 收尾淡出
  setTimeout(() => {
    anime({
      targets: overlay,
      opacity: 0,
      duration: 500,
      easing: 'easeInOutQuad',
      complete: () => { overlay.remove(); dragonAnim.destroy(); }
    });
  }, 3500);
}

function spawnCoinRain(app, count) {
  for (let i = 0; i < count; i++) {
    const coin = new app.renderer.constructor.Graphics?.() || new (globalThis.PIXI.Graphics)();
    coin.beginFill(0xffd700);
    coin.drawCircle(0, 0, 4 + Math.random() * 4);
    coin.endFill();
    coin.position.set(Math.random() * window.innerWidth, -20);
    app.stage.addChild(coin);

    anime({
      targets: coin.position,
      y: window.innerHeight + 20,
      x: coin.position.x + (Math.random() - 0.5) * 100,
      duration: 1500 + Math.random() * 1000,
      delay: Math.random() * 800,
      easing: 'easeInQuad',
      complete: () => { app.stage.removeChild(coin); coin.destroy(); }
    });
  }
}
```

---

## Scenario 6: JP 命中

### 設計意圖

JP 是最高潮。**絕對不能瞬間顯示結果**。要用多段揭曉製造懸念：先揭曉 tier → 再揭曉金額（數字滾動）→ 最後慶祝。每一段之間都要有停頓讓玩家消化。

### 工具

- **Anime.js**：時間軸編排、數字滾動、DOM 動畫
- **PixiJS**：慶祝粒子（金幣爆發）
- **Lottie**：JP 徽章動畫（可選）

### 時間軸（多段揭曉）

```
[Free Game 結束，evalJpGate 返回有 tier]

═══ 第一段：懸念建立 ═══
  0ms    → 🔊 drum_roll.mp3（鼓聲漸強）
  0ms    → 畫面暗下，聚光燈效果
  500ms  → JP 圖標從上方落下（帶彈跳）
  800ms  → 🔊 drum_hit.mp3（鼓聲停）

═══ 第二段：Tier 揭曉 ═══
  1000ms → 圖標翻轉揭曉 tier 名稱
  1000ms → 🔊 tier_reveal.mp3（根據 tier 不同音效）
  1000ms → 背景色變化（Basic=藍, Major=橙, Grand=紅）
  1500ms → 停頓，讓玩家消化

═══ 第三段：金額揭曉 ═══
  2000ms → 🔊 coin_count.mp3（硬幣計數音 loop）
  2000ms → 數字從 0 開始滾動到最終金額
  2000ms → 數字越接近最終值，滾動越慢
  3500ms → 數字到達最終值
  3500ms → 🔊 coin_count 停止
  3500ms → 🔊 jp_win.mp3（勝利音效）

═══ 第四段：慶祝 ═══
  3500ms → 數字放大 + 金色脈動
  3700ms → PixiJS 金幣爆發
  4000ms → 🔊 crowd_cheer.mp3
  5000ms → 漸漸收尾
  6000ms → 回歸正常畫面
```

### Easing 曲線

- JP 圖標落下：`easeOutBounce`（物理彈跳）
- 圖標翻轉：`easeInOutBack`（翻轉感）
- 數字滾動：自定義 — 前 70% 用 `linear`，後 30% 用 `easeOutExpo`（越來越慢）
- 慶祝放大：`easeOutElastic(1, 0.3)`
- 整體淡出：`easeInOutQuad`

### 音效觸發點

| 時間點 | 音效 | 說明 |
|--------|------|------|
| 0ms | `drum_roll.mp3` | 鼓聲漸強，建立懸念 |
| 800ms | `drum_hit.mp3` | 鼓聲重擊，停頓 |
| 1000ms | `tier_reveal.mp3` | 揭曉音（tier 越高越震撼） |
| 2000ms | `coin_count.mp3` | 硬幣計數 loop |
| 3500ms | `jp_win.mp3` | 勝利 fanfare |
| 4000ms | `crowd_cheer.mp3` | 歡呼 |

### 效能考量

- 數字滾動用 `requestAnimationFrame` 而非 setInterval（更流暢）
- 整個序列用 `anime.timeline()` 確保可暫停/跳過
- 提供「跳過」按鈕（長按任意處 1 秒可跳過動畫）
- Grand JP 粒子數加倍（100），Basic 保持 30

### 實作程式碼

```javascript
// web/js/effects/jpReveal.js
import { anime, getPixi } from '../gameFeel.js';

const drumRoll = new Audio('assets/sfx/drum_roll.mp3');
const drumHit = new Audio('assets/sfx/drum_hit.mp3');
const coinCount = new Audio('assets/sfx/coin_count.mp3');
const jpWin = new Audio('assets/sfx/jp_win.mp3');

const TIER_COLORS = { basic: '#1a3a5c', major: '#ff8c00', grand: '#dc143c' };
const TIER_PARTICLES = { basic: 30, major: 60, grand: 100 };

export function playJpReveal(tier, payout) {
  return new Promise(resolve => {
    drumRoll.play();

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0);z-index:1100;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer';
    document.body.appendChild(overlay);
    anime({ targets: overlay, backgroundColor: 'rgba(0,0,0,0.9)', duration: 300, easing: 'easeOutQuad' });

    // 跳過機制
    let skipped = false;
    let holdTimer = null;
    overlay.addEventListener('pointerdown', () => { holdTimer = setTimeout(() => { skipped = true; finish(); }, 1000); });
    overlay.addEventListener('pointerup', () => clearTimeout(holdTimer));

    const tl = anime.timeline({ autoplay: true });

    // 第一段：JP 圖標落下
    const badge = document.createElement('div');
    badge.textContent = '🏆 JP';
    badge.style.cssText = 'font-size:64px;transform:translateY(-200px);opacity:0';
    overlay.appendChild(badge);

    tl.add({ targets: badge, translateY: [-200, 0], opacity: [0, 1], duration: 500, delay: 500, easing: 'easeOutBounce' });

    // 第二段：Tier 揭曉
    tl.add({
      targets: badge,
      rotateY: [0, 180],
      duration: 400,
      easing: 'easeInOutBack',
      begin: () => { drumHit.play(); },
      changeComplete: () => {
        badge.textContent = tier.toUpperCase();
        badge.style.color = TIER_COLORS[tier];
        badge.style.textShadow = `0 0 20px ${TIER_COLORS[tier]}`;
      }
    }, '+=200')
    .add({ targets: badge, rotateY: [180, 360], duration: 400, easing: 'easeInOutBack' });

    // 第三段：金額數字滾動
    const numEl = document.createElement('div');
    numEl.style.cssText = 'font-size:48px;font-weight:bold;color:#ffd700;margin-top:20px';
    numEl.textContent = '0';
    overlay.appendChild(numEl);

    tl.add({
      duration: 1500,
      delay: 500,
      begin: () => { coinCount.loop = true; coinCount.play(); },
      update: (anim) => {
        // 自定義 easing：前 70% linear，後 30% 減速
        const progress = anim.progress / 100;
        let value;
        if (progress < 0.7) {
          value = payout * (progress / 0.7) * 0.9;
        } else {
          const t = (progress - 0.7) / 0.3;
          value = payout * 0.9 + payout * 0.1 * (1 - Math.pow(1 - t, 3));
        }
        numEl.textContent = Math.round(value).toLocaleString();
      },
      complete: () => { coinCount.pause(); numEl.textContent = Math.round(payout).toLocaleString(); }
    });

    // 第四段：慶祝
    tl.add({
      targets: numEl,
      scale: [1, 1.3],
      duration: 300,
      easing: 'easeOutElastic(1, 0.3)',
      begin: () => { jpWin.play(); }
    })
    .add({
      duration: 2000,
      begin: async () => {
        const app = await getPixi();
        const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        spawnCelebration(app, cx, cy, TIER_PARTICLES[tier]);
      }
    });

    function finish() {
      tl.pause();
      [drumRoll, coinCount].forEach(a => a.pause());
      numEl.textContent = Math.round(payout).toLocaleString();
      anime({ targets: overlay, opacity: 0, duration: 400, easing: 'easeInOutQuad', complete: () => { overlay.remove(); resolve(); } });
    }

    // 自然結束
    tl.finished.then(() => setTimeout(finish, 500));
  });
}

function spawnCelebration(app, cx, cy, count) {
  for (let i = 0; i < count; i++) {
    const g = new (globalThis.PIXI?.Graphics || app.stage.constructor)();
    g.beginFill([0xffd700, 0xff6b35, 0xffffff][i % 3]);
    g.drawCircle(0, 0, 3 + Math.random() * 5);
    g.endFill();
    g.position.set(cx, cy);
    app.stage.addChild(g);

    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const dist = 100 + Math.random() * 200;
    anime({
      targets: g.position,
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist - 50,
      duration: 800 + Math.random() * 400,
      easing: 'easeOutQuad'
    });
    anime({
      targets: g,
      alpha: 0,
      duration: 1000,
      delay: 300,
      easing: 'easeInQuad',
      complete: () => { app.stage.removeChild(g); g.destroy(); }
    });
  }
}
```

---

## Scenario 7: 連續穿門（連擊）

### 設計意圖

同一次 spin 多列穿門，或連續多次 spin 都穿門時，要有「連擊加成」的爽感遞增。每一擊比上一擊更猛烈 — 震動更大、火花更多、音調更高。

### 觸發條件

- **單次連擊**：同一 spin 中 2 列或 3 列都穿門
- **跨次連擊**：連續 spin 都有穿門（需要 state 追蹤）

### 工具

- **Anime.js**：遞增強度的 DOM 動畫
- **PixiJS**：遞增粒子數量

### 連擊等級系統

| 連擊數 | 等級 | 震動強度 | 粒子數 | 音調 pitch | 特殊效果 |
|--------|------|----------|--------|-----------|----------|
| 1 | 普通 | ±4px | 30 | 1.0 | 無 |
| 2 | 雙連 | ±6px | 50 | 1.1 | 畫面邊緣金光 |
| 3 | 三連 | ±8px | 80 | 1.2 | 全畫面金色脈動 |
| 4+ | 超連擊 | ±10px | 100 | 1.3 | 「連擊×N」文字 + 螢幕閃白 |

### 時間軸（以雙連為例）

```
[第一列穿門]
  0ms    → 標準穿門動畫（Scenario 2）
  600ms  → 穿門動畫結束

[第二列穿門，連擊觸發]
  0ms    → 🔊 gate_through.mp3 (pitch 1.1)
  0ms    → 加強版穿門動畫（震動 ±6px）
  0ms    → 粒子數 50
  100ms  → 🔊 combo_hit.mp3
  100ms  → 「×2」連擊數字從中央爆出
  200ms  → 畫面邊緣金色 vignette 閃爍
  500ms  → 連擊數字飛到角落計數器
  800ms  → 動畫結束
```

### Easing 曲線

- 連擊數字爆出：`easeOutElastic(1, 0.4)`
- 金色 vignette：`easeOutExpo`（快閃快消）
- 震動衰減：`easeOutQuad`（每次比上次衰減慢一點）

### 音效觸發點

| 時間點 | 音效 | 說明 |
|--------|------|------|
| 0ms | `gate_through.mp3` | pitch 隨連擊數遞增 |
| 100ms | `combo_hit.mp3` | 連擊專屬打擊音 |
| (4+連擊) 0ms | `ultra_combo.mp3` | 超連擊專屬音效 |

### 效能考量

- 連擊 state 用簡單計數器，spin 結束無穿門時歸零
- pitch 調整用 `AudioContext.playbackRate`（不需額外音檔）
- 粒子數上限 100，避免低端裝置卡頓
- 連擊文字動畫結束即 remove，不累積 DOM 節點

### 實作程式碼

```javascript
// web/js/effects/comboSystem.js
import { anime, getPixi } from '../gameFeel.js';
import { playGateThrough } from './gateThrough.js';

let comboCount = 0;
let comboTimer = null;

const COMBO_CONFIG = [
  null, // 0
  { shake: 4, particles: 30, pitch: 1.0 },  // 1
  { shake: 6, particles: 50, pitch: 1.1 },  // 2
  { shake: 8, particles: 80, pitch: 1.2 },  // 3
  { shake: 10, particles: 100, pitch: 1.3 }, // 4+
];

function getConfig(count) {
  return COMBO_CONFIG[Math.min(count, 4)];
}

export function registerThrough(row, mult) {
  comboCount++;
  clearTimeout(comboTimer);

  const config = getConfig(comboCount);

  // 加強版穿門（覆寫震動強度）
  playGateThroughEnhanced(row, mult, config);

  // 連擊 ≥ 2 時顯示連擊數
  if (comboCount >= 2) {
    showComboNumber(comboCount);
    if (comboCount >= 4) flashScreen();
  }

  // 3 秒無新穿門則重置
  comboTimer = setTimeout(() => { comboCount = 0; }, 3000);
}

export function resetCombo() { comboCount = 0; }

function playGateThroughEnhanced(row, mult, config) {
  const board = document.querySelector('.board');
  const shakeAmp = config.shake;

  // 音效 pitch 調整
  const audio = new Audio('assets/sfx/gate_through.mp3');
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const source = ctx.createMediaElementSource(audio);
  source.connect(ctx.destination);
  audio.preservesPitch = false;
  audio.playbackRate = config.pitch;
  audio.play();

  // 加強震動
  anime({
    targets: board,
    translateX: [
      { value: -shakeAmp, duration: 30 },
      { value: shakeAmp, duration: 30 },
      { value: -shakeAmp * 0.7, duration: 30 },
      { value: shakeAmp * 0.7, duration: 30 },
      { value: 0, duration: 40 }
    ],
    easing: 'easeOutQuad'
  });

  // 加強粒子
  getPixi().then(app => {
    const cell = document.getElementById(`cell-${row}-1`);
    const rect = cell.getBoundingClientRect();
    spawnSparksEnhanced(app, rect.left + rect.width / 2, rect.top + rect.height / 2, config.particles);
  });
}

function showComboNumber(count) {
  const comboAudio = new Audio('assets/sfx/combo_hit.mp3');
  comboAudio.play();

  const el = document.createElement('div');
  el.textContent = `×${count} COMBO!`;
  el.style.cssText = 'position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);font-size:42px;font-weight:bold;color:#ffd700;z-index:950;pointer-events:none;text-shadow:0 0 16px #ff6b35,0 2px 4px rgba(0,0,0,0.8)';
  document.body.appendChild(el);

  anime({
    targets: el,
    scale: [0.3, 1.2, 1],
    opacity: [0, 1],
    duration: 400,
    easing: 'easeOutElastic(1, 0.4)'
  });

  setTimeout(() => {
    anime({
      targets: el,
      opacity: 0,
      translateY: -30,
      scale: 0.8,
      duration: 300,
      easing: 'easeInQuad',
      complete: () => el.remove()
    });
  }, 800);
}

function flashScreen() {
  const flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.3);z-index:899;pointer-events:none';
  document.body.appendChild(flash);
  anime({
    targets: flash,
    opacity: [1, 0],
    duration: 200,
    easing: 'easeOutExpo',
    complete: () => flash.remove()
  });
}

function spawnSparksEnhanced(app, cx, cy, count) {
  for (let i = 0; i < count; i++) {
    const g = new (globalThis.PIXI?.Graphics)();
    g.beginFill([0xffd700, 0xff6b35, 0xff4444][i % 3]);
    g.drawCircle(0, 0, 2 + Math.random() * 4);
    g.endFill();
    g.position.set(cx, cy);
    app.stage.addChild(g);

    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 100;
    anime({
      targets: g.position,
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      duration: 300 + Math.random() * 300,
      easing: 'linear'
    });
    anime({
      targets: g, alpha: 0,
      duration: 500, easing: 'easeOutQuad',
      complete: () => { app.stage.removeChild(g); g.destroy(); }
    });
  }
}
```

---

## 效能預算

### 目標

| 指標 | 目標值 | 說明 |
|------|--------|------|
| FPS | ≥ 55fps | 動畫期間不掉幀 |
| 首次載入增量 | < 100KB | Anime.js (17KB) + 初始 CSS |
| Lazy load 總量 | < 300KB | PixiJS + Lottie（首次觸發時載入） |
| DOM 節點峰值 | < 20 個臨時節點 | 動畫結束即清除 |
| 粒子峰值 | ≤ 100 個 | Object pool 回收 |
| 音效預載 | 所有 SFX < 500KB | 短音效 ≤ 50KB each |

### 分層載入策略

```
初始載入（必要）：
  ├── anime.es.js (17KB gz)
  └── gameFeel.js (< 2KB)

首次穿門時（lazy）：
  └── PixiJS (150KB gz) → canvas overlay 初始化

首次 Free Game 時（lazy）：
  └── Lottie-web light (50KB gz) + golden_dragon.json (~80KB)
```

### 低端裝置降級

```javascript
// web/js/effects/perfDetect.js
const isLowEnd = navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2;

export const QUALITY = isLowEnd ? 'low' : 'high';

export const PARTICLE_MULT = isLowEnd ? 0.3 : 1.0;  // 粒子數乘數
export const SHAKE_ENABLED = !isLowEnd;               // 低端關閉 shake
export const PIXI_ENABLED = !isLowEnd;                // 低端用純 CSS 替代
```

---

## 音效資源清單

| 檔案名稱 | 用途 | 時長 | 頻率特徵 |
|----------|------|------|----------|
| `spin_charge.mp3` | Spin 蓄力（loop） | 2s loop | 低頻嗡鳴，漸強 |
| `spin_release.mp3` | Spin 釋放 | 0.3s | 短促爆發，中高頻 |
| `gate_through.mp3` | 穿門成功 | 0.5s | 金屬穿透 + 火花 |
| `score_fly.mp3` | 數字飛出 | 0.3s | Whoosh 音 |
| `wall_hit.mp3` | 碰壁撞擊 | 0.4s | 低頻撞擊（80-150Hz） |
| `crack.mp3` | 裂痕 | 0.3s | 碎裂細節音 |
| `heartbeat.mp3` | 心跳（loop） | 1s loop | BPM 120 心跳 |
| `dragon_growl.mp3` | 龍吟 | 1.5s | 低沉龍吟 |
| `dragon_roar.mp3` | 龍吼（FG 觸發） | 2s | 震撼龍吼 |
| `gate_open.mp3` | 龍門開啟 | 1s | 石門厚重聲 |
| `dragon_fly.mp3` | 龍飛過 | 1s | 風聲 + 翅膀 |
| `crowd_cheer.mp3` | 歡呼 | 2s | 人群歡呼 |
| `drum_roll.mp3` | JP 鼓聲 | 3s | 漸強鼓聲 |
| `drum_hit.mp3` | 鼓聲重擊 | 0.3s | 單次重擊 |
| `tier_reveal.mp3` | Tier 揭曉 | 0.5s | 揭曉 fanfare |
| `coin_count.mp3` | 硬幣計數（loop） | 0.5s loop | 硬幣碰撞 |
| `jp_win.mp3` | JP 勝利 | 2s | 勝利 fanfare |
| `combo_hit.mp3` | 連擊打擊 | 0.3s | 打擊加強音 |
| `ultra_combo.mp3` | 超連擊 | 1s | 史詩打擊音 |

### Lottie 動畫資源

| 檔案名稱 | 用途 | 預估大小 |
|----------|------|----------|
| `golden_dragon.json` | Free Game 金龍飛出 | ~80KB |

---

## 整合進 uiController.js 的方式

```javascript
// 在 uiController.js 的 showResult() 中加入特效呼叫

import { playGateThrough } from './effects/gateThrough.js';
import { playWallHit } from './effects/wallHit.js';
import { playScatterNearMiss } from './effects/scatterNearMiss.js';
import { playFreeGameTrigger } from './effects/freeGameTrigger.js';
import { playJpReveal } from './effects/jpReveal.js';
import { registerThrough, resetCombo } from './effects/comboSystem.js';

// 在 showResult 的 judgments 迴圈中：
result.judgments.forEach(j => {
  if (j.type === 'through') {
    registerThrough(j.row, j.mult);  // 連擊系統 + 穿門特效
  } else if (j.type === 'wall') {
    playWallHit(j.row);
  }
});

// Scatter 差一顆
if (result.scatterCount === 2) {
  playScatterNearMiss(result.board);
}

// Free Game 觸發
if (result.fgTriggered) {
  await playFreeGameTrigger();  // 等待動畫完成再進入 FG 模式
}

// JP 命中（FG 結束時）
if (result.fgDone && result.jpResult && result.jpResult.payout > 0) {
  await playJpReveal(result.jpResult.tier, result.jpResult.payout);
}

// 無穿門時重置連擊
if (!result.judgments.some(j => j.type === 'through')) {
  resetCombo();
}
```

---

## 檔案結構規劃

```
web/
├── js/
│   ├── gameFeel.js          ← 特效主模組（anime, pixi, lottie 載入）
│   ├── effects/
│   │   ├── spinButton.js    ← Scenario 1
│   │   ├── gateThrough.js   ← Scenario 2
│   │   ├── wallHit.js       ← Scenario 3
│   │   ├── scatterNearMiss.js ← Scenario 4
│   │   ├── freeGameTrigger.js ← Scenario 5
│   │   ├── jpReveal.js      ← Scenario 6
│   │   ├── comboSystem.js   ← Scenario 7
│   │   └── perfDetect.js    ← 效能偵測 & 降級
│   └── (existing files...)
├── assets/
│   ├── sfx/                 ← 所有音效檔
│   └── lottie/              ← Lottie JSON 動畫
└── css/
    └── effects.css          ← 特效相關 CSS（裂痕、vignette 等）
```
