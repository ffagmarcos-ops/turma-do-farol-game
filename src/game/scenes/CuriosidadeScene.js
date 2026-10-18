// @ts-nocheck
/** Curiosidade = 3 cartas (quadro da HQ + legenda, "Você sabia?", extra). →/←/Enter, deslizar, setas; Esc/✕ volta ao hub. */
import Phaser from "../phaser.js";
import { makeButton } from "../systems/UIButton.js";
import { AudioManager } from "../systems/AudioManager.js";
import { readWallet, markSeen } from "../systems/Wallet.js";
import { loadFase3 } from "./PortaisScene.js";
import CUR from "../data/curiosidades.json";
import LEVEL from "../data/fase1-vila.json";

const W = 1920, H = 1080;
const CURIO = { lucas_aparelho_explodido: "curio/lucas_aparelho_explodido.png", vila_mapa_ilustrado: "curio/vila_mapa_ilustrado.png", esperanca_planta: "curio/esperanca_planta.png", polvo_dossie: "curio/polvo_dossie.png", toninho_nos_sheet: "curio/toninho_nos_sheet.png", carta_moldura: "curio/carta_moldura.png", polaroid_moldura: "curio/polaroid_moldura.png" };
const ZONAS = [["Entrada", 420, 2000], ["Rua", 2000, 4200], ["Mercado", 4200, 6400], ["Praça", 6400, 8600], ["Cais", 8600, 10800], ["Píer", 10800, 12800], ["Barco", 12800, 13800]];

