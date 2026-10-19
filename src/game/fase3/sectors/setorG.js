// @ts-nocheck
/**
 * SETOR G — Desfiladeiro (Passo 7).
 * 4 chunks de 1920 px = 7680 px (~5 min).
 * Novidades:
 * - Área vertical grande (de y=900 até y=380), com plataformas em várias alturas, cipós (ropes),
 *   plataformas suspensas que balançam (sway: true) e lajes que desmoronam (crumble).
 * - Sem inimigos nas plataformas mais estreitas para manter a subida e a travessia limpas e justas.
 * - O Faísca percorre uma rota alternativa pela base do desfiladeiro (faiscaDetour) e reencontra
 *   a Sofia nos platôs superiores.
 * - Vista aberta do mar ao fundo (vistas com zoom 0,94).
 */
const G = 900;

export const SETOR_G = {
  id: "G",
  name: "Desfiladeiro",
  art: "G",
  length: 7680,
  groundY: G,
  ambient: "costao",
  chunks: [
    /* ==================== G0: Entrada do Desfiladeiro + Travessia Suspensa + Rota do Faísca ==================== */
    {
      id: "G0", x0: 0, x1: 1920,
      ground: [
        { x: 0, w: 460, y: 620, tiles: "rock" },     // emenda direta com o platô alto de F3 (y=620)
        { x: 460, w: 1040, y: G, tiles: "rock" },    // trilha inferior do desfiladeiro (rota do Faísca)
        { x: 1500, w: 420, y: 460, tiles: "rock" },  // terraço alto de reencontro
      ],
      platforms: [
        { x: 480, y: 760, w: 192, kind: "ledge" },   // degrau caso a Sofia desça à trilha inferior
        { x: 540, y: 580, w: 192, kind: "log", sway: true, moveX: 65, speed: 1.65, ropeTopY: 360 },
        { x: 960, y: 470, w: 192, kind: "ledge" },
        { x: 1220, y: 430, w: 192, kind: "crumble", crumble: true },
      ],
      ropes: [
        { id: "ropeG0", ropeX: 850, topY: 240, bottomY: 600, deployed: true },
      ],
      decor: [
        { kind: "moss_rock", x: 240, y: 620 + 8 },
        { kind: "vine", x: 520, y: 380 },
        { kind: "boulder", x: 920, y: G + 10 },
        { kind: "fern", x: 1180, y: G + 12, front: true },
        { kind: "tree", x: 1720, y: 460 + 20, scale: 1.04 },
      ],
      breakables: [
        { id: "parede-g0", x: 1440, y: G - 120, w: 60, h: 120, tiles: "rock" },
      ],
      shells: [
        { id: "f3G-01", x: 636, y: 515 },
        { id: "f3G-02", x: 850, y: 430 },
        { id: "f3G-03", x: 1056, y: 410 },
        { id: "f3G-04", x: 1316, y: 370 },
        { id: "f3G-05", x: 1640, y: 400 },
        { id: "f3G-05b", x: 1475, y: G - 40 },
      ],
      triggers: [
        {
          id: "detourG0",
          x: 420, y: 120, w: 1320, h: 860,
          event: "faiscaDetour",
          pathX: 1360,
          pathY: G,
          reunionX: 1560,
          reunionY: 460,
        },
      ],
      hints: [
        { id: "hintG0", x: 140, text: "Use as plataformas que balançam e os cipós! O Faísca vai por baixo e te encontra lá na frente." },
      ],
      checkpoints: [{ id: "G0", x: 160 }],
      vistas: [{ x0: 360, x1: 1880, zoom: 0.94 }],
    },

    /* ==================== G1: Grande Descida + Fenda Secreta no Fundo do Desfiladeiro ==================== */
    {
      id: "G1", x0: 1920, x1: 3840,
      ground: [
        { x: 1920, w: 340, y: 460, tiles: "rock" },
        { x: 3220, w: 620, y: G, tiles: "rock" },
      ],
      water: [
        { x: 2260, w: 960, y: 935, respawn: { x: 2080, y: 440 } },
      ],
      // Esconderijo secreto na fenda do desfiladeiro (entrada agachada em x=3360)
      blocks: [
        { x: 3360, y: 680, w: 380, h: 80, tiles: "rock", wet: true },
        { x: 3360, y: 760, w: 40, h: 20, tiles: "rock" },
        { x: 3700, y: 760, w: 40, h: 140, tiles: "rock" },
      ],
      platforms: [
        { x: 2340, y: 520, w: 192, kind: "crumble", crumble: true },
        { x: 2620, y: 620, w: 192, kind: "log", sway: true, moveX: 75, speed: 1.75, ropeTopY: 380 },
        { x: 3020, y: 740, w: 192, kind: "ledge" },
        { x: 3420, y: 550, w: 256, kind: "ledge" },
      ],
      ropes: [
        { id: "ropeG1", ropeX: 2920, topY: 380, bottomY: 740, deployed: true },
      ],
      secrets: [
        {
          id: "fenda-desfiladeiro",
          sniffX: null,
          zone: { x: 3390, y: 760, w: 310, h: 140 },
          cover: { x: 3360, y: 680, w: 380, h: 220 },
        },
      ],
      decor: [
        { kind: "moss_rock", x: 2100, y: 460 + 8 },
        { kind: "vine", x: 2680, y: 400 },
        { kind: "roots", x: 3360, y: 552 },
        { kind: "boulder", x: 3560, y: 550 },
      ],
      shells: [
        { id: "f3G-06", x: 2436, y: 460 },
        { id: "f3G-07", x: 2716, y: 555 },
        { id: "f3G-08", x: 3116, y: 680 },
        { id: "f3G-09", x: 3470, y: 845 },
        { id: "f3G-10", x: 3555, y: 845 },
        { id: "f3G-G1", x: 3645, y: 838, gold: true },
      ],
      checkpoints: [{ id: "G1", x: 2020 }],
    },

    /* ==================== G2: A Grande Escalada Vertical (y=900 -> y=380) ==================== */
    {
      id: "G2", x0: 3840, x1: 5760,
      ground: [
        { x: 3840, w: 1560, y: G, tiles: "rock" },
        { x: 5400, w: 360, y: 380, tiles: "rock" }, // cume alto do desfiladeiro
      ],
      platforms: [
        { x: 4240, y: 760, w: 192, kind: "ledge" },
        { x: 4500, y: 640, w: 192, kind: "ledge", moveY: 90, speed: 1.65, phase: 0.4 },
        { x: 4760, y: 500, w: 192, kind: "ledge" },
        { x: 5160, y: 420, w: 192, kind: "log", sway: true, moveX: 70, speed: 1.7, ropeTopY: 200 },
      ],
      ropes: [
        { id: "ropeG2", ropeX: 5040, topY: 180, bottomY: 540, deployed: true },
      ],
      decor: [
        { kind: "boulder", x: 4040, y: G + 10 },
        { kind: "fern", x: 4380, y: G + 12, front: true },
        { kind: "vine", x: 4920, y: 360 },
        { kind: "moss_rock", x: 5580, y: 380 + 8 },
      ],
      shells: [
        { id: "f3G-11", x: 4336, y: 700 },
        { id: "f3G-12", x: 4596, y: 540 },
        { id: "f3G-13", x: 4856, y: 440 },
        { id: "f3G-14", x: 5256, y: 355 },
        { id: "f3G-15", x: 5540, y: 320 },
      ],
      enemies: [
        { type: "crab", x: 4120, minX: 3980, maxX: 4280 }, // só no chão largo, longe das plataformas estreitas
      ],
      triggers: [
        {
          id: "detourG2",
          x: 4220, y: 120, w: 1440, h: 860,
          event: "faiscaDetour",
          pathX: 5280,
          pathY: G,
          reunionX: 5460,
          reunionY: 380,
        },
      ],
      checkpoints: [{ id: "G2", x: 3960 }],
      vistas: [{ x0: 4440, x1: 5760, zoom: 0.94 }],
    },

    /* ==================== G3: Travessia das Cristas Altas + Saída do Setor G ==================== */
    {
      id: "G3", x0: 5760, x1: 7680,
      ground: [
        { x: 5760, w: 320, y: 380, tiles: "rock" },
        { x: 7020, w: 660, y: 620, tiles: "rock" },
      ],
      water: [
        { x: 6080, w: 940, y: 935, respawn: { x: 5900, y: 360 } },
      ],
      platforms: [
        { x: 6160, y: 430, w: 192, kind: "crumble", crumble: true },
        { x: 6440, y: 500, w: 192, kind: "log", sway: true, moveX: 80, speed: 1.8, ropeTopY: 260 },
        { x: 6840, y: 580, w: 192, kind: "crumble", crumble: true },
        { x: 7100, y: 470, w: 256, kind: "log" },
      ],
      ropes: [
        { id: "ropeG3", ropeX: 6740, topY: 220, bottomY: 600, deployed: true },
      ],
      decor: [
        { kind: "moss_rock", x: 5920, y: 380 + 8 },
        { kind: "vine", x: 6500, y: 320 },
        { kind: "tree", x: 7240, y: 620 + 20, scale: 1.05, flip: true },
      ],
      shells: [
        { id: "f3G-16", x: 6256, y: 370 },
        { id: "f3G-17", x: 6536, y: 435 },
        { id: "f3G-18", x: 6740, y: 420 },
        { id: "f3G-19", x: 6936, y: 520 },
        { id: "f3G-20", x: 7228, y: 410 },
        { id: "f3G-21", x: 7340, y: 560 },
      ],
      enemies: [
        { type: "monkey", x: 7228, y: 470, minX: 7120, maxX: 7330 },
      ],
      checkpoints: [{ id: "G3", x: 5860 }],
      vistas: [{ x0: 5760, x1: 7100, zoom: 0.94 }],
    },
  ],
};
