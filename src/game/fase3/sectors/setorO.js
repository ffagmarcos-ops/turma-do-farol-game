// @ts-nocheck
/**
 * SETOR O — Entrada da Caverna Azul (Passo 14 — Grande Final da Fase 3).
 * 2 chunks de 1920 px = 3840 px (~2 min).
 *
 * Características e Sequência de Encerramento:
 * - O0: Trilha cerimonial de acesso, fenda com água pura cristalina, arcos antigos e cristais azuis cintilantes.
 * - O1: Mirante da Caverna Azul com vista para a colossal boca da caverna esculpida na montanha,
 *       concha dourada f3O-G1 no pedestal cerimonial e o trigger cinematográfico finalFase3 ("fase3Finale").
 * - Sequência final: Sofia para no mirante contemplando a caverna, Faísca corre e late feliz ao lado dela,
 *   e Seu Toninho, Marina, Júlia, Lucas e Bia chegam para a celebração e encerramento triunfante da Fase 3!
 */
const G = 900;

export const SETOR_O = {
  id: "O",
  name: "Entrada da Caverna",
  art: "O",
  length: 3840,
  groundY: G,
  ambient: "caverna_azul",
  chunks: [
    /* ==================== O0: Trilha de Acesso à Caverna ==================== */
    {
      id: "O0", x0: 0, x1: 1920,
      ground: [
        { x: 0, w: 820, y: G, tiles: "sand" },
        { x: 1220, w: 700, y: G, tiles: "sand" },
      ],
      water: [
        { x: 820, w: 400, y: 946, stream: true, respawn: { x: 700, y: G - 2 } },
      ],
      platforms: [
        { x: 520, y: 760, w: 200, kind: "ledge" },
        { x: 840, y: 650, w: 240, kind: "ledge", sway: true },
        { x: 1140, y: 550, w: 200, kind: "ledge" },
        { x: 1420, y: 720, w: 220, kind: "ledge" },
        { x: 1680, y: 600, w: 220, kind: "ledge" },
      ],
      enemies: [
        { type: "crab", x: 440, minX: 300, maxX: 640 },
        { type: "monkey", x: 1160, y: 470 },
        { type: "crab", x: 1560, minX: 1380, maxX: 1760 },
      ],
      decor: [
        { kind: "ruin_pillar", x: 220, y: G + 10 },
        { kind: "crystal", x: 420, y: G + 8 },
        { kind: "ruin_arch", x: 680, y: G + 10 },
        { kind: "crystal", x: 1260, y: G + 8 },
        { kind: "ancient_pedestal", x: 1540, y: G + 8 },
        { kind: "crystal", x: 1780, y: G + 8 },
      ],
      shells: [
        { id: "f3O-01", x: 340, y: 820 },
        { id: "f3O-02", x: 620, y: 690 },
        { id: "f3O-03", x: 960, y: 580 },
        { id: "f3O-04", x: 1240, y: 480 },
        { id: "f3O-05", x: 1530, y: 650 },
        { id: "f3O-06", x: 1790, y: 530 },
        { id: "f3O-07", x: 1860, y: 820 },
      ],
      triggers: [],
      checkpoints: [{ id: "O0", x: 120 }],
      vistas: [{ x0: 200, x1: 1800, zoom: 0.96 }],
    },

    /* ==================== O1: Mirante da Caverna Azul e Grande Encerramento ==================== */
    {
      id: "O1", x0: 1920, x1: 3840,
      ground: [
        // Platô cerimonial de pedra contínua que termina no mirante natural em x = 3480
        { x: 1920, w: 1600, y: G, tiles: "sand" },
      ],
      water: [],
      platforms: [
        // Degraus cerimoniais que levam até o pedestal ancestral com a concha dourada
        { x: 2360, y: 780, w: 220, kind: "ledge" },
        { x: 2620, y: 670, w: 220, kind: "ledge" },
        { x: 2900, y: 570, w: 260, kind: "ledge" },
      ],
      enemies: [
        { type: "crab", x: 2180, minX: 2020, maxX: 2320 },
      ],
      decor: [
        { kind: "ruin_pillar", x: 2020, y: G + 10 },
        { kind: "crystal", x: 2120, y: G + 8 },
        { kind: "ruin_arch", x: 2480, y: G + 10 },
        { kind: "crystal", x: 2740, y: G + 8 },
        { kind: "ancient_pedestal", x: 3020, y: 570 }, // Pedestal da concha dourada no topo
        { kind: "ruin_pillar", x: 3260, y: G + 10 },
        { kind: "crystal", x: 3380, y: G + 8 },
        { kind: "crystal", x: 3460, y: G + 8 },
      ],
      shells: [
        { id: "f3O-08", x: 2120, y: 820 },
        { id: "f3O-09", x: 2340, y: 820 },
        { id: "f3O-10", x: 2470, y: 710 },
        { id: "f3O-11", x: 2730, y: 600 },
        { id: "f3O-G1", x: 3020, y: 480, golden: true }, // Concha dourada cerimonial da Caverna Azul
        { id: "f3O-12", x: 3120, y: 820 },
        { id: "f3O-13", x: 3280, y: 820 },
        { id: "f3O-14", x: 3420, y: 820 },
      ],
      triggers: [
        // Trigger de encerramento da Fase 3 no mirante em frente à Caverna Azul
        { id: "finalFase3", x: 3340, y: 0, w: 200, h: 1080, event: "fase3Finale" },
      ],
      checkpoints: [{ id: "O1", x: 2060 }],
      vistas: [{ x0: 2100, x1: 3840, zoom: 0.92 }],
    },
  ],
};
