// @ts-nocheck
/**
 * Fase 1 (vila de dia): partículas CC0 de APOIO aprovadas pelo Daniel (CATALOGO_PARA_DANIEL.md).
 * Sempre pequenas, alfa 60-80%, blend ADD (poeira/vapor em NORMAL, alfa 0.35-0.6 com fade-out, atrás dos personagens: notas do Daniel 18/10), junto da arte desenhada. Nunca efeito principal.
 * Itens usados: star_01/04/06/07, circle_01-05, whitePuff (puff_*), raindrops (drop_*).
 * Tints quentes de dia (sol/areia/mar claro) em vez dos tints noturnos da Fase 2.
 */
import IDX from "../data/cc0_particulas.json";

const F = (prefix) => Object.keys(IDX).filter((k) => k.startsWith(prefix)).map((k) => IDX[k]);
// curadoria Daniel 18/10: brilho da água ADD #ffe6a8; circle/light/puff NORMAL #f2ead8/#c9a77a alfa 0.35-0.55; bolhas/gotas #cfe8f2; twirl #f2ead8
const TINT = { sun: 0xffe6a8, gold: 0xffd27a, ring: 0xf2ead8, drop: 0xcfe8f2, dust: 0xc9a77a, steam: 0xf2ead8, bubble: 0xcfe8f2, wind: 0xf2ead8 };

