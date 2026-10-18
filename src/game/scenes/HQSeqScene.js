// @ts-nocheck
/**
 * Sequência de quadros da HQ em tela cheia (IntroHQScene e TransicaoHQScene).
 * Cover com foco por quadro, Ken Burns 1.00→zoom em ~6 s com deriva para o foco, fade 350 ms,
 * caixa de fala creme no topo/baixo (Georgia, máx. 2 linhas), Enter/Espaço/toque avança,
 * segurar 1 s ou Esc pula tudo.
 */
import Phaser from "../phaser.js";
import { makeButton } from "../systems/UIButton.js";
import { AudioManager } from "../systems/AudioManager.js";
import { readWallet, markSeen, portaisAcessiveis } from "../systems/Wallet.js";
import { reduceFlashes } from "../boss/common.js";
import DATA from "../data/intro_hq.json";
import { HQ_FRAME, containScale, makeHQBackdrop } from "../systems/HQPanel.js";
import LEVEL from "../data/fase1-vila.json";

const W = 1920, H = 1080;

class HQSeqBase extends Phaser.Scene {
  init(data) { this.opts = data || {}; }
  preload() {
    if (!this.textures.exists("caixa_fala_hq")) this.load.image("caixa_fala_hq", "assets/farol/fase3/ui/caixa_fala_hq.png");
    if (!this.textures.exists("carta_moldura")) this.load.image("carta_moldura", "assets/farol/fase3/curio/carta_moldura.png");
    if (!this.textures.exists("onomatopeias_sheet")) this.load.image("onomatopeias_sheet", "assets/farol/fase3/ui/onomatopeias_sheet.png");
  }
  frames() { return []; }
  finish() {}

  create() {
    document.body.classList.add("is-title");
    this.cameras.main.setBackgroundColor("#05080c");
    this.audio = this.registry.get("audio") || new AudioManager();
    this.registry.set("audio", this.audio);
    this.audio.unlock();
    this.list = this.frames().filter((f) => this.textures.exists(f.img));
    this.back = makeHQBackdrop(this, -2); this.back.alpha(1);
    this.imgA = this.add.image(W / 2, H / 2, "__WHITE").setAlpha(0);
    this.imgB = this.add.image(W / 2, H / 2, "__WHITE").setAlpha(0);
    this.box = this.add.graphics().setDepth(10);
    this.speaker = this.add.text(0, 0, "", { fontFamily: "Georgia, serif", fontSize: "30px", fontStyle: "bold", color: "#8A3A12" }).setDepth(11);
    this.txt = this.add.text(0, 0, "", { fontFamily: "Georgia, serif", fontSize: "40px", color: "#1A1208", wordWrap: { width: 1600 - 140 }, lineSpacing: 6, maxLines: 2 }).setDepth(11);
    this.big = this.add.text(W / 2, H / 2, "", { fontFamily: "Georgia, serif", fontSize: "140px", fontStyle: "bold", color: "#F39A3A", stroke: "#3A1E08", strokeThickness: 16 }).setOrigin(0.5).setDepth(12).setAlpha(0);
    this.hint = this.add.text(W - 40, H - 30, "Enter / toque: avançar  ·  segure ou Esc: pular", { fontFamily: "Georgia, serif", fontSize: "22px", color: "#F6E7C1", stroke: "#000", strokeThickness: 4 }).setOrigin(1, 1).setDepth(12).setAlpha(0.75);
    this.ring = this.add.graphics().setDepth(13);
    this.i = -1; this.t = 0; this.hold = 0; this.done = false; this.pressAt = null;
    window.__hqseq = this;

    this.onKD = (e) => {
      if (e.repeat) return;
      if (e.code === "Escape") this.skipAll();
      else if (e.code === "Enter" || e.code === "Space") { this.keyHeld = performance.now(); }
    };
    this.onKU = (e) => {
      if ((e.code === "Enter" || e.code === "Space") && this.keyHeld) { const held = performance.now() - this.keyHeld; this.keyHeld = null; if (held < 1000) this.next(); }
    };
    window.addEventListener("keydown", this.onKD);
    window.addEventListener("keyup", this.onKU);
    this.input.on("pointerdown", () => { this.pressAt = performance.now(); });
    this.input.on("pointerup", () => { if (this.pressAt != null && performance.now() - this.pressAt < 1000) this.next(); this.pressAt = null; });
    this.events.once("shutdown", () => { window.removeEventListener("keydown", this.onKD); window.removeEventListener("keyup", this.onKU); if (window.__hqseq === this) window.__hqseq = null; });
    if (!this.list.length) return this.finishOnce();
    this.next();
  }

  layout(img, f) {
    // contain dentro da moldura: a ilustração inteira, sem cortes; fundo = a mesma imagem escurecida
    const sc = containScale(this, f.img);
    img.setTexture(f.img).setScale(sc);
    this.back.set(f.img);
    img.base = sc;
    this.place(img, f, 1);
  }

