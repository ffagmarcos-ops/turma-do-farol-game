// @ts-nocheck
/**
 * FASE 3 — O Mistério da Ilha do Farol: Chegada à Ilha (praia → floresta → ... → caverna).
 * Marco 1: motor (chunks, parallax, Sofia, Faísca, conchas, latido, checkpoints, câmera) + SETOR A jogável.
 * Resolução lógica 1920×1080 (a mesma do jogo todo). Vida infinita: cair/levar dano nunca dá game over.
 * Dev: ?fase3 (último checkpoint) · ?fase3=A2 (checkpoint A2) · ?fase3=novo (do começo). H = hitboxes, 1-4 = checkpoints.
 */
import Phaser from "../phaser.js";
import { keyDown, keyUp, clearInput } from "../input.js";
import { AudioManager } from "../systems/AudioManager.js";
import { makeButton, BTN_FONT } from "../systems/UIButton.js";
import { askMainMenu } from "../systems/PauseMenu.js";
import { openSoundOptions } from "../systems/SoundOptions.js";
import { readWallet, collect as walletCollect, markSeen } from "../systems/Wallet.js";
import { F3_AUDIO } from "../fase3/Fase3Assets.js";
import { preloadFase3, buildFase3Art } from "../fase3/Fase3Loader.js";
import { assembleLevel } from "../fase3/sectors/index.js";
import { ChunkManager } from "../fase3/ChunkManager.js";
import { Backdrop, Fase3Camera } from "../fase3/Backdrop.js";
import { Sofia } from "../fase3/Sofia.js";
import { Faisca } from "../fase3/Faisca.js";
import { Fase3Input, hintText } from "../fase3/Fase3Input.js";
import { Fase3Audio } from "../fase3/Fase3Audio.js";

const W = 1920, H = 1080;
export const F3_SAVE = "farol-fase3";
const CHARGE_TIME = 1.5, SPECIAL_COOLDOWN = 3.5, WAVE_RANGE = 780, KILL_Y = 1300;

export function readF3() { try { return JSON.parse(localStorage.getItem(F3_SAVE) || "{}") || {}; } catch { return {}; } }
function saveF3(patch) { const s = { ...readF3(), ...patch }; try { localStorage.setItem(F3_SAVE, JSON.stringify(s)); } catch {} return s; }

export class Fase3Scene extends Phaser.Scene {
  constructor() { super("fase3"); }

  init(data) {
    this.startData = data || {};
    this.paused = false; this.ended = false; this.respawning = false;
  }

  preload() {
    const n = preloadFase3(this, ["A", "B", "C", "D", "E", "F", "G", "H", "I"]);
    if (n > 0) {
      const t = this.add.text(W / 2, H / 2, "Carregando a ilha… 0%", { fontFamily: BTN_FONT, fontSize: "48px", color: "#fff3d6", stroke: "#4a2a14", strokeThickness: 10 }).setOrigin(0.5);
      this.load.on("progress", (v) => t.setText(`Carregando a ilha… ${Math.round(v * 100)}%`));
      this.load.once("complete", () => t.destroy());
    }
  }

