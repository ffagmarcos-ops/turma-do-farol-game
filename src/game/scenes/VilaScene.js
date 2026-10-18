// @ts-nocheck
import { readWallet, collect as walletCollect, unlockFree, newRun } from "../systems/Wallet.js";
import Phaser from "../phaser.js";
import { makeButton, BTN_FONT } from "../systems/UIButton.js";
import { askMainMenu } from "../systems/PauseMenu.js";
import { LEVEL, zoneAt } from "../data/LevelData.js";
import { computeActions, keyDown, keyUp, clearInput, setKeys } from "../input.js";
import { Marina } from "../entities/Marina.js";
import { CameraController } from "../systems/CameraController.js";
import { ParallaxManager } from "../systems/ParallaxManager.js";
import { InteractionSystem } from "../systems/InteractionSystem.js";
import { StoryDirector } from "../systems/StoryDirector.js";
import { AudioManager } from "../systems/AudioManager.js";
import { CheckpointSystem, readProgress, writeProgress, clearProgress } from "../systems/CheckpointSystem.js";
import { HUD } from "../systems/HUD.js";
import { SeagullSystem } from "../systems/SeagullSystem.js";
import { VilaCC0FX } from "../systems/VilaCC0FX.js";
import { HQPanel } from "../systems/HQPanel.js";

// fala da cena (índice) -> quadro da HQ que corresponde ao momento
const HQ_F1 = {
  julia_porto: ["P01_Q01", "P01_Q01"],
  bia_redes: ["P02_Q01", "P02_Q02", "P02_Q03", "P02_Q03", "P02_Q04", "P02_Q04"],
  toninho_artefato: ["P02_Q05", "P03_Q01", "P03_Q01", "P03_Q02", "P03_Q02", "P03_Q02", "P03_Q03", "P03_Q03", "P03_Q04", "P03_Q04", "P04_Q01", "P04_Q02", "P04_Q02", "P04_Q03", "P04_Q03", "P04_Q04", "P04_Q04", "P04_Q05", "P05_Q04", "P05_Q04", "P05_Q04"],
  toninho_embarcar: ["P05_Q05"],
};
import { VisualFX } from "../fx/VisualFX.js";
import { WindLife } from "../systems/WindLife.js";
import { CAST } from "../data/castScale.js";

export class VilaScene extends Phaser.Scene {
  constructor() {
    super("vila");
  }

  init() {
    this.finished = false;
    this.ending = false;
    this.shellCount = 0;
    this.stepTimer = 0;
    this.spawnGrace = 0.4;
    this.gathering = false;
    this.revealed = false;
    this.lastCaption = null;
    this.pendingTap = null;
    this.lastDialogueId = "";
  }

