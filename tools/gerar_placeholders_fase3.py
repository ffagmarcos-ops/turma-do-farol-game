"""Placeholders da Fase 3 (hub dos portais), com os MESMOS nomes de arquivo do PLANEJAMENTO (sec. 5).
Quando o Daniel aprovar a arte final, basta sobrescrever o arquivo com o mesmo nome. Todos em meia resolução
(o jogo usa tamanho de exibição fixo, então a arte final em resolução cheia encaixa igual).
Não sobrescreve arquivo que não seja placeholder (marcador em PNG text chunk 'placeholder')."""
import os, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from PIL.PngImagePlugin import PngInfo
R = os.path.join(os.path.dirname(__file__), "..", "public", "assets", "farol", "fase3")
random.seed(7)
try:
    FONT = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", 26)
    FS = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", 16)
except Exception:
    FONT = FS = ImageFont.load_default()

def save(im, rel, label=True):
    p = os.path.join(R, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    if os.path.exists(p):
        try:
            if Image.open(p).info.get("placeholder") != "1": print("mantido (arte real):", rel); return
        except Exception: return
    if label:
        d = ImageDraw.Draw(im); d.text((8, im.height - 22), "placeholder", font=FS, fill=(255, 255, 255, 140))
    meta = PngInfo(); meta.add_text("placeholder", "1")
    im.save(p, optimize=True, pnginfo=meta); print("ok", rel, im.size)

def grad(w, h, top, bot, mode="RGB"):
    im = Image.new("RGBA", (w, h)); d = ImageDraw.Draw(im)
    for y in range(h):
        t = y / max(1, h - 1); d.line([(0, y), (w, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)) + (255,))
    return im

def arch(d, box, **kw):
    x0, y0, x1, y1 = box; r = (x1 - x0) / 2
    d.pieslice([x0, y0, x1, y0 + 2 * r], 180, 360, **kw); d.rectangle([x0, y0 + r, x1, y1], **kw)

# ---- hub (meia resolução: 1920x540) ----
im = grad(1920, 540, (240, 190, 120), (70, 170, 190))
d = ImageDraw.Draw(im)
d.rectangle([0, 330, 1920, 540], fill=(40, 110, 140, 255))
for i in range(60): x = random.randint(0, 1920); y = random.randint(340, 530); d.line([(x, y), (x + 30, y)], fill=(200, 235, 240, 120), width=2)
for i in range(14): x = 300 + i * 18; d.rectangle([x, 318, x + 12, 332], fill=(240, 220, 200, 255))
save(im, "hub/hub_bg_ceu_mar.png")

im = Image.new("RGBA", (1920, 540), (96, 82, 70, 255)); d = ImageDraw.Draw(im)
for y in range(0, 540, 36):
    off = 0 if (y // 36) % 2 else 40
    for x in range(-off, 1920, 80): d.rectangle([x + 2, y + 2, x + 78, y + 34], fill=(112 + random.randint(-10, 10), 96, 82, 255))
for cx in (320, 960, 1600):
    arch(d, (cx - 130, 40, cx + 130, 300), fill=(0, 0, 0, 0))
    d.arc([cx - 140, 30, cx + 140, 310], 180, 360, fill=(150, 110, 60, 255), width=10)
for x in range(0, 1920, 240): d.rectangle([x, 0, x + 18, 540], fill=(70, 48, 30, 255))
for i in range(40): x = random.randint(0, 1920); y = random.randint(320, 520); d.ellipse([x, y, x + 14, y + 10], fill=(235, 215, 190, 255))
save(im, "hub/hub_bg_parede.png")

im = Image.new("RGBA", (1920, 540), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
# chão em y=968/2=484; mezanino topo em 650/2=325, de x=1100/2 a 3460/2; degrau 3480..3640 topo 810/2
for x in range(0, 1920, 46): d.rectangle([x, 484, x + 44, 540], fill=(122, 84, 52, 255), outline=(70, 44, 26, 255))
d.ellipse([860, 494, 1060, 534], outline=(240, 220, 190, 255), width=4)
d.rectangle([550, 325, 1730, 338], fill=(110, 74, 44, 255)); d.rectangle([550, 338, 1730, 344], fill=(70, 44, 26, 255))
for x in range(560, 1730, 60): d.line([(x, 325), (x, 290)], fill=(190, 160, 110, 255), width=3)
d.line([(550, 292), (1730, 292)], fill=(190, 160, 110, 255), width=4)
for x in range(570, 1730, 300): d.rectangle([x, 344, x + 10, 484], fill=(80, 52, 30, 255))
d.rectangle([1740, 405, 1820, 484], fill=(140, 96, 54, 255), outline=(70, 44, 26, 255), width=3)
d.line([(1740, 405), (1820, 484)], fill=(70, 44, 26, 255), width=3)
save(im, "hub/hub_chao_mezanino.png")

im = Image.new("RGBA", (512, 512), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
for r, c in ((250, (150, 110, 60, 255)), (230, (60, 190, 200, 200)), (170, (110, 220, 225, 210)), (100, (190, 245, 245, 230))): d.ellipse([256 - r, 256 - r, 256 + r, 256 + r], fill=c)
for k in range(12): a = k * math.pi / 6; d.line([(256, 256), (256 + 240 * math.cos(a), 256 + 240 * math.sin(a))], fill=(150, 110, 60, 200), width=4)
save(im, "hub/hub_lente_farol.png")

im = Image.new("RGBA", (1024, 512), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
for k in range(7):
    a = -0.9 + k * 0.3; d.polygon([(512, 0), (512 + 900 * math.sin(a - 0.06), 512), (512 + 900 * math.sin(a + 0.06), 512)], fill=(255, 240, 200, 50))
save(im.filter(ImageFilter.GaussianBlur(10)), "hub/hub_raios_luz.png", label=False)

im = Image.new("RGBA", (1920, 200), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
for x in (120, 700, 1300, 1800): d.line([(x, 0), (x + 20, 200)], fill=(90, 66, 40, 230), width=16)
for i in range(30): x = 300 + i * 12; d.line([(x, 120), (x + 60, 200)], fill=(70, 60, 50, 160), width=2)
d.ellipse([360, 150, 400, 190], fill=(220, 90, 40, 230))
save(im.filter(ImageFilter.GaussianBlur(3)), "hub/hub_frente_cordas.png", label=False)

# ---- portais (meia resolução: moldura 384x512, vão 320x440) ----
im = Image.new("RGBA", (384, 512), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
arch(d, (8, 8, 376, 504), fill=(150, 108, 58, 255)); arch(d, (32, 36, 352, 476), fill=(0, 0, 0, 0))
for k in range(9): a = math.pi + k * math.pi / 8; d.ellipse([192 + 172 * math.cos(a) - 9, 192 + 172 * math.sin(a) - 9, 192 + 172 * math.cos(a) + 9, 192 + 172 * math.sin(a) + 9], fill=(235, 210, 160, 255))
d.arc([172, 0, 212, 40], 0, 330, fill=(60, 200, 210, 255), width=5)
d.rectangle([8, 476, 376, 504], fill=(110, 76, 40, 255))
save(im, "portais/portal_moldura.png")

def vitral(light):
    im = Image.new("RGBA", (320, 440), (0, 0, 0, 0)); m = Image.new("L", (320, 440), 0); arch(ImageDraw.Draw(m), (0, 0, 320, 440), fill=255)
    base = grad(320, 440, (20, 60, 70), (10, 30, 44))
    d = ImageDraw.Draw(base)
    for i in range(10): x = random.randint(0, 320); y = random.randint(60, 420); d.ellipse([x - 50, y - 18, x + 50, y + 18], fill=(70, 120, 130, 90))
    if light:
        random.seed(light)
        for k in range(light * 5):
            x, y = 160, 220
            for s in range(6): nx, ny = x + random.randint(-50, 50), y + random.randint(-60, 60); d.line([(x, y), (nx, ny)], fill=(150, 255, 240, 255), width=2 + light); x, y = nx, ny
        if light == 4: d.rectangle([0, 0, 320, 440], fill=(200, 255, 245, 170))
    base = base.filter(ImageFilter.GaussianBlur(1)); im.paste(base, (0, 0), m); return im
save(vitral(0), "portais/portal_vitral_fechado.png")
sheet = Image.new("RGBA", (320 * 4, 440), (0, 0, 0, 0))
for i in range(4): sheet.paste(vitral(i + 1), (320 * i, 0))
save(sheet, "portais/portal_vitral_rachaduras_sheet.png")

im = Image.new("RGBA", (512, 512), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
d.ellipse([16, 16, 496, 496], outline=(90, 230, 230, 230), width=14); d.ellipse([46, 46, 466, 466], outline=(140, 250, 240, 150), width=4)
for k in range(16): a = k * math.pi / 8; cx, cy = 256 + 222 * math.cos(a), 256 + 222 * math.sin(a); d.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(230, 255, 250, 255))
save(im.filter(ImageFilter.GaussianBlur(1.5)), "portais/portal_anel_energia.png", label=False)

im = Image.new("RGBA", (256, 128), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
def scallop(d, cx, cy, r, a0=200, a1=340):
    d.pieslice([cx - r, cy - r, cx + r, cy + r], a0, a1, fill=(235, 190, 70, 255), outline=(110, 70, 20, 255), width=3)
    for k in range(5): a = math.radians(a0 + (a1 - a0) * (k + 0.5) / 5); d.line([(cx, cy), (cx + r * math.cos(a), cy + r * math.sin(a))], fill=(150, 100, 30, 255), width=2)
scallop(d, 64, 100, 60, 180, 360); d.rectangle([40, 96, 88, 120], fill=(200, 150, 50, 255), outline=(110, 70, 20, 255), width=3)
scallop(d, 168, 100, 48, 180, 270); scallop(d, 216, 100, 48, 270, 360)
save(im, "portais/cadeado_concha_sheet.png", label=False)

im = Image.new("RGBA", (256, 80), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
d.rounded_rectangle([2, 2, 254, 78], 14, fill=(140, 98, 50, 255), outline=(70, 44, 20, 255), width=4)
d.rounded_rectangle([10, 10, 246, 70], 10, outline=(210, 170, 100, 255), width=2)
save(im, "portais/placa_bronze.png", label=False)

im = Image.new("RGBA", (384, 512), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
for (a, b) in (((20, 60), (364, 470)), ((364, 60), (20, 470))):
    for t in range(0, 101, 6):
        x = a[0] + (b[0] - a[0]) * t / 100; y = a[1] + (b[1] - a[1]) * t / 100
        d.ellipse([x - 14, y - 9, x + 14, y + 9], outline=(140, 140, 150, 255), width=5)
d.rectangle([110, 220, 274, 290], fill=(150, 110, 70, 255), outline=(80, 50, 30, 255), width=4)
for i in range(12): x = random.randint(20, 360); d.line([(x, 480), (x + random.randint(-30, 30), 380)], fill=(50, 120, 70, 220), width=6)
save(im, "portais/portal_fase3_correntes.png")

CENAS = {
    "cena_vila_bg": ((250, 200, 150), (90, 170, 200), "Vila"), "cena_vila_fg": None,
    "cena_mar_bg": ((40, 50, 70), (20, 40, 60), "Mar"), "cena_mar_fg": None,
    "cena_marina": ((250, 190, 130), (100, 160, 190), "Marina"), "cena_faisca": ((240, 210, 160), (120, 170, 190), "Faísca"),
    "cena_faisca_rabo": None, "cena_bia": ((240, 220, 170), (90, 150, 160), "Bia"), "cena_julia": ((250, 230, 190), (80, 170, 210), "Júlia"),
    "cena_lucas": ((60, 90, 140), (20, 40, 80), "Lucas"), "cena_toninho": ((240, 170, 110), (70, 120, 150), "Toninho"),
    "cena_farol": ((20, 30, 60), (10, 20, 40), "Farol"), "cena_esperanca": ((250, 210, 160), (80, 150, 190), "Esperança"),
    "cena_polvo": ((20, 30, 30), (10, 20, 30), "Polvo"), "cena_cavernas": ((20, 80, 100), (10, 40, 60), "Cavernas"),
    "cena_bastidores": ((230, 210, 180), (180, 150, 120), "Bastidores"),
}
for k, v in CENAS.items():
    if v is None:
        im = Image.new("RGBA", (320, 440), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        if k == "cena_vila_fg":
            for x in (60, 200): d.polygon([(x, 380), (x + 80, 380), (x + 64, 410), (x + 16, 410)], fill=(170, 80, 50, 255))
        elif k == "cena_mar_fg":
            d.line([(250, 440), (230, 320), (260, 240)], fill=(200, 80, 60, 255), width=30)
        else:
            d.line([(150, 300), (200, 260)], fill=(200, 140, 70, 255), width=14)
        save(im, f"portais/{k}.png", label=False); continue
    top, bot, name = v
    im = grad(320, 440, top, bot); d = ImageDraw.Draw(im)
    d.ellipse([110, 140, 210, 240], fill=tuple(min(255, c + 40) for c in top) + (255,))
    d.rectangle([90, 240, 230, 440], fill=tuple(max(0, c - 40) for c in bot) + (255,))
    if name == "Polvo": d.ellipse([90, 180, 230, 260], fill=(240, 180, 40, 255)); d.ellipse([150, 186, 170, 254], fill=(10, 10, 10, 255))
    if name == "Farol": d.polygon([(160, 200), (320, 120), (320, 200)], fill=(255, 240, 180, 120))
    tw = d.textlength(name, font=FONT); d.text(((320 - tw) / 2, 40), name, font=FONT, fill=(255, 250, 235, 255), stroke_width=3, stroke_fill=(20, 15, 10, 255))
    save(im, f"portais/{k}.png")

# ---- curiosidades ----
im = Image.new("RGBA", (800, 500), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
d.rounded_rectangle([0, 0, 800, 500], 24, fill=(150, 108, 58, 255)); d.rounded_rectangle([16, 16, 784, 484], 16, fill=(236, 220, 186, 255))
for (x, y) in ((0, 0), (740, 0), (0, 440), (740, 440)): d.rectangle([x, y, x + 60, y + 60], fill=(150, 108, 58, 255))
save(im, "curio/carta_moldura.png")
im = Image.new("RGBA", (256, 300), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
d.rectangle([0, 0, 256, 300], fill=(250, 248, 240, 255)); d.rectangle([16, 16, 240, 232], fill=(0, 0, 0, 0)); d.rectangle([90, 0, 166, 20], fill=(240, 230, 170, 200))
save(im, "curio/polaroid_moldura.png", label=False)
for k, (w, h), txt in (("lucas_aparelho_explodido", (768, 512), "aparelho sônico"), ("vila_mapa_ilustrado", (960, 540), "mapa da vila"), ("esperanca_planta", (960, 540), "planta do Esperança"), ("polvo_dossie", (960, 540), "dossiê do polvo")):
    im = grad(w, h, (236, 220, 186), (210, 190, 150)); d = ImageDraw.Draw(im)
    for i in range(0, w, 48): d.line([(i, 0), (i, h)], fill=(190, 170, 130, 255))
    for i in range(0, h, 48): d.line([(0, i), (w, i)], fill=(190, 170, 130, 255))
    tw = d.textlength(txt, font=FONT); d.text(((w - tw) / 2, h / 2 - 14), txt, font=FONT, fill=(90, 60, 30, 255))
    save(im, f"curio/{k}.png")
im = Image.new("RGBA", (128 * 4, 128 * 3), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
for r in range(3):
    for c in range(4):
        x, y = c * 128 + 64, r * 128 + 64
        for s in range(c + 1): d.arc([x - 40 + s * 6, y - 30, x + 40 - s * 6, y + 30], 0, 360, fill=(200, 170, 110, 255), width=6)
save(im, "curio/toninho_nos_sheet.png", label=False)

# ---- UI ----
im = Image.new("RGBA", (128, 128), (0, 0, 0, 0)); d = ImageDraw.Draw(im); scallop(d, 64, 100, 56, 180, 360); save(im, "ui/icone_concha_hud.png", label=False)
print("fim")
