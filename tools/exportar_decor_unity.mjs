/** Renderiza os desenhos provisórios originais da ilha sem modificar as artes de origem.
 * Requer @napi-rs/canvas: FAROL_CANVAS_MODULE pode apontar para o pacote instalado.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {PLACEHOLDER} from '../src/game/fase3/Fase3Placeholders.js';
const require=createRequire(import.meta.url);
const {createCanvas}=require(process.env.FAROL_CANVAS_MODULE||'@napi-rs/canvas');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const project=path.join(root,'unity/TurmaDoFarol');
const map=JSON.parse(fs.readFileSync(path.join(project,'Assets/Farol/Dados/fase3.json'),'utf8'));
const folder='Assets/Farol/DecorProcedural';fs.mkdirSync(path.join(project,folder),{recursive:true});
const rendered=new Map(),entries=[];
for(const p of map.props){
 if(p.sprite)continue;
 const special=PLACEHOLDER.prop[`${p.sector}_${p.key}`];
 const draw=special||PLACEHOLDER.prop[p.key];if(!draw)throw new Error(`Desenho original ausente: ${p.sector}/${p.key}`);
 const name=`${special?p.sector+'_':''}${p.key}_${p.w}x${p.h}`;
 const file=`${folder}/${name}.png`;
 if(!rendered.has(name)){const canvas=createCanvas(p.w,p.h);draw(canvas.getContext('2d'),p.w,p.h);fs.writeFileSync(path.join(project,file),canvas.toBuffer('image/png'));rendered.set(name,true);}
 entries.push({...p,path:file});
}
const layers=[];
for(const sector of map.sectors)for(const layer of sector.layers){
 if(layer.sprite||(layer.n===0&&layer.fallbackKey))continue;
 const spec=layer.placeholder,kind=spec.draw??layer.n;
 const name=`layer_${kind}_${spec.w}x${spec.h}`;const file=`${folder}/${name}.png`;
 if(!rendered.has(name)){const canvas=createCanvas(spec.w,spec.h);const draw=PLACEHOLDER.layer[kind]||PLACEHOLDER.layer[layer.n];if(!draw)throw new Error(`Camada ausente: ${kind}`);draw(canvas.getContext('2d'),spec.w,spec.h);fs.writeFileSync(path.join(project,file),canvas.toBuffer('image/png'));rendered.set(name,true);}
 layers.push({...layer,sector:sector.id,x0:sector.x0,x1:sector.x1,path:file});
}
fs.writeFileSync(path.join(project,folder,'decor.json'),JSON.stringify({source:'src/game/fase3/Fase3Placeholders.js',entries,layers},null,2)+'\n');
console.log(`${rendered.size} desenhos originais exportados: ${entries.length} definições de decoração e ${layers.length} camadas.`);
