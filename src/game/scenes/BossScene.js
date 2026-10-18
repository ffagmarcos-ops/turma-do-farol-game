// @ts-nocheck
/**
 * FASE 2 — O Polvo Gigante (luta de chefe estilo Rayman).
 * Módulos: boss/StormFX (tempo), boss/BoatCrew (barco + tripulação), boss/LucasPlayer,
 * boss/TentacleController, boss/BossAI (polvo em partes + padrões), boss/BossHealthBar (HUD).
 * Toda a lógica roda em update(dt) com timers próprios para poder ser testada passo a passo.
 */
import { grantBonusF2, readWallet } from "../systems/Wallet.js";
import Phaser from "../phaser.js";
import { makeButton } from "../systems/UIButton.js";
import { askMainMenu } from "../systems/PauseMenu.js";
import falas from "../data/falas_hq_fase2_polvo.json";
import CFG from "../data/boss_polvo.json";
import { HQPanel } from "../systems/HQPanel.js";
import { F2_MUSIC } from "../data/AssetManifest.js";
import { keyDown, keyUp, clearInput, isDown, getTouch } from "../input.js";
import { AudioManager } from "../systems/AudioManager.js";
import { W, H, clamp, lerp, readSave, writeSave, reduceFlashes, setReduceFlashes, NAMES, PHASE_TITLES } from "../boss/common.js";
import { makeBossTextures } from "../boss/textures.js";
import { StormFX } from "../boss/StormFX.js";
import { BoatCrew } from "../boss/BoatCrew.js";
import { LucasPlayer } from "../boss/LucasPlayer.js";
import { Tentacle, registerTentacleFrames } from "../boss/TentacleController.js";
import { OctopusRig, chooseAttack } from "../boss/BossAI.js";
import { BossHealthBar } from "../boss/BossHealthBar.js";
import { BossAudio } from "../boss/BossAudio.js";
import { CC0FX } from "../boss/CC0FX.js";

const HIT_DMG = 20; // vida do Lucas: 100 → 5 golpes até cair (vidas infinitas)
const LETTERS = "ABCD";

export class BossScene extends Phaser.Scene {
  constructor() {
    super("boss-polvo");
  }

  init(data) {
    const save = readSave() || {};
    this.segment = clamp(data?.segment ?? save.segment ?? 0, 0, 3);
    this.skipIntro = Boolean(data?.skipIntro || this.segment > 0);
  }

  create() {
    clearInput();
    makeBossTextures(this);
    registerTentacleFrames(this);
    document.body.classList.remove("is-title");
    document.body.classList.add("fase2");
    // Toque: botão FALAR vira SÔNICO (toque = tiro, segurar = carga); PULAR continua igual.
    this.talkBtn = document.querySelector(".act.talk");
    if (this.talkBtn) {
      this.talkBtnHtml = this.talkBtn.innerHTML;
      this.talkBtn.innerHTML = "<b>〰</b>SÔNICO";
    }
    this.reduceFlash = reduceFlashes();
    Object.assign(this, { clock: 0, hitStop: 0, mode: "intro", fury: false, paused: false, camPunch: 0, cinema: 0, seq: null });
    const cam = this.cameras.main;
    cam.setBackgroundColor("#050b14");
    this.storm = new StormFX(this);
    this.octo = new OctopusRig(this);
    this.crew = new BoatCrew(this);
    this.lucasP = new LucasPlayer(this);
    this.tentacles = [new Tentacle(this, -1, 34), new Tentacle(this, 1, 34), new Tentacle(this, -1, 34.2), new Tentacle(this, 1, 34.2)];
    this.mastTentacle = new Tentacle(this, 1, 26);
    this.allTentacles = [...this.tentacles, this.mastTentacle];
    this.warnFx = [-1, 1].map((side) => ({
      side,
      shade: this.add.image(side < 0 ? 330 : 1590, 905, "f2_warn").setDepth(37).setAlpha(0).setScale(1.2, 1),
      excl: this.add.image(side < 0 ? 400 : 1520, 520, "f2_excl").setDepth(80).setAlpha(0),
      arrow: this.add.text(side < 0 ? 400 : 1520, 410, side < 0 ? "◀" : "▶", { fontSize: "90px", color: "#ffcf3a", stroke: "#2a1400", strokeThickness: 10 }).setOrigin(0.5).setDepth(80).setAlpha(0),
      t: 0,
      on: false,
    }));
    this.spray = this.add.particles(0, 0, "f2_drop", { lifespan: 900, speed: { min: 260, max: 760 }, angle: { min: 200, max: 340 }, gravityY: 1300, scale: { start: 0.9, end: 0.2 }, alpha: { start: 0.95, end: 0 }, emitting: false }).setDepth(36);
    this.sparks = this.add.particles(0, 0, "f2_glow", { lifespan: 420, speed: { min: 120, max: 420 }, scale: { start: 0.35, end: 0 }, tint: [0x8ff6ff, 0xfff1a6], blendMode: "ADD", emitting: false }).setDepth(40);
    this.bubbles = this.add.particles(0, 0, "f2_bubble", { lifespan: 700, speedY: { min: -140, max: -60 }, speedX: { min: -40, max: 40 }, scale: { start: 0.6, end: 1.1 }, alpha: { start: 0.9, end: 0 }, emitting: false }).setDepth(37.5);
    this.deckSplash = this.add.particles(0, 0, "f2_drop", { x: { min: 260, max: 1660 }, y: { onEmit: () => this.deckYAt(960) - 2 }, lifespan: 360, speedY: { min: -220, max: -90 }, speedX: { min: -80, max: 80 }, gravityY: 900, scale: { start: 0.45, end: 0.1 }, alpha: { start: 0.8, end: 0 }, quantity: 2, frequency: 30 }).setDepth(28);
    // tinta final (Daniel): 6x2 células 384x384, recorte com margem de 8 px; linha 1 voo, linha 2 impacto (4)
    this.inkArt = this.textures.exists("f2_tinta_proj");
    if (this.inkArt) {
      const tex = this.textures.get("f2_tinta_proj");
      for (let i = 0; i < 6; i++) if (!tex.has(`p${i}`)) tex.add(`p${i}`, 0, i * 384 + 8, 8, 368, 368);
      for (let i = 0; i < 4; i++) if (!tex.has(`i${i}`)) tex.add(`i${i}`, 0, i * 384 + 8, 384 + 8, 368, 368);
    }
    this.inkHits = [];
    for (let i = 0; i < 6; i++) this.inkHits.push({ img: this.add.image(0, 0, this.inkArt ? "f2_tinta_proj" : "f2_ink", this.inkArt ? "i0" : undefined).setDepth(33.5).setVisible(false).setOrigin(0.5, 0.8), t: -1 });
    this.inks = [];
    for (let i = 0; i < 6; i++) this.inks.push({ img: this.add.image(0, 0, this.inkArt ? "f2_tinta_proj" : "f2_ink", this.inkArt ? "p0" : undefined).setDepth(33).setVisible(false), mark: this.add.image(0, 0, "f2_puddle").setDepth(21).setVisible(false).setAlpha(0.35), on: false });
    this.puddles = [];
    for (let i = 0; i < 6; i++) this.puddles.push({ img: (this.inkArt ? this.add.image(0, 0, "f2_tinta_proj", "i3").setScale(0.62, 0.5).setOrigin(0.5, 0.78) : this.add.image(0, 0, "f2_puddle")).setDepth(22).setVisible(false), t: 0, x: 0 });
    this.screenInk = this.add.image(W / 2, H / 2, "f2_tinta_tela").setScrollFactor(0).setDepth(95).setDisplaySize(W * 1.15, H * 1.15).setTint(0x8a5f9a).setAlpha(0); // centro-esquerda livre; tint puxado para #3a1f4a
    this.screenInkT = 0;
    this.shots = [];
    // Arte aprovada sonic_fx_sheet (6x4, 256x256): L1 tiro, L2 impacto, L3 tiro carregado, L4 vapor (blend NORMAL).
    this.fxSheet = this.textures.exists("f2_sonic_fx");
    if (this.fxSheet) {
      const A = (key, a, b, rate, repeat = 0) => { if (!this.anims.exists(key)) this.anims.create({ key, frames: this.anims.generateFrameNumbers("f2_sonic_fx", { start: a, end: b }), frameRate: rate, repeat }); };
      A("sfx-shot", 0, 5, 14);
      A("sfx-impact", 6, 11, 20);
      A("sfx-charged", 12, 17, 12);
      A("sfx-steam", 18, 23, 12);
      this.impacts = [];
      for (let i = 0; i < 10; i++) this.impacts.push(this.add.sprite(0, 0, "f2_sonic_fx", 6).setBlendMode("ADD").setDepth(40.5).setVisible(false).on("animationcomplete", function () { this.setVisible(false); }));
      this.steamFx = this.add.sprite(0, 0, "f2_sonic_fx", 18).setDepth(31.5).setVisible(false).on("animationcomplete", function () { this.setVisible(false); });
    }
    for (let i = 0; i < 16; i++) this.shots.push({ img: this.fxSheet ? this.add.sprite(0, 0, "f2_sonic_fx", 0).setBlendMode("ADD").setDepth(32).setVisible(false) : this.add.image(0, 0, "f2_ring").setBlendMode("ADD").setDepth(32).setVisible(false), on: false });
    this.hud = new BossHealthBar(this);
    this.cc0 = new CC0FX(this);
    this.hurtEdge = this.add.rectangle(W / 2, H / 2, W, H).setStrokeStyle(40, 0xff2030, 1).setScrollFactor(0).setDepth(97).setAlpha(0);
    this.buildOverlay();
    this.buildInput();
    this.setupAudio();
    this.resetFight();
    window.__boss = this;
    this.events.once("shutdown", () => this.cleanup());
    cam.fadeIn(600, 0, 0, 0);
    if (this.skipIntro) this.startPhaseSequence(true);
    else this.playIntro();
  }

