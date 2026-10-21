// @ts-nocheck
/**
 * SETOR F — Clareira da Marina (Passo 6).
 * 4 chunks de 1920 px = 7680 px (~3 min).
 * Novidades:
 * - Paredões altos impossíveis de alcançar pulando do chão (y=900 → y=620, desnível de 280 px).
 * - Ao entrar em helpZoneMarina, a Marina percebe a Sofia (notice), empurra uma caixa grande de
 *   madeira (128×128) até a posição certa (push → drop/positioned) e faz gesto de "vai!" (cheer).
 * - A Sofia sobe na caixa (topo em y=772) e alcança o patamar superior (y=620).
 * - A Marina nunca bloqueia a Sofia.
 */
const G = 900;

export const SETOR_F = {
  id: "F",
  name: "Clareira da Marina",
  art: "F",
  length: 7680,
  groundY: G,
  ambient: "floresta",
  chunks: [
    /* ==================== F0: Primeiro Paredão + Marina Empurra a Caixa de Cima ==================== */
    {
      id: "F0", x0: 0, x1: 1920,
      ground: [
        { x: 0, w: 960, y: G, tiles: "sand" },
        { x: 960, w: 960, y: 620, tiles: "rock" }, // paredão de 280 px de altura (precisa da caixa da Marina)
      ],
      platforms: [
        { x: 280, y: 760, w: 192, kind: "log" },
        { x: 1320, y: 470, w: 256, kind: "log" },
      ],
      decor: [
        { kind: "tree", x: 220, y: G + 20, scale: 1.06 },
        { kind: "fern", x: 520, y: G + 12, front: true },
        { kind: "vine", x: 820, y: 410 },
        { kind: "moss_rock", x: 1120, y: 620 + 8 },
        { kind: "tree", x: 1620, y: 620 + 20, scale: 1.05, flip: true },
      ],
      shells: [
        { id: "f3F-01", x: 376, y: 700 },
        { id: "f3F-02", x: 880, y: 700 },
        { id: "f3F-03", x: 1080, y: 560 },
        { id: "f3F-04", x: 1200, y: 560 },
        { id: "f3F-05", x: 1448, y: 410 },
      ],
      enemies: [
        { type: "crab", x: 460, minX: 240, maxX: 680 },
        { type: "monkey", x: 1448, y: 470, minX: 1340, maxX: 1550 },
      ],
      triggers: [
        {
          id: "marinaF0",
          x: 520, y: 400, w: 420, h: 520,
          event: "helpZoneMarina",
          topY: 620,
          crateStartX: 1140,
          crateStartY: 620,
          crateTargetX: 880,
          crateTargetY: G,
        },
      ],
      hints: [
        { id: "hintF0", x: 180, text: "O patamar é alto demais! Aproxime-se para a Marina ajudar com a caixa." },
      ],
      checkpoints: [{ id: "F0", x: 160 }],
    },

    /* ==================== F1: Travessia na Clareira + Segredo sob as Pedras ==================== */
    {
      id: "F1", x0: 1920, x1: 3840,
      ground: [
        { x: 1920, w: 640, y: G, tiles: "sand" },
        { x: 2940, w: 900, y: G, tiles: "sand" },
      ],
      water: [
        { x: 2560, w: 380, y: 925, respawn: { x: 2460, y: 880 } },
      ],
      // Toca secreta sob pedras e raízes (entrada agachada pela esquerda em x=3260)
      blocks: [
        { x: 3260, y: 680, w: 380, h: 80, tiles: "rock" },
        { x: 3260, y: 760, w: 40, h: 20, tiles: "rock" },
        { x: 3600, y: 760, w: 40, h: 140, tiles: "rock" },
      ],
      platforms: [
        { x: 2140, y: 740, w: 256, kind: "log" },
        { x: 2640, y: 740, w: 192, kind: "ledge", moveX: 90, speed: 1.55, phase: 0 },
        { x: 3020, y: 600, w: 256, kind: "log" },
        { x: 3320, y: 550, w: 256, kind: "ledge" },
      ],
      ropes: [
        { id: "ropeF1", ropeX: 2750, topY: 440, bottomY: 810, deployed: true },
      ],
      secrets: [
        {
          id: "pedra-marina",
          sniffX: null,
          zone: { x: 3290, y: 760, w: 310, h: 140 },
          cover: { x: 3260, y: 680, w: 380, h: 220 },
        },
      ],
      decor: [
        { kind: "tree", x: 2180, y: G + 20, scale: 1.05 },
        { kind: "vine", x: 2520, y: 420 },
        { kind: "roots", x: 3260, y: 552 },
        { kind: "boulder", x: 3450, y: 550 },
        { kind: "fern", x: 3120, y: G + 12, front: true },
      ],
      shells: [
        { id: "f3F-06", x: 2268, y: 680 },
        { id: "f3F-07", x: 2750, y: 620 },
        { id: "f3F-08", x: 3148, y: 540 },
        { id: "f3F-09", x: 3370, y: 845 },
        { id: "f3F-10", x: 3460, y: 845 },
        { id: "f3F-G1", x: 3555, y: 838, gold: true },
      ],
      enemies: [
        { type: "crab", x: 2340, minX: 2040, maxX: 2500 },
        { type: "monkey", x: 3148, y: 600, minX: 3040, maxX: 3240 },
      ],
      checkpoints: [{ id: "F1", x: 2040 }],
    },

    /* ==================== F2: Segundo Paredão + Marina Empurra a Caixa no Chão ==================== */
    {
      id: "F2", x0: 3840, x1: 5760,
      ground: [
        { x: 3840, w: 1080, y: G, tiles: "sand" },
        { x: 4920, w: 840, y: 620, tiles: "rock" }, // segundo paredão alto (y=620)
      ],
      platforms: [
        { x: 4120, y: 740, w: 256, kind: "log" },
        { x: 5180, y: 470, w: 256, kind: "log" },
      ],
      decor: [
        { kind: "tree", x: 4060, y: G + 20, scale: 1.08 },
        { kind: "fern", x: 4440, y: G + 12, front: true },
        { kind: "moss_rock", x: 5080, y: 620 + 8 },
        { kind: "tree", x: 5480, y: 620 + 20, scale: 1.04, flip: true },
      ],
      shells: [
        { id: "f3F-11", x: 4248, y: 680 },
        { id: "f3F-12", x: 4840, y: 700 },
        { id: "f3F-13", x: 5040, y: 560 },
        { id: "f3F-14", x: 5308, y: 410 },
        { id: "f3F-15", x: 5560, y: 560 },
      ],
      enemies: [
        { type: "crab", x: 4320, minX: 4040, maxX: 4540 },
        { type: "monkey", x: 5308, y: 470, minX: 5200, maxX: 5410 },
      ],
      triggers: [
        {
          id: "marinaF2",
          x: 4380, y: 400, w: 480, h: 520,
          event: "helpZoneMarina",
          topY: 620,
          crateStartX: 4620,
          crateStartY: G,
          crateTargetX: 4840,
          crateTargetY: G,
        },
      ],
      checkpoints: [{ id: "F2", x: 3960 }],
    },

    /* ==================== F3: Terceiro Paredão da Marina + Saída do Setor F ==================== */
    {
      id: "F3", x0: 5760, x1: 7680,
      ground: [
        { x: 5760, w: 720, y: G, tiles: "sand" },
        { x: 6480, w: 1200, y: 620, tiles: "rock" }, // platô alto final rumo ao Desfiladeiro
      ],
      platforms: [
        { x: 5920, y: 740, w: 192, kind: "log" },
        { x: 6820, y: 470, w: 256, kind: "ledge" },
      ],
      decor: [
        { kind: "fern", x: 6120, y: G + 12, front: true },
        { kind: "moss_rock", x: 6660, y: 620 + 8 },
        { kind: "tree", x: 7060, y: 620 + 20, scale: 1.06 },
      ],
      shells: [
        { id: "f3F-16", x: 6016, y: 680 },
        { id: "f3F-17", x: 6400, y: 700 },
        { id: "f3F-18", x: 6620, y: 560 },
        { id: "f3F-19", x: 6948, y: 410 },
        { id: "f3F-20", x: 7160, y: 560 },
        { id: "f3F-21", x: 7300, y: 560 },
      ],
      enemies: [
        { type: "crab", x: 6080, minX: 5840, maxX: 6280 },
      ],
      triggers: [
        {
          id: "marinaF3",
          x: 5980, y: 400, w: 460, h: 520,
          event: "helpZoneMarina",
          topY: 620,
          crateStartX: 6660,
          crateStartY: 620,
          crateTargetX: 6400,
          crateTargetY: G,
        },
      ],
      checkpoints: [{ id: "F3", x: 7220 }],
      vistas: [{ x0: 7120, x1: 7680, zoom: 0.94 }],
    },
  ],
};
