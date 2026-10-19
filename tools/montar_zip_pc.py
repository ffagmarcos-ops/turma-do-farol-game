#!/usr/bin/env python3
"""Monta o zip da versão PC a partir da cópia OTIMIZADA do Android (rode depois do otimizar_assets.py).
    python tools/montar_zip_pc.py 17 3.7      -> TurmaDoFarol_VilaDasConchas_v17.zip (pasta de saída: ../builds)
Copia android/app/src/main/assets/public -> jogo/ (sem cordova*.js), os arquivos de pc_pacote/ e LICENCAS.md -> LICENCAS.txt,
e troca a linha 2 do LEIA-ME para "(versão N / APK X)".
"""
import os, re, shutil, sys, glob
zipv, apkv = sys.argv[1], sys.argv[2]
out = os.path.abspath(sys.argv[3] if len(sys.argv) > 3 else "../builds"); os.makedirs(out, exist_ok=True)
stage = os.path.join(out, "_pc", "TurmaDoFarol_VilaDasConchas"); shutil.rmtree(stage, ignore_errors=True)
shutil.copytree("android/app/src/main/assets/public", os.path.join(stage, "jogo"))
for f in glob.glob(os.path.join(stage, "jogo", "cordova*.js")): os.remove(f)
for f in os.listdir("pc_pacote"): shutil.copy(os.path.join("pc_pacote", f), stage)
shutil.copy("LICENCAS.md", os.path.join(stage, "LICENCAS.txt"))
lm = os.path.join(stage, "LEIA-ME.txt"); L = open(lm, encoding="utf-8").read().split("\n")
L[1] = re.sub(r"\(versão .*?\)", f"(versão {zipv} / APK {apkv})", L[1]); open(lm, "w", encoding="utf-8").write("\n".join(L))
z = shutil.make_archive(os.path.join(out, f"TurmaDoFarol_VilaDasConchas_v{zipv}"), "zip", os.path.dirname(stage), "TurmaDoFarol_VilaDasConchas")
print(z, round(os.path.getsize(z) / 1e6, 1), "MB")
