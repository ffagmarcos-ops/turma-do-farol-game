#!/usr/bin/env python3
"""Processo LEVE do APK (mantém o APK < ~70 MB). Rode DEPOIS do `npx cap sync android`:
    python tools/otimizar_assets.py android/app/src/main/assets/public
- PNG/JPG > 150 KB -> WebP (qualidade 90 com alfa, 85 sem alfa), MANTENDO o nome do arquivo (o navegador detecta o formato);
- MP3/OGG > 60 KB -> OGG Vorbis 96 kbps (mantendo o nome). Só troca se economizar >= 10%.
Demora ~8-15 min. Precisa de Pillow (pip install pillow) e ffmpeg no PATH.
NUNCA rode em public/ (os originais ficam lá); só na cópia do Android.
"""
import os, sys, subprocess
from PIL import Image
root = os.path.join(sys.argv[1] if len(sys.argv) > 1 else "android/app/src/main/assets/public", "assets")
saved = 0; n = 0
for d, _, fs in os.walk(root):
    for f in fs:
        p = os.path.join(d, f); sz = os.path.getsize(p); ext = f.lower().rsplit(".", 1)[-1]
        hdr = open(p, "rb").read(12)
        if hdr[:4] in (b"RIFF", b"OggS"): continue  # já convertido
        if ext in ("png", "jpg", "jpeg") and sz > 150_000:
            im = Image.open(p); alpha = im.mode in ("RGBA", "LA", "P") and im.convert("RGBA").getextrema()[3][0] < 255
            tmp = p + ".tmp.webp"
            (im.convert("RGBA").save(tmp, "WEBP", quality=90, method=6, exact=True) if alpha else im.convert("RGB").save(tmp, "WEBP", quality=85, method=6))
            if os.path.getsize(tmp) < sz * 0.9: saved += sz - os.path.getsize(tmp); os.replace(tmp, p); n += 1
            else: os.remove(tmp)
        elif ext in ("mp3", "ogg") and sz > 60_000:
            tmp = p + ".tmp.ogg"
            r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", p, "-c:a", "libvorbis", "-b:a", "96k", tmp])
            if r.returncode == 0 and os.path.getsize(tmp) < sz * 0.9: saved += sz - os.path.getsize(tmp); os.replace(tmp, p); n += 1
            elif os.path.exists(tmp): os.remove(tmp)
print("economia MB", round(saved / 1e6, 1), "arquivos", n)
