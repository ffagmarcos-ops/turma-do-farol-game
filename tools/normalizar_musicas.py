"""Normaliza as músicas a -16 LUFS (loudnorm em 2 passadas, TP -1.5) e faz o laço com crossfade de 1 s."""
import json,subprocess,sys,os
def run(a): return subprocess.run(a,capture_output=True,text=True)
def measure(src,pre=""):
    af=(pre+"," if pre else "")+"loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json"
    e=run(["ffmpeg","-hide_banner","-i",src,"-af",af,"-f","null","-"]).stderr
    return json.loads(e[e.rindex("{"):e.rindex("}")+1])
def norm(src,dst,loop=False,codec=None):
    pre=""
    if loop:  # fim cruza 1 s com o começo: o laço fica sem emenda
        tmp=dst+".loop.wav"
        r=run(["ffmpeg","-y","-v","error","-i",src,"-i",src,"-filter_complex","[0:a]atrim=start=1,asetpts=PTS-STARTPTS[A];[1:a]atrim=0:1,asetpts=PTS-STARTPTS[B];[A][B]acrossfade=d=1:c1=tri:c2=tri","-ar","44100",tmp]); assert r.returncode==0,r.stderr
        src=tmp
    m=measure(src)
    af=f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    c=["-c:a","libvorbis","-b:a","96k"] if dst.endswith(".ogg") else ["-c:a","libmp3lame","-b:a","128k"]
    r=run(["ffmpeg","-y","-v","error","-i",src,"-af",af,"-ar","44100",*c,dst]); assert r.returncode==0,r.stderr
    if loop: os.remove(src)
    print(dst, "I=", measure(dst)["input_i"])
R="../assets_externos/musica_v31/raw/"; A="public/assets/audio/"; O="../arte_fonte_hub/audio_orig/"
os.makedirs(O,exist_ok=True)
for f in ["music_vila.mp3","fase2/bgm_boss.mp3","fase2/bgm_boss_abertura.mp3"]:
    b=O+f.replace("/","_")
    if not os.path.exists(b): subprocess.run(["cp",A+f,b])
if "--all" in sys.argv:
    norm(O+"music_vila.mp3",A+"music_vila.mp3")
    norm(O+"fase2_bgm_boss.mp3",A+"fase2/bgm_boss.mp3")
    norm(O+"fase2_bgm_boss_abertura.mp3",A+"fase2/bgm_boss_abertura.mp3")
norm(R+"treasure_hunter.mp3",A+"menu/musica_menu.ogg",loop=True)
norm(R+"mystical_enigmatic_original.mp3",A+"menu/musica_mistica.ogg")
norm(R+"pirates_orchestra.mp3",A+"fase2/bgm_boss_tenso.mp3",loop=True)
