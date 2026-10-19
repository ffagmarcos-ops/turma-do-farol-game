// @ts-nocheck
/**
 * SETOR K — Gruta Secreta (Passo 10).
 * 2 chunks de 1920 px = 3840 px (~2 min).
 * Novidades:
 * - Cenário subterrâneo místico com paredões azuis escuros e cristais bioluminescentes reluzentes.
 * - Plataformas de pedra cristalina e lagos subterrâneos calmos.
 * - Orbe de energia (f3_orbe_energia) que recarrega instantaneamente o latido especial do Faísca.
 * - Grande Relíquia da História Antiga da Ilha (f3_reliquia_historia) no pedestal da câmara central.
 * - Placa "Continua…" no final de K1 marcando o encerramento comemorativo do Passo 10.
 */
const G = 900;

export const SETOR_K = {
  id: "K",
  name: "Gruta Secreta",
  art: "K",
  length: 3840,
  groundY: G,
  ambient: "floresta",
  chunks: [
    /* ==================== K0: Entrada da Caverna e Lago dos Cristais ==================== */
    {
      id: "K0", x0: 0, x1: 1920,
      ground: [
        { x: 0, w: 620, y: G, tiles: "sand" },
        { x: 1480, w: 440, y: G, tiles: "sand" },
      ],
      water: [
        { x: 620, w: 860, y: 946, stream: false, respawn: { x: 480, y: G - 2 } },
      ],
      platforms: [
        { x: 680, y: 760, w: 200, kind: "ledge" },
        { x: 980, y: 640, w: 220, kind: "ledge" },
        { x: 1260, y: 740, w: 190, kind: "ledge" },
      ],
      energyOrbs: [
        { id: "f3K-orb", x: 1090, y: 550 },
      ],
      decor: [
        { kind: "crystal", x: 260, y: G + 10, scale: 0.95 },
        { kind: "crystal", x: 540, y: G + 10, scale: 1.1, flip: true },
        { kind: "crystal", x: 1540, y: G + 10, scale: 1.05 },
        { kind: "crystal", x: 1820, y: G + 10, scale: 0.9 },
      ],
      shells: [
        { id: "f3K-01", x: 380, y: 830 },
        { id: "f3K-02", x: 770, y: 690 },
        { id: "f3K-03", x: 990, y: 560 },
        { id: "f3K-04", x: 1190, y: 560 },
        { id: "f3K-05", x: 1350, y: 670 },
        { id: "f3K-06", x: 1640, y: 830 },
      ],
      checkpoints: [{ id: "K0", x: 200 }],
      hints: [
        { id: "gruta_cristais", x: 280, text: "Uma caverna secreta com cristais brilhantes! Aquele orbe no alto parece emitir uma energia revigorante." },
      ],
    },

    /* ==================== K1: Altar da Relíquia Antiga e Fim do Passo 10 ==================== */
    {
      id: "K1", x0: 1920, x1: 3840,
      ground: [
        { x: 1920, w: 680, y: G, tiles: "sand" },
        { x: 3180, w: 660, y: G, tiles: "sand" },
      ],
      blocks: [
        { x: 2680, y: 600, w: 380, h: 320, tiles: "rock" }, // pedestal da relíquia
      ],
      water: [
        { x: 2600, w: 80, y: 946, respawn: { x: 2480, y: G - 2 } },
        { x: 3060, y: 946, w: 120, respawn: { x: 3240, y: G - 2 } },
      ],
      platforms: [
        { x: 2360, y: 740, w: 200, kind: "ledge" },
        { x: 2720, y: 480, w: 300, kind: "ledge" },
      ],
      relics: [
        { id: "f3K-relic", x: 2870, y: 410 },
      ],
      decor: [
        { kind: "crystal", x: 2140, y: G + 10, scale: 1.15 },
        { kind: "crystal", x: 2420, y: G + 10, scale: 0.95, flip: true },
        { kind: "crystal", x: 2740, y: 480, scale: 0.85 },
        { kind: "crystal", x: 2990, y: 480, scale: 0.85, flip: true },
        { kind: "crystal", x: 3340, y: G + 10, scale: 1.2 },
        { kind: "sign_end", x: 3620, y: G + 6 },
      ],
      shells: [
        { id: "f3K-07", x: 2240, y: 830 },
        { id: "f3K-08", x: 2460, y: 670 },
        { id: "f3K-G1", x: 2870, y: 310, gold: true },
        { id: "f3K-09", x: 3380, y: 830 },
        { id: "f3K-10", x: 3540, y: 830 },
      ],
      triggers: [
        { id: "fimK", x: 3660, y: 0, w: 200, h: 1080, event: "end" },
      ],
      checkpoints: [{ id: "K1", x: 2100 }],
      vistas: [{ x0: 2540, x1: 3840, zoom: 0.94 }],
      hints: [
        { id: "reliquia_altar", x: 2280, text: "Uma relíquia ancestral dos antigos guardiões da ilha! O Faísca late em aprovação." },
      ],
    },
  ],
};
