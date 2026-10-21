// @ts-nocheck
/**
 * SETOR J — Cachoeira (Passo 10).
 * 4 chunks de 1920 px = 7680 px (~4 min).
 * Novidades:
 * - Cenário imponente de cachoeira com paredões de pedra e quedas d'água volumosas.
 * - Superfícies molhadas e escorregadias (slippery: true) que alteram a física da Sofia (desliza com menos atrito).
 * - Cortinas de cachoeira animadas verticais (waterfalls) que revelam passagens secretas atrás da água.
 * - O Faísca fareja e late suavemente na entrada secreta atrás da cachoeira em J2 (sniffX).
 */
const G = 900;

export const SETOR_J = {
  id: "J",
  name: "Cachoeira dos Penhascos",
  art: "J",
  length: 7680,
  groundY: G,
  ambient: "floresta",
  chunks: [
    /* ==================== J0: Entrada da Cachoeira e Pedras Molhadas ==================== */
    {
      id: "J0", x0: 0, x1: 1920,
      ground: [
        { x: 0, w: 580, y: G, tiles: "sand" },
        { x: 1480, w: 440, y: G, tiles: "rock", slippery: true },
      ],
      water: [
        { x: 580, w: 900, y: 946, stream: true, respawn: { x: 440, y: G - 2 } },
      ],
      platforms: [
        { x: 640, y: 780, w: 220, kind: "ledge", slippery: true },
        { x: 940, y: 670, w: 200, kind: "ledge", slippery: true },
        { x: 1210, y: 750, w: 210, kind: "ledge", slippery: true },
      ],
      decor: [
        { kind: "moss_rock", x: 180, y: G + 8 },
        { kind: "boulder", x: 490, y: G + 12, scale: 0.95 },
        { kind: "fern", x: 540, y: G + 10, front: true },
        { kind: "boulder", x: 1510, y: G + 12, scale: 1.05 },
        { kind: "fern", x: 1820, y: G + 10, front: true },
      ],
      shells: [
        { id: "f3J-01", x: 320, y: 830 },
        { id: "f3J-02", x: 740, y: 710 },
        { id: "f3J-03", x: 1040, y: 600 },
        { id: "f3J-04", x: 1310, y: 680 },
        { id: "f3J-05", x: 1640, y: 820 },
      ],
      enemies: [
        { type: "crab", x: 1680, minX: 1520, maxX: 1860 },
      ],
      checkpoints: [{ id: "J0", x: 200 }],
      hints: [
        { id: "cachoeira_pedras", x: 260, text: "O spray da cachoeira molha as pedras! Elas são escorregadias, controle o impulso com {jump}." },
      ],
    },

    /* ==================== J1: Escalada da Cascata com Plataformas Suspensas ==================== */
    {
      id: "J1", x0: 1920, x1: 3840,
      ground: [
        { x: 1920, w: 460, y: G, tiles: "rock", slippery: true },
        { x: 3420, w: 420, y: G, tiles: "rock", slippery: true },
      ],
      blocks: [
        { x: 2880, y: 440, w: 260, h: 480, tiles: "rock", wet: true, slippery: true },
      ],
      water: [
        { x: 2380, w: 500, y: 946, stream: true, respawn: { x: 2240, y: G - 2 } },
        { x: 3140, w: 280, y: 946, stream: true, respawn: { x: 3480, y: G - 2 } },
      ],
      waterfalls: [
        { x: 2540, y: 80, w: 240, h: 840 },
      ],
      platforms: [
        { x: 2180, y: 740, w: 180, kind: "ledge", slippery: true },
        { x: 2460, y: 600, w: 190, kind: "log", sway: true, speed: 1.4, ropeTopY: 260 },
        { x: 3180, y: 620, w: 180, kind: "ledge", slippery: true },
      ],
      decor: [
        { kind: "boulder", x: 2040, y: G + 12 },
        { kind: "moss_rock", x: 2320, y: G + 8 },
        { kind: "moss_rock", x: 3460, y: G + 8 },
        { kind: "fern", x: 3740, y: G + 10, front: true },
      ],
      shells: [
        { id: "f3J-06", x: 2260, y: 670 },
        { id: "f3J-G1", x: 2980, y: 360, gold: true },
        { id: "f3J-07", x: 2550, y: 520 },
        { id: "f3J-08", x: 3260, y: 540 },
        { id: "f3J-09", x: 3560, y: 820 },
      ],
      enemies: [
        { type: "monkey", x: 3010, y: 440, minX: 2910, maxX: 3100 },
        { type: "crab", x: 3620, minX: 3480, maxX: 3790 },
      ],
      checkpoints: [{ id: "J1", x: 2060 }],
      vistas: [{ x0: 2480, x1: 3340, zoom: 0.94 }],
    },

    /* ==================== J2: Grande Queda d'Água e Passagem Secreta ==================== */
    {
      id: "J2", x0: 3840, x1: 5760,
      ground: [
        { x: 3840, w: 560, y: G, tiles: "rock", slippery: true },
        { x: 5040, w: 720, y: G, tiles: "rock", slippery: true },
      ],
      water: [
        { x: 4400, w: 640, y: 946, stream: true, respawn: { x: 4260, y: G - 2 } },
      ],
      waterfalls: [
        // Cortina principal da grande cachoeira que encobre a passagem secreta!
        { x: 4480, y: 100, w: 380, h: 840, secretPassage: true },
      ],
      platforms: [
        // Plataforma escondida exatamente atrás da cortina de água
        { x: 4500, y: 700, w: 340, kind: "ledge", slippery: true },
        { x: 4120, y: 680, w: 200, kind: "ledge", slippery: true },
        { x: 4920, y: 690, w: 210, kind: "ledge", slippery: true },
      ],
      decor: [
        { kind: "boulder", x: 3960, y: G + 12, scale: 1.08 },
        { kind: "fern", x: 4320, y: G + 10, front: true },
        { kind: "fern", x: 5120, y: G + 10, front: true },
        { kind: "moss_rock", x: 5540, y: G + 8 },
      ],
      secrets: [
        {
          id: "atras-da-cachoeira",
          sniffX: 4440,
          zone: { x: 4490, y: 600, w: 360, h: 260 },
          cover: { x: 4470, y: 590, w: 390, h: 280 },
        },
      ],
      shells: [
        { id: "f3J-10", x: 4020, y: 820 },
        { id: "f3J-11", x: 4210, y: 610 },
        { id: "f3J-12", x: 4620, y: 630 }, // atrás da cortina de água
        { id: "f3J-13", x: 4740, y: 630 }, // atrás da cortina de água
        { id: "f3J-14", x: 5010, y: 620 },
        { id: "f3J-15", x: 5240, y: 820 },
      ],
      enemies: [
        { type: "crab", x: 5320, minX: 5120, maxX: 5660 },
      ],
      checkpoints: [{ id: "J2", x: 4040 }],
      hints: [
        { id: "faisca_cachoeira", x: 4360, text: "O Faísca está inquieto olhando para a água… Há algo atrás da cachoeira!" },
      ],
    },

    /* ==================== J3: Topo dos Penhascos e Entrada da Gruta ==================== */
    {
      id: "J3", x0: 5760, x1: 7680,
      ground: [
        { x: 5760, w: 680, y: G, tiles: "rock", slippery: true },
        { x: 6980, w: 700, y: G, tiles: "rock", slippery: true },
      ],
      blocks: [
        { x: 6420, y: 560, w: 320, h: 360, tiles: "rock", wet: true, slippery: true },
      ],
      water: [
        { x: 6440, w: 540, y: 946, stream: true, respawn: { x: 6300, y: G - 2 } },
      ],
      platforms: [
        { x: 6180, y: 720, w: 200, kind: "ledge", slippery: true },
        { x: 6780, y: 700, w: 210, kind: "ledge", slippery: true },
        { x: 6460, y: 440, w: 240, kind: "ledge", slippery: true },
      ],
      decor: [
        { kind: "boulder", x: 5900, y: G + 12 },
        { kind: "fern", x: 6360, y: G + 10, front: true },
        { kind: "boulder", x: 7020, y: G + 12, scale: 1.1 },
        { kind: "moss_rock", x: 7360, y: G + 8 },
      ],
      shells: [
        { id: "f3J-16", x: 5940, y: 820 },
        { id: "f3J-17", x: 6270, y: 640 },
        { id: "f3J-18", x: 6580, y: 370 },
        { id: "f3J-19", x: 6880, y: 620 },
        { id: "f3J-20", x: 7220, y: 820 },
        { id: "f3J-21", x: 7480, y: 820 },
      ],
      enemies: [
        { type: "monkey", x: 6580, y: 440, minX: 6480, maxX: 6680 },
        { type: "crab", x: 7180, minX: 7040, maxX: 7520 },
      ],
      checkpoints: [{ id: "J3", x: 5960 }],
      vistas: [{ x0: 6200, x1: 7680, zoom: 0.92 }],
    },
  ],
};