  buildOverlay() {
    const st = { fontFamily: "Georgia, serif", color: "#F6E7C1" };
    this.bark = this.add.text(960, 300, "", { ...st, fontSize: "30px", backgroundColor: "#0b2238dd", padding: { x: 18, y: 10 }, align: "center", wordWrap: { width: 1200 } }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(93).setAlpha(0);
    this.barkT = 0;
    this.bigPrompt = this.add.text(960, 420, "", { ...st, fontSize: "60px", color: "#8ff6ff", stroke: "#001018", strokeThickness: 10, align: "center" }).setOrigin(0.5).setScrollFactor(0).setDepth(94).setAlpha(0);
    this.letterTop = this.add.rectangle(W / 2, -10, W + 800, 140, 0x000000).setOrigin(0.5, 1).setScrollFactor(0).setDepth(98);
    this.letterBot = this.add.rectangle(W / 2, H + 10, W + 800, 140, 0x000000).setOrigin(0.5, 0).setScrollFactor(0).setDepth(98);
    this.dlgBox = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.dlgName = this.add.text(390, 40, "", { ...st, fontSize: "26px", color: "#E2B657" }).setScrollFactor(0).setDepth(101);
    this.dlgText = this.add.text(390, 78, "", { ...st, fontSize: "30px", wordWrap: { width: 1300 } }).setScrollFactor(0).setDepth(101);
    this.dlgHint = this.add.text(1700, 210, "Enter / toque ▶", { ...st, fontSize: "20px" }).setOrigin(1, 0).setScrollFactor(0).setDepth(101).setAlpha(0.8);
    this.dlgPortrait = this.add.image(268, 128, "f2_glow").setScrollFactor(0).setDepth(102);
    this.hq = new HQPanel(this, 99);
    // faixa escura atrás do título (legível sobre a página 09) + chuva/relâmpago por cima da HQ
    this.titleBand = this.add.rectangle(W / 2, 560, W, 330, 0x05070f, 1).setScrollFactor(0).setDepth(102.5).setAlpha(0);
    this.hqRain = this.textures.exists("f2_cc0_chuva") ? this.add.tileSprite(W / 2, H / 2, W, H, "f2_cc0_chuva").setScrollFactor(0).setDepth(99.5).setTint(0x9fd8ff).setAlpha(0).setBlendMode("ADD") : null;
    this.hqFlash = this.add.rectangle(W / 2, H / 2, W, H, 0xdfeaff, 1).setScrollFactor(0).setDepth(99.6).setAlpha(0).setBlendMode("ADD");
    this.hqBolt = this.textures.exists("f2_relampago") ? this.add.sprite(1500, 300, "f2_relampago", 0).setScrollFactor(0).setDepth(99.55).setBlendMode("ADD").setAlpha(0) : null;
    this.hqFlashIn = 0.6;
    this.title = this.add.text(960, 520, "", { fontFamily: "Georgia, serif", fontSize: "96px", color: "#ffd36a", stroke: "#1a0010", strokeThickness: 14, align: "center" }).setOrigin(0.5).setScrollFactor(0).setDepth(103).setAlpha(0);
    this.subtitle = this.add.text(960, 640, "", { ...st, fontSize: "40px", stroke: "#000", strokeThickness: 6, align: "center" }).setOrigin(0.5).setScrollFactor(0).setDepth(103).setAlpha(0);
    this.setDialogVisible(false);
  }

  setDialogVisible(on) {
    for (const o of [this.dlgBox, this.dlgName, this.dlgText, this.dlgPortrait, this.dlgHint]) o.setVisible(on);
  }

  buildInput() {
    this.onKD = (e) => {
      keyDown(e.code);
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(e.code)) e.preventDefault?.();
      if (e.repeat) return;
      if (e.code === "Escape" && this.mode === "seq" && this.seq?.skipAll) this.skipSequence();
      else if ((e.code === "Escape" || e.code === "KeyP") && this.mode !== "end") this.togglePause();
      else if (e.code === "KeyL") this.toggleFlash();
      else if (["Enter", "NumpadEnter", "Space", "KeyE", "KeyJ"].includes(e.code)) this.confirmPressed = true;
    };
    this.onKU = (e) => keyUp(e.code);
    window.addEventListener("keydown", this.onKD);
    window.addEventListener("keyup", this.onKU);
    this.mouseDown = false;
    this.input.on("pointerdown", (p) => {
      this.audio?.unlock?.();
      this.confirmPressed = true;
      if (!p.wasTouch) {
        this.mouseDown = true;
        this.mouseAim = { x: p.worldX, y: p.worldY };
        this.mouseAimT = 1.5;
      }
    });
    this.input.on("pointerup", () => (this.mouseDown = false));
  }

