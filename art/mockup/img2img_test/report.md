# Pollinations img2img 能力測試報告

> 測試日期：2026-05-27
> 測試者：美術音效-t84

---

## 1. API 能力確認

### 測試結果摘要

| 方式 | Model | 免費可用 | img2img 支援 | 結果 |
|------|-------|----------|-------------|------|
| GET `/image/{prompt}?model=kontext&image=URL` | kontext (FLUX.1 Kontext) | ❌ 需 API key | ✅ | 返回 403：需付費帳號 |
| GET `/image/{prompt}?model=flux&image=URL` | flux (Flux Schnell) | ✅ 免費 | ✅ | **成功** |
| GET `/image/{prompt}?model=klein&image=URL` | klein (FLUX.2 Klein 4B) | ✅ 免費 | ✅ | **成功** |
| POST `/v1/images/edits` (JSON body) | flux | ✅ 免費 | ✅ | **成功**（768×768） |

### 結論
- **`flux` model + `image` query param** 是最佳免費方案
- 支援任意公開 URL 作為 reference image
- 輸出解析度受限（max ~1024px 長邊），但可後續 upscale
- `kontext` 模型品質可能更好但需付費

---

## 2. 五個測試項目

### Test A — Reference（橫式）→ 16:9 slot mockup

| 項目 | 內容 |
|------|------|
| Endpoint | `GET https://image.pollinations.ai/prompt/{prompt}` |
| Model | flux |
| Image param | `https://raw.githubusercontent.com/.../e24de4de-...png` |
| Prompt | Chinese Dragon Gate slot machine game complete UI screenshot, 3x3 grid with jade green stone cells and gold borders, dragon gate pagoda frame, lotus pond background, red bottom bar with SPIN button, cute baby dragon mascot, same style as reference |
| Size | width=1920&height=1080 (實際輸出 1024×576) |
| Seed | 200 |
| 輸出 | `A_landscape_mockup.png` (1024×576, 122KB) |
| 結果 | ✅ 成功 — 有中式風格、金色元素、slot 盤面感 |

### Test B — Reference（直式）→ 9:16 slot mockup

| 項目 | 內容 |
|------|------|
| Endpoint | `GET https://image.pollinations.ai/prompt/{prompt}` |
| Model | flux |
| Image param | `https://raw.githubusercontent.com/.../2404f82d-...png` |
| Prompt | Chinese Dragon Gate slot machine game complete UI screenshot mobile portrait, 3x3 grid with jade green stone cells and gold borders, dragon gate pagoda frame, lotus pond background, red bottom bar with SPIN button, cute baby dragon mascot, same style as reference |
| Size | width=1080&height=1920 (實際輸出 576×1024) |
| Seed | 200 |
| 輸出 | `B_portrait_mockup.png` (576×1024, 115KB) |
| 結果 | ✅ 成功 — 直式構圖、有龍門元素 |

### Test C — Reference → Symbol A（翡翠玉石底+金色浮雕）

| 項目 | 內容 |
|------|------|
| Endpoint | `GET https://image.pollinations.ai/prompt/{prompt}` |
| Model | flux |
| Image param | 直式 reference |
| Prompt | Single slot machine symbol letter A, jade green stone background with cloud pattern, gold embossed raised letter A, ornate gold Chinese border frame, jade beads in corners, same style as reference game |
| Size | 512×512 |
| Seed | 300 |
| 輸出 | `C_symbol_A.png` (512×512, 85KB) |
| 結果 | ✅ 成功 — 翡翠底+金色文字風格 |

### Test D — Reference → Scatter 龍

| 項目 | 內容 |
|------|------|
| Endpoint | `GET https://image.pollinations.ai/prompt/{prompt}` |
| Model | flux |
| Image param | 直式 reference |
| Prompt | Scatter symbol golden Chinese dragon in circular red background, gold ornate circular border, coiled dragon with detailed scales and auspicious clouds, SCATTER text label at bottom, same style as reference game |
| Size | 512×512 |
| Seed | 400 |
| 輸出 | `D_scatter_dragon.png` (512×512, 76KB) |
| 結果 | ✅ 成功 — 金龍圓形設計 |

### Test E — Reference → SPIN button

| 項目 | 內容 |
|------|------|
| Endpoint | `GET https://image.pollinations.ai/prompt/{prompt}` |
| Model | flux |
| Image param | 直式 reference |
| Prompt | Large circular SPIN button for slot machine, red jade agate center, ornate gold rim with Chinese dragon pattern, glossy reflective surface, gold SPIN text, same style as reference game |
| Size | 512×512 |
| Seed | 500 |
| 輸出 | `E_spin_button.png` (512×512, 72KB) |
| 結果 | ✅ 成功 — 紅色圓形+金色邊框 |

---

## 3. 品質評估

| 測試 | 風格一致性 | 構圖正確性 | 細節品質 | 可用性 |
|------|-----------|-----------|---------|--------|
| A (16:9 mockup) | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | 作為風格參考可用，非精確 UI |
| B (9:16 mockup) | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | 同上 |
| C (Symbol A) | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 可作為 symbol 底板素材 |
| D (Scatter) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 品質好，可直接使用 |
| E (SPIN btn) | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 可作為按鈕素材基礎 |

### 觀察
- **優點：** 有 reference image 後，生成結果的色彩和風格明顯更貼近目標
- **限制：**
  - 解析度受限（免費版 max 1024px 長邊）
  - 無法精確控制 UI layout（AI 仍會自由發揮）
  - 文字渲染不可靠（仍需 PIL 疊字）
  - flux 的 img2img 是「風格參考」而非「精確編輯」

---

## 4. 替代方案評估

| 方案 | 免費 | img2img 品質 | 適用場景 |
|------|------|-------------|---------|
| Pollinations flux + image | ✅ | ⭐⭐⭐ | 風格參考生成素材元素 |
| Pollinations kontext (付費) | ❌ | ⭐⭐⭐⭐⭐ | 精確 in-context editing |
| Cloudflare Workers AI (SD 1.5 img2img) | ✅ | ⭐⭐ | 低品質，不推薦 |
| Hugging Face FLUX Kontext | ❌ (需 Pro) | ⭐⭐⭐⭐⭐ | 最佳品質 img2img |
| Fal.ai / Replicate | ❌ (按量付費) | ⭐⭐⭐⭐ | 高品質，成本可控 |
| 自架 ComfyUI + IP-Adapter | ✅ (需 GPU) | ⭐⭐⭐⭐⭐ | 完全控制，需硬體 |

### 建議策略
1. **目前可用：** Pollinations `flux` + `image` param（免費）— 用於生成獨立素材元素
2. **升級選項：** 申請 Pollinations API key 使用 `kontext` model — 精確風格遷移
3. **最佳方案：** 結合 img2img 生成素材 + PIL 精確合成 layout（目前 v2 mockup 的方式）
4. **文字/UI：** 永遠用 PIL 程式渲染，不依賴 AI

---

## 5. 檔案清單

```
art/mockup/img2img_test/
├── A_landscape_mockup.png    (1024×576, Test A)
├── B_portrait_mockup.png     (576×1024, Test B)
├── C_symbol_A.png            (512×512, Test C)
├── D_scatter_dragon.png      (512×512, Test D)
├── E_spin_button.png         (512×512, Test E)
├── test_flux_img.png         (1024×576, 初步測試)
├── test_klein.png            (1024×576, klein model 測試)
├── test_edits_endpoint.png   (768×768, /v1/images/edits 測試)
└── report.md                 (本報告)
```
