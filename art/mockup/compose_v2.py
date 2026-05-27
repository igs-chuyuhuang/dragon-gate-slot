#!/usr/bin/env python3
"""Compose mockup v2 - mobile (1080x1920) and desktop (1920x1080)."""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

BASE = os.path.dirname(os.path.abspath(__file__))
ELEMENTS = os.path.join(BASE, "elements")
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
FONT_SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# Colors
JADE_GREEN = (45, 139, 94)
DARK_RED = (74, 0, 0)
CHINA_RED = (180, 30, 30)
GOLD = (212, 160, 23)
GOLD_LIGHT = (255, 215, 0)
GOLD_DARK = (184, 134, 11)
DARK_GREEN = (20, 60, 40)
PANEL_GREEN = (25, 70, 50)
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)


def gold_text(draw, pos, text, font, shadow=True):
    """Draw gold text with dark outline and optional shadow."""
    x, y = pos
    if shadow:
        draw.text((x+2, y+2), text, font=font, fill=(0, 0, 0, 180))
    # Outline
    for dx in range(-1, 2):
        for dy in range(-1, 2):
            if dx or dy:
                draw.text((x+dx, y+dy), text, font=font, fill=(40, 20, 0))
    draw.text((x, y), text, font=font, fill=GOLD_LIGHT)


def draw_jade_symbol(canvas, x, y, w, h, label, jade_img, font_large):
    """Draw a single jade cell with gold text overlay."""
    cell = jade_img.resize((w, h), Image.LANCZOS)
    canvas.paste(cell, (x, y))
    # Gold text centered
    draw = ImageDraw.Draw(canvas)
    bbox = font_large.getbbox(label)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = x + (w - tw) // 2 - bbox[0]
    ty = y + (h - th) // 2 - bbox[1]
    # Shadow
    draw.text((tx+2, ty+2), label, font=font_large, fill=(0, 0, 0, 200))
    # Outline
    draw.text((tx, ty), label, font=font_large, fill=GOLD_DARK,
              stroke_width=2, stroke_fill=(40, 20, 0))
    # Main text
    draw.text((tx, ty), label, font=font_large, fill=GOLD_LIGHT)


