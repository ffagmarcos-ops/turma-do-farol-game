import re,json
L=open('../assets_externos/LICENCAS.md',encoding='utf8').read().splitlines()
skip=('latido','Astigmatic','vwolfdog','Arquivo(s)','---')
seen={};order=[]
for l in L:
  if not l.startswith('|') or any(s in l for s in skip): continue
  c=[x.strip() for x in l.strip('|').split('|')]
  if len(c)<4: continue
  if c[1].startswith('http'): src,aut,lic=c[1],c[2],c[3]
  else: src,aut,lic=c[1],c[2],c[3]
  if aut in ('—',''): continue
  m=re.search(r'content/([^ )]+)|kenney\.nl/assets/([^ )]+)',src)
  obra=(m.group(1) or m.group(2)).replace('-',' ') if m else ''
  lic=re.sub(r'\*|\(.*','',lic).strip()
  k=aut
  if k not in seen: seen[k]={'autor':aut,'obras':[],'lic':lic};order.append(k)
  if obra and obra not in seen[k]['obras']: seen[k]['obras'].append(obra)
out=[seen[k] for k in order]
out.append({'autor':'Fonte Luckiest Guy — Astigmatic','obras':['Google Fonts'],'lic':'Apache License 2.0'})
json.dump(out,open('src/game/data/creditos.json','w'),ensure_ascii=False,indent=1)
print(len(out))
