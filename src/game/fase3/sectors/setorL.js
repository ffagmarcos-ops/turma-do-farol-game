// @ts-nocheck
/**
 * SETOR L — Caminho Escondido da Bia (Passo 11).
 * 4 chunks de 1920 px = 7680 px (~4 min).
 * Novidades:
 * - Cenário de floresta tropical com árvores colossais e copas altas (canopyLayer).
 * - Monólito de pedra rúnica com entalhes antigos sem texto (ancient_rune_stone).
 * - A Bia observa os símbolos com sua lupa e indica com gesto de apontar a passagem escondida nas copas (helpZoneBia).
 * - Duas rotas com opções de jogabilidade:
 *   - Rota Inferior (Principal): trilha terrestre clássica pelo solo da mata.
 *   - Rota Superior (Opcional): plataformas altas nas copas com cipós, conchas extras e a concha dourada f3L-G1.
 * - As rotas se reencontram de forma fluida antes do dossel e lago límpido em L3.
 */
const G = 900;

export const SETOR_L = {
  id: "L",
  name: "Caminho Escondido da Bia",
  art: "L",
  length: 7680,
  groundY: G,
  ambient: "floresta",
  chunks: [
    /* ==================== L0: Entrada nas Copas e Encontro com a Bia ==================== */
    {
      id: "L0", x0: 0, x1: 1920,
      ground: [
        { x: 0, w: 720, y: G, tiles: "sand" },
        { x: 1380, w: 540, y: G, tiles: "sand" },
      ],
      water: [
        { x: 720, w: 660, y: 946, stream: true, respawn: { x: 580, y: G - 2 } },
      ],
      platforms: [
        { x: 780, y: 780, w: 200, kind: "log" },
        { x: 1080, y: 760, w: 220, kind: "log" },
      ],
      decor: [
        { kind: "tree", x: 140, y: G + 20, scale: 1.1 },
        { kind: "ancient_rune_stone", x: 480, y: G + 10 },
        { kind: "fern", x: 580, y: G + 10, front: true },
        { kind: "tree", x: 1480, y: G + 20, scale: 1.15, flip: true },
        { kind: "moss_rock", x: 1720, y: G + 8 },
      ],
      shells: [
        { id: "f3L-01", x: 280, y: 820 },
        { id: "f3L-02", x: 620, y: 650 },
        { id: "f3L-03", x: 880, y: 510 },
        { id: "f3L-04", x: 1160, y: 490 },
        { id: "f3L-05", x: 1540, y: 820 },
      ],
      triggers: [
        {
          id: "biaL0",
          x: 160, y: 200, w: 520, h: 740,
          event: "helpZoneBia",
          biaX: 380,
          biaY: G,
          facing: 1,
          celebrateX: 1580,
          secretPlatforms: [
            { x: 520, y: 720, w: 200, kind: "log" },
            { x: 780, y: 580, w: 220, kind: "log" },
            { x: 1060, y: 470, w: 220, kind: "log" },
            { x: 1340, y: 560, w: 200, kind: "log" },
          ],
        },
      ],
      checkpoints: [{ id: "L0", x: 200 }],
      hints: [
        { id: "bia_marcas", x: 240, text: "A Bia está examinando as marcas na pedra antiga! Aproxime-se dela." },
      ],
    },

    /* ==================== L1: Bifurcação das Rotas (Solo vs. Copas Altas) ==================== */
    {
      id: "L1", x0: 1920, x1: 3840,
      ground: [
        { x: 1920, w: 1920, y: G, tiles: "sand" }, // Rota inferior contínua no chão
      ],
      blocks: [
        { x: 2640, y: 640, w: 320, h: 140, tiles: "rock" },
      ],
      // Rota Superior: plataformas suspensas e galhos altos
      platforms: [
        { x: 2060, y: 580, w: 220, kind: "log" },
        { x: 2360, y: 460, w: 240, kind: "log", sway: true, speed: 1.5, ropeTopY: 180 },
        { x: 2700, y: 380, w: 260, kind: "log" },
        { x: 3080, y: 460, w: 220, kind: "log", sway: true, speed: 1.6, ropeTopY: 180 },
        { x: 3420, y: 560, w: 240, kind: "log" },
      ],
      decor: [
        { kind: "tree", x: 2180, y: G + 20, scale: 1.12 },
        { kind: "bush", x: 2460, y: G + 10 },
        { kind: "fern", x: 2980, y: G + 10, front: true },
        { kind: "moss_rock", x: 3340, y: G + 8 },
        { kind: "tree", x: 3680, y: G + 20, scale: 1.18, flip: true },
      ],
      secrets: [
        {
          id: "ninho-copas",
          sniffX: 2720,
          zone: { x: 2680, y: 260, w: 280, h: 120 },
          cover: { x: 2660, y: 250, w: 310, h: 140 },
        },
      ],
      shells: [
        { id: "f3L-06", x: 2170, y: 500 },
        { id: "f3L-G1", x: 2820, y: 290, gold: true }, // Concha dourada no ninho das copas!
        { id: "f3L-07", x: 2480, y: 380 },
        { id: "f3L-08", x: 3190, y: 380 },
        { id: "f3L-09", x: 2540, y: 820 }, // Rota inferior
        { id: "f3L-10", x: 3120, y: 820 }, // Rota inferior
      ],
      enemies: [
        { type: "crab", x: 2420, minX: 2100, maxX: 2600 },
        { type: "monkey", x: 2820, y: 640, minX: 2720, maxX: 2920 },
      ],
      checkpoints: [{ id: "L1", x: 2040 }],
      vistas: [{ x0: 2420, x1: 3480, zoom: 0.94 }],
    },

    /* ==================== L2: Atalho Alto da Bia e Desvio de Macacos ==================== */
    {
      id: "L2", x0: 3840, x1: 5760,
      ground: [
        { x: 3840, w: 740, y: G, tiles: "sand" },
        { x: 5020, w: 740, y: G, tiles: "sand" },
      ],
      blocks: [
        { x: 4160, y: 620, w: 260, h: 280, tiles: "rock" }, // platô da Bia
      ],
      water: [
        { x: 4580, w: 440, y: 946, stream: true, respawn: { x: 4460, y: G - 2 } },
      ],
      platforms: [
        { x: 4620, y: 780, w: 180, kind: "log" },
        { x: 4900, y: 760, w: 190, kind: "log" },
      ],
      decor: [
        { kind: "tree", x: 3960, y: G + 20, scale: 1.15 },
        { kind: "ancient_rune_stone", x: 4220, y: 620 },
        { kind: "fern", x: 4450, y: G + 10, front: true },
        { kind: "tree", x: 5240, y: G + 20, scale: 1.2, flip: true },
      ],
      triggers: [
        {
          id: "biaL2",
          x: 3980, y: 200, w: 500, h: 740,
          event: "helpZoneBia",
          biaX: 4320,
          biaY: 620,
          facing: 1,
          celebrateX: 5120,
          secretPlatforms: [
            { x: 4460, y: 460, w: 220, kind: "log" },
            { x: 4760, y: 440, w: 240, kind: "log" },
            { x: 5080, y: 520, w: 200, kind: "log" },
          ],
        },
      ],
      shells: [
        { id: "f3L-11", x: 4080, y: 820 },
        { id: "f3L-12", x: 4570, y: 380 },
        { id: "f3L-13", x: 4880, y: 360 },
        { id: "f3L-14", x: 4710, y: 700 },
        { id: "f3L-15", x: 5240, y: 820 },
        { id: "f3L-16", x: 5520, y: 820 },
      ],
      enemies: [
        { type: "monkey", x: 4720, y: 780, minX: 4640, maxX: 4880 },
        { type: "crab", x: 5360, minX: 5180, maxX: 5580 },
      ],
      checkpoints: [{ id: "L2", x: 3980 }],
      hints: [
        { id: "bia_atalho", x: 4040, text: "A Bia encontrou outro caminho suspenso! Pule pelas copas para evitar os macacos abaixo." },
      ],
    },

    /* ==================== L3: Reencontro das Rotas, Dossel e Encerramento ==================== */
    {
      id: "L3", x0: 5760, x1: 7680,
      ground: [
        { x: 5760, w: 780, y: G, tiles: "sand" },
        { x: 6980, w: 700, y: G, tiles: "sand" },
      ],
      blocks: [
        { x: 6360, y: 580, w: 340, h: 340, tiles: "rock" },
      ],
      water: [
        { x: 6540, w: 440, y: 946, stream: true, respawn: { x: 6420, y: G - 2 } },
      ],
      platforms: [
        { x: 6180, y: 720, w: 200, kind: "log" },
        { x: 6420, y: 460, w: 220, kind: "log" },
        { x: 6780, y: 680, w: 220, kind: "log" },
      ],
      decor: [
        { kind: "tree", x: 5880, y: G + 20, scale: 1.25 },
        { kind: "fern", x: 6240, y: G + 10, front: true },
        { kind: "ancient_rune_stone", x: 6440, y: 580 },
        { kind: "tree", x: 7120, y: G + 20, scale: 1.22, flip: true },
        { kind: "moss_rock", x: 7320, y: G + 8 },
      ],
      shells: [
        { id: "f3L-17", x: 5940, y: 820 },
        { id: "f3L-18", x: 6280, y: 640 },
        { id: "f3L-19", x: 6530, y: 390 },
        { id: "f3L-20", x: 6890, y: 600 },
        { id: "f3L-21", x: 7240, y: 820 },
      ],
      triggers: [],
      checkpoints: [{ id: "L3", x: 5960 }],
      vistas: [{ x0: 6200, x1: 7680, zoom: 0.92 }],
    },
  ],
};
