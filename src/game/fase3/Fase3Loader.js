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

let ILHA_FAROL_MANIFEST = null;
function readIlhaFarolManifest() {
  if (ILHA_FAROL_MANIFEST) return ILHA_FAROL_MANIFEST;
  try {
    const x = new XMLHttpRequest();
    x.open("GET", `assets/ilha_farol/ilha_farol_animacoes_assets_06_37.json?t=${Date.now()}`, false);
    x.send();
    if (x.status >= 200 && x.status < 300) {
      ILHA_FAROL_MANIFEST = JSON.parse(x.responseText);
    }
  } catch {
    ILHA_FAROL_MANIFEST = null;
  }
  return ILHA_FAROL_MANIFEST;
}

export const layerKey = (s, n) => `f3_${s}_L${n}`;
export const tileKey = (s, name) => `f3_${s}_t_${name}`;
export const propKey = (s, name) => `f3_${s}_p_${name}`;

/** Chamar no preload() da cena. Retorna quantos arquivos entraram na fila. */
export function preloadFase3(scene, sectors) {
  readFiles();
  let n = 0;
  const img = (key, url) => { if (!scene.textures.exists(key) && has(url)) { scene.load.image(key, url); n++; } };

  // 1. Pacote de arte e animações da Ilha do Farol (32 assets com atlas embutido)
  const ifm = readIlhaFarolManifest();
  if (ifm) {
    if (!scene.cache.json.exists("ilha_farol_manifest")) {
      scene.cache.json.add("ilha_farol_manifest", ifm);
    }
    const basePath = ifm.integration?.assetBasePath || "assets/ilha_farol/";
    for (const a of ifm.assets || []) {
      const url = basePath + a.imageFile;
      if (!scene.textures.exists(a.textureKey) && (has(url) || true)) {
        scene.load.atlas(a.textureKey, url, a.atlas);
        n++;
      }
    }
  }

  // 2. Camadas de cenário e tiles da Fase 3
  for (const s of sectors) {
    const art = SECTOR_ART[s]; if (!art) continue;
    for (const L of art.layers) img(layerKey(s, L.n), f3url(L.file, art.folder));
    for (const [name, t] of Object.entries(art.tiles)) img(tileKey(s, name), f3url(t.file, art.folder + art.tileset));
    for (const [name, p] of Object.entries(art.props || {})) img(propKey(s, name), f3url(p.file, art.folder + art.tileset));
  }
  // 3. Sprites legados e imagens
  for (const sp of Object.values(SPRITES)) {
    const url = f3url(sp.file);
    if (!scene.textures.exists(sp.key) && has(url)) { scene.load.spritesheet(sp.key, url, { frameWidth: sp.frameWidth, frameHeight: sp.frameHeight }); n++; }
  }
  for (const im of Object.values(IMAGES)) img(im.key, f3url(im.file));
  return n;
}

/** Chamar no create(): gera os provisórios que faltam e as animações. Retorna o "resolvedor" de arte. */
export function buildFase3Art(scene, sectors) {
  // Registra as animações do pacote ilha_farol
  const ifm = scene.cache.json.get("ilha_farol_manifest") || readIlhaFarolManifest();
  if (ifm && ifm.phaserAnimations?.anims) {
    for (const config of ifm.phaserAnimations.anims) {
      if (!scene.anims.exists(config.key)) {
        scene.anims.create(config);
      }
    }
  }

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
  // Sprites provisórios para o que não estiver carregado
  for (const sp of [SPRITES.sofia, SPRITES.toninho, SPRITES.marina, SPRITES.julia, SPRITES.lucas, SPRITES.crab, SPRITES.monkey, SPRITES.checkpoint]) {
    if (!scene.textures.exists(sp.key)) canvasSheet(scene, sp.key, sp.frameWidth, sp.frameHeight, PLACEHOLDER.sheetCount[sp.key], 8, PLACEHOLDER.sheet[sp.key]);
    for (const [pose, a] of Object.entries(sp.anims)) {
      const k = `${sp.key}-${pose}`;
      if (!scene.anims.exists(k)) scene.anims.create({ key: k, frames: a.frames.map((frame) => ({ key: sp.key, frame })), frameRate: a.frameRate, repeat: a.repeat });
    }
  }
  // Faísca: prioriza o atlas faisca_run / faisca_bark da Ilha do Farol; fallback p/ sheet f3_faisca ou Fase 1
  const F = SPRITES.faisca;
  const hasAtlasFaisca = scene.textures.exists("faisca_run");
  if (hasAtlasFaisca) {
    info.faisca = {
      key: "faisca_run",
      scale: 0.52,
      origin: [0.5, 0.94],
      body: [90, 70, 45, 120],
      anim: {
        idle: "faisca.idle",
        walk: "faisca.run",
        run: "faisca.run",
        jump: "faisca.jump_placeholder",
        fall: "faisca.jump_placeholder",
        sniff: "faisca.idle",
        bark: "faisca.bark",
        attack: "faisca.charge",
      },
    };
  } else {
    info.faisca = { key: info.faiscaFile ? F.key : F.fallbackKey, anim: {} };
    for (const [pose, a] of Object.entries(F.anims)) {
      if (info.faiscaFile) {
        const k = `${F.key}-${pose}`;
        if (!scene.anims.exists(k)) scene.anims.create({ key: k, frames: a.frames.map((frame) => ({ key: F.key, frame })), frameRate: a.frameRate, repeat: a.repeat });
        info.faisca.anim[pose] = k;
      } else info.faisca.anim[pose] = `${F.fallbackKey}-${a.fallback}`;
    }
  }

  // Mapeamentos para efeitos e projéteis da ilha
  if (scene.textures.exists("shell_projectile")) {
    info.images["f3_concha_projetil"] = { key: "shell_projectile", frame: "f000", scale: 0.65 };
  }
  if (scene.textures.exists("stone_projectile")) {
    info.images["f3_pedra_macaco"] = { key: "stone_projectile", frame: "f000", scale: 0.65 };
  }
  if (scene.textures.exists("bark_wave")) {
    info.images["f3_onda_latido"] = { key: "bark_wave", frame: "f000", scale: 0.5 };
  }
  if (scene.textures.exists("checkpoint")) {
    if (!scene.anims.exists("f3_checkpoint-off")) {
      scene.anims.create({ key: "f3_checkpoint-off", frames: [{ key: "checkpoint", frame: "f000" }], frameRate: 1, repeat: 0 });
    }
    if (!scene.anims.exists("f3_checkpoint-on")) {
      scene.anims.create({ key: "f3_checkpoint-on", frames: [{ key: "checkpoint", frame: "f001" }], frameRate: 1, repeat: 0 });
    }
  }

  info.img = (k) => info.images[k] || { key: k, scale: 1 };
  return info;
}
