/** Reutiliza os desenhos originais; não modifica os PNGs de origem. */
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {PLACEHOLDER} from '../src/game/fase3/Fase3Placeholders.js';
const require=createRequire(import.meta.url);
const {createCanvas}=require(process.env.FAROL_CANVAS_MODULE||'@napi-rs/canvas');
const folder=new URL('../unity/TurmaDoFarol/Assets/Farol/DecorProcedural/',import.meta.url);
for(const [key,w,h] of [['f3_orbe_energia',84,84],['f3_caixa_marina',128,128]]){
 const canvas=createCanvas(w,h);PLACEHOLDER.image[key](canvas.getContext('2d'),w,h);
 fs.writeFileSync(new URL(`${key}.png`,folder),canvas.toBuffer('image/png'));
}
console.log('Orbe e caixa originais exportados para a cópia Unity.');