  cleanup() {
    window.removeEventListener("keydown", this.onKD);
    window.removeEventListener("keyup", this.onKU);
    this.rainLoop?.stop();
    this.rainLoop = null;
    this.baud?.stop();
    document.body.classList.remove("fase2");
    if (this.talkBtn && this.talkBtnHtml) this.talkBtn.innerHTML = this.talkBtnHtml;
    if (window.__boss === this) delete window.__boss;
    clearInput();
  }

  setupAudio() {
    this.audio = this.registry.get("audio");
    if (!this.audio) {
      this.audio = new AudioManager();
      this.registry.set("audio", this.audio);
    }
    this.audio.unlock?.();
    this.baud = new BossAudio(this.audio);
    // chuva sintetizada só se o loop gravado não carregar
    this.baud.ready.then(() => { if (!this.baud.rainOn && !this.baud.dead) this.rainLoop = this.audio.synth?.("rain", { volume: 0.3 }) || null; });
  }

  sfx(kind, opts) {
    const a = this.audio;
    if (!a) return;
    try {
      if (kind === "bark") return this.baud?.woof(opts?.volume ?? 0.5);
      if (this.baud && ["thunder", "splash", "slam", "wood", "creak", "wave"].includes(kind) && this.baud.play(kind, opts)) return;
      if (["thunder", "splash", "slam", "roar", "ink", "sonic", "sonic_big", "overheat", "hurt", "hit"].includes(kind)) a.synth?.(kind, opts);
      else a.play?.(kind, opts);
    } catch {}
  }

  deckYAt(x) {
    return this.crew.deckYAt(x);
  }
  boatSlide() {
    return Math.abs(this.crew.waveTilt) > 3 ? Math.sin((this.crew.angle * Math.PI) / 180) * 220 : 0;
  }
  onPuddle(x) {
    return this.puddles.some((p) => p.t > 0 && Math.abs(p.x - x) < 120);
  }

  resetFight() {
    this.phase = this.segment;
    this.hp = CFG.hpTotal - this.segment * CFG.segmentHp;
    if (this.hp > 0 && this.hp <= CFG.hpTotal * 0.28) { this.tenseOn = true; this.baud?.setTension(true); } // retomou do checkpoint já com pouca vida
    this.hud.trail = this.hp;
    this.ai = { phase: this.phase, patternIdx: 0, cool: { ink: 0, sweep: 0, wave: 0, mast: 0 } };
    Object.assign(this, { attackT: 2, invuln: 0, sweepQ: null, wave: null, mast: null, inkWind: null, inkSpits: 0, firstHit: false, flags: {}, finalReady: false, fury: this.phase >= 3, mouseAimT: 0 });
    this.updatePhaseLabel();
  }

  updatePhaseLabel() {
    this.hud.phase.setText(`Fase ${LETTERS[this.phase]} · ${PHASE_TITLES[this.phase]}`);
  }
  phaseCfg() {
    return CFG.phases[this.phase];
  }

  /* ---------------- cenas curtas (cutscenes) ---------------- */
  runSequence(steps, done) {
    this.seq = { steps, i: -1, t: 0, line: 0, done };
    this.mode = "seq";
    this.nextStep();
  }

  /** Esc na HQ de vitória: pula direto para a tela final */
  skipSequence() {
    const q = this.seq;
    if (!q) return;
    this.sfx("ui_next");
    if (this.octo) this.octo.target = this.octo.baseY + 760;
    if (this.storm) this.storm.windTarget = 0.12;
    q.i = q.steps.length - 1;
    this.nextStep();
  }

  nextStep() {
    const q = this.seq;
    q.i += 1;
    q.t = 0;
    q.line = 0;
    this.setDialogVisible(false);
    this.title.setAlpha(0);
    this.subtitle.setAlpha(0);
    this.titleBand?.setAlpha(0);
    if (q.i >= q.steps.length) {
      this.hq.hide();
      this.seq = null;
      this.mode = "fight";
      q.done?.();
      return;
    }
    const step = q.steps[q.i];
    step.fn?.();
    // ilustração da HQ em tela cheia (cover + fade + Ken Burns); a caixa de diálogo fica por cima, no topo
    if (step.panel && this.textures.exists(step.panel)) this.hq.show(step.panel);
    else this.hq.hide();
    if (step.title) this.title.setText(step.title).setScale(2.2), this.subtitle.setText(step.sub || "");
    if (step.lines) this.showLine(falas[step.lines]?.[0]);
  }

  showLine(line) {
    if (!line) return;
    const who = line.who;
    this.setDialogVisible(true);
    this.dlgBox.clear();
    this.dlgBox.fillStyle(0x0b2a44, 0.94).fillRoundedRect(180, 24, 1560, 220, 18);
    this.dlgBox.fillStyle(0x1c3550, 1).fillRoundedRect(194, 54, 148, 148, 12); // fundo para retratos sem fundo (polvo)
    this.dlgBox.lineStyle(4, 0xe2b657, 1).strokeRoundedRect(194, 54, 148, 148, 12);
    const mark = ""; // sem referência de página da HQ nem "(sugestão)"
    this.dlgName.setText(`${NAMES[who] || who}${mark}`);
    this.dlgText.setText(line.text);
    const alt = { lucas: "portrait_lucas_alerta", marina: "portrait_marina_comando", toninho: "portrait_toninho_leme", bia: "portrait_bia_assustada", julia: "portrait_julia_camera" }[who];
    const key = alt && this.textures.exists(alt) ? alt : `portrait_${who}`;
    if (this.textures.exists(key)) this.dlgPortrait.setTexture(key).setDisplaySize(132, 132).setVisible(true);
    else this.dlgPortrait.setVisible(false);
    this.sfx("ui_next");
    this.crew.hop(who);
  }

  updateSequence(dt, confirm) {
    const q = this.seq;
    const step = q.steps[q.i];
    q.t += dt;
    if (step.title && this.titleBand) this.titleBand.setAlpha(clamp(q.t * 3, 0, 1) * 0.55);
    if (step.panel === "hq_p09") this.titleStorm(dt);
    if (step.title) {
      const k = clamp(q.t / 0.45, 0, 1);
      this.title.setAlpha(k).setScale(lerp(2.2, 1, 1 - (1 - k) * (1 - k)));
      this.subtitle.setAlpha(clamp((q.t - 0.4) * 3, 0, 1));
    }
    if (step.lines) {
      const lines = falas[step.lines] || [];
      if (confirm && q.t > 0.25) {
        q.line += 1;
        q.t = 0;
        if (q.line >= lines.length) return this.nextStep();
        this.showLine(lines[q.line]);
      }
      return;
    }
    if (q.t >= (step.dur ?? 1.5) || (confirm && q.t > 0.4 && step.skippable !== false)) this.nextStep();
  }

