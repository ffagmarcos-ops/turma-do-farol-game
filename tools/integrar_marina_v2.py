#!/usr/bin/env python3
"""Normaliza as tiras de andar/correr do Daniel (8 quadros numa linha, QUALQUER tamanho de quadro:
192x256 hoje, 420x760 na hi-res) para a geometria da Marina do jogo (marina_sheet_1536, idle):
  altura de pé = 204/256 do quadro, pés na linha 240/256, tronco no x 83/192 (corrida +10, inclinada).
Saída: public/assets/farol/chars/marina_<walk|run>_v2.png, quadros de 192*R x 256*R (R = --res).
O jogo lê o tamanho do quadro do próprio arquivo (largura/8), então a hi-res é só trocar o arquivo.
Pulo: python3 tools/integrar_marina_v2.py jump ../arte_gpt/v2/marina_jump_v2.png
Uso: python3 tools/integrar_marina_v2.py walk ../arte_gpt/v2/marina_walk_v2.png [--res 2]
"""
import sys, numpy as np
from PIL import Image
KIND, SRC = sys.argv[1], sys.argv[2]
R = float(sys.argv[sys.argv.index("--res") + 1]) if "--res" in sys.argv else 1
FW, FH, IDLE_H, FEET, TORSO_X = 192, 256, 204, 240, 83
LEAN = {"walk": 0, "run": 10, "jump": 0}[KIND]
# pulo: a arte é "achatada" (sem arco; a altura do pulo vem do código). Escala igual à do andar v2
# (Marina de pé = 220/256 do quadro) e pés na mesma linha; o quadro 2 tem os pés 8 px abaixo (248/256).
JUMP_H, JUMP_FEET_FIX = 220 / 256, {2: 8 / 256}
RUN_CROUCH = 207 / 220  # na arte, a corrida é ~6% mais baixa que o andar (agachada); mantém o mesmo fator
im = Image.open(SRC).convert("RGBA"); sw, sh = im.size; fw = sw // 8
alpha = np.asarray(im)[..., 3] > 40
bb = []
for c in range(8):
    m = alpha[:, c * fw:(c + 1) * fw]; ys = np.where(m.any(1))[0]
    t = np.where(m[int(sh * .35):int(sh * .6)].any(0))[0]
    bb.append((ys[0], ys[-1], t.mean()))
h = JUMP_H * sh if KIND == "jump" else max(b[1] - b[0] for b in bb) / (RUN_CROUCH if KIND == "run" else 1)
k = IDLE_H / h * R
feet = float(np.median([b[1] for b in bb])) if KIND != "jump" else 239 / 256 * sh; torso = float(np.mean([b[2] for b in bb]))  # média: mantém o balanço natural
W1, H1 = int(FW * R), int(FH * R)
out = Image.new("RGBA", (W1 * 8, H1))
for c in range(8):
    g = im.crop((c * fw, 0, (c + 1) * fw, sh)).resize((round(fw * k), round(sh * k)), Image.LANCZOS)
    cell = Image.new("RGBA", (W1, H1))
    cell.paste(g, (round((TORSO_X + LEAN) * R - torso * k), round(FEET * R - (feet + JUMP_FEET_FIX.get(c, 0) * sh * (KIND == "jump") + 1) * k)), g)
    out.alpha_composite(cell, (c * W1, 0))
dst = f"public/assets/farol/chars/marina_{KIND}_v2.png"
out.save(dst, optimize=True)
print(dst, out.size, "quadro", W1, H1, "k=%.3f" % k)
