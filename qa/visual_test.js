const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const GAME_URL = 'https://igs-chuyuhuang.github.io/dragon-gate-slot/web/';
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots');

async function captureEffect(page, key, name) {
  await page.keyboard.press(key);
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}_${i}.png` });
  }
}

async function run() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  page.on('console', msg => { if (msg.type() === 'error') console.log('[PAGE ERROR]', msg.text()); });
  page.on('pageerror', err => console.log('[PAGE CRASH]', err.message));

  await page.goto(GAME_URL);
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/00_initial.png` });

  // Spin first to initialize game state
  await page.keyboard.press('Space');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/01_after_spin.png` });

  // Test debug hotkeys with burst capture
  const tests = ['t', 'w', 'c', 'b', 's', '1', '5'];
  const names = ['02_gate_through', '03_wall_hit', '04_combo', '05_big_win', '06_scatter', '07_jp_basic', '08_jp_grand_perfect'];

  for (let i = 0; i < tests.length; i++) {
    await page.waitForTimeout(1000);
    await captureEffect(page, tests[i], names[i]);
  }

  // Desktop
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(GAME_URL);
  await page.waitForTimeout(5000);
  await page.keyboard.press('Space');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/09_desktop_after_spin.png` });
  await captureEffect(page, 't', '10_desktop_gate_through');

  await browser.close();
  console.log(`✅ Screenshots saved to ${SCREENSHOT_DIR}`);
}

run().catch(console.error);
