// @ts-nocheck
/**
 * FASE 3 — MANIFESTO ÚNICO DE ARTE (troque a arte só aqui).
 *
 * Todos os arquivos ficam em public/assets/farol/fase3_ilha/ (ver docs/fase3/ASSETS_FASE3.md).
 * Regra: se o arquivo existir (listado em public/assets/files.json → rode `node list_assets.mjs`
 * depois de soltar a arte), o jogo usa o arquivo; se não existir, desenha um PROVISÓRIO
 * (Fase3Placeholders.js) com a MESMA chave e os MESMOS índices de quadro.
 * Assim, trocar a arte = soltar o PNG com o nome certo (e, se a grade mudar, ajustar frameWidth/
 * frameHeight/anims aqui). Nenhum outro arquivo de código precisa mudar.
 */
export const F3_ROOT = "assets/farol/fase3_ilha/";

/**
 * Cenário por setor. Camadas de parallax (1080 px de altura, repetem na horizontal).
 * factor = quanto a camada anda em relação à câmera (0 = parada, 1 = junto com o jogo).
 * A camada 4 (jogável) NÃO é imagem: é montada com os tiles de 128 px do tileset do setor.
 * placeholder = tamanho/posição do provisório desenhado em código (a arte final usa y = 0, 1080 de altura).
 */
export const SECTOR_ART = {
  A: {
    folder: "setorA/",
    tileset: "tileset_praia/",
    layers: [
      { n: 0, file: "cenarioA_0_ceu.png", factor: 0.0, transparent: false, placeholder: { w: 512, h: 1080, y: 0 }, fallbackKey: "bg_sky" },
      { n: 1, file: "cenarioA_1_ilhas.png", factor: 0.07, transparent: true, placeholder: { w: 2048, h: 320, y: 395 } },
      { n: 2, file: "cenarioA_2_oceano.png", factor: 0.2, transparent: true, placeholder: { w: 1024, h: 380, y: 695 }, animatedWater: true },
      { n: 3, file: "cenarioA_3_arvores.png", factor: 0.42, transparent: true, placeholder: { w: 2048, h: 720, y: 250 } },
      { n: 5, file: "cenarioA_5_folhagem.png", factor: 1.15, transparent: true, placeholder: { w: 1024, h: 280, y: 860 } },
      { n: 6, file: "cenarioA_6_folhas_desfocadas.png", factor: 1.38, transparent: true, placeholder: { w: 1024, h: 1080, y: 0 }, alpha: 0.85 },
    ],
    // tiles soltos de 128 px (chão = 128x128; plataformas = 128x64). surfaceY = linha onde o pé pisa (px do topo do tile)
    tiles: {
      sand_top: { file: "areia_topo.png", w: 128, h: 128, surfaceY: 12 },
      sand_fill: { file: "areia_meio.png", w: 128, h: 128 },
      rock_top: { file: "rocha_topo.png", w: 128, h: 128, surfaceY: 8 },
      rock_fill: { file: "rocha_meio.png", w: 128, h: 128 },
      log: { file: "plataforma_tronco.png", w: 128, h: 64, surfaceY: 6 },
      ledge: { file: "plataforma_pedra.png", w: 128, h: 64, surfaceY: 6 },
      crumble: { file: "plataforma_pedra_instavel.png", w: 128, h: 64, surfaceY: 6 },
    },
    // objetos de cenário soltos (sem colisão), também na pasta do tileset
    props: {
      palm: { file: "palmeira.png", w: 360, h: 620 },
      bush: { file: "arbusto.png", w: 260, h: 160 },
      driftwood: { file: "tronco_praia.png", w: 300, h: 110 },
      starfish: { file: "estrela_do_mar.png", w: 64, h: 64 },
      pebbles: { file: "pedrinhas.png", w: 180, h: 70 },
      sign_end: { file: "placa_continua.png", w: 200, h: 220 },
    },
  },
  B: {
    folder: "setorB/",
    tileset: "tileset_costao/",
    layers: [
      { n: 0, file: "cenarioB_0_ceu.png", factor: 0.0, transparent: false, placeholder: { w: 512, h: 1080, y: 0, draw: 0 }, fallbackKey: "bg_sky" },
      { n: 1, file: "cenarioB_1_ilhas.png", factor: 0.07, transparent: true, placeholder: { w: 2048, h: 320, y: 395, draw: 1 } },
      { n: 2, file: "cenarioB_2_oceano.png", factor: 0.2, transparent: true, placeholder: { w: 1024, h: 380, y: 695, draw: 2 }, animatedWater: true },
      { n: 3, file: "cenarioB_3_costao.png", factor: 0.42, transparent: true, placeholder: { w: 2048, h: 760, y: 210, draw: "B3" } },
      { n: 5, file: "cenarioB_5_rochas.png", factor: 1.15, transparent: true, placeholder: { w: 1024, h: 280, y: 860, draw: "B5" } },
      { n: 6, file: "cenarioB_6_folhas_desfocadas.png", factor: 1.38, transparent: true, placeholder: { w: 1024, h: 1080, y: 0, draw: 6 }, alpha: 0.85 },
    ],
    tiles: {
      sand_top: { file: "areia_molhada_topo.png", w: 128, h: 128, surfaceY: 12 },
      sand_fill: { file: "areia_molhada_meio.png", w: 128, h: 128 },
      rock_top: { file: "rocha_molhada_topo.png", w: 128, h: 128, surfaceY: 8 },
      rock_fill: { file: "rocha_molhada_meio.png", w: 128, h: 128 },
      log: { file: "plataforma_tronco.png", w: 128, h: 64, surfaceY: 6 },
      ledge: { file: "plataforma_pedra_molhada.png", w: 128, h: 64, surfaceY: 6 },
      crumble: { file: "plataforma_pedra_instavel.png", w: 128, h: 64, surfaceY: 6 },
    },
    props: {
      palm: { file: "palmeira.png", w: 360, h: 620 },
      bush: { file: "arbusto_costao.png", w: 260, h: 160 },
      boulder: { file: "pedra_costao.png", w: 240, h: 180 },
      moss_rock: { file: "pedra_musgo.png", w: 180, h: 110 },
      pebbles: { file: "pedrinhas.png", w: 180, h: 70 },
      starfish: { file: "estrela_do_mar.png", w: 64, h: 64 },
      sign_end: { file: "placa_continua.png", w: 200, h: 220 },
    },
  },
};

