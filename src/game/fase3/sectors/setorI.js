// @ts-nocheck
/**
 * SETOR I — Riacho e o Aparelho do Lucas (Passo 9).
 * 4 chunks de 1920 px = 7680 px (~4 min).
 * Novidades:
 * - Riacho fundo com água detalhada (transparência, reflexo, espuma e partículas de correnteza).
 * - Cair na água dá respingo e volta para a margem segura (sem game over).
 * - Lucas na margem (`helpZoneLucas`) ajoelha e ativa o aparelho que cria 4–5 plataformas/boias flutuantes.
 * - As boias oscilam na água e afundam um pouco com o peso da Sofia, voltando à superfície quando ela sai.
 * - Quando a Sofia atravessa pulando até a outra margem, o Lucas comemora.
 */
const G = 900;

export const SETOR_I = {
  id: "I",
  name: "Riacho do Lucas",
  art: "I",
  length: 7680,
  groundY: G,
  ambient: "floresta",
  chunks: [
    /* ==================== I0: Primeira Travessia do Riacho com o Lucas (4 boias) ==================== */
    {
      id: "I0", x0: 0, x1: 1920,
      ground: [
        { x: 0, w: 480, y: G, tiles: "sand" },
        { x: 1560, w: 360, y: G, tiles: "sand" },
      ],
      water: [
        { x: 480, w: 1080, y: 946, stream: true, respawn: { x: 340, y: G - 2 } },
      ],
      platforms: [
        { x: 760, y: 600, w: 192, kind: "log" },
        { x: 1180, y: 580, w: 192, kind: "log" },
      ],
      decor: [
        { kind: "tree", x: 140, y: G + 20, scale: 1.06 },
        { kind: "fern", x: 420, y: G + 10, front: true },
        { kind: "moss_rock", x: 455, y: G + 8 },
        { kind: "moss_rock", x: 1590, y: G + 8 },
        { kind: "tree", x: 1760, y: G + 20, scale: 1.05, flip: true },
      ],
      shells: [
        { id: "f3I-01", x: 604, y: 810 },
        { id: "f3I-02", x: 854, y: 785 },
        { id: "f3I-03", x: 1104, y: 800 },
        { id: "f3I-04", x: 1354, y: 780 },
        { id: "f3I-05", x: 1680, y: 820 },
      ],
      triggers: [
        {
          id: "lucasI0",
          x: 160, y: 200, w: 560, h: 740,
          event: "helpZoneLucas",
          lucasX: 380,
          lucasY: G,
          facing: 1,
          celebrateX: 1580,
          buoys: [
            { x: 520, y: 892, w: 168, oscAmp: 7, sinkDepth: 22 },
            { x: 770, y: 874, w: 168, oscAmp: 10, sinkDepth: 24 },
            { x: 1020, y: 888, w: 168, oscAmp: 8, sinkDepth: 22 },
            { x: 1270, y: 870, w: 168, oscAmp: 11, sinkDepth: 24 },
          ],
        },
        {
          id: "detourI0",
          x: 460, y: 200, w: 1080, h: 800,
          event: "faiscaDetour",
          pathX: 1520,
          pathY: G - 2,
          reunionX: 1620,
          reunionY: G,
        },
      ],
      checkpoints: [{ id: "I0", x: 200 }],
      hints: [
        { id: "lucas_boias", x: 240, text: "O Lucas ligou o aparelho! Pule pelas boias flutuantes com {jump} (elas cedem um pouco com o peso)" },
      ],
    },

    /* ==================== I1: Esconderijo na Margem + Segunda Travessia ==================== */
    {
      id: "I1", x0: 1920, x1: 3840,
      ground: [
        { x: 1920, w: 740, y: G, tiles: "sand" },
        { x: 3600, w: 240, y: G, tiles: "sand" },
      ],
      blocks: [
        { x: 2140, y: 660, w: 320, h: 120, tiles: "rock", wet: true }, // teto da toca na margem (vão de 120 px para agachar)
      ],
      water: [
        { x: 2660, w: 940, y: 946, stream: true, respawn: { x: 2540, y: G - 2 } },
      ],
      platforms: [
        { x: 2980, y: 520, w: 256, kind: "log" },
      ],
      decor: [
        { kind: "boulder", x: 2120, y: G + 10, scale: 0.94 },
        { kind: "fern", x: 2470, y: G + 12, front: true },
        { kind: "tree", x: 3108, y: G + 60, scale: 1.08 },
        { kind: "moss_rock", x: 3630, y: G + 8 },
      ],
      secrets: [
        {
          id: "margem-lucas",
          sniffX: 2080,
          zone: { x: 2140, y: 780, w: 320, h: 120 },
          cover: { x: 2130, y: 770, w: 340, h: 140 },
        },
      ],
      shells: [
        { id: "f3I-G1", x: 2300, y: 846, gold: true },
        { id: "f3I-06", x: 2260, y: 600 },
        { id: "f3I-07", x: 2774, y: 805 },
        { id: "f3I-08", x: 3004, y: 780 },
        { id: "f3I-09", x: 3234, y: 795 },
        { id: "f3I-10", x: 3464, y: 775 },
      ],
      enemies: [
        { type: "crab", x: 2040, minX: 1950, maxX: 2110 },
        { type: "monkey", x: 3108, y: 520, minX: 3000, maxX: 3210 },
      ],
      triggers: [
        {
          id: "lucasI1",
          x: 2380, y: 200, w: 500, h: 740,
          event: "helpZoneLucas",
          lucasX: 2580,
          lucasY: G,
          facing: 1,
          celebrateX: 3620,
          buoys: [
            { x: 2690, y: 890, w: 168, oscAmp: 9, sinkDepth: 22 },
            { x: 2920, y: 868, w: 168, oscAmp: 12, sinkDepth: 25 },
            { x: 3150, y: 884, w: 168, oscAmp: 10, sinkDepth: 22 },
            { x: 3380, y: 864, w: 168, oscAmp: 12, sinkDepth: 25 },
          ],
        },
      ],
      checkpoints: [{ id: "I1", x: 2020 }],
    },

    /* ==================== I2: Corredeira Larga (5 boias + cipó no centro) ==================== */
    {
      id: "I2", x0: 3840, x1: 5760,
      ground: [
        { x: 3840, w: 380, y: G, tiles: "sand" },
        { x: 5460, w: 300, y: G, tiles: "sand" },
      ],
      water: [
        { x: 4220, w: 1240, y: 946, stream: true, respawn: { x: 4080, y: G - 2 } },
      ],
      ropes: [
        { id: "ropeI2", ropeX: 4840, topY: 360, bottomY: 740, deployed: true },
      ],
      decor: [
        { kind: "tree", x: 3960, y: G + 20, scale: 1.06 },
        { kind: "moss_rock", x: 4190, y: G + 8 },
        { kind: "vine", x: 4620, y: 400 },
        { kind: "vine", x: 5060, y: 400 },
        { kind: "moss_rock", x: 5490, y: G + 8 },
        { kind: "fern", x: 5620, y: G + 12, front: true },
      ],
      shells: [
        { id: "f3I-11", x: 4344, y: 805 },
        { id: "f3I-12", x: 4574, y: 775 },
        { id: "f3I-13", x: 4840, y: 640 },
        { id: "f3I-14", x: 5034, y: 775 },
        { id: "f3I-15", x: 5264, y: 800 },
        { id: "f3I-16", x: 5580, y: 820 },
      ],
      triggers: [
        {
          id: "lucasI2",
          x: 3880, y: 200, w: 540, h: 740,
          event: "helpZoneLucas",
          lucasX: 4130,
          lucasY: G,
          facing: 1,
          celebrateX: 5480,
          buoys: [
            { x: 4260, y: 892, w: 168, oscAmp: 8, sinkDepth: 22 },
            { x: 4490, y: 862, w: 168, oscAmp: 12, sinkDepth: 26 },
            { x: 4720, y: 886, w: 168, oscAmp: 10, sinkDepth: 24 },
            { x: 4950, y: 860, w: 168, oscAmp: 12, sinkDepth: 26 },
            { x: 5180, y: 884, w: 168, oscAmp: 9, sinkDepth: 22 },
          ],
        },
        {
          id: "detourI2",
          x: 4200, y: 200, w: 1240, h: 800,
          event: "faiscaDetour",
          pathX: 5420,
          pathY: G - 2,
          reunionX: 5520,
          reunionY: G,
        },
      ],
      checkpoints: [{ id: "I2", x: 3980 }],
      vistas: [{ x0: 4200, x1: 5460, zoom: 0.94 }],
    },

    /* ==================== I3: Última Travessia do Riacho e Saída rumo à Cachoeira ==================== */
    {
      id: "I3", x0: 5760, x1: 7680,
      ground: [
        { x: 5760, w: 320, y: G, tiles: "sand" },
        { x: 7040, w: 640, y: G, tiles: "sand" },
      ],
      water: [
        { x: 6080, w: 960, y: 946, stream: true, respawn: { x: 5960, y: G - 2 } },
      ],
      decor: [
        { kind: "moss_rock", x: 6050, y: G + 8 },
        { kind: "tree", x: 7180, y: G + 20, scale: 1.07, flip: true },
        { kind: "fern", x: 7310, y: G + 12, front: true },
        { kind: "sign_end", x: 7440, y: G + 6 },
      ],
      shells: [
        { id: "f3I-17", x: 6204, y: 805 },
        { id: "f3I-18", x: 6434, y: 780 },
        { id: "f3I-19", x: 6664, y: 795 },
        { id: "f3I-20", x: 6894, y: 775 },
        { id: "f3I-21", x: 7280, y: 820 },
      ],
      triggers: [
        {
          id: "lucasI3",
          x: 5780, y: 200, w: 480, h: 740,
          event: "helpZoneLucas",
          lucasX: 6000,
          lucasY: G,
          facing: 1,
          celebrateX: 7060,
          buoys: [
            { x: 6120, y: 892, w: 168, oscAmp: 8, sinkDepth: 22 },
            { x: 6350, y: 868, w: 168, oscAmp: 11, sinkDepth: 25 },
            { x: 6580, y: 884, w: 168, oscAmp: 9, sinkDepth: 22 },
            { x: 6810, y: 864, w: 168, oscAmp: 11, sinkDepth: 25 },
          ],
        },
        { id: "fimI", x: 7480, y: 0, w: 200, h: 1080, event: "end" },
      ],
      checkpoints: [{ id: "I3", x: 7220 }],
      vistas: [{ x0: 7060, x1: 7680, zoom: 0.94 }],
    },
  ],
};
