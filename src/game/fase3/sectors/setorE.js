// @ts-nocheck
/**
 * SETOR E — Floresta Densa (Passo 5).
 * 4 chunks de 1920 px = 7680 px (~4 min).
 * Novidades:
 * - Mata fechada com raízes, troncos ocos (passagem agachada), cipós pendurados e galhos em várias alturas.
 * - Plataformas na vertical e na horizontal (incluindo plataformas que oscilam em X e Y).
 * - Macacos nos galhos de cima + caranguejos patrulhando no chão embaixo.
 * - Área segura no meio do setor (clareira calma no início de E2, com checkpoint e sem inimigos).
 * - Esconderijo secreto sob tronco/raízes (E1) farejado pelo Faísca com a concha dourada f3E-G1.
 */
const G = 900;

export const SETOR_E = {
  id: "E",
  name: "Floresta Densa",
  art: "E",
  length: 7680,
  groundY: G,
  ambient: "floresta",
  chunks: [
    /* ==================== E0: Entrada da Mata Densa + Tronco Oco ==================== */
    {
      id: "E0", x0: 0, x1: 1920,
      ground: [{ x: 0, w: 1920, tiles: "sand" }],
      // Teto baixo formando o vão do tronco oco / raízes entre x=760 e x=1120 (passagem agachada y=765..900)
      blocks: [
        { x: 760, y: 680, w: 360, h: 85, tiles: "rock" },
      ],
      platforms: [
        { x: 340, y: 740, w: 256, kind: "log" },
        { x: 560, y: 600, w: 256, kind: "log" },
        { x: 1180, y: 720, w: 256, kind: "log" },
        // Plataforma que sobe e desce (vertical) levando aos galhos altos
        { x: 1480, y: 660, w: 192, kind: "log", moveY: 85, speed: 1.7, phase: 0 },
      ],
      decor: [
        { kind: "tree", x: 220, y: G + 20, scale: 1.08 },
        { kind: "vine", x: 460, y: 420 },
        { kind: "roots", x: 760, y: G + 10 },
        { kind: "hollow_log", x: 940, y: G + 8, front: true },
        { kind: "vine", x: 1080, y: 440 },
        { kind: "tree", x: 1320, y: G + 20, scale: 1.12, flip: true },
        { kind: "fern", x: 640, y: G + 12, front: true },
        { kind: "bush", x: 1680, y: G + 14, front: true },
      ],
      shells: [
        { id: "f3E-01", x: 420, y: 680 },
        { id: "f3E-02", x: 680, y: 540 },
        { id: "f3E-03", x: 880, y: 840 },
        { id: "f3E-04", x: 1000, y: 840 },
        { id: "f3E-05", x: 1300, y: 660 },
        { id: "f3E-06", x: 1576, y: 520 },
      ],
      enemies: [
        { type: "crab", x: 520, minX: 280, maxX: 720 },
        { type: "monkey", x: 680, y: 600, minX: 580, maxX: 780 },
        { type: "crab", x: 1380, minX: 1160, maxX: 1760 },
        { type: "monkey", x: 1300, y: 720, minX: 1200, maxX: 1400 },
      ],
      hints: [
        { id: "hintE0", x: 180, text: "Mata Densa: passe agachada ({down}) nos troncos ocos e use as plataformas móveis!" },
      ],
      checkpoints: [{ id: "E0", x: 160 }],
    },

    /* ==================== E1: Plataformas Verticais/Horizontais + Segredo do Faísca ==================== */
    {
      id: "E1", x0: 1920, x1: 3840,
      ground: [
        { x: 1920, w: 660, tiles: "sand" },
        { x: 3000, w: 840, tiles: "sand" },
      ],
      water: [
        { x: 2580, w: 420, y: 925, respawn: { x: 2480, y: 880 } },
      ],
      // Bloco de pedra e raízes que esconde a toca secreta (entrada agachada pela esquerda em x=3280)
      blocks: [
        { x: 3280, y: 680, w: 380, h: 80, tiles: "rock" },
        { x: 3280, y: 760, w: 40, h: 20, tiles: "rock" },
        { x: 3620, y: 760, w: 40, h: 140, tiles: "rock" },
      ],
      platforms: [
        // Plataforma vertical na margem esquerda
        { x: 2220, y: 680, w: 192, kind: "log", moveY: 80, speed: 1.6, phase: 0.8 },
        // Galho alto com macaco
        { x: 2040, y: 520, w: 256, kind: "log" },
        // Plataforma horizontal cruzando o riacho da mata
        { x: 2680, y: 740, w: 192, kind: "ledge", moveX: 105, speed: 1.5, phase: 0 },
        // Galho alto após o riacho
        { x: 3040, y: 580, w: 256, kind: "log" },
        // Laje sobre o esconderijo secreto
        { x: 3340, y: 550, w: 256, kind: "ledge" },
      ],
      ropes: [
        { id: "ropeE1", ropeX: 2790, topY: 440, bottomY: 810, deployed: true },
      ],
      secrets: [
        {
          id: "tronco-secreto-e",
          sniffX: 3210,
          zone: { x: 3310, y: 760, w: 310, h: 140 },
          cover: { x: 3280, y: 680, w: 380, h: 220 },
        },
      ],
      decor: [
        { kind: "tree", x: 2140, y: G + 20, scale: 1.06 },
        { kind: "vine", x: 2480, y: 410 },
        { kind: "vine", x: 2920, y: 420 },
        { kind: "roots", x: 3280, y: 552 },
        { kind: "hollow_log", x: 3460, y: 548 },
        { kind: "fern", x: 3160, y: G + 12, front: true },
      ],
      shells: [
        { id: "f3E-07", x: 2280, y: 560 },
        { id: "f3E-08", x: 2780, y: 640 },
        { id: "f3E-09", x: 3160, y: 520 },
        { id: "f3E-10", x: 3390, y: 845 },
        { id: "f3E-11", x: 3480, y: 845 },
        { id: "f3E-G1", x: 3580, y: 838, gold: true },
      ],
      enemies: [
        { type: "monkey", x: 2160, y: 520, minX: 2060, maxX: 2260 },
        { type: "crab", x: 2380, minX: 2040, maxX: 2520 },
        { type: "monkey", x: 3160, y: 580, minX: 3060, maxX: 3260 },
      ],
      checkpoints: [{ id: "E1", x: 2040 }],
    },

    /* ==================== E2: Clareira Segura no Meio + Retomada Densa ==================== */
    {
      id: "E2", x0: 3840, x1: 5760,
      ground: [{ x: 3840, w: 1920, tiles: "sand" }],
      platforms: [
        // Galhos tranquilos na clareira segura (x = 3840..4640)
        { x: 4040, y: 740, w: 256, kind: "log" },
        { x: 4340, y: 620, w: 256, kind: "log" },
        // Segunda metade de E2: plataformas móveis + instáveis + macacos e caranguejos
        { x: 4780, y: 700, w: 192, kind: "log", moveX: 90, speed: 1.65, phase: 0.4 },
        { x: 5120, y: 620, w: 192, kind: "crumble", crumble: true },
        { x: 5380, y: 660, w: 192, kind: "log", moveY: 80, speed: 1.8, phase: 1.5 },
        { x: 5060, y: 470, w: 256, kind: "log" },
        { x: 5500, y: 500, w: 256, kind: "log" },
      ],
      decor: [
        { kind: "moss_rock", x: 3960, y: G + 8 },
        { kind: "tree", x: 4220, y: G + 20, scale: 1.05 },
        { kind: "fern", x: 4460, y: G + 12, front: true },
        { kind: "pebbles", x: 4320, y: G + 8, front: true },
        { kind: "vine", x: 4880, y: 430 },
        { kind: "tree", x: 5240, y: G + 20, scale: 1.12, flip: true },
        { kind: "vine", x: 5560, y: 420 },
        { kind: "bush", x: 5640, y: G + 14, front: true },
      ],
      shells: [
        { id: "f3E-12", x: 4168, y: 680 },
        { id: "f3E-13", x: 4468, y: 560 },
        { id: "f3E-14", x: 4876, y: 620 },
        { id: "f3E-15", x: 5216, y: 560 },
        { id: "f3E-16", x: 5476, y: 540 },
      ],
      enemies: [
        // Nenhum inimigo entre 3840 e 4680 (área segura no meio!)
        { type: "crab", x: 4920, minX: 4720, maxX: 5240 },
        { type: "monkey", x: 5180, y: 470, minX: 5080, maxX: 5280 },
        { type: "crab", x: 5480, minX: 5280, maxX: 5700 },
        { type: "monkey", x: 5620, y: 500, minX: 5520, maxX: 5720 },
      ],
      hints: [
        { id: "hintE2", x: 4000, text: "Clareira segura! Ponto de descanso antes do trecho mais fechado da mata." },
      ],
      checkpoints: [{ id: "E2", x: 4160 }],
      vistas: [{ x0: 3880, x1: 4600, zoom: 0.94 }],
    },

    /* ==================== E3: Ritmo Completo + Saída da Floresta Densa ==================== */
    {
      id: "E3", x0: 5760, x1: 7680,
      ground: [
        { x: 5760, w: 380, tiles: "sand" },
        { x: 6460, w: 1220, tiles: "sand" },
      ],
      water: [
        { x: 6140, w: 320, y: 925, respawn: { x: 6040, y: 880 } },
      ],
      // Segundo tronco oco / passagem baixa (x=6640..6940, agachar para passar)
      blocks: [
        { x: 6640, y: 680, w: 300, h: 85, tiles: "rock" },
      ],
      platforms: [
        { x: 5860, y: 720, w: 192, kind: "log" },
        { x: 6180, y: 680, w: 192, kind: "ledge", moveY: 70, speed: 1.7, phase: 0.5 },
        { x: 6660, y: 480, w: 256, kind: "log" },
        { x: 7020, y: 700, w: 256, kind: "log", moveX: 80, speed: 1.5, phase: 1.1 },
      ],
      ropes: [
        { id: "ropeE3", ropeX: 6300, topY: 440, bottomY: 810, deployed: true },
      ],
      decor: [
        { kind: "vine", x: 6020, y: 420 },
        { kind: "roots", x: 6640, y: G + 10 },
        { kind: "hollow_log", x: 6790, y: G + 8, front: true },
        { kind: "tree", x: 7160, y: G + 20, scale: 1.08 },
        { kind: "fern", x: 7320, y: G + 12, front: true },
        { kind: "sign_end", x: 7440, y: G + 6 },
      ],
      shells: [
        { id: "f3E-17", x: 5956, y: 660 },
        { id: "f3E-18", x: 6300, y: 580 },
        { id: "f3E-19", x: 6790, y: 840 },
        { id: "f3E-20", x: 6790, y: 420 },
        { id: "f3E-21", x: 7148, y: 620 },
      ],
      enemies: [
        { type: "monkey", x: 6780, y: 480, minX: 6680, maxX: 6880 },
        { type: "crab", x: 7080, minX: 6960, maxX: 7340 },
      ],
      triggers: [
        { id: "fimE", x: 7480, y: 0, w: 200, h: 1080, event: "end" },
      ],
      checkpoints: [{ id: "E3", x: 7260 }],
      vistas: [{ x0: 7160, x1: 7680, zoom: 0.94 }],
    },
  ],
};