  create() {
    clearInput();
    document.body.classList.remove("is-title");
    const progress = readProgress();
    const wallet = readWallet();
    const collected = new Set(wallet.run.ids);
    this.shellCount = LEVEL.shells.filter((s) => collected.has(s.id)).length;
    const storySaved = {
      ...(progress?.story || {}),
      toninho: Boolean(progress?.story?.toninho || (progress?.talks || []).includes("toninho")),
    };

    this.physics.world.gravity.y = LEVEL.physics.gravity;
    this.physics.world.setBounds(0, 0, LEVEL.width, 1500);
    this.parallax = new ParallaxManager(this, LEVEL);
    this.seagulls = new SeagullSystem(this, LEVEL);
    this.cc0 = new VilaCC0FX(this, LEVEL);
    this.hq = new HQPanel(this, 84);
    this.hqBack = this.add.graphics().setScrollFactor(0).setDepth(85.5).setVisible(false);
    this.hqBack.fillStyle(0x0b2a44, 0.82).fillRoundedRect(180, 24, 1560, 220, 18);
    this.praiaT = 3; this.creakT = 2;
    this.drawArtHints();

    this.solids = this.physics.add.staticGroup();
    for (const box of LEVEL.colliders) this.addSolid(box);
    for (const obstacle of LEVEL.obstacles) {
      if (obstacle.kind === "low-beam") this.addSolid(obstacle);
    }

    this.story = new StoryDirector(LEVEL, storySaved);
    const startX = progress?.checkpointX || LEVEL.spawn.x;
    this.player = new Marina(this, startX, LEVEL.groundY, LEVEL.physics);
    this.player.lock = false;
    this.physics.add.collider(this.player.sprite, this.solids);
    this.cameras.main.setBackgroundColor("#79c6f5");
    this.cameras.main.scrollX = Math.max(0, startX - 700);
    this.cameraRig = new CameraController(this, LEVEL);
    this.talk = new InteractionSystem(LEVEL.talks, progress?.talks || []);
    this.audio = this.registry.get("audio") || new AudioManager();
    this.registry.set("audio", this.audio);
    this.audio.bindLevel(LEVEL);
    this.audio.unlock();
    this.checkpoints = new CheckpointSystem(this, LEVEL, progress?.checkpointX || null);
    this.hud = new HUD(this);
    this.hud.setShells(this.shellCount, LEVEL.shells.length, wallet.carteira);
    this.visual = new VisualFX(this, LEVEL);
    this.visual.track(this.player.sprite, 1.25);
    this.wind = new WindLife(this, LEVEL);

    this.shells = this.physics.add.group({ allowGravity: false });
    for (const shell of LEVEL.shells) {
      if (collected.has(shell.id)) continue;
      const sprite = this.physics.add.sprite(shell.x, shell.y, "shell");
      const gold = shell.gold || shell.secret;
      sprite.setScale(gold ? 0.26 : 0.16);
      if (gold) sprite.setTint(0xffe08a);
      sprite.setData("value", gold ? 5 : 1);
      sprite.body.setAllowGravity(false);
      sprite.setDepth(12);
      sprite.setData("id", shell.id);
      this.shells.add(sprite);
      this.visual.watchShell(sprite);
      this.tweens.add({
        targets: sprite,
        y: shell.y - 14,
        duration: 900 + (shell.x % 400),
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }
    this.physics.add.overlap(this.player.sprite, this.shells, (_player, shell) => {
      this.collectShell(shell);
    });

    const gathered = this.story.gathered;
    const julia = LEVEL.actors.julia;
    const lucas = LEVEL.actors.lucas;
    const bia = LEVEL.actors.bia;
    const toninho = LEVEL.actors.toninho;
    this.julia = this.person("julia", gathered ? julia.gatherX : julia.x);
    this.lucas = this.person("lucas", gathered ? lucas.gatherX : lucas.x);
    this.bia = this.person("bia", gathered ? bia.gatherX : bia.x);
    this.toninho = this.person("toninho", toninho.x);

    const dog = LEVEL.actors.faisca;
    const dogX = this.story.gathered ? dog.gatherX : this.story.artifact ? dog.runTo : dog.x;
    this.faisca = this.add
      .sprite(dogX, LEVEL.groundY, "faisca", 0)
      .setOrigin(0.5, 0.9375)
      .setScale(CAST.faisca.scale)
      .setDepth(16);
    this.faisca.play("faisca-idle");
    this.faiscaX = dogX;
    this.visual.track(this.julia, 1.2);
    this.visual.track(this.lucas, 1.15);
    this.visual.track(this.bia, 1.15);
    this.visual.track(this.toninho, 1.35);
    this.visual.track(this.faisca, 0.48);

    this.placeProps();
    this.placeBoats();
    if (this.story.artifact && this.artifact) {
      this.artifact.setVisible(true);
      this.artifact.y = (LEVEL.pierTopY || LEVEL.groundY) + 2;
    }

    const captured = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Space",
      "ShiftLeft",
      "ShiftRight",
      "KeyA",
      "KeyD",
      "KeyW",
      "KeyS",
    ];
    this.input.keyboard.addCapture(captured);
    this.input.keyboard.enabled = true;
    this.onGameKeyDown = (event) => {
      keyDown(event.code);
      if (captured.includes(event.code)) event.preventDefault();
    };
    this.onGameKeyUp = (event) => keyUp(event.code);
    window.addEventListener("keydown", this.onGameKeyDown);
    window.addEventListener("keyup", this.onGameKeyUp);
    this.input.on("pointerdown", (pointer) => {
      this.audio.unlock();
      this.pendingTap = { x: pointer.worldX, y: pointer.worldY };
    });
    window.addEventListener("keydown", this.onUnlock, { once: true });
    this.bindProbe();
    this.onDebugKey = (event) => {
      if (event.code !== "KeyH" || event.repeat) return;
      const world = this.physics.world;
      const next = !(world.debugGraphic && world.drawDebug);
      if (!world.debugGraphic) world.createDebugGraphic();
      world.drawDebug = next;
      world.debugGraphic.setDepth(300).setVisible(world.drawDebug);
      if (!world.drawDebug) world.debugGraphic.clear();
      if (!this.debugLabel) this.debugLabel = this.add.text(960, 92, "DEBUG HITBOX (H)", { fontFamily: "monospace", fontSize: "20px", color: "#ff5ad1", backgroundColor: "#000a" }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(301);
      this.debugLabel.setVisible(world.drawDebug);
    };
    window.addEventListener("keydown", this.onDebugKey);
    this.paused = false;
    this.onPauseKey = (event) => {
      if ((event.code !== "Escape" && event.code !== "KeyP") || event.repeat || this.finished || this.__askMenu) return;
      this.setPaused(!this.paused);
    };
    window.addEventListener("keydown", this.onPauseKey);
    this.events.once("shutdown", () => {
      window.removeEventListener("keydown", this.onPauseKey);
      this.anims.resumeAll();
    });
    this.events.once("shutdown", () => window.removeEventListener("keydown", this.onDebugKey));
    this.refreshObjective();
    if (this.story.caption) this.hud.setReveal(this.story.caption);
    this.lastCaption = this.story.caption;
    this.cameras.main.fadeIn(400, 6, 16, 24);
    if (!this.story.artifact && !this.story.gathered) {
      this.time.delayedCall(900, () => this.audio.play("bark"));
    }
  }

  person(who, x) {
    const spec = CAST[who];
    const sprite = this.add
      .sprite(x, LEVEL.groundY, who, 0)
      .setOrigin(0.5, 0.9375)
      .setScale(spec.scale)
      .setDepth(14);
    sprite.play(`${who}-idle`);
    return sprite;
  }

  poseNpcs(dialogue) {
    if (this.gathering) return;
    const talking = dialogue?.name;
    for (const who of ["julia", "lucas", "bia", "toninho"]) {
      const sprite = this[who];
      if (!sprite) continue;
      const key = CAST[who].name === talking ? `${who}-interact` : `${who}-idle`;
      sprite.play(key, true);
      sprite.setFlipX(this.player.x < sprite.x);
    }
  }

  placeBoats() {
    this.boatImages = [];
    for (const boat of LEVEL.boats || []) {
      if (!this.textures.exists(boat.key)) continue;
      const image = this.add
        .image(Math.round(boat.x), LEVEL.groundY + 30, boat.key)
        .setOrigin(0.5, 0.85)
        .setDisplaySize(boat.w, boat.h)
        .setDepth(boat.depth || 11);
      this.boatImages.push({ image, left: boat.x - boat.w * 0.42, right: boat.x + boat.w * 0.42 });
      this.tweens.add({
        targets: image,
        angle: boat.rock || 1.5,
        y: image.y - (boat.bob || 8),
        duration: boat.period || 1800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }
  }

  /** Caixa opaca de uma textura (ignora margem transparente). Guardada em cache. */
  opaqueBounds(key) {
    this.boundsCache = this.boundsCache || {};
    if (this.boundsCache[key]) return this.boundsCache[key];
    const src = this.textures.get(key).getSourceImage();
    const w = src.width, h = src.height;
    const k = Math.min(1, 256 / Math.max(w, h));
    const cw = Math.max(1, Math.round(w * k)), ch = Math.max(1, Math.round(h * k));
    const c = document.createElement("canvas");
    c.width = cw; c.height = ch;
    const ctx = c.getContext("2d");
    ctx.drawImage(src, 0, 0, cw, ch);
    const data = ctx.getImageData(0, 0, cw, ch).data;
    let minX = cw, maxX = 0, maxY = 0, minY = ch;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      if (data[(y * cw + x) * 4 + 3] > 40) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y > maxY) maxY = y; if (y < minY) minY = y; }
    }
    const box = { cx: (minX + maxX + 1) / 2 / cw, bottom: (maxY + 1) / ch, wide: (maxX - minX + 1) / cw, top: minY / ch };
    this.boundsCache[key] = box;
    return box;
  }

  placeProps() {
    this.nets = null;
    this.artifact = null;
    for (const prop of LEVEL.props) {
      if (prop.id === "boat") {
        this.boat = this.add
          .image(prop.x, LEVEL.groundY + 10, prop.key)
          .setOrigin(0.5, 1)
          .setDisplaySize(prop.w, prop.h)
          .setDepth(11);
        this.tweens.add({
          targets: this.boat,
          y: LEVEL.groundY + 2,
          duration: 1600,
          yoyo: true,
          repeat: -1,
          ease: "Sine.inOut",
        });
        continue;
      }
      if (!this.textures.exists(prop.key)) continue;
      const floor = LEVEL.pierTopY || LEVEL.groundY;
      const box = this.opaqueBounds(prop.key);
      const floating = prop.id === "artifact";
      const image = this.add
        .image(prop.x, floating ? prop.y : floor, prop.key)
        .setOrigin(box.cx, floating ? 1 : box.bottom)
        .setDisplaySize(prop.w, prop.h)
        .setDepth(prop.id === "artifact" ? 17 : 8);
      if (!floating) {
        // Sombra de contato sob a base real do prop.
        this.add
          .ellipse(prop.x, floor + 2, prop.w * box.wide * 0.9, Math.max(10, prop.h * 0.07), 0x1a1208, 0.28)
          .setDepth(7);
      }
      if (prop.id === "nets") this.nets = image;
      if (prop.id === "artifact") {
        image.setVisible(false);
        this.artifact = image;
      }
    }
    if (!this.artifact) {
      const spec = LEVEL.props.find((prop) => prop.id === "artifact");
      this.artifact = this.add.circle(spec.x, spec.y, 16, 0xe2b657).setDepth(17).setVisible(false);
    }
  }

  bindProbe() {
    window.__controlsTest = {
      getX: () => this.player.x,
      getSpeed: () => this.player.sprite.body.velocity.x,
      getYaw: () => this.player.facing,
      setKeys: (codes) => setKeys(codes),
      step: (ms) => {
        this.update(this.game.loop.time, ms);
        this.physics.world.update(this.game.loop.time, ms);
        this.physics.world.postUpdate();
      },
      getDebug: () => {
        const body = this.player.sprite.body;
        return {
          x: this.player.x,
          y: this.player.y,
          vx: body.velocity.x,
          vy: body.velocity.y,
          grounded: body.blocked.down || body.touching.down,
          story: this.story.snapshot(),
        };
      },
    };
    this.events.once("shutdown", () => {
      clearInput();
      window.removeEventListener("keydown", this.onUnlock);
      window.removeEventListener("keydown", this.onGameKeyDown);
      window.removeEventListener("keyup", this.onGameKeyUp);
      if (window.__controlsTest?.getX === this.__probeGetX) delete window.__controlsTest;
    });
    this.__probeGetX = window.__controlsTest.getX;
  }

  onUnlock = () => {
    this.audio.unlock();
  };

  addSolid(box) {
    const rect = this.add.rectangle(box.x + box.w / 2, box.y + box.h / 2, box.w, box.h, 0x000000, 0);
    this.physics.add.existing(rect, true);
    this.solids.add(rect);
  }

  drawArtHints() {
    const g = this.add.graphics().setDepth(6);
    for (const hazard of LEVEL.hazards) {
      if (hazard.kind === "slippery") {
        g.fillStyle(0x9fd7ea, 0.28);
        g.fillRoundedRect(hazard.x, hazard.y, hazard.w, 28, 8);
      }
    }
    const beam = LEVEL.obstacles.find((item) => item.kind === "low-beam");
    if (beam) this.drawHangingNet(beam);
  }

  /** Rede pendurada entre dois postes, desenhada exatamente no retângulo da colisão. */
  drawHangingNet(beam) {
    const g = this.add.graphics().setDepth(15);
    const x0 = beam.x, x1 = beam.x + beam.w, top = beam.y, bot = beam.y + beam.h;
    const ground = LEVEL.groundY;
    // postes
    for (const px of [x0 - 6, x1 - 6]) {
      g.fillStyle(0x5b3a22, 1).fillRect(px, top - 40, 14, ground - top + 40);
      g.fillStyle(0x7a5232, 1).fillRect(px + 3, top - 40, 4, ground - top + 40);
    }
    // corda de cima
    g.lineStyle(6, 0x8d6a3e, 1).lineBetween(x0, top, x1, top);
    // malha com leve barriga
    const sag = (t) => Math.sin(Math.PI * t) * 6;
    g.lineStyle(2, 0x3f5a52, 0.95);
    const cols = 14, rows = 5;
    for (let i = 0; i <= cols; i++) {
      const t = i / cols; const x = x0 + t * beam.w;
      g.lineBetween(x, top, x + (i % 2 ? 4 : -4), bot - 4 + sag(t));
    }
    for (let j = 1; j <= rows; j++) {
      const y = top + (j / rows) * (beam.h - 4);
      g.beginPath();
      for (let i = 0; i <= cols; i++) { const t = i / cols; const yy = y + sag(t) * (j / rows) + (i % 2 ? 3 : -3); i ? g.lineTo(x0 + t * beam.w, yy) : g.moveTo(x0, yy); }
      g.strokePath();
    }
    // boias na barra de baixo
    for (let i = 1; i < 6; i++) {
      const t = i / 6; g.fillStyle(i % 2 ? 0xe36a3a : 0xf6e7c1, 1).fillCircle(x0 + t * beam.w, bot - 6 + sag(t), 7);
    }
    this.netGfx = g;
  }

  collectShell(shell) {
    if (shell.getData("got")) return;
    shell.setData("got", true);
    shell.disableBody(true, true);
    this.visual.collect(shell);
    this.cc0?.collect(shell.x, shell.y);
    this.shellCount += 1;
    const w = walletCollect(shell.getData("id"), shell.getData("value") || 1);
    this.hud.setShells(this.shellCount, LEVEL.shells.length, w.carteira);
    this.audio.play("shell");
    if ((shell.getData("value") || 1) > 1) {
      this.audio.synth?.("gold3");
      const t = this.add.text(shell.x, shell.y - 30, "+5", { fontFamily: "Georgia, serif", fontSize: "44px", color: "#FFE08A", stroke: "#1A1208", strokeThickness: 6 }).setOrigin(0.5).setDepth(30);
      this.tweens.add({ targets: t, y: shell.y - 130, alpha: 0, duration: 900, onComplete: () => t.destroy() });
    }
  }

  refreshObjective() {
    const zone = zoneAt(this.player.x);
    this.hud.setObjective(zone.name, this.story.objective());
  }

  pullNet() {
    this.faisca.play("faisca-run", true);
    this.tweens.add({
      targets: this.faisca,
      x: this.faisca.x - 70,
      duration: 700,
      onUpdate: () => {
        this.faiscaX = this.faisca.x;
      },
    });
    if (this.nets) {
      this.tweens.add({ targets: this.nets, angle: 10, yoyo: true, repeat: 3, duration: 120 });
    }
    this.audio.play("plank");
  }

  dropArtifact() {
    this.artifact.setVisible(true);
    this.tweens.add({
      targets: this.artifact,
      y: (LEVEL.pierTopY || LEVEL.groundY) + 2 - 0,
      duration: 520,
      ease: "Bounce.easeOut",
    });
  }

  gatherCast() {
    this.gathering = true;
    const cast = [
      [this.julia, LEVEL.actors.julia.gatherX, "julia"],
      [this.lucas, LEVEL.actors.lucas.gatherX, "lucas"],
      [this.bia, LEVEL.actors.bia.gatherX, "bia"],
      [this.faisca, LEVEL.actors.faisca.gatherX, "faisca"],
    ];
    let left = cast.length;
    for (const [sprite, x, who] of cast) {
      sprite.play(who === "faisca" ? "faisca-run" : `${who}-idle`, true);
      this.tweens.add({
        targets: sprite,
        x,
        duration: 2400,
        ease: "Sine.inOut",
        onComplete: () => {
          sprite.play(who === "faisca" ? "faisca-idle" : `${who}-idle`, true);
          if (who === "faisca") this.faiscaX = sprite.x;
          left -= 1;
          if (left <= 0) this.gathering = false;
        },
      });
    }
  }

  finishLevel() {
    if (this.finished) return;
    this.finished = true;
    this.player.lock = true;
    this.player.sprite.setVelocity(0, 0);
    this.audio.play("bell");
    this.playIris(() => {
      const payload = { nextLevel: LEVEL.nextLevel, from: LEVEL.id };
      this.registry.set("level-complete", payload);
      this.game.events.emit("level-complete", payload);
      // Fase 1 concluída: abre o portal do Mar e segue para a transição em HQ (resumo de conchas no fim)
      unlockFree("mar");
      clearProgress();
      document.body.classList.add("is-title");
      this.scene.start("transicao-hq");
    });
  }

  setPaused(on) {
    this.paused = on;
    if (on) {
      this.physics.world.pause();
      this.tweens.pauseAll();
      this.anims.pauseAll();
      clearInput();
    } else {
      this.physics.world.resume();
      this.tweens.resumeAll();
      this.anims.resumeAll();
    }
    if (!this.pauseText) {
      this.pauseShade = this.add.rectangle(960, 540, 1920, 1080, 0x061018, 0.55).setScrollFactor(0).setDepth(240);
      this.pauseText = this.add
        .text(960, 380, "PAUSA", { fontFamily: BTN_FONT, fontSize: "96px", color: "#fff3d6", stroke: "#4a2a14", strokeThickness: 14, align: "center" })
        .setOrigin(0.5).setScrollFactor(0).setDepth(241);
      this.pauseBtns = [
        ...makeButton(this, 960, 560, "CONTINUAR", () => this.setPaused(false), { w: 620, h: 88, depth: 242, scrollFactor: 0, kind: "continuar" }).objs,
        ...makeButton(this, 960, 690, "MENU PRINCIPAL", () => askMainMenu(this, { onYes: () => { this.setPaused(false); document.body.classList.add("is-title"); this.scene.start("menu"); } }), { w: 620, h: 88, depth: 242, scrollFactor: 0, kind: "menu" }).objs,
        this.add.text(960, 800, "Esc ou P: continuar", { fontFamily: "Georgia, serif", fontSize: "26px", color: "#F6E7C1" }).setOrigin(0.5).setScrollFactor(0).setDepth(241),
      ];
    }
    this.pauseShade.setVisible(on);
    this.pauseText.setVisible(on);
    this.pauseBtns.forEach((o) => o.setVisible(on));
  }

  /** Botões da tela final: jogar de novo e menu (toque, mouse e teclado). */
  showEndButtons() {
    document.body.classList.add("is-title");
    this.hud.complete.setY(380);
    const make = (x, text, _color, action) => { const t = text.replace(/^[^A-Za-zÀ-ú]+/, "").toUpperCase(); return makeButton(this, x, 780, t, action, { w: 600, h: 88, depth: 230, scrollFactor: 0, kind: /MENU/.test(t) ? "menu" : /NOVO/.test(t) ? "jogar_de_novo" : "continuar" }).objs; };
    let leaving = false;
    const leave = (target) => () => {
      if (leaving) return;
      leaving = true;
      clearProgress();
      try { navigator.vibrate && navigator.vibrate(15); } catch {}
      this.audio.play("ui_confirm");
      if (target === "menu") this.scene.start("menu");
      else if (target === "boss") this.cameras.main.fadeOut(500, 0, 0, 0), this.time.delayedCall(520, () => this.scene.start("boss-polvo", { segment: 0 }));
      else { newRun(); this.scene.restart(); }
    };
    const replay = leave("vila");
    const menu = leave("menu");
    const cont = leave("boss");
    this.continueToBoss = cont;
    this.endButtons = [...make(960, "▶  Continuar → Fase 2", 0x1f5f8f, cont).map((o) => o.setY(o.y - 0)), ...make(330, "↻  Jogar de novo", 0x2f7a4a, replay), ...make(1590, "⌂  Menu", 0xc45c26, menu)];
    this.add
      .text(960, 915, "C: continuar   ·   Enter: jogar de novo   ·   Esc: menu", { fontFamily: "Georgia, serif", fontSize: "24px", color: "#F6E7C1" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(231)
      .setAlpha(0.8);
    const armedAt = performance.now() + 400;
    this.onEndKey = (event) => {
      if (performance.now() < armedAt) return;
      if (event.code === "KeyC") cont();
      else if (event.code === "Enter" || event.code === "NumpadEnter" || event.code === "KeyR") replay();
      else if (event.code === "Escape" || event.code === "Backspace") menu();
    };
    window.addEventListener("keydown", this.onEndKey);
    this.events.once("shutdown", () => window.removeEventListener("keydown", this.onEndKey));
  }

  playIris(onDone) {
    const key = "fx-iris";
    if (this.textures.exists(key)) this.textures.remove(key);
    const tex = this.textures.createCanvas(key, 1920, 1080);
    this.add.image(960, 540, key).setScrollFactor(0).setDepth(210);
    const paint = (k) => {
      const ctx = tex.getContext();
      const cam = this.cameras.main;
      const sx = (LEVEL.goal.x - cam.scrollX) * cam.zoom;
      const sy = (LEVEL.groundY - 200 - cam.scrollY) * cam.zoom;
      ctx.clearRect(0, 0, 1920, 1080);
      ctx.fillStyle = "#061018";
      ctx.fillRect(0, 0, 1920, 1080);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(0, 1200 * (1 - k)), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      tex.refresh();
    };
    const state = { k: 0 };
    paint(0);
    this.tweens.add({
      targets: state,
      k: 1,
      duration: 900,
      ease: "Sine.easeIn",
      onUpdate: () => paint(state.k),
      onComplete: () => {
        paint(1);
        onDone();
      },
    });
  }

  update(_time, deltaMs) {
    if (this.paused) return;
    const dt = Math.min(0.05, deltaMs / 1000);
    if (this.finished) {
      this.cameraRig.update(dt, this.player);
      this.parallax.update(_time);
      this.wind?.update(dt, _time);
      return;
    }

    const actions = computeActions();
    if (actions.warp) {
      const warp = (LEVEL.testWarps || []).find((item) => item.key === actions.warp);
      if (warp) {
        this.player.sprite.setPosition(warp.x, LEVEL.groundY);
        this.player.sprite.setVelocity(0, 0);
        this.cameras.main.scrollX = Math.max(0, warp.x - 760);
      }
    }
    if (actions.mutePressed) this.hud.setMuted(this.audio.toggleMute());
    const tap = this.pendingTap;
    this.pendingTap = null;
    const pressed = Boolean(actions.interactPressed || tap);
    const storyPatch = this.story.update(dt, pressed && !this.finished);
    this.applyListed(storyPatch.actions);
    if (storyPatch.dirty) writeProgress({ story: this.story.snapshot() });

    const dog = LEVEL.actors.faisca;
    const faiscaReady = this.faiscaX >= dog.runTo - 12;
    const nearBia = Math.abs(this.player.x - this.bia.x) < LEVEL.actors.bia.radius;
    const nearToninho = Math.abs(this.player.x - this.toninho.x) < LEVEL.actors.toninho.radius;
    const nearFaisca = Math.abs(this.player.x - this.faisca.x) < 190;
    const canTalk = this.story.mode === "play" && !storyPatch.lock && !storyPatch.consumed;
    let started = false;
    if (canTalk && pressed && nearBia && faiscaReady && !this.story.artifact) {
      this.applyListed(this.story.beginScene("bia_redes"));
      started = true;
    } else if (canTalk && pressed && nearBia && this.story.artifact) {
      this.applyListed(this.story.beginScene("bia_depois"));
      started = true;
    } else if (canTalk && pressed && nearToninho && !this.story.artifact) {
      this.applyListed(this.story.beginScene("toninho_bom_dia"));
      started = true;
    } else if (canTalk && pressed && nearToninho && this.story.artifact && !this.story.toninho) {
      this.applyListed(this.story.beginScene("toninho_artefato"));
      started = true;
    } else if (canTalk && pressed && nearFaisca && !nearBia) {
      this.applyListed(this.story.beginScene("faisca_latido"));
      this.audio.play("bark");
      started = true;
    }

    const talkPatch =
      !canTalk || started
        ? { prompt: "", dialogue: null, finishedId: null }
        : this.talk.update(this.player, actions, tap, { gathered: true });
    if (talkPatch.finishedId) writeProgress({ talks: this.talk.doneIds() });

    let prompt = talkPatch.prompt;
    if (!storyPatch.dialogue && !talkPatch.dialogue && !storyPatch.caption) {
      const beam = LEVEL.obstacles.find((item) => item.kind === "low-beam");
      if (
        beam &&
        this.player.state !== "CROUCH" &&
        this.player.x > beam.x - 120 &&
        this.player.x < beam.x + 40
      ) {
        prompt = "↓  ·  Agache para passar sob a rede";
      } else if (nearBia && !this.story.artifact && !faiscaReady) {
        prompt = "A Faísca ainda vem em quatro patas";
      } else if (nearBia && !this.story.artifact && faiscaReady) {
        prompt = "E  ·  A rede da Faísca";
      } else if (nearBia && this.story.artifact) {
        prompt = "E  ·  Bia";
      } else if (nearToninho && !this.story.artifact) {
        prompt = "E  ·  Seu Toninho";
      } else if (nearToninho && !this.story.toninho) {
        prompt = "E  ·  Mostrar o artefato";
      } else if (nearFaisca) {
        prompt = "E  ·  Faísca";
      } else if (this.player.x > LEVEL.goal.x - 220 && !this.story.toninho) {
        prompt = "O Esperança só parte depois do Seu Toninho";
      }
    }

    this.player.lock = Boolean(this.story.lock || talkPatch.dialogue || this.story.dialogue);
    this.player.slippery = LEVEL.hazards.some(
      (hazard) =>
        hazard.kind === "slippery" &&
        this.player.x > hazard.x &&
        this.player.x < hazard.x + hazard.w &&
        this.player.y > hazard.y - 40,
    );
    const netBeam = LEVEL.obstacles.find((item) => item.kind === "low-beam");
    let moveActions = actions;
    if (
      netBeam &&
      this.player.x > netBeam.x - 56 &&
      this.player.x < netBeam.x + netBeam.w + 56 &&
      (this.player.state === "CROUCH" || actions.down)
    ) {
      // Sob a rede: continua agachada mesmo soltando o botão.
      moveActions = { ...actions, down: true, jump: false, jumpPressed: false };
    }
    this.player.update(dt, moveActions);
    if (this.player.x < 60) this.player.sprite.x = 60;
    if (this.player.x > LEVEL.width - 80) this.player.sprite.x = LEVEL.width - 80;

    const beam = LEVEL.obstacles.find((item) => item.kind === "low-beam");
    if (
      beam &&
      this.player.state !== "CROUCH" &&
      this.player.sprite.body.velocity.x > 0 &&
      this.player.x > beam.x - 54 &&
      this.player.x < beam.x + 40
    ) {
      this.player.sprite.x = beam.x - 54;
      this.player.sprite.setVelocityX(0);
    }

    this.spawnGrace -= dt;
    if (this.spawnGrace <= 0 && this.player.y > (LEVEL.killY || 1200)) {
      this.checkpoints.respawn(this.player);
    }

    const scripted = this.story.mode !== "play" || this.gathering;
    const talking = (this.story.dialogue || talkPatch.dialogue)?.name;
    if (talking === "Faísca") {
      this.faisca.play("faisca-interact", true);
      this.faisca.setFlipX(this.player.x < this.faisca.x);
    } else if (!scripted && !this.story.artifact && this.faiscaX < dog.runTo) {
      this.faisca.play("faisca-run", true);
      this.faiscaX = Math.min(dog.runTo, this.faiscaX + dog.speed * dt);
      this.faisca.x = this.faiscaX;
      this.faisca.setFlipX(false);
    } else if (!scripted) {
      this.faisca.play("faisca-idle", true);
      this.faisca.setFlipX(this.player.x < this.faisca.x);
    }
    if (!this.gathering) this.poseNpcs(this.story.dialogue || talkPatch.dialogue);

    this.talk.setX("julia", this.julia.x);
    this.talk.setX("lucas", this.lucas.x);
    this.talk.setX("toninho", this.toninho.x);

    // Barco em primeiro plano fica ~75% opaco quando a Marina passa atrás.
    for (const boat of this.boatImages) {
      const behind = this.player.x > boat.left && this.player.x < boat.right;
      const target = behind ? 0.75 : 1;
      if (boat.image.alpha !== target) boat.image.alpha += (target - boat.image.alpha) * Math.min(1, dt * 10) + (Math.abs(target - boat.image.alpha) < 0.01 ? target - boat.image.alpha : 0);
    }
    this.checkpoints.update(this.player);
    this.cameraRig.update(dt, this.player);
    this.parallax.update(_time);
    this.seagulls.update(dt);
    this.stepTimer -= dt;
    const moving = this.player.wasGrounded && Math.abs(this.player.sprite.body.velocity.x) > 40;
    if (moving && this.stepTimer <= 0 && !this.player.jumpedThisFrame && !this.player.landedThisFrame) {
      this.audio.step(this.player.x);
      this.visual.puff(this.player.x, this.player.y);
      this.stepTimer = this.player.state === "RUN" ? 0.22 : 0.34;
    }
    if (this.player.jumpedThisFrame) this.audio.play("jump");
    if (this.player.landedThisFrame) {
      this.audio.play("land");
      this.cc0?.land(this.player.x, this.player.sprite.y + (this.player.sprite.displayHeight || 0) * 0.45, this.audio.surfaceAt?.(this.player.x) === "wood");
    }
    // apoio CC0: vapor no mercado, gotas na fonte, anéis na água, brilho da concha dourada
    if (this.cc0?.update(dt, this.cameras.main, this.artifact, LEVEL.pierTopY || LEVEL.groundY) && this.player.x > 8600 && Math.random() < 0.35) this.audio.play("splash", { volume: 0.35 });
    if (this.cc0?.windGust) { this.cc0.windGust = false; this.audio.play("vento", { volume: 0.3 }); }
    // ondas no píer (cais em diante) e rangido da madeira ao andar nas tábuas
    if (this.player.x > 8600 && (this.praiaT -= dt) <= 0) { this.praiaT = 4 + Math.random() * 4; this.audio.play("praia", { volume: 0.55 }); }
    if (moving && this.audio.surfaceAt?.(this.player.x) === "wood" && (this.creakT -= dt) <= 0) { this.creakT = 2.5 + Math.random() * 3; this.audio.play("rangido", { volume: 0.4 }); }
    const cam = this.cameras.main;
    this.audio.update(dt, cam.scrollX + cam.width / (2 * cam.zoom));
    this.visual.update(dt, _time);
    this.wind.update(dt, _time);

    if (
      this.story.mode === "play" &&
      this.story.toninho &&
      !this.story.boarded &&
      this.player.x >= LEVEL.goal.x - 50
    ) {
      this.applyListed(this.story.beginScene("toninho_embarcar"));
    }

    // HQ em tela cheia durante as falas das cenas que têm quadro correspondente
    const hqKey = this.story.mode === "scene" && (this.story.dialogue || this.story.caption) ? HQ_F1[this.story.sceneId]?.[this.story.index] : null;
    if (hqKey && this.textures.exists(`hq_${hqKey}`)) this.hq.show(`hq_${hqKey}`); else if (this.hq.visible) this.hq.hide();
    this.hq.update(dt);
    this.hqBack.setVisible(this.hq.visible && Boolean(this.story.caption));
    const caption = this.story.caption;
    if (caption !== this.lastCaption) {
      this.lastCaption = caption;
      this.hud.setReveal(caption || "");
    }
    const dialogue = this.story.dialogue || talkPatch.dialogue;
    const dialogueId = dialogue ? `${dialogue.name}:${dialogue.step}:${dialogue.text}` : "";
    if (dialogueId !== this.lastDialogueId) {
      if (dialogueId && !this.lastDialogueId) this.audio.play("ui_open");
      else if (dialogueId) this.audio.play("ui_next");
      else this.audio.play("ui_close");
      this.lastDialogueId = dialogueId;
    }
    this.audio.setDialogue(Boolean(dialogue || caption));
    this.hud.setDialogue(dialogue);
    this.hud.setCinematic(Boolean(dialogue || caption));
    this.hud.setPrompt(dialogue || caption ? "" : prompt);
    this.refreshObjective();

    if (!this.revealed && this.player.x >= LEVEL.reveal.x && this.story.mode === "play") {
      this.revealed = true;
      this.cameraRig.reveal(LEVEL.reveal.zoom, LEVEL.reveal.seconds);
      if (!this.story.caption && !this.story.dialogue) {
        this.hud.setReveal(LEVEL.reveal.caption);
        this.lastCaption = LEVEL.reveal.caption;
        this.time.delayedCall(LEVEL.reveal.seconds * 1000, () => {
          if (this.lastCaption === LEVEL.reveal.caption) {
            this.hud.setReveal("");
            this.lastCaption = "";
          }
        });
      }
    }
  }

  applyListed(list) {
    if (!Array.isArray(list)) return;
    for (const action of list || []) {
      if (action === "pull") this.pullNet();
      if (action === "clinc") {
        this.audio.clinc();
        this.visual.clinc(this.artifact);
      }
      if (action === "drop") this.dropArtifact();
      if (action === "gather") this.gatherCast();
      if (action === "complete") this.finishLevel();
    }
  }
}