  /** chuva e relâmpagos por cima da página 09 na tela de título */
  titleStorm(dt) {
    const t = this.seq?.t || 0;
    if (this.hqRain) { this.hqRain.setAlpha(Math.min(0.7, t * 2)); this.hqRain.tilePositionY -= dt * 900; this.hqRain.tilePositionX -= dt * 250; }
    this.hqFlashIn -= dt;
    if (this.hqFlashIn <= 0) {
      this.hqFlashIn = 1.1 + Math.random() * 1.4;
      const k = this.reduceFlash ? 0.12 : 0.45;
      this.hqFlash.setAlpha(k);
      this.tweens.add({ targets: this.hqFlash, alpha: 0, duration: 260 });
      if (this.hqBolt) { this.hqBolt.setPosition(300 + Math.random() * 1320, 260).setFrame(Math.floor(Math.random() * 4)).setAlpha(0.9); this.tweens.add({ targets: this.hqBolt, alpha: 0, duration: 220, delay: 60 }); }
      this.sfx("thunder", { volume: 0.5 });
    }
  }

  playIntro() {
    this.octo.c.y = this.octo.baseY + 560;
    this.octo.target = this.octo.baseY + 560;
    this.runSequence(
      [
        { title: "Rumo à Ilha", sub: "Fase 2 · O Polvo Gigante", dur: 3.4, panel: "hq_p09" },
        { panel: "cut_intro1", lines: "intro1" },
        { lines: "intro2" },
        { panel: "cut_intro3", lines: "intro3", fn: () => { this.cameras.main.shake(500, 0.01); this.sfx("slam"); } },
        { dur: 2.2, skippable: false, fn: () => { this.octo.target = this.octo.baseY; this.sfx("splash", { volume: 1.2 }); this.spray.explode(60, 960, 760); this.storm.lightning(true); } },
        { title: "POLVO GIGANTE", sub: "Guardião do mar", dur: 2, fn: () => { this.octo.target = null; this.sfx("roar"); this.cameras.main.shake(700, 0.012); this.octo.setExpr("angry", 2); } },
        { panel: "cut_entrada", lines: "entrada" },
        { title: "Fase A", sub: PHASE_TITLES[0], dur: 1.4 },
      ],
      () => this.startFight(),
    );
  }

  startPhaseSequence(fromCheckpoint) {
    this.runSequence([{ title: `Fase ${LETTERS[this.phase]}`, sub: (fromCheckpoint ? "Checkpoint · " : "") + PHASE_TITLES[this.phase], dur: 1.6 }], () => this.startFight());
  }

  startFight() {
    this.mode = "fight";
    this.attackT = 1.4;
  }

  /* ---------------- feedback ---------------- */
  punch(k) {
    this.camPunch = Math.max(this.camPunch, k);
  }
  showBark(id) {
    const line = falas[id]?.[0];
    if (!line) return;
    this.bark.setText(`${NAMES[line.who] || line.who}: ${line.text}`).setAlpha(1);
    this.barkT = 2.4;
    this.crew.hop(line.who);
  }

  /* ---------------- dano no polvo ---------------- */
  damageBoss(amount, x, y, charged) {
    if (this.invuln > 0 || this.mode !== "fight" || (this.finalReady && !charged)) {
      this.sparks.explode(4, x, y);
      return;
    }
    this.hp = Math.max(0, this.hp - amount);
    this.hud.hit();
    this.octo.flash = 0.08;
    this.octo.squash = 0.12;
    if (this.octo.expr !== "stunned") this.octo.setExpr("hurt", 0.35);
    this.sparks.explode(charged ? 26 : 10, x, y);
    this.sfx("hit", { volume: charged ? 1.2 : 0.7 });
    if (charged) {
      this.hitStop = 0.06;
      this.cameras.main.shake(160, 0.006);
      this.punch(0.04);
    }
    this.crew.cheer();
    if (!this.firstHit) {
      this.firstHit = true;
      this.showBark("bark_acerto");
    }
    // pouca vida (≤ 28%): música mais tensa
    if (!this.tenseOn && this.hp > 0 && this.hp <= CFG.hpTotal * 0.28) { this.tenseOn = true; this.baud?.setTension(true); }
    const th = [1800, 1200, 600];
    if (this.phase < 3 && this.hp <= th[this.phase]) {
      this.hp = th[this.phase];
      return this.phaseTransition();
    }
    if (this.phase === 3 && !this.finalReady && this.hp <= CFG.hpTotal * 0.05) {
      this.hp = Math.round(CFG.hpTotal * 0.05);
      this.finalReady = true;
      this.baud?.setFury(); // fúria final: laço curto e tambor
      this.retractAll();
      this.octo.exposed = 99;
      this.sfx("roar");
    } else if (this.finalReady && charged) {
      this.hp = 0;
      this.victory();
    }
  }

  retractAll() {
    for (const t of this.allTentacles) t.retract();
    this.sweepQ = null;
    this.mast = null;
    this.inkWind = null;
    this.octo.windup = 0;
    for (const w of this.warnFx) w.on = false;
  }

  phaseTransition() {
    const from = this.phase;
    this.invuln = 3;
    this.retractAll();
    this.sfx("roar");
    this.cameras.main.shake(500, 0.012);
    this.phase = from + 1;
    this.segment = this.phase;
    this.ai.phase = this.phase;
    this.ai.patternIdx = 0;
    writeSave({ segment: this.phase });
    this.lucasP.hp = Math.min(100, this.lucasP.hp + 30);
    this.runSequence(
      [
        { dur: 1.1, skippable: false, fn: () => { this.octo.setExpr("angry", 1.5); this.storm.lightning(true); } },
        { panel: ["cut_p75", "cut_p50", "cut_p25"][from], lines: ["p75", "p50", "p25"][from] },
        { title: `Fase ${LETTERS[this.phase]}`, sub: PHASE_TITLES[this.phase], dur: 1.6, fn: () => { this.fury = this.phase >= 3; this.updatePhaseLabel(); } },
      ],
      () => {
        this.mode = "fight";
        this.invuln = 0.6;
        this.attackT = 1.2;
      },
    );
  }

  /* ---------------- dano no Lucas (vidas infinitas) ---------------- */
  hurtLucas(mult, fromX) {
    if (this.mode !== "fight") return;
    if (!this.lucasP.hurt(HIT_DMG * (mult || 1), fromX)) return;
    this.hud.lucasHit();
    this.hitStop = 0.08;
    this.hurtEdge.setAlpha(0.8);
    this.cameras.main.shake(200, 0.008);
    this.sfx("hurt");
  }

