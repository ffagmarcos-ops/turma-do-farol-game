"""Gera 120 conchas (108 comuns + 12 douradas) na Fase 1 mantendo as 20 originais (s01..s20).
Trilhas contínuas: nenhum trecho > 400 px sem concha; alturas 900 (chão), 820/760 (pulo), 660-710 (dourada)."""
import json
P='src/game/data/fase1-vila.json'
d=json.load(open(P))
old=[s for s in d['shells'] if s['id'].startswith('s') and len(s['id'])==3]
for s in old:
    if s.get('secret'): s['gold']=True
Z=[('Entrada',420,2000,12,[(1600,660)]),('Rua',2000,4200,16,[(2840,700),(3900,680)]),('Mercado',4200,6400,18,[(5080,690)]),
   ('Praca',6400,8600,16,[(7000,660),(6100,670)]),('Cais',8600,10800,18,[(8900,930),(10200,680)]),
   ('Pier',10800,12800,16,[(11200,660),(12700,700)]),('Barco',12800,13800,12,[(13560,660)])]
new=[];gi=0;ci=0
for name,x0,x1,nc,golds in Z:
    have=[s for s in old if x0<=s['x']<x1 and not s.get('gold')]
    need=nc-len(have)
    xs=[x0+60+(x1-x0-120)*(i+0.5)/need for i in range(need)]
    for i,x in enumerate(xs):
        x=int(round(x))
        # evita sobrepor concha antiga
        if any(abs(x-s['x'])<50 for s in old): x+=60
        y=900
        if 8780-40<=x<=9000+40: y=930  # passa por baixo da rede (agachar)
        elif i%6 in(3,4,5): y=[820,760,820][i%6-3]  # arco de pulo
        ci+=1; new.append({'id':f's2-{ci:03d}','x':x,'y':y})
    for gx,gy in golds:
        gi+=1; new.append({'id':f'gold-{gi:02d}','x':gx,'y':gy,'gold':True})
d['shells']=old+new
allx=sorted(s['x'] for s in d['shells'])
gaps=[(a,b) for a,b in zip(allx,allx[1:]) if b-a>400 and a>420]
g=sum(1 for s in d['shells'] if s.get('gold'))
print('total',len(d['shells']),'gold',g,'pontos',len(d['shells'])-g+5*g,'gaps>400',gaps)
json.dump(d,open(P,'w'),ensure_ascii=False,indent=2)