  create() {
    clearInput();
    document.body.classList.remove("is-title");
    document.body.classList.add("fase3");
    this.audio = this.registry.get("audio") || new AudioManager();
    this.registry.set("audio", this.audio);
    this.audio.unlock();
    for (const bed of this.audio.beds || []) { try { bed.gain.gain.value = 0; } catch {} } // silencia ambientes da Fase 1
    this.audio.useSceneMusic(this, F3_AUDIO.music);
    this.sfx = new Fase3Audio(this.audio);
    this.input3 = new Fase3Input();

    this.art = buildFase3Art(this, ["A", "B", "C", "D", "E", "F", "G", "H", "I"]);
    this.level = assembleLevel();
    const wallet = readWallet();
    this.collected = new Set(wallet.run.ids.filter((id) => id.startsWith("f3")));
    this.defeated = new Set(); this.cpReached = new Set(); this.foundSecrets = new Set(); this.shownHints = new Set();
    this.toninhoTriggered = new Set(); this.marinaTriggered = new Set(); this.lucasTriggered = new Set();
    this.allCheckpoints = this.level.chunks.flatMap((c) => c.checkpoints || []);
    this.allHints = this.level.chunks.flatMap((c) => c.hints || []);
    this.allSecrets = this.level.chunks.flatMap((c) => c.secrets || []);
    this.allTriggers = this.level.chunks.flatMap((c) => c.triggers || []);
    this.allVistas = this.level.chunks.flatMap((c) => c.vistas || []);

    // início: ?fase3=A2 / checkpoint salvo / começo
    const save = readF3();
    let cpId = this.startData.cp;
    if (cpId === "novo" || cpId === "0") { cpId = null; saveF3({ cp: null }); }
    else if (!cpId || !this.allCheckpoints.some((c) => c.id === cpId)) cpId = save.cp;
    const cp = this.allCheckpoints.find((c) => c.id === cpId) || this.allCheckpoints[0];
    this.cpActive = cp.id;
    for (const c of this.allCheckpoints) { this.cpReached.add(c.id); if (c.id === cp.id) break; }
    const fresh = cp === this.allCheckpoints[0];

    this.physics.world.setBounds(0, -600, this.level.length, 2400);
    this.physics.world.checkCollision.down = false; this.physics.world.checkCollision.up = false;
    this.crabGroup = this.physics.add.group();
    this.monkeyGroup = this.physics.add.group();
    this.monkeyRocks = this.physics.add.group();
    this.backdrop = new Backdrop(this, ["A", "B", "C", "D", "E", "F", "G", "H", "I"], this.art, this.level.sectors);
    this.chunks = new ChunkManager(this, this.level);

    const gy = this.levelGroundY(cp.x);
    this.sofia = new Sofia(this, cp.x + 40, gy - 2);
    this.faisca = new Faisca(this, Math.max(40, fresh ? cp.x - 420 : cp.x - 80), gy - 2, this.art);
    this.curSectorId = this.sectorAt(this.sofia.x).id;
    this.camera3 = new Fase3Camera(this, { x: 0, y: -140, w: this.level.length, h: H + 180 });
    this.camera3.snap(this.sofia.x + 110, this.sofia.y - 330);
    this.updateChunks();

    // colisões (o Faísca NÃO colide com a Sofia nem com inimigos)
    const oneWay = (a, plat) => !plat.getData("disabled") && a.body.velocity.y >= 0 && a.body.prev.y + a.body.height <= plat.body.top + 18;
    for (const sp of [this.sofia.sprite, this.faisca.sprite, this.crabGroup, this.monkeyGroup]) {
      this.physics.add.collider(sp, this.chunks.solids);
      this.physics.add.collider(sp, this.chunks.oneway, null, oneWay);
    }
    this.physics.add.overlap(this.sofia.sprite, this.chunks.shells, (_, shell) => this.collectShell(shell));
    this.physics.add.overlap(this.sofia.sprite, this.crabGroup, (_, cs) => this.touchCrab(cs.getData("crab")));
    this.physics.add.overlap(this.sofia.sprite, this.monkeyGroup, (_, ms) => this.touchMonkey(ms.getData("monkey")));
    this.physics.add.overlap(this.sofia.sprite, this.monkeyRocks, (_, rock) => this.hitByMonkeyRock(rock));
    this.projectiles = this.physics.add.group();
    this.physics.add.collider(this.projectiles, this.chunks.solids, (p) => this.shellBounce(p));
    this.physics.add.collider(this.projectiles, this.chunks.oneway, (p) => this.shellBounce(p), oneWay);
    this.physics.add.overlap(this.projectiles, this.crabGroup, (p, cs) => this.shellHit(p, cs.getData("crab")));
    this.physics.add.overlap(this.projectiles, this.monkeyGroup, (p, ms) => this.shellHitMonkey(p, ms.getData("monkey")));

    this.charge = 0; this.charging = false; this.specialCool = 0; this.throwCool = 0; this.stepT = 0; this.ambT = 2; this.windT = 8;
    this.chargeGfx = this.add.graphics().setDepth(9.5);
    this.makeHud();
    this.bindKeys();
    this.touchLabel(true);
    this.events.once("shutdown", () => this.cleanup());

    this.cameras.main.fadeIn(fresh ? 1200 : 400, 6, 16, 24);
    this.toastTitle(fresh);
    if (fresh) {
      // chegada calma: Sofia observa a ilha enquanto o Faísca chega correndo
      this.sofia.locked = true; this.sofia.looking = true; this.introT = 2.4;
    }
    window.__f3 = this;
  }

  levelGroundY(x) {
    for (const c of this.level.chunks) {
      if (x >= c.x0 && x < c.x1) {
        const g = (c.ground || []).find((seg) => x >= seg.x && x < seg.x + seg.w);
        if (g && g.y != null) return g.y;
      }
    }
    const s = this.level.sectors.find((q) => x >= q.x0 && x < q.x1) || this.level.sectors[0];
    return s.groundY;
  }
  sectorAt(x) { return this.level.sectors.find((q) => x >= q.x0 && x < q.x1) || this.level.sectors[this.level.sectors.length - 1]; }
  updateChunks() {
    const cam = this.cameras.main;
    this.chunks.update(cam.scrollX, cam.scrollX + W);
  }

