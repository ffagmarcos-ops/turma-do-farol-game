// @ts-nocheck
/**
 * Hub dos Portais Temporais (santuário no alto do farol). A Marina anda num salão de 3840 px com
 * mezanino; 14 portais + 1 "Em breve" (correntes). Tab / ☰ abre o modo lista. Conchas são GASTAS:
 * a compra só acontece depois do pergaminho de confirmação (foco inicial em "Agora não"; no toque,
 * "Abrir" exige segurar 0,6 s). Arte: placeholders com os nomes do PLANEJAMENTO (assets/farol/fase3).
 */
import Phaser from "../phaser.js";
import { makeButton } from "../systems/UIButton.js";
import { askMainMenu } from "../systems/PauseMenu.js";
import { Marina } from "../entities/Marina.js";
import { AudioManager } from "../systems/AudioManager.js";
import { computeActions, keyDown, keyUp, clearInput } from "../input.js";
import { readWallet, buyPortal, PORTAIS, requisitoOk, newRun, resetAll, markSeen } from "../systems/Wallet.js";
import { readProgress } from "../systems/CheckpointSystem.js";
import { reduceFlashes } from "../boss/common.js";
import LEVEL from "../data/fase1-vila.json";
import CC0 from "../data/cc0_particulas.json";

const W = 1920, H = 1080, WORLD = 3840, FLOOR = 800, MEZ = 270;
// arte do Daniel (hub_chao_mezanino 3840x1080): passarela no topo (y≈270), escadas nas pontas, deck com perspectiva (anda em y=800)
const STEP_YS = [710, 620, 530, 440, 350];
const stairX = (y, side) => (side < 0 ? 150 + ((712 - y) / 431) * 600 : 3712 - ((712 - y) / 431) * 640);
// vão da moldura (portal_moldura 768x1024): x 172-594, topo do arco 289, base 1024
const OPEN = { w: 422 / 768, top: 289 / 1024, h: 735 / 1024 };
const A = "assets/farol/fase3/";
const IMGS = {
  hub_bg_ceu_mar: "hub/hub_bg_ceu_mar.png", hub_bg_parede: "hub/hub_bg_parede.png", hub_chao_mezanino: "hub/hub_chao_mezanino.png",
  hub_lente_farol: "hub/hub_lente_farol.png", hub_raios_luz: "hub/hub_raios_luz.png", hub_frente_cordas: "hub/hub_frente_cordas.png",
  portal_moldura: "portais/portal_moldura.png", portal_vitral_fechado: "portais/portal_vitral_fechado.png",
  portal_vitral_rachaduras_sheet: "portais/portal_vitral_rachaduras_sheet.png", portal_anel_energia: "portais/portal_anel_energia.png",
  cadeado_concha_sheet: "portais/cadeado_concha_sheet.png", placa_bronze: "portais/placa_bronze.png", placa_preco_dourada: "portais/placa_preco_dourada.png", placa_preco_cinza: "portais/placa_preco_cinza.png", portal_fase3_correntes: "portais/portal_fase3_correntes.png",
  icone_concha_hud: "ui/icone_concha_hud.png", icone_concha_dourada: "ui/icone_concha_dourada.png", carteira_hud: "ui/carteira_hud.png", pergaminho_confirma: "ui/pergaminho_confirma.png", botoes_hub_sheet: "ui/botoes_hub_sheet.png",
};
const CENA = { vila: "cena_vila_bg", mar: "cena_mar_bg", marina: "cena_marina", faisca: "cena_faisca", bia: "cena_bia", julia: "cena_julia", lucas: "cena_lucas", toninho: "cena_toninho", "vila-ilha": "cena_vila_bg", esperanca: "cena_esperanca", farol: "cena_farol", polvo: "cena_polvo", cavernas: "cena_cavernas", bastidores: "cena_bastidores" };
const FG = { vila: "cena_vila_fg", mar: "cena_mar_fg", faisca: "cena_faisca_rabo" };
for (const k of new Set([...Object.values(CENA), ...Object.values(FG)])) IMGS[k] = `portais/${k}.png`;
for (const k of new Set(Object.values(CENA))) IMGS[`${k}_blur`] = `portais/thumbs/${k}_blur.png`;
// CC0 do menu (curadoria Daniel 18/10): Cosmic 21-25, anéis/shockwave/magic_flat do Blender, magic_03-05
const C3 = "assets/farol/cc0_f3/menu/";
const CC0IMG = { cosmic21: "Cosmic_21.png", cosmic22: "Cosmic_22.png", cosmic23: "Cosmic_23.png", cosmic24: "Cosmic_24.png", cosmic25: "Cosmic_25.png", magic03: "magic_03.png", magic04: "magic_04.png", magic05: "magic_05.png" };
const CC0STRIP = { ring_magic: ["ring_magic_strip.png", 40], shockwave_magic: ["shockwave_magic_strip.png", 20], magic_flat: ["magic_flat_strip.png", 30] };
const TURQ = 0x3fd6c8, OURO = 0xf2c14e;
export const FASE3_IMGS = IMGS;
const PW = 220, PH = 293, MPW = 165, MPH = 220; // chão / mezanino (proporção 768x1024)

// posições: 8 no chão (entre as escadas), 6 + "Em breve" na passarela
const FLOOR_IDS = ["vila", "mar", "marina", "faisca", "bia", "julia", "lucas", "toninho"];
const MEZ_IDS = ["vila-ilha", "esperanca", "farol", "polvo", "cavernas", "bastidores", "embreve"];
const LAYOUT = [...FLOOR_IDS.map((id, i) => [id, 830 + i * 305, FLOOR]), ...MEZ_IDS.map((id, i) => [id, 900 + i * 345, MEZ])];

export function loadFase3(scene) {
  for (const [k, p] of Object.entries(IMGS)) if (!scene.textures.exists(k)) scene.load.image(k, A + p);
  for (const [k, p] of Object.entries(CC0IMG)) if (!scene.textures.exists(k)) scene.load.image(k, C3 + p);
  for (const [k, [p]] of Object.entries(CC0STRIP)) if (!scene.textures.exists(k)) scene.load.spritesheet(k, C3 + p, { frameWidth: 128, frameHeight: 128 });
}

export class PortaisScene extends Phaser.Scene {
  constructor() { super("portais"); }
  init(data) { this.from = data?.at || null; this.fromMenu = Boolean(data?.list); } // list: aberto pelo menu principal, direto no modo lista
  preload() { loadFase3(this); }

