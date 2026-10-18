// @ts-nocheck
/**
 * Artes que o ChatGPT gera. Nada daqui é desenhado por este projeto.
 * Soltar o arquivo no caminho substitui o fallback da fase.
 */
export const ASSET_MANIFEST = [
  { key: "portrait_marina", file: "ui/portrait_marina.png", size: "512×512", note: "Retrato da Marina, sem texto." },
  { key: "portrait_julia", file: "ui/portrait_julia.png", size: "512×512", note: "Retrato da Júlia, sem texto." },
  { key: "portrait_lucas", file: "ui/portrait_lucas.png", size: "512×512", note: "Retrato do Lucas com o aparelho, sem texto." },
  { key: "portrait_bia", file: "ui/portrait_bia.png", size: "512×512", note: "Retrato da Bia, sem texto." },
  { key: "portrait_toninho", file: "ui/portrait_toninho.png", size: "512×512", note: "Retrato de Seu Toninho, sem texto." },
  { key: "portrait_faisca", file: "ui/portrait_faisca.png", size: "512×512", note: "Faísca de quatro, sem pose humana e sem texto." },
  { key: "menu_capa", file: "ui/menu_capa.png", size: "1672×941", note: "Capa do menu. Cover 16:9, sem distorcer." },
  { key: "bg_sky", file: "bg/sky_01_seamless.png", size: "1344×1024", note: "Céu sem gaivotas. TileSprite, tilePositionX, fator 0.02." },
  { key: "bg_islands", file: "bg/islands.png", size: "1920×640", note: "Ilhas no horizonte, camada 2. Sem farol repetido." },
  { key: "bg_village_far", file: "bg/village_far_pano.png", size: "2700×1080", note: "Panorâmica distante. TileSprite, fator 0.28, sem espelho." },
  { key: "bg_village_mid", file: "bg/village_mid.png", size: "1920×640", note: "Telhados e rua, camada 4." },
  { key: "bg_harbor", file: "bg/harbor.png", size: "4860×1080", note: "Porto, só a camada 6, fator 0.70. Não reutilizar no mar." },
  { key: "boat_esperanca", file: "props/boat_esperanca.png", size: "960×560", note: "Barco Esperança, fundo transparente." },
  { key: "artifact", file: "props/artifact.png", size: "256×256", note: "Artefato com o símbolo, fundo transparente." },
  { key: "crate", file: "props/crate.png", size: "256×256", note: "Caixote de madeira, fundo transparente." },
  { key: "nets", file: "props/nets.png", size: "512×512", note: "Rede de pesca que a Faísca puxa." },
  { key: "market_stall", file: "props/market_stall.png", size: "640×512", note: "Barraca do mercado." },
  { key: "fountain", file: "props/fountain.png", size: "512×512", note: "Fonte da praça." },
  { key: "pier_tile", file: "props/pier_tile.png", size: "455×448", note: "Trecho entre duas estacas. Repete a cada 455 px, sem costura." },
  { key: "fg_near", file: "props/foreground.png", size: "1400×788", note: "Ainda é placeholder magenta. Não entra na fase até haver arte de verdade." },
  { key: "seagull", file: "props/seagull_sheet.png", size: "1536×499", note: "6 quadros 256×499, anim fly 10 fps. Escala cerca de 0.2." },
  { key: "music_vila", file: "audio/music_vila.mp3", size: "loop", note: "Música da vila. Bus music 0.6. Tecla M muta. Volume cai nos diálogos." },
  { key: "sfx_step_wood_01", file: "audio/sfx_step_wood_01.ogg", size: "sfx", note: "Passo na madeira do píer. Também _02 e _03." },
  { key: "sfx_step_stone_01", file: "audio/sfx_step_stone_01.ogg", size: "sfx", note: "Passo na rua de pedra. Também _02 e _03." },
  { key: "sfx_step_grass_01", file: "audio/sfx_step_grass_01.ogg", size: "sfx", note: "Passo na grama da entrada. Também _02 e _03." },
  { key: "sfx_jump", file: "audio/sfx_jump.ogg", size: "sfx", note: "Pulo da Marina." },
  { key: "sfx_land", file: "audio/sfx_land.ogg", size: "sfx", note: "Aterrissagem." },
  { key: "sfx_shell", file: "audio/sfx_shell.ogg", size: "sfx", note: "Concha coletada." },
  { key: "sfx_bell", file: "audio/sfx_bell.ogg", size: "sfx", note: "Sino do checkpoint e do fim da fase." },
  { key: "sfx_clinc", file: "audio/sfx_clinc.ogg", size: "sfx", note: "CLINC do artefato." },
  { key: "sfx_bark", file: "audio/sfx_bark.ogg", size: "sfx", note: "Latido da Faísca. Se o arquivo não existir, fica em silêncio." },
  { key: "sfx_plank", file: "audio/sfx_plank.ogg", size: "sfx", note: "Madeira da rede puxada." },
  { key: "sfx_ui_confirm", file: "audio/sfx_ui_confirm.ogg", size: "ui", note: "Entrar na vila." },
  { key: "sfx_ui_dialog_open", file: "audio/sfx_ui_dialog_open.ogg", size: "ui", note: "Abre o diálogo." },
  { key: "sfx_ui_dialog_next", file: "audio/sfx_ui_dialog_next.ogg", size: "ui", note: "Próxima fala." },
  { key: "sfx_ui_dialog_close", file: "audio/sfx_ui_dialog_close.ogg", size: "ui", note: "Fecha o diálogo." },
  { key: "amb_waves", file: "audio/amb_waves.ogg", size: "loop", note: "Ondas posicionais. Ainda não veio no lote: silêncio." },
  { key: "amb_gulls", file: "audio/amb_gulls.ogg", size: "loop", note: "Gaivotas posicionais. Ainda não veio no lote: silêncio." },
  { key: "amb_market", file: "audio/amb_market.ogg", size: "loop", note: "Feira posicional. Ainda não veio no lote: silêncio." },
  { key: "marina_sheet", file: "chars/marina_sheet_1536.png", size: "1536×1536", note: "Folha 8×6, quadro 192×256, origem 0.5×0.9375. Crouch = quadro 40. Interact = idle." },
  { key: "marina_walk", file: "chars/marina_walk.png", size: "quadro", note: "WALK." },
  { key: "marina_run", file: "chars/marina_run.png", size: "quadro", note: "RUN. Fallback: WALK mais rápido." },
  { key: "marina_jump_start", file: "chars/marina_jump_start.png", size: "quadro", note: "JUMP_START. Fallback: quadro do pulo." },
  { key: "marina_jump", file: "chars/marina_jump.png", size: "quadro", note: "JUMP. Fallback: marina_jump_0." },
  { key: "marina_fall", file: "chars/marina_fall.png", size: "quadro", note: "FALL. Fallback: último quadro do pulo." },
  { key: "marina_land", file: "chars/marina_land.png", size: "quadro", note: "LAND. Fallback: 80 ms de squash no idle." },
  { key: "marina_crouch", file: "chars/marina_crouch.png", size: "quadro", note: "CROUCH. Fallback: idle." },
  { key: "marina_interact", file: "chars/marina_interact.png", size: "quadro", note: "INTERACT. Fallback: idle." },
];

