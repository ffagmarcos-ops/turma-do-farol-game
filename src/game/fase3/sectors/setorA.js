// @ts-nocheck
/**
 * SETOR A — PRAIA DA CHEGADA (tutorial + caranguejos). Coordenadas LOCAIS do setor (x começa em 0).
 * Chão do setor: y = 900 (topo da areia). Cada chunk tem 1920 px e só existe perto da câmera.
 *
 * Formato do chunk (todos os campos são opcionais):
 *  ground     [{x, w, y?, tiles:"sand"|"rock"}]           chão sólido do topo até o fundo da tela
 *  blocks     [{x, y, w, h, tiles:"rock"}]                 bloco sólido (pedra)
 *  platforms  [{x, y, w, kind:"log"|"ledge"}]              plataforma de mão única (sobe por baixo)
 *  water      [{x, w, y, respawn:{x, y}}]                  poça/mar: cair = volta ao respawn
 *  decor      [{kind, x, y, scale?, flip?, front?}]        objeto sem colisão (props do tileset); y = base
 *  shells     [{id, x, y, gold?}]                          conchas coletáveis (vão para a carteira)
 *  enemies    [{type:"crab", x, minX, maxX}]               inimigos (só agem perto da câmera)
 *  checkpoints[{id, x}]                                    marca de exploração (respawn)
 *  hints      [{id, x, text}]                              dica curta (tokens {jump} {attack} ... por controle)
 *  secrets    [{id, sniffX, zone:{x,y,w,h}, cover:{x,y,w,h}}]  área escondida (o Faísca fareja em sniffX)
 *  triggers   [{id, x, y, w, h, event}]                    zona de evento (ex.: "end", "helpZoneToninho")
 *  vistas     [{x0, x1, zoom}]                             zoom discreto em vistas grandes
 */
