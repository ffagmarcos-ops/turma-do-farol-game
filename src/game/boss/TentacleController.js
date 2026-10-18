// @ts-nocheck
/** Tentáculo em cadeia de segmentos (base → meio → ponta): Bézier (IK simples) + onda senoidal. */
import { clamp, lerp } from "./common.js";
import CFG from "../data/boss_polvo.json";
import TFR from "../data/tentaculo_frames.json";
import PP from "../data/polvo_partes.json";

/** Registra os quadros fatiados por bbox do tentáculo vertical (lote 1). */
export function registerTentacleFrames(scene) {
  for (const [key, group] of [["f2_tent_seg", "segmentos"], ["f2_tent_est", "estados"]]) {
    if (!scene.textures.exists(key)) continue;
    const tex = scene.textures.get(key);
    for (const [n, [x, y, w, h]] of Object.entries(PP[group])) if (!tex.has(n)) tex.add(n, 0, x, y, w, h);
  }
  if (!scene.textures.exists("f2_tentaculo_v")) return false;
  const tex = scene.textures.get("f2_tentaculo_v");
  TFR.forEach(([x, y, w, h], i) => { if (!tex.has(`t${i}`)) tex.add(`t${i}`, 0, x, y, w, h); });
  return true;
}
const WATER_Y = 990;
const V_TINT = 0xc9849e; // aproxima o vermelho saturado do tentáculo ao roxo-avermelhado do corpo