export class CuriosidadeScene extends Phaser.Scene {
  constructor() { super("curiosidade"); }
  init(data) { this.cid = data?.id; this.item = CUR.itens.find((c) => c.id === this.cid) || CUR.itens[0]; }
  preload() {
    loadFase3(this);
    for (const [k, p] of Object.entries(CURIO)) if (!this.textures.exists(k)) this.load.image(k, "assets/farol/fase3/" + p);
    if (!this.textures.exists("hq_p09")) this.load.image("hq_p09", "assets/farol/fase2/ui/hq_p09.jpg");
  }
  create() {
    document.body.classList.add("is-title");
    this.audio = this.registry.get("audio") || new AudioManager();
    this.registry.set("audio", this.audio);
    this.cameras.main.setBackgroundColor("#120c08").fadeIn(300, 0, 0, 0);
    this.i = 0; this.layer = [];
    const z = 50;
    const btn = (x, y, label, fn) => makeButton(this, x, y, label, fn, { w: 400, h: 88, depth: z, fontSize: 34, kind: "continuar" });
    const t0 = this.textures.get("botoes_hub_sheet");
    if (t0 && !t0.has("b0")) for (let i = 0; i < 4; i++) t0.add(`b${i}`, 0, i * 128, 0, 128, 128);
    this.add.image(80, 70, "botoes_hub_sheet", "b0").setDisplaySize(104, 104).setDepth(z).setInteractive({ useHandCursor: true }).on("pointerup", () => this.back());
    btn(220, H - 60, "VOLTAR", () => this.turn(-1));
    btn(W - 220, H - 60, "PRÓXIMA", () => this.turn(1));
    this.dots = this.add.text(W / 2, H - 40, "", { fontFamily: "Georgia, serif", fontSize: "34px", color: "#F3D48A" }).setOrigin(0.5).setDepth(z);
    this.onKD = (e) => {
      if (e.repeat) return;
      if (e.code === "ArrowRight" || e.code === "Enter" || e.code === "Space" || e.code === "KeyD") this.turn(1);
      else if (e.code === "ArrowLeft" || e.code === "KeyA") this.turn(-1);
      else if (e.code === "Escape" || e.code === "Backspace") this.back();
    };
    window.addEventListener("keydown", this.onKD);
    this.input.on("pointerdown", (p) => (this.sx = p.x));
    this.input.on("pointerup", (p) => { if (this.sx != null && Math.abs(p.x - this.sx) > 120) this.turn(p.x < this.sx ? 1 : -1); this.sx = null; });
    this.events.once("shutdown", () => { window.removeEventListener("keydown", this.onKD); if (window.__curio === this) window.__curio = null; });
    window.__curio = this;
    this.show();
  }
  back() {
    if (this.leaving) return; this.leaving = true;
    this.audio.play("ui_back");
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(320, () => this.scene.start("portais", { at: this.item.portal }));
  }
  turn(d) {
    const n = this.item.cartas.length;
    const j = this.i + d;
    if (j >= n) return this.back();
    if (j < 0) return;
    this.i = j; this.audio.play("ui_next"); this.show();
  }
  cover(key, x, y, w, h) {
    const img = this.add.image(x, y, key);
    const s = Math.max(w / img.width, h / img.height); img.setScale(s);
    const m = this.make.graphics({ x, y }, false).fillRect(-w / 2, -h / 2, w, h); img.maskG = m;
    img.setMask(m.createGeometryMask());
    return img;
  }
  show() {
    this.layer.forEach((o) => o.destroy()); this.layer = [];
    const c = this.item.cartas[this.i];
    const L = (o) => (this.layer.push(o), o);
    markSeen(`cur-${this.item.id}-${this.i + 1}`);
    this.dots.setText(this.item.cartas.map((_, k) => (k === this.i ? "●" : "○")).join("  "));
    const isHQ = c.img && c.img.startsWith("hq_") && this.textures.exists(c.img);
    if (this.i === 0 && isHQ) {
      // carta 1: quadro da HQ em tela cheia + legenda
      const img = L(this.cover(c.img, W / 2, H / 2, W, H));
      this.tweens.add({ targets: img, scale: img.scale * 1.05, duration: 7000 });
      L(this.add.rectangle(W / 2, H - 200, 1300, 200, 0xfff3d6, 0.95).setStrokeStyle(5, 0x1a1208));
      L(this.add.text(W / 2, H - 260, c.titulo, { fontFamily: "Georgia, serif", fontSize: "44px", fontStyle: "bold", color: "#8A3A12" }).setOrigin(0.5));
      L(this.add.text(W / 2, H - 180, c.texto, { fontFamily: "Georgia, serif", fontSize: "34px", color: "#1A1208", align: "center", wordWrap: { width: 1220 } }).setOrigin(0.5));
      return;
    }
    // demais cartas: página de diário (carta_moldura)
    L(this.add.rectangle(W / 2, H / 2, 1400, 860, 0xf3e6c8)); // centro da arte é transparente
    L(this.add.image(W / 2, H / 2, "carta_moldura").setDisplaySize(1600, 1000));
    L(this.add.text(W / 2, 200, c.titulo, { fontFamily: "Georgia, serif", fontSize: "56px", fontStyle: "bold", color: "#5A2A0A" }).setOrigin(0.5));
    const hasArt = c.img && this.textures.exists(c.img) || c.extra === "album";
    L(this.add.text(W / 2, hasArt ? 895 : 520, c.texto, { fontFamily: "Georgia, serif", fontSize: hasArt ? "34px" : "44px", color: "#1A1208", align: "center", lineSpacing: 14, wordWrap: { width: 1280 } }).setOrigin(0.5, hasArt ? 1 : 0.5)); // ≥140 px da borda
    if (c.extra === "album") return this.album(c, L);
    if (!c.img || !this.textures.exists(c.img)) return;
    if (c.extra === "nos") return this.nos(c, L);
    const art = L(c.img.startsWith("hq_") ? this.cover(c.img, W / 2, 520, 1200, 560) : this.add.image(W / 2, 520, c.img));
    if (!c.img.startsWith("hq_")) { const s = Math.min(1200 / art.width, 540 / art.height); art.setScale(s); art.y = 500; }
    if (c.img === "polvo_dossie") { art.setScale(art.scale * 0.85).setAlpha(0); this.tweens.add({ targets: art, alpha: 1, duration: 900, ease: "Sine.easeOut" }); }
    if (c.extra === "mapa") this.mapa(L);
    if (c.extra === "lente") { art.setInteractive({ useHandCursor: true }).on("pointerdown", () => this.tweens.add({ targets: art, angle: art.angle + 45, duration: 500, ease: "Back.out" })); this.tweens.add({ targets: art, angle: 360, duration: 30000, repeat: -1 }); }
    if (c.extra === "explodido") { art.setInteractive({ useHandCursor: true }).on("pointerdown", () => this.tweens.add({ targets: art, scale: art.scale * 0.92, yoyo: true, duration: 300 })); }
  }
  album(c, L) {
    const fotos = (c.fotos || []).filter((k) => this.textures.exists(k));
    fotos.forEach((k, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = 600 + col * 360, y = 380 + row * 300, ang = [-4, 3, -2, 5, -3, 2][i];
      // janela da polaroid (512x600 → 256x300): x 38..213, y 46..226 → centro (-2, -14) em relação à moldura
      const rad = Phaser.Math.DegToRad(ang), ox = -2, oy = -14;
      const ph = L(this.cover(k, x + ox * Math.cos(rad) - oy * Math.sin(rad), y + ox * Math.sin(rad) + oy * Math.cos(rad), 184, 190));
      ph.setAngle(ang); ph.maskG.setAngle(ang);
      const fr = L(this.add.image(x, y, "polaroid_moldura").setDisplaySize(256, 300).setAngle(ang));
      fr.setInteractive({ useHandCursor: true }).on("pointerdown", () => this.tweens.add({ targets: fr, scale: fr.scale * 1.1, yoyo: true, duration: 200 }));
    });
  }
  nos(c, L) {
    const t = this.textures.get(c.img);
    const src = t.getSourceImage(); const fw = src.width / 4, fh = src.height / 3;
    if (!t.has("n0")) for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) t.add(`n${r * 4 + k}`, 0, k * fw, r * fh, fw, fh);
    const names = ["Lais de guia", "Escota", "Oito"];
    for (let r = 0; r < 3; r++) {
      const img = L(this.add.image(560 + r * 400, 500, c.img, `n${r * 4}`).setDisplaySize(260, 260));
      L(this.add.text(560 + r * 400, 670, names[r], { fontFamily: "Georgia, serif", fontSize: "32px", color: "#5A2A0A" }).setOrigin(0.5));
      let k = 0; L(this.time.addEvent({ delay: 700, loop: true, callback: () => { k = (k + 1) % 4; img.setFrame(`n${r * 4 + k}`).setDisplaySize(260, 260); } }));
    }
  }
  mapa(L) {
    const ids = new Set(readWallet().run.ids);
    ZONAS.forEach(([nome, x0, x1], i) => {
      const all = LEVEL.shells.filter((s) => s.x >= x0 && s.x < x1);
      const got = all.filter((s) => ids.has(s.id)).length;
      const x = 420 + i * 180;
      L(this.add.text(x + 120, 300 + (i % 2) * 380, `${nome}\n🐚 ${got}/${all.length}`, { fontFamily: "Georgia, serif", fontSize: "28px", color: "#FFF8EA", backgroundColor: "#5A2A0Acc", align: "center", padding: { x: 10, y: 6 } }).setOrigin(0.5));
    });
  }
}
