// @ts-nocheck
/**
 * Carrega a arte da Fase 3 que EXISTE (pela lista public/assets/files.json) e cria provisórios para o resto.
 * Depois de soltar arte nova em public/assets/farol/fase3_ilha/, rode `node list_assets.mjs`
 * (o `npm run build` já roda sozinho) para o arquivo entrar na lista.
 */
import { SECTOR_ART, SPRITES, IMAGES, f3url } from "./Fase3Assets.js";
import { PLACEHOLDER, canvasTex, canvasSheet } from "./Fase3Placeholders.js";

let FILES;
function readFiles() {
  try {
    const x = new XMLHttpRequest();
    x.open("GET", `assets/files.json?t=${Date.now()}`, false);
    x.send();
    FILES = x.status >= 200 && x.status < 300 ? new Set(JSON.parse(x.responseText)) : new Set();
  } catch { FILES = new Set(); }
}
const has = (url) => FILES.has(url);

export const layerKey = (s, n) => `f3_${s}_L${n}`;
export const tileKey = (s, name) => `f3_${s}_t_${name}`;
export const propKey = (s, name) => `f3_${s}_p_${name}`;

/** Chamar no preload() da cena. Retorna quantos arquivos entraram na fila. */
export function preloadFase3(scene, sectors) {
  readFiles();
  let n = 0;
  const img = (key, url) => { if (!scene.textures.exists(key) && has(url)) { scene.load.image(key, url); n++; } };
  for (const s of sectors) {
    const art = SECTOR_ART[s]; if (!art) continue;
    for (const L of art.layers) img(layerKey(s, L.n), f3url(L.file, art.folder));
    for (const [name, t] of Object.entries(art.tiles)) img(tileKey(s, name), f3url(t.file, art.folder + art.tileset));
    for (const [name, p] of Object.entries(art.props || {})) img(propKey(s, name), f3url(p.file, art.folder + art.tileset));
  }
  for (const sp of Object.values(SPRITES)) {
    const url = f3url(sp.file);
    if (!scene.textures.exists(sp.key) && has(url)) { scene.load.spritesheet(sp.key, url, { frameWidth: sp.frameWidth, frameHeight: sp.frameHeight }); n++; }
  }
  for (const im of Object.values(IMAGES)) img(im.key, f3url(im.file));
  return n;
}

/** Chamar no create(): gera os provisórios que faltam e as animações. Retorna o "resolvedor" de arte. */
export function buildFase3Art(scene, sectors) {
  const info = { layers: {}, images: {}, faiscaFile: scene.textures.exists(SPRITES.faisca.key) };
  for (const s of sectors) {
    const art = SECTOR_ART[s]; if (!art) continue;
    for (const L of art.layers) {
      const key = layerKey(s, L.n);
      let file = scene.textures.exists(key);
      let useKey = key;
      if (!file && L.fallbackKey && scene.textures.exists(L.fallbackKey)) { useKey = L.fallbackKey; file = true; }
      if (!file) canvasTex(scene, key, L.placeholder.w, L.placeholder.h, PLACEHOLDER.layer[L.placeholder.draw ?? L.n] || PLACEHOLDER.layer[L.n]);
      const src = scene.textures.get(useKey).getSourceImage();
      info.layers[key] = { key: useKey, placeholder: !scene.textures.exists(key) || !FILES.has(f3url(L.file, art.folder)), w: src.width, h: src.height, y: file ? 0 : L.placeholder.y, final: file && useKey === key };
    }
    for (const [name, t] of Object.entries(art.tiles)) canvasTex(scene, tileKey(s, name), t.w, t.h, PLACEHOLDER.tile[`${s}_${name}`] || PLACEHOLDER.tile[name]);
    for (const [name, p] of Object.entries(art.props || {})) canvasTex(scene, propKey(s, name), p.w, p.h, PLACEHOLDER.prop[`${s}_${name}`] || PLACEHOLDER.prop[name]);
  }
  for (const im of Object.values(IMAGES)) {
    if (scene.textures.exists(im.key)) { info.images[im.key] = { key: im.key, scale: 1 }; continue; }
    if (im.fallbackKey && scene.textures.exists(im.fallbackKey)) { info.images[im.key] = { key: im.fallbackKey, scale: im.fallbackScale || 1 }; continue; }
    canvasTex(scene, im.key, im.w, im.h, PLACEHOLDER.image[im.key]);
    info.images[im.key] = { key: im.key, scale: 1 };
  }
  for (const sp of [SPRITES.sofia, SPRITES.toninho, SPRITES.marina, SPRITES.crab, SPRITES.monkey, SPRITES.checkpoint]) {
    if (!scene.textures.exists(sp.key)) canvasSheet(scene, sp.key, sp.frameWidth, sp.frameHeight, PLACEHOLDER.sheetCount[sp.key], 8, PLACEHOLDER.sheet[sp.key]);
    for (const [pose, a] of Object.entries(sp.anims)) {
      const k = `${sp.key}-${pose}`;
      if (!scene.anims.exists(k)) scene.anims.create({ key: k, frames: a.frames.map((frame) => ({ key: sp.key, frame })), frameRate: a.frameRate, repeat: a.repeat });
    }
  }
  // Faísca: sheet próprio da Fase 3 ou o oficial da Fase 1
  const F = SPRITES.faisca;
  info.faisca = { key: info.faiscaFile ? F.key : F.fallbackKey, anim: {} };
  for (const [pose, a] of Object.entries(F.anims)) {
    if (info.faiscaFile) {
      const k = `${F.key}-${pose}`;
      if (!scene.anims.exists(k)) scene.anims.create({ key: k, frames: a.frames.map((frame) => ({ key: F.key, frame })), frameRate: a.frameRate, repeat: a.repeat });
      info.faisca.anim[pose] = k;
    } else info.faisca.anim[pose] = `${F.fallbackKey}-${a.fallback}`;
  }
  info.img = (k) => info.images[k] || { key: k, scale: 1 };
  return info;
}
