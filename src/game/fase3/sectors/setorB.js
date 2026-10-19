// @ts-nocheck
/**
 * SETOR B — COSTÃO ROCHOSO (saltos estreitos, pedras molhadas, ondas batendo nas pedras,
 * plataformas que desmoronam após pisadas e caranguejos em posições altas).
 * Coordenadas LOCAIS do setor (x começa em 0; assembleLevel() soma o offset do Setor A).
 */
const G = 900;
export const SETOR_B = {
  id: "B",
  name: "Costão Rochoso",
  art: "B",
  length: 7680,
  groundY: G,
  ambient: "costao",
  chunks: [
    {
      id: "B0", x0: 0, x1: 1920,
      ground: [
        { x: 0, w: 680, tiles: "rock" },
        { x: 960, w: 460, tiles: "rock" },
        { x: 1660, w: 260, tiles: "rock" },
      ],
      blocks: [
        { x: 1080, y: 760, w: 256, h: 140, tiles: "rock", wet: true },
      ],
      platforms: [
        { x: 756, y: 810, w: 128, kind: "ledge" },
        { x: 1476, y: 790, w: 128, kind: "ledge" },
      ],
      water: [
        { x: 680, w: 280, y: 930, respawn: { x: 580, y: 880 } },
        { x: 1420, w: 240, y: 930, respawn: { x: 1350, y: 880 } },
      ],
      waveHits: [
        { x: 690, y: 895, phase: 0.2 },
        { x: 950, y: 895, phase: 1.9 },
        { x: 1430, y: 895, phase: 0.9 },
      ],
      decor: [
        { kind: "boulder", x: 260, y: G + 10, scale: 0.95 },
        { kind: "moss_rock", x: 560, y: G + 8 },
        { kind: "pebbles", x: 1020, y: G + 10, front: true },
        { kind: "bush", x: 1780, y: G + 16, scale: 0.85 },
      ],
      shells: [
        { id: "f3B-01", x: 380, y: 840 },
        { id: "f3B-02", x: 820, y: 750 },
        { id: "f3B-03", x: 1150, y: 700 },
        { id: "f3B-04", x: 1260, y: 700 },
        { id: "f3B-05", x: 1540, y: 730 },
        { id: "f3B-06", x: 1780, y: 840 },
      ],
      enemies: [
        { type: "crab", x: 1208, y: 760, minX: 1096, maxX: 1320 },
      ],
      checkpoints: [{ id: "B0", x: 140 }],
      hints: [
        { id: "costao", x: 180, text: "Costão Rochoso: cuidado com as fendas no mar e as pedras molhadas!" },
      ],
      vistas: [{ x0: 0, x1: 620, zoom: 0.94 }],
    },
    {
      id: "B1", x0: 1920, x1: 3840,
      ground: [
        { x: 1920, w: 420, tiles: "rock" },
        { x: 3220, w: 620, tiles: "rock" },
      ],
      blocks: [
        { x: 2650, y: 740, w: 192, h: 220, tiles: "rock", wet: true },
        { x: 3420, y: 750, w: 280, h: 150, tiles: "rock", wet: true },
      ],
      platforms: [
        { x: 2430, y: 810, w: 128, kind: "crumble", crumble: true },
        { x: 2930, y: 700, w: 128, kind: "crumble", crumble: true },
        { x: 2682, y: 570, w: 128, kind: "crumble", crumble: true },
        { x: 3100, y: 790, w: 128, kind: "ledge" },
      ],
      water: [
        { x: 2340, w: 880, y: 935, respawn: { x: 2240, y: 880 } },
      ],
      waveHits: [
        { x: 2350, y: 895, phase: 0.4 },
        { x: 2650, y: 895, phase: 1.6 },
        { x: 3210, y: 895, phase: 2.7 },
      ],
      decor: [
        { kind: "moss_rock", x: 2180, y: G + 8 },
        { kind: "boulder", x: 3320, y: G + 12, scale: 0.85, flip: true },
        { kind: "pebbles", x: 3740, y: G + 10, front: true },
      ],
      shells: [
        { id: "f3B-07", x: 2494, y: 750 },
        { id: "f3B-08", x: 2746, y: 680 },
        { id: "f3B-09", x: 2746, y: 510 },
        { id: "f3B-10", x: 2994, y: 640 },
        { id: "f3B-11", x: 3500, y: 690 },
        { id: "f3B-12", x: 3620, y: 690 },
      ],
      enemies: [
        { type: "crab", x: 3560, y: 750, minX: 3436, maxX: 3684 },
      ],
      checkpoints: [{ id: "B1", x: 2040 }],
      hints: [
        { id: "crumble", x: 2100, text: "Lajes rachadas tremem e desmoronam ao pisar — pule rápido!" },
      ],
    },
    {
      id: "B2", x0: 3840, x1: 5760,
      ground: [
        { x: 3840, w: 840, tiles: "rock" },
        { x: 5420, w: 340, tiles: "rock" },
      ],
      // penhasco com fenda escondida embaixo (entrada agachada à esquerda) e caranguejo em cima
      blocks: [
        { x: 4090, y: 680, w: 380, h: 80, tiles: "rock", wet: true },
        { x: 4090, y: 760, w: 40, h: 20, tiles: "rock" },
        { x: 4430, y: 760, w: 40, h: 140, tiles: "rock" },
      ],
      platforms: [
        { x: 3940, y: 780, w: 128, kind: "ledge" },
        { x: 4750, y: 820, w: 128, kind: "ledge" },
        { x: 4950, y: 730, w: 128, kind: "crumble", crumble: true },
        { x: 5160, y: 650, w: 128, kind: "crumble", crumble: true },
      ],
      water: [
        { x: 4680, w: 740, y: 935, respawn: { x: 4580, y: 880 } },
      ],
      waveHits: [
        { x: 4690, y: 895, phase: 0.7 },
        { x: 5410, y: 895, phase: 2.1 },
      ],
      decor: [
        { kind: "pebbles", x: 4020, y: G + 10, front: true },
        { kind: "moss_rock", x: 4580, y: G + 8 },
        { kind: "boulder", x: 5580, y: G + 10, scale: 0.9 },
      ],
      shells: [
        { id: "f3B-13", x: 4190, y: 868 },
        { id: "f3B-14", x: 4270, y: 868 },
        { id: "f3B-G1", x: 4360, y: 848, gold: true },
        { id: "f3B-15", x: 4814, y: 760 },
        { id: "f3B-16", x: 5014, y: 670 },
        { id: "f3B-17", x: 5224, y: 590 },
      ],
      secrets: [
        { id: "fenda-costao", sniffX: null, zone: { x: 4120, y: 760, w: 310, h: 140 }, cover: { x: 4090, y: 680, w: 380, h: 220 } },
      ],
      enemies: [
        { type: "crab", x: 4280, y: 680, minX: 4108, maxX: 4452 },
      ],
      checkpoints: [{ id: "B2", x: 3940 }],
    },
    {
      id: "B3", x0: 5760, x1: 7680,
      ground: [
        { x: 5760, w: 540, tiles: "rock" },
        { x: 6820, w: 860, tiles: "rock" },
      ],
      blocks: [
        { x: 5980, y: 740, w: 256, h: 160, tiles: "rock", wet: true },
      ],
      platforms: [
        { x: 5830, y: 810, w: 128, kind: "ledge" },
        { x: 6360, y: 780, w: 128, kind: "crumble", crumble: true },
        { x: 6580, y: 710, w: 128, kind: "crumble", crumble: true },
      ],
      water: [
        { x: 6300, w: 520, y: 935, respawn: { x: 6200, y: 880 } },
      ],
      waveHits: [
        { x: 6310, y: 895, phase: 0.3 },
        { x: 6810, y: 895, phase: 1.7 },
      ],
      decor: [
        { kind: "moss_rock", x: 5900, y: G + 8 },
        { kind: "palm", x: 7020, y: G + 18, scale: 1.0, flip: true },
        { kind: "bush", x: 7260, y: G + 16, scale: 0.95 },
        { kind: "pebbles", x: 7460, y: G + 10, front: true },
      ],
      shells: [
        { id: "f3B-18", x: 6108, y: 680 },
        { id: "f3B-19", x: 6424, y: 720 },
        { id: "f3B-20", x: 6644, y: 650 },
        { id: "f3B-21", x: 7240, y: 840 },
      ],
      enemies: [
        { type: "crab", x: 6108, y: 740, minX: 5996, maxX: 6220 },
        { type: "crab", x: 7000, y: 900, minX: 6860, maxX: 7100 },
      ],
      checkpoints: [{ id: "B3", x: 7140 }],
      vistas: [{ x0: 7120, x1: 7680, zoom: 0.94 }],
    },
  ],
};
