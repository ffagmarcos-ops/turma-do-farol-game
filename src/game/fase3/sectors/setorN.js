// @ts-nocheck
/**
 * SETOR N — Ruínas Antigas (Passo 13).
 * 4 chunks de 1920 px = 7680 px (~3-4 min).
 * Novidades:
 * - A vegetação diminui gradualmente, revelando estruturas ciclópicas de pedra talhada.
 * - Pilares esculpidos (ruin_pillar), arcos ancestrais monumentais (ruin_arch) e pedestais (ancient_pedestal) com símbolos abstratos e espirais (sem texto per AGENTS.md).
 * - A névoa e a iluminação azulada translúcida da caverna começam a surgir ao fundo.
 * - Plataformas de lajes antigas, degraus talhados, plataformas móveis e instáveis.
 * - Checkpoints N0, N1, N2 e N3.
 * - Segredo farejado pelo Faísca sob o arco desmoronado (camara-ruinas-n) com a concha dourada f3N-G1.
 * - Placa de encerramento em N3 anunciando o Passo 14 (Setor O — Entrada da Caverna / Encerramento).
 */
const G = 900;

export const SETOR_N = {
  id: "N",
  name: "Ruínas Antigas",
  art: "N",
  length: 7680,
  groundY: G,
  ambient: "ruinas",
  chunks: [
    /* ==================== N0: Entrada no Pátio das Ruínas ==================== */
    {
      id: "N0", x0: 0, x1: 1920,
      ground: [
        { x: 0, w: 740, y: G, tiles: "sand" },
        { x: 1280, w: 640, y: G, tiles: "sand" },
      ],
      water: [
        { x: 740, w: 540, y: 946, stream: true, respawn: { x: 620, y: G - 2 } },
      ],
      platforms: [
        // Lajes talhadas e degraus de pedra
        { x: 540, y: 760, w: 200, kind: "ledge" },
        { x: 800, y: 640, w: 220, kind: "ledge", sway: true },
        { x: 1080, y: 520, w: 200, kind: "ledge" },
        { x: 1360, y: 720, w: 240, kind: "ledge" },
        { x: 1680, y: 580, w: 220, kind: "ledge" },
      ],
      enemies: [
        { type: "crab", x: 420, minX: 280, maxX: 600 },
        { type: "monkey", x: 1100, y: 440 },
        { type: "crab", x: 1540, minX: 1380, maxX: 1780 },
      ],
      decor: [
        { kind: "ruin_pillar", x: 260, y: G + 10 },
        { kind: "ancient_rune_stone", x: 480, y: G + 8 },
        { kind: "fern", x: 680, y: G + 10, front: true },
        { kind: "ruin_arch", x: 1420, y: G + 10 },
        { kind: "ancient_pedestal", x: 1740, y: G + 8 },
      ],
      breakables: [
        { id: "parede-n0", x: 1210, y: G - 130, w: 70, h: 130, tiles: "rock" },
      ],
      shells: [
        { id: "f3N-01", x: 340, y: 820 },
        { id: "f3N-02", x: 640, y: 690 },
        { id: "f3N-03", x: 910, y: 570 },
        { id: "f3N-04", x: 1180, y: 450 },
        { id: "f3N-04b", x: 1250, y: G - 40 },
        { id: "f3N-05", x: 1540, y: 820 },
      ],
      checkpoints: [{ id: "N0", x: 100 }],
      vistas: [{ x0: 400, x1: 1500, zoom: 0.94 }],
    },

    /* ==================== N1: Galeria dos Arcos e Câmara Secreta ==================== */
    {
      id: "N1", x0: 1920, x1: 3840,
      ground: [
        { x: 1920, w: 620, y: G, tiles: "sand" },
        { x: 2700, w: 320, y: G, tiles: "sand" }, // terraço intermediário
        { x: 3280, w: 560, y: G, tiles: "sand" },
      ],
      water: [
        { x: 2540, w: 160, y: 946, stream: true, respawn: { x: 2420, y: G - 2 } },
        { x: 3020, w: 260, y: 946, stream: true, respawn: { x: 2880, y: G - 2 } },
      ],
      platforms: [
        // Plataforma móvel horizontal de laje de pedra
        { x: 2200, y: 680, w: 180, kind: "ledge", moveX: 160, speed: 60 },
        { x: 2520, y: 540, w: 200, kind: "ledge" },
        // Laje instável perto da câmara secreta
        { x: 2780, y: 600, w: 160, kind: "crumble", crumble: true },
        // Plataforma da câmara alta das ruínas (acesso à concha dourada)
        { x: 2940, y: 380, w: 220, kind: "ledge" },
        // Plataforma móvel vertical
        { x: 3340, y: 620, w: 200, kind: "ledge", moveY: 130, speed: 60 },
        { x: 3620, y: 520, w: 200, kind: "ledge" },
      ],
      enemies: [
        { type: "monkey", x: 2360, y: 360 },
        { type: "crab", x: 2780, minX: 2720, maxX: 2920 },
        { type: "monkey", x: 3120, y: 440 },
        { type: "crab", x: 3540, minX: 3380, maxX: 3760 },
      ],
      decor: [
        { kind: "ruin_pillar", x: 2080, y: G + 10 },
        { kind: "ancient_pedestal", x: 2480, y: G + 8 },
        { kind: "ruin_arch", x: 2880, y: 460 },
        { kind: "ancient_rune_stone", x: 3360, y: G + 8 },
        { kind: "moss_rock", x: 3720, y: G + 8 },
      ],
      secrets: [
        {
          id: "camara-ruinas-n",
          sniffX: 2840,
          zone: { x: 2880, y: 280, w: 320, h: 180 },
          cover: { x: 2860, y: 260, w: 350, h: 200 },
        },
      ],
      shells: [
        { id: "f3N-06", x: 2220, y: 610 },
        { id: "f3N-G1", x: 3040, y: 310, gold: true }, // Concha dourada na câmara secreta das ruínas!
        { id: "f3N-07", x: 2610, y: 470 },
        { id: "f3N-08", x: 2820, y: 820 },
        { id: "f3N-09", x: 3180, y: 550 },
        { id: "f3N-10", x: 3480, y: 560 },
      ],
      checkpoints: [{ id: "N1", x: 2020 }],
    },

    /* ==================== N2: Santuário dos Pilares e Névoa Azul ==================== */
    {
      id: "N2", x0: 3840, x1: 5760,
      ground: [
        // Clareira mística segura no início
        { x: 3840, w: 680, y: G, tiles: "sand" },
        { x: 4560, w: 660, y: G, tiles: "sand" },
        { x: 5380, w: 380, y: G, tiles: "sand" },
      ],
      blocks: [
        // Laje suspensa para passagem agachada
        { x: 4620, y: 760, w: 340, h: 48, tiles: "rock" },
      ],
      water: [
        { x: 5220, w: 160, y: 946, stream: true, respawn: { x: 5120, y: G - 2 } },
      ],
      platforms: [
        { x: 4280, y: 740, w: 200, kind: "ledge" },
        { x: 4580, y: 580, w: 240, kind: "ledge", sway: true },
        { x: 4920, y: 460, w: 220, kind: "ledge" },
        // Plataforma de pedra móvel vertical
        { x: 5160, y: 640, w: 200, kind: "ledge", moveY: 150, speed: 65 },
        { x: 5460, y: 500, w: 220, kind: "ledge" },
      ],
      enemies: [
        // Sem inimigos na área segura inicial x=3840..4280!
        { type: "monkey", x: 4740, y: 280 },
        { type: "crab", x: 4940, minX: 4780, maxX: 5140 },
        { type: "monkey", x: 5360, y: 390 },
        { type: "crab", x: 5540, minX: 5420, maxX: 5700 },
      ],
      decor: [
        { kind: "ruin_pillar", x: 4020, y: G + 10 },
        { kind: "ancient_pedestal", x: 4240, y: G + 8 },
        { kind: "ruin_arch", x: 4720, y: G + 10 },
        { kind: "ruin_pillar", x: 5120, y: G + 10 },
        { kind: "ancient_rune_stone", x: 5540, y: G + 8 },
      ],
      shells: [
        { id: "f3N-11", x: 4160, y: 820 },
        { id: "f3N-12", x: 4380, y: 670 },
        { id: "f3N-13", x: 4760, y: 840 }, // Passagem agachada sob a laje do templo
        { id: "f3N-14", x: 4840, y: 390 },
        { id: "f3N-15", x: 5060, y: 390 },
        { id: "f3N-16", x: 5520, y: 430 },
      ],
      checkpoints: [{ id: "N2", x: 3940 }],
      vistas: [{ x0: 3840, x1: 4360, zoom: 0.94 }],
    },

    /* ==================== N3: Vestíbulo Monumental e Portal da Caverna ==================== */
    {
      id: "N3", x0: 5760, x1: 7680,
      ground: [
        { x: 5760, w: 520, y: G, tiles: "sand" },
        { x: 6880, w: 800, y: G, tiles: "sand" }, // Platô do portal da caverna
      ],
      water: [
        { x: 6280, w: 600, y: 946, stream: true, respawn: { x: 6160, y: G - 2 } },
      ],
      platforms: [
        // Escadaria e lajes que levam ao portal monumental
        { x: 6060, y: 720, w: 180, kind: "ledge" },
        { x: 6320, y: 580, w: 200, kind: "ledge", sway: true },
        { x: 6580, y: 460, w: 220, kind: "ledge" },
        { x: 6780, y: 580, w: 180, kind: "crumble", crumble: true },
        { x: 7040, y: 680, w: 220, kind: "ledge" },
      ],
      enemies: [
        { type: "monkey", x: 6380, y: 400 },
        { type: "monkey", x: 6820, y: 380 },
        { type: "crab", x: 7240, minX: 7080, maxX: 7480 },
      ],
      decor: [
        { kind: "ruin_pillar", x: 5920, y: G + 10 },
        { kind: "ruin_arch", x: 6480, y: 380 },
        { kind: "ancient_pedestal", x: 7120, y: G + 8 },
        { kind: "ancient_rune_stone", x: 7320, y: G + 10 },
      ],
      shells: [
        { id: "f3N-17", x: 6000, y: 820 },
        { id: "f3N-18", x: 6180, y: 650 },
        { id: "f3N-19", x: 6460, y: 500 },
        { id: "f3N-20", x: 6720, y: 390 },
        { id: "f3N-21", x: 7280, y: 820 },
      ],
      triggers: [],
      checkpoints: [{ id: "N3", x: 5860 }],
      vistas: [{ x0: 6100, x1: 7680, zoom: 0.94 }],
    },
  ],
};
