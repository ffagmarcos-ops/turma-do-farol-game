// @ts-nocheck
/** HUD da Fase 2: barra grande do polvo (4 partes, rastro amarelo), barra de vida do Lucas e medidor do sônico. */
import CFG from "../data/boss_polvo.json";
import { lerp, clamp } from "./common.js";

export class BossHealthBar {
  constructor(s) {
    this.s = s;
    const st = { fontFamily: "Georgia, serif", color: "#F6E7C1" };
    this.g = s.add.graphics().setScrollFactor(0).setDepth(90);
    this.title = s.add.text(960, 26, "POLVO GIGANTE", { ...st, fontSize: "30px", stroke: "#000", strokeThickness: 6 }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(91);
    this.portrait = s.add.image(250, 92, s.textures.exists("portrait_polvo") ? "portrait_polvo" : "f2_p_olho").setScrollFactor(0).setDepth(92).setDisplaySize(84, 84);
    this.lucasPortrait = s.add.image(92, 186, s.textures.exists("portrait_lucas") ? "portrait_lucas" : "f2_glow").setScrollFactor(0).setDepth(92).setDisplaySize(84, 84);
    this.lucasLabel = s.add.text(150, 150, "LUCAS", { ...st, fontSize: "22px", stroke: "#000", strokeThickness: 5 }).setScrollFactor(0).setDepth(91);
    this.heatLabel = s.add.text(150, 222, "SÔNICO", { ...st, fontSize: "18px", stroke: "#000", strokeThickness: 4 }).setScrollFactor(0).setDepth(91);
    this.phase = s.add.text(1660, 134, "", { ...st, fontSize: "22px", color: "#ffd36a", stroke: "#000", strokeThickness: 5 }).setOrigin(1, 0).setScrollFactor(0).setDepth(91);
    // Arte aprovada: moldura de madeira (9-slice no meio) + boia; aparelho de radar e termômetro do hud_sonico.
    this.framed = false;
    if (s.textures.exists("f2_bar_frame")) {
      const tex = s.textures.get("f2_bar_frame");
      if (!tex.has("ring")) { tex.add("ring", 0, 43, 312, 400, 392); tex.add("frame", 0, 370, 312, 1123, 392); }
      const k = 0.24;
      this.frameObj = s.add.nineslice(300 - 90 * k, 72 - 98 * k - 3, "f2_bar_frame", "frame", 1360 / k + 183, 392, 160, 160, 0, 0).setOrigin(0, 0).setScale(k).setScrollFactor(0).setDepth(90.5);
      this.ringObj = s.add.image(250, 92, "f2_bar_frame", "ring").setScale(0.3).setScrollFactor(0).setDepth(92.5);
      this.framed = true;
    }
    this.heatIcons = false;
    if (s.textures.exists("f2_hud_sonico")) {
      const tex = s.textures.get("f2_hud_sonico");
      if (!tex.has("radar")) { tex.add("radar", 0, 80, 50, 350, 390); tex.add("termo", 0, 630, 50, 270, 430); }
      this.radar = s.add.image(112, 262, "f2_hud_sonico", "radar").setScale(0.2).setScrollFactor(0).setDepth(92);
      this.termo = s.add.image(536, 258, "f2_hud_sonico", "termo").setScale(0.16).setScrollFactor(0).setDepth(92);
      this.heatIcons = true;
    }
    this.trail = CFG.hpTotal; this.trailDelay = 0;
    this.lTrail = 100; this.lShake = 0;
  }
  hit() { this.trailDelay = 0.6; }
  lucasHit() { this.lShake = 0.3; }
  setVisible(on) {
    for (const o of [this.g, this.title, this.portrait, this.lucasPortrait, this.lucasLabel, this.heatLabel, this.phase, this.frameObj, this.ringObj, this.radar, this.termo]) o?.setVisible(on);
  }
  update(dt, t, show) {
    const s = this.s, g = this.g;
    this.setVisible(show);
    g.clear();
    if (!show) return;
    if (this.trailDelay > 0) this.trailDelay -= dt; else this.trail = lerp(this.trail, s.hp, dt * 4);
    const x0 = 300, w = 1360, y = 72;
    if (!this.framed) g.fillStyle(0x1a0d12, 0.9).fillRoundedRect(x0 - 8, y - 8, w + 16, 52, 14);
    else g.fillStyle(0x12070c, 0.95).fillRect(x0, y, w, 40);
    g.fillStyle(0xf2c94c, 1).fillRect(x0, y, (w * this.trail) / CFG.hpTotal, 36);
    const blink = s.invuln > 0 && Math.sin(t * 30) > 0;
    g.fillStyle(blink ? 0xffffff : s.fury ? 0xff3a2a : 0xd2304a, 1).fillRect(x0, y, (w * s.hp) / CFG.hpTotal, 36);
    if (!this.framed) g.lineStyle(4, 0xf6e7c1, 1).strokeRoundedRect(x0 - 8, y - 8, w + 16, 52, 14);
    for (let i = 1; i < 4; i++) g.fillStyle(0x3a2412, 1).fillRect(x0 + (w * i) / 4 - 3, y, 6, 40);
    g.fillStyle(0x1a0d12, 1).fillCircle(250, 92, 46);
    if (!this.framed) g.lineStyle(4, 0xf6e7c1, 1).strokeCircle(250, 92, 52);
    // vida do Lucas (vidas infinitas: ao zerar ele cai, levanta e a barra enche de novo)
    const L = s.lucasP;
    this.lTrail = L.hp < this.lTrail ? lerp(this.lTrail, L.hp, dt * 3) : L.hp;
    this.lShake = Math.max(0, this.lShake - dt);
    const sx = this.lShake > 0 ? Math.sin(t * 90) * 6 : 0;
    const lx = 150 + sx, ly = 180, lw = 360;
    g.fillStyle(0x1a0d12, 1).fillCircle(92 + sx, 186, 48);
    g.lineStyle(4, 0xf6e7c1, 1).strokeCircle(92 + sx, 186, 48);
    this.lucasPortrait.setX(92 + sx);
    g.fillStyle(0x0b1a2a, 0.9).fillRoundedRect(lx - 4, ly - 4, lw + 8, 34, 10);
    g.fillStyle(0xffe08a, 1).fillRect(lx, ly, (lw * this.lTrail) / 100, 26);
    const low = L.hp <= 30 && Math.sin(t * 10) > 0;
    g.fillStyle(L.ko ? 0x777777 : low ? 0xff5a5a : 0x3fd27a, 1).fillRect(lx, ly, (lw * L.hp) / 100, 26);
    g.lineStyle(3, 0xf6e7c1, 1).strokeRoundedRect(lx - 4, ly - 4, lw + 8, 34, 10);
    // sônico
    const hy = 248, hw = 360;
    if (this.radar) this.radar.setAngle(L.overheat > 0 ? Math.sin(t * 60) * 6 : 0);
    g.fillStyle(0x0b1a2a, 0.85).fillRoundedRect(150 - 4, hy - 4, hw + 8, 24, 8);
    const col = L.overheat > 0 ? 0xff6a2a : L.heat > 70 ? 0xffb02a : 0x6ff0ff;
    g.fillStyle(col, 1).fillRect(150, hy, (hw * L.heat) / 100, 16);
    if (L.charge > 0) g.fillStyle(0xfff3a0, 0.95).fillRect(150, hy + 17, hw * clamp(L.charge / CFG.heat.chargeTime, 0, 1), 4);
    g.lineStyle(3, 0xf6e7c1, 1).strokeRoundedRect(150 - 4, hy - 4, hw + 8, 24, 8);
    this.heatLabel.setX(this.heatIcons ? 168 : 150).setY(hy + 22).setText(L.overheat > 0 ? "SUPERAQUECIDO!" : L.charge >= CFG.heat.chargeTime ? "CARREGADO! solte" : "SÔNICO (segure para carregar)");
  }
}