  onLucasKO() {
    this.retractAll();
    this.attackT = 3.4;
    this.invuln = 0;
    this.cameras.main.shake(400, 0.01);
    this.punch(0.05);
    this.sfx("slam");
    this.koFlag = true;
    const line = falas.derrota?.[0];
    if (line) {
      this.bark.setText(`${NAMES[line.who] || line.who}: ${line.text}`).setAlpha(1);
      this.barkT = 2.4;
    }
    this.crew.say("Lucas!", "marina");
    this.crew.brace();
  }

  onLucasGetUp() {
    this.crew.say("Levanta, Lucas!", "bia");
    this.crew.cheer();
    this.bigPrompt.setText("Vida cheia!").setFontSize(56).setY(420).setAlpha(1);
    this.promptT = 1.2;
  }

  /* ---------------- ataques ---------------- */
  freeTentacle(side) {
    return this.tentacles.find((t) => t.side === side && !t.active);
  }

  launchAttack() {
    const pc = this.phaseCfg();
    const a = chooseAttack(this.ai);
    this.lastAttack = a;
    if (a === "L" || a === "R" || a === "LR") {
      const sides = a === "LR" ? [-1, 1] : [a === "L" ? -1 : 1];
      sides.forEach((side, i) => {
        const t = this.freeTentacle(side);
        if (!t) return;
        const warn = pc.warn + i * 0.7;
        t.start("lane", { warn, window: pc.window });
        this.telegraph(side, warn);
      });
      if (!this.flags.tent) (this.flags.tent = true), this.showBark("bark_tentaculo");
    } else if (a === "ink") {
      const [count, warn, cd] = pc.ink;
      this.ai.cool.ink = cd;
      this.inkWind = { t: 0, warn: warn + 0.4, count };
      this.octo.exposed = warn + 0.9;
      this.octo.mouthOpen = warn + 0.4;
      this.crew.say("Tinta!", "julia");
    } else if (a === "sweep") {
      const [warn, cd] = pc.sweep;
      this.ai.cool.sweep = cd;
      this.telegraph(-1, warn);
      this.telegraph(1, warn);
      this.sweepQ = { t: 0, warn, first: Math.random() < 0.5 ? -1 : 1, stage: 0 };
      this.crew.say("Pula! Depois abaixa!", "marina");
    } else if (a === "wave") {
      const [warn, cd] = pc.wave;
      this.ai.cool.wave = cd;
      this.wave = { t: 0, warn, stage: 0, dir: Math.random() < 0.5 ? -1 : 1 };
      this.crew.say("Onda! Abaixa no mastro!", "bia");
    } else if (a === "mast") {
      this.ai.cool.mast = 22;
      this.mastTentacle.start("mast", { warn: 1.0 });
      this.mast = { t: 0, hits: 0, limit: 10 };
      this.showBark("bark_mastro");
    }
  }

  telegraph(side, sec) {
    const w = this.warnFx[side < 0 ? 0 : 1];
    w.on = true;
    w.t = sec;
    this.crew.say(side < 0 ? "Esquerda!" : "Direita!", side < 0 ? "marina" : "bia");
    this.sfx("roar", { volume: 0.25 });
  }

  onTentacleSlam(t) {
    const d = CFG.deck;
    if (!this.storm.splash(t.tip.x, t.tip.y + 40, "splash", 1.3)) this.spray.explode(40, t.tip.x, t.tip.y);
    else this.spray.explode(14, t.tip.x, t.tip.y);
    this.sfx("slam");
    this.cameras.main.shake(120, 0.006);
    this.punch(0.02);
    this.crew.kick = (t.side < 0 ? -1 : 1) * 1.6;
    this.crew.brace();
    const lo = t.side < 0 ? d.left - 40 : d.right - d.laneW;
    const hi = t.side < 0 ? d.left + d.laneW : d.right + 40;
    if (this.lucasP.x > lo && this.lucasP.x < hi) this.hurtLucas(1, t.tip.x);
    if (!this.flags.deck) (this.flags.deck = true), this.showBark("bark_convés");
  }

  onSweepTick(t, x) {
    const L = this.lucasP;
    this.cc0.sweep(x, t.tip.y);
    if (Math.abs(x - L.x) > 60) return;
    if (t.high ? !L.crouch : L.grounded) this.hurtLucas(1, x);
  }

  spitInk() {
    const pc = this.phaseCfg();
    const count = this.inkWind.count;
    this.sfx("ink");
    this.inkSpits += 1;
    this.octo.squash = 0.2;
    let n = 0;
    for (const ink of this.inks) {
      if (ink.on || n >= count) continue;
      const tx = clamp(this.lucasP.x + (n - (count - 1) / 2) * 230 + (Math.random() - 0.5) * 60, CFG.deck.left + 40, CFG.deck.right - 40);
      Object.assign(ink, { on: true, t: 0, dur: 1.1 + n * 0.12, x0: this.octo.x, y0: this.octo.y + 60, tx, puddle: pc.puddle || 6 });
      ink.img.setVisible(true).setScale(this.inkArt ? 0.34 : 0.8);
      ink.mark.setVisible(true).setPosition(tx, this.deckYAt(tx) + 4);
      n++;
    }
    if (this.inkSpits % 3 === 0) {
      this.screenInkT = 3;
      if (!this.flags.tinta) (this.flags.tinta = true), this.showBark("bark_tinta");
    }
  }

  popInk(ink, landed) {
    ink.on = false;
    ink.img.setVisible(false);
    ink.mark.setVisible(false);
    this.sparks.explode(6, ink.img.x, ink.img.y);
    if (!landed) return;
    this.sfx("ink", { volume: 0.5 });
    this.cc0.ink(ink.tx, this.deckYAt(ink.tx));
    const h = this.inkHits.find((q) => q.t < 0);
    if (h && this.inkArt) { h.t = 0; h.x = ink.tx; h.img.setVisible(true).setFrame("i0").setFlipX(ink.tx < ink.x0).setScale(0.5); }
    const p = this.puddles.find((q) => q.t <= 0);
    if (p) {
      p.t = ink.puddle;
      p.x = ink.tx;
      p.img.setVisible(true).setAlpha(1);
    }
  }

  stunOctopus(sec) {
    this.octo.setExpr("stunned", sec);
    this.octo.exposed = sec;
    this.attackT = Math.max(this.attackT, sec + 0.6);
    this.sfx("roar", { volume: 0.6 });
  }

  /* ---------------- sônico (mira automática) ---------------- */
  pickTarget() {
    if (this.mouseAimT > 0 && this.mouseAim) return this.mouseAim;
    const L = this.lucasP;
    let best = null;
    let bestScore = -1e9;
    for (const t of this.allTentacles) {
      if (!t.active) continue;
      const m = t.damageMult();
      if (m == null) continue;
      const score = (m >= 1 ? 100 : 20) - Math.abs(t.tip.x - L.x) / 40;
      if (score > bestScore) (bestScore = score), (best = { x: t.tip.x, y: t.tip.y });
    }
    if (this.octo.exposed > 0 && bestScore < 90) best = this.octo.eyePos(L.x < 960 ? 0 : 1);
    if (bestScore < 50) {
      for (const ink of this.inks) if (ink.on && ink.img.y < this.deckYAt(ink.img.x) - 120) return { x: ink.img.x, y: ink.img.y };
    }
    return best || { x: this.octo.x, y: this.octo.y - 60 };
  }

