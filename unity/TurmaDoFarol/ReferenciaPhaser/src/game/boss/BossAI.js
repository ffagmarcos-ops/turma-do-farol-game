// @ts-nocheck
/**
 * Polvo montado em partes (corpo, olhos, pupilas, pálpebras, boca) + IA de ataques.
 * Estados visuais: normal / golpe (hurt) / atordoado (stunned) / furioso (angry). Ponto fraco: olhos brilham.
 * Padrões aprendíveis por fase (Rayman); o ciclo se repete pulando o que está em recarga.
 */
import CFG from "../data/boss_polvo.json";
import { lerp, clamp } from "./common.js";
import PP from "../data/polvo_partes.json";

export const PATTERNS = [
  ["L", "R", "L", "R"],
  ["L", "R", "ink", "R", "L", "ink"],
  ["L", "R", "sweep", "ink", "R", "L", "wave"],
  ["LR", "ink", "sweep", "LR", "mast", "ink", "wave", "LR"],
];

export class OctopusRig {
  constructor(s) {
    this.s = s;
    this.baseY = 330;
    const o = (this.c = s.add.container(960, this.baseY).setDepth(4));
    this.body = s.add.image(0, 0, "f2_p_corpo").setOrigin(0.5, 0.45);
    this.body.setScale(900 / this.body.width);
    this.eyes = [-150, 150].map((dx) => ({
      dx,
      eye: s.add.image(dx, -110, "f2_p_olho").setScale(0.9),
      pupil: s.add.image(dx, -110, "f2_p_pupila").setScale(0.9),
      glow: s.add.image(dx, -110, "f2_glow").setBlendMode("ADD").setScale(1.3).setAlpha(0),
      lid: s.add.image(dx, -195, "f2_p_palpebra").setOrigin(0.5, 0).setScale(0.86, 0.1),
    }));
    this.mouth = s.add.image(0, 60, "f2_p_boca").setScale(0.8, 0.3);
    o.add([this.body, ...this.eyes.flatMap((e) => [e.eye, e.pupil, e.glow, e.lid]), this.mouth]);
    this.eyeDY = -110;
    // Partes estilo Rayman (Daniel): manto respirando, olhos que seguem o Lucas, pálpebras que piscam, boca por estado.
    this.parts = s.textures.exists("f2_polvo_partes");
    if (this.parts) {
      const tex = s.textures.get("f2_polvo_partes");
      for (const [n, [x, y, w, h]] of Object.entries(PP.partes)) if (!tex.has(n)) tex.add(n, 0, x, y, w, h);
      const [mx, my, mw, mh] = PP.partes.mantle;
      const cx = mx + mw / 2, cy = my + mh / 2;
      const rel = (n, ox = 0, oy = 0) => { const [x, y, w, h] = PP.partes[n]; return [x + w / 2 - cx + ox, y + h / 2 - cy + oy]; };
      this.baseY = 420;
      o.y = this.baseY;
      o.removeAll(true);
      this.k = 1.08;
      this.body = s.add.image(0, 0, "f2_polvo_partes", "mantle").setScale(this.k);
      // encaixe dos olhos nas órbitas do manto (posição medida na arte)
      const sock = [[214 - mw / 2, 438 - mh / 2], [544 - mw / 2, 438 - mh / 2]];
      this.eyeDY = sock[0][1] * this.k;
      this.eyes = sock.map(([ex, ey], i) => {
        const side = i ? "R" : "L";
        const eye = s.add.image(ex * this.k, ey * this.k, "f2_polvo_partes", `eye${side}`).setScale(this.k * 0.92);
        const lidO = s.add.image(ex * this.k, (ey - 62) * this.k, "f2_polvo_partes", `lidOpen${side}`).setScale(this.k * 0.8);
        const lidC = s.add.image(ex * this.k, (ey - 4) * this.k, "f2_polvo_partes", `lidClosed${side}`).setScale(this.k * 0.8).setVisible(false);
        const glow = s.add.image(ex * this.k, ey * this.k, "f2_glow").setBlendMode("ADD").setScale(1.1).setAlpha(0);
        return { dx: ex * this.k, ey: ey * this.k, eye, lidO, lidC, glow, pupil: eye, lid: lidO };
      });
      this.mouths = {};
      for (const m of ["mouthNeutral", "mouthAngry", "mouthStun"]) this.mouths[m] = s.add.image(0, (mh / 2 - 70) * this.k, "f2_polvo_partes", m).setScale(this.k * 0.62).setVisible(m === "mouthNeutral");
      o.add([this.body, ...Object.values(this.mouths), ...this.eyes.flatMap((e) => [e.eye, e.glow, e.lidC, e.lidO])]);
      // olhos finais (Daniel): 5 células 512x320 com pele em volta, sobre as órbitas do manto
      if (s.textures.exists("f2_polvo_olhos")) {
        const midX = ((sock[0][0] + sock[1][0]) / 2) * this.k, midY = sock[0][1] * this.k;
        this.eyeSheet = s.add.image(midX, midY, "f2_polvo_olhos", 0).setOrigin(0.49, 0.6).setScale(this.k * 1.36);
        this.eyeSheetBase = { x: midX, y: midY };
        for (const e of this.eyes) { e.eye.setVisible(false); e.lidC.setVisible(false); e.lidO.setVisible(false); }
        o.add(this.eyeSheet);
        o.bringToTop(this.eyes[0].glow); o.bringToTop(this.eyes[1].glow);
      }
      this.c.y = this.baseY;
    }
    // Lote 1: corpo inteiro em 4 estados (placeholder até as partes separadas do próximo lote)
    this.sheet = !this.parts && s.textures.exists("f2_polvo_corpo");
    if (this.sheet) {
      const sc = 1.17;
      this.body.setTexture("f2_polvo_corpo", 0).setOrigin(0.5, 0.5).setScale(sc);
      this.eyeDY = (435 - 384) * sc;
      this.eyes.forEach((e, i) => {
        e.dx = ((i ? 525 : 255) - 384) * sc;
        e.eye.setVisible(false); e.pupil.setVisible(false); e.lid.setVisible(false);
        e.glow.setPosition(e.dx, this.eyeDY).setScale(0.9);
      });
      this.mouth.setVisible(false);
    }
    this.blinkIn = 2.5; this.blinkT = 0; this.expr = "normal"; this.exprT = 0;
    this.exposed = 0; this.flash = 0; this.squash = 0; this.mouthOpen = 0; this.windup = 0;
    this.target = null; // y alvo para entrada/afundar
  }
  get x() { return this.c.x; }
  get y() { return this.c.y; }
  eyePos(i) { return { x: this.c.x + this.eyes[i].dx, y: this.c.y + this.eyeDY }; }
  setExpr(e, sec) { this.expr = e; this.exprT = sec; }
  update(dt, t, lucas) {
    const s = this.s, o = this.c;
    this.squash = Math.max(0, this.squash - dt);
    const br = Math.sin(t * 1.8) * 0.025, sq = this.squash > 0 ? 0.08 : 0, w = this.windup * 0.07;
    o.setScale(1 + br + sq + w, 1 - br - sq + w * 1.2);
    o.x = 960 + Math.sin(t * 0.7) * 30;
    const ty = this.target != null ? this.target : this.baseY + Math.sin(t * 1.1) * 14;
    o.y = lerp(o.y, ty, dt * (this.target != null ? 1.6 : 2));
    this.exprT -= dt;
    if (this.exprT <= 0) this.expr = s.fury ? "angry" : "normal";
    this.flash = Math.max(0, this.flash - dt);
    if (this.parts) return this.updateParts(dt, t, lucas);
    if (this.sheet) {
      const fr = { normal: 0, hurt: 1, angry: 2, stunned: 3 }[this.expr] ?? 0;
      if (this.body.frame.name !== fr) this.body.setFrame(fr);
      if (this.flash > 0) this.body.setTintFill(0xffffff); else this.body.setTint(0xc8b8d8);
      for (const e of this.eyes) e.glow.setAlpha(this.exposed > 0 ? 0.55 + Math.sin(t * 12) * 0.3 : 0);
      this.mouthOpen = Math.max(0, this.mouthOpen - dt);
      return;
    }
    if (this.flash > 0) this.body.setTintFill(0xffffff);
    else if (this.expr === "angry") this.body.setTint(0xff8a7a);
    else if (this.expr === "stunned") this.body.setTint(0xc8b8ff);
    else this.body.clearTint();
    this.blinkIn -= dt;
    if (this.blinkIn <= 0) { this.blinkT = 0.16; this.blinkIn = 2 + Math.random() * 3; }
    this.blinkT = Math.max(0, this.blinkT - dt);
    let lid = this.blinkT > 0 ? 1 : { hurt: 0.75, angry: 0.4, stunned: 0.3 }[this.expr] ?? 0.1;
    if (this.exposed > 0) lid = Math.min(lid, 0.05);
    for (const e of this.eyes) {
      const ex = o.x + e.dx, ey = o.y - 110;
      let ang = Math.atan2(lucas.y - 150 - ey, lucas.x - ex), r = 34;
      if (this.expr === "stunned") { ang = t * 8 + e.dx; r = 26; }
      e.pupil.setPosition(e.dx + Math.cos(ang) * r, -110 + Math.sin(ang) * r);
      e.lid.scaleY = lerp(e.lid.scaleY, 1.4 * lid, dt * 20);
      e.lid.setRotation(this.expr === "angry" ? (e.dx < 0 ? 0.25 : -0.25) : 0);
      e.glow.setAlpha(this.exposed > 0 ? 0.55 + Math.sin(t * 12) * 0.3 : 0);
    }
    this.mouthOpen = Math.max(0, this.mouthOpen - dt);
    const open = this.mouthOpen > 0 ? 0.9 : { angry: 0.45, hurt: 0.6 }[this.expr] ?? 0.25 + Math.sin(t * 1.8) * 0.05;
    this.mouth.scaleY = lerp(this.mouth.scaleY, 0.8 * open, dt * 10);
  }
}

