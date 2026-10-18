// @ts-nocheck
/**
 * Barco Esperança + tripulação (direção do Marcos):
 * - Seu Toninho SEMPRE na cabine, visto pela janela, girando o timão e balançando com as ondas.
 * - Faísca agitado: corre perto das pontas, late e rosna para os tentáculos.
 * - Marina (popa, puxa corda até o mastro), Júlia (balde, tira água), Bia (proa, aponta avisos).
 *   Abaixam/assustam com perigo, seguram-se na amurada na onda, comemoram acertos do Lucas.
 * - Centro livre para o Lucas. Até chegarem as folhas dedicadas: idle/interact/crouch/jump + tweens.
 */
import CFG from "../data/boss_polvo.json";
import { clamp, lerp } from "./common.js";

const BOAT_W = 1500;
// escalas das folhas novas: crianças ~208 px como na Fase 1; Faísca na altura do joelho
const NEW_SCALE = { marina: 0.95, bia: 1.0, julia: 1.08, faisca: 0.6 };
export class BoatCrew {
  constructor(s) {
    this.s = s;
    const final = s.textures.exists("f2_barco");
    // Geometria em frações da imagem. Arte final (lote 1): convés plano em y≈0.645, cabine baixa à esquerda,
    // teto da cabine é plataforma (ignora lanterna e caixa em cima); cabos do mastro são decoração.
    const G = final
      ? { key: "f2_barco", oy: 0.645, win: [0.19, 0.52, 0.05, 0.085], lantern: [0.058, 0.5], roof: [0.07, 0.345, 0.425], mast: 0.8, tint: 0x8fb4c8 }
      : { key: "r2_boat", oy: 0.7, win: [0.442, 0.505, 0.05, 0.11], lantern: [0.77, 0.55], roof: null, mast: 0.72, tint: 0xffffff };
    this.G = G;
    this.boat = s.add.image(960, CFG.deck.y, G.key).setOrigin(0.5, G.oy).setDepth(20).setTint(G.tint);
    this.boat.setScale(BOAT_W / this.boat.width);
    this.boatH = this.boat.displayHeight;
    const top = CFG.deck.y - G.oy * this.boatH;
    this.top = top;
    const fx = (u) => 960 + (u - 0.5) * BOAT_W;
    this.win = { x: fx(G.win[0]), y: top + G.win[1] * this.boatH, w: G.win[2] * BOAT_W, h: G.win[3] * this.boatH };
    // plataforma do teto da cabine (só colisão por cima)
    this.roof = G.roof ? { x0: fx(G.roof[0]), x1: fx(G.roof[1]), dy: (G.roof[2] - G.oy) * this.boatH } : null;
    this.mastX = fx(G.mast);
    this.angle = 0; this.bob = 0; this.kick = 0; this.waveTilt = 0;
    // Toninho na cabine (máscara na janela) + timão + vidro
    // folhas dedicadas (Daniel): 6 quadros 192x256, pés em y=240
    for (const who of ["toninho", "faisca", "marina", "bia", "julia"]) {
      const key = `f2s_${who}`;
      if (s.textures.exists(key) && !s.anims.exists(`${key}-work`)) s.anims.create({ key: `${key}-work`, frames: s.anims.generateFrameNumbers(key, { start: 0, end: 5 }), frameRate: who === "toninho" ? 5 : who === "faisca" ? 10 : 8, repeat: -1 });
    }
    this.tonNew = s.textures.exists("f2s_toninho");
    if (this.tonNew) {
      // Toninho da cintura para cima, recortado na janela; o timão da folha gira de leve
      const sc = (this.win.w * 1.35) / 150;
      const cw = this.win.w / sc, ch = this.win.h / sc;
      this.toninho = s.add.sprite(0, 0, "f2s_toninho", 0).setOrigin(0, 0).setDepth(20.5).setScale(sc).setTint(0xd0c8b8);
      this.toninho.play("f2s_toninho-work");
      this.tonCrop = { x: 95 - cw / 2, y: Math.max(28, 125 - ch / 2), w: cw, h: ch, sc };
      this.toninho.setCrop(this.tonCrop.x, this.tonCrop.y, cw, ch);
    } else {
      this.toninho = s.add.sprite(this.win.x - 20, this.win.y, "toninho", 0).setOrigin(0.5, 0.9375).setDepth(20.5).setTint(0xc8b890);
      this.play(this.toninho, "toninho", "interact");
      this.toninho.setScale(0.8).setCrop(46, 0, 100, 124);
    }
    this.tonBaseY = this.win.y - this.win.h / 2 - 6 + 240 * 0.8;
    this.wheel = s.add.graphics().setDepth(20.6);
    this.glass = s.add.rectangle(this.win.x, this.win.y, this.win.w, this.win.h, 0x6fa8ff, 0.14).setDepth(20.7).setBlendMode("ADD");
    this.lantern = s.add.image(fx(G.lantern[0]), top + G.lantern[1] * this.boatH, "f2_glow").setBlendMode("ADD").setDepth(20.8).setScale(0.8).setTint(0xffc060);
    // Tripulação nas pontas
    const mk = (who, x, depth, sc) => {
      const nk = `f2s_${who}`, isNew = s.textures.exists(nk);
      if (isNew) sc = NEW_SCALE[who];
      const sp = s.add.sprite(x, CFG.deck.y, isNew ? nk : who, 0).setOrigin(0.5, 0.9375).setScale(sc).setDepth(depth).setTint(isNew ? 0xc4d0de : 0xa9bcd2);
      sp.homeX = x; sp.who = who; sp.baseScale = sc; sp.isNew = isNew;
      if (isNew) sp.play(`${nk}-work`); else this.play(sp, who, "idle");
      return sp;
    };
    const newCrew = s.textures.exists("f2s_bia");
    // com as folhas novas: Bia tira água com o balde (esquerda), Júlia agarrada ao mastro (direita)
    this.marina = mk("marina", 300, 24, 1.0);
    this.julia = mk("julia", newCrew ? this.mastX + 6 : 430, 23, 0.95);
    this.bia = mk("bia", newCrew ? 455 : 1560, 24, 0.95);
    this.faisca = mk("faisca", newCrew ? 1600 : 1450, 25, 1.0);
    this.newCrew = newCrew;
    this.rope = s.add.graphics().setDepth(23.5);
    this.bucketT = 1; this.barkIn = 2; this.cheerT = 0; this.braceT = 0;
    this.shout = s.add.text(0, 0, "", { fontFamily: "Georgia, serif", fontSize: "34px", color: "#fff3c8", stroke: "#000", strokeThickness: 7 }).setOrigin(0.5).setDepth(85).setAlpha(0);
    this.shoutT = 0;
  }
  play(sp, who, pose) {
    const k = `${who}-${pose}`;
    if (this.s.anims.exists(k)) sp.play(k, true);
    else if (this.s.anims.exists(`${who}-idle`)) sp.play(`${who}-idle`, true);
  }
  /** Altura do teto da cabine em x (ou null fora dela). */
  roofYAt(x) {
    if (!this.roof || x < this.roof.x0 || x > this.roof.x1) return null;
    return this.deckYAt(x) + this.roof.dy;
  }
  deckYAt(x) {
    const tilt = Math.tan((this.angle * Math.PI) / 180) * (x - 960);
    return CFG.deck.y + this.bob + tilt;
  }
  say(text, who) {
    const sp = this[who] || this.marina;
    this.shout.setText(text).setPosition(clamp(sp.x, 200, 1720), sp.y - 290).setAlpha(1);
    this.shoutT = 1.1;
    this.s.tweens.add({ targets: sp, scaleX: sp.baseScale * (sp.flipX ? -1 : 1) * 1.0, scaleY: sp.baseScale * 1.08, duration: 110, yoyo: true });
  }
  cheer() { this.cheerT = 0.7; }
  brace() { this.braceT = 1.4; }
  hop(who) {
    const sp = this[who];
    if (sp) this.s.tweens.add({ targets: sp, scaleY: sp.baseScale * 1.08, duration: 110, yoyo: true });
  }
  update(dt, t, amp, danger, threat) {
    this.bob = Math.sin(t * 1.96) * 10 * amp;
    this.kick = lerp(this.kick, 0, dt * 3);
    this.angle = Math.sin(t * 1.96 + 0.8) * 2.5 * amp + this.waveTilt + this.kick;
    const rot = (this.angle * Math.PI) / 180;
    this.boat.setRotation(rot).setY(CFG.deck.y + this.bob);
    // Toninho e timão
    const wy = this.win.y + this.bob;
    this.glass.setY(wy);
    if (this.tonNew) {
      const c = this.tonCrop, sw = Math.sin(t * 1.4) * 3, sb = Math.sin(t * 2.8) * 2;
      // a folha se move dentro do recorte; o recorte acompanha a janela
      this.toninho.setPosition(this.win.x - (c.x + c.w / 2) * c.sc + sw, wy - (c.y + c.h / 2) * c.sc + sb);
      this.toninho.setCrop(c.x - sw / c.sc, c.y - sb / c.sc, c.w, c.h);
    } else this.toninho.setPosition(this.win.x + Math.sin(t * 1.4) * 4, this.tonBaseY + this.bob + Math.sin(t * 2.8) * 4).setRotation(rot * 2);
    const wa = Math.sin(t * 1.4) * 1.3 + this.angle * 0.2;
    this.wheel.clear().setPosition(this.win.x + 4, wy + 50);
    if (this.tonNew) this.wheel.setVisible(false);
    this.wheel.lineStyle(7, 0x6a4320, 1).strokeCircle(0, 0, 18);
    for (let i = 0; i < 8; i++) {
      const a = wa + (i * Math.PI) / 4;
      this.wheel.lineBetween(0, 0, Math.cos(a) * 26, Math.sin(a) * 26);
    }
    this.lantern.setY(this.top + this.G.lantern[1] * this.boatH + this.bob).setAlpha(0.6 + Math.sin(t * 13) * 0.08);
    // Marina, Júlia, Bia
    this.cheerT = Math.max(0, this.cheerT - dt);
    this.braceT = Math.max(0, this.braceT - dt);
    const crew = [[this.marina, 0], [this.julia, 1.3], [this.bia, 2.1]];
    for (const [sp, ph] of crew) {
      let pose = "interact";
      if (danger || this.braceT > 0) pose = "crouch";
      else if (this.cheerT > 0) pose = "jump";
      else if (sp.who === "bia" && Math.sin(t * 0.9 + ph) > 0.5) pose = "idle";
      if (sp.isNew) {
        sp.anims.timeScale = danger || this.braceT > 0 ? 1.6 : 1;
        // Bia: quadro 5 (despejando) é desenhado menor por causa da água
        const comp = sp.who === "bia" && Number(sp.frame.name) === 4 ? 1.08 : 1;
        sp.setScale(sp.baseScale * comp * (sp.flipX ? 1 : 1));
      } else this.play(sp, sp.who, pose);
      const hop = this.cheerT > 0 ? Math.abs(Math.sin(this.cheerT * 10 + ph)) * 34 : 0;
      const work = sp.isNew ? 0 : sp.who === "marina" ? Math.sin(t * 3) * 12 : sp.who === "julia" ? Math.sin(t * 2.2) * 8 : 0;
      const lean = this.braceT > 0 ? -0.12 : danger ? -0.06 : 0;
      sp.setPosition(sp.homeX + work, this.deckYAt(sp.homeX) - hop).setRotation(rot + lean);
      sp.setFlipX(this.newCrew ? sp.who === "julia" : sp.who === "bia");
    }
    // corda da Marina até o mastro
    const mx = this.mastX, my = this.deckYAt(mx) - 430;
    const hx = this.marina.x + (this.marina.isNew ? 70 : 30), hy = this.marina.y - (this.marina.isNew ? 100 : 150);
    this.rope.clear().lineStyle(5, 0xc9a46a, 1);
    this.rope.beginPath();
    this.rope.moveTo(hx, hy);
    this.rope.lineTo((hx + mx) / 2, (hy + my) / 2 + 40 + Math.sin(t * 4) * 10);
    this.rope.lineTo(mx, my);
    this.rope.strokePath();
    // Júlia joga água para fora com o balde
    this.bucketT -= dt;
    if (this.bucketT <= 0 && !danger) {
      this.bucketT = 1.6;
      const b = this.newCrew ? this.bia : this.julia;
      this.s.spray?.explode(6, b.x + (this.newCrew ? 80 : -70), b.y - (this.newCrew ? 60 : 130));
    }
    // Faísca: corre, late, rosna para a ponta do tentáculo
    const f = this.faisca;
    let target = f.homeX + Math.sin(t * 1.7) * 110;
    if (threat) target = threat.side < 0 ? 560 : 1420;
    const nx = lerp(f.x, target, dt * 3);
    const moving = Math.abs(nx - f.x) > 0.8;
    if (Math.abs(nx - f.x) > 0.3) f.setFlipX(nx < f.x);
    f.setPosition(nx, this.deckYAt(nx)).setRotation(rot);
    if (f.isNew) f.anims.timeScale = threat ? 1.5 : moving ? 1.2 : 0.8;
    else this.play(f, "faisca", moving ? "run" : threat ? "interact" : "idle");
    this.barkIn -= dt;
    if (this.barkIn <= 0) {
      this.barkIn = threat ? 0.9 + Math.random() : 2 + Math.random() * 2.5;
      this.s.sfx("bark", { volume: 0.5 });
      this.s.tweens.add({ targets: f, scaleY: f.baseScale * 1.15, duration: 90, yoyo: true });
    }
    this.shoutT -= dt;
    if (this.shoutT <= 0) this.shout.setAlpha(Math.max(0, this.shout.alpha - dt * 3));
    else this.shout.y -= dt * 20;
  }
}
