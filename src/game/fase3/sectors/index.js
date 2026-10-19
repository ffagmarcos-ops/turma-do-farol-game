// @ts-nocheck
/**
 * Lista de setores da Fase 3 (O Mistério da Ilha do Farol: praia → floresta → cachoeira → ruínas → caverna).
 * Para adicionar um setor: crie sectors/setorB.js no mesmo formato do setorA.js (x local começando em 0),
 * importe aqui e troque o `data: null` dele. O assembleLevel() encaixa os setores em sequência (offset de x).
 */
import { SETOR_A } from "./setorA.js";
import { SETOR_B } from "./setorB.js";
import { SETOR_C } from "./setorC.js";
import { SETOR_D } from "./setorD.js";
import { SETOR_E } from "./setorE.js";
import { SETOR_F } from "./setorF.js";
import { SETOR_G } from "./setorG.js";
import { SETOR_H } from "./setorH.js";
import { SETOR_I } from "./setorI.js";
import { SETOR_J } from "./setorJ.js";
import { SETOR_K } from "./setorK.js";
import { SETOR_L } from "./setorL.js";
import { SETOR_M } from "./setorM.js";
import { SETOR_N } from "./setorN.js";
import { SETOR_O } from "./setorO.js";

export const SECTORS = [
  { id: "A", name: "Praia da Chegada", gameplay: "tutorial + caranguejos", data: SETOR_A },
  { id: "B", name: "Costão Rochoso", gameplay: "saltos e pedras", data: SETOR_B },
  { id: "C", name: "Floresta Inicial", gameplay: "macacos", data: SETOR_C },
  { id: "D", name: "Seu Toninho", gameplay: "corda", data: SETOR_D },
  { id: "E", name: "Mata Densa", gameplay: "combate + plataforma", data: SETOR_E },
  { id: "F", name: "Marina", gameplay: "plataforma móvel (caixa)", data: SETOR_F },
  { id: "G", name: "Desfiladeiro", gameplay: "verticalidade", data: SETOR_G },
  { id: "H", name: "Júlia", gameplay: "flashes e macacos", data: SETOR_H },
  { id: "I", name: "Riacho / Lucas", gameplay: "plataformas na água", data: SETOR_I },
  { id: "J", name: "Cachoeira", gameplay: "exploração", data: SETOR_J },
  { id: "K", name: "Gruta Secreta", gameplay: "opcional", data: SETOR_K },
  { id: "L", name: "Bia", gameplay: "rota secreta", data: SETOR_L },
  { id: "M", name: "Copas Altas", gameplay: "desafio maior", data: SETOR_M },
  { id: "N", name: "Ruínas", gameplay: "exploração / mistério", data: SETOR_N },
  { id: "O", name: "Entrada da Caverna", gameplay: "encerramento", data: SETOR_O },
];

const XKEYS = ["x", "x0", "x1", "minX", "maxX", "sniffX", "toninhoX", "ropeX", "crateStartX", "crateTargetX", "pathX", "reunionX", "juliaX", "lucasX", "biaX", "celebrateX"];
function shift(o, dx) {
  if (Array.isArray(o)) return o.map((v) => shift(v, dx));
  if (!o || typeof o !== "object") return o;
  const out = {};
  for (const [k, v] of Object.entries(o)) out[k] = XKEYS.includes(k) && typeof v === "number" ? v + dx : shift(v, dx);
  return out;
}

/** Junta os setores prontos numa panorâmica única. */
export function assembleLevel() {
  let x = 0;
  const chunks = [], sectors = [];
  for (const s of SECTORS) {
    if (!s.data) continue;
    sectors.push({ id: s.id, name: s.name, x0: x, x1: x + s.data.length, art: s.data.art, groundY: s.data.groundY });
    for (const c of s.data.chunks) chunks.push({ ...shift(c, x), sector: s.id, art: s.data.art });
    x += s.data.length;
  }
  return { length: x, chunks, sectors };
}