/**
 * Personagens e efeitos (spritesheets em grade; quadros contados da esquerda p/ direita, linha a linha).
 * origin = pivô nos pés. body = hitbox em px do QUADRO (antes da escala).
 */
export const SPRITES = {
  sofia: {
    key: "f3_sofia", file: "chars/sofia_sheet.png", frameWidth: 192, frameHeight: 256, scale: 1.05,
    origin: [0.5, 0.9375],
    body: { stand: [80, 196, 56, 44], crouch: [80, 108, 56, 132] }, // [w, h, offX, offY]
    anims: {
      idle: { frames: [0, 1], frameRate: 3, repeat: -1 },
      walk: { frames: [2, 3, 4, 5], frameRate: 9, repeat: -1 },
      run: { frames: [6, 7, 8, 9], frameRate: 13, repeat: -1 },
      jump: { frames: [10], frameRate: 8, repeat: 0 },
      fall: { frames: [11], frameRate: 8, repeat: 0 },
      land: { frames: [12], frameRate: 10, repeat: 0 },
      crouch: { frames: [13], frameRate: 6, repeat: 0 },
      crawl: { frames: [13, 14], frameRate: 6, repeat: -1 },
      throw: { frames: [15], frameRate: 10, repeat: 0 },
      hurt: { frames: [16], frameRate: 8, repeat: 0 },
      point: { frames: [17], frameRate: 8, repeat: 0 },
      cheer: { frames: [18, 19], frameRate: 6, repeat: -1 },
      look: { frames: [20], frameRate: 6, repeat: 0 },
    },
  },
  // Faísca: usa o sheet oficial da Fase 1 (chave "faisca", anims faisca-*) se não houver um próprio da Fase 3.
  faisca: {
    key: "f3_faisca", file: "chars/faisca_f3_sheet.png", frameWidth: 192, frameHeight: 256, scale: 1.15, // no sheet da Fase 1 o cão ocupa ~70x72 px do quadro
    origin: [0.5, 0.9375], body: [64, 56, 64, 184],
    fallbackKey: "faisca", // sheet da Fase 1 (public/assets/farol/chars/faisca_sheet_1536.png)
    // nome da pose na Fase 3 → anim (no sheet próprio: quadros; no fallback: anim existente "faisca-<pose>")
    anims: {
      idle: { frames: [0, 1, 2, 3], frameRate: 6, repeat: -1, fallback: "idle" },
      walk: { frames: [8, 9, 10, 11, 12, 13, 14, 15], frameRate: 10, repeat: -1, fallback: "walk" },
      run: { frames: [16, 17, 18, 19, 20, 21, 22, 23], frameRate: 14, repeat: -1, fallback: "run" },
      jump: { frames: [24, 25, 26], frameRate: 12, repeat: 0, fallback: "jump" },
      fall: { frames: [27, 28], frameRate: 8, repeat: 0, fallback: "fall" },
      sniff: { frames: [32, 33], frameRate: 4, repeat: -1, fallback: "crouch" },
      bark: { frames: [40, 41], frameRate: 8, repeat: -1, fallback: "interact" },
      attack: { frames: [32, 33], frameRate: 8, repeat: -1, fallback: "crouch" },
    },
  },
  crab: {
    key: "f3_caranguejo", file: "inimigos/caranguejo_sheet.png", frameWidth: 160, frameHeight: 128, scale: 0.85,
    origin: [0.5, 0.92], body: [110, 80, 25, 38],
    anims: {
      idle: { frames: [0, 1], frameRate: 3, repeat: -1 },
      walk: { frames: [2, 3], frameRate: 8, repeat: -1 },
      raise: { frames: [4, 5], frameRate: 8, repeat: -1 },
      attack: { frames: [6], frameRate: 8, repeat: 0 },
      hurt: { frames: [7], frameRate: 8, repeat: 0 },
      defeat: { frames: [8], frameRate: 8, repeat: 0 },
    },
  },
  checkpoint: {
    key: "f3_checkpoint", file: "props/checkpoint_sheet.png", frameWidth: 128, frameHeight: 224, scale: 0.9,
    origin: [0.5, 1],
    anims: { off: { frames: [0], frameRate: 1, repeat: 0 }, on: { frames: [1, 2], frameRate: 4, repeat: -1 } },
  },
};