  /* ------------------------------ teclado / pausa ------------------------------ */
  bindKeys() {
    const captured = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "ShiftLeft", "ShiftRight", "KeyA", "KeyD", "KeyW", "KeyS", "KeyJ", "KeyK", "KeyX", "KeyC"];
    this.input.keyboard.addCapture(captured);
    this.onKD = (e) => {
      keyDown(e.code);
      if (captured.includes(e.code)) e.preventDefault();
      this.audio.unlock();
      if (e.repeat) return;
      if ((e.code === "Escape" || e.code === "KeyP") && !this.__askMenu && !this.__som && !this.ended) this.setPaused(!this.paused);
      if (e.code === "KeyM") this.audio.toggleMute();
      if (e.code === "KeyH") this.toggleDebug();
      const d = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8"].indexOf(e.code);
      if (d >= 0 && this.allCheckpoints[d] && !this.paused) { this.cpActive = this.allCheckpoints[d].id; this.respawn(); }
    };
    this.onKU = (e) => keyUp(e.code);
    window.addEventListener("keydown", this.onKD);
    window.addEventListener("keyup", this.onKU);
  }
  toggleDebug() {
    const world = this.physics.world;
    if (!world.debugGraphic) world.createDebugGraphic();
    world.drawDebug = !world.drawDebug;
    world.debugGraphic.setDepth(300).setVisible(world.drawDebug);
    if (!world.drawDebug) world.debugGraphic.clear();
  }
  touchLabel(on) {
    const b = document.querySelector(".act.talk");
    if (!b) return;
    if (on) { this.touchOld = b.innerHTML; b.innerHTML = "<b>🐚</b>CONCHA"; }
    else if (this.touchOld != null) b.innerHTML = this.touchOld;
  }
  cleanup() {
    window.removeEventListener("keydown", this.onKD);
    window.removeEventListener("keyup", this.onKU);
    this.stopCharge?.();
    this.touchLabel(false);
    document.body.classList.remove("fase3");
    this.anims.resumeAll();
    clearInput();
    if (window.__f3 === this) window.__f3 = null;
  }
  setPaused(on) {
    this.paused = on;
    if (on) { this.physics.world.pause(); this.tweens.pauseAll(); this.anims.pauseAll(); clearInput(); this.cancelCharge(); }
    else { this.physics.world.resume(); this.tweens.resumeAll(); this.anims.resumeAll(); }
    if (!this.pauseObjs) {
      const d = 240;
      this.pauseObjs = [
        this.add.rectangle(W / 2, H / 2, W + 400, H + 400, 0x061018, 0.55).setScrollFactor(0).setDepth(d),
        this.add.text(W / 2, 380, "PAUSA", { fontFamily: BTN_FONT, fontSize: "96px", color: "#fff3d6", stroke: "#4a2a14", strokeThickness: 14 }).setOrigin(0.5).setScrollFactor(0).setDepth(d + 1),
        ...makeButton(this, W / 2, 560, "CONTINUAR", () => this.setPaused(false), { w: 620, h: 88, depth: d + 2, scrollFactor: 0, kind: "continuar" }).objs,
        ...makeButton(this, W / 2, 690, "MENU PRINCIPAL", () => askMainMenu(this, { onYes: () => this.toMenu() }), { w: 620, h: 88, depth: d + 2, scrollFactor: 0, kind: "menu" }).objs,
        ...makeButton(this, W / 2, 820, "SOM", () => openSoundOptions(this, { depth: 320 }), { w: 620, h: 88, depth: d + 2, scrollFactor: 0, kind: "menu" }).objs,
        this.add.text(W / 2, 920, "Esc ou P: continuar", { fontFamily: "Georgia, serif", fontSize: "26px", color: "#F6E7C1" }).setOrigin(0.5).setScrollFactor(0).setDepth(d + 1),
      ];
    }
    this.pauseObjs.forEach((o) => o.setVisible(on));
  }
  toMenu() {
    if (this.paused) this.setPaused(false);
    document.body.classList.add("is-title");
    this.scene.start("menu");
  }

  /* ------------------------------ HUD ------------------------------ */
  makeHud() {
    const d = 100;
    const icon = this.textures.exists("icone_concha_hud") ? this.add.image(78, 70, "icone_concha_hud").setDisplaySize(72, 72) : this.add.image(78, 70, this.art.img("f3_concha").key).setScale(0.3);
    icon.setScrollFactor(0).setDepth(d);
    this.hudShells = this.add.text(126, 70, `× ${readWallet().carteira}`, { fontFamily: BTN_FONT, fontSize: "46px", color: "#fff3d6", stroke: "#4a2a14", strokeThickness: 9 }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d);
    this.hudIcon = icon;
    // medidor do latido (especial)
    const wave = this.add.image(78, 150, "f3_onda_latido").setDisplaySize(30, 60).setScrollFactor(0).setDepth(d);
    this.add.rectangle(220, 150, 236, 26, 0x2a1a10, 0.85).setScrollFactor(0).setDepth(d);
    this.hudBar = this.add.rectangle(104, 150, 228, 18, 0x7fe3f2).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d + 0.1);
    this.hudWave = wave;
    this.hintBox = this.add.container(W / 2, 980).setScrollFactor(0).setDepth(d + 5).setAlpha(0);
    this.hintBg = this.add.rectangle(0, 0, 900, 78, 0x0b2a3a, 0.78).setStrokeStyle(3, 0xf3d48a, 0.8);
    this.hintTxt = this.add.text(0, 0, "", { fontFamily: "Georgia, serif", fontSize: "32px", color: "#fff3d6", align: "center" }).setOrigin(0.5);
    this.hintBox.add([this.hintBg, this.hintTxt]);
  }
  updateHud() {
    let fill = 1, color = 0x7fe3f2;
    if (this.charging) { fill = this.charge; color = this.charge >= 1 ? 0xfff3a0 : 0x7fe3f2; }
    else if (this.specialCool > 0) { fill = 1 - this.specialCool / SPECIAL_COOLDOWN; color = 0x6d7f88; }
    this.hudBar.width = Math.max(1, 228 * fill);
    this.hudBar.fillColor = color;
    this.hudWave.setAlpha(this.specialCool > 0 ? 0.4 : 1);
  }
  showHint(text) {
    const t = hintText(text, this.input3.device);
    this.hintTxt.setText(t);
    this.hintBg.setSize(Math.max(500, this.hintTxt.width + 80), 78);
    this.tweens.killTweensOf(this.hintBox);
    this.hintBox.setAlpha(0);
    this.tweens.add({ targets: this.hintBox, alpha: 1, duration: 300 });
    this.tweens.add({ targets: this.hintBox, alpha: 0, delay: 4800, duration: 600 });
  }
  toast(text, y = 240, color = "#fff3d6") {
    const t = this.add.text(W / 2, y, text, { fontFamily: BTN_FONT, fontSize: "44px", color, stroke: "#4a2a14", strokeThickness: 9 }).setOrigin(0.5).setScrollFactor(0).setDepth(150).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, y: y - 20, duration: 300, yoyo: true, hold: 1500, onComplete: () => t.destroy() });
  }
  toastTitle(fresh) {
    const s = this.sectorAt(this.sofia.x);
    const a = this.add.text(W / 2, 180, "FASE 3 · CHEGADA À ILHA", { fontFamily: BTN_FONT, fontSize: "72px", color: "#fff3d6", stroke: "#4a2a14", strokeThickness: 12 }).setOrigin(0.5).setScrollFactor(0).setDepth(150).setAlpha(0);
    const b = this.add.text(W / 2, 262, s.name, { fontFamily: "Georgia, serif", fontSize: "38px", color: "#F3D48A", stroke: "#1A1208", strokeThickness: 6 }).setOrigin(0.5).setScrollFactor(0).setDepth(150).setAlpha(0);
    this.tweens.add({ targets: [a, b], alpha: 1, delay: fresh ? 600 : 100, duration: 700, hold: 2200, yoyo: true, onComplete: () => { a.destroy(); b.destroy(); } });
  }

  /* ------------------------------ efeitos ------------------------------ */
  puff(x, y, scale = 1, tint = 0xfaecc8) {
    const e = this.add.particles(x, y, "f3_poeira", { speed: { min: 60, max: 220 }, lifespan: 450, scale: { start: 0.5 * scale, end: 0 }, alpha: { start: 0.9, end: 0 }, tint, emitting: false }).setDepth(12);
    e.explode(10);
    this.time.delayedCall(600, () => e.destroy());
  }
  stars(x, y) {
    const e = this.add.particles(x, y, "f3_brilho", { speed: { min: 120, max: 320 }, lifespan: 600, scale: { start: 0.9, end: 0 }, alpha: { start: 1, end: 0 }, tint: [0xfff3a0, 0xffffff, 0x9ff0ff], blendMode: "ADD", emitting: false }).setDepth(31);
    e.explode(14);
    this.time.delayedCall(800, () => e.destroy());
  }
  icon(x, y) {
    const im = this.add.image(x, y, "f3_alerta").setDepth(32).setScale(0.8);
    this.tweens.add({ targets: im, y: y - 30, alpha: 0, delay: 350, duration: 450, onComplete: () => im.destroy() });
  }
  crabAlert(crab) { this.icon(crab.x, crab.y - 100); }
  makeWater(w) {
    const objs = [], bottom = 1240;
    const back = this.add.rectangle(w.x + w.w / 2, (w.y + bottom) / 2, w.w, bottom - w.y, 0x165a85, 0.94).setDepth(-0.6);
    const deep = this.add.rectangle(w.x + w.w / 2, w.y + 70, w.w, 130, 0x2282b4, 0.48).setDepth(-0.5);
    const body = this.add.rectangle(w.x + w.w / 2, (w.y + bottom) / 2, w.w, bottom - w.y, 0x2ea3d6, 0.72).setDepth(12);
    const refl = this.add.tileSprite(w.x, w.y + 8, w.w, 64, "f3_crista_onda").setOrigin(0).setDepth(12.05).setTileScale(0.85, 0.42).setAlpha(0.35).setTint(0xbff7ff);
    const crest = this.add.tileSprite(w.x, w.y - 30, w.w, 96, "f3_crista_onda").setOrigin(0).setDepth(12.1).setTileScale(0.55, 0.6);
    const particles = this.add.particles(0, 0, "f3_espuma", {
      x: { min: w.x + 24, max: w.x + w.w - 24 },
      y: { min: w.y + 6, max: w.y + 90 },
      speedX: { min: 25, max: 75 },
      speedY: { min: -28, max: -8 },
      lifespan: { min: 900, max: 1600 },
      scale: { start: 0.32, end: 0.06 },
      alpha: { start: 0.65, end: 0 },
      frequency: 140,
      blendMode: "ADD",
    }).setDepth(12.15);
    objs.push(back, deep, body, refl, crest, particles);
    return { def: w, objs, crest, refl, particles };
  }
  splash(x, y) {
    const e = this.add.particles(x, y, "f3_espuma", { speedY: { min: -520, max: -220 }, speedX: { min: -160, max: 160 }, gravityY: 1400, lifespan: 700, scale: { start: 0.6, end: 0.1 }, alpha: { start: 1, end: 0 }, emitting: false }).setDepth(13);
    e.explode(22);
    this.time.delayedCall(900, () => e.destroy());
    this.audio.play("splash", { volume: 0.6 });
  }
  /** Onda batendo na parede de pedra do costão: jato de espuma e gotas brilhantes */
  rockWaveSpray(x, y, nearPlayer = false) {
    const e = this.add.particles(x, y, "f3_espuma", {
      speedY: { min: -460, max: -180 }, speedX: { min: -130, max: 130 }, gravityY: 1200,
      lifespan: { min: 450, max: 780 }, scale: { start: 0.55, end: 0.08 }, alpha: { start: 0.92, end: 0 }, emitting: false,
    }).setDepth(13);
    e.explode(16);
    const sp = this.add.particles(x, y - 20, "f3_brilho", {
      speedY: { min: -340, max: -120 }, speedX: { min: -100, max: 100 }, gravityY: 900,
      lifespan: 500, scale: { start: 0.45, end: 0 }, alpha: { start: 0.85, end: 0 }, blendMode: "ADD", emitting: false,
    }).setDepth(13.2);
    sp.explode(7);
    this.time.delayedCall(850, () => { e.destroy(); sp.destroy(); });
    if (nearPlayer) this.audio.play("praia", { volume: 0.28, rate: 1.08 });
  }

  /* ------------------------------ conchas e combate ------------------------------ */
  collectShell(shell) {
    const id = shell.getData("id"), value = shell.getData("value") || 1;
    if (this.collected.has(id)) return;
    this.collected.add(id);
    const w = walletCollect(id, value);
    this.hudShells.setText(`× ${w.carteira}`);
    this.tweens.add({ targets: this.hudIcon, scale: this.hudIcon.scale * 1.25, yoyo: true, duration: 120 });
    this.stars(shell.x, shell.y);
    this.audio.play("shell");
    if (shell.getData("gold")) { this.audio.synth?.("gold3"); this.toast("Concha dourada!", 300, "#FFE08A"); }
    this.tweens.killTweensOf(shell);
    shell.destroy();
  }
  throwShell() {
    const s = this.sofia, im = this.art.img("f3_concha_projetil");
    const x0 = s.x + s.facing * 50, y0 = s.y - (s.crouching ? 50 : 80);
    const p = this.projectiles.create(x0, y0, im.key).setScale(im.scale).setDepth(11);
    p.body.setCircle(p.width * 0.45, p.width * 0.05, p.height * 0.05);
    // se houver um macaco num galho alto à frente na direção em que a Sofia olha, calcula o arco para acertá-lo
    const highMonkey = this.chunks.monkeys.find((m) => m.alive && (m.x - s.x) * s.facing > 30 && (m.x - s.x) * s.facing < 740 && m.y < s.y - 60);
    let vx = s.facing * 900 + s.body.velocity.x * 0.3, vy = -160;
    if (highMonkey) {
      const tx = highMonkey.x, ty = highMonkey.y - 65;
      const tHit = Phaser.Math.Clamp(Math.abs(tx - x0) / 780, 0.22, 0.75);
      vx = (tx - x0) / tHit;
      vy = (ty - y0 - 0.5 * 1400 * tHit * tHit) / tHit;
    }
    p.body.setVelocity(vx, vy).setGravityY(-400).setBounce(0.4, 0.4).setAngularVelocity(s.facing * 900);
    p.setData({ life: 1.35, bounces: 0 });
    s.throwT = 0.22;
    this.sfx.throw();
  }
  shellBounce(p) {
    const n = p.getData("bounces") + 1; p.setData("bounces", n);
    if (n >= 2) this.killShell(p);
  }
  killShell(p) {
    if (!p.active) return;
    this.puff(p.x, p.y, 0.4, 0xffffff);
    p.destroy();
  }
  shellHit(p, crab) {
    if (!p.active || !crab?.alive) return;
    crab.hurt(p.x);
    this.sfx.hit();
    this.stars(p.x, p.y);
    p.destroy();
  }
  shellHitMonkey(p, monkey) {
    if (!p.active || !monkey?.alive) return;
    monkey.hurt(p.x);
    this.sfx.hit();
    this.stars(p.x, p.y);
    p.destroy();
  }
  touchCrab(crab) {
    if (!crab?.dangerous() || this.respawning) return;
    if (this.sofia.hurt(crab.x)) {
      this.audio.synth?.("hurt");
      this.camera3.shake(0.002, 120);
      crab.dir = Math.sign(crab.x - this.sofia.x) || 1; crab.state = "recover"; crab.t = 0.8;
    }
  }
  touchMonkey(monkey) {
    if (!monkey?.dangerous() || this.respawning) return;
    if (this.sofia.hurt(monkey.x)) {
      this.audio.synth?.("hurt");
      this.camera3.shake(0.002, 120);
    }
  }
  onCrabDefeated(crab) {
    this.defeated.add(crab.id);
    this.stars(crab.x, crab.y - 40);
    this.sfx.poof();
  }
  onMonkeyDefeated(monkey) {
    this.defeated.add(monkey.id);
    this.stars(monkey.x, monkey.y - 50);
    this.sfx.poof();
  }
  /** Sombra no chão indicando onde a pedra do macaco vai cair */
  createRockShadow(x, groundY) {
    const sh = this.add.ellipse(x, groundY - 4, 86, 24, 0x1a0e06, 0.42).setStrokeStyle(3, 0xffd27a, 0.65).setDepth(3.5);
    this.tweens.add({ targets: sh, scaleX: { from: 0.55, to: 1.05 }, scaleY: { from: 0.55, to: 1.05 }, duration: 260, yoyo: true, repeat: 2 });
    return sh;
  }
  /** Lança a pedra em arco parabólico exato até (targetX, groundY) */
  spawnMonkeyRock(x0, y0, targetX, groundY, shadow) {
    const im = this.art.img("f3_pedra_macaco");
    const rock = this.monkeyRocks.create(x0, y0, im.key).setScale(im.scale).setDepth(11.5);
    rock.body.setCircle(rock.width * 0.4, rock.width * 0.1, rock.height * 0.1);
    // gravidade líquida vertical = 1800 - 400 = 1400 px/s²
    const g = 1400, T = 0.88;
    const vx = (targetX - x0) / T;
    const vy = (groundY - y0 - 0.5 * g * T * T) / T;
    rock.body.setGravityY(-400).setVelocity(vx, vy).setAngularVelocity(vx >= 0 ? 560 : -560);
    rock.setData({ groundY, y0, shadow, life: 1.8 });
    this.sfx.monkeyThrow?.();
  }
  hitByMonkeyRock(rock) {
    if (!rock.active || this.respawning) return;
    const sh = rock.getData("shadow");
    if (sh) sh.destroy();
    this.puff(rock.x, rock.y, 0.55, 0xc8b090);
    if (this.sofia.hurt(rock.x)) {
      this.audio.synth?.("hurt");
      this.camera3.shake(0.0025, 130);
    }
    rock.destroy();
  }
  cancelCharge() { this.charging = false; this.charge = 0; this.sofia && (this.sofia.pointing = false); this.stopCharge?.(); this.stopCharge = null; this.chargeGfx?.clear(); }
  updateSpecial(dt, a) {
    this.specialCool = Math.max(0, this.specialCool - dt);
    const s = this.sofia;
    const can = this.specialCool <= 0 && s.grounded && s.hurtT <= 0 && !s.locked;
    if (a.special && (this.charging || can)) {
      if (!this.charging) { this.charging = true; this.charge = 0; this.stopCharge = this.sfx.charge(CHARGE_TIME); }
      const was = this.charge;
      this.charge = Math.min(1, this.charge + dt / CHARGE_TIME);
      if (was < 1 && this.charge >= 1) { this.stopCharge?.(); this.sfx.ready(); }
      s.pointing = true;
      if (!s.grounded || s.hurtT > 0) this.cancelCharge();
    } else if (this.charging) {
      if (this.charge >= 1) this.fireBark(); else this.cancelCharge();
    }
    // efeito crescente em volta do Faísca
    this.chargeGfx.clear();
    if (this.charging) {
      const f = this.faisca, r = 30 + this.charge * 80, pulse = this.charge >= 1 ? 0.5 + Math.sin(this.time.now / 60) * 0.3 : 0.5;
      this.chargeGfx.lineStyle(6, 0x9ff0ff, pulse).strokeCircle(f.x, f.y - 40, r);
      this.chargeGfx.lineStyle(3, 0xffffff, pulse).strokeCircle(f.x, f.y - 40, r * 0.7);
    }
  }
  fireBark() {
    const s = this.sofia, f = this.faisca, dir = s.facing;
    this.cancelCharge();
    this.specialCool = SPECIAL_COOLDOWN;
    const ox = Math.abs(f.x - s.x) < 260 ? f.x : s.x + dir * 80, oy = (Math.abs(f.x - s.x) < 260 ? f.y : s.y) - 50;
    this.sfx.bark(true);
    this.camera3.shake(0.004, 180);
    for (let i = 0; i < 3; i++) {
      const wv = this.add.image(ox + dir * 30, oy, "f3_onda_latido").setDepth(29).setFlipX(dir < 0).setScale(0.5).setAlpha(0.95).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: wv, x: ox + dir * WAVE_RANGE, scale: 2.3, alpha: 0, delay: i * 90, duration: 620, ease: "Quad.easeOut", onComplete: () => wv.destroy() });
    }
    for (const crab of this.chunks.crabs) {
      if (!crab.alive) continue;
      const dx = (crab.x - ox) * dir;
      if (dx > -80 && dx < WAVE_RANGE && Math.abs(crab.y - oy) < 320) this.time.delayedCall(Math.max(0, dx) / 2.2, () => crab.defeat(ox));
    }
    for (const monkey of this.chunks.monkeys) {
      if (!monkey.alive) continue;
      const dx = (monkey.x - ox) * dir;
      if (dx > -80 && dx < WAVE_RANGE && Math.abs(monkey.y - oy) < 420) this.time.delayedCall(Math.max(0, dx) / 2.2, () => monkey.defeat(ox));
    }
  }

  /* ------------------------------ checkpoints / respawn ------------------------------ */
  respawn(point) {
    if (this.respawning) return;
    this.respawning = true;
    this.cancelCharge();
    const cam = this.cameras.main;
    cam.fadeOut(220, 6, 16, 24);
    cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      const cp = this.allCheckpoints.find((c) => c.id === this.cpActive) || this.allCheckpoints[0];
      const x = point?.x ?? cp.x + 40, y = point?.y ?? this.levelGroundY(cp.x) - 2;
      this.camera3.snap(x + 110, y - 330);
      this.updateChunks();
      this.sofia.respawn(x, y);
      this.faisca.sprite.setPosition(x - 110, y); this.faisca.sprite.body.reset(x - 110, y);
      cam.fadeIn(260, 6, 16, 24);
      this.respawning = false;
    });
  }
  checkpointsUpdate() {
    for (const e of this.chunks.checkpoints) {
      const id = e.def.id;
      if (this.cpReached.has(id) && this.cpActive !== id) continue;
      if (!this.cpReached.has(id) && this.sofia.x > e.def.x - 30 && Math.abs(this.sofia.y - e.sprite.y) < 300) {
        this.cpReached.add(id); this.cpActive = id;
        e.sprite.play("f3_checkpoint-on");
        saveF3({ cp: id });
        this.stars(e.sprite.x + 20, e.sprite.y - 170);
        this.audio.play("bell", { volume: 0.4 });
        this.toast("Marca de exploração!", 240, "#BFF7FF");
      }
    }
  }

  onToninhoTriggered(id) {
    this.toninhoTriggered.add(id);
  }
  onMarinaTriggered(id) {
    this.marinaTriggered.add(id);
  }
  onLucasTriggered(id) {
    this.lucasTriggered.add(id);
  }

  /* ------------------------------ fim do trecho atual (Setor I) ------------------------------ */
  endSector() {
    if (this.ended) return;
    this.ended = true; this.cancelCharge(); clearInput();
    this.sofia.cheering = true; this.sofia.locked = true;
    saveF3({ setorA: true, setorB: true, setorC: true, setorD: true, setorE: true, setorF: true, setorG: true, setorH: true, setorI: true });
    markSeen("fase3-setorA");
    markSeen("fase3-setorB");
    markSeen("fase3-setorC");
    markSeen("fase3-setorD");
    markSeen("fase3-setorE");
    markSeen("fase3-setorF");
    markSeen("fase3-setorG");
    markSeen("fase3-setorH");
    markSeen("fase3-setorI");
    this.audio.synth?.("gold3");
    const d = 200, objs = [];
    objs.push(this.add.rectangle(W / 2, H / 2, W + 400, H + 400, 0x02060c, 0.55).setScrollFactor(0).setDepth(d));
    if (this.textures.exists("carta_moldura")) {
      objs.push(this.add.rectangle(W / 2, H / 2, 900, 520, 0xf3e6c8).setScrollFactor(0).setDepth(d + 0.5));
      objs.push(this.add.image(W / 2, H / 2, "carta_moldura").setDisplaySize(1100, 690).setScrollFactor(0).setDepth(d + 1));
    } else objs.push(this.add.rectangle(W / 2, H / 2, 1000, 560, 0xf1e2bf).setStrokeStyle(8, 0x6b4a26).setScrollFactor(0).setDepth(d + 1));
    objs.push(this.add.text(W / 2, H / 2 - 150, "Continua…", { fontFamily: BTN_FONT, fontSize: "72px", color: "#fff3d6", stroke: "#4a2a14", strokeThickness: 12 }).setOrigin(0.5).setScrollFactor(0).setDepth(d + 2));
    objs.push(this.add.text(W / 2, H / 2 - 40, "Você atravessou o Riacho do Lucas!\nA Cachoeira e a Gruta Secreta vêm no próximo passo.", { fontFamily: "Georgia, serif", fontSize: "32px", color: "#3a2412", align: "center" }).setOrigin(0.5).setScrollFactor(0).setDepth(d + 2));
    const close = () => { objs.forEach((o) => o.destroy()); this.ended = false; this.sofia.cheering = false; this.sofia.locked = false; this.sofia.body.setVelocityX(-200); this.sofia.sprite.x -= 260; this.sofia.body.reset(this.sofia.sprite.x, this.sofia.sprite.y); };
    objs.push(...makeButton(this, W / 2 - 230, H / 2 + 120, "EXPLORAR MAIS", close, { w: 420, h: 84, depth: d + 2, scrollFactor: 0, fontSize: 28, kind: "continuar" }).objs);
    objs.push(...makeButton(this, W / 2 + 230, H / 2 + 120, "MENU PRINCIPAL", () => this.toMenu(), { w: 420, h: 84, depth: d + 2, scrollFactor: 0, fontSize: 28, kind: "menu" }).objs);
    this.endObjs = objs;
  }

  /* ------------------------------ loop ------------------------------ */
  update(time, delta) {
    if (this.paused) { if (this.input3.read(0).pausePressed) this.setPaused(false); return; }
    const dt = Math.min(0.05, delta / 1000);
    const a = this.input3.read(dt);
    if (a.pausePressed && !this.ended) return this.setPaused(true);
    const s = this.sofia, f = this.faisca;

    if (this.introT > 0) {
      this.introT -= dt;
      if (this.introT <= 0 || (this.introT < 1.9 && (a.jumpPressed || a.attackPressed))) { this.introT = 0; s.locked = false; s.looking = false; }
    }
    s.update(dt, this.ended ? {} : a);
    if (s.jumpedThisFrame) this.audio.play("jump", { volume: 0.6 });
    if (s.landedSpeed) {
      this.audio.play("land", { volume: Math.min(1, s.landedSpeed / 1200) });
      this.puff(s.x, s.y - 6, 0.6);
      if (s.landedSpeed > 1300) this.camera3.shake(0.002, 100);
    }
    if (s.grounded && Math.abs(s.body.velocity.x) > 60 && (this.stepT -= dt) <= 0) {
      this.stepT = Math.abs(s.body.velocity.x) > 450 ? 0.24 : 0.34;
      const inB = this.curSectorId === "B" || this.curSectorId === "G";
      this.audio.play("step_grass", { volume: inB ? 0.3 : 0.25, rate: (inB ? 0.95 : 0.75) + Math.random() * 0.1 });
    }

    // ataque normal (concha) e especial (latido)
    this.throwCool = Math.max(0, this.throwCool - dt);
    if (a.attackPressed && !this.ended && !this.charging && !s.locked && !s.onRope && s.hurtT <= 0 && this.throwCool <= 0 && this.projectiles.countActive() < 3) { this.throwShell(); this.throwCool = 0.3; }
    if (!this.ended) this.updateSpecial(dt, a);
    for (const p of this.projectiles.getChildren().slice()) {
      const life = p.getData("life") - dt; p.setData("life", life);
      if (life < 0.25) p.setAlpha(Math.max(0, life / 0.25));
      if (life <= 0 || p.y > KILL_Y) p.destroy();
    }
    // pedras arremessadas pelos macacos: atualiza sombra e impacto no chão
    for (const r of this.monkeyRocks.getChildren().slice()) {
      const life = r.getData("life") - dt; r.setData("life", life);
      const gy = r.getData("groundY"), y0 = r.getData("y0"), sh = r.getData("shadow");
      if (sh && sh.active) {
        const prog = Phaser.Math.Clamp((r.y - y0) / Math.max(40, gy - y0), 0, 1);
        sh.setScale(0.55 + prog * 0.55);
        sh.setAlpha(0.32 + prog * 0.45);
      }
      if (r.y >= gy - 14 || life <= 0 || r.y > KILL_Y) {
        if (sh) sh.destroy();
        this.puff(r.x, Math.min(r.y, gy - 6), 0.55, 0xc8b090);
        if (Math.abs(r.x - s.x) < 900) this.sfx.rockImpact?.();
        r.destroy();
      }
    }

    // segredos: cobertura some quando a Sofia entra; Faísca fareja perto
    let sniffX = null;
    for (const sec of this.allSecrets) {
      const z = sec.zone, inside = s.x > z.x && s.x < z.x + z.w && s.y > z.y && s.y < z.y + z.h + 10;
      if (inside && !this.foundSecrets.has(sec.id)) { this.foundSecrets.add(sec.id); this.audio.synth?.("gold3"); this.toast("Um esconderijo!", 300, "#FFE08A"); }
      if (!this.foundSecrets.has(sec.id) && Math.abs(s.x - sec.sniffX) < 520) sniffX = sec.sniffX;
    }
    for (const cv of this.chunks.covers) {
      const z = cv.sec.zone, inside = s.x > z.x - 20 && s.x < z.x + z.w + 20 && s.y > z.y && s.y < z.y + z.h + 10;
      cv.cover.setAlpha(cv.cover.alpha + ((inside ? 0.2 : 1) - cv.cover.alpha) * Math.min(1, dt * 8));
    }
    const enemyNear =
      this.chunks.crabs.some((c) => c.alive && Math.abs(c.x - f.x) < 380 && Math.abs(c.y - f.y) < 200) ||
      this.chunks.monkeys.some((m) => m.alive && Math.abs(m.x - f.x) < 420 && Math.abs(m.y - f.y) < 380);
    const detour = this.allTriggers.find(
      (t) => t.event === "faiscaDetour" && s.x >= t.x && s.x <= t.x + t.w && f.lastReunionId !== t.id
    );
    f.update(dt, s, {
      charging: this.charging, sniffX, enemyNear, detour, killY: KILL_Y,
      onSniff: () => { this.sfx.bark(false, true); this.icon(f.x, f.y - 110); if (!this.shownHints.has("farejou")) { this.shownHints.add("farejou"); this.showHint("O Faísca farejou alguma coisa… {down} para agachar"); } },
      onGrowl: () => this.sfx.growl(),
      onReunion: () => { this.stars(f.x, f.y - 60); },
    });

    // inimigos e mecânicas de plataformas/ondas/cordas: só agem perto da câmera
    const cam = this.cameras.main, mid = cam.scrollX + W / 2;
    this.chunks.updateMechanics(dt, s, time / 1000, mid, Boolean(!this.ended && (a.up || a.jump)));
    for (const c of this.chunks.crabs) {
      if (!c.alive) continue;
      c.setActive(Math.abs(c.x - mid) < 1500);
      c.update(dt, s);
      if (c.y > KILL_Y) c.defeat(c.x);
    }
    for (const m of this.chunks.monkeys) {
      if (!m.alive) continue;
      m.setActive(Math.abs(m.x - mid) < 1500);
      m.update(dt, s);
      if (m.y > KILL_Y) m.defeat(m.x);
    }

    // água e queda: volta ao checkpoint / ponto seguro (vida infinita)
    for (const w of this.chunks.waters) {
      const d = w.def;
      w.crest.tilePositionX += dt * (d.stream ? 65 : 40);
      if (w.refl) w.refl.tilePositionX -= dt * 32;
      if (!this.respawning && s.x > d.x && s.x < d.x + d.w && s.y > d.y + 40) { this.splash(s.x, d.y); this.respawn(d.respawn); }
    }
    if (!this.respawning && s.y > KILL_Y) this.respawn();

    if (!this.ended) {
      this.checkpointsUpdate();
      for (const h of this.allHints) if (!this.shownHints.has(h.id) && s.x > h.x && !this.introT) { this.shownHints.add(h.id); this.showHint(h.text); }
      for (const t of this.allTriggers) if (t.event === "end" && s.x > t.x && s.x < t.x + t.w) this.endSector();
    }

    const vista = this.allVistas.find((v) => s.x >= v.x0 && s.x < v.x1);
    this.camera3.update(dt, s, vista ? vista.zoom : 1);
    this.updateChunks();
    const sec = this.sectorAt(s.x);
    if (sec.id !== this.curSectorId) {
      if (this.curSectorId === "A" && sec.id === "B") saveF3({ setorA: true });
      if (this.curSectorId === "B" && sec.id === "C") saveF3({ setorA: true, setorB: true });
      if (this.curSectorId === "C" && sec.id === "D") saveF3({ setorA: true, setorB: true, setorC: true });
      if (this.curSectorId === "D" && sec.id === "E") saveF3({ setorA: true, setorB: true, setorC: true, setorD: true });
      if (this.curSectorId === "E" && sec.id === "F") saveF3({ setorA: true, setorB: true, setorC: true, setorD: true, setorE: true });
      if (this.curSectorId === "F" && sec.id === "G") saveF3({ setorA: true, setorB: true, setorC: true, setorD: true, setorE: true, setorF: true });
      if (this.curSectorId === "G" && sec.id === "H") saveF3({ setorA: true, setorB: true, setorC: true, setorD: true, setorE: true, setorF: true, setorG: true });
      if (this.curSectorId === "H" && sec.id === "I") saveF3({ setorA: true, setorB: true, setorC: true, setorD: true, setorE: true, setorF: true, setorG: true, setorH: true });
      this.curSectorId = sec.id;
      this.toast(sec.name, 190, "#F3D48A");
    }
    const secA = this.level.sectors[0];
    this.backdrop.update(dt, cam, { from: secA.x0, to: secA.x1, y: secA.groundY });
    this.updateHud();

    // ambiente da praia / costão / floresta (ondas mais baixas na mata, vento constante)
    const inForest = this.curSectorId === "C" || this.curSectorId === "D" || this.curSectorId === "E" || this.curSectorId === "F" || this.curSectorId === "H" || this.curSectorId === "I";
    if ((this.ambT -= dt) <= 0) {
      const vol = this.curSectorId === "B" || this.curSectorId === "G" || this.curSectorId === "I" ? 0.36 : inForest ? 0.14 : 0.4;
      this.ambT = (this.curSectorId === "B" || this.curSectorId === "I" ? 2.6 : 3.5) + Math.random() * 3.0;
      this.audio.play("praia", { volume: vol, pan: Math.random() - 0.5 });
    }
    if ((this.windT -= dt) <= 0) { this.windT = 9 + Math.random() * 7; this.audio.play("vento", { volume: inForest || this.curSectorId === "G" ? 0.34 : 0.24 }); }
  }
}
