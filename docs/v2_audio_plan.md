# V2 音效規劃 — 射龍門 Slot

> 更新日期：2026-05-20
> 風格方向：中國風 × 現代電子，配合 Modern Guochao 視覺

## 音效總覽

| 編號 | 場景 | 檔名 | 類型 | 時長 | 優先級 |
|------|------|------|------|------|--------|
| SFX-01 | Spin 按鈕按下 | `spin_press.wav` | 單次 | 0.2s | 高 |
| SFX-02 | 轉軸轉動中 | `reel_spin_loop.wav` | 循環 | 1.0s loop | 高 |
| SFX-03 | 停軸 | `reel_stop.wav` | 單次 | 0.3s | 高 |
| SFX-04 | 穿門成功 | `gate_pass.wav` | 單次 | 1.0s | 高 |
| SFX-05 | 碰壁 | `wall_hit.wav` | 單次 | 0.5s | 高 |
| SFX-06 | Scatter 出現 | `scatter_appear.wav` | 單次 | 0.8s | 高 |
| SFX-07 | Free Game 觸發 | `free_game_trigger.wav` | 單次 | 2.0s | 高 |
| SFX-08 | JP 命中 | `jackpot_hit.wav` | 單次 | 3.0s | 高 |
| SFX-09 | 同值命中（扣款） | `penalty_hit.wav` | 單次 | 1.0s | 中 |
| SFX-10 | 按鈕 hover | `btn_hover.wav` | 單次 | 0.1s | 低 |
| BGM-01 | 主遊戲背景音樂 | `bgm_main.ogg` | 循環 | 60-90s loop | 高 |
| BGM-02 | Free Game 背景音樂 | `bgm_free_game.ogg` | 循環 | 45-60s loop | 中 |

## 音效設計方向

### SFX-01：Spin 按鈕按下
- **描述**：清脆的機械按壓感 + 輕微金屬迴響
- **參考**：古代銅鈴聲 + 現代 UI click
- **工具**：jsfxr（coin/pickup 類型調整）
- **參數建議**：短 attack、中 frequency、輕 reverb

### SFX-02：轉軸轉動中
- **描述**：快速滾動的嗡嗡聲，帶有輕微風聲
- **參考**：竹簡翻動 + 機械轉盤
- **工具**：jsfxr（noise sweep）或 Kenney Audio
- **參數建議**：低頻 noise sweep、可 loop、漸進加速感

### SFX-03：停軸
- **描述**：沉穩的「咔」聲，每軸停止時觸發
- **參考**：木頭卡榫到位聲
- **工具**：jsfxr（hit 類型）
- **參數建議**：短 decay、中低頻、有重量感

### SFX-04：穿門成功
- **描述**：華麗的通過音效 — 金屬門開啟 + 風聲 + 銅鑼餘韻
- **參考**：中國風銅鑼 + 勝利 fanfare
- **工具**：Kenney Audio（impact）+ jsfxr 合成
- **參數建議**：多層疊加 — 低頻衝擊 + 高頻閃光 + 餘韻

### SFX-05：碰壁
- **描述**：撞擊石牆的沉悶聲 + 碎裂感
- **參考**：石頭碰撞 + 輕微裂痕
- **工具**：jsfxr（explosion 類型調低）
- **參數建議**：低頻為主、短 sustain、帶 distortion

### SFX-06：Scatter 出現
- **描述**：神秘龍吟 — 低沉的龍嘯 + 金屬共鳴
- **參考**：中國龍吟 + 神秘鐘聲
- **工具**：Kenney Audio + 後製 pitch shift
- **參數建議**：中低頻、長 reverb、漸強

### SFX-07：Free Game 觸發
- **描述**：史詩級開場 — 龍門大開 + 龍吟 + 鼓聲 + 金光音效
- **參考**：電影預告片 impact + 中國大鼓
- **工具**：多層合成（jsfxr + Kenney + Audacity 混音）
- **參數建議**：2 秒漸強、多層疊加、最後一擊最重

### SFX-08：JP 命中
- **描述**：最高級慶祝音效 — 連續銅鑼 + 煙火 + 金幣雨
- **參考**：老虎機大獎音效 + 中國節慶鞭炮
- **工具**：多層合成
- **參數建議**：3 秒、分段高潮（衝擊→展開→慶祝）

### SFX-09：同值命中（扣款）
- **描述**：不祥的低沉音效 — 沉重鐘聲 + 下行音階
- **參考**：失敗/懲罰音效
- **工具**：jsfxr（powerup 反轉）
- **參數建議**：下行 frequency sweep、帶壓迫感

### BGM-01：主遊戲背景音樂
- **描述**：中國風電子融合 — 古箏/琵琶旋律 + 電子節拍
- **風格**：Chill + 神秘感，不搶注意力
- **BPM**：90-110
- **樂器**：古箏、琵琶、電子 pad、輕鼓點
- **來源建議**：Kenney Audio / OpenGameArt / AI 生成（Suno）

### BGM-02：Free Game 背景音樂
- **描述**：緊張刺激版 — 加速節奏 + 更多打擊樂
- **風格**：Epic + 緊迫感
- **BPM**：120-140
- **樂器**：中國大鼓、嗩吶、電子 bass、快節奏打擊
- **來源建議**：同上

## 技術規格

| 項目 | 規格 |
|------|------|
| 格式（SFX） | WAV 44.1kHz 16bit mono |
| 格式（BGM） | OGG Vorbis 44.1kHz stereo, 128kbps |
| 音量標準 | SFX: -6dB peak / BGM: -12dB RMS |
| 命名規則 | `{類型}-{編號}_{描述}.{ext}` |
| 存放路徑 | `art/assets/audio/` |

## 製作工具

| 工具 | 用途 | 取得方式 |
|------|------|---------|
| jsfxr | 快速生成 placeholder SFX | https://sfxr.me/ |
| Kenney Audio | 免費音效素材包 | https://kenney.nl/assets?q=audio |
| Audacity | 音效編輯/混音 | 免費開源 |
| Suno AI | BGM 生成（備選） | https://suno.ai |
| OpenGameArt | 免費遊戲音效 | https://opengameart.org |

## 實作優先順序

1. **Phase 1（必要）**：SFX-01~08 + BGM-01 — 基本遊戲體驗
2. **Phase 2（加分）**：SFX-09~10 + BGM-02 — 完整體驗
3. **Phase 3（打磨）**：音量平衡、fade in/out、動態混音

## 備註

- 所有音效先用 jsfxr 產生 placeholder，確認時機和感覺後再替換正式版
- BGM 可先用 Kenney 的免費音樂，後期再換 AI 生成或授權音樂
- Unity AudioMixer 設定：Master → SFX Bus + BGM Bus，方便獨立調整音量
