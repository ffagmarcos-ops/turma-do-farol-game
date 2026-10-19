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
  C: {
    folder: "setorC/",
    tileset: "tileset_floresta/",
    layers: [
      { n: 0, file: "cenarioC_0_ceu.png", factor: 0.0, transparent: false, placeholder: { w: 512, h: 1080, y: 0, draw: 0 }, fallbackKey: "bg_sky" },
      { n: 1, file: "cenarioC_1_ilhas.png", factor: 0.07, transparent: true, placeholder: { w: 2048, h: 320, y: 395, draw: 1 } },
      { n: 2, file: "cenarioC_2_oceano.png", factor: 0.2, transparent: true, placeholder: { w: 1024, h: 380, y: 695, draw: 2 }, animatedWater: true },
      { n: 3, file: "cenarioC_3_floresta.png", factor: 0.42, transparent: true, placeholder: { w: 2048, h: 860, y: 110, draw: "C3" } },
      { n: 5, file: "cenarioC_5_folhagem.png", factor: 1.15, transparent: true, placeholder: { w: 1024, h: 280, y: 860, draw: "C5" } },
      { n: 6, file: "cenarioC_6_folhas_desfocadas.png", factor: 1.38, transparent: true, placeholder: { w: 1024, h: 1080, y: 0, draw: 6 }, alpha: 0.85 },
    ],
    tiles: {
      sand_top: { file: "terra_grama_topo.png", w: 128, h: 128, surfaceY: 12 },
      sand_fill: { file: "terra_meio.png", w: 128, h: 128 },
      rock_top: { file: "rocha_musgo_topo.png", w: 128, h: 128, surfaceY: 8 },
      rock_fill: { file: "rocha_musgo_meio.png", w: 128, h: 128 },
      log: { file: "plataforma_galho.png", w: 128, h: 64, surfaceY: 6 },
      ledge: { file: "plataforma_pedra_musgo.png", w: 128, h: 64, surfaceY: 6 },
      crumble: { file: "plataforma_pedra_instavel.png", w: 128, h: 64, surfaceY: 6 },
    },
    props: {
      tree: { file: "arvore_floresta.png", w: 420, h: 720 },
      palm: { file: "palmeira.png", w: 360, h: 620 },
      bush: { file: "arbusto_floresta.png", w: 260, h: 160 },
      fern: { file: "samambaia.png", w: 220, h: 140 },
      roots: { file: "raizes.png", w: 280, h: 130 },
      moss_rock: { file: "pedra_musgo.png", w: 180, h: 110 },
      pebbles: { file: "pedrinhas.png", w: 180, h: 70 },
      sign_end: { file: "placa_continua.png", w: 200, h: 220 },
    },
  },
  D: {
    folder: "setorD/",
    tileset: "tileset_encosta/",
    layers: [
      { n: 0, file: "cenarioD_0_ceu.png", factor: 0.0, transparent: false, placeholder: { w: 512, h: 1080, y: 0, draw: 0 }, fallbackKey: "bg_sky" },
      { n: 1, file: "cenarioD_1_ilhas.png", factor: 0.07, transparent: true, placeholder: { w: 2048, h: 320, y: 395, draw: 1 } },
      { n: 2, file: "cenarioD_2_oceano.png", factor: 0.2, transparent: true, placeholder: { w: 1024, h: 380, y: 695, draw: 2 }, animatedWater: true },
      { n: 3, file: "cenarioD_3_encosta.png", factor: 0.42, transparent: true, placeholder: { w: 2048, h: 860, y: 110, draw: "C3" } },
      { n: 5, file: "cenarioD_5_folhagem.png", factor: 1.15, transparent: true, placeholder: { w: 1024, h: 280, y: 860, draw: "C5" } },
      { n: 6, file: "cenarioD_6_folhas_desfocadas.png", factor: 1.38, transparent: true, placeholder: { w: 1024, h: 1080, y: 0, draw: 6 }, alpha: 0.85 },
    ],
    tiles: {
      sand_top: { file: "terra_grama_topo.png", w: 128, h: 128, surfaceY: 12 },
      sand_fill: { file: "terra_meio.png", w: 128, h: 128 },
      rock_top: { file: "rocha_encosta_topo.png", w: 128, h: 128, surfaceY: 8 },
      rock_fill: { file: "rocha_encosta_meio.png", w: 128, h: 128 },
      log: { file: "plataforma_galho.png", w: 128, h: 64, surfaceY: 6 },
      ledge: { file: "plataforma_pedra_musgo.png", w: 128, h: 64, surfaceY: 6 },
      crumble: { file: "plataforma_pedra_instavel.png", w: 128, h: 64, surfaceY: 6 },
    },
    props: {
      tree: { file: "arvore_floresta.png", w: 420, h: 720 },
      bush: { file: "arbusto_floresta.png", w: 260, h: 160 },
      fern: { file: "samambaia.png", w: 220, h: 140 },
      roots: { file: "raizes.png", w: 280, h: 130 },
      boulder: { file: "pedra_costao.png", w: 240, h: 180 },
      moss_rock: { file: "pedra_musgo.png", w: 180, h: 110 },
      pebbles: { file: "pedrinhas.png", w: 180, h: 70 },
      sign_end: { file: "placa_continua.png", w: 200, h: 220 },
    },
  },
  E: {
    folder: "setorE/",
    tileset: "tileset_mata_densa/",
    layers: [
      { n: 0, file: "cenarioE_0_ceu.png", factor: 0.0, transparent: false, placeholder: { w: 512, h: 1080, y: 0, draw: 0 }, fallbackKey: "bg_sky" },
      { n: 1, file: "cenarioE_1_ilhas.png", factor: 0.07, transparent: true, placeholder: { w: 2048, h: 320, y: 395, draw: 1 } },
      { n: 2, file: "cenarioE_2_oceano.png", factor: 0.2, transparent: true, placeholder: { w: 1024, h: 380, y: 695, draw: 2 }, animatedWater: true },
      { n: 3, file: "cenarioE_3_mata_densa.png", factor: 0.42, transparent: true, placeholder: { w: 2048, h: 900, y: 70, draw: "E3" } },
      { n: 5, file: "cenarioE_5_folhagem.png", factor: 1.15, transparent: true, placeholder: { w: 1024, h: 280, y: 860, draw: "C5" } },
      { n: 6, file: "cenarioE_6_folhas_desfocadas.png", factor: 1.38, transparent: true, placeholder: { w: 1024, h: 1080, y: 0, draw: 6 }, alpha: 0.85 },
    ],
    tiles: {
      sand_top: { file: "terra_densa_topo.png", w: 128, h: 128, surfaceY: 12 },
      sand_fill: { file: "terra_densa_meio.png", w: 128, h: 128 },
      rock_top: { file: "rocha_musgo_topo.png", w: 128, h: 128, surfaceY: 8 },
      rock_fill: { file: "rocha_musgo_meio.png", w: 128, h: 128 },
      log: { file: "plataforma_galho.png", w: 128, h: 64, surfaceY: 6 },
      ledge: { file: "plataforma_pedra_musgo.png", w: 128, h: 64, surfaceY: 6 },
      crumble: { file: "plataforma_pedra_instavel.png", w: 128, h: 64, surfaceY: 6 },
    },
    props: {
      tree: { file: "arvore_floresta.png", w: 420, h: 720 },
      bush: { file: "arbusto_floresta.png", w: 260, h: 160 },
      fern: { file: "samambaia.png", w: 220, h: 140 },
      roots: { file: "raizes.png", w: 280, h: 130 },
      vine: { file: "cipo_pendente.png", w: 120, h: 380 },
      hollow_log: { file: "tronco_oco.png", w: 384, h: 160 },
      boulder: { file: "pedra_costao.png", w: 240, h: 180 },
      moss_rock: { file: "pedra_musgo.png", w: 180, h: 110 },
      pebbles: { file: "pedrinhas.png", w: 180, h: 70 },
      sign_end: { file: "placa_continua.png", w: 200, h: 220 },
    },
  },
  F: {
    folder: "setorF/",
    tileset: "tileset_clareira_marina/",
    layers: [
      { n: 0, file: "cenarioF_0_ceu.png", factor: 0.0, transparent: false, placeholder: { w: 512, h: 1080, y: 0, draw: 0 }, fallbackKey: "bg_sky" },
      { n: 1, file: "cenarioF_1_ilhas.png", factor: 0.07, transparent: true, placeholder: { w: 2048, h: 320, y: 395, draw: 1 } },
      { n: 2, file: "cenarioF_2_oceano.png", factor: 0.2, transparent: true, placeholder: { w: 1024, h: 380, y: 695, draw: 2 }, animatedWater: true },
      { n: 3, file: "cenarioF_3_clareira.png", factor: 0.42, transparent: true, placeholder: { w: 2048, h: 900, y: 70, draw: "E3" } },
      { n: 5, file: "cenarioF_5_folhagem.png", factor: 1.15, transparent: true, placeholder: { w: 1024, h: 280, y: 860, draw: "C5" } },
      { n: 6, file: "cenarioF_6_folhas_desfocadas.png", factor: 1.38, transparent: true, placeholder: { w: 1024, h: 1080, y: 0, draw: 6 }, alpha: 0.85 },
    ],
    tiles: {
      sand_top: { file: "terra_densa_topo.png", w: 128, h: 128, surfaceY: 12 },
      sand_fill: { file: "terra_densa_meio.png", w: 128, h: 128 },
      rock_top: { file: "rocha_musgo_topo.png", w: 128, h: 128, surfaceY: 8 },
      rock_fill: { file: "rocha_musgo_meio.png", w: 128, h: 128 },
      log: { file: "plataforma_galho.png", w: 128, h: 64, surfaceY: 6 },
      ledge: { file: "plataforma_pedra_musgo.png", w: 128, h: 64, surfaceY: 6 },
      crumble: { file: "plataforma_pedra_instavel.png", w: 128, h: 64, surfaceY: 6 },
    },
    props: {
      tree: { file: "arvore_floresta.png", w: 420, h: 720 },
      bush: { file: "arbusto_floresta.png", w: 260, h: 160 },
      fern: { file: "samambaia.png", w: 220, h: 140 },
      roots: { file: "raizes.png", w: 280, h: 130 },
      vine: { file: "cipo_pendente.png", w: 120, h: 380 },
      hollow_log: { file: "tronco_oco.png", w: 384, h: 160 },
      boulder: { file: "pedra_costao.png", w: 240, h: 180 },
      moss_rock: { file: "pedra_musgo.png", w: 180, h: 110 },
      pebbles: { file: "pedrinhas.png", w: 180, h: 70 },
      sign_end: { file: "placa_continua.png", w: 200, h: 220 },
    },
  },
  G: {
    folder: "setorG/",
    tileset: "tileset_desfiladeiro/",
    layers: [
      { n: 0, file: "cenarioG_0_ceu.png", factor: 0.0, transparent: false, placeholder: { w: 512, h: 1080, y: 0, draw: 0 }, fallbackKey: "bg_sky" },
      { n: 1, file: "cenarioG_1_ilhas.png", factor: 0.07, transparent: true, placeholder: { w: 2048, h: 320, y: 395, draw: 1 } },
      { n: 2, file: "cenarioG_2_oceano.png", factor: 0.2, transparent: true, placeholder: { w: 1024, h: 380, y: 695, draw: 2 }, animatedWater: true },
      { n: 3, file: "cenarioG_3_desfiladeiro.png", factor: 0.42, transparent: true, placeholder: { w: 2048, h: 900, y: 70, draw: "G3" } },
      { n: 5, file: "cenarioG_5_rochas.png", factor: 1.15, transparent: true, placeholder: { w: 1024, h: 280, y: 860, draw: "B5" } },
      { n: 6, file: "cenarioG_6_folhas_desfocadas.png", factor: 1.38, transparent: true, placeholder: { w: 1024, h: 1080, y: 0, draw: 6 }, alpha: 0.85 },
    ],
    tiles: {
      sand_top: { file: "terra_grama_topo.png", w: 128, h: 128, surfaceY: 12 },
      sand_fill: { file: "terra_meio.png", w: 128, h: 128 },
      rock_top: { file: "rocha_encosta_topo.png", w: 128, h: 128, surfaceY: 8 },
      rock_fill: { file: "rocha_encosta_meio.png", w: 128, h: 128 },
      log: { file: "plataforma_galho.png", w: 128, h: 64, surfaceY: 6 },
      ledge: { file: "plataforma_pedra_musgo.png", w: 128, h: 64, surfaceY: 6 },
      crumble: { file: "plataforma_pedra_instavel.png", w: 128, h: 64, surfaceY: 6 },
    },
    props: {
      tree: { file: "arvore_floresta.png", w: 420, h: 720 },
      bush: { file: "arbusto_floresta.png", w: 260, h: 160 },
      fern: { file: "samambaia.png", w: 220, h: 140 },
      roots: { file: "raizes.png", w: 280, h: 130 },
      vine: { file: "cipo_pendente.png", w: 120, h: 380 },
      boulder: { file: "pedra_costao.png", w: 240, h: 180 },
      moss_rock: { file: "pedra_musgo.png", w: 180, h: 110 },
      pebbles: { file: "pedrinhas.png", w: 180, h: 70 },
      sign_end: { file: "placa_continua.png", w: 200, h: 220 },
    },
  },
  H: {
    folder: "setorH/",
    tileset: "tileset_clareira_julia/",
    layers: [
      { n: 0, file: "cenarioH_0_ceu.png", factor: 0.0, transparent: false, placeholder: { w: 512, h: 1080, y: 0, draw: 0 }, fallbackKey: "bg_sky" },
      { n: 1, file: "cenarioH_1_ilhas.png", factor: 0.07, transparent: true, placeholder: { w: 2048, h: 320, y: 395, draw: 1 } },
      { n: 2, file: "cenarioH_2_oceano.png", factor: 0.2, transparent: true, placeholder: { w: 1024, h: 380, y: 695, draw: 2 }, animatedWater: true },
      { n: 3, file: "cenarioH_3_mata_macacos.png", factor: 0.42, transparent: true, placeholder: { w: 2048, h: 900, y: 70, draw: "E3" } },
      { n: 5, file: "cenarioH_5_folhagem.png", factor: 1.15, transparent: true, placeholder: { w: 1024, h: 280, y: 860, draw: "C5" } },
      { n: 6, file: "cenarioH_6_folhas_desfocadas.png", factor: 1.38, transparent: true, placeholder: { w: 1024, h: 1080, y: 0, draw: 6 }, alpha: 0.85 },
    ],
    tiles: {
      sand_top: { file: "terra_densa_topo.png", w: 128, h: 128, surfaceY: 12 },
      sand_fill: { file: "terra_densa_meio.png", w: 128, h: 128 },
      rock_top: { file: "rocha_musgo_topo.png", w: 128, h: 128, surfaceY: 8 },
      rock_fill: { file: "rocha_musgo_meio.png", w: 128, h: 128 },
      log: { file: "plataforma_galho.png", w: 128, h: 64, surfaceY: 6 },
      ledge: { file: "plataforma_pedra_musgo.png", w: 128, h: 64, surfaceY: 6 },
      crumble: { file: "plataforma_pedra_instavel.png", w: 128, h: 64, surfaceY: 6 },
    },
    props: {
      tree: { file: "arvore_floresta.png", w: 420, h: 720 },
      bush: { file: "arbusto_floresta.png", w: 260, h: 160 },
      fern: { file: "samambaia.png", w: 220, h: 140 },
      roots: { file: "raizes.png", w: 280, h: 130 },
      vine: { file: "cipo_pendente.png", w: 120, h: 380 },
      hollow_log: { file: "tronco_oco.png", w: 384, h: 160 },
      boulder: { file: "pedra_costao.png", w: 240, h: 180 },
      moss_rock: { file: "pedra_musgo.png", w: 180, h: 110 },
      pebbles: { file: "pedrinhas.png", w: 180, h: 70 },
      sign_end: { file: "placa_continua.png", w: 200, h: 220 },
    },
  },
  I: {
    folder: "setorI/",
    tileset: "tileset_riacho_lucas/",
    layers: [
      { n: 0, file: "cenarioI_0_ceu.png", factor: 0.0, transparent: false, placeholder: { w: 512, h: 1080, y: 0, draw: 0 }, fallbackKey: "bg_sky" },
      { n: 1, file: "cenarioI_1_ilhas.png", factor: 0.07, transparent: true, placeholder: { w: 2048, h: 320, y: 395, draw: 1 } },
      { n: 2, file: "cenarioI_2_oceano.png", factor: 0.2, transparent: true, placeholder: { w: 1024, h: 380, y: 695, draw: 2 }, animatedWater: true },
      { n: 3, file: "cenarioI_3_arvores.png", factor: 0.42, transparent: true, placeholder: { w: 2048, h: 900, y: 70, draw: "C3" } },
      { n: 5, file: "cenarioI_5_folhagem.png", factor: 1.15, transparent: true, placeholder: { w: 1024, h: 280, y: 860, draw: "C5" } },
      { n: 6, file: "cenarioI_6_folhas_desfocadas.png", factor: 1.38, transparent: true, placeholder: { w: 1024, h: 1080, y: 0, draw: 6 }, alpha: 0.85 },
    ],
    tiles: {
      sand_top: { file: "margem_grama_topo.png", w: 128, h: 128, surfaceY: 12 },
      sand_fill: { file: "margem_terra_meio.png", w: 128, h: 128 },
      rock_top: { file: "rocha_riacho_topo.png", w: 128, h: 128, surfaceY: 8 },
      rock_fill: { file: "rocha_riacho_meio.png", w: 128, h: 128 },
      log: { file: "plataforma_galho.png", w: 128, h: 64, surfaceY: 6 },
      ledge: { file: "plataforma_pedra_musgo.png", w: 128, h: 64, surfaceY: 6 },
      crumble: { file: "plataforma_pedra_instavel.png", w: 128, h: 64, surfaceY: 6 },
    },
    props: {
      tree: { file: "arvore_floresta.png", w: 420, h: 720 },
      bush: { file: "arbusto_floresta.png", w: 260, h: 160 },
      fern: { file: "samambaia.png", w: 220, h: 140 },
      roots: { file: "raizes.png", w: 280, h: 130 },
      vine: { file: "cipo_pendente.png", w: 120, h: 380 },
      hollow_log: { file: "tronco_oco.png", w: 384, h: 160 },
      boulder: { file: "pedra_costao.png", w: 240, h: 180 },
      moss_rock: { file: "pedra_musgo.png", w: 180, h: 110 },
      pebbles: { file: "pedrinhas.png", w: 180, h: 70 },
      sign_end: { file: "placa_continua.png", w: 200, h: 220 },
    },
  },
  J: {
    folder: "setorJ/",
    tileset: "tileset_cachoeira/",
    layers: [
      { n: 0, file: "cenarioJ_0_ceu.png", factor: 0.0, transparent: false, placeholder: { w: 512, h: 1080, y: 0, draw: 0 }, fallbackKey: "bg_sky" },
      { n: 1, file: "cenarioJ_1_ilhas.png", factor: 0.07, transparent: true, placeholder: { w: 2048, h: 320, y: 395, draw: 1 } },
      { n: 2, file: "cenarioJ_2_oceano.png", factor: 0.2, transparent: true, placeholder: { w: 1024, h: 380, y: 695, draw: 2 }, animatedWater: true },
      { n: 3, file: "cenarioJ_3_cachoeira.png", factor: 0.42, transparent: true, placeholder: { w: 2048, h: 900, y: 70, draw: "J3" } },
      { n: 5, file: "cenarioJ_5_folhagem.png", factor: 1.15, transparent: true, placeholder: { w: 1024, h: 280, y: 860, draw: "B5" } },
      { n: 6, file: "cenarioJ_6_folhas_desfocadas.png", factor: 1.38, transparent: true, placeholder: { w: 1024, h: 1080, y: 0, draw: 6 }, alpha: 0.85 },
    ],
    tiles: {
      sand_top: { file: "margem_cachoeira_topo.png", w: 128, h: 128, surfaceY: 12 },
      sand_fill: { file: "margem_cachoeira_meio.png", w: 128, h: 128 },
      rock_top: { file: "rocha_molhada_topo.png", w: 128, h: 128, surfaceY: 8 },
      rock_fill: { file: "rocha_molhada_meio.png", w: 128, h: 128 },
      log: { file: "plataforma_galho.png", w: 128, h: 64, surfaceY: 6 },
      ledge: { file: "plataforma_pedra_escorregadia.png", w: 128, h: 64, surfaceY: 6 },
      crumble: { file: "plataforma_pedra_instavel.png", w: 128, h: 64, surfaceY: 6 },
    },
    props: {
      tree: { file: "arvore_floresta.png", w: 420, h: 720 },
      bush: { file: "arbusto_floresta.png", w: 260, h: 160 },
      fern: { file: "samambaia.png", w: 220, h: 140 },
      roots: { file: "raizes.png", w: 280, h: 130 },
      vine: { file: "cipo_pendente.png", w: 120, h: 380 },
      boulder: { file: "pedra_costao.png", w: 240, h: 180 },
      moss_rock: { file: "pedra_musgo.png", w: 180, h: 110 },
      pebbles: { file: "pedrinhas.png", w: 180, h: 70 },
      sign_end: { file: "placa_continua.png", w: 200, h: 220 },
    },
  },
  K: {
    folder: "setorK/",
    tileset: "tileset_gruta_secreta/",
    layers: [
      { n: 0, file: "cenarioK_0_fundo_gruta.png", factor: 0.0, transparent: false, placeholder: { w: 512, h: 1080, y: 0, draw: "K0" } },
      { n: 1, file: "cenarioK_1_abobada.png", factor: 0.07, transparent: true, placeholder: { w: 2048, h: 380, y: 0, draw: "K1" } },
      { n: 2, file: "cenarioK_2_reflexo_azul.png", factor: 0.2, transparent: true, placeholder: { w: 1024, h: 380, y: 695, draw: "K2" } },
      { n: 3, file: "cenarioK_3_paredes_cristal.png", factor: 0.42, transparent: true, placeholder: { w: 2048, h: 900, y: 70, draw: "K3" } },
      { n: 5, file: "cenarioK_5_estalagmites.png", factor: 1.15, transparent: true, placeholder: { w: 1024, h: 280, y: 860, draw: "K5" } },
      { n: 6, file: "cenarioK_6_brilho_frente.png", factor: 1.38, transparent: true, placeholder: { w: 1024, h: 1080, y: 0, draw: 6 }, alpha: 0.7 },
    ],
    tiles: {
      sand_top: { file: "piso_gruta_topo.png", w: 128, h: 128, surfaceY: 8 },
      sand_fill: { file: "piso_gruta_meio.png", w: 128, h: 128 },
      rock_top: { file: "rocha_cristal_topo.png", w: 128, h: 128, surfaceY: 8 },
      rock_fill: { file: "rocha_cristal_meio.png", w: 128, h: 128 },
      log: { file: "plataforma_cristal.png", w: 128, h: 64, surfaceY: 6 },
      ledge: { file: "plataforma_gruta.png", w: 128, h: 64, surfaceY: 6 },
      crumble: { file: "plataforma_pedra_instavel.png", w: 128, h: 64, surfaceY: 6 },
    },
    props: {
      crystal: { file: "cristal_azul.png", w: 140, h: 190 },
      boulder: { file: "pedra_costao.png", w: 240, h: 180 },
      moss_rock: { file: "pedra_musgo.png", w: 180, h: 110 },
      pebbles: { file: "pedrinhas.png", w: 180, h: 70 },
      sign_end: { file: "placa_continua.png", w: 200, h: 220 },
    },
  },
  L: {
    folder: "setorL/",
    tileset: "tileset_copas/",
    layers: [
      { n: 0, file: "cenarioL_0_ceu.png", factor: 0.0, transparent: false, placeholder: { w: 512, h: 1080, y: 0, draw: 0 }, fallbackKey: "bg_sky" },
      { n: 1, file: "cenarioL_1_ilhas.png", factor: 0.07, transparent: true, placeholder: { w: 2048, h: 320, y: 395, draw: 1 } },
      { n: 2, file: "cenarioL_2_oceano.png", factor: 0.2, transparent: true, placeholder: { w: 1024, h: 380, y: 695, draw: 2 }, animatedWater: true },
      { n: 3, file: "cenarioL_3_copas_arvores.png", factor: 0.42, transparent: true, placeholder: { w: 2048, h: 900, y: 60, draw: "L3" } },
      { n: 5, file: "cenarioL_5_folhagem.png", factor: 1.15, transparent: true, placeholder: { w: 1024, h: 280, y: 860, draw: "C5" } },
      { n: 6, file: "cenarioL_6_folhas_desfocadas.png", factor: 1.38, transparent: true, placeholder: { w: 1024, h: 1080, y: 0, draw: 6 }, alpha: 0.85 },
    ],
    tiles: {
      sand_top: { file: "terra_copas_topo.png", w: 128, h: 128, surfaceY: 12 },
      sand_fill: { file: "terra_copas_meio.png", w: 128, h: 128 },
      rock_top: { file: "rocha_runica_topo.png", w: 128, h: 128, surfaceY: 8 },
      rock_fill: { file: "rocha_runica_meio.png", w: 128, h: 128 },
      log: { file: "plataforma_galho.png", w: 128, h: 64, surfaceY: 6 },
      ledge: { file: "plataforma_pedra_musgo.png", w: 128, h: 64, surfaceY: 6 },
      crumble: { file: "plataforma_pedra_instavel.png", w: 128, h: 64, surfaceY: 6 },
    },
    props: {
      tree: { file: "arvore_floresta.png", w: 420, h: 720 },
      bush: { file: "arbusto_floresta.png", w: 260, h: 160 },
      fern: { file: "samambaia.png", w: 220, h: 140 },
      roots: { file: "raizes.png", w: 280, h: 130 },
      boulder: { file: "pedra_costao.png", w: 240, h: 180 },
      moss_rock: { file: "pedra_musgo.png", w: 180, h: 110 },
      ancient_rune_stone: { file: "pedra_runica_antiga.png", w: 180, h: 200 },
      sign_end: { file: "placa_continua.png", w: 200, h: 220 },
    },
  },
  M: {
    folder: "setorM/",
    tileset: "tileset_floresta_alta/",
    layers: [
      { n: 0, file: "cenarioM_0_ceu.png", factor: 0.0, transparent: false, placeholder: { w: 512, h: 1080, y: 0, draw: 0 }, fallbackKey: "bg_sky" },
      { n: 1, file: "cenarioM_1_ilhas.png", factor: 0.07, transparent: true, placeholder: { w: 2048, h: 320, y: 395, draw: 1 } },
      { n: 2, file: "cenarioM_2_oceano.png", factor: 0.2, transparent: true, placeholder: { w: 1024, h: 380, y: 695, draw: 2 }, animatedWater: true },
      { n: 3, file: "cenarioM_3_floresta_alta.png", factor: 0.42, transparent: true, placeholder: { w: 2048, h: 900, y: 60, draw: "M3" } },
      { n: 5, file: "cenarioM_5_folhagem.png", factor: 1.15, transparent: true, placeholder: { w: 1024, h: 280, y: 860, draw: "C5" } },
      { n: 6, file: "cenarioM_6_folhas_desfocadas.png", factor: 1.38, transparent: true, placeholder: { w: 1024, h: 1080, y: 0, draw: 6 }, alpha: 0.85 },
    ],
    tiles: {
      sand_top: { file: "terra_alta_topo.png", w: 128, h: 128, surfaceY: 12 },
      sand_fill: { file: "terra_alta_meio.png", w: 128, h: 128 },
      rock_top: { file: "rocha_alta_topo.png", w: 128, h: 128, surfaceY: 8 },
      rock_fill: { file: "rocha_alta_meio.png", w: 128, h: 128 },
      log: { file: "plataforma_galho.png", w: 128, h: 64, surfaceY: 6 },
      ledge: { file: "plataforma_pedra_musgo.png", w: 128, h: 64, surfaceY: 6 },
      crumble: { file: "plataforma_pedra_instavel.png", w: 128, h: 64, surfaceY: 6 },
    },
    props: {
      tree: { file: "arvore_floresta.png", w: 420, h: 720 },
      bush: { file: "arbusto_floresta.png", w: 260, h: 160 },
      fern: { file: "samambaia.png", w: 220, h: 140 },
      roots: { file: "raizes.png", w: 280, h: 130 },
      vine: { file: "cipo_pendente.png", w: 120, h: 380 },
      hollow_log: { file: "tronco_oco.png", w: 384, h: 160 },
      boulder: { file: "pedra_costao.png", w: 240, h: 180 },
      moss_rock: { file: "pedra_musgo.png", w: 180, h: 110 },
      ancient_rune_stone: { file: "pedra_runica_antiga.png", w: 180, h: 200 },
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
      climb_idle: { frames: [21], frameRate: 6, repeat: 0 },
      climb: { frames: [22, 23], frameRate: 8, repeat: -1 },
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
  toninho: {
    key: "f3_toninho", file: "chars/toninho_f3_sheet.png", frameWidth: 192, frameHeight: 256, scale: 1.08,
    origin: [0.5, 0.9375],
    anims: {
      idle: { frames: [0, 1], frameRate: 4, repeat: -1 },
      wave: { frames: [2, 3], frameRate: 6, repeat: -1 },
      throwRope: { frames: [4, 5], frameRate: 6, repeat: 0 },
      thumbsUp: { frames: [6, 7], frameRate: 5, repeat: -1 },
    },
  },
  marina: {
    key: "f3_marina", file: "chars/marina_f3_sheet.png", frameWidth: 192, frameHeight: 256, scale: 1.05,
    origin: [0.5, 0.9375],
    anims: {
      idle: { frames: [0, 1], frameRate: 4, repeat: -1 },
      notice: { frames: [2, 3], frameRate: 6, repeat: -1 },
      push: { frames: [4, 5, 6, 7], frameRate: 9, repeat: -1 },
      cheer: { frames: [8, 9], frameRate: 6, repeat: -1 },
    },
  },
  julia: {
    key: "f3_julia", file: "chars/julia_f3_sheet.png", frameWidth: 192, frameHeight: 256, scale: 1.08,
    origin: [0.5, 0.9375],
    anims: {
      idle: { frames: [0, 1], frameRate: 4, repeat: -1 },
      aimCamera: { frames: [2, 3], frameRate: 6, repeat: -1 },
      snap: { frames: [4, 5], frameRate: 10, repeat: 0 },
      cheer: { frames: [6, 7], frameRate: 6, repeat: -1 },
    },
  },
  lucas: {
    key: "f3_lucas", file: "chars/lucas_f3_sheet.png", frameWidth: 192, frameHeight: 256, scale: 1.06,
    origin: [0.5, 0.9375],
    anims: {
      idle: { frames: [0, 1], frameRate: 4, repeat: -1 },
      operateGadget: { frames: [2, 3], frameRate: 7, repeat: -1 },
      activate: { frames: [4, 5], frameRate: 8, repeat: -1 },
      celebrate: { frames: [6, 7], frameRate: 6, repeat: -1 },
    },
  },
  bia: {
    key: "f3_bia", file: "chars/bia_f3_sheet.png", frameWidth: 192, frameHeight: 256, scale: 1.05,
    origin: [0.5, 0.9375],
    anims: {
      idle: { frames: [0, 1], frameRate: 4, repeat: -1 },
      inspect: { frames: [2, 3], frameRate: 4, repeat: -1 },
      point: { frames: [4, 5], frameRate: 6, repeat: -1 },
      cheer: { frames: [6, 7], frameRate: 6, repeat: -1 },
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
  monkey: {
    key: "f3_macaco", file: "inimigos/macaco_sheet.png", frameWidth: 160, frameHeight: 160, scale: 0.95,
    origin: [0.5, 0.92], body: [88, 116, 36, 32],
    anims: {
      idle: { frames: [0, 1], frameRate: 3, repeat: -1 },
      watch: { frames: [2, 3], frameRate: 4, repeat: -1 },
      pick: { frames: [4, 5], frameRate: 6, repeat: 0 },
      aim: { frames: [6, 7], frameRate: 6, repeat: -1 },
      throw: { frames: [8], frameRate: 8, repeat: 0 },
      laugh: { frames: [9, 10], frameRate: 7, repeat: -1 },
      hurt: { frames: [11], frameRate: 8, repeat: 0 },
      stun: { frames: [12, 13], frameRate: 6, repeat: -1 },
      defeat: { frames: [14], frameRate: 8, repeat: 0 },
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
  monkey_rock: { key: "f3_pedra_macaco", file: "props/pedra_macaco.png", w: 48, h: 48 },
  marina_crate: { key: "f3_caixa_marina", file: "props/caixa_marina.png", w: 128, h: 128 },
  lucas_buoy: { key: "f3_boia_lucas", file: "props/boia_lucas.png", w: 168, h: 58 },
  waterfall_curtain: { key: "f3_cortina_cachoeira", file: "fx/cortina_cachoeira.png", w: 256, h: 256 },
  story_relic: { key: "f3_reliquia_historia", file: "props/reliquia_historia.png", w: 96, h: 96 },
  energy_orb: { key: "f3_orbe_energia", file: "fx/orbe_energia.png", w: 84, h: 84 },
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
