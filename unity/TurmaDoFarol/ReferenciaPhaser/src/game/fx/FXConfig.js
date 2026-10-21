// @ts-nocheck
/** Números do polimento da Fase 1. Nada de arte nova. */
export const FX = {
  rays: {
    count: 3,
    alpha: 0.08,
    color: 0xfff1c4,
    depth: 9,
    pulse: 0.35,
    period: 4.5,
    items: [
      { x: 280, angle: 16, w: 90, h: 980 },
      { x: 760, angle: 8, w: 70, h: 1040 },
      { x: 1320, angle: -12, w: 110, h: 960 },
    ],
  },
  grade: {
    saturation: 0.05,
    warm: [
      1.04, 0, 0, 0, 0.015,
      0, 1.01, 0, 0, 0.008,
      0, 0, 0.96, 0, 0,
      0, 0, 0, 1, 0,
    ],
    vignette: 0.25,
    vignetteRadius: 0.78,
  },
  distant: {
    ids: ["horizon", "islands", "village_far"],
    tint: 0xb9d7ee,
    alpha: 0.92,
  },
  sea: {
    key: "bg_sea",
    bands: [
      { y: 1012, h: 68, speed: 18, bob: 3, period: 2.4, alpha: 0.92, depth: 4, factor: 0.35 },
      { y: 1034, h: 46, speed: 34, bob: 3, period: 1.7, alpha: 1, depth: 5, factor: 0.55 },
    ],
    sparkle: { pool: 18, interval: 0.22, life: 0.55, alpha: 0.9, y0: 1050, y1: 1076, depth: 5.5 },
    foam: { step: 273, offset: 257, y: 1074, alpha: 0.7, bob: 2, period: 1.3 },
  },
  shadow: { alpha: 0.25, width: 114, height: 22, jumpScale: 0.45, lift: 220 },
  jump: { x: 0.9, y: 1.1 },
  land: { x: 1.12, y: 0.88, ms: 120 },
  dust: { pool: 24, life: 0.35, count: 3 },
  clinc: { hitStop: 60, shakeMs: 180, shake: 0.004, zoom: 1.04, burst: 14 },
  shell: { sparkleScale: 0.55, flyMs: 460, hudX: 78, hudY: 40, pop: 1.65 },
};