OctopusRig.prototype.updateParts = function (dt, t, lucas) {
  const o = this.c;
  // manto respirando (squash & stretch próprio), olhos/boca acompanham
  const br = Math.sin(t * 1.8);
  this.body.setScale(this.k * (1 + br * 0.018), this.k * (1 - br * 0.022));
  const ex = this.expr;
  if (this.flash > 0) this.body.setTintFill(0xffffff);
  else this.body.setTint(ex === "angry" ? 0xff9a8a : ex === "stunned" ? 0xc8b8ff : ex === "hurt" ? 0xffd8e0 : 0xffffff);
  this.blinkIn -= dt;
  if (this.blinkIn <= 0) { this.blinkT = 0.14; this.blinkIn = 2 + Math.random() * 3; }
  this.blinkT = Math.max(0, this.blinkT - dt);
  const closed = (this.blinkT > 0 || ex === "hurt") && this.exposed <= 0;
  if (this.eyeSheet) {
    // 0 normal · 1 piscando · 2 fúria · 3 atordoado · 4 dor (com flash vermelho para não parecer piscada)
    const fr = ex === "stunned" ? 3 : ex === "hurt" ? 4 : this.blinkT > 0 && this.exposed <= 0 ? 1 : ex === "angry" ? 2 : 0;
    if (this.eyeSheet.frame.name !== fr) this.eyeSheet.setFrame(fr);
    const gx = clamp((lucas.x - o.x) / 600, -1, 1) * 6;
    this.eyeSheet.setPosition(this.eyeSheetBase.x + gx, this.eyeSheetBase.y + br * 3);
    if (this.flash > 0) this.eyeSheet.setTintFill(0xffffff);
    else if (ex === "hurt") this.eyeSheet.setTint(Math.sin(t * 30) > 0 ? 0xff5050 : 0xff9a9a);
    else this.eyeSheet.setTint(ex === "angry" ? 0xff9a8a : ex === "stunned" ? 0xc8b8ff : 0xffffff);
    for (const e of this.eyes) e.glow.setAlpha(this.exposed > 0 ? 0.55 + Math.sin(t * 12) * 0.3 : 0);
  } else
  for (const e of this.eyes) {
    const wx = o.x + e.dx, wy = o.y + e.ey;
    let ang = Math.atan2(lucas.y - 150 - wy, lucas.x - wx), r = 10;
    let rot = 0;
    if (ex === "stunned") { ang = t * 6 + e.dx; r = 8; rot = t * 4; }
    e.eye.setPosition(e.dx + Math.cos(ang) * r, e.ey + Math.sin(ang) * r + br * 2).setRotation(rot * 0.2);
    e.eye.setTint(this.flash > 0 ? 0xffffff : 0xffffff);
    e.lidC.setVisible(closed);
    e.lidO.setVisible(!closed).setY(e.ey - 62 * this.k + (ex === "angry" ? 14 : 0) + br * 3).setRotation(ex === "angry" ? (e.dx < 0 ? 0.22 : -0.22) : 0);
    e.glow.setAlpha(this.exposed > 0 ? 0.55 + Math.sin(t * 12) * 0.3 : 0);
  }
  const mouth = ex === "stunned" ? "mouthStun" : ex === "angry" || this.mouthOpen > 0 ? "mouthAngry" : "mouthNeutral";
  for (const [k, m] of Object.entries(this.mouths)) m.setVisible(k === mouth);
  // boca brava é sutil: reforço com escala e tint na fúria / ao cuspir tinta
  const mm = this.mouths[mouth];
  const boost = mouth === "mouthAngry" ? 1.18 + (this.mouthOpen > 0 ? 0.12 : 0) + Math.sin(t * 9) * 0.03 : 1;
  mm.setScale(this.k * 0.62 * boost, this.k * 0.62 * boost * (1 + br * 0.04)).setTint(mouth === "mouthAngry" ? 0xff8070 : 0xffffff);
  this.mouthOpen = Math.max(0, this.mouthOpen - dt);
};

/** Escolhe o próximo ataque seguindo o padrão da fase. */
export function chooseAttack(state) {
  const pattern = PATTERNS[state.phase];
  for (let i = 0; i < pattern.length; i++) {
    const a = pattern[state.patternIdx % pattern.length];
    state.patternIdx += 1;
    if (state.cool[a] > 0) continue;
    if (a === "ink" && !CFG.phases[state.phase].ink) continue;
    return a;
  }
  return state.patternIdx % 2 ? "L" : "R";
}