  fire(charged) {
    const L = this.lucasP;
    const tg = this.pickTarget();
    L.facing = tg.x >= L.x ? 1 : -1;
    const m = L.muzzle;
    const shot = this.shots.find((s) => !s.on);
    if (!shot) return;
    const ang = Math.atan2(tg.y - m.y, tg.x - m.x);
    this.aimUp = Math.abs(Math.sin(ang)) > 0.55;
    const sp = charged ? 1500 : 1700;
    Object.assign(shot, { on: true, charged, x: m.x, y: m.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1.2 });
    if (this.fxSheet) {
      shot.img.setVisible(true).setPosition(m.x, m.y).setRotation(ang).setScale(charged ? 0.9 : 0.55).setAlpha(1).clearTint();
      shot.img.play(charged ? "sfx-charged" : "sfx-shot");
    } else shot.img.setVisible(true).setPosition(m.x, m.y).setRotation(ang).setScale(charged ? 1.6 : 0.6).setAlpha(1).setTint(charged ? 0xfff3a0 : 0x9ff8ff);
    this.sfx(charged ? "sonic_big" : "sonic", { volume: charged ? 1 : 0.6 });
    this.cc0.muzzle(m.x, m.y, charged);
    if (charged) {
      this.cameras.main.shake(140, 0.004);
      this.punch(0.025);
      if (this.screenInkT > 0) this.screenInkT = 0.4;
    }
  }

  updateShots(dt) {
    for (const s of this.shots) {
      if (!s.on) continue;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (this.fxSheet) s.img.setPosition(s.x, s.y).setAlpha(Math.min(1, s.life * 3));
      else s.img.setPosition(s.x, s.y).setScale(s.img.scaleX + dt * (s.charged ? 2 : 1.2)).setAlpha(Math.max(0, s.life));
      const r = s.charged ? 110 : 70;
      let hit = false;
      for (const ink of this.inks) {
        if (ink.on && Math.hypot(ink.img.x - s.x, ink.img.y - s.y) < r) {
          this.popInk(ink, false);
          if (!s.charged) hit = true;
        }
      }
      if (!hit) {
        for (const t of this.allTentacles) {
          if (!t.active) continue;
          const m = t.damageMult();
          if (m == null) continue;
          let near = false;
          for (let i = t.n - 4; i < t.n; i++) if (Math.hypot(t.points[i].x - s.x, t.points[i].y - s.y) < r) near = true;
          if (!near) continue;
          hit = true;
          const dmg = (s.charged ? CFG.charged : CFG.shot) * m;
          t.flash = 0.07;
          t.hurtT = 0.5;
          if (t === this.mastTentacle && this.mast) {
            if (s.charged) this.mast.hits += 1;
            if (this.mast.hits >= 3) {
              this.mast = null;
              t.retract();
              this.stunOctopus(4);
            }
          } else if (t.state === "vulnerable") {
            t.stunDmg += dmg;
            if (t.stunDmg >= this.phaseCfg().stun[0] || s.charged) {
              t.stun(this.phaseCfg().stun[1]);
              this.sfx("splash", { volume: 0.5 });
            }
          }
          this.damageBoss(dmg, s.x, s.y, s.charged);
          break;
        }
      }
      if (!hit && s.y < this.octo.y + 120 && Math.abs(s.x - this.octo.x) < 440) {
        let mult = 0.25;
        if (this.octo.exposed > 0) for (let i = 0; i < 2; i++) {
          const e = this.octo.eyePos(i);
          if (Math.hypot(e.x - s.x, e.y - s.y) < 120) mult = 2;
        }
        hit = true;
        this.damageBoss((s.charged ? CFG.charged : CFG.shot) * mult, s.x, s.y, s.charged);
      }
      if (hit || s.life <= 0 || s.y < -200 || s.x < -200 || s.x > W + 200) {
        if (hit) this.cc0.impact(s.x, s.y, this.octo.exposed > 0 || s.charged);
        if (hit && this.impacts) {
          const im = this.impacts.find((q) => !q.visible) || this.impacts[0];
          im.setVisible(true).setPosition(s.x, s.y).setScale(s.charged ? 1.1 : 0.6).setRotation(Math.atan2(s.vy, s.vx)).play("sfx-impact");
        }
        s.on = false;
        s.img.setVisible(false);
      }
    }
  }

  /* ---------------- vitória / fim ---------------- */
  victory() {
    clearInterval(this.baud?.drumT); // tambor da tensão para na vitória
    this.bigPrompt.setAlpha(0);
    this.retractAll();
    this.octo.exposed = 0;
    this.sfx("sonic_big", { volume: 1.3 });
    this.storm.flash(0.8);
    this.cameras.main.shake(900, 0.014);
    this.storm.lightning(true);
    writeSave(null);
    try { localStorage.setItem("farol-fase2-done", "1"); } catch {}
    this.bonusF2 = grantBonusF2();
    this.runSequence(
      [
        { panel: "cut_p0", lines: "p0", fn: () => this.octo.setExpr("stunned", 99) },
        { dur: 2.4, skippable: false, fn: () => { this.octo.target = this.octo.baseY + 760; this.sfx("splash", { volume: 1.2 }); this.storm.splash(960, 820, "wave", 2.2); } },
        { panel: "cut_curva", dur: 2.2 },
        { panel: "cut_epilogo", lines: "epilogo", fn: () => (this.storm.windTarget = 0.12) },
        { panel: "cut_gancho", lines: "gancho" },
      ],
      () => this.showEnd(),
    );
    if (this.seq) this.seq.skipAll = true;
  }

