"""Exporta a campanha existente para o Unity sem alterar as artes originais."""
import json,re,subprocess,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'unity/TurmaDoFarol/Assets/Farol/Dados/campanha.json'
def read(p):return json.loads((ROOT/p).read_text())
textures={}
def add(key,file,fw=0,fh=0,scale=1,pivot=.5,rects=None):
 p=ROOT/'unity/TurmaDoFarol/Assets/Originais'/file
 if p.exists(): textures[key]=dict(key=key,path='Assets/Originais/'+file,fw=fw,fh=fh,scale=scale,pivot=pivot,rects=rects)
for k,f in dict(bg_sky='bg/sky_01_seamless.png',bg_sea='bg/sea.png',bg_village_far='bg/village_far_pano.png',bg_village_mid='bg/village_mid_pano.png',bg_harbor='bg/harbor_03_v2.png',menu_capa='ui/menu_capa.png',shell='props/shell.png',boat_esperanca='props/boat_esperanca.png',pier_tile='props/pier_tile.png',crate='props/crate.png',nets='props/nets.png',artifact='props/artifact.png',market_stall='props/market_stall.png',fountain='props/fountain.png').items():add(k,'farol/'+f)
anims=[]
for who in ['marina','lucas','julia','bia','toninho','faisca']:
 add(who,'farol/chars/'+who+'_sheet_1536.png',192,256,1.14 if who=='faisca' else 1.32,.0625)
 spec=read('src/game/data/sheets/'+who+'_sheet.json')
 for pose,a in spec['anims'].items():anims.append(dict(key=who+'.'+pose,texture=who,frames=a['frames'],fps=a['frameRate'],loop=a.get('repeat',0)==-1))
for pose in ['walk','run','jump']:
 add('marina_'+pose,'farol/chars/marina_'+pose+'_v2.png',-8,0,.66,.0625)
 for a in anims:
  if a['key']=='marina.'+pose or pose=='jump' and a['key'] in ['marina.fall','marina.land']:
   a.update(texture='marina_'+pose,frames={'marina.jump':[1,2,3],'marina.fall':[4,5],'marina.land':[6,7]}.get(a['key'],list(range(8))))
src=(ROOT/'src/game/data/AssetManifest.js').read_text()
for key,file,fw,fh in re.findall(r'\{ key: "([^"]+)", file: "([^"]+)"(?:, frame: \[(\d+), (\d+)\])?',src.split('export const F2_ASSETS = [')[1]):
 add(key,'farol/fase2/'+file,int(fw or 0),int(fh or 0),1.05 if key=='f2_lucas_sonic' else 1,.0625 if 'sprites/' in file else .5)
textures['f2s_toninho'].update(scale=.675,pivot=.5,rects=[dict(name=str(i),x=i*192+39,y=31,w=111,h=188) for i in range(6)])
parts=read('src/game/data/polvo_partes.json')
for key,section in [('f2_polvo_partes','partes'),('f2_tent_seg','segmentos'),('f2_tent_est','estados')]:
 if key in textures:
  textures[key]['rects']=[dict(name=n,x=r[0],y=r[1],w=r[2],h=r[3]) for n,r in parts[section].items()]
textures['f2_tentaculo_v']['rects']=[dict(name=str(i),x=r[0],y=r[1],w=r[2],h=r[3]) for i,r in enumerate(read('src/game/data/tentaculo_frames.json'))]
for p in (ROOT/'unity/TurmaDoFarol/Assets/Originais/farol/hq').glob('*.jpg'):add('hq_'+p.stem,'farol/hq/'+p.name)
for p in (ROOT/'unity/TurmaDoFarol/Assets/Originais/farol/ui').glob('portrait_*.png'):add(p.stem,'farol/ui/'+p.name)
for p in (ROOT/'unity/TurmaDoFarol/Assets/Originais/farol/fase2_reuse').glob('*.jpg'):add(p.stem,'farol/fase2_reuse/'+p.name)
for folder in ['hub','portais','curio','ui']:
 for p in (ROOT/'unity/TurmaDoFarol/Assets/Originais/farol/fase3'/folder).glob('*.png'):
  if p.stem.startswith('cena_') or p.stem in ['icone_concha_hud','icone_concha_dourada','carteira_hud','pergaminho_confirma','botoes_hub_sheet','hub_bg_ceu_mar','hub_bg_parede','hub_chao_mezanino','hub_lente_farol','hub_raios_luz','hub_frente_cordas','portal_vitral_rachaduras_sheet','portal_anel_energia','placa_bronze','placa_preco_dourada','placa_preco_cinza','portal_moldura','portal_vitral_fechado','portal_fase3_correntes','cadeado_concha_sheet','lucas_aparelho_explodido','vila_mapa_ilustrado','esperanca_planta','polvo_dossie','toninho_nos_sheet','carta_moldura','polaroid_moldura']:
   add(p.stem,'farol/fase3/'+folder+'/'+p.name)
if 'toninho_nos_sheet' in textures:
 p=ROOT/'unity/TurmaDoFarol'/textures['toninho_nos_sheet']['path']; w,h=struct.unpack('>II',p.read_bytes()[16:24]);fw,fh=w//4,h//3
 textures['toninho_nos_sheet']['rects']=[dict(name=str(r*4+c),x=c*fw,y=r*fh,w=fw,h=fh) for r in range(3) for c in range(4)]
portals=json.loads(subprocess.check_output(['node','--input-type=module','-e','import {PORTAIS} from "./src/game/systems/Wallet.js";console.log(JSON.stringify(PORTAIS));'],cwd=ROOT,text=True))
portals.append(dict(id='ilha',nome='Ilha das Cavernas Azuis',tipo='Fase 3',preco=0,requer='f2'))
ending=[]
bossLines=read('src/game/data/falas_hq_fase2_polvo.json')
for key,img in [('p0','cut_p0'),('curva','cut_curva'),('epilogo','cut_epilogo'),('gancho','cut_gancho')]:
 for line in bossLines.get(key,[dict(text='')]):ending.append(dict(line,img=img))
data=dict(credits=read('src/game/data/creditos.json'),portals=portals,curiosities=read('src/game/data/curiosidades.json')['itens'],bossEnding=ending,textures=list(textures.values()),animations=anims,village=read('src/game/data/fase1-vila.json'),boss=read('src/game/data/boss_polvo.json'),dialogues=read('src/game/data/falas_hq_vila_das_conchas.json'),bossDialogues=read('src/game/data/falas_hq_fase2_polvo.json'),hq=read('src/game/data/intro_hq.json'))
OUT.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(f'Exportados {len(textures)} conjuntos de imagens e {len(anims)} animacoes.')
