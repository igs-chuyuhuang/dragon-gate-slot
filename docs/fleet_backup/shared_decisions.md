# Fleet Shared Decisions

## 1. 文件只記錄在 GitHub，不使用 Outline
所有專案文件（企劃規格、前端規格、dev log 等）只記錄在 GitHub repo 的 docs/ 目錄下，不再使用 Outline。

## 2. Dev Log 每 24 小時更新一次
所有 dragon-gate-slot 專案的 agent 必須每 24 小時將當天的工作內容更新到 docs/dev_log/ 下各自的 .md 檔案中。

## 3. 各職能可用工具清單
### Web 遊戲與特效
| 工具 | 用途 |
|------|------|
| PixiJS | 2D 高效能渲染、粒子、光效 |
| Phaser | HTML5 遊戲框架 |
| Anime.js | JS 動畫庫 |
| Lottie-web | AE 匯出動畫 JSON |

### 美術素材
| 工具 | 用途 |
|------|------|
| ComfyUI | 本地 Stable Diffusion |
| Kenney | 免費遊戲素材 |
| OpenGameArt | 開源遊戲素材庫 |
| Pollinations.ai | AI 生圖 |

### 音效
| 工具 | 用途 |
|------|------|
| Audacity | 音訊編輯 |
| jsfxr / sfxr | 快速產生音效 |
| Kenney Audio | 免費音效 |

## 4. 對齊之前版本邏輯（碰壁賠雙、先扣3×bet）
1. 下注方式：每次 Spin 先扣 3×currentBet
2. 碰壁 = -2×betPerRow
3. 同值命中 = -3×betPerRow
4. 穿門 = +betPerRow × mult
5. 未穿/SC = 0
6. 餘額保護 = balance >= 3×currentBet
7. gap = hi - lo - 1，極窄門 gap=1→6×, gap 2~3→4×, gap 4~7→2×, gap 8~11→1×
8. Scatter 跳過判定，只計數觸發 Free Game
9. JP 貢獻：每轉 3×currentBet 的 5% 到三層 JP 池

## 5. 遊戲呈現改為 Web 版（純 JS）
從 Unity 改為 Web 版（純 HTML + CSS + vanilla JS）。
