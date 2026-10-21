/** Exporta conteúdo, sem executar Phaser ou alterar as artes de origem. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assembleLevel } from '../src/game/fase3/sectors/index.js';
import { SECTOR_ART, PACK_TILES, PACK_PROPS, PACK_IMAGES, IMAGES } from '../src/game/fase3/Fase3Assets.js';
import { ASSET_MANIFEST, F2_ASSETS } from '../src/game/data/AssetManifest.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.join(root, 'unity/TurmaDoFarol');
const art = 'Assets/Originais/';
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const write = (p, value) => { const target = path.join(dest, p); fs.mkdirSync(path.dirname(target), {recursive:true}); fs.writeFileSync(target, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n'); };
const exists = p => fs.existsSync(path.join(root, 'public/assets', p));
const sha = v => crypto.createHash('sha256').update(v).digest('hex');
const commit = execFileSync('git', ['rev-parse', 'HEAD'], {cwd:root, encoding:'utf8'}).trim();
const tracked = execFileSync('git', ['ls-files', '-z', 'public/assets'], {cwd:root}).toString().split('\0').filter(Boolean);
const inventory = [];
for (const p of tracked) {
  const bytes = fs.readFileSync(path.join(root, p));
  const rel = p.slice('public/assets/'.length);
  const target = path.join(dest, art, rel);
  fs.mkdirSync(path.dirname(target), {recursive:true}); fs.writeFileSync(target, bytes);
  inventory.push({source:p, target:art+rel, bytes:bytes.length, sha256:sha(bytes)});
}
// Os originais JavaScript ficam fora de Assets, para consulta e continuidade da portabilidade.
for (const p of execFileSync('git', ['ls-files', '-z', 'src', 'docs', 'LICENCAS.md', 'GUIA_CONTINUIDADE.md'], {cwd:root}).toString().split('\0').filter(Boolean)) {
  const target=path.join(dest,'ReferenciaPhaser',p);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,p),target);
}
const manifest = read('public/assets/ilha_farol/ilha_farol_animacoes_assets_06_37.json');
const registration = read('src/game/fase3/atlas_registration.json');
const heights = {bia_locomotion:192.7,bia_throw:192.7,bia_secret:192.7,faisca_run:95,faisca_bark:95,crab:79.92,monkey:187.68,toninho_rope:240,marina_push:215,julia_camera:215,lucas_device:162};
const sheets = [], sprites = [], animations = [];
const keys = new Map();
function single(key, file) {
  if (!exists(file)) return '';
  const id='image:'+file;
  if (!keys.has(id)) {sprites.push({id,path:art+file,name:'',multiple:false});keys.set(id,true);}
  if(key)keys.set(key,id);
  return id;
}
for (const a of manifest.assets) {
  const reg=registration[a.textureKey], scale=heights[a.textureKey] && reg?.frames?.f000?.height ? heights[a.textureKey]/reg.frames.f000.height : 1;
  const imagePath=art+'ilha_farol/'+a.imageFile;
  const rects=[];
  for(const [name,data] of Object.entries(a.atlas.frames)) {
    if(data.rotated)throw new Error('Atlas rotacionado exige conversão explícita: '+a.textureKey+'/'+name);
    const f=data.frame, trim=data.spriteSourceSize??{x:0,y:0}, size=data.sourceSize??{w:f.w,h:f.h};
    const measured=reg?.frames?.[name];
    const footX=measured?.footX??size.w*(a.registration?.origin?.x??0.5);
    const footY=measured?.footY??size.h*(a.registration?.origin?.y??0.5);
    const frame={name,x:f.x,y:a.sourceSizePx.height-f.y-f.h,w:f.w,h:f.h,pivotX:(footX-trim.x)/f.w,pivotY:1-(footY-trim.y)/f.h,guid:sha(imagePath+':'+name).slice(0,32)};
    rects.push(frame);sprites.push({id:a.textureKey+'/'+name,path:imagePath,name,multiple:true});
  }
  sheets.push({path:imagePath,pixelsPerUnit:100/scale,frames:rects});
}
for(const a of manifest.phaserAnimations.anims) {
  const frames=[];let t=0;
  for(const f of a.frames) {frames.push({sprite:f.key+'/'+f.frame,time:t});t+=(1000/a.frameRate+(f.duration||0))/1000;}
  animations.push({key:a.key,fps:a.frameRate,loop:a.repeat===-1,duration:t,frames});
}
// Folhas anteriores da HQ: a definição do próprio projeto permanece como fonte.
for (const who of ['marina','bia','julia','lucas','toninho','faisca']) {
  const file='farol/chars/'+who+'_sheet_1536.png';if(!exists(file))continue;
  const s=read('src/game/data/sheets/'+who+'_sheet.json');
  // Todas as folhas-base têm células 192x256, conforme PreloadScene e manifesto.
  const frames=[];for(let row=0;row<6;row++)for(let col=0;col<8;col++) {
    const name='f'+String(row*8+col).padStart(3,'0');
    frames.push({name,x:col*192,y:1536-(row+1)*256,w:192,h:256,pivotX:.5,pivotY:.0625,guid:sha(file+name).slice(0,32)});
    sprites.push({id:'hq_'+who+'/'+name,path:art+file,name,multiple:true});
  }
  sheets.push({path:art+file,pixelsPerUnit:100/(who==='faisca'?.52:1.32),frames});
}
for(const a of ASSET_MANIFEST)single(a.key,'farol/'+a.file);
for(const a of F2_ASSETS)single(a.key,'farol/fase2/'+a.file);
single('shell','farol/props/shell.png');
const level=assembleLevel();
const sectors=level.sectors.map(s=>({...s,layers:SECTOR_ART[s.art].layers.map(l=>({...l,sprite:single('', 'farol/fase3_ilha/'+SECTOR_ART[s.art].folder+l.file)}))}));
const tileRows=[], propRows=[];
for(const [sector, cfg] of Object.entries(SECTOR_ART)) {
  const pack=PACK_TILES[['K','O'].includes(sector)?'cave':'forest'];
  for(const [key,value] of Object.entries(cfg.tiles)) {
    const file=typeof value==='string'?value:value.file;
    const direct=single('', 'farol/fase3_ilha/'+cfg.folder+cfg.tileset+file);
    tileRows.push({sector,key,sprite:direct||(pack?.[key]?pack[key].join('/'):'')});
  }
  for(const [key,value] of Object.entries(cfg.props)) {
    const direct=single('', 'farol/fase3_ilha/'+cfg.folder+cfg.tileset+value.file);
    propRows.push({sector,key,w:value.w,h:value.h,sprite:direct||(PACK_PROPS[key]?PACK_PROPS[key].join('/'):'')});
  }
}
const exported={schema:1,sourceCommit:commit,pixelsPerUnit:100,sourceHeight:1080,length:level.length,sectors,chunks:level.chunks,tiles:tileRows,props:propRows};
write('Assets/Farol/Dados/fase3.json',exported);
write('Assets/Farol/Dados/fase1.json',read('src/game/data/fase1-vila.json'));
write('Assets/Farol/Dados/boss.json',read('src/game/data/boss_polvo.json'));
write('Assets/Farol/Dados/catalogo.json',{sheets,sprites,animations,images:[...keys].filter(([k,v])=>typeof v==='string').map(([key,sprite])=>({key,sprite}))});
write('Assets/Farol/Dados/eventos_animacao.json',manifest.animationEvents);
write('Assets/Farol/Dados/atlas_origem.json',fs.readFileSync(path.join(root,'public/assets/ilha_farol/ilha_farol_animacoes_assets_06_37.json'),'utf8'));
write('MIGRACAO_MANIFESTO.json',{schema:1,sourceRepository:'ffagmarcos-ops/turma-do-farol-game',sourceCommit:commit,sourceTree:execFileSync('git',['rev-parse','HEAD^{tree}'],{cwd:root,encoding:'utf8'}).trim(),assetCount:inventory.length,bytes:inventory.reduce((s,a)=>s+a.bytes,0),sectors:sectors.length,chunks:level.chunks.length,animations:animations.length,files:inventory});
write('LICENCAS_ORIGINAIS.md',fs.readFileSync(path.join(root,'LICENCAS.md'),'utf8'));
console.log(JSON.stringify({project:dest,assets:inventory.length,bytes:inventory.reduce((s,a)=>s+a.bytes,0),sectors:sectors.length,chunks:level.chunks.length,animations:animations.length,sourceCommit:commit}));
