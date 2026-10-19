// @ts-nocheck
/**
 * SETOR M — Floresta Alta / Copas Altas (Passo 12).
 * 4 chunks de 1920 px = 7680 px (~5 min).
 * Maior desafio de plataforma da floresta:
 * - Múltiplos níveis verticais (solo y=900, pontes naturais y=720..600, copas altas y=460..320, dossel y=260).
 * - Pontes naturais de galhos, cipós (ropes), plataformas móveis (moveX/moveY), plataformas que balançam (sway) e instáveis (crumble).
 * - Tronco oco caído (hollow_log) onde é preciso passar agachada.
 * - Macacos arremessando pedras de alturas diferentes e caranguejos patrulhando no solo.
 * - Checkpoints antes e no meio (M0, M1, M2 clareira segura, M3).
 * - Segredo farejado pelo Faísca no topo dos galhos (ninho-copas-altas) com a concha dourada f3M-G1.
 * - Placa de encerramento em M3 apontando para o Passo 13 (Setor N — Ruínas Antigas).
 */
const G = 900;

export const SETOR_M = {
  id: "M",
  name: "Copas Altas",
  art: "M",
  length: 7680,
  groundY: G,
  ambient: "floresta",
  chunks: [
    /* ==================== M0: Entrada nas Copas Altas e Primeiras Pontes ==================== */
    {
      id: "M0", x0: 0, x1: 1920,
      ground: [
        { x: 0, w: 660, y: G, tiles: "sand" },
        { x: 1240, w: 680, y: G, tiles: "sand" },
      ],
      water: [
        { x: 660, w: 580, y: 946, stream: true, respawn: { x: 560, y: G - 2 } },
      ],
      platforms: [
        // Rota intermediária e alta
        { x: 520, y: 740, w: 200, kind: "log" },
        { x: 780, y: 640, w: 180, kind: "log", sway: true },
        { x: 1040, y: 520, w: 220, kind: "log" },
        { x: 1360, y: 680, w: 240, kind: "log" },
        { x: 1680, y: 540, w: 200, kind: "log" },
      ],
      ropes: [
        { id: "ropeM0", ropeX: 960, topY: 180, bottomY: 620, deployed: true },
      ],
      enemies: [
        { type: "crab", x: 420, minX: 260, maxX: 580 },
        { type: "monkey", x: 880, y: 440 },
        { type: "crab", x: 1540, minX: 1380, maxX: 1780 },
      ],
      decor: [
        { kind: "tree", x: 180, y: G + 20, scale: 1.2 },
        { kind: "fern", x: 480, y: G + 10, front: true },
        { kind: "vine", x: 960, y: 160 },
        { kind: "tree", x: 1440, y: G + 20, scale: 1.25, flip: true },
        { kind: "moss_rock", x: 1800, y: G + 8 },
      ],
      shells: [
        { id: "f3M-01", x: 300, y: 820 },
        { id: "f3M-02", x: 610, y: 670 },
        { id: "f3M-03", x: 870, y: 570 },
        { id: "f3M-04", x: 1150, y: 450 },
        { id: "f3M-05", x: 1520, y: 610 },
      ],
      checkpoints: [{ id: "M0", x: 100 }],
      vistas: [{ x0: 500, x1: 1400, zoom: 0.94 }],
    },

    /* ==================== M1: Labirinto dos Galhos Suspensos e Ninho das Copas ==================== */
    {
      id: "M1", x0: 1920, x1: 3840,
      ground: [
        { x: 1920, w: 560, y: G, tiles: "sand" },
        { x: 2640, w: 280, y: G, tiles: "sand" }, // ilhota baixa entre raízes
        { x: 3260, w: 580, y: G, tiles: "sand" },
      ],
      water: [
        { x: 2480, w: 160, y: 946, stream: true, respawn: { x: 2360, y: G - 2 } },
        { x: 2920, w: 340, y: 946, stream: true, respawn: { x: 2780, y: G - 2 } },
      ],
      platforms: [
        // Plataforma móvel horizontal sobre o primeiro desnível
        { x: 2160, y: 660, w: 180, kind: "log", moveX: 180, speed: 65 },
        // Plataformas altas que balançam nas copas
        { x: 2480, y: 520, w: 200, kind: "log", sway: true },
        { x: 2800, y: 440, w: 220, kind: "log" },
        // Laje instável perto do ninho
        { x: 2760, y: 580, w: 160, kind: "crumble", crumble: true },
        // Galho do ninho alto (acesso à concha dourada)
        { x: 2940, y: 320, w: 180, kind: "log" },
        // Plataforma móvel vertical para a transição
        { x: 3340, y: 580, w: 200, kind: "log", moveY: 130, speed: 60 },
        { x: 3620, y: 680, w: 200, kind: "log" },
      ],
      ropes: [
        { id: "ropeM1", ropeX: 3120, topY: 180, bottomY: 580, deployed: true },
      ],
      enemies: [
        { type: "monkey", x: 2340, y: 340 },
        { type: "crab", x: 2740, minX: 2660, maxX: 2860 },
        { type: "monkey", x: 3040, y: 410 },
        { type: "crab", x: 3520, minX: 3360, maxX: 3740 },
      ],
      decor: [
        { kind: "tree", x: 2080, y: G + 20, scale: 1.3 },
        { kind: "roots", x: 2520, y: G + 10 },
        { kind: "vine", x: 2840, y: 220 },
        { kind: "tree", x: 3220, y: G + 20, scale: 1.25, flip: true },
        { kind: "bush", x: 3700, y: G + 6 },
      ],
      secrets: [
        {
          id: "ninho-copas-altas",
          sniffX: null,
          zone: { x: 2840, y: 220, w: 320, h: 180 },
          cover: { x: 2820, y: 200, w: 350, h: 200 },
        },
      ],
      shells: [
        { id: "f3M-06", x: 2180, y: 590 },
        { id: "f3M-G1", x: 2980, y: 250, gold: true }, // Concha dourada no ninho das copas altas!
        { id: "f3M-07", x: 2560, y: 450 },
        { id: "f3M-08", x: 2740, y: 820 }, // Rota inferior na ilhota
        { id: "f3M-09", x: 3180, y: 420 },
        { id: "f3M-10", x: 3480, y: 520 },
      ],
      checkpoints: [{ id: "M1", x: 2020 }],
    },

    /* ==================== M2: A Clareira das Copas Colossais e Tronco Oco ==================== */
    {
      id: "M2", x0: 3840, x1: 5760,
      ground: [
        // Clareira segura no início do chunk
        { x: 3840, w: 620, y: G, tiles: "sand" },
        // Chão sob o tronco oco e desníveis
        { x: 4460, w: 720, y: G, tiles: "sand" },
        { x: 5360, w: 400, y: G, tiles: "sand" },
      ],
      blocks: [
        // Teto de passagem agachada sob o tronco oco
        { x: 4520, y: 760, w: 320, h: 48, tiles: "rock" },
      ],
      water: [
        { x: 5180, w: 180, y: 946, stream: true, respawn: { x: 5080, y: G - 2 } },
      ],
      platforms: [
        // Galhos ascendentes após a clareira
        { x: 4240, y: 740, w: 200, kind: "log" },
        { x: 4540, y: 580, w: 240, kind: "log", sway: true },
        { x: 4880, y: 460, w: 220, kind: "log" },
        // Tronco alto sobre a área do tronco oco
        { x: 4720, y: 340, w: 200, kind: "log" },
        // Plataforma móvel vertical sobre o fosso
        { x: 5140, y: 640, w: 200, kind: "log", moveY: 150, speed: 65 },
        { x: 5420, y: 480, w: 220, kind: "log", sway: true },
      ],
      enemies: [
        // Sem inimigos na clareira segura x=3840..4240!
        { type: "monkey", x: 4720, y: 260 },
        { type: "crab", x: 4920, minX: 4760, maxX: 5120 },
        { type: "monkey", x: 5320, y: 380 },
        { type: "crab", x: 5520, minX: 5400, maxX: 5680 },
      ],
      decor: [
        { kind: "tree", x: 3980, y: G + 20, scale: 1.28 },
        { kind: "fern", x: 4180, y: G + 10, front: true },
        { kind: "hollow_log", x: 4680, y: G + 12 },
        { kind: "vine", x: 4940, y: 220 },
        { kind: "tree", x: 5480, y: G + 20, scale: 1.22, flip: true },
        { kind: "moss_rock", x: 5660, y: G + 8 },
      ],
      shells: [
        { id: "f3M-11", x: 4120, y: 820 },
        { id: "f3M-12", x: 4360, y: 670 },
        { id: "f3M-13", x: 4660, y: 840 }, // Dentro da passagem agachada do tronco oco
        { id: "f3M-14", x: 4780, y: 270 }, // No galho mais alto
        { id: "f3M-15", x: 5020, y: 390 },
        { id: "f3M-16", x: 5480, y: 410 },
      ],
      checkpoints: [{ id: "M2", x: 3940 }], // Clareira segura no meio do setor
      vistas: [{ x0: 3840, x1: 4300, zoom: 0.94 }],
    },

    /* ==================== M3: A Travessia do Dossel e Saída da Mata Alta ==================== */
    {
      id: "M3", x0: 5760, x1: 7680,
      ground: [
        { x: 5760, w: 460, y: G, tiles: "sand" },
        { x: 6920, w: 760, y: G, tiles: "sand" }, // platô de encerramento do setor
      ],
      water: [
        { x: 6220, w: 700, y: 946, stream: true, respawn: { x: 6100, y: G - 2 } },
      ],
      platforms: [
        // Travessia acrobática no alto do dossel
        { x: 6020, y: 720, w: 180, kind: "log" },
        { x: 6260, y: 560, w: 200, kind: "log", sway: true },
        { x: 6540, y: 440, w: 220, kind: "log" },
        // Plataforma instável no salto final
        { x: 6740, y: 560, w: 180, kind: "crumble", crumble: true },
        { x: 7020, y: 680, w: 220, kind: "log" },
      ],
      ropes: [
        { id: "ropeM3", ropeX: 6440, topY: 160, bottomY: 520, deployed: true },
      ],
      enemies: [
        { type: "monkey", x: 6360, y: 380 },
        { type: "monkey", x: 6780, y: 360 },
        { type: "crab", x: 7220, minX: 7060, maxX: 7460 },
      ],
      decor: [
        { kind: "tree", x: 5880, y: G + 20, scale: 1.26 },
        { kind: "vine", x: 6320, y: 220 },
        { kind: "tree", x: 7120, y: G + 20, scale: 1.24, flip: true },
        { kind: "ancient_rune_stone", x: 7340, y: G + 10 },
      ],
      shells: [
        { id: "f3M-17", x: 5960, y: 820 },
        { id: "f3M-18", x: 6140, y: 640 },
        { id: "f3M-19", x: 6420, y: 480 },
        { id: "f3M-20", x: 6680, y: 370 },
        { id: "f3M-21", x: 7260, y: 820 },
      ],
      triggers: [],
      checkpoints: [{ id: "M3", x: 5860 }],
      vistas: [{ x0: 6100, x1: 7680, zoom: 0.94 }],
    },
  ],
};