/** Imagens soltas (um quadro). */
export const IMAGES = {
  shell_projectile: { key: "f3_concha_projetil", file: "props/concha_projetil.png", w: 64, h: 64, fallbackKey: "shell", fallbackScale: 0.2 },
  shell_pickup: { key: "f3_concha", file: "props/concha_coletavel.png", w: 96, h: 96, fallbackKey: "shell", fallbackScale: 0.18 },
  bark_wave: { key: "f3_onda_latido", file: "fx/onda_latido.png", w: 256, h: 512 },
  spark: { key: "f3_brilho", file: "fx/brilho_agua.png", w: 32, h: 32 },
  foam: { key: "f3_espuma", file: "fx/espuma.png", w: 32, h: 32 },
  puff: { key: "f3_poeira", file: "fx/poeira.png", w: 64, h: 64 },
  wave_crest: { key: "f3_crista_onda", file: "fx/crista_onda.png", w: 512, h: 96 },
  alert: { key: "f3_alerta", file: "fx/alerta.png", w: 48, h: 64 },
};

/** Som (reaproveita a Fase 1; músicas novas da Fase 3 ainda a produzir). */
export const F3_AUDIO = {
  music: "assets/audio/music_vila.mp3", // PROVISÓRIO até a trilha "Praia/Mistério" da Fase 3
};

/** URL relativo de um arquivo do manifesto. */
export const f3url = (file, folder = "") => `${F3_ROOT}${folder}${file}`;