  /** posiciona respeitando o foco (o ponto de foco fica o mais perto possível do centro, sem mostrar borda) */
  place(img, f, z) {
    img.setScale(img.base).setPosition(HQ_FRAME.cx, HQ_FRAME.cy); // sem zoom/corte
  }

  next() {
    if (this.done) return;
    if (this.i >= 0 && performance.now() - this.shownAt < 220) return; // evita pular 2 quadros num toque só
    this.shownAt = performance.now();
    this.i += 1;
    if (this.i >= this.list.length) return this.finishOnce();
    const f = this.list[this.i];
    this.cur = f;
    // quadro anterior vira fantasma e some em 350 ms (virada de página: desliza 40 px e escurece)
    if (this.imgA.alpha > 0) {
      this.imgB.setTexture(this.imgA.texture.key).setScale(this.imgA.scaleX).setPosition(this.imgA.x, this.imgA.y).setAlpha(1).setDepth(1).clearTint();
      this.tweens.add({ targets: this.imgB, alpha: 0, x: this.imgA.x - 40, duration: 350, onUpdate: (tw) => this.imgB.setTint(Phaser.Display.Color.GetColor(255 - 120 * tw.progress, 255 - 120 * tw.progress, 255 - 120 * tw.progress)) });
      this.audio.play("ui_next");
    }
    this.imgA.setDepth(0).setAlpha(0);
    this.layout(this.imgA, f);
    this.tweens.add({ targets: this.imgA, alpha: 1, duration: 350 });
    this.t = 0;
    this.drawBox(f);
    if (f.shake) this.cameras.main.shake(380, f.shake / 1000);
    markSeen(`hq-${this.scene.key}-${f.id}`);
  }

  drawBox(f) {
    this.box.clear(); this.big.setAlpha(0); this.onoma?.setAlpha(0); this.boxImg?.setVisible(false); this.speaker.setText(""); this.txt.setText("");
    if (f.onoma) {
      // onomatopeias_sheet (3 x 768x384: PUXA!, TUM., CLINC!) do Daniel; texto como reserva
      const idx = { "PUXA!": 0, "TUM.": 1, "CLINC!": 2 }[f.text];
      const t = this.textures.exists("onomatopeias_sheet") ? this.textures.get("onomatopeias_sheet") : null;
      if (t && idx != null) {
        if (!t.has("o0")) for (let i = 0; i < 3; i++) t.add(`o${i}`, 0, i * 768, 0, 768, 384);
        if (!this.onoma) this.onoma = this.add.image(W / 2, H / 2 - 80, "onomatopeias_sheet", "o0").setDepth(12);
        this.onoma.setFrame(`o${idx}`).setScale(0.6).setAlpha(1).setAngle(-6);
        this.tweens.add({ targets: this.onoma, scale: 1.05, duration: 260, ease: "Back.out" });
      } else {
        this.big.setText(f.text).setScale(0.6).setAlpha(1);
        this.tweens.add({ targets: this.big, scale: 1, duration: 260, ease: "Back.out" });
      }
      return;
    }
    if (f.box === "center") {
      this.big.setText(f.text).setFontSize(84).setColor("#FFF8EA").setAlpha(0);
      this.tweens.add({ targets: this.big, alpha: 1, duration: 600 });
      return;
    }
    this.big.setFontSize(140).setColor("#F39A3A");
    const bh = f.speaker ? 170 : 130;
    const by = f.box === "bottom" ? H - bh - 24 : 24;
    // caixa_fala_hq (1800x200) do Daniel como 9-slice horizontal: pontas de 40 px, margem de texto de 30 px
    if (this.textures.exists("caixa_fala_hq")) {
      if (!this.boxImg) this.boxImg = this.add.nineslice(0, 0, "caixa_fala_hq", undefined, 1600, 200, 40, 40, 0, 0).setOrigin(0).setDepth(10);
      this.boxImg.setPosition(160, by).setSize(1600, bh).setVisible(true);
    } else {
      this.box.fillStyle(0xfff3d6, 0.96).fillRoundedRect(160, by, 1600, bh, 14);
      this.box.lineStyle(5, 0x1a1208, 1).strokeRoundedRect(160, by, 1600, bh, 14);
    }
    let ty = by + 22;
    const tx = 160 + 40 + 30;
    if (f.speaker) { this.speaker.setText(f.speaker).setPosition(tx, ty); ty += 40; }
    this.txt.setPosition(tx, ty).setText(f.text);
  }

  skipAll() { this.finishOnce(); }

  finishOnce() {
    if (this.done) return;
    this.done = true;
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.time.delayedCall(370, () => this.finish());
  }