const G = 900;
export const SETOR_A = {
  id: "A",
  name: "Praia da Chegada",
  art: "A",
  length: 7680,
  groundY: G,
  ambient: "praia",
  chunks: [
    {
      id: "A0", x0: 0, x1: 1920,
      ground: [{ x: 0, w: 1920, tiles: "sand" }],
      blocks: [{ x: 1640, y: 804, w: 128, h: 96, tiles: "rock" }],
      platforms: [{ x: 1180, y: 770, w: 256, kind: "log" }],
      decor: [
        { kind: "palm", x: 300, y: G + 20, scale: 1 }, { kind: "driftwood", x: 980, y: G + 14, scale: 0.9 },
        { kind: "bush", x: 1520, y: G + 18, scale: 0.9 }, { kind: "starfish", x: 640, y: G + 10, front: true },
        { kind: "pebbles", x: 1860, y: G + 12, front: true },
      ],
      shells: [
        { id: "f3A-01", x: 560, y: 845 }, { id: "f3A-02", x: 680, y: 835 }, { id: "f3A-03", x: 800, y: 845 },
        { id: "f3A-04", x: 1240, y: 715 }, { id: "f3A-05", x: 1370, y: 715 }, { id: "f3A-06", x: 1704, y: 745 },
      ],
      checkpoints: [{ id: "A0", x: 150 }],
      hints: [
        { id: "andar", x: 260, text: "{move} para andar · segure {run} para correr" },
        { id: "pular", x: 1000, text: "{jump} para pular · segure para pular mais alto" },
        { id: "faisca", x: 1820, text: "O Faísca vai junto com você a fase inteira!" },
      ],
      vistas: [{ x0: 0, x1: 760, zoom: 0.94 }],
    },
    {
      id: "A1", x0: 1920, x1: 3840,
      ground: [{ x: 1920, w: 1920, tiles: "sand" }],
      blocks: [{ x: 2950, y: 770, w: 200, h: 130, tiles: "rock" }],
      platforms: [{ x: 3250, y: 700, w: 192, kind: "ledge" }, { x: 3520, y: 600, w: 192, kind: "ledge" }, { x: 3740, y: 790, w: 128, kind: "log" }],
      decor: [
        { kind: "palm", x: 2200, y: G + 20, scale: 0.85, flip: true }, { kind: "bush", x: 2860, y: G + 18 },
        { kind: "pebbles", x: 2420, y: G + 12, front: true }, { kind: "driftwood", x: 3600, y: G + 14, scale: 0.8 },
      ],
      shells: [
        { id: "f3A-07", x: 2300, y: 845 }, { id: "f3A-08", x: 2680, y: 845 }, { id: "f3A-09", x: 3050, y: 710 },
        { id: "f3A-10", x: 3346, y: 640 }, { id: "f3A-11", x: 3616, y: 540 }, { id: "f3A-12", x: 3804, y: 730 },
      ],
      enemies: [{ type: "crab", x: 2520, minX: 2250, maxX: 2820 }, { type: "crab", x: 3460, minX: 3200, maxX: 3720 }],
      checkpoints: [{ id: "A1", x: 2060 }],
      hints: [{ id: "concha", x: 2080, text: "Um caranguejo! {attack} para lançar uma concha" }],
    },
    {
      id: "A2", x0: 3840, x1: 5760,
      ground: [{ x: 3840, w: 860, tiles: "sand" }, { x: 4960, w: 800, tiles: "sand" }],
      // morro de pedra com uma toca escondida embaixo (entrada baixa à esquerda: agachar)
      blocks: [
        { x: 3960, y: 700, w: 400, h: 60, tiles: "rock" },
        { x: 3960, y: 760, w: 40, h: 20, tiles: "rock" },
        { x: 4320, y: 760, w: 40, h: 140, tiles: "rock" },
      ],
      water: [{ x: 4700, w: 260, y: 935, respawn: { x: 4600, y: 880 } }],
      platforms: [{ x: 4766, y: 800, w: 128, kind: "log" }],
      decor: [
        { kind: "pebbles", x: 4680, y: G + 12, front: true }, { kind: "pebbles", x: 4990, y: G + 12, front: true, flip: true },
        { kind: "palm", x: 5300, y: G + 20, scale: 0.95 }, { kind: "bush", x: 5640, y: G + 18, scale: 0.8 },
      ],
      shells: [
        { id: "f3A-13", x: 4080, y: 870 }, { id: "f3A-14", x: 4160, y: 870 }, { id: "f3A-G1", x: 4255, y: 850, gold: true },
        { id: "f3A-15", x: 4830, y: 740 }, { id: "f3A-16", x: 5150, y: 845 }, { id: "f3A-17", x: 5660, y: 845 },
      ],
      secrets: [{ id: "toca-rochas", sniffX: 3900, zone: { x: 3990, y: 760, w: 330, h: 140 }, cover: { x: 3960, y: 700, w: 400, h: 200 } }],
      enemies: [{ type: "crab", x: 5250, minX: 5040, maxX: 5450 }, { type: "crab", x: 5560, minX: 5420, maxX: 5720 }],
      checkpoints: [{ id: "A2", x: 4480 }],
      hints: [
        { id: "latido", x: 5020, text: "Segure {special} para carregar o latido do Faísca… e solte!" },
      ],
    },
    {
      id: "A3", x0: 5760, x1: 7680,
      ground: [{ x: 5760, w: 1920, tiles: "sand" }],
      platforms: [{ x: 5950, y: 790, w: 256, kind: "log" }, { x: 6200, y: 680, w: 256, kind: "log" }, { x: 6480, y: 760, w: 192, kind: "ledge" }],
      decor: [
        { kind: "bush", x: 5900, y: G + 18, scale: 0.8 }, { kind: "palm", x: 6600, y: G + 20, scale: 1.05, flip: true },
        { kind: "starfish", x: 7100, y: G + 10, front: true }, { kind: "sign_end", x: 7440, y: G + 6 },
      ],
      shells: [
        { id: "f3A-18", x: 6070, y: 730 }, { id: "f3A-19", x: 6330, y: 620 }, { id: "f3A-20", x: 6576, y: 700 }, { id: "f3A-21", x: 7260, y: 845 },
      ],
      enemies: [
        { type: "crab", x: 6760, minX: 6640, maxX: 6920 }, { type: "crab", x: 6900, minX: 6760, maxX: 7040 }, { type: "crab", x: 7060, minX: 6940, maxX: 7180 },
      ],
      checkpoints: [{ id: "A3", x: 5880 }],
      triggers: [{ id: "fimA", x: 7480, y: 0, w: 200, h: 1080, event: "end" }],
      vistas: [{ x0: 7200, x1: 7680, zoom: 0.94 }],
    },
  ],
};
