// @ts-nocheck
import Phaser from "../phaser.js";
import { makeButton } from "../systems/UIButton.js";
import { openSoundOptions } from "../systems/SoundOptions.js";
import { AudioManager } from "../systems/AudioManager.js";
import { readWallet, newRun, markSeen } from "../systems/Wallet.js";
import { readProgress } from "../systems/CheckpointSystem.js";

const W = 1920;
const H = 1080;

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  preload() {
  }

  create() {
    document.body.classList.add("is-title");
    const bg = this.add.image(W / 2, H / 2, "menu_capa").setOrigin(0.5).setDepth(0);
    const cover = Math.max(W / bg.width, H / bg.height);
    bg.setScale(cover);

    this.add.rectangle(W / 2, H / 2, W, H, 0x061018, 0.32).setDepth(1);

    this.add
      .text(W / 2, 250, "O Mistério da Ilha do Farol", {
        fontFamily: "Georgia, serif",
        fontSize: "68px",
        color: "#FFF8EA",
        align: "center",
        stroke: "#1A1208",
        strokeThickness: 10,
      })
      .setOrigin(0.5)
      .setDepth(3);
    this.add
      .text(W / 2, 340, "Fase 01  ·  Vila das Conchas", {
        fontFamily: "Georgia, serif",
        fontSize: "30px",
        color: "#F3D48A",
        stroke: "#1A1208",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(3);

    const wallet = readWallet();
    // tema do menu (CC0: "Treasure Hunter", TAD) — o hub tem o próprio tema
    { const au = this.registry.get("audio") || new AudioManager(); this.registry.set("audio", au); au.useSceneMusic(this, "assets/audio/menu/musica_menu.ogg"); }

    const showPortais = wallet.ganhoTotal > 0 || wallet.portas.length > 1;
    const jogarY = showPortais ? 840 : 900;

    let leaving = false;
    const leave = (fn) => {
      if (leaving) return;
      leaving = true;
      const audio = this.registry.get("audio") || new AudioManager();
      this.registry.set("audio", audio);
      audio.unlock();
      audio.play("ui_confirm");
      this.cameras.main.fadeOut(400, 6, 16, 24);
      let started = false;
      const go = () => { if (started) return; started = true; fn(); };
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, go);
      this.time.delayedCall(700, go);
    };
    const enter = () => leave(() => {
      // sem checkpoint salvo = run nova (as 120 conchas voltam ao mapa); checkpoint = mesma run
      if (!readProgress()?.checkpointX) newRun();
      if (!readWallet().vistos.includes("intro")) this.scene.start("intro-hq", { longa: true, back: "vila" }); // Marcos: intro longa na 1ª vez
      else { document.body.classList.remove("is-title"); this.scene.start("vila"); }
    });
    const portais = () => leave(() => this.scene.start("portais", { list: false }));
    this.enterGame = enter; this.enterPortais = portais;
    makeButton(this, W / 2, jogarY, "JOGAR", enter, { kind: "jogar" });
    this.openSom = () => openSoundOptions(this);
    makeButton(this, 220, 1010, "SOM", this.openSom, { kind: "menu", w: 300, h: 72, fontSize: 30 });
    this.input.keyboard?.on("keydown-O", this.openSom);
    makeButton(this, 1700, 1010, "CRÉDITOS", () => leave(() => this.scene.start("creditos", { back: "menu" })), { kind: "menu", w: 360, h: 72, fontSize: 30 });
    const kEnter = () => { if (!this.__som) enter(); };
    this.input.keyboard?.on("keydown-ENTER", kEnter);
    this.input.keyboard?.on("keydown-SPACE", kEnter);
    // o toque vale só nos botões (antes, tocar em qualquer lugar começava o jogo)
    if (showPortais) {
      // botão de bronze do Daniel (normal / realce), sem texto na arte
      const pbtn = makeButton(this, W / 2 - 250, 950, `PORTAIS · ${wallet.carteira}`, portais, { kind: "portais", w: 460 });
      // lista de portais direto do menu (mesmo modo lista do hub, mesmas regras de compra)
      const lista = () => leave(() => this.scene.start("portais", { list: true }));
      this.enterLista = lista;
      makeButton(this, W / 2 + 250, 950, "LISTA DE PORTAIS", lista, { kind: "portais", w: 460 });
      this.input.keyboard?.on("keydown-L", lista);
      const pb = pbtn.bg;
      this.input.keyboard?.on("keydown-P", portais);
      if (!wallet.vistos.includes("menu-portais")) {
        // primeira vez: brilho + sussurro de vento
        markSeen("menu-portais");
        this.tweens.add({ targets: [pb], scaleX: 1.08, scaleY: 1.08, yoyo: true, repeat: 3, duration: 380 });
        const glow = this.add.circle(W / 2 - 450, 950, 40, 0x7fe3d9, 0.6).setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({ targets: glow, scale: 2.4, alpha: 0, duration: 1400, repeat: 2 });
      }
    } else {
      // dica: concha brilhante na areia da capa
      const sh = this.add.image(1580, 1000, "shell").setScale(0.14).setTint(0xffe08a).setDepth(3).setInteractive({ useHandCursor: true });
      this.tweens.add({ targets: sh, alpha: 0.5, yoyo: true, repeat: -1, duration: 800 });
      const tip = this.add.text(1580, 940, "", { fontFamily: "Georgia, serif", fontSize: "24px", color: "#FFF8EA", stroke: "#1A1208", strokeThickness: 5, align: "center" }).setOrigin(0.5, 1).setDepth(4);
      sh.on("pointerdown", () => tip.setText("Junte conchas na Vila...\nalgo se abre no farol."));
    }
    const hint = this.add
      .text(W / 2, 1040, "Toque em Jogar ou aperte Enter para começar", {
        fontFamily: "Georgia, serif",
        fontSize: "24px",
        color: "#FFF8EA",
        stroke: "#1A1208",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(4);
    this.tweens.add({ targets: hint, alpha: 0.35, duration: 900, yoyo: true, repeat: -1 });
  }
}