  update(_t, dms) {
    const dt = Math.min(dms / 1000, 0.05);
    this.t += dt;
    if (this.cur && !this.done) {
      const zEnd = this.cur.zoom || 1.06;
      const k = Math.min(1, this.t / 6.5);
      this.place(this.imgA, this.cur, 1 + (zEnd - 1) * k);
    }
    // segurar 1 s para pular (toque ou Enter)
    const heldMs = this.pressAt != null ? performance.now() - this.pressAt : this.keyHeld ? performance.now() - this.keyHeld : 0;
    this.ring.clear();
    if (heldMs > 150 && !this.done) {
      const p = Math.min(1, heldMs / 1000);
      this.ring.lineStyle(10, 0xf3d48a, 0.95).beginPath().arc(W - 90, 90, 44, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2).strokePath();
      if (p >= 1) { this.pressAt = null; this.keyHeld = null; this.skipAll(); }
    }
  }
}

export class IntroHQScene extends HQSeqBase {
  constructor() { super("intro-hq"); }
  frames() { return this.opts.longa ? DATA.intro : DATA.intro.filter((f) => f.curta); }
  finish() {
    markSeen("intro");
    document.body.classList.remove("is-title");
    this.scene.start(this.opts.back || "vila");
  }
}

export class TransicaoHQScene extends HQSeqBase {
  constructor() { super("transicao-hq"); }
  frames() { return DATA.transicao; }
  finish() { this.showSummary(); }

  /** resumo de conchas da run, com contagem animada e brilho */
  showSummary() {
    this.cameras.main.fadeIn(300, 0, 0, 0);
    this.imgA.setAlpha(0.35); this.imgB.setAlpha(0); this.box.clear(); this.boxImg?.setVisible(false); this.onoma?.setAlpha(0); this.txt.setText(""); this.speaker.setText(""); this.big.setAlpha(0); this.hint.setAlpha(0);
    const w = readWallet();
    const ids = new Set(w.run.ids);
    const got = LEVEL.shells.filter((s) => ids.has(s.id)).length;
    const total = LEVEL.shells.length;
    this.add.rectangle(W / 2, H / 2, 1300, 620, 0x0b2a44, 0.92).setStrokeStyle(5, 0xf3d48a).setDepth(20);
    this.add.text(W / 2, 300, "FIM DA FASE 1 · Vila das Conchas", { fontFamily: "Georgia, serif", fontSize: "52px", color: "#F3D48A" }).setOrigin(0.5).setDepth(21);
    const line = this.add.text(W / 2, 440, "", { fontFamily: "Georgia, serif", fontSize: "46px", color: "#FFF8EA", align: "center" }).setOrigin(0.5).setDepth(21);
    const startC = Math.max(0, w.carteira - LEVEL.shells.filter((s) => ids.has(s.id)).reduce((a, s) => a + (s.gold || s.secret ? 5 : 1), 0));
    const counter = { g: 0, c: startC };
    this.tweens.add({
      targets: counter, g: got, c: w.carteira, duration: 1600, ease: "Cubic.out",
      onUpdate: () => line.setText(`Conchas nesta run: ${Math.round(counter.g)}/${total}\nCarteira: 🐚 ${Math.round(counter.c)}`),
      onComplete: () => { this.audio.synth?.("gold3"); this.tweens.add({ targets: line, scale: 1.08, yoyo: true, duration: 160 }); },
    });
    const can = portaisAcessiveis(w);
    if (can > 0) this.add.text(W / 2, 560, can === 1 ? "Você já pode abrir 1 portal!" : `Você já pode abrir ${can} portais!`, { fontFamily: "Georgia, serif", fontSize: "34px", color: "#7FE3D9" }).setOrigin(0.5).setDepth(21);
    const btn = (x, label, kind, fn) => makeButton(this, x, 720, label, fn, { w: 520, h: 88, depth: 21, kind });
    let leaving = false;
    const go = (key, data) => () => { if (leaving) return; leaving = true; this.audio.play("ui_confirm"); this.cameras.main.fadeOut(400, 0, 0, 0); this.time.delayedCall(420, () => this.scene.start(key, data)); };
    this.toBoss = go("boss-polvo", { segment: 0 });
    this.toMenu = go("menu");
    btn(700, "FASE 2", "continuar", this.toBoss);
    btn(1220, "MENU", "menu", this.toMenu);
    this.input.removeAllListeners("pointerdown"); this.input.removeAllListeners("pointerup");
    window.removeEventListener("keydown", this.onKD); window.removeEventListener("keyup", this.onKU);
    this.onKD = (e) => { if (e.code === "Enter" || e.code === "Space" || e.code === "KeyC") this.toBoss(); else if (e.code === "Escape") this.toMenu(); };
    this.time.delayedCall(500, () => window.addEventListener("keydown", this.onKD));
    this.summary = { got, total, carteira: w.carteira };
  }
  update(t, d) { if (!this.summary) super.update(t, d); }
}