export class Tentacle {
  constructor(scene, side, depth) {
    this.s = scene;
    this.side = side;
    this.seg = scene.textures.exists("f2_tent_seg");
    this.n = this.seg ? 8 : 11;
    this.parts = [];
    for (let i = 0; i < this.n; i++) {
      let img;
      if (this.seg) {
        // base (parte larga embaixo, na água) → meios (o 4º, com a ventosa dourada, é o ponto fraco) → ponta enrolada
        const fr = i === 0 ? "base" : i === this.n - 1 ? "tip" : i === this.n - 3 ? "mid3" : i % 2 ? "mid1" : "mid2";
        img = scene.add.image(0, 0, "f2_tent_seg", fr).setDepth(depth + (this.n - i) * 0.01).setVisible(false).setOrigin(0.5, 0.62);
        img.segH = PP.segmentos[fr][3];
        img.baseScale = 1 - (i / this.n) * 0.45;
      } else {
        const key = i === 0 ? "f2_t_base" : i === this.n - 1 ? "f2_t_ponta" : "f2_t_meio";
        img = scene.add.image(0, 0, key).setDepth(depth + (this.n - i) * 0.01).setVisible(false);
        img.baseScale = (1 - (i / this.n) * 0.62) * 0.95;
      }
      this.parts.push(img);
    }
    this.hurtT = 0;
    this.glow = scene.add.image(0, 0, "f2_glow").setBlendMode("ADD").setDepth(depth + 0.5).setVisible(false).setTint(0xffd36a);
    this.stars = scene.add.image(0, 0, "f2_stars").setDepth(depth + 0.6).setVisible(false);
    this.state = "hidden";
    this.t = 0;
    this.ext = 0;
    this.tip = { x: 0, y: 0 };
    this.flash = 0;
    this.points = [];
    for (let i = 0; i < this.n; i++) this.points.push({ x: 0, y: 0, a: 0 });
    this.mode = "lane";
    this.est = scene.textures.exists("f2_tent_est");
    this.v = this.est ? scene.add.image(0, WATER_Y, "f2_tent_est", "normal") : scene.textures.exists("f2_tentaculo_v") ? scene.add.image(0, WATER_Y, "f2_tentaculo_v", "t0") : null;
    this.v?.setOrigin(0.5, 1).setDepth(depth + 0.3).setVisible(false);
    // varredura final (Daniel): 6 quadros 768x384; raiz cortada à esquerda, escondida no respingo/borda
    this.vs = scene.textures.exists("f2_tent_varr") ? scene.add.image(0, 0, "f2_tent_varr", 0).setOrigin(0.93, 0.62).setDepth(34.5).setVisible(false) : null;
    this.vsSplashT = 0;
  }
  /** Varredura com a folha desenhada: 0-1 erguendo (rápido), 2-3 varrendo o convés, 4-5 recolhendo (rápido). */
  drawSweep(dt, time, deckY, tx, ty) {
    for (const p of this.parts) p.setVisible(false);
    const st = this.state, t = this.t, vs = this.vs;
    let fr = 2, x = tx, y = ty, alpha = 1, sc = 1.25;
    if (st === "warn") { fr = t < this.warn * 0.5 ? 0 : 1; const b = this.base(); x = b.x - this.side * 140; y = lerp(WATER_Y + 60, deckY - 40, Math.min(1, t / Math.max(0.05, this.warn))); sc = 0.9 + Math.min(1, t / 0.15) * 0.35; }
    else if (st === "sweep") fr = Math.floor(time * 10) % 2 ? 3 : 2;
    else if (st === "retract") { fr = t < 0.12 ? 4 : 5; y = ty + t * 500; alpha = 1 - Math.min(1, t / 0.45); if (t > 0.45) return this.hide(); }
    else return this.hide();
    const dir = this.side < 0 ? 1 : -1; // vindo da esquerda: ponta à direita
    vs.setVisible(true).setFrame(fr).setPosition(x, y).setScale(sc * dir, sc * (this.high ? 0.92 : 1)).setAlpha(alpha).setRotation((this.high ? -0.08 : 0.05) * dir);
    if (this.flash > 0) vs.setTintFill(0xffffff); else vs.setTint(this.s.fury ? 0xff8fb0 : 0xe08ac0); // puxado para o magenta do corpo
    this.flash = Math.max(0, this.flash - dt);
    // raiz cortada: respingo contínuo na ponta de trás do sprite
    const rootX = x - dir * 768 * 0.86 * sc, rootY = y + 30;
    if ((this.vsSplashT -= dt) <= 0) { this.vsSplashT = 0.16; this.s.storm?.splash?.(rootX, rootY, "splash", 0.7); }
    this.tip.x = x; this.tip.y = y;
    for (let i = 0; i < this.n; i++) { const pt = this.points[i]; pt.x = lerp(rootX, x, (i + 1) / this.n); pt.y = y; }
    this.glow.setVisible(false); this.stars.setVisible(false);
  }
  laneX() {
    const d = CFG.deck;
    return this.side < 0 ? d.left + d.laneW * 0.45 : d.right - d.laneW * 0.45;
  }
  base() {
    if (this.mode === "mast") return { x: 1220, y: 900 };
    return { x: this.side < 0 ? 40 : 1880, y: 960 };
  }
  start(mode, opts = {}) {
    this.mode = mode;
    this.state = "warn";
    this.t = 0;
    this.stunDmg = 0;
    this.warn = opts.warn || 1.2;
    this.window = opts.window || 1.5;
    this.high = Boolean(opts.high);
    this.hitDone = false;
    for (const p of this.parts) p.setVisible(true);
    this.ext = 0.05;
  }
  stun(sec) { this.state = "stunned"; this.t = 0; this.stunTime = sec; }
  retract() { if (this.state !== "hidden") { this.state = "retract"; this.t = 0; } }
  get active() { return this.state !== "hidden"; }
  damageMult() {
    if (this.state === "vulnerable") return 1;
    if (this.state === "stunned") return 1.5;
    if (["rise", "raised", "sweep", "hold"].includes(this.state)) return 0.25;
    return null;
  }
  next(state) {
    this.state = state;
    this.t = 0;
    if (state === "rise") this.s.sfx("splash", { volume: 0.9 });
  }
  hide() {
    this.state = "hidden";
    this.v?.setVisible(false);
    this.vs?.setVisible(false);
    for (const p of this.parts) p.setVisible(false);
    this.glow.setVisible(false);
    this.stars.setVisible(false);
  }
  /** Tentáculo vertical desenhado (sprite único por estado), base na água ao lado do convés. */
  drawVertical(dt, time, deckY, lx) {
    for (const p of this.parts) p.setVisible(false);
    const st = this.state, t = this.t;
    let fr = 0, topY = 220, alpha = 1, sx = 0;
    if (st === "warn") { fr = 0; topY = lerp(WATER_Y + 40, WATER_Y - 140, Math.min(1, t / this.warn)); }
    else if (st === "rise") { fr = Math.min(3, Math.floor((t / 0.5) * 4)); topY = lerp(WATER_Y - 140, 230, Math.min(1, t / 0.5)); }
    else if (st === "raised") { fr = 4; topY = 200 + Math.sin(time * 40) * 6; sx = Math.sin(time * 33) * 6; }
    else if (st === "strike") { fr = 5; topY = lerp(200, deckY - 60, Math.min(1, t / 0.18)); }
    else if (st === "vulnerable") { fr = 6 + (Math.floor(time * 6) % 3); topY = deckY - 70 + Math.sin(time * 6) * 5; }
    else if (st === "stunned") { fr = 9 + (Math.floor(time * 8) % 2); topY = deckY - 60 + Math.sin(time * 3) * 8; sx = Math.sin(time * 2.3) * 14; }
    else if (st === "retract") { fr = 11; topY = lerp(deckY - 60, WATER_Y + 40, Math.min(1, t / 0.6)); alpha = 1 - Math.min(1, t / 0.7); if (t > 0.7) return this.hide(); }
    let frameName = `t${fr}`, fh = TFR[fr][3], fw = 1;
    if (this.est) {
      frameName = st === "strike" ? "strike" : st === "vulnerable" || st === "stunned" ? "stunned" : this.hurtT > 0 ? "hurt" : "normal";
      if (st === "retract" && this.hurtT > 0) frameName = "hurt";
      fh = PP.estados[frameName][3];
      // "atordoado/vulnerável" já tem a ponta apoiada: a base fica na água e o topo um pouco acima do convés
      if (frameName === "stunned") topY = deckY - 250 + (st === "stunned" ? Math.sin(time * 3) * 6 : 0);
    }
    const hgt = Math.max(60, WATER_Y - topY);
    const sc = hgt / fh;
    const squash = st === "strike" && t > 0.15 ? 0.82 : st === "rise" ? 1.06 : 1;
    const x = lx + sx;
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.v.setVisible(true).setFrame(frameName).setPosition(x, WATER_Y).setScale(sc * (2 - squash) * (this.side > 0 ? -1 : 1), sc * squash).setAlpha(alpha);
    if (this.flash > 0) this.v.setTintFill(0xffffff);
    else if (this.est) this.v.setTint(st === "stunned" ? 0xc8b0ff : st === "vulnerable" && Math.sin(time * 18) > 0.6 ? 0xffe0ea : this.s.fury ? 0xffa0a0 : 0xffffff);
    else this.v.setTint(st === "stunned" ? 0xa890d8 : st === "vulnerable" && Math.sin(time * 18) > 0.6 ? 0xffd0e0 : this.s.fury ? 0xe08a90 : V_TINT);
    this.flash = Math.max(0, this.flash - dt);
    // pontos para colisão do sônico: da base à ponta
    for (let i = 0; i < this.n; i++) {
      const u = (i + 1) / this.n, pt = this.points[i];
      pt.x = x; pt.y = lerp(WATER_Y, topY + 30, u);
    }
    this.tip.x = x; this.tip.y = this.est ? lerp(WATER_Y, topY, frameName === "stunned" ? 0.55 : 0.62) : topY + 30;
    if (this.est) for (let i = this.n - 4; i < this.n; i++) { this.points[i].x = x; this.points[i].y = this.tip.y + (i - this.n + 2) * 30; }
    const glow = ["vulnerable", "stunned"].includes(st);
    this.glow.setVisible(glow).setPosition(this.tip.x, this.tip.y).setScale(1 + Math.sin(time * 10) * 0.15).setAlpha(0.7);
    this.stars.setVisible(st === "stunned").setPosition(this.tip.x, this.tip.y - 70).setRotation(time * 3);
    if (fw > 0 && st !== "retract") this.s.cc0 && st === "strike" && t < 0.05 && this.s.cc0.sweep(x, topY);
  }

