// @ts-nocheck
/**
 * Partículas CC0 de APOIO (curadoria do Daniel): sempre pequenas, alfa 60-80%, blend ADD,
 * junto dos efeitos desenhados (relampago_sheet, agua_spray, sonic_fx). Nunca o efeito principal.
 * Itens aprovados: trace_03/04, light_01-03, flare_01, circle_01-05, spark_01-07, slash_01-04,
 * star_01/04/06/07, whitePuff, blackSmoke (só sob a tinta), raindrops e o fundo de chuva.
 */
import IDX from "../data/cc0_particulas.json";
import { W, H } from "./common.js";

const F = (prefix) => Object.keys(IDX).filter((k) => k.startsWith(prefix)).map((k) => IDX[k]);
const TINT = { arc: 0x9fd8ff, light: 0xdfeaff, ring: 0x6ff0ff, spark: 0x6fb8ff, slash: 0xdfeeff, steam: 0xb8c8d8, ink: 0x3a1f4a, drop: 0x9fd8ff };

export class CC0FX {
  constructor(s) {
    this.s = s;
    this.on = s.textures.exists("f2_cc0");
    if (s.textures.exists("f2_cc0_chuva")) {
      // chuva distante atrás da chuva desenhada
      this.rainBg = s.add.tileSprite(W / 2, H / 2, W + 600, H + 400, "f2_cc0_chuva").setScrollFactor(0.1).setDepth(1.6).setTint(TINT.drop).setAlpha(0.6).setBlendMode("ADD");
    }
    if (!this.on) return;
    const base = { blendMode: "ADD", emitting: false };
    const mk = (depth, cfg) => s.add.particles(0, 0, "f2_cc0", { ...base, ...cfg }).setDepth(depth);
    this.arcs = mk(41, { frame: F("trace_"), lifespan: 160, speed: { min: 40, max: 160 }, scale: { start: 0.45, end: 0.2 }, alpha: { start: 0.8, end: 0 }, rotate: { min: 0, max: 360 }, tint: TINT.arc });
    this.rings = mk(31.8, { frame: F("circle_0").slice(0, 4), lifespan: 320, speed: 0, scale: { start: 0.25, end: 0.9 }, alpha: { start: 0.7, end: 0 }, tint: TINT.ring });
    this.glow = mk(31.7, { frame: [IDX.circle_05], lifespan: 220, speed: 0, scale: { start: 0.6, end: 1.1 }, alpha: { start: 0.6, end: 0 }, tint: TINT.ring });
    this.sparks = mk(41, { frame: F("spark_"), lifespan: 300, speed: { min: 120, max: 380 }, scale: { start: 0.35, end: 0 }, alpha: { start: 0.8, end: 0 }, rotate: { min: 0, max: 360 }, tint: TINT.spark });
    this.stars = mk(41.2, { frame: F("star_"), lifespan: 380, speed: { min: 40, max: 160 }, scale: { start: 0.4, end: 0.05 }, alpha: { start: 0.8, end: 0 }, rotate: { start: 0, end: 180 } });
    this.flare = mk(1.9, { frame: [...F("light_"), IDX.flare_01], lifespan: 260, speed: 0, scale: { start: 1.6, end: 2.4 }, alpha: { start: 0.7, end: 0 }, tint: TINT.light });
    this.slash = mk(34.6, { frame: F("slash_"), lifespan: 220, speed: 0, scale: { start: 0.7, end: 0.5 }, alpha: { start: 0.65, end: 0 }, tint: TINT.slash });
    this.steam = mk(31.6, { frame: F("puff_"), lifespan: 800, speedY: { min: -120, max: -50 }, speedX: { min: -30, max: 30 }, scale: { start: 0.35, end: 0.9 }, alpha: { start: 0.7, end: 0 }, tint: TINT.steam });
    this.inkMist = mk(21.5, { frame: F("smoke_"), lifespan: 900, speedY: { min: -40, max: -10 }, speedX: { min: -60, max: 60 }, scale: { start: 0.4, end: 1.0 }, alpha: { start: 0.7, end: 0 }, tint: TINT.ink });
    this.drops = mk(28.5, { frame: F("drop_"), lifespan: 260, speed: 0, scale: { min: 0.15, max: 0.3 }, alpha: { start: 0.6, end: 0 }, tint: TINT.drop });
    this.dropT = 0;
  }
  muzzle(x, y, charged) {
    if (!this.on) return;
    this.rings.explode(charged ? 2 : 1, x, y);
    this.arcs.explode(charged ? 4 : 2, x, y);
    if (charged) this.glow.explode(1, x, y);
  }
  impact(x, y, weak) {
    if (!this.on) return;
    this.sparks.explode(weak ? 8 : 5, x, y);
    if (weak) this.stars.explode(4, x, y);
  }
  lightning(x, y) {
    if (this.on) this.flare.explode(1, x, y + 60);
  }
  sweep(x, y) {
    if (this.on && Math.random() < 0.5) this.slash.explode(1, x, y);
  }
  overheat(x, y) {
    if (this.on) this.steam.explode(6, x, y);
  }
  ink(x, y) {
    if (this.on) this.inkMist.explode(4, x, y);
  }
  weakPoint(x, y) {
    if (this.on && Math.random() < 0.15) this.stars.explode(1, x + (Math.random() - 0.5) * 80, y + (Math.random() - 0.5) * 60);
  }
  update(dt, wind, deckY) {
    if (this.rainBg) { this.rainBg.tilePositionX -= dt * (120 + wind * 260); this.rainBg.tilePositionY -= dt * 700; }
    if (!this.on) return;
    this.dropT -= dt;
    if (this.dropT <= 0) {
      this.dropT = 0.08;
      const x = 300 + Math.random() * 1320;
      this.drops.explode(1, x, deckY(x) - 4);
    }
  }
}
