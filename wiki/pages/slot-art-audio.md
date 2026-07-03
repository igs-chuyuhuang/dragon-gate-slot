# 美術音效

## GPT 產圖 Prompt 寫法

### 牌面素材
```
A playing card face for a Chinese dragon gate slot game.
Style: modern Chinese luxury (dark purple-blue base, gold foil accents).
Card: [ACE/KING/QUEEN/JACK/2-10]
- Full card with rounded corners
- Transparent background (PNG)
- Size: 200x280px
- Rich detail, ornamental border
```

### 背景
```
Game background for a Chinese dragon gate slot machine.
Style: deep purple-blue night scene with cherry blossoms, lanterns, and a traditional gate (龍門).
- 16:9 aspect ratio
- Dark atmospheric, suitable for overlay UI elements
- No text
```

### UI 元素
```
[ELEMENT NAME] icon for a luxury Chinese slot game.
Style: gold foil on dark background, ornamental.
- PNG with transparency
- Size: [specified]px
- Clean edges, high contrast
```

## PIL 後處理

```python
from PIL import Image

# Resize to standard dimensions
def standardize(img_path, target_w, target_h):
    img = Image.open(img_path).convert('RGBA')
    img = img.resize((target_w, target_h), Image.LANCZOS)
    img.save(img_path, optimize=True)

# Batch process all cards
CARD_SIZE = (200, 280)
for f in glob('CD-*.png'):
    standardize(f, *CARD_SIZE)

# Compress PNG
def compress_png(path, quality=80):
    img = Image.open(path)
    img.save(path, optimize=True, quality=quality)

# Add text overlay (for numbered cards)
from PIL import ImageDraw, ImageFont
def add_number(img_path, number, font_size=48):
    img = Image.open(img_path).convert('RGBA')
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype('arial.ttf', font_size)
    draw.text((10, 10), str(number), fill=(255,215,0), font=font)
    img.save(img_path)
```

## 音效合成（Python NumPy）

```python
import numpy as np
from scipy.io import wavfile

SR = 44100

def gen_tone(freq, duration, volume=0.5):
    t = np.linspace(0, duration, int(SR*duration), False)
    wave = volume * np.sin(2*np.pi*freq*t)
    # Fade in/out
    fade = int(SR*0.01)
    wave[:fade] *= np.linspace(0,1,fade)
    wave[-fade:] *= np.linspace(1,0,fade)
    return wave

def coin_sfx():
    """Coin collect sound: quick ascending tones"""
    tones = [gen_tone(f, 0.05) for f in [800,1000,1200,1500]]
    return np.concatenate(tones)

def save_wav(filename, data):
    wavfile.write(filename, SR, (data*32767).astype(np.int16))
```

## 素材規格

| 類型 | 尺寸 | 格式 | 命名規則 |
|------|------|------|----------|
| 撲克牌面 | 200×280 | PNG (透明) | CD-01_ace ~ CD-13_num10 |
| Scatter 龍珠 | 200×200 | PNG (透明) | SC-01_scatter_dragon |
| JP 符號 | 200×200 | PNG (透明) | GRAND/MAJOR/MINI.png |
| 背景 | 390×844 | JPG | BG.png / BG-bonus.png |
| 框架 | 390×844 | PNG (透明) | FR-01_slot_frame_mobile |
| 吉祥物 | 300×400 | PNG (透明) | MS-01_mascot_dragon |
| 音效 | — | MP3 | [name].mp3 (小寫底線) |
| BGM | — | MP3 (loop) | bgm.mp3 |

## BGM 來源

- Pixabay 免費音樂庫（CC0 或 Pixabay License）
- 搜尋關鍵字：chinese, oriental, slot, casino, lounge
- 選擇可循環播放（loop-friendly）的曲目
- 音量建議：0.15-0.2（不搶 SFX）