def draw_panel(draw, x, y, w, h, title, value, font_sm, font_lg):
    """Draw a dark green info panel with gold border."""
    # Panel background
    draw.rounded_rectangle([x, y, x+w, y+h], radius=8, fill=PANEL_GREEN, outline=GOLD, width=2)
    # Title
    gold_text(draw, (x + 10, y + 8), title, font_sm, shadow=False)
    # Value centered
    bbox = font_lg.getbbox(value)
    vw = bbox[2] - bbox[0]
    gold_text(draw, (x + (w - vw)//2, y + h//2 - 5), value, font_lg, shadow=False)


def compose_mobile():
    """Compose 1080x1920 mobile mockup."""
    W, H = 1080, 1920
    canvas = Image.new("RGB", (W, H), DARK_RED)

    # Load elements
    bg = Image.open(os.path.join(ELEMENTS, "bg_portrait.png")).resize((W, H), Image.LANCZOS)
    jade = Image.open(os.path.join(ELEMENTS, "jade_cell.png"))
    mascot = Image.open(os.path.join(ELEMENTS, "mascot_dragon.png"))
    scatter = Image.open(os.path.join(ELEMENTS, "scatter_dragon.png"))
    spin_btn = Image.open(os.path.join(ELEMENTS, "spin_button.png"))
    lantern = Image.open(os.path.join(ELEMENTS, "lantern.png"))

    # Background
    canvas.paste(bg, (0, 0))

    # Darken center area for grid visibility
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    grid_area = (90, 420, 790, 1200)
    od.rounded_rectangle([grid_area[0]-20, grid_area[1]-80, grid_area[2]+20, grid_area[3]+20],
                         radius=12, fill=(40, 0, 0, 200))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")

    draw = ImageDraw.Draw(canvas)
    fonts = {
        'title': ImageFont.truetype(FONT, 64),
        'subtitle': ImageFont.truetype(FONT_SANS, 28),
        'symbol': ImageFont.truetype(FONT, 72),
        'panel_title': ImageFont.truetype(FONT_SANS, 22),
        'panel_value': ImageFont.truetype(FONT, 36),
        'ui': ImageFont.truetype(FONT_SANS, 26),
        'ui_sm': ImageFont.truetype(FONT_SANS, 20),
        'spin': ImageFont.truetype(FONT, 40),
    }

    # === TITLE AREA (Dragon Gate banner) ===
    # Red banner
    draw.rounded_rectangle([200, 300, 680, 400], radius=8, fill=CHINA_RED, outline=GOLD, width=3)
    gold_text(draw, (280, 310), "射龍門", fonts['title'])
    # Subtitle
    draw.rounded_rectangle([380, 395, 500, 420], radius=4, fill=DARK_GREEN, outline=GOLD, width=1)
    gold_text(draw, (400, 396), "SLOT", fonts['ui_sm'], shadow=False)

    # === 3x3 GRID ===
    grid_x, grid_y = 110, 440
    cell_w, cell_h = 210, 230
    gap = 12
    symbols = [["A", "K", "Q"], ["J", "🐉", "10"], ["9", "Q", "K"]]

    # Gold grid frame
    gw = cell_w * 3 + gap * 2 + 40
    gh = cell_h * 3 + gap * 2 + 40
    draw.rounded_rectangle([grid_x-20, grid_y-20, grid_x+gw-20, grid_y+gh-20],
                           radius=6, fill=None, outline=GOLD, width=4)

    for row in range(3):
        for col in range(3):
            cx = grid_x + col * (cell_w + gap)
            cy = grid_y + row * (cell_h + gap)
            label = symbols[row][col]
            if label == "🐉":
                # Scatter
                sc = scatter.resize((cell_w, cell_h), Image.LANCZOS)
                canvas.paste(sc, (cx, cy))
            else:
                draw_jade_symbol(canvas, cx, cy, cell_w, cell_h, label, jade, fonts['symbol'])

    # === GOLD BORDER DECORATIONS (jade beads at intersections) ===
    for row in range(2):
        for col in range(2):
            bx = grid_x + (col + 1) * (cell_w + gap) - gap//2 - 6
            by = grid_y + (row + 1) * (cell_h + gap) - gap//2 - 6
            draw.ellipse([bx, by, bx+12, by+12], fill=(0, 168, 107), outline=GOLD, width=1)

    # === RIGHT SIDE PANELS ===
    panel_x = 720
    draw_panel(draw, panel_x, 480, 260, 100, "龍 ×1", "🐉", fonts['panel_title'], fonts['panel_value'])
    draw_panel(draw, panel_x, 610, 260, 100, "穿門獎勵", "+13", fonts['panel_title'], fonts['panel_value'])
    draw_panel(draw, panel_x, 740, 260, 100, "幸運龍", "🐉 ×1", fonts['panel_title'], fonts['panel_value'])

    # === LANTERNS ===
    lant = lantern.resize((80, 160), Image.LANCZOS)
    canvas.paste(lant, (30, 320))
    canvas.paste(lant, (870, 320))

    # === MASCOT (bottom left) ===
    masc = mascot.resize((220, 220), Image.LANCZOS)
    canvas.paste(masc, (20, 1250))

    # === BOTTOM CONTROL BAR ===
    bar_y = 1520
    # Red bar background
    draw.rectangle([0, bar_y, W, bar_y + 180], fill=CHINA_RED)
    draw.rectangle([0, bar_y, W, bar_y + 4], fill=GOLD)  # Gold top border

    # Balance / Bet / Win
    gold_text(draw, (40, bar_y + 20), "餘額", fonts['ui_sm'], shadow=False)
    gold_text(draw, (40, bar_y + 50), "88,888.00", fonts['ui'], shadow=False)

    gold_text(draw, (340, bar_y + 20), "投注", fonts['ui_sm'], shadow=False)
    # +/- buttons
    draw.ellipse([340, bar_y+50, 380, bar_y+90], fill=DARK_GREEN, outline=GOLD, width=2)
    draw.text((352, bar_y+53), "-", font=fonts['ui'], fill=GOLD_LIGHT)
    gold_text(draw, (400, bar_y + 50), "888.00", fonts['ui'], shadow=False)
    draw.ellipse([530, bar_y+50, 570, bar_y+90], fill=DARK_GREEN, outline=GOLD, width=2)
    draw.text((540, bar_y+53), "+", font=fonts['ui'], fill=GOLD_LIGHT)

    gold_text(draw, (780, bar_y + 20), "贏分", fonts['ui_sm'], shadow=False)
    gold_text(draw, (780, bar_y + 50), "8,888.00", fonts['ui'], shadow=False)

    # SPIN button (center)
    spin_size = 140
    spin_x = (W - spin_size) // 2
    spin_y = bar_y + 100
    sp = spin_btn.resize((spin_size, spin_size), Image.LANCZOS)
    canvas.paste(sp, (spin_x, spin_y))
    # SPIN text on button
    gold_text(draw, (spin_x + 28, spin_y + 48), "SPIN", fonts['spin'])

    # === BOTTOM FUNCTION BUTTONS ===
    func_y = bar_y + 260
    draw.rectangle([0, func_y - 10, W, H], fill=(15, 40, 30))
    btn_labels = ["🔊", "⚡ 快速", "🔄 自動", "ℹ️"]
    btn_w = 200
    for i, lbl in enumerate(btn_labels):
        bx = 60 + i * (btn_w + 40)
        draw.rounded_rectangle([bx, func_y + 10, bx + btn_w, func_y + 70],
                               radius=8, fill=DARK_GREEN, outline=GOLD, width=2)
        gold_text(draw, (bx + 40, func_y + 20), lbl, fonts['ui_sm'], shadow=False)

    canvas.save(os.path.join(BASE, "mockup_mobile_v2.png"), "PNG")
    print("✅ mockup_mobile_v2.png (1080×1920)")


def compose_desktop():
    """Compose 1920x1080 desktop mockup."""
    W, H = 1920, 1080
    canvas = Image.new("RGB", (W, H), DARK_RED)

    # Load elements
    bg = Image.open(os.path.join(ELEMENTS, "bg_landscape.png")).resize((W, H), Image.LANCZOS)
    jade = Image.open(os.path.join(ELEMENTS, "jade_cell.png"))
    mascot = Image.open(os.path.join(ELEMENTS, "mascot_dragon.png"))
    scatter = Image.open(os.path.join(ELEMENTS, "scatter_dragon.png"))
    spin_btn = Image.open(os.path.join(ELEMENTS, "spin_button.png"))
    lantern = Image.open(os.path.join(ELEMENTS, "lantern.png"))

    # Background
    canvas.paste(bg, (0, 0))

    # Darken center for grid
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle([520, 80, 1400, 820], radius=12, fill=(40, 0, 0, 200))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")

    draw = ImageDraw.Draw(canvas)
    fonts = {
        'title': ImageFont.truetype(FONT, 56),
        'symbol': ImageFont.truetype(FONT, 80),
        'panel_title': ImageFont.truetype(FONT_SANS, 20),
        'panel_value': ImageFont.truetype(FONT, 32),
        'ui': ImageFont.truetype(FONT_SANS, 24),
        'ui_sm': ImageFont.truetype(FONT_SANS, 18),
        'spin': ImageFont.truetype(FONT, 36),
    }

    # === TITLE ===
    draw.rounded_rectangle([720, 30, 1200, 120], radius=8, fill=CHINA_RED, outline=GOLD, width=3)
    gold_text(draw, (800, 38), "射龍門", fonts['title'])
    draw.rounded_rectangle([900, 115, 1020, 138], radius=4, fill=DARK_GREEN, outline=GOLD, width=1)
    gold_text(draw, (925, 116), "SLOT", fonts['ui_sm'], shadow=False)

    # === 3x3 GRID (centered) ===
    cell_w, cell_h = 230, 210
    gap = 14
    grid_w = cell_w * 3 + gap * 2
    grid_h = cell_h * 3 + gap * 2
    grid_x = (W - grid_w) // 2
    grid_y = 160

    # Gold frame
    draw.rounded_rectangle([grid_x-15, grid_y-15, grid_x+grid_w+15, grid_y+grid_h+15],
                           radius=6, fill=None, outline=GOLD, width=4)

    symbols = [["A", "K", "Q"], ["J", "🐉", "10"], ["9", "Q", "K"]]
    for row in range(3):
        for col in range(3):
            cx = grid_x + col * (cell_w + gap)
            cy = grid_y + row * (cell_h + gap)
            label = symbols[row][col]
            if label == "🐉":
                sc = scatter.resize((cell_w, cell_h), Image.LANCZOS)
                canvas.paste(sc, (cx, cy))
            else:
                draw_jade_symbol(canvas, cx, cy, cell_w, cell_h, label, jade, fonts['symbol'])

    # Jade beads at intersections
    for row in range(2):
        for col in range(2):
            bx = grid_x + (col+1)*(cell_w+gap) - gap//2 - 6
            by = grid_y + (row+1)*(cell_h+gap) - gap//2 - 6
            draw.ellipse([bx, by, bx+12, by+12], fill=(0, 168, 107), outline=GOLD, width=1)

    # === LEFT PANELS ===
    lp_x = 60
    draw_panel(draw, lp_x, 180, 280, 90, "龍之寶庫", "10 免費遊戲", fonts['panel_title'], fonts['panel_value'])
    draw_panel(draw, lp_x, 290, 280, 90, "龍珠收集", "3 / 10", fonts['panel_title'], fonts['panel_value'])
    draw_panel(draw, lp_x, 400, 280, 90, "連線獎勵", "🥇🥈🥉", fonts['panel_title'], fonts['panel_value'])

    # === RIGHT PANELS ===
    rp_x = 1580
    draw_panel(draw, rp_x, 180, 280, 90, "龍門倍率", "龍 ×1", fonts['panel_title'], fonts['panel_value'])
    draw_panel(draw, rp_x, 290, 280, 90, "穿門獎勵", "+13", fonts['panel_title'], fonts['panel_value'])
    draw_panel(draw, rp_x, 400, 280, 90, "幸運龍", "龍 ×1", fonts['panel_title'], fonts['panel_value'])

    # === LANTERNS ===
    lant = lantern.resize((70, 140), Image.LANCZOS)
    canvas.paste(lant, (440, 50))
    canvas.paste(lant, (1410, 50))

    # === MASCOT ===
    masc = mascot.resize((200, 200), Image.LANCZOS)
    canvas.paste(masc, (60, 700))

    # === BOTTOM BAR ===
    bar_y = 900
    draw.rectangle([0, bar_y, W, H], fill=CHINA_RED)
    draw.rectangle([0, bar_y, W, bar_y+3], fill=GOLD)

    # Menu button
    draw.rounded_rectangle([30, bar_y+25, 90, bar_y+75], radius=6, fill=DARK_GREEN, outline=GOLD, width=2)
    draw.text((47, bar_y+35), "≡", font=fonts['ui'], fill=GOLD_LIGHT)

    # Audio
    draw.rounded_rectangle([110, bar_y+25, 170, bar_y+75], radius=6, fill=DARK_GREEN, outline=GOLD, width=2)
    draw.text((125, bar_y+35), "🔊", font=fonts['ui_sm'], fill=GOLD_LIGHT)

    # Balance
    gold_text(draw, (220, bar_y+15), "餘額", fonts['ui_sm'], shadow=False)
    gold_text(draw, (220, bar_y+45), "88,888.00", fonts['ui'], shadow=False)

    # Bet with +/-
    gold_text(draw, (500, bar_y+15), "總投注", fonts['ui_sm'], shadow=False)
    draw.ellipse([500, bar_y+45, 540, bar_y+85], fill=DARK_GREEN, outline=GOLD, width=2)
    draw.text((512, bar_y+50), "-", font=fonts['ui'], fill=GOLD_LIGHT)
    gold_text(draw, (560, bar_y+45), "888", fonts['ui'], shadow=False)
    draw.ellipse([650, bar_y+45, 690, bar_y+85], fill=DARK_GREEN, outline=GOLD, width=2)
    draw.text((662, bar_y+50), "+", font=fonts['ui'], fill=GOLD_LIGHT)

    # SPIN button (center)
    spin_size = 130
    spin_x = (W - spin_size) // 2
    spin_y = bar_y + 15
    sp = spin_btn.resize((spin_size, spin_size), Image.LANCZOS)
    canvas.paste(sp, (spin_x, spin_y))
    gold_text(draw, (spin_x + 22, spin_y + 44), "SPIN", fonts['spin'])

    # Win
    gold_text(draw, (1200, bar_y+15), "贏分", fonts['ui_sm'], shadow=False)
    gold_text(draw, (1200, bar_y+45), "8,888.00", fonts['ui'], shadow=False)

    # Right function buttons
    funcs = ["⚡快速", "🔄自動", "ℹ️"]
    for i, lbl in enumerate(funcs):
        bx = 1500 + i * 130
        draw.rounded_rectangle([bx, bar_y+25, bx+110, bar_y+75],
                               radius=6, fill=DARK_GREEN, outline=GOLD, width=2)
        gold_text(draw, (bx+15, bar_y+35), lbl, fonts['ui_sm'], shadow=False)

    canvas.save(os.path.join(BASE, "mockup_desktop_v2.png"), "PNG")
    print("✅ mockup_desktop_v2.png (1920×1080)")


if __name__ == "__main__":
    compose_mobile()
    compose_desktop()
