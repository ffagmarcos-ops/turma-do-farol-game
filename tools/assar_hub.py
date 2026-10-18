"""Pré-processa a arte do hub para desempenho (sem máscaras/blur em tempo real):
- cenas dos portais, vitral e rachaduras: recorte em ARCO no alfa + redução para 320x440 (exibidas a ~121x211 / 91x158)
- cena_bastidores: blur leve já assado
- miniaturas desfocadas (pergaminho de confirmação): portais/thumbs/<cena>_blur.png 160x220
- hub_frente_cordas: blur assado + 1920x200; hub_bg_ceu_mar 1920x540; hub_raios_luz 1024x512; hub_lente_farol 512
Fonte: ../arte_fonte_hub (cópia da arte do Daniel antes do processamento)."""
from PIL import Image, ImageFilter
import numpy as np, os
SRC='../arte_fonte_hub'; P='public/assets/farol/fase3/'
RYN=(422/735)/2  # raio vertical do arco em coords normalizadas do vão
def arch(X,Y):
    return (Y>=RYN)&(Y<=1.0001) | ((((X-0.5)/0.5)**2+((Y-RYN)/RYN)**2)<=1)
def bake(img, xf, size=(320,440)):
    im=img.convert('RGBA').resize(size, Image.LANCZOS); a=np.array(im)
    h,w=a.shape[:2]; v,u=np.mgrid[0:h,0:w]; u=(u+0.5)/w; v=(v+0.5)/h
    X,Y=xf(u,v); m=arch(X,Y)
    # borda suave de ~1px
    al=a[...,3].astype(float)*m
    a[...,3]=Image.fromarray(al.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)) if False else al.astype(np.uint8)
    return Image.fromarray(a)
ident=lambda u,v:(u,v)
XF={'cena_mar_fg':lambda u,v:(0.5+(u-0.5)*0.75, 1-(1-v)*0.75), 'cena_vila_fg':lambda u,v:(u,v+0.08)}
os.makedirs(P+'portais/thumbs',exist_ok=True)
for f in sorted(os.listdir(SRC)):
    n=f[:-4]; im=Image.open(f'{SRC}/{f}')
    if n.startswith('cena_') or n=='portal_vitral_fechado':
        if n=='cena_bastidores': im=im.filter(ImageFilter.GaussianBlur(2.2))
        out=bake(im, XF.get(n,ident)); out.save(P+f'portais/{f}', optimize=True)
        if n.startswith('cena_') and not n.endswith(('_fg','_rabo')):
            bake(im,ident,(160,220)).filter(ImageFilter.GaussianBlur(2.5)).save(P+f'portais/thumbs/{n}_blur.png')
    elif n=='portal_vitral_rachaduras_sheet':
        fw=im.width//4; sheet=Image.new('RGBA',(320*4,440))
        for k in range(4): sheet.paste(bake(im.crop((k*fw,0,(k+1)*fw,im.height)),ident),(k*320,0))
        sheet.save(P+f'portais/{f}', optimize=True)
    elif n=='hub_frente_cordas': im.filter(ImageFilter.GaussianBlur(3)).resize((1920,200),Image.LANCZOS).save(P+'hub/'+f, optimize=True)
    elif n=='hub_bg_ceu_mar': im.resize((1920,540),Image.LANCZOS).save(P+'hub/'+f, optimize=True)
    elif n=='hub_raios_luz': im.resize((1024,512),Image.LANCZOS).save(P+'hub/'+f, optimize=True)
    elif n=='hub_lente_farol': im.resize((512,512),Image.LANCZOS).save(P+'hub/'+f, optimize=True)
print('ok')
