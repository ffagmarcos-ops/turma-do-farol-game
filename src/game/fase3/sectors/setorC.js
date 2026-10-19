// @ts-nocheck
/**
 * SETOR C — ENTRADA DA FLORESTA (transição costão → mata + macacos em galhos altos jogando pedras em arco).
 * Coordenadas LOCAIS do setor (x começa em 0; assembleLevel() soma o offset dos setores anteriores).
 */
const G = 900;
export const SETOR_C = {
  id: "C",
  name: "Floresta Inicial",
  art: "C",
  length: 7680,
  groundY: G,
  ambient: "floresta",
  chunks: [
    {
      id: "C0", x0: 0, x1: 1920,
      ground: [
        { x: 0, w: 1920, tiles: "sand" },
      ],
      blocks: [
        { x: 1460, y: 780, w: 192, h: 120, tiles: "rock" },
      ],
      platforms: [
        { x: 740, y: 760, w: 192, kind: "log" },
        { x: 1020, y: 650, w: 256, kind: "log" },
      ],
      decor: [
        { kind: "tree", x: 320, y: G + 18, scale: 0.95 },
        { kind: "fern", x: 620, y: G + 12, front: true },
        { kind: "tree", x: 1148, y: G + 20, scale: 1.05 },
        { kind: "bush", x: 1720, y: G + 16, scale: 0.9 },
      ],
      shells: [
        { id: "f3C-01", x: 420, y: 840 },
        { id: "f3C-02", x: 540, y: 840 },
        { id: "f3C-03", x: 836, y: 700 },
        { id: "f3C-04", x: 1090, y: 590 },
        { id: "f3C-05", x: 1210, y: 590 },
        { id: "f3C-06", x: 1556, y: 720 },
      ],
      enemies: [
        { type: "monkey", x: 1148, y: 650 },
      ],
      checkpoints: [{ id: "C0", x: 140 }],
      hints: [
        { id: "macaco", x: 640, text: "O macaco levanta o braço antes de jogar a pedra — olhe a sombra no chão e use {attack}!" },
      ],
      vistas: [{ x0: 0, x1: 600, zoom: 0.94 }],
    },
    {
      id: "C1", x0: 1920, x1: 3840,
      ground: [
        { x: 1920, w: 740, tiles: "sand" },
        { x: 2960, w: 880, tiles: "sand" },
      ],
      blocks: [
        { x: 3480, y: 760, w: 200, h: 140, tiles: "rock" },
      ],
      platforms: [
        { x: 2180, y: 770, w: 192, kind: "log" },
        { x: 2380, y: 630, w: 256, kind: "log" },
        { x: 2746, y: 790, w: 128, kind: "ledge" },
        { x: 3120, y: 740, w: 192, kind: "log" },
        { x: 3320, y: 610, w: 256, kind: "log" },
      ],
      water: [
        { x: 2660, w: 300, y: 935, respawn: { x: 2560, y: 880 } },
      ],
      decor: [
        { kind: "tree", x: 2490, y: G + 20, scale: 1.0 },
        { kind: "roots", x: 2980, y: G + 14, front: true },
        { kind: "tree", x: 3440, y: G + 20, scale: 1.05, flip: true },
        { kind: "fern", x: 3720, y: G + 12, front: true },
      ],
      shells: [
        { id: "f3C-07", x: 2276, y: 710 },
        { id: "f3C-08", x: 2508, y: 570 },
        { id: "f3C-09", x: 2810, y: 730 },
        { id: "f3C-10", x: 3216, y: 680 },
        { id: "f3C-11", x: 3448, y: 550 },
        { id: "f3C-12", x: 3580, y: 700 },
      ],
      enemies: [
        { type: "monkey", x: 2508, y: 630 },
        { type: "crab", x: 3180, minX: 3010, maxX: 3420 },
        { type: "monkey", x: 3448, y: 610 },
      ],
      checkpoints: [{ id: "C1", x: 2040 }],
    },
    {
      id: "C2", x0: 3840, x1: 5760,
      ground: [
        { x: 3840, w: 1920, tiles: "sand" },
      ],
      // barranco de raízes e pedra com toca escondida embaixo (agachar à esquerda)
      blocks: [
        { x: 4120, y: 680, w: 380, h: 80, tiles: "rock" },
        { x: 4120, y: 760, w: 40, h: 20, tiles: "rock" },
        { x: 4460, y: 760, w: 40, h: 140, tiles: "rock" },
      ],
      platforms: [
        { x: 3940, y: 780, w: 128, kind: "log" },
        { x: 4200, y: 550, w: 220, kind: "log" },
        { x: 4780, y: 760, w: 192, kind: "log" },
        { x: 5060, y: 640, w: 256, kind: "log" },
        { x: 5400, y: 750, w: 128, kind: "crumble", crumble: true },
      ],
      decor: [
        { kind: "roots", x: 4130, y: G + 12, front: true },
        { kind: "tree", x: 4310, y: G + 20, scale: 1.08 },
        { kind: "fern", x: 4680, y: G + 12, front: true },
        { kind: "tree", x: 5188, y: G + 20, scale: 1.0, flip: true },
        { kind: "bush", x: 5620, y: G + 16, scale: 0.9 },
      ],
      shells: [
        { id: "f3C-13", x: 4220, y: 868 },
        { id: "f3C-14", x: 4300, y: 868 },
        { id: "f3C-G1", x: 4390, y: 848, gold: true },
        { id: "f3C-15", x: 4876, y: 700 },
        { id: "f3C-16", x: 5188, y: 580 },
        { id: "f3C-17", x: 5464, y: 690 },
      ],
      secrets: [
        { id: "raizes-floresta", sniffX: 4050, zone: { x: 4150, y: 760, w: 310, h: 140 }, cover: { x: 4120, y: 680, w: 380, h: 220 } },
      ],
      enemies: [
        { type: "monkey", x: 4310, y: 550 },
        { type: "monkey", x: 5188, y: 640 },
      ],
      checkpoints: [{ id: "C2", x: 3940 }],
    },
    {
      id: "C3", x0: 5760, x1: 7680,
      ground: [
        { x: 5760, w: 1920, tiles: "sand" },
      ],
      platforms: [
        { x: 5900, y: 760, w: 192, kind: "log" },
        { x: 6120, y: 630, w: 256, kind: "log" },
        { x: 6440, y: 740, w: 192, kind: "ledge" },
        { x: 6660, y: 600, w: 256, kind: "log" },
      ],
      decor: [
        { kind: "tree", x: 6248, y: G + 20, scale: 1.02 },
        { kind: "fern", x: 6520, y: G + 12, front: true },
        { kind: "tree", x: 6788, y: G + 20, scale: 1.06, flip: true },
        { kind: "moss_rock", x: 7060, y: G + 8 },
        { kind: "sign_end", x: 7440, y: G + 6 },
      ],
      shells: [
        { id: "f3C-18", x: 5996, y: 700 },
        { id: "f3C-19", x: 6248, y: 570 },
        { id: "f3C-20", x: 6788, y: 540 },
        { id: "f3C-21", x: 7240, y: 840 },
      ],
      enemies: [
        { type: "monkey", x: 6248, y: 630 },
        { type: "crab", x: 6480, minX: 6320, maxX: 6660 },
        { type: "monkey", x: 6788, y: 600 },
      ],
      checkpoints: [{ id: "C3", x: 7140 }],
      triggers: [{ id: "fimC", x: 7480, y: 0, w: 200, h: 1080, event: "end" }],
      vistas: [{ x0: 7120, x1: 7680, zoom: 0.94 }],
    },
  ],
};
