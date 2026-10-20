import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AnimationEvents } from '../src/game/fase3/AnimationEvents.js';
import { PACK_TILES, PACK_PROPS, PACK_IMAGES } from '../src/game/fase3/Fase3Assets.js';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('public/assets/ilha_farol/ilha_farol_animacoes_assets_06_37.json',root),'utf8'));
const registered=JSON.parse(readFileSync(new URL('src/game/fase3/atlas_registration.json',root),'utf8'));
const assets=new Map(manifest.assets.map(a=>[a.textureKey,a]));
const animations=new Map(manifest.phaserAnimations.anims.map(a=>[a.key,a]));

test('pacote completo: imagens existem e todo quadro de animação pertence ao atlas',()=>{
 assert.equal(assets.size,32);assert.equal(animations.size,69);
 for(const a of assets.values())assert.ok(existsSync(fileURLToPath(new URL('public/assets/ilha_farol/'+a.imageFile,root))),a.imageFile);
 for(const a of animations.values())for(const f of a.frames)assert.ok(assets.get(f.key)?.atlas.frames[f.frame],a.key+'/'+f.frame);
});

test('eventos cabem na duração da animação e disparam uma única vez com delta grande',()=>{
 for(const [key,a] of animations){
  const expected=manifest.animationEvents.filter(e=>e.animationKey===key).sort((x,y)=>x.atMs-y.atMs);
  if(!expected.length)continue;
  for(const e of expected)assert.ok(e.atMs>=0&&e.atMs<=a.duration,key);
  const fired=[];const clock=new AnimationEvents(manifest,e=>fired.push(e));
  clock.start(key);clock.advance(a.duration+1);clock.advance(a.duration+1);
  assert.deepEqual(fired,expected,key);
 }
});

test('recortes medidos ficam dentro dos PNGs e têm pontos de apoio válidos',()=>{
 for(const [key,data] of Object.entries(registered)){
  const a=assets.get(key);assert.ok(a,key);
  for(const [name,point] of Object.entries(data.frames)){
   const f=a.atlas.frames[name], [x,y,w,h]=point.crop;
   assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=f.frame.w&&y+h<=f.frame.h,key+'/'+name);
   assert.ok(point.footX>=0&&point.footX<=f.sourceSize.w&&point.footY<=f.sourceSize.h,key+'/'+name);
  }
 }
});

test('mapeamentos dos terrenos, objetos e efeitos apontam para recortes existentes',()=>{
 for(const source of [...Object.values(PACK_TILES.forest),...Object.values(PACK_TILES.cave),...Object.values(PACK_PROPS),...Object.values(PACK_IMAGES)]){
  const [key,frame]=source;assert.ok(assets.get(key)?.atlas.frames[frame],source.join('/'));
  assert.ok(registered[key]?.frames[frame]?.crop,source.join('/'));
 }
});
