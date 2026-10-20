# Mede a transparência dos atlas existentes; não modifica imagens.
import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'public/assets/ilha_farol/ilha_farol_animacoes_assets_06_37.json').read_text())
keys={'bia_locomotion','bia_throw','bia_secret','faisca_run','faisca_bark','crab','monkey','toninho_rope','marina_push','julia_camera','lucas_device'}
data={}
for a in m['assets']:
 if a['textureKey'] not in keys:continue
 im=Image.open(root/'public/assets/ilha_farol'/a['imageFile']).convert('RGBA')
 frames={}
 for name,f in a['atlas']['frames'].items():
  r=f['frame'];crop=im.crop((r['x'],r['y'],r['x']+r['w'],r['y']+r['h']))
  box=crop.getchannel('A').point(lambda x:255 if x>=100 else 0).getbbox()
  if not box:raise ValueError((a['textureKey'],name))
  ss=f['spriteSourceSize'];x0,y0,x1,y1=box
  frames[name]={'footX':round(ss['x']+(x0+x1)/2,2),'footY':ss['y']+y1,'height':y1-y0}
 data[a['textureKey']]={'frames':frames}
print({k:v['frames']['f000'] for k,v in data.items()})
(root/'src/game/fase3/atlas_registration.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