  showEnd() {
    this.mode = "end";
    document.body.classList.add("is-title");
    const shade = this.add.rectangle(W / 2, H / 2, W + 1200, H + 1200, 0x02060c, 0.78).setScrollFactor(0).setDepth(200);
    this.add.text(W / 2, 330, `FIM DA FASE 2 · O Polvo Gigante\n\nO polvo recuou para o fundo do mar.\nA ilha surgiu na neblina...\n\n${this.bonusF2?.granted ? "Baú do Seu Toninho: +30 conchas!\n" : ""}Carteira: 🐚 ${readWallet().carteira}`, { fontFamily: "Georgia, serif", fontSize: "42px", color: "#F6E7C1", align: "center" }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    shade.setInteractive();
    let leaving = false;
    const go = (fn) => () => {
      if (leaving) return;
      leaving = true;
      try { navigator.vibrate && navigator.vibrate(15); } catch {}
      this.sfx("ui_confirm");
      writeSave(null);
      fn();
    };
    this.replay = go(() => this.scene.restart({ segment: 0 }));
    this.toMenu = go(() => this.scene.start("menu"));
    this.toCreditos = go(() => this.scene.start("creditos", { back: "menu" }));
    [["JOGAR DE NOVO", this.replay, 420, "jogar_de_novo"], ["CRÉDITOS", this.toCreditos, 960, "continuar"], ["MENU", this.toMenu, 1500, "menu"]].forEach(([label, fn, x, kind]) => makeButton(this, x, 790, label, fn, { w: 500, h: 88, depth: 202, scrollFactor: 0, kind }));
    this.add.text(960, 925, "Enter: jogar de novo   ·   Esc: menu", { fontFamily: "Georgia, serif", fontSize: "24px", color: "#F6E7C1" }).setOrigin(0.5).setScrollFactor(0).setDepth(203).setAlpha(0.8);
    this.endArmedAt = performance.now() + 500;
  }

  /* ---------------- pausa ---------------- */
  togglePause() {
    this.paused = !this.paused;
    if (!this.pauseObjs) {
      const objs = [this.add.rectangle(W / 2, H / 2, W + 1200, H + 1200, 0x02060c, 0.6).setScrollFactor(0).setDepth(250), this.add.text(W / 2, 360, "PAUSA", { fontFamily: "Georgia, serif", fontSize: "80px", color: "#F6E7C1" }).setOrigin(0.5).setScrollFactor(0).setDepth(251)];
      const mk = (y, label, fn) => {
        const b = makeButton(this, W / 2, y, label, fn, { w: 760, h: 88, depth: 251, scrollFactor: 0, fontSize: 36, kind: /Menu/i.test(label) ? "menu" : /Recome|novo/i.test(label) ? "jogar_de_novo" : "continuar" });
        objs.push(...b.objs);
        return b.text;
      };
      mk(520, "▶  Continuar (Esc)", () => this.togglePause());
      this.flashLabel = mk(670, "", () => this.toggleFlash());
      mk(820, "MENU PRINCIPAL", () => askMainMenu(this, { depth: 300, onYes: () => { document.body.classList.add("is-title"); this.scene.start("menu"); } }));
      this.pauseObjs = objs;
    }
    this.flashLabel.setText(`Reduzir flashes: ${this.reduceFlash ? "SIM" : "NÃO"}  (L)`);
    for (const o of this.pauseObjs) o.setVisible(this.paused);
    if (this.paused) {
      this.tweens.pauseAll();
      this.anims.pauseAll();
      clearInput();
    } else {
      this.tweens.resumeAll();
      this.anims.resumeAll();
    }
  }

  toggleFlash() {
    this.reduceFlash = !this.reduceFlash;
    setReduceFlashes(this.reduceFlash);
    this.flashLabel?.setText(`Reduzir flashes: ${this.reduceFlash ? "SIM" : "NÃO"}  (L)`);
    this.bark.setText(`Reduzir flashes: ${this.reduceFlash ? "SIM" : "NÃO"}`).setAlpha(1);
    this.barkT = 1.5;
  }

  /* ---------------- laço principal ---------------- */
  consumeConfirm() {
    const tch = getTouch();
    const now = tch.interact || tch.jump;
    const edge = now && !this.prevTouch;
    this.prevTouch = now;
    const c = this.confirmPressed || edge;
    this.confirmPressed = false;
    return c;
  }

  update(time, deltaMs) {
    if (this.paused) return;
    this.step(Math.min(0.05, deltaMs / 1000));
  }

  step(dt) {
    this.hq?.update(dt);
    if (this.hqRain && !(this.seq && this.hq.key === "hq_p09")) this.hqRain.setAlpha(Math.max(0, this.hqRain.alpha - dt * 3));
    this.clock += dt;
    const t = this.clock;
    this.updateWorld(dt, t);
    if (this.hitStop > 0) {
      this.hitStop -= dt;
      return;
    }
    if (this.mode === "end") {
      if (performance.now() > this.endArmedAt) {
        if (isDown("Enter") || isDown("KeyR")) this.replay();
        else if (isDown("Escape") || isDown("Backspace")) this.toMenu();
      }
      return;
    }
    const confirm = this.consumeConfirm();
    const fighting = this.mode === "fight";
    if (this.mode === "seq" && this.seq) this.updateSequence(dt, confirm);
    else if (fighting) this.updateFight(dt, t);
    this.lucasP.update(dt, t, fighting);
    this.octo.update(dt, t, this.lucasP);
    for (const tt of this.allTentacles) tt.update(dt, t, this.deckYAt(tt.laneX()));
    if (fighting) this.updateShots(dt);
  }

  updateWorld(dt, t) {
    const amp = this.fury ? 1.4 : 1;
    const rise = this.wave && this.wave.stage === 0 ? clamp(this.wave.t / this.wave.warn, 0, 1) * -70 : 0;
    this.crew.waveTilt = lerp(this.crew.waveTilt, this.wave && this.wave.stage === 1 ? 7 * this.wave.dir : 0, dt * 3);
    this.storm.update(dt, t, amp, rise);
    this.cc0.update(dt, this.storm.wind, (x) => this.deckYAt(x));
    if (this.octo.exposed > 0) for (let i = 0; i < 2; i++) { const e = this.octo.eyePos(i); this.cc0.weakPoint(e.x, e.y); }
    const danger = this.warnFx.some((w) => w.on) || Boolean(this.sweepQ) || Boolean(this.wave && this.wave.stage === 0);
    this.crew.update(dt, t, amp, danger, this.tentacles.find((x) => x.active));
    const cam = this.cameras.main;
    const cin = this.mode === "seq" ? 1 : 0;
    this.cinema = lerp(this.cinema, cin, dt * 5);
    this.camPunch = lerp(this.camPunch, 0, dt * 6);
    cam.setZoom((this.fury ? 0.96 : 1) + Math.sin(t * 1.3) * 0.008 + this.camPunch + this.cinema * 0.03);
    cam.setRotation((this.crew.waveTilt * 0.3 * Math.PI) / 180);
    cam.scrollX = lerp(cam.scrollX, (this.lucasP.x - 960) * 0.06, dt * 3);
    cam.scrollY = lerp(cam.scrollY, Math.sin(t * 1.96) * 4, dt * 3);
    this.letterTop.setY(-10 + this.cinema * 110);
    this.letterBot.setY(H + 10 - this.cinema * 110);
    const step = this.seq?.steps[this.seq.i];
    this.hud.update(dt, t, this.mode === "fight" || (this.mode === "seq" && step && !step.lines && !step.panel && this.clock > 3));
    this.barkT -= dt;
    if (this.barkT <= 0) this.bark.setAlpha(Math.max(0, this.bark.alpha - dt * 3));
    this.promptT = (this.promptT || 0) - dt;
    this.hurtEdge.setAlpha(Math.max(0, this.hurtEdge.alpha - dt * 2.5));
    if (this.screenInkT > 0) {
      this.screenInkT -= dt;
      this.screenInk.setAlpha(clamp(this.screenInkT, 0, 0.95)).setY(H / 2 + (3 - this.screenInkT) * 30);
    } else this.screenInk.setAlpha(0);
  }

  updateFight(dt, t) {
    this.invuln = Math.max(0, this.invuln - dt);
    for (const k of Object.keys(this.ai.cool)) this.ai.cool[k] = Math.max(0, this.ai.cool[k] - dt);
    this.octo.exposed = Math.max(0, this.octo.exposed - dt);
    this.mouseAimT = Math.max(0, (this.mouseAimT || 0) - dt);
    for (const w of this.warnFx) {
      if (w.on) {
        w.t -= dt;
        w.shade.setAlpha(0.6 + Math.sin(t * 20) * 0.25);
        w.excl.setAlpha(1).setScale(1 + Math.sin(t * 14) * 0.15).setY(520 + Math.sin(t * 8) * 12);
        w.arrow.setAlpha(1).setX((w.side < 0 ? 400 : 1520) + Math.sin(t * 12) * 14 * w.side);
        if (Math.random() < 0.5) this.bubbles.emitParticleAt(w.shade.x + (Math.random() - 0.5) * 300, 900, 1);
        if (w.t <= 0) w.on = false;
      } else {
        w.shade.setAlpha(Math.max(0, w.shade.alpha - dt * 3));
        w.excl.setAlpha(Math.max(0, w.excl.alpha - dt * 5));
        w.arrow.setAlpha(Math.max(0, w.arrow.alpha - dt * 5));
      }
    }
    const busy = this.sweepQ || this.wave || this.inkWind || this.finalReady || this.mast || this.lucasP.ko || this.tentacles.some((x) => x.active && !["vulnerable", "stunned", "retract"].includes(x.state));
    this.attackT -= dt;
    if (this.attackT <= 0 && !busy) {
      this.launchAttack();
      this.attackT = this.phaseCfg().interval;
    }
    if (this.inkWind) {
      this.inkWind.t += dt;
      this.octo.windup = clamp(this.inkWind.t / this.inkWind.warn, 0, 1);
      if (this.inkWind.t >= this.inkWind.warn) {
        this.spitInk();
        this.inkWind = null;
        this.octo.windup = 0;
      }
    }
    for (const ink of this.inks) {
      if (!ink.on) continue;
      ink.t += dt;
      const k = clamp(ink.t / ink.dur, 0, 1);
      const gy = this.deckYAt(ink.tx);
      const ix = lerp(ink.x0, ink.tx, k), iy = lerp(ink.y0, gy - 20, k) - Math.sin(k * Math.PI) * 420;
      if (this.inkArt) {
        // a bolha voa com a cauda para trás; flipX quando vai para a esquerda (luz da esquerda)
        const vx = ink.tx - ink.x0, vy = (gy - 20 - ink.y0) / ink.dur - Math.cos(k * Math.PI) * Math.PI * 420 / ink.dur;
        const left = vx < 0;
        ink.img.setFrame(`p${Math.floor(ink.t * 14) % 6}`).setFlipX(left).setPosition(ix, iy).setRotation(Math.atan2(vy, Math.abs(vx / ink.dur)) * (left ? -1 : 1) * 0.6);
      } else ink.img.setPosition(ix, iy).setRotation(ink.t * 8);
      ink.mark.setAlpha(0.25 + k * 0.5).setScale(0.4 + k * 0.4);
      if (k >= 1) {
        if (Math.abs(this.lucasP.x - ink.tx) < 80) this.hurtLucas(1, ink.tx);
        this.popInk(ink, true);
      }
    }
    for (const h of this.inkHits) {
      if (h.t < 0) continue;
      h.t += dt;
      const f = Math.floor(h.t / 0.07);
      if (f > 3) { h.t = -1; h.img.setVisible(false); continue; }
      h.img.setFrame(`i${f}`).setPosition(h.x, this.deckYAt(h.x) + 8);
    }
    for (const p of this.puddles) {
      if (p.t <= 0) continue;
      p.t -= dt;
      p.img.setPosition(p.x, this.deckYAt(p.x) + 6).setRotation((this.crew.angle * Math.PI) / 180).setAlpha(clamp(p.t, 0, 1));
      if (p.t <= 0) p.img.setVisible(false);
    }
    if (this.sweepQ) {
      const q = this.sweepQ;
      q.t += dt;
      if (q.stage === 0 && q.t >= q.warn) {
        this.freeTentacle(q.first)?.start("sweep", { warn: 0.01, high: false });
        q.stage = 1;
        q.t = 0;
      } else if (q.stage === 1 && q.t >= 1.4) {
        this.freeTentacle(-q.first)?.start("sweep", { warn: 0.01, high: true });
        q.stage = 2;
        q.t = 0;
      } else if (q.stage === 2 && q.t >= 1.2) this.sweepQ = null;
    }
    if (this.wave) {
      const wv = this.wave;
      wv.t += dt;
      const L = this.lucasP;
      const safe = L.crouch && Math.abs(L.x - this.crew.mastX) < 170;
      if (wv.stage === 0 && wv.t >= wv.warn) {
        wv.stage = 1;
        wv.t = 0;
        this.sfx("splash", { volume: 1.4 });
        this.cameras.main.shake(600, 0.004);
        if (!this.storm.splash(wv.dir > 0 ? 1650 : 270, 760, "wave", 2)) this.spray.explode(80, wv.dir > 0 ? 1600 : 320, 600);
        this.crew.brace();
        if (!safe) this.hurtLucas(this.phaseCfg().waveDmg || 1, wv.dir > 0 ? 1900 : 0);
        if (!this.flags.onda) (this.flags.onda = true), this.showBark("bark_onda");
      } else if (wv.stage === 1) {
        if (!safe) L.x = clamp(L.x - wv.dir * 120 * dt, CFG.deck.left + 10, CFG.deck.right - 60);
        if (wv.t >= 1.5) {
          for (const side of [-1, 1]) {
            const tt = this.freeTentacle(side);
            if (tt) {
              tt.start("lane", { warn: 0.01, window: 2 });
              Object.assign(tt, { state: "vulnerable", ext: 1, t: 0 });
            }
          }
          this.wave = null;
        }
      }
    }
    if (this.mast) {
      this.mast.t += dt;
      this.bigPrompt.setText(`Tiros CARREGADOS na ventosa: ${this.mast.hits}/3`).setFontSize(44).setY(340).setAlpha(0.95);
      if (this.mast.t >= this.mast.limit) {
        this.mast = null;
        this.mastTentacle.retract();
        this.wave = { t: 0, warn: 1.2, stage: 0, dir: 1 };
      }
    } else if (this.finalReady) this.bigPrompt.setText("SEGURE O SÔNICO! (tiro carregado)").setFontSize(56).setY(420).setAlpha(0.7 + Math.sin(t * 8) * 0.3);
    else if (this.promptT <= 0) this.bigPrompt.setAlpha(Math.max(0, this.bigPrompt.alpha - dt * 3));
  }
}