  create() {
    clearInput();
    document.body.classList.remove("is-title");
    this.audio = this.registry.get("audio") || new AudioManager();
    this.registry.set("audio", this.audio);
    this.audio.unlock();
    this.wallet = readWallet();
    this.shown = this.wallet.carteira;
    this.physics.world.gravity.y = LEVEL.physics.gravity;
    this.physics.world.setBounds(0, 0, WORLD, 1300);
    this.cameras.main.setBounds(0, 0, WORLD, H).setBackgroundColor("#2b1d14");
    this.cameras.main.fadeIn(400, 0, 0, 0);
    for (const [k, [, n]] of Object.entries(CC0STRIP)) if (!this.anims.exists(`a_${k}`) && this.textures.exists(k)) this.anims.create({ key: `a_${k}`, frames: this.anims.generateFrameNumbers(k, { start: 0, end: n - 1 }), frameRate: 24, repeat: k === "shockwave_magic" ? 0 : -1 });
    // música mística do hub (CC0); ao sair, volta a configuração anterior sem tocar por cima das fases
    this.audio.useSceneMusic(this, "assets/audio/menu/musica_mistica.ogg");
    this.humT = 1;
    if (this.textures.exists("portal_vitral_rachaduras_sheet")) this.sheetFrames("portal_vitral_rachaduras_sheet", 4, "rach");
    if (this.textures.exists("cadeado_concha_sheet")) this.sheetFrames("cadeado_concha_sheet", 3, "lock"); // Daniel: fechado, rachando, aberto

    // ---- cenário em camadas (arte do Daniel, lote 1) ----
    this.add.image(0, 0, "hub_bg_ceu_mar").setOrigin(0).setDisplaySize(WORLD, H).setScrollFactor(0.35).setDepth(0).setTint(0x8f94a6); // saturado: escurece
    this.lens = this.add.image(1910, 520, "hub_lente_farol").setDisplaySize(520, 520).setDepth(0.5); // vista pela janela central
    this.add.image(0, 0, "hub_bg_parede").setOrigin(0).setDisplaySize(WORLD, H).setDepth(1); // 2 telas, sem repetir (o mundo tem exatamente 3840)
    // feixes saem da esquerda da imagem: um para cada lado a partir da lente
    this.rays = [1, -1].map((dir) => this.add.image(1910, 520, "hub_raios_luz").setOrigin(0, 0.5).setFlipX(dir < 0).setOrigin(dir > 0 ? 0 : 1, 0.5).setDisplaySize(1600, 800).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.4).setDepth(2));
    this.add.image(0, 0, "hub_chao_mezanino").setOrigin(0).setDisplaySize(WORLD, H).setDepth(3);
    this.front = this.add.image(0, H - 400, "hub_frente_cordas").setOrigin(0).setDisplaySize(WORLD, 400).setScrollFactor(1.25).setDepth(40).setAlpha(0.65);
    // blur da frente já assado (1920x200 desfocada), sem preFX
    if (this.textures.exists("f2_cc0")) {
      this.dust = this.add.particles(0, 0, "f2_cc0", { frame: [CC0.circle_01, CC0.circle_02, CC0.light_01, CC0.light_02], x: { min: 0, max: WORLD }, y: { min: 100, max: 760 }, lifespan: 5000, speedY: { min: -14, max: -4 }, speedX: { min: -6, max: 6 }, scale: { start: 0.03, end: 0.07 }, alpha: { start: 0.45, end: 0 }, tint: OURO, frequency: 160, blendMode: "NORMAL" }).setDepth(5);
    }

    // ---- colisão: chão, mezanino (passa por baixo, sobe por cima) e caixote-degrau ----
    this.solids = this.physics.add.staticGroup();
    const solid = (x, y, w, h, oneWay) => {
      const z = this.add.zone(x + w / 2, y + h / 2, w, h);
      this.physics.add.existing(z, true);
      if (oneWay) { z.body.checkCollision.down = false; z.body.checkCollision.left = false; z.body.checkCollision.right = false; }
      this.solids.add(z);
    };
    solid(0, FLOOR, WORLD, 300, false);
    solid(740, MEZ, 2345, 24, true); // passarela
    for (const side of [-1, 1]) for (const y of STEP_YS) { const x = stairX(y, side); solid(x - 45, y, 90, 20, true); } // degraus (sobe pulando)
    solid(-40, 0, 40, H, false); solid(WORLD, 0, 40, H, false);
    this.steps = [-1, 1].flatMap((side) => STEP_YS.map((y) => ({ x: stairX(y, side), y, side })));

    // ---- portais ----
    this.portals = LAYOUT.map(([id, x, y]) => this.makePortal(id, x, y));

