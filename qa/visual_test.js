const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const GAME_URL = 'https://igs-chuyuhuang.github.io/dragon-gate-slot/web/';
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');

async function run() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  // Error monitoring
  page.on('console', msg => { if (msg.type() === 'error') console.log('[PAGE ERROR]', msg.text()); });
  page.on('pageerror', err => console.log('[PAGE CRASH]', err.message));

  await page.goto(GAME_URL);
  await page.waitForTimeout(5000); // 等 CDN 載入

  // 初始畫面
  await page.screenshot({ path: `${SCREENSHOT_DIR}/00_initial.png` });

  // 測試各特效
  const tests = [
    { key: 'Space', wait: 3000, name: '01_spin' },
    { key: 't', wait: 1500, name: '02_gate_through' },
    { key: 'w', wait: 1500, name: '03_wall_hit' },
    { key: 'c', wait: 3000, name: '04_combo' },
    { key: 'b', wait: 3000, name: '05_big_win' },
    { key: 's', wait: 3000, name: '06_scatter' },
    { key: '1', wait: 8000, name: '07_jp_basic' },
    { key: '5', wait: 8000, name: '08_jp_grand_perfect' },
  ];

  for (const test of tests) {
    await page.waitForTimeout(1000);
    await page.keyboard.press(test.key);
    await page.waitForTimeout(test.wait / 3);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${test.name}_mid.png` });
    await page.waitForTimeout(test.wait * 2 / 3);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${test.name}_end.png` });
  }

  // 桌面版
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(GAME_URL);
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/09_desktop_initial.png` });
  await page.keyboard.press('t');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/10_desktop_gate_through.png` });

  await browser.close();
  console.log(`✅ Screenshots saved to ${SCREENSHOT_DIR}`);
}

run().catch(console.error);
