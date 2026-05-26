#!/usr/bin/env python3
"""Generate 13 card symbol images by overlaying text on template backgrounds."""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATES_DIR = os.path.join(BASE_DIR, "assets", "templates")
OUTPUT_DIR = os.path.join(BASE_DIR, "assets")

FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"

CARDS = [
    ("CD-01_ace.png", "A", "mid"),
    ("CD-02_king.png", "K", "mid"),
    ("CD-03_queen.png", "Q", "mid"),
    ("CD-04_jack.png", "J", "mid"),
    ("CD-05_num2.png", "2", "mid"),
    ("CD-06_num3.png", "3", "mid"),
    ("CD-07_num4.png", "4", "mid"),
    ("CD-08_num5.png", "5", "mid"),
    ("CD-09_num6.png", "6", "mid"),
    ("CD-10_num7.png", "7", "mid"),
    ("CD-11_num8.png", "8", "mid"),
    ("CD-12_num9.png", "9", "mid"),
    ("CD-13_num10.png", "10", "mid"),
]

GOLD_TOP = (255, 215, 0)
GOLD_BOTTOM = (184, 134, 11)
OUTLINE_COLOR = (26, 16, 0)
SHADOW_COLOR = (0, 0, 0, 128)
HIGHLIGHT_COLOR = (255, 248, 200, 180)


def make_gradient_text(label, font, x, y, text_h):
    """Create text layer with vertical gold gradient."""
    tmp = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    draw = ImageDraw.Draw(tmp)
    draw.text((x, y), label, font=font, fill=GOLD_TOP)
    for row in range(max(0, y), min(256, y + text_h)):
        t = (row - y) / max(text_h, 1)
        r = int(GOLD_TOP[0] * (1 - t) + GOLD_BOTTOM[0] * t)
        g = int(GOLD_TOP[1] * (1 - t) + GOLD_BOTTOM[1] * t)
        b = int(GOLD_TOP[2] * (1 - t) + GOLD_BOTTOM[2] * t)
        for col in range(256):
            px = tmp.getpixel((col, row))
            if px[3] > 0:
                tmp.putpixel((col, row), (r, g, b, px[3]))
    return tmp


def generate_card(filename, label, template_type):
    """Generate a single card image."""
    template = Image.open(
        os.path.join(TEMPLATES_DIR, f"template_{template_type}.png")
    ).convert("RGBA")

    # Size font to ~58% of image height
    target_h = int(256 * 0.58)
    font = ImageFont.truetype(FONT_PATH, 160)
    bbox = font.getbbox(label)
    font_size = int(160 * target_h / (bbox[3] - bbox[1]))
    font = ImageFont.truetype(FONT_PATH, font_size)
    bbox = font.getbbox(label)
    text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (256 - text_w) // 2 - bbox[0]
    y = (256 - text_h) // 2 - bbox[1]

    # Shadow
    shadow = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).text((x + 2, y + 2), label, font=font, fill=SHADOW_COLOR)
    shadow = shadow.filter(ImageFilter.GaussianBlur(1))

    # Outline
    outline = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    ImageDraw.Draw(outline).text(
        (x, y), label, font=font, fill=OUTLINE_COLOR,
        stroke_width=3, stroke_fill=OUTLINE_COLOR
    )

    # Gradient text
    grad_text = make_gradient_text(label, font, x, y, text_h)

    # Highlight (top 2px of text only)
    highlight = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    ImageDraw.Draw(highlight).text((x, y), label, font=font, fill=HIGHLIGHT_COLOR)
    for row in range(256):
        if row < y or row > y + 2:
            for col in range(256):
                if highlight.getpixel((col, row))[3] > 0:
                    highlight.putpixel((col, row), (0, 0, 0, 0))

    # Composite
    result = template.copy()
    for layer in [shadow, outline, grad_text, highlight]:
        result = Image.alpha_composite(result, layer)

    result.convert("RGB").save(os.path.join(OUTPUT_DIR, filename), "PNG")
    print(f"  ✅ {filename} ({label})")


if __name__ == "__main__":
    print("Generating 13 card symbols...")
    for filename, label, ttype in CARDS:
        generate_card(filename, label, ttype)
    print("\nDone! All 13 cards generated.")