export const PORTRAITS = ASSET_MANIFEST.filter((item) => item.key.startsWith("portrait_"));

/**
 * Fase 2 (O Polvo Gigante). Mesmos nomes de fase2/PEDIDOS_ARTE_FASE2.md, dentro de
 * public/assets/farol/fase2/. Se o PNG não existir, a BossScene gera um placeholder
 * com a mesma chave. frame = [largura, altura] quando é folha de sprites.
 */
export const F2_ASSETS = [
  { key: "f2_lucas_sonic", file: "sprites/lucas_sonic_sheet.png", frame: [192, 256] },
  // Lucas machucado / nocauteado (placeholders até a arte do Daniel): 192x256, origem (0.5, 0.9375)
  { key: "lucas_hurt", file: "sprites/lucas_hurt_sheet.png", frame: [192, 256] },
  { key: "lucas_ko", file: "sprites/lucas_ko_sheet.png", frame: [192, 256] },
  { key: "f2s_toninho", file: "sprites/toninho_leme.png", frame: [192, 256] },
  { key: "f2s_faisca", file: "sprites/faisca_latindo.png", frame: [192, 256] },
  { key: "f2s_marina", file: "sprites/marina_corda.png", frame: [192, 256] },
  { key: "f2s_bia", file: "sprites/bia_balde.png", frame: [192, 256] },
  { key: "f2s_julia", file: "sprites/julia_mastro.png", frame: [192, 256] },
  { key: "f2_sonic_fx", file: "fx/sonic_fx_sheet.png", frame: [256, 256] },
  // Polvo em PARTES (estilo Rayman): o código monta e anima cada peça.
  { key: "f2_p_corpo", file: "boss/polvo_parte_corpo.png" },
  { key: "f2_p_olho", file: "boss/polvo_parte_olho.png" },
  { key: "f2_p_pupila", file: "boss/polvo_parte_pupila.png" },
  { key: "f2_p_palpebra", file: "boss/polvo_parte_palpebra.png" },
  { key: "f2_p_boca", file: "boss/polvo_parte_boca.png" },
  { key: "f2_t_base", file: "boss/tentaculo_base.png" },
  { key: "f2_t_meio", file: "boss/tentaculo_meio.png" },
  { key: "f2_t_ponta", file: "boss/tentaculo_ponta.png" },
  // Lote 1 (ChatGPT, aprovado): corpo inteiro em 4 estados (idle, dano, fúria, atordoado), 2x2 de 768.
  // Polvo em partes estilo Rayman (Daniel): fatiado por bbox em data/polvo_partes.json
  { key: "f2_polvo_partes", file: "boss/polvo_partes.png" },
  { key: "f2_polvo_olhos", file: "boss/polvo_olhos_sheet.png", frame: [512, 320] },
  { key: "f2_tent_varr", file: "boss/tentaculo_varredura_sheet.png", frame: [768, 384] },
  { key: "f2_tinta_proj", file: "boss/tinta_projetil_sheet.png" },
  { key: "f2_tent_seg", file: "boss/tentaculo_segmentos.png" },
  { key: "f2_tent_est", file: "boss/tentaculo_estados.png" },
  // fallback: corpo inteiro em 4 estados
  { key: "f2_polvo_corpo", file: "boss/polvo_corpo_sheet.png", frame: [768, 768] },
  // Tentáculo vertical 6x2 (fatiado por bbox em data/tentaculo_frames.json)
  { key: "f2_tentaculo_v", file: "boss/tentaculo_vertical_sheet.png" },
  // Partículas CC0 aprovadas pelo Daniel (atlas 128x128, índice em data/cc0_particulas.json) e chuva distante
  { key: "f2_cc0", file: "fx/cc0_particulas.png", frame: [128, 128] },
  { key: "f2_cc0_chuva", file: "fx/cc0_chuva_fundo.png" },
  { key: "f2_varrida", file: "boss/tentaculo_varrida.png", frame: [768, 512] },
  { key: "f2_tinta", file: "boss/tinta_projetil_sheet.png", frame: [256, 256] },
  { key: "f2_tinta_tela", file: "fx/tinta_tela.png" },
  { key: "f2_barco", file: "boat/esperanca_lateral_tempestade.png" },
  { key: "f2_barco_props", file: "boat/esperanca_props.png" },
  { key: "f2_tripulacao", file: "boat/tripulacao_conves_sheet.png", frame: [192, 256] },
  { key: "f2_sky", file: "bg2/sky_storm.png" },
  { key: "f2_clouds", file: "bg2/clouds_storm.png" },
  { key: "f2_sea_far", file: "bg2/sea_far.png" },
  { key: "f2_sea_mid", file: "bg2/sea_mid.png" },
  { key: "f2_waves_front", file: "bg2/waves_front.png" },
  { key: "f2_relampago", file: "fx/relampago_sheet.png", frame: [384, 512] },
  { key: "f2_spray", file: "fx/agua_spray_sheet.png", frame: [256, 256] },
  { key: "f2_bar_frame", file: "ui/boss_bar_frame.png" },
  { key: "portrait_polvo", file: "ui/portrait_polvo.png" },
  { key: "hq_p09", file: "ui/hq_p09.jpg" },
  { key: "f2_hud_sonico", file: "ui/hud_sonico.png" },
  { key: "portrait_lucas_alerta", file: "ui/portrait_lucas_alerta.png" },
  { key: "portrait_marina_comando", file: "ui/portrait_marina_comando.png" },
  { key: "portrait_toninho_leme", file: "ui/portrait_toninho_leme.png" },
  { key: "portrait_bia_assustada", file: "ui/portrait_bia_assustada.png" },
  { key: "portrait_julia_camera", file: "ui/portrait_julia_camera.png" },
];
/** Música do chefe: slot vazio até o Marcos mandar. */
export const F2_MUSIC = "assets/audio/bgm_boss.mp3";