    // ---- Marina ----
    const back = this.portals.find((p) => p.id === this.from);
    const sx = back ? back.x : 830, sy = back ? back.y : FLOOR;
    this.player = new Marina(this, sx, sy - 4, LEVEL.physics);
    this.player.sprite.setDepth(20);
    this.physics.add.collider(this.player.sprite, this.solids);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1, 0, 0);

    // ---- HUD ----
    this.makeHud();
    this.mode = "walk";
    if (this.fromMenu) this.time.delayedCall(420, () => this.toggleList());
    this.onKD = (e) => {
      if (e.repeat) return;
      keyDown(e.code);
      if (e.code === "ArrowUp" || e.code === "KeyW") this.upKey = true;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "Tab"].includes(e.code)) e.preventDefault();
      this.onKey(e.code);
    };
    this.onKU = (e) => { keyUp(e.code); if (e.code === "ArrowUp" || e.code === "KeyW") this.upKey = false; };
    window.addEventListener("keydown", this.onKD);
    window.addEventListener("keyup", this.onKU);
    this.input.on("pointerdown", (p, objs) => { if (this.mode === "walk" && !objs.length) this.walkTo = null; });
    this.events.once("shutdown", () => {
      window.removeEventListener("keydown", this.onKD); window.removeEventListener("keyup", this.onKU); clearInput();
      if (window.__portais === this) window.__portais = null;
    });
    this.waveT = 2;
    window.__portais = this;
    markSeen("hub");
  }

  sheetFrames(key, n, prefix) {
    const t = this.textures.get(key);
    if (t.has(`${prefix}0`)) return;
    const src = t.getSourceImage(); const fw = src.width / n;
    for (let i = 0; i < n; i++) t.add(`${prefix}${i}`, 0, i * fw, 0, fw, src.height);
  }

  meta(id) {
    if (id === "embreve") return { id, nome: "Ilha das Cavernas Azuis", tipo: "Fase 3", preco: null };
    return PORTAIS.find((p) => p.id === id);
  }

  /** estado: open | locked-req | afford | poor | soon */
  stateOf(p) {
    if (p.id === "embreve") return "soon";
    const w = this.wallet;
    if (w.portas.includes(p.id)) return "open";
    if (!requisitoOk(p.meta)) return "locked-req";
    if (p.meta.preco === 0) return "open";
    return w.carteira >= p.meta.preco ? "afford" : "poor";
  }

  makePortal(id, x, y) {
    const meta = this.meta(id);
    const mez = y < FLOOR;
    const pw = mez ? MPW : PW, ph = mez ? MPH : PH;
    const p = { id, x, y, meta, mez, pw, ph, cy: y - ph / 2 };
    const d = 6;
    // vão em arco (máscara geométrica) para vitral, cena viva e rachaduras
    const ow = pw * OPEN.w, otop = y - ph + ph * OPEN.top, oh = ph * OPEN.h;
    const oc = { x, y: otop + oh / 2, w: ow, h: oh };
    // desempenho: o arco já vem recortado no alfa das imagens (tools/assar_hub.py), sem máscara geométrica
    p.aura = this.add.ellipse(x, p.cy, pw * 1.25, ph * 1.12, 0x5fe0d6, 0.0).setDepth(d - 0.3).setBlendMode(Phaser.BlendModes.ADD);
    const fitIn = (img) => img.setDisplaySize(oc.w, oc.h).setPosition(oc.x, oc.y);
    if (id !== "embreve") {
      p.scene = fitIn(this.add.image(0, 0, CENA[id]).setDepth(d - 0.2));
      if (CENA[id] === "cena_vila_bg") p.scene.setTint(0xd9d2ca); // saturada demais: suaviza
      if (id === "farol") p.scene.setTint(0xe6e6e6); // ~10% mais escura
      if (id === "polvo") p.scene.setTint(0xa5b1b7); // multiply 40% de #1d3b4a (azul-petróleo escuro)
      // bastidores: blur leve já assado na imagem (preFX custava caro no celular)
      if (FG[id] && this.textures.exists(FG[id])) {
        p.fg = fitIn(this.add.image(0, 0, FG[id]).setDepth(d - 0.15));
        p.fgX = oc.x; p.fgY = oc.y;
        if (id === "vila") { p.fgY = oc.y + oc.h * 0.08; p.fg.setY(p.fgY).setAlpha(0.9); } // preenche metade: desce um pouco
        if (id === "mar") { p.fg.setOrigin(0.5, 1).setDisplaySize(oc.w * 0.75, oc.h * 0.75); p.fgY = oc.y + oc.h / 2; p.fg.setY(p.fgY); } // tentáculo a 75%, preso na base
        if (id === "faisca") {
          // rabo: pivô na base (x≈545/640, y≈470/880, borda direita do desenho) para abanar
          const px = 545 / 640, py = 470 / 880;
          p.fg.setOrigin(px, py); p.fgX = oc.x - oc.w / 2 + px * oc.w; p.fgY = oc.y - oc.h / 2 + py * oc.h; p.fg.setPosition(p.fgX, p.fgY);
          p.wag = true;
        }
      }
      if (id === "mar") p.lightning = !reduceFlashes(); // com "reduzir flashes": fundo estático
      p.glass = fitIn(this.add.image(0, 0, "portal_vitral_fechado").setDepth(d - 0.1).setTint(0xb3b3b3)); // 70%
      p.crack = fitIn(this.add.image(0, 0, "portal_vitral_rachaduras_sheet", "rach0").setDepth(d - 0.05).setBlendMode(Phaser.BlendModes.ADD).setVisible(false));
      p.ring = this.add.image(x, oc.y, "portal_anel_energia").setDisplaySize(pw * 1.15, pw * 1.15).setDepth(d + 0.1).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
    } else {
      p.glass = fitIn(this.add.image(0, 0, "portal_vitral_fechado").setDepth(d - 0.1).setTint(0x4a5258));
    }
    p.oc = oc;
    if (id !== "embreve") {
      // vórtice Cosmic 21-25 DENTRO do vitral (ADD, #3fd6c8), só em portal disponível/abrindo
      if (this.textures.exists("cosmic21")) p.vortex = this.add.image(oc.x, oc.y, "cosmic21").setDisplaySize(oc.w * 0.95, oc.w * 0.95).setTint(TURQ).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setDepth(d - 0.08);
      // anel mágico (Blender) atrás da moldura
      if (this.anims.exists("a_ring_magic")) p.rmagic = this.add.sprite(oc.x, oc.y, "ring_magic").play("a_ring_magic").setDisplaySize(pw * 1.2, pw * 1.2).setTint(TURQ).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setDepth(d - 0.25);
      // névoa no limiar (magic_flat, NORMAL, alfa baixo)
      if (this.anims.exists("a_magic_flat")) p.mist = this.add.sprite(x, y - ph * 0.06, "magic_flat").play({ key: "a_magic_flat", startFrame: (x / 7) % 30 | 0 }).setDisplaySize(pw * 0.9, ph * 0.3).setTint(TURQ).setAlpha(0).setDepth(d - 0.07);
    }
    p.frame = this.add.image(x, p.cy, "portal_moldura").setDisplaySize(pw, ph).setDepth(d);
    if (id === "embreve") p.chains = this.add.image(x, p.cy, "portal_fase3_correntes").setDisplaySize(pw, ph).setDepth(d + 0.2);
    // placa em branco da arte (x≈384, y≈790 em 768x1024): "Em breve" escrito no código
    if (id === "embreve") p.soonTxt = this.add.text(x, y - ph + ph * (790 / 1024), "Em breve", { fontFamily: "Georgia, serif", fontSize: `${Math.round(pw * 0.13)}px`, fontStyle: "bold", color: "#3A2410" }).setOrigin(0.5).setDepth(d + 0.25);
    const ls = mez ? 66 : 84;
    p.lockSize = ls;
    p.lock = this.add.image(x, oc.y + 10, "cadeado_concha_sheet", "lock0").setDisplaySize(ls, ls).setDepth(d + 0.3);
    // placa de preço (dourada/cinza; concha no círculo da esquerda). No mezanino, fica na face da passarela.
    const py = mez ? 340 : y - ph - 38, pwid = mez ? 250 : 290;
    p.plate = this.add.image(x, py, "placa_preco_dourada").setDisplaySize(pwid, pwid * 160 / 512).setDepth(d + 0.4);
    p.icon = this.add.image(x - pwid / 2 + pwid * 0.155, py, "icone_concha_hud").setDisplaySize(pwid * 0.12, pwid * 0.12).setDepth(d + 0.5);
    const tx = x + pwid * 0.08;
    p.name = this.add.text(tx, py - 15, meta.nome, { fontFamily: "Georgia, serif", fontSize: mez ? "16px" : "18px", color: "#FFF3D6", align: "center", stroke: "#3A2410", strokeThickness: 3, wordWrap: { width: pwid * 0.66 } }).setOrigin(0.5).setDepth(d + 0.5);
    p.price = this.add.text(tx, py + 15, "", { fontFamily: "Georgia, serif", fontSize: mez ? "19px" : "21px", fontStyle: "bold", color: "#F3D48A", stroke: "#3A2410", strokeThickness: 3 }).setOrigin(0.5).setDepth(d + 0.5);
    p.need = this.add.text(x, mez ? 392 : y - 12, "", { fontFamily: "Georgia, serif", fontSize: "19px", color: "#CFE3EA", stroke: "#1A1208", strokeThickness: 4 }).setOrigin(0.5, mez ? 0 : 1).setDepth(d + 0.5);
    p.hit = this.add.zone(x, p.cy, pw, ph).setInteractive({ useHandCursor: true }).setDepth(d + 1);
    p.hit.on("pointerdown", () => this.tapPortal(p));
    if (this.textures.exists("f2_cc0")) p.sparks = this.add.particles(x, y - 20, "f2_cc0", { frame: [CC0.spark_02, CC0.spark_05], x: { min: -pw / 2.4, max: pw / 2.4 }, lifespan: 1400, speedY: { min: -90, max: -40 }, scale: { start: 0.08, end: 0 }, alpha: { start: 0.8, end: 0 }, tint: TURQ, frequency: 140, blendMode: "ADD", emitting: false }).setDepth(d - 0.12);
    this.refreshPortal(p);
    return p;
  }

  refreshPortal(p, anim = false) {
    const st = this.stateOf(p);
    p.state = st;
    const open = st === "open";
    p.lock.setVisible(!open && st !== "soon");
    if (p.glass && p.id !== "embreve") p.glass.setVisible(!open);
    if (p.ring && open && !anim) p.ring.setAlpha(0.55);
    if (p.crack && !anim) p.crack.setVisible(false);
    p.sparks && (p.sparks.emitting = st === "afford");
    p.aura.setAlpha(st === "afford" ? 0.18 : open ? 0.1 : 0);
    p.vortex?.setAlpha(st === "afford" ? 0.45 : 0);
    p.rmagic?.setAlpha(st === "afford" ? 0.5 : 0);
    p.mist?.setAlpha(open ? 0.35 : 0);
    p.name.setColor(open ? "#FFE08A" : "#FFF3D6");
    p.need.setText("");
    const gray = st === "poor" || st === "locked-req" || st === "soon";
    p.plate.setTexture(gray ? "placa_preco_cinza" : "placa_preco_dourada");
    p.icon.setTexture(gray ? "icone_concha_hud" : "icone_concha_dourada").setDisplaySize(p.icon.displayWidth || 34, p.icon.displayHeight || 34);
    if (st === "soon") { p.price.setText("Em breve").setColor("#CFE3EA"); }
    else if (open) p.price.setText(p.meta.tipo === "Fase" ? "▶ Jogar" : "aberto").setColor("#FFE08A");
    else if (st === "locked-req") { p.price.setText(p.meta.requer === "f1" ? "termine a Fase 1" : "vença a Fase 2").setColor("#CFE3EA"); if (p.meta.preco) p.need.setText(`🐚 ${p.meta.preco}`); }
    else if (st === "afford") p.price.setText(`🐚 ${p.meta.preco}`).setColor("#F3D48A");
    else { p.price.setText(`🐚 ${p.meta.preco}`).setColor("#8FA6B2"); p.need.setText(`faltam 🐚 ${p.meta.preco - this.wallet.carteira}`); }
  }

  makeHud() {
    const d = 100;
    // carteira_hud (480x160): as cordas passam da borda direita, então fica com margem
    this.hudPlate = this.add.image(W - 70, 70, "carteira_hud").setOrigin(1, 0.5).setDisplaySize(330, 110).setScrollFactor(0).setDepth(d);
    this.hudIcon = this.hudPlate; // a concha já vem desenhada na carteira
    this.hudNum = this.add.text(W - 70 - 330 * 0.42, 70, String(this.shown), { fontFamily: "Georgia, serif", fontSize: "42px", fontStyle: "bold", color: "#FFE08A" }).setOrigin(0.5).setScrollFactor(0).setDepth(d + 1);
    const t0 = this.textures.get("botoes_hub_sheet");
    if (!t0.has("b0")) for (let i = 0; i < 4; i++) t0.add(`b${i}`, 0, i * 128, 0, 128, 128); // ✕, lista, ↑, engrenagem
    const ICON = { "✕": "b0", "☰": "b1" };
    const btn = (x, y, label, fn, w = 96) => {
      if (ICON[label]) {
        const b = this.add.image(x, y, "botoes_hub_sheet", ICON[label]).setDisplaySize(104, 104).setScrollFactor(0).setDepth(d).setInteractive({ useHandCursor: true });
        b.on("pointerdown", (pt, lx, ly, ev) => { ev?.stopPropagation?.(); fn(); });
        return [b, this.add.text(x, y, "").setScrollFactor(0)];
      }
      const mb = makeButton(this, x, y, label, fn, { w, h: 80, depth: d, scrollFactor: 0, fontSize: 30, kind: /ENTRAR|JOGAR|ABRIR/.test(label) ? "portais" : /APAGAR/.test(label) ? "menu" : "jogar_de_novo" });
      return [mb.bg, mb.text];
    };
    btn(70, 64, "✕", () => this.askBack());
    btn(186, 64, "☰", () => this.toggleList());
    this.introBtn = btn(450, 64, "REVER INTRODUÇÃO", () => this.go("intro-hq", { longa: true, back: "portais" }), 360);
    
    this.resetBtn = btn(820, 64, "APAGAR PROGRESSO", () => this.askReset(), 360);
    
    this.enterBtn = btn(W / 2, H - 110, "ENTRAR", () => this.near && this.enterPortal(this.near), 420);
    this.enterBtn[1].setFontSize(34);
    this.enterBtn.forEach((o) => o.setVisible(false));
    this.tip = this.add.text(W / 2, 150, "", { fontFamily: "Georgia, serif", fontSize: "30px", color: "#FFF8EA", stroke: "#1A1208", strokeThickness: 6, align: "center" }).setOrigin(0.5).setScrollFactor(0).setDepth(d + 2);
    this.add.text(W - 30, H - 24, "←/→ andar · Espaço pular · ↑/Enter entrar · Tab lista · Esc voltar", { fontFamily: "Georgia, serif", fontSize: "20px", color: "#F6E7C1", stroke: "#000", strokeThickness: 4 }).setOrigin(1, 1).setScrollFactor(0).setDepth(d).setAlpha(0.7);
  }

  setShown(v) {
    this.shown = v; this.hudNum.setText(String(Math.round(v)));
    this.hudIcon.setScale(this.hudIcon.scaleX); // noop
  }
  pulseIcon() { this.tweens.killTweensOf(this.hudNum); this.hudNum.setScale(1); this.tweens.add({ targets: this.hudNum, scale: 1.25, yoyo: true, duration: 110 }); }

  say(text, ms = 2200) {
    this.tip.setText(text).setAlpha(1);
    this.tweens.killTweensOf(this.tip);
    this.tweens.add({ targets: this.tip, alpha: 0, delay: ms, duration: 400 });
  }

  /* ---------------- entrada ---------------- */
  onKey(code) {
    if (this.mode === "confirm") return this.confirmKey(code);
    if (this.mode === "list") return this.listKey(code);
    if (this.mode === "reset") return this.resetKey(code);
    if (this.mode === "busy" || this.mode === "ask") return;
    if (code === "Tab") return this.toggleList();
    if (code === "Escape" || code === "Backspace") return this.askBack();
    if ((code === "ArrowUp" || code === "KeyW") && this.near) this.enterPortal(this.near);
  }

  tapPortal(p) {
    if (this.mode !== "walk") return;
    if (this.near === p) return this.enterPortal(p);
    this.walkTo = p; // anda sozinha até o portal tocado
  }

  back() { this.audio.play("ui_back"); this.go("menu"); }
  /** ✕ / Esc no hub: confirmação simples antes de voltar ao menu principal */
  askBack() {
    if (this.mode !== "walk") return;
    this.mode = "ask"; clearInput(); this.walkTo = null;
    askMainMenu(this, { depth: 300, onYes: () => { this.mode = "walk"; this.back(); }, onNo: () => { this.mode = "walk"; clearInput(); } });
  }

  go(key, data) {
    if (this.leaving) return;
    this.leaving = true; this.mode = "busy";
    this.audio.play("ui_confirm");
    this.cameras.main.fadeOut(350, 0, 0, 0);
    let done = false;
    const start = () => { if (done) return; done = true; if (key === "menu" || key === "intro-hq") document.body.classList.add("is-title"); this.scene.start(key, data); };
    this.time.delayedCall(370, start);
    setTimeout(start, 700); // reserva: garante a troca mesmo se o relógio da cena atrasar
  }

  enterPortal(p) {
    if (this.mode !== "walk") return;
    const st = this.stateOf(p);
    if (st === "soon") { this.shakeLock(p); return this.say("Ilha das Cavernas Azuis: abre ao terminar a Fase 3."); }
    if (st === "locked-req") { this.shakeLock(p); return this.say(p.meta.requer === "f1" ? "Termine a Fase 1 para abrir o Mar Aberto." : "Vença o polvo na Fase 2 para abrir este portal."); }
    if (st === "poor") { this.shakeLock(p); return this.say(`Faltam 🐚 ${p.meta.preco - this.wallet.carteira} para abrir “${p.meta.nome}”.`); }
    if (st === "afford") return this.openConfirm(p);
    this.travel(p);
  }

  travel(p) {
    // zoom no vitral + corte
    this.mode = "busy";
    this.audio.play("whoosh", { volume: 0.8 });
    this.cameras.main.pan(p.x, p.cy, 380, "Sine.easeInOut");
    this.cameras.main.zoomTo(2.4, 420, "Sine.easeIn");
    this.time.delayedCall(330, () => this.cameras.main.fadeOut(220, 220, 255, 250));
    this.time.delayedCall(580, () => {
      if (p.id === "vila") {
        if (!readProgress()?.checkpointX) newRun();
        document.body.classList.remove("is-title");
        this.scene.start("vila");
      } else if (p.id === "mar") this.scene.start("boss-polvo", { segment: 0 });
      else this.scene.start("curiosidade", { id: p.id });
    });
  }

  shakeLock(p) {
    this.audio.synth?.("toc");
    this.tweens.add({ targets: [p.lock, p.plate, p.icon, p.name, p.price], x: "+=6", yoyo: true, repeat: 3, duration: 45 });
  }

  /* ---------------- pergaminho de confirmação ---------------- */
  openConfirm(p) {
    this.mode = "confirm"; this.confirmP = p; this.focus = 1; this.walkTo = null;
    clearInput();
    this.audio.play("ui_open");
    const w = this.wallet.carteira, c = p.meta.preco;
    const objs = [];
    const z = 200;
    objs.push(this.add.rectangle(W / 2, H / 2, W, H, 0x02060c, 0.6).setScrollFactor(0).setDepth(z).setInteractive());
    // pergaminho_confirma (1200x900): botões ✔ / ✕ já desenhados no rolo de baixo
    const SC = 0.9, ox = W / 2 - 600 * SC, oy = H / 2 - 450 * SC;
    objs.push(this.add.image(W / 2, H / 2, "pergaminho_confirma").setScale(SC).setScrollFactor(0).setDepth(z + 1));
    if (this.textures.exists(CENA[p.id])) {
      const tk = this.textures.exists(`${CENA[p.id]}_blur`) ? `${CENA[p.id]}_blur` : CENA[p.id]; // miniatura já desfocada
      const thumb = this.add.image(ox + 870 * SC, oy + 380 * SC, tk).setDisplaySize(190, 250).setScrollFactor(0).setDepth(z + 2).setAlpha(0.85);
      objs.push(thumb);
    }
    const T = (x, y, s, size = 40, color = "#1A1208", o = 0) => { const t = this.add.text(x, y, s, { fontFamily: "Georgia, serif", fontSize: `${size}px`, color, wordWrap: { width: 820 }, align: o ? "center" : "left" }).setOrigin(o, 0.5).setScrollFactor(0).setDepth(z + 2); objs.push(t); return t; };
    T(W / 2, oy + 215 * SC, `Abrir o portal “${p.meta.nome}”?`, 38, "#1A1208", 0.5);
    T(ox + 230 * SC, oy + 330 * SC, `Saldo:    🐚 ${w}`); T(ox + 230 * SC, oy + 410 * SC, `Custo:    🐚 ${c}`); T(ox + 230 * SC, oy + 490 * SC, `Depois:  🐚 ${w - c}`, 40, "#2F6A3A");
    const mk = (cx, cy, label) => {
      const b = this.add.circle(ox + cx * SC, oy + cy * SC, 100 * SC, 0xffffff, 0.001).setScrollFactor(0).setDepth(z + 2).setInteractive({ useHandCursor: true });
      const t = T(ox + cx * SC, oy + (cy + 130) * SC, label, 28, "#FFF8EA", 0.5);
      t.setStroke("#1A1208", 5);
      objs.push(b);
      return { b, t };
    };
    this.cOpen = mk(445, 785, "Abrir");
    this.cNo = mk(750, 785, "Agora não");
    this.cFocus = this.add.graphics().setScrollFactor(0).setDepth(z + 3); objs.push(this.cFocus);
    this.cRing = this.add.graphics().setScrollFactor(0).setDepth(z + 3); objs.push(this.cRing);
    this.cHint = T(W / 2, oy + 900 * SC + 40, "←/→ escolher · Enter confirmar · Esc cancelar · toque e segure “Abrir”", 22, "#F6E7C1", 0.5);
    this.cObjs = objs;
    // toque/mouse: "Abrir" exige segurar 0,6 s (anel enche)
    this.cOpen.b.on("pointerdown", () => { this.focus = 0; this.holdStart = performance.now(); this.drawFocus(); });
    const cancelHold = () => { this.holdStart = null; this.cRing.clear(); };
    this.cOpen.b.on("pointerup", cancelHold); this.cOpen.b.on("pointerout", cancelHold);
    this.cNo.b.on("pointerdown", () => this.closeConfirm());
    this.drawFocus();
  }

  drawFocus() {
    if (!this.cOpen) return;
    const o = this.focus === 0 ? this.cOpen : this.cNo;
    this.cFocus.clear().lineStyle(8, 0xffe08a, 1).strokeCircle(o.b.x, o.b.y, o.b.radius + 10);
  }

  confirmKey(code) {
    if (code === "ArrowLeft" || code === "KeyA") this.focus = 0;
    else if (code === "ArrowRight" || code === "KeyD") this.focus = 1;
    else if (code === "Escape" || code === "Backspace") return this.closeConfirm();
    else if (code === "Enter" || code === "Space") return this.focus === 0 ? this.doBuy() : this.closeConfirm();
    this.drawFocus();
  }

  closeConfirm(silent) {
    this.cObjs?.forEach((o) => o.destroy());
    this.cObjs = null; this.cOpen = null; this.holdStart = null;
    if (!silent) this.audio.play("ui_close");
    this.mode = "walk";
    clearInput();
    if (!silent && this.fromMenu) this.toggleList(); // veio do menu: "Agora não" volta para a lista
  }

  doBuy() {
    const p = this.confirmP;
    const before = this.wallet.carteira;
    const res = buyPortal(p.id, p.meta.preco); // gravação atômica (portas + carteira juntas)
    this.closeConfirm(true);
    if (!res.ok) { this.shakeLock(p); return this.say("Conchas insuficientes."); }
    this.wallet = res.w;
    this.unlockFx(p, before, res.w.carteira);
  }

  /* ---------------- efeito de abertura (~3 s) ---------------- */
  unlockFx(p, from, to) {
    this.mode = "busy";
    const cam = this.cameras.main;
    const n = Math.min(40, p.meta.preco);
    const per = (from - to) / n;
    let shown = from;
    // 1) conchas voam do HUD até a porta, em arco, "plim" subindo de tom
    for (let i = 0; i < n; i++) {
      const s = this.add.image(0, 0, "icone_concha_hud").setDisplaySize(44, 44).setDepth(60);
      const t0 = { k: 0 };
      const sx = cam.scrollX + W - 70 - 330 * 0.8, sy = cam.scrollY + 70;
      const cx = (sx + p.x) / 2, cy = Math.min(sy, p.cy) - 260 - Math.random() * 80;
      this.tweens.add({
        targets: t0, k: 1, delay: i * 30, duration: 650, ease: "Sine.in",
        onUpdate: () => { const k = t0.k, a = (1 - k) * (1 - k), b = 2 * (1 - k) * k, c = k * k; s.setPosition(a * sx + b * cx + c * p.x, a * sy + b * cy + c * p.cy); s.rotation = k * 6; },
        onComplete: () => { s.destroy(); shown -= per; this.setShown(Math.max(to, shown)); this.pulseIcon(); this.audio.synth?.("plim", { step: Math.min(24, i * 0.6), volume: 0.6 }); if (i % 6 === 0) this.audio.play("moedas", { volume: 0.5 }); },
      });
    }
    const T1 = n * 30 + 650;
    // 2) cadeado abre em 2 metades e cai
    this.time.delayedCall(T1, () => {
      this.setShown(to);
      // quadro 1 (rachando) tem luz rosada: tint dourado; depois abre (quadro 2)
      p.lock.setFrame("lock1").setTint(0xffd27a).setDisplaySize(p.lockSize, p.lockSize);
      this.audio.play("clinc");
      this.time.delayedCall(220, () => p.lock.setFrame("lock2").setDisplaySize(p.lockSize, p.lockSize));
      this.tweens.add({ delay: 220, targets: p.lock, y: p.lock.y + 260, angle: 40, alpha: 0, duration: 700, ease: "Quad.in" });
    });
    // 3) vitral racha em luz + anel gira
    this.time.delayedCall(T1 + 350, () => {
      p.crack.setVisible(true).setFrame("rach0");
      [0, 1, 2, 3].forEach((f) => this.time.delayedCall(f * 200, () => { p.crack.setFrame(`rach${f}`).setDisplaySize(p.oc.w, p.oc.h); }));
      if (this.textures.exists("f2_cc0")) {
        const burst = this.add.particles(p.x, p.cy, "f2_cc0", { frame: [CC0.light_01, CC0.light_02, CC0.light_03, CC0.flare_01], lifespan: 900, speed: { min: 60, max: 260 }, scale: { start: 0.35, end: 0 }, alpha: { start: 0.8, end: 0 }, tint: [TURQ, OURO], blendMode: "ADD", emitting: false }).setDepth(61);
        burst.explode(26);
        this.time.delayedCall(1200, () => burst.destroy());
      }
      this.tweens.add({ targets: p.ring, alpha: 0.9, duration: 500 });
      if (p.vortex) this.tweens.add({ targets: p.vortex, alpha: 0.6, duration: 400 });
    });
    // 4) flash suave (respeita "reduzir flashes"), sino de vidro + acorde, tremor leve
    this.time.delayedCall(T1 + 1150, () => {
      if (reduceFlashes()) {
        const f = this.add.rectangle(W / 2, H / 2, W, H, 0xfff6e0, 0).setScrollFactor(0).setDepth(150);
        this.tweens.add({ targets: f, alpha: 0.25, yoyo: true, duration: 400, onComplete: () => f.destroy() });
      } else cam.flash(260, 255, 250, 230);
      this.audio.play("sino_vidro", { volume: 0.9 });
      this.audio.synth?.("bell", { volume: 0.35 }); // acorde mágico por baixo do sino CC0
      // pulso único de shockwave (flash dourado, depois turquesa)
      if (this.anims.exists("a_shockwave_magic")) {
        const sw = this.add.sprite(p.oc.x, p.oc.y, "shockwave_magic").setDisplaySize(p.pw * 2, p.pw * 2).setTint(OURO).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.55).setDepth(5.8).play("a_shockwave_magic");
        this.time.delayedCall(250, () => sw.setTint(TURQ));
        sw.once("animationcomplete", () => sw.destroy());
      }
      // estrelinhas magic_03-05 (ADD, dourado) saindo do bronze
      for (let k = 0; k < 6; k++) {
        const key = `magic0${3 + (k % 3)}`;
        if (!this.textures.exists(key)) continue;
        const st = this.add.image(p.x, p.oc.y, key).setDisplaySize(26, 26).setTint(k % 2 ? OURO : TURQ).setBlendMode(Phaser.BlendModes.ADD).setDepth(6.7);
        const a = (k / 6) * Math.PI * 2;
        this.tweens.add({ targets: st, x: p.x + Math.cos(a) * p.pw * 0.7, y: p.oc.y + Math.sin(a) * p.ph * 0.5, alpha: 0, angle: 90, duration: 900, onComplete: () => st.destroy() });
      }
      cam.shake(320, 0.004);
      p.glass.setVisible(false);
      this.tweens.add({ targets: p.crack, alpha: 0, duration: 600, onComplete: () => p.crack.setVisible(false).setAlpha(1) });
    });
    // 5) placa vira nome dourado; cena viva aparece; "Entrar agora?"
    this.time.delayedCall(T1 + 1900, () => {
      this.refreshPortal(p, true);
      this.portals.forEach((q) => q !== p && this.refreshPortal(q));
      this.mode = "walk";
      this.say(`Portal “${p.meta.nome}” aberto! Entrar agora?  (↑ / Enter)`, 3200);
      this.lastUnlock = p.id;
    });
  }

  /* ---------------- modo lista (Tab / ☰) ---------------- */
  toggleList() {
    if (this.mode === "list") return this.closeList();
    if (this.mode !== "walk") return;
    this.mode = "list"; clearInput(); this.walkTo = null;
    this.audio.play("ui_open");
    this.listI = Math.max(0, this.portals.indexOf(this.near || this.portals[0]));
    const z = 180;
    this.lObjs = [this.add.rectangle(W / 2, H / 2, W, H, 0x02060c, 0.72).setScrollFactor(0).setDepth(z).setInteractive()];
    this.lCards = this.portals.map((p, i) => {
      const c = this.add.container(0, H / 2).setScrollFactor(0).setDepth(z + 1);
      const bg = this.add.rectangle(0, 0, 340, 520, 0x2b1d14, 1).setStrokeStyle(5, 0xc8a060);
      const img = this.add.image(0, -60, p.id === "embreve" ? "portal_fase3_correntes" : CENA[p.id]).setDisplaySize(260, 340);
      const st = this.stateOf(p);
      if (st !== "open") img.setTint(0x4a5a66);
      const nm = this.add.text(0, 150, p.meta.nome, { fontFamily: "Georgia, serif", fontSize: "26px", color: st === "open" ? "#FFE08A" : "#FFF3D6", align: "center", wordWrap: { width: 300 } }).setOrigin(0.5);
      const pr = this.add.text(0, 220, p.price.text, { fontFamily: "Georgia, serif", fontSize: "28px", color: p.price.style.color }).setOrigin(0.5);
      c.add([bg, img, nm, pr]);
      bg.setInteractive({ useHandCursor: true }).on("pointerup", () => { if (this.dragged) return; if (i === this.listI) this.pickList(); else { this.listI = i; this.layoutList(); } });
      return c;
    });
    this.lObjs.push(...this.lCards);
    this.lObjs.push(this.add.text(W / 2, 120, "Portais  ·  ←/→ escolher · Enter entrar · Tab/Esc fechar", { fontFamily: "Georgia, serif", fontSize: "30px", color: "#F6E7C1" }).setOrigin(0.5).setScrollFactor(0).setDepth(z + 2));
    // arrastar para os lados
    this.lObjs[0].on("pointerdown", (pt) => { this.dragX = pt.x; this.dragged = false; });
    this.lDrag = (pt) => { if (this.dragX == null || !pt.isDown) return; const dx = pt.x - this.dragX; if (Math.abs(dx) > 110) { this.listI = Phaser.Math.Clamp(this.listI + (dx < 0 ? 1 : -1), 0, this.portals.length - 1); this.dragX = pt.x; this.dragged = true; this.layoutList(); } };
    this.input.on("pointermove", this.lDrag);
    this.input.once("pointerup", () => { this.dragX = null; });
    this.layoutList(true);
  }
  layoutList(instant) {
    this.lCards.forEach((c, i) => {
      const off = i - this.listI;
      const x = W / 2 + off * 380, s = off === 0 ? 1.08 : 0.86;
      if (instant) c.setPosition(x, H / 2).setScale(s); else this.tweens.add({ targets: c, x, scale: s, duration: 180 });
      c.setAlpha(Math.abs(off) > 3 ? 0 : 1);
    });
    this.audio.play("ui_next");
  }
  listKey(code) {
    if (code === "Tab" || code === "Escape" || code === "Backspace") return this.closeList();
    if (code === "ArrowLeft" || code === "KeyA") { this.listI = Math.max(0, this.listI - 1); this.layoutList(); }
    if (code === "ArrowRight" || code === "KeyD") { this.listI = Math.min(this.portals.length - 1, this.listI + 1); this.layoutList(); }
    if (code === "Enter" || code === "Space") this.pickList();
  }
  pickList() {
    const p = this.portals[this.listI];
    const st0 = this.stateOf(p);
    if (st0 === "open") this.fromMenu = false;
    this.closeList(true);
    // a Marina vai para a frente do portal escolhido
    this.player.sprite.setPosition(p.x, p.y - 4); this.player.sprite.body.setVelocity(0, 0);
    this.near = p;
    this.enterPortal(p);
    // veio do menu e o portal está trancado/sem conchas: mostra o aviso e volta para a lista
    if (this.fromMenu && st0 !== "afford") this.time.delayedCall(1800, () => { if (this.mode === "walk" && this.fromMenu) this.toggleList(); });
  }
  closeList(silent) {
    this.lObjs?.forEach((o) => o.destroy()); this.lObjs = null;
    this.input.off("pointermove", this.lDrag);
    if (!silent) this.audio.play("ui_close");
    this.mode = "walk"; clearInput();
    if (!silent && this.fromMenu) this.back(); // lista aberta pelo menu: fechar volta ao menu
  }

  /* ---------------- apagar progresso (confirmação dupla) ---------------- */
  askReset(step = 1) {
    if (this.mode !== "walk" && this.mode !== "reset") return;
    this.rObjs?.forEach((o) => o.destroy());
    this.mode = "reset"; this.resetStep = step; clearInput();
    const z = 220;
    const txt = step === 1 ? "Apagar todo o progresso?\nCarteira, portais abertos e fases." : "Tem certeza mesmo?\nIsso não pode ser desfeito.";
    this.rObjs = [
      this.add.rectangle(W / 2, H / 2, W, H, 0x02060c, 0.7).setScrollFactor(0).setDepth(z).setInteractive(),
      this.add.rectangle(W / 2, H / 2, 900, 460, 0xf1e2bf).setStrokeStyle(8, 0x6b4a26).setScrollFactor(0).setDepth(z + 1),
      this.add.text(W / 2, H / 2 - 90, txt, { fontFamily: "Georgia, serif", fontSize: "38px", color: "#1A1208", align: "center" }).setOrigin(0.5).setScrollFactor(0).setDepth(z + 2),
    ];
    const mk = (x, label, color, fn) => {
      this.rObjs.push(...makeButton(this, x, H / 2 + 120, label.toUpperCase(), fn, { w: 380, h: 72, depth: z + 2, scrollFactor: 0, fontSize: 26, kind: /CANCELAR/i.test(label) ? "continuar" : "menu" }).objs);
    };
    mk(W / 2 - 200, step === 1 ? "Apagar" : "Sim, apagar", 0x9a3a2a, () => this.resetYes());
    mk(W / 2 + 200, "Cancelar", 0x2f5a7a, () => this.resetNo());
  }
  resetYes() { if (this.resetStep === 1) return this.askReset(2); resetAll(); this.rObjs.forEach((o) => o.destroy()); this.mode = "walk"; this.scene.restart(); }
  resetNo() { this.rObjs?.forEach((o) => o.destroy()); this.rObjs = null; this.mode = "walk"; clearInput(); }
  resetKey(code) { if (code === "Escape") this.resetNo(); }

  /* ---------------- loop ---------------- */
  update(_t, dms) {
    const dt = Math.min(dms / 1000, 0.05);
    this.rays.forEach((r, i) => (r.rotation = Math.sin(this.time.now / 6000 + i) * 0.08));
    this.lens.rotation += dt * 0.05;
    const vx = this.cameras.main.scrollX;
    for (const p of this.portals) {
      // só anima portais na tela (+ margem)
      if (p.x < vx - 300 || p.x > vx + W + 300) continue;
      if (p.ring && p.ring.alpha > 0) p.ring.rotation += dt * 0.8;
      if (p.vortex && p.vortex.alpha > 0) { p.vortex.rotation += dt * 0.6; const f = 21 + (Math.floor(this.time.now / 140) % 5); p.vortex.setTexture(`cosmic${f}`).setDisplaySize(p.oc.w * 0.95, p.oc.w * 0.95); }
      if (p.state === "afford") p.aura.setAlpha(0.12 + 0.1 * Math.sin(this.time.now / 260));
      if (p.fg && p.wag) p.fg.setAngle(Math.sin(this.time.now / 140) * 9);
      else if (p.state === "open" && p.fg) p.fg.x = p.fgX + Math.sin(this.time.now / 900 + p.x) * 4;
      if (p.lightning && p.state === "open") {
        // relâmpago: clarões curtos de vez em quando (só sem "reduzir flashes")
        const ph = (this.time.now + p.x * 13) % 5200;
        const k = ph < 90 ? 1 : ph > 180 && ph < 240 ? 0.6 : 0;
        p.scene.setTint(k ? Phaser.Display.Color.GetColor(255, 255, 255) : 0xb8bcc8);
        p.flashK = k;
      }
      if (p.state === "open" && p.scene) p.scene.y = p.oc.y + Math.sin(this.time.now / 1400 + p.x) * 2;
    }
    // hold de 0,6 s no "Abrir"
    if (this.mode === "confirm" && this.holdStart != null) {
      const k = Math.min(1, (performance.now() - this.holdStart) / 600);
      const b = this.cOpen.b;
      this.cRing.clear().lineStyle(12, 0x7fe3d9, 1).beginPath().arc(b.x, b.y, b.radius + 24, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2).strokePath();
      if (k >= 1) { this.holdStart = null; this.doBuy(); }
    }
    // zumbido do portal quando a Marina está perto de um portal aberto/disponível
    if ((this.humT -= dt) <= 0) { this.humT = 4.5; if (this.near && (this.near.state === "open" || this.near.state === "afford")) this.audio.play("portal_hum", { volume: 0.35 }); }
    // ondas lá embaixo (CC0)
    this.waveT -= dt;
    if (this.waveT <= 0) { this.waveT = 6 + Math.random() * 5; this.audio.play("praia", { volume: 0.25 }); }

    let actions = computeActions();
    if (this.mode !== "walk") actions = { ...actions, left: false, right: false, jump: false, jumpPressed: false, interactPressed: false };
    // ↑ perto de um portal entra em vez de pular
    if (this.near && this.upKey) actions = { ...actions, jumpPressed: false, jump: false };
    if (!this.near) this.upKey = false;
    if (this.walkTo && this.mode === "walk") actions = { ...actions, ...this.autoWalk() };
    if (actions.interactPressed && this.near && this.mode === "walk") this.enterPortal(this.near);
    this.player.update(dt, actions);
    this.nearest();
  }

  /** caminho automático até o portal tocado (sobe pelo caixote até o mezanino, ou desce pela ponta) */
  autoWalk() {
    const t = this.walkTo, sp = this.player.sprite, body = sp.body;
    const grounded = body.blocked.down || body.touching.down;
    const onMez = sp.y <= MEZ + 6 && grounded, onFloor = sp.y >= FLOOR - 6;
    const toward = (x, jump = false) => ({ left: x < sp.x - 15, right: x > sp.x + 15, jump, jumpPressed: jump && grounded });
    const goalMez = t.y < FLOOR;
    if ((goalMez && onMez) || (!goalMez && onFloor)) {
      if (Math.abs(t.x - sp.x) < 30) { this.walkTo = null; this.nearest(); if (this.near === t) this.enterPortal(t); return { left: false, right: false }; }
      return toward(t.x);
    }
    if (goalMez) {
      // sobe a escada mais próxima: próximo degrau acima dos pés, pula quando estiver embaixo
      const side = sp.x < WORLD / 2 ? -1 : 1;
      const above = this.steps.filter((st) => st.side === side && st.y < sp.y - 10).sort((a, b) => b.y - a.y)[0];
      if (!above) return toward(side < 0 ? 760 : 3070, true);
      const dx = above.x - sp.x;
      return { ...toward(above.x, Math.abs(dx) < 70), jump: true };
    }
    // descer: sai pela ponta da passarela e desce os degraus até o deck
    return toward(sp.x < WORLD / 2 ? 60 : 3790);
  }

  nearest() {
    const s = this.player.sprite;
    let best = null, bd = 150;
    for (const p of this.portals) {
      if (Math.abs(p.y - s.y) > 60) continue;
      const d = Math.abs(p.x - s.x);
      if (d < bd) { bd = d; best = p; }
    }
    if (best !== this.near) {
      this.near = best;
      this.portals.forEach((p) => p.plate.setScale(p === best ? p.plate.scaleX * 1 : p.plate.scaleX));
      this.enterBtn.forEach((o) => o.setVisible(Boolean(best) && this.mode === "walk"));
      if (best) {
        const st = this.stateOf(best);
        this.enterBtn[1].setText(st === "open" ? (best.meta.tipo === "Fase" ? "JOGAR" : "ENTRAR") : st === "afford" ? `ABRIR · ${best.meta.preco}` : "FECHADO");
      }
    }
    if (this.mode !== "walk") this.enterBtn.forEach((o) => o.setVisible(false));
    else if (this.near) this.enterBtn.forEach((o) => o.setVisible(true));
  }
}
