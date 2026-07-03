# 特效系統

## 設計原則

- 不使用圖片素材，全 CSS + JS DOM 操作
- 每個特效是獨立 Promise，可 await 控制播放順序
- 特效元素用完即 remove，防止記憶體洩漏

## CSS 粒子系統

### Burst（爆炸散射）
```css
@keyframes particleBurst {
  from { transform: translate(0,0) scale(1); opacity: 1; }
  to { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
}
```
```js
function burst(x, y, count=20, color='#ffd700') {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 100;
    p.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:6px;height:6px;
      border-radius:50%;background:${color};
      --dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px;
      animation:particleBurst 0.6s ease-out forwards;`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }
}
```

### Shockwave（衝擊波）
```js
function shockwave(x, y) {
  const w = document.createElement('div');
  w.style.cssText = `position:fixed;left:${x-40}px;top:${y-40}px;width:80px;height:80px;
    border-radius:50%;border:3px solid rgba(255,215,0,0.8);
    transform:scale(0);transition:transform 0.4s ease-out,opacity 0.4s;`;
  document.body.appendChild(w);
  requestAnimationFrame(() => { w.style.transform='scale(4)'; w.style.opacity='0'; });
  setTimeout(() => w.remove(), 500);
}
```

## Camera Feel

### hitStop（命中暫停）
```js
async function hitStop(ms=80) {
  document.querySelector('.game-root').style.animationPlayState = 'paused';
  await new Promise(r => setTimeout(r, ms));
  document.querySelector('.game-root').style.animationPlayState = '';
}
```

### shakeBoard（震動）
```js
function shakeBoard(intensity=10, duration=200) {
  const root = document.querySelector('.game-root');
  const interval = setInterval(() => {
    root.style.transform = `translate(${(Math.random()-0.5)*intensity}px,${(Math.random()-0.5)*intensity}px)`;
  }, 16);
  setTimeout(() => { clearInterval(interval); root.style.transform=''; }, duration);
}
```

### flashScreen（閃光）
```js
function flashScreen(color='rgba(255,215,0,0.3)', duration=100) {
  const f = document.createElement('div');
  f.style.cssText = `position:fixed;inset:0;background:${color};z-index:9000;pointer-events:none;
    transition:opacity ${duration}ms;`;
  document.body.appendChild(f);
  setTimeout(() => { f.style.opacity='0'; setTimeout(()=>f.remove(), duration); }, 30);
}
```

### dimBackground（壓暗非焦點）
```js
function dimBackground(selector) {
  document.querySelector('.game-root').classList.add('win-dimmed');
  document.querySelectorAll(selector).forEach(el => el.classList.add('win-active'));
}
```

## 連擊系統

```js
let comboCount = 0;
function onWin(row) {
  comboCount++;
  const effects = [burst, shockwave, () => shakeBoard(comboCount*3)];
  if (comboCount >= 3) flashScreen();
  effects.forEach(fn => fn());
}
function resetCombo() { comboCount = 0; }
```

## BIG WIN 三級動畫

| 級別 | 條件 | 視覺 |
|------|------|------|
| BIG WIN | ratio ≥ 5 | 金幣雨 + 文字彈出 |
| MEGA WIN | ratio ≥ 15 | 銀色爆炸 + 更多粒子 |
| SUPER MEGA WIN | ratio ≥ 30 | 金色全屏 + 龍飛出 + 持續金幣 |

共通：全屏 overlay + 數字倒計時動畫 + 3 秒自動收集按鈕

## JP 演出流程

1. **觸發**：全窄門判定 → 紅金閃爍 `jpFlashRedGold`
2. **符號注入**：`onSidesStop` 回呼中注入 JP 圖標到中輪滾動 cells
3. **停輪顯示**：final cells 顯示各自 tier 圖標
4. **判定**：三同 = 中獎，非三同 = 1.2 秒後移除
5. **中獎飛移**：JP 圖標 transition 飛到 badge 區域
6. **獎金演出**：showBigWin('JACKPOT!\n' + tier)

## winLine 掃線動畫

```js
export function playWinLine(row, badgeEl) {
  return new Promise(resolve => {
    const cells = [0,1,2].map(c => document.getElementById(`cell-${row}-${c}`));
    // 1. Dim 非贏列
    board.classList.add('win-dimmed');
    cells.forEach(c => c.classList.add('win-active'));
    // 2. Gold sweep（逐格延遲）
    cells.forEach((cell, i) => {
      setTimeout(() => {
        const sweep = document.createElement('div');
        sweep.className = 'win-sweep';
        cell.appendChild(sweep);
        setTimeout(() => sweep.remove(), 550);
      }, i * 80);
    });
    // 3. Glow + pulse
    setTimeout(() => cells.forEach(c => c.classList.add('win-glow','win-pulse')), 200);
    // 4. Particles
    setTimeout(() => cells.forEach(cell => { /* burst particles */ }), 250);
    // 5. Badge pop
    if (badgeEl) setTimeout(() => badgeEl.classList.add('win-pop'), 350);
    // Cleanup
    setTimeout(() => { /* remove classes */ resolve(); }, 800);
  });
}
```