  update(dt, time, deckY) {
    if (this.state === "hidden") return;
    this.t += dt;
    const d = CFG.deck;
    const lx = this.laneX();
    const b = this.base();
    let tx = lx, ty = 300, wobble = 22, curl = 0.35 * -this.side;
    switch (this.state) {
      case "warn":
        this.ext = lerp(this.ext, 0.12, dt * 4);
        tx = b.x - this.side * 120; ty = 880;
        if (this.t >= this.warn) this.next(this.mode === "sweep" ? "sweep" : this.mode === "mast" ? "grab" : "rise");
        break;
      case "rise":
        this.ext = lerp(this.ext, 1, dt * 9); ty = 230;
        if (this.t >= 0.5) this.next("raised");
        break;
      case "raised":
        this.ext = 1; ty = 200 + Math.sin(time * 40) * 6; tx = lx + Math.sin(time * 33) * 8 - this.side * 40; wobble = 10;
        if (this.t >= 0.4) this.next("strike");
        break;
      case "strike": {
        const k = clamp(this.t / 0.18, 0, 1);
        ty = lerp(200, deckY - 20, k * k); tx = lerp(lx - this.side * 40, lx, k); wobble = 4;
        if (k >= 1 && !this.hitDone) { this.hitDone = true; this.s.onTentacleSlam(this); }
        if (this.t >= 0.25) this.next("vulnerable");
        break;
      }
      case "vulnerable":
        ty = deckY - 26 + Math.sin(time * 6) * 4; wobble = 8;
        if (this.t >= this.window) this.next("retract");
        break;
      case "stunned":
        ty = deckY - 30 + Math.sin(time * 3) * 10; tx = lx + Math.sin(time * 2.3) * 20; wobble = 26; curl = Math.sin(time * 2) * 0.6;
        if (this.t >= this.stunTime) this.next("retract");
        break;
      case "sweep": {
        const k = clamp(this.t / 0.9, 0, 1);
        tx = lerp(this.side < 0 ? d.left - 200 : d.right + 200, this.side < 0 ? d.right + 120 : d.left - 120, k);
        ty = this.high ? deckY - 150 : deckY - 28; this.ext = 1; wobble = 6; curl = 0.05 * this.side;
        this.s.onSweepTick(this, tx, ty);
        if (k >= 1) this.next("retract");
        break;
      }
      case "grab":
        this.ext = lerp(this.ext, 1, dt * 5); tx = 960 + Math.sin(time * 2) * 6; ty = 360; curl = 0.9; wobble = 6;
        if (this.t > 0.7) this.next("hold");
        break;
      case "hold":
        tx = 960 + Math.sin(time * 3) * 8; ty = 360; curl = 0.9; wobble = 5;
        break;
      case "retract":
        this.ext = lerp(this.ext, 0, dt * 6); ty = 700;
        if (this.ext < 0.04 || this.t > 0.9) return this.hide();
        break;
    }
    if (this.v && this.mode === "lane") return this.drawVertical(dt, time, deckY, lx);
    if (this.vs && this.mode === "sweep") return this.drawSweep(dt, time, deckY, tx, ty);
    const ex = lerp(b.x, tx, this.ext), ey = lerp(b.y, ty, this.ext);
    const mx = (b.x + ex) / 2 + (ey - b.y) * curl;
    const my = (b.y + ey) / 2 - (ex - b.x) * curl * 0.5 - 60;
    let px = b.x, py = b.y;
    for (let i = 0; i < this.n; i++) {
      const u = (i + 0.5) / this.n, iu = 1 - u;
      let x = iu * iu * b.x + 2 * iu * u * mx + u * u * ex;
      let y = iu * iu * b.y + 2 * iu * u * my + u * u * ey;
      const dx = 2 * iu * (mx - b.x) + 2 * u * (ex - mx);
      const dy = 2 * iu * (my - b.y) + 2 * u * (ey - my);
      const len = Math.hypot(dx, dy) || 1;
      const w = Math.sin(time * 5 + i * 0.7 + this.side) * wobble * u;
      x += (-dy / len) * w; y += (dx / len) * w;
      const pt = this.points[i];
      pt.x = x; pt.y = y; pt.a = Math.atan2(y - py, x - px);
      px = x; py = y;
    }
    const squash = this.state === "strike" && this.t > 0.15 ? 0.75 : this.state === "rise" ? 1.12 : 1;
    const flash = this.flash > 0;
    this.flash = Math.max(0, this.flash - dt);
    for (let i = 0; i < this.n; i++) {
      const img = this.parts[i], pt = this.points[i];
      img.setPosition(pt.x, pt.y).setRotation(pt.a + Math.PI / 2);
      let sc = img.baseScale * (0.35 + 0.65 * Math.min(1, this.ext * 1.2));
      if (img.segH) {
        // segmentos com sobreposição (~35%) ao longo da corrente senoidal
        const prev = i ? this.points[i - 1] : { x: this.base().x, y: this.base().y };
        const len = Math.hypot(pt.x - prev.x, pt.y - prev.y) || 40;
        sc = Math.max(0.05, (len * 1.35) / img.segH) * (0.85 + img.baseScale * 0.15);
        img.setScale(sc * (this.side < 0 ? -1 : 1), sc * squash);
      } else img.setScale(sc * (this.side < 0 ? -1 : 1) * (2 - squash), sc * squash);
      if (flash) img.setTintFill(0xffffff);
      else if (this.state === "stunned") img.setTint(0xb8a0ff);
      else if (this.s.fury) img.setTint(0xff9a8a);
      else img.clearTint();
    }
    const tp = this.points[this.n - 1];
    this.tip.x = tp.x; this.tip.y = tp.y;
    const glow = ["vulnerable", "stunned", "hold"].includes(this.state);
    this.glow.setVisible(glow).setPosition(tp.x, tp.y).setScale(1 + Math.sin(time * 10) * 0.15).setAlpha(0.7);
    this.stars.setVisible(this.state === "stunned").setPosition(tp.x, tp.y - 70).setRotation(time * 3);
  }
}
