// @ts-nocheck
/**
 * SETOR H — Clareira dos Macacos / Júlia e o Flash (Passo 8).
 * 4 chunks de 1920 px = 7680 px (~4 min).
 * Novidades:
 * - Vários macacos nas copas e galhos jogando pedras.
 * - Júlia posicionada em plataformas laterais (helpZoneJulia) tira fotos em intervalo regular (~3,1 s).
 * - Cada flash dá um clarão rápido, dissipa pedras no ar e deixa os macacos da área tontos por ~2,2 s.
 * - A travessia é feita aproveitando as janelas seguras após cada flash.
 */
const G = 900;

export const SETOR_H = {
  id: "H",
  name: "Clareira da Júlia",
  art: "H",
  length: 7680,
  groundY: G,
  ambient: "floresta",
  chunks: [
    /* ==================== H0: Entrada das Copas + Primeira Janela de Flash da Júlia ==================== */
    {
      id: "H0", x0: 0, x1: 1920,
      ground: [
        { x: 0, w: 420, y: 620, tiles: "rock" }, // emenda direta com o final de G3 (y=620)
        { x: 420, w: 1500, y: G, tiles: "sand" },
      ],
      platforms: [
        { x: 460, y: 700, w: 192, kind: "ledge" }, // plataforma lateral da Júlia
        { x: 760, y: 580, w: 256, kind: "log" },
        { x: 1080, y: 520, w: 256, kind: "log" },
        { x: 1400, y: 580, w: 256, kind: "log" },
        { x: 940, y: 740, w: 192, kind: "ledge" },
        { x: 1280, y: 740, w: 192, kind: "ledge" },
      ],
      decor: [
        { kind: "moss_rock", x: 220, y: 620 + 8 },
        { kind: "tree", x: 880, y: G + 20, scale: 1.08 },
        { kind: "fern", x: 680, y: G + 12, front: true },
        { kind: "tree", x: 1520, y: G + 20, scale: 1.06, flip: true },
        { kind: "vine", x: 1200, y: 400 },
      ],
      shells: [
        { id: "f3H-01", x: 888, y: 520 },
        { id: "f3H-02", x: 1036, y: 680 },
        { id: "f3H-03", x: 1208, y: 460 },
        { id: "f3H-04", x: 1376, y: 680 },
        { id: "f3H-05", x: 1528, y: 520 },
      ],
      enemies: [
        { type: "monkey", x: 888, y: 580, minX: 780, maxX: 990 },
        { type: "monkey", x: 1208, y: 520, minX: 1100, maxX: 1310 },
        { type: "monkey", x: 1528, y: 580, minX: 1420, maxX: 1630 },
      ],
      triggers: [
        {
          id: "juliaH0",
          x: 440, y: 200, w: 1360, h: 740,
          event: "helpZoneJulia",
          juliaX: 540,
          juliaY: 700,
          interval: 3.1,
          stunDuration: 2.2,
          flashRadius: 1080,
        },
      ],
      hints: [
        { id: "hintH0", x: 160, text: "Muitos macacos nos galhos! Aproveite o flash das fotos da Júlia (eles ficam tontos ~2 s) para atravessar." },
      ],
      checkpoints: [{ id: "H0", x: 160 }],
    },

    /* ==================== H1: Travessia sobre a Água com Flash + Esconderijo Secreto ==================== */
    {
      id: "H1", x0: 1920, x1: 3840,
      ground: [
        { x: 1920, w: 460, y: G, tiles: "sand" },
        { x: 3080, w: 760, y: G, tiles: "sand" },
      ],
      water: [
        { x: 2380, w: 700, y: 930, respawn: { x: 2240, y: 880 } },
      ],
      // Esconderijo secreto atrás das rochas e raízes (entrada agachada em x=3360)
      blocks: [
        { x: 3360, y: 680, w: 380, h: 80, tiles: "rock" },
        { x: 3360, y: 760, w: 40, h: 20, tiles: "rock" },
        { x: 3700, y: 760, w: 40, h: 140, tiles: "rock" },
      ],
      platforms: [
        { x: 2140, y: 660, w: 192, kind: "ledge" }, // mirante lateral da Júlia
        { x: 2420, y: 760, w: 192, kind: "log", sway: true, moveX: 60, speed: 1.65, ropeTopY: 520 },
        { x: 2740, y: 720, w: 192, kind: "ledge" },
        { x: 2400, y: 480, w: 256, kind: "log" },
        { x: 2680, y: 440, w: 256, kind: "log" },
        { x: 2960, y: 500, w: 256, kind: "log" },
        { x: 3420, y: 550, w: 256, kind: "ledge" },
      ],
      secrets: [
        {
          id: "moita-julia",
          sniffX: null,
          zone: { x: 3390, y: 760, w: 310, h: 140 },
          cover: { x: 3360, y: 680, w: 380, h: 220 },
        },
      ],
      decor: [
        { kind: "tree", x: 2120, y: G + 20, scale: 1.05 },
        { kind: "vine", x: 2620, y: 380 },
        { kind: "roots", x: 3360, y: 552 },
        { kind: "boulder", x: 3560, y: 550 },
        { kind: "fern", x: 3220, y: G + 12, front: true },
      ],
      shells: [
        { id: "f3H-06", x: 2516, y: 695 },
        { id: "f3H-07", x: 2836, y: 660 },
        { id: "f3H-08", x: 3088, y: 440 },
        { id: "f3H-09", x: 3470, y: 845 },
        { id: "f3H-10", x: 3555, y: 845 },
        { id: "f3H-G1", x: 3645, y: 838, gold: true },
      ],
      enemies: [
        { type: "monkey", x: 2528, y: 480, minX: 2420, maxX: 2630 },
        { type: "monkey", x: 2808, y: 440, minX: 2700, maxX: 2910 },
        { type: "monkey", x: 3088, y: 500, minX: 2980, maxX: 3190 },
      ],
      triggers: [
        {
          id: "juliaH1",
          x: 2120, y: 200, w: 1160, h: 740,
          event: "helpZoneJulia",
          juliaX: 2236,
          juliaY: 660,
          interval: 3.1,
          stunDuration: 2.2,
          flashRadius: 1040,
        },
      ],
      checkpoints: [{ id: "H1", x: 2040 }],
    },

    /* ==================== H2: Galhos em Vários Níveis + Júlia no Mirante Central ==================== */
    {
      id: "H2", x0: 3840, x1: 5760,
      ground: [
        { x: 3840, w: 1920, y: G, tiles: "sand" },
      ],
      platforms: [
        { x: 4160, y: 680, w: 192, kind: "ledge" }, // plataforma lateral da Júlia
        { x: 4320, y: 540, w: 256, kind: "log" },
        { x: 4640, y: 460, w: 256, kind: "log" },
        { x: 4980, y: 520, w: 256, kind: "log" },
        { x: 5320, y: 460, w: 256, kind: "log" },
        { x: 4540, y: 740, w: 192, kind: "ledge" },
        { x: 5160, y: 720, w: 192, kind: "ledge" },
      ],
      ropes: [
        { id: "ropeH2", ropeX: 4920, topY: 320, bottomY: 740, deployed: true },
      ],
      decor: [
        { kind: "tree", x: 4040, y: G + 20, scale: 1.06 },
        { kind: "tree", x: 4780, y: G + 20, scale: 1.1, flip: true },
        { kind: "vine", x: 5120, y: 380 },
        { kind: "fern", x: 5480, y: G + 12, front: true },
      ],
      shells: [
        { id: "f3H-11", x: 4448, y: 480 },
        { id: "f3H-12", x: 4636, y: 680 },
        { id: "f3H-13", x: 4768, y: 400 },
        { id: "f3H-14", x: 5108, y: 460 },
        { id: "f3H-15", x: 5448, y: 400 },
      ],
      enemies: [
        { type: "crab", x: 4480, minX: 4220, maxX: 4760 },
        { type: "monkey", x: 4448, y: 540, minX: 4340, maxX: 4550 },
        { type: "monkey", x: 4768, y: 460, minX: 4660, maxX: 4870 },
        { type: "monkey", x: 5108, y: 520, minX: 5000, maxX: 5210 },
        { type: "monkey", x: 5448, y: 460, minX: 5340, maxX: 5550 },
      ],
      triggers: [
        {
          id: "juliaH2",
          x: 4140, y: 200, w: 1480, h: 740,
          event: "helpZoneJulia",
          juliaX: 4256,
          juliaY: 680,
          interval: 3.1,
          stunDuration: 2.2,
          flashRadius: 1280,
        },
      ],
      checkpoints: [{ id: "H2", x: 3960 }],
    },

    /* ==================== H3: Corredor Final de Macacos + Último Flash da Júlia + Saída ==================== */
    {
      id: "H3", x0: 5760, x1: 7680,
      ground: [
        { x: 5760, w: 1920, y: G, tiles: "sand" },
      ],
      platforms: [
        { x: 5940, y: 680, w: 192, kind: "ledge" }, // plataforma lateral da Júlia
        { x: 6140, y: 540, w: 256, kind: "log" },
        { x: 6480, y: 480, w: 256, kind: "log" },
        { x: 6820, y: 540, w: 256, kind: "log" },
        { x: 6320, y: 740, w: 192, kind: "crumble", crumble: true },
        { x: 6680, y: 740, w: 192, kind: "crumble", crumble: true },
      ],
      ropes: [
        { id: "ropeH3", ropeX: 6600, topY: 340, bottomY: 740, deployed: true },
      ],
      decor: [
        { kind: "tree", x: 6260, y: G + 20, scale: 1.08 },
        { kind: "fern", x: 6560, y: G + 12, front: true },
        { kind: "tree", x: 7060, y: G + 20, scale: 1.05, flip: true },
      ],
      shells: [
        { id: "f3H-16", x: 6268, y: 480 },
        { id: "f3H-17", x: 6416, y: 680 },
        { id: "f3H-18", x: 6608, y: 420 },
        { id: "f3H-19", x: 6776, y: 680 },
        { id: "f3H-20", x: 6948, y: 480 },
        { id: "f3H-21", x: 7280, y: 820 },
      ],
      enemies: [
        { type: "monkey", x: 6268, y: 540, minX: 6160, maxX: 6370 },
        { type: "monkey", x: 6608, y: 480, minX: 6500, maxX: 6710 },
        { type: "monkey", x: 6948, y: 540, minX: 6840, maxX: 7050 },
      ],
      triggers: [
        {
          id: "juliaH3",
          x: 5920, y: 200, w: 1220, h: 740,
          event: "helpZoneJulia",
          juliaX: 6036,
          juliaY: 680,
          interval: 3.1,
          stunDuration: 2.2,
          flashRadius: 1100,
        },
      ],
      checkpoints: [{ id: "H3", x: 7220 }],
      vistas: [{ x0: 7120, x1: 7680, zoom: 0.94 }],
    },
  ],
};