export class VilaCC0FX {
  constructor(s, level) {
    this.s = s;
    this.level = level;
    this.on = s.textures.exists("f2_cc0");
    if (!this.on) return;
    const base = { blendMode: "ADD", emitting: false };
    const mk = (depth, cfg) => s.add.particles(0, 0, "f2_cc0", { ...base, ...cfg }).setDepth(depth);
    this.stars = mk(19, { frame: F("star_"), lifespan: 420, speed: { min: 50, max: 150 }, scale: { start: 0.45, end: 0.05 }, alpha: { start: 0.8, end: 0 }, rotate: { start: 0, end: 160 }, tint: TINT.sun });
    this.glow = mk(11.4, { blendMode: "NORMAL", frame: [IDX.circle_05], lifespan: 260, speed: 0, scale: { start: 0.2, end: 0.4 }, alpha: { start: 0.5, end: 0 }, tint: TINT.ring });
    this.goldStar = mk(17.5, { frame: F("star_"), lifespan: 700, speed: { min: 6, max: 24 }, scale: { start: 0.05, end: 0.24, ease: "Sine.easeOut" }, alpha: { start: 0.75, end: 0 }, rotate: { start: 0, end: 90 }, tint: TINT.gold });
    this.dust = mk(11.5, { blendMode: "NORMAL", frame: F("puff_").slice(0, 4), lifespan: 360, speedX: { min: -90, max: 90 }, speedY: { min: -40, max: -10 }, scale: { start: 0.08, end: 0.2 }, alpha: { start: 0.5, end: 0 }, tint: TINT.dust });
    this.steam = mk(7.5, { blendMode: "NORMAL", frame: F("puff_"), lifespan: 1800, speedY: { min: -45, max: -20 }, speedX: { min: -8, max: 14 }, scale: { start: 0.12, end: 0.42 }, alpha: { start: 0.45, end: 0 }, tint: TINT.steam });
    this.rings = mk(-15.5, { blendMode: "NORMAL", frame: F("circle_0").slice(0, 4), lifespan: 900, speed: 0, scaleX: { start: 0.12, end: 0.5 }, scaleY: { start: 0.04, end: 0.14 }, alpha: { start: 0.5, end: 0 }, tint: TINT.ring });
    this.drops = mk(8.5, { blendMode: "NORMAL", frame: F("drop_"), lifespan: 320, speed: 0, scale: { min: 0.12, max: 0.22 }, alpha: { start: 0.45, end: 0 }, tint: TINT.drop });
    // brilho do sol na água: flare + sparks curtos (ADD)
    this.shimmer = mk(-15.4, { frame: [IDX.flare_01, ...F("spark_0")], lifespan: 380, speed: 0, scale: { min: 0.03, max: 0.08 }, alpha: { start: 0.6, end: 0 }, tint: TINT.sun });
    // bolhas junto à água do píer e rajadas de vento suaves (texturas próprias, NORMAL)
    const opt = (key, depth, cfg) => (s.textures.exists(key) ? s.add.particles(0, 0, key, { emitting: false, blendMode: "NORMAL", ...cfg }).setDepth(depth) : null);
    this.bubbles = [1, 2].map((i) => opt(`cc0f1_bolhas${i}`, -15.3, { lifespan: 1100, speedY: { min: -30, max: -12 }, speedX: { min: -6, max: 6 }, scale: { start: 0.05, end: 0.09 }, alpha: { start: 0.45, end: 0 }, tint: TINT.bubble })).filter(Boolean);
    this.wind = [1, 2, 3].map((i) => opt(`cc0f1_twirl${i}`, 10.5, { lifespan: 1300, speedX: { min: 160, max: 260 }, speedY: { min: -20, max: 10 }, scale: { start: 0.18, end: 0.3 }, rotate: { start: 0, end: 40 }, alpha: { start: 0.38, end: 0 }, tint: TINT.wind })).filter(Boolean);
    this.tShim = 0; this.tBub = 0; this.tWind = 4;
    const prop = (id) => (level.props || []).find((p) => p.id === id);
    this.stall = prop("stall");
    this.fountain = prop("fountain");
    this.seaY = (level.waves?.y ?? 980) + 30;
    this.tSteam = 0; this.tFount = 0; this.tRing = 0; this.tGold = 0;
  }
  /** concha coletada: brilho + estrelinhas */
  collect(x, y) {
    if (!this.on) return;
    this.glow.explode(1, x, y);
    this.stars.explode(5, x, y);
  }
  /** pouso suave: poeira pequena */
  land(x, y, onWood) {
    if (!this.on) return;
    this.dust.explode(onWood ? 3 : 4, x, y - 4);
  }
  update(dt, cam, artifact, groundY) {
    if (!this.on) return;
    const vx0 = cam.scrollX - 100, vx1 = cam.scrollX + cam.width / cam.zoom + 100;
    const vis = (x) => x > vx0 && x < vx1;
    // vapor leve na barraca do mercado
    if (this.stall && vis(this.stall.x) && (this.tSteam -= dt) <= 0) {
      this.tSteam = 0.35;
      this.steam.explode(1, this.stall.x - 60 + Math.random() * 120, groundY - 170);
    }
    // gotas na fonte da praça
    if (this.fountain && vis(this.fountain.x) && (this.tFount -= dt) <= 0) {
      this.tFount = 0.22;
      this.drops.explode(1, this.fountain.x - 70 + Math.random() * 140, groundY - 40 - Math.random() * 30);
    }
    // anéis na água perto da câmera
    let ring = false;
    if ((this.tRing -= dt) <= 0) {
      this.tRing = 1.1 + Math.random() * 1.4;
      this.rings.explode(1, vx0 + 100 + Math.random() * (vx1 - vx0 - 200), this.seaY + Math.random() * 40);
      ring = true;
    }
    // brilho na concha dourada
    if (artifact && artifact.visible && vis(artifact.x) && (this.tGold -= dt) <= 0) {
      this.tGold = 0.45;
      this.goldStar.explode(1, artifact.x - 22 + Math.random() * 44, artifact.y - 20 - Math.random() * 30);
    }
    // brilho do sol na água
    if ((this.tShim -= dt) <= 0) {
      this.tShim = 0.18 + Math.random() * 0.3;
      this.shimmer.explode(1, vx0 + 100 + Math.random() * (vx1 - vx0 - 200), this.seaY - 10 + Math.random() * 50);
    }
    // bolhas só perto do píer (x > 10800)
    if (this.bubbles.length && vx1 > 10800 && (this.tBub -= dt) <= 0) {
      this.tBub = 0.5 + Math.random() * 0.7;
      const e = this.bubbles[(Math.random() * this.bubbles.length) | 0];
      e.explode(1, Math.max(10800, vx0 + 100) + Math.random() * 900, this.seaY + 20 + Math.random() * 30);
    }
    // rajada de vento suave (atrás dos personagens)
    if (this.wind.length && (this.tWind -= dt) <= 0) {
      this.tWind = 5 + Math.random() * 6;
      const e = this.wind[(Math.random() * this.wind.length) | 0];
      e.explode(1, vx0 + 100 + Math.random() * 400, groundY - 160 - Math.random() * 200);
      this.windGust = true;
    }
    return ring;
  }
}
