// @ts-nocheck
/**
 * SETOR D — ENCOSTA DO SEU TONINHO (paredões altos + Seu Toninho jogando corda náutica + travessia com corda).
 * Coordenadas LOCAIS do setor (x começa em 0; assembleLevel() soma o offset dos setores anteriores).
 */
const G = 900;
export const SETOR_D = {
  id: "D",
  name: "Encosta do Seu Toninho",
  art: "D",
  length: 7680,
  groundY: G,
  ambient: "floresta",
  chunks: [
    {
      id: "D0", x0: 0, x1: 1920,
      ground: [
        { x: 0, w: 960, y: G, tiles: "sand" },
        { x: 960, w: 960, y: 480, tiles: "rock" }, // paredão alto de 420 px (Sofia sobe pela corda do Seu Toninho)
      ],
      platforms: [
        { x: 260, y: 760, w: 192, kind: "log" },
        // plataforma alta à esquerda da corda: alcançável balançando na corda e pulando para a esquerda
        { x: 520, y: 540, w: 256, kind: "log" },
        { x: 1380, y: 340, w: 256, kind: "log" },
      ],
      decor: [
        { kind: "tree", x: 220, y: G + 18, scale: 0.96 },
        { kind: "fern", x: 480, y: G + 12, front: true },
        { kind: "boulder", x: 840, y: G + 10, scale: 0.85 },
        { kind: "tree", x: 1508, y: 480 + 20, scale: 1.02 },
        { kind: "bush", x: 1760, y: 480 + 14, scale: 0.9 },
      ],
      shells: [
        { id: "f3D-01", x: 356, y: 700 },
        { id: "f3D-02", x: 760, y: 840 },
        { id: "f3D-03", x: 590, y: 480 },
        { id: "f3D-04", x: 700, y: 480 },
        { id: "f3D-05", x: 1180, y: 420 },
        { id: "f3D-06", x: 1508, y: 280 },
      ],
      enemies: [
        { type: "crab", x: 480, minX: 300, maxX: 720 },
        { type: "monkey", x: 1508, y: 340 },
      ],
      triggers: [
        {
          id: "toninhoD0",
          x: 600, y: 380, w: 360, h: 540,
          event: "helpZoneToninho",
          toninhoX: 1036,
          ropeX: 924,
          topY: 480,
          bottomY: 855,
        },
      ],
      checkpoints: [{ id: "D0", x: 120 }],
      hints: [
        { id: "paredao_toninho", x: 520, text: "O paredão é alto demais! Aproxime-se para pedir ajuda ao Seu Toninho" },
      ],
      vistas: [{ x0: 560, x1: 1320, zoom: 0.94 }],
    },
    {
      id: "D1", x0: 1920, x1: 3840,
      ground: [
        { x: 1920, w: 720, y: G, tiles: "sand" },
        { x: 3060, w: 780, y: G, tiles: "sand" },
      ],
      platforms: [
        { x: 1960, y: 620, w: 192, kind: "ledge" },
        { x: 2180, y: 760, w: 192, kind: "log" },
        { x: 2720, y: 480, w: 256, kind: "log" }, // galho alto onde a 2ª corda náutica está amarrada
        { x: 3340, y: 740, w: 256, kind: "log" },
      ],
      ropes: [
        {
          id: "ropeD1",
          ropeX: 2848,
          toninhoX: 2848,
          topY: 480,
          bottomY: 840,
          deployed: true,
          canVaultTop: true,
          ledgeDir: 1,
        },
      ],
      water: [
        { x: 2640, w: 420, y: 970, respawn: { x: 2520, y: G - 2 } },
      ],
      decor: [
        { kind: "tree", x: 2848, y: G + 110, scale: 1.12 },
        { kind: "fern", x: 2440, y: G + 12, front: true },
        { kind: "moss_rock", x: 3220, y: G + 8 },
        { kind: "tree", x: 3468, y: G + 20, scale: 1.04, flip: true },
      ],
      shells: [
        { id: "f3D-07", x: 2056, y: 560 },
        { id: "f3D-08", x: 2276, y: 700 },
        { id: "f3D-09", x: 2848, y: 660 },
        { id: "f3D-10", x: 2848, y: 420 },
        { id: "f3D-11", x: 3468, y: 680 },
      ],
      enemies: [
        { type: "crab", x: 3280, minX: 3120, maxX: 3560 },
        { type: "monkey", x: 3468, y: 740 },
      ],
      checkpoints: [{ id: "D1", x: 2380 }],
    },
    {
      id: "D2", x0: 3840, x1: 5760,
      ground: [
        { x: 3840, w: 1920, y: G, tiles: "sand" },
      ],
      blocks: [
        // saliência rochosa com passagem secreta por baixo (agachar)
        { x: 4580, y: 540, w: 460, h: 240, tiles: "rock" },
        { x: 5040, y: 540, w: 140, h: 360, tiles: "rock" },
      ],
      platforms: [
        { x: 4100, y: 760, w: 192, kind: "crumble", crumble: true },
        { x: 4340, y: 640, w: 192, kind: "ledge" },
        { x: 5280, y: 740, w: 256, kind: "log" },
        { x: 5480, y: 600, w: 256, kind: "log" },
      ],
      decor: [
        { kind: "tree", x: 4020, y: G + 20, scale: 1.0 },
        { kind: "roots", x: 4740, y: 800, scale: 0.95, front: true },
        { kind: "bush", x: 4540, y: G + 18, scale: 1.1, front: true },
        { kind: "tree", x: 5608, y: G + 20, scale: 1.06 },
      ],
      shells: [
        { id: "f3D-12", x: 4196, y: 700 },
        { id: "f3D-13", x: 4436, y: 580 },
        { id: "f3D-14", x: 4720, y: 480 },
        { id: "f3D-15", x: 4880, y: 480 },
        { id: "f3D-16", x: 5408, y: 680 },
        { id: "f3D-G1", x: 4860, y: 840, gold: true },
      ],
      enemies: [
        { type: "crab", x: 4280, minX: 3980, maxX: 4500 },
        { type: "monkey", x: 5608, y: 600 },
      ],
      secrets: [
        {
          id: "gruta-toninho",
          sniffX: 4520,
          zone: { x: 4580, y: 775, w: 450, h: 125 },
          cover: { x: 4580, y: 780, w: 460, h: 124 },
        },
      ],
      checkpoints: [{ id: "D2", x: 3940 }],
    },
    {
      id: "D3", x0: 5760, x1: 7680,
      ground: [
        { x: 5760, w: 680, y: G, tiles: "sand" },
        { x: 6440, w: 640, y: 500, tiles: "rock" }, // 2º paredão alto da encosta
        { x: 7080, w: 600, y: G, tiles: "sand" },
      ],
      platforms: [
        { x: 5940, y: 760, w: 192, kind: "log" },
        { x: 7140, y: 680, w: 192, kind: "ledge" },
      ],
      decor: [
        { kind: "fern", x: 6160, y: G + 12, front: true },
        { kind: "moss_rock", x: 6680, y: 500 + 8 },
        { kind: "tree", x: 6900, y: 500 + 20, scale: 1.02 },
        { kind: "tree", x: 7480, y: G + 20, scale: 1.05 },
      ],
      shells: [
        { id: "f3D-17", x: 6036, y: 700 },
        { id: "f3D-18", x: 6396, y: 660 },
        { id: "f3D-19", x: 6640, y: 440 },
        { id: "f3D-20", x: 6800, y: 440 },
        { id: "f3D-21", x: 7236, y: 620 },
      ],
      enemies: [
        { type: "crab", x: 6120, minX: 5860, maxX: 6340 },
      ],
      triggers: [
        {
          id: "toninhoD3",
          x: 6100, y: 400, w: 340, h: 520,
          event: "helpZoneToninho",
          toninhoX: 6516,
          ropeX: 6404,
          topY: 500,
          bottomY: 855,
        },
      ],
      checkpoints: [{ id: "D3", x: 7180 }],
      vistas: [{ x0: 7120, x1: 7680, zoom: 0.94 }],
    },
  ],
};
