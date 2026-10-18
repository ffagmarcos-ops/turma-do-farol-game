// @ts-nocheck
/**
 * Escala da Fase 1.
 * Humanos +32% (entre 30 e 35) para a Marina ficar perto de 1/3 de uma porta.
 * O Faísca é separado: a cabeça fica no joelho da Marina, ~30% da altura dela.
 * O pivô continua nos pés (origem 0.5, 0.9375 / base do quadro).
 */
export const HUMAN_SCALE = 1.32;
export const DOG_RATIO = 0.3;

const round = (n) => Math.round(n * 10000) / 10000;

const MARINA_BASE_SCALE = 1;
const MARINA_BASE_H = 208;
const DOG_BASE_SCALE = 1;
const DOG_BASE_H = 72;

export const MARINA_SHEET = {
  originX: 0.5,
  originY: 0.9375,
  feetY: 240,
  frameW: 192,
  frameH: 256,
  scale: round(MARINA_BASE_SCALE * HUMAN_SCALE),
  targetH: Math.round(MARINA_BASE_H * HUMAN_SCALE),
};

const dogH = MARINA_SHEET.targetH * DOG_RATIO;

export const CAST = {
  julia: {
    scale: round(1 * HUMAN_SCALE),
    name: "Júlia",
    targetH: Math.round(208 * HUMAN_SCALE),
  },
  lucas: {
    scale: round(1 * HUMAN_SCALE),
    name: "Lucas",
    targetH: Math.round(208 * HUMAN_SCALE),
  },
  bia: {
    scale: round(1 * HUMAN_SCALE),
    name: "Bia",
    targetH: Math.round(208 * HUMAN_SCALE),
  },
  toninho: {
    scale: round(1 * HUMAN_SCALE),
    name: "Seu Toninho",
    targetH: Math.round(220 * HUMAN_SCALE),
  },
  faisca: {
    scale: round(DOG_BASE_SCALE * (dogH / DOG_BASE_H)),
    name: "Faísca",
    targetH: Math.round(dogH),
  },
};
