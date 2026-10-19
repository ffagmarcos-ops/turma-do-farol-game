// @ts-nocheck
import Phaser from "../phaser.js";
import { PORTRAITS, F2_ASSETS } from "../data/AssetManifest.js";
import marinaSpec from "../data/sheets/marina_sheet.json";
import lucasSpec from "../data/sheets/lucas_sheet.json";
import juliaSpec from "../data/sheets/julia_sheet.json";
import biaSpec from "../data/sheets/bia_sheet.json";
import toninhoSpec from "../data/sheets/toninho_sheet.json";
import faiscaSpec from "../data/sheets/faisca_sheet.json";

const CAST = [
  ["marina", marinaSpec],
  ["lucas", lucasSpec],
  ["julia", juliaSpec],
  ["bia", biaSpec],
  ["toninho", toninhoSpec],
  ["faisca", faiscaSpec],
];

let FILES = null;
function probe(url) {
  if (FILES === null) {
    try {
      const x = new XMLHttpRequest();
      x.open("GET", "assets/files.json", false);
      x.send();
      FILES = x.status >= 200 && x.status < 300 ? new Set(JSON.parse(x.responseText)) : false;
    } catch {
      FILES = false;
    }
  }
  if (FILES) return FILES.has(url.replace(/^\.?\//, ""));
  try {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, false);
    xhr.send();
    return xhr.status >= 200 && xhr.status < 300;
  } catch {
    return false;
  }
}

const ART = [
  ["bg_sky", "assets/farol/bg/sky_01_seamless.png", "assets/farol/bg/sky.png"],
  ["bg_village_far", "assets/farol/bg/village_far_pano.png", null],
  ["bg_village_mid", "assets/farol/bg/village_mid_pano.png", null],
  ["bg_harbor", "assets/farol/bg/harbor_03_v2.png", null],
  ["bg_sea", "assets/farol/bg/sea.png", null],
  ["pier_tile", "assets/farol/props/pier_tile.png", null],
  ["boat_esperanca", "assets/farol/props/boat_esperanca.png", "assets/farol/props/esperanca.png"],
  ["artifact", "assets/farol/props/artifact.png", null],
  ["crate", "assets/farol/props/crate.png", null],
  ["nets", "assets/farol/props/nets.png", null],
  ["market_stall", "assets/farol/props/market_stall.png", null],
  ["fountain", "assets/farol/props/fountain.png", null],
  ["fg_near", "assets/farol/props/foreground.png", null],
];

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("preload");
  }

  preload() {
    // tela de carregamento: página 09 da HQ escurecida, título em Luckiest Guy creme/marrom e conchas como progresso
    const LG = '"Luckiest Guy", Georgia, serif';
    if (this.textures.exists("loading_bg")) this.add.image(960, 540, "loading_bg").setDisplaySize(1920, 1080).setTint(0x6a6f7a);
    this.add.rectangle(960, 540, 1920, 1080, 0x05080c, 0.35);
    this.add.text(960, 330, "TURMA DO FAROL", { fontFamily: LG, fontSize: "120px", color: "#fff3d6", stroke: "#4a2a14", strokeThickness: 18 }).setOrigin(0.5);
    this.add.text(960, 450, "O Mistério da Ilha do Farol", { fontFamily: LG, fontSize: "48px", color: "#fff3d6", stroke: "#4a2a14", strokeThickness: 10 }).setOrigin(0.5);
    const N = 10, shells = [];
    for (let i = 0; i < N; i++) {
      const x = 960 + (i - (N - 1) / 2) * 92;
      shells.push(this.textures.exists("icone_concha_hud") ? this.add.image(x, 680, "icone_concha_hud").setDisplaySize(70, 70).setAlpha(0.25).setTint(0x8a7a6a) : this.add.circle(x, 680, 26, 0xf2c14e, 0.25));
    }
    const pct = this.add.text(960, 790, "Carregando… 0%", { fontFamily: LG, fontSize: "40px", color: "#fff3d6", stroke: "#4a2a14", strokeThickness: 8 }).setOrigin(0.5);
    let lit = 0;
    this.load.on("progress", (value) => {
      const n = Math.floor(value * N + 0.0001);
      while (lit < n) {
        const s = shells[lit++];
        s.setAlpha(1).clearTint?.();
        this.tweens.add({ targets: s, y: 650, yoyo: true, duration: 160, ease: "Quad.easeOut" });
      }
      pct.setText(`Carregando… ${Math.round(value * 100)}%`);
    });
    // a próxima concha "respira" enquanto carrega
    this.tweens.add({ targets: pct, alpha: 0.7, yoyo: true, repeat: -1, duration: 700 });
    this.load.on("loaderror", (file) => {
      console.error("Falha ao carregar", file.key, file.src);
    });

    this.artFile = {};
    for (const [key, primary, fallback] of ART) {
      const file = probe(primary);
      const url = file ? primary : fallback;
      this.artFile[key] = file;
      if (url) this.load.image(key, url);
    }

    this.load.image("shell", "assets/farol/props/shell.png");
    // botões padrão do jogo (arte provisória aprovada: botao_portais normal/realce)
    // botões finais do Matheus (aprovados pelo Daniel): 480x88, normal/hover/pressed, sem texto
    for (const k of ["portais", "continuar", "jogar_de_novo", "menu", "jogar"]) for (const st of ["normal", "hover", "pressed"]) this.load.image(`btn_${k}_${st}`, `assets/farol/fase3/ui/botoes/btn_${k}_${st}.png`);
    // CC0 Fase 1 (curadoria Daniel 18/10): bolhas e twirl (vento)
    for (const [k, f] of [["cc0f1_bolhas1", "bolhas1"], ["cc0f1_bolhas2", "bolhas2"], ["cc0f1_twirl1", "twirl_01"], ["cc0f1_twirl2", "twirl_02"], ["cc0f1_twirl3", "twirl_03"]]) {
      const url = `assets/farol/cc0_f3/fase1/${f}.png`;
      if (probe(url)) this.load.image(k, url);
    }
    // quadros da HQ (págs. 1-5) mostrados em tela cheia nos diálogos da Fase 1
    for (const k of ["P01_Q01", "P02_Q01", "P02_Q02", "P02_Q03", "P02_Q04", "P02_Q05", "P03_Q01", "P03_Q02", "P03_Q03", "P03_Q04", "P04_Q01", "P04_Q02", "P04_Q03", "P04_Q04", "P04_Q05", "P05_Q01", "P05_Q04", "P05_Q05", "P06_Q01", "P07_Q01", "P07_Q05", "P08_Q03", "P08_Q05"]) {
      const url = `assets/farol/hq/${k}.jpg`;
      if (probe(url)) this.load.image(`hq_${k}`, url);
    }
    this.load.image("menu_capa", "assets/farol/ui/menu_capa.png");
    this.load.image("carta_moldura", "assets/farol/fase3/curio/carta_moldura.png"); // moldura das ilustrações da HQ
    const gullSheet = "assets/farol/props/seagull_sheet.png";
    this.gullSheet = probe(gullSheet);
    if (this.gullSheet) {
      this.load.spritesheet("seagull", gullSheet, { frameWidth: 256, frameHeight: 499 });
    } else if (probe("assets/farol/ui/fx/seagull.png")) {
      this.load.image("seagull", "assets/farol/ui/fx/seagull.png");
    }

    const marinaSheet = "assets/farol/chars/marina_sheet_1536.png";
    this.marinaSheet = probe(marinaSheet);
    // andar/correr v2 do Daniel (tira de 8 quadros, qualquer resolução: o tamanho do quadro sai do arquivo)
    this.marinaV2 = ["walk", "run", "jump"].filter((k) => probe(`assets/farol/chars/marina_${k}_v2.png`));
    for (const k of this.marinaV2) this.load.image(`marina_${k}_v2`, `assets/farol/chars/marina_${k}_v2.png`);
    for (const [name] of CAST) {
      const url = `assets/farol/chars/${name}_sheet_1536.png`;
      if (probe(url)) this.load.spritesheet(name, url, { frameWidth: 192, frameHeight: 256 });
    }
    if (!this.marinaSheet) {
      this.load.image("marina_idle_0", "assets/farol/chars/marina_idle_0.png");
      for (let i = 0; i < 5; i++) {
        this.load.image(`marina_walk_${i}`, `assets/farol/chars/marina_walk_${i}.png`);
      }
      this.load.image("marina_jump_0", "assets/farol/chars/marina_jump_0.png");
    }
    this.f2Found = [];
    for (const item of F2_ASSETS) {
      const url = `assets/farol/fase2/${item.file}`;
      if (!probe(url)) continue;
      this.f2Found.push(item.key);
      if (item.frame) this.load.spritesheet(item.key, url, { frameWidth: item.frame[0], frameHeight: item.frame[1] });
      else this.load.image(item.key, url);
    }
    // Fase 2: artes já existentes, escurecidas para a tempestade (fallback até a arte nova).
    for (const [k, f] of [["r2_sky", "sky_storm.jpg"], ["r2_farol", "farol_ilha.png"], ["r2_sea", "sea_band.png"], ["r2_boat", "boat_night.png"]]) {
      this.load.image(k, `assets/farol/fase2_reuse/${f}`);
    }
    for (const c of ["intro1", "intro3", "entrada", "p75", "p50", "p25", "p0", "curva", "epilogo", "gancho"]) {
      this.load.image(`cut_${c}`, `assets/farol/fase2_reuse/cut_${c}.jpg`);
    }
    for (const portrait of PORTRAITS) {
      const url = `assets/farol/${portrait.file}`;
      if (probe(url)) this.load.image(portrait.key, url);
    }
  }

  create() {
    this.registry.set("art:pier_tile", this.artFile.pier_tile ? "file" : "fallback");
    if (!this.anims.exists("marina-idle")) {
      for (const [name, spec] of CAST) {
        if (this.textures.exists(name)) this.addSheet(name, spec);
      }
      if (this.textures.exists("marina")) this.addMarinaV2();
      if (!this.textures.exists("marina")) {
        this.anims.create({
          key: "marina-idle",
          frames: [{ key: "marina_idle_0" }],
          frameRate: 6,
          repeat: -1,
        });
        this.anims.create({
          key: "marina-walk",
          frames: [0, 1, 2, 3, 4].map((i) => ({ key: `marina_walk_${i}` })),
          frameRate: 10,
          repeat: -1,
        });
        this.anims.create({
          key: "marina-run",
          frames: [0, 1, 2, 3, 4].map((i) => ({ key: `marina_walk_${i}` })),
          frameRate: 14,
          repeat: -1,
        });
        this.anims.create({
          key: "marina-jump",
          frames: [{ key: "marina_jump_0" }],
          frameRate: 12,
          repeat: 0,
        });
        this.anims.create({
          key: "marina-fall",
          frames: [{ key: "marina_jump_0" }],
          frameRate: 8,
          repeat: -1,
        });
        this.anims.create({
          key: "marina-land",
          frames: [{ key: "marina_idle_0" }],
          frameRate: 12,
          repeat: 0,
        });
        this.anims.create({
          key: "marina-crouch",
          frames: [{ key: "marina_idle_0" }],
          frameRate: 8,
          repeat: 0,
        });
        this.anims.create({
          key: "marina-interact",
          frames: [{ key: "marina_idle_0" }],
          frameRate: 6,
          repeat: 0,
        });
      }
      if (this.gullSheet) {
        this.anims.create({
          key: "seagull-fly",
          frames: this.anims.generateFrameNumbers("seagull", { start: 0, end: 5 }),
          frameRate: 10,
          repeat: -1,
        });
      }
    }
    // fonte dos botões (Luckiest Guy): espera carregar antes de criar textos (máx. 2,5 s)
    const fontReady = document.fonts?.load ? Promise.race([document.fonts.load('40px "Luckiest Guy"'), new Promise((r) => setTimeout(r, 2500))]) : Promise.resolve();
    fontReady.catch(() => {}).then(() => this.startFirst());
  }

  startFirst() {
    const params = new URLSearchParams(window.location.search);
    this.registry.set("f2:found", this.f2Found || []);
    if (params.has("boss")) {
      document.body.classList.remove("is-title");
      this.scene.start("boss-polvo", { segment: Number(params.get("boss")) || 0 });
    } else if (params.has("fase3")) {
      // dev: ?fase3 (último checkpoint) · ?fase3=A2 · ?fase3=novo
      document.body.classList.remove("is-title");
      this.scene.start("fase3", { cp: params.get("fase3") || undefined });
    } else this.scene.start(params.has("qa") || params.has("play") ? "vila" : "menu");
  }

  /** Troca marina-walk / marina-run pelas tiras v2 (8 quadros; largura do quadro = largura do arquivo / 8). */
  addMarinaV2() {
    for (const k of this.marinaV2 || []) {
      const key = `marina_${k}_v2`;
      if (!this.textures.exists(key)) continue;
      const tex = this.textures.get(key), src = tex.getSourceImage();
      const fw = Math.floor(src.width / 8), fh = src.height;
      for (let i = 0; i < 8; i++) tex.add(i, 0, i * fw, 0, fw, fh);
      const mk = (name, frames, frameRate, repeat) => {
        this.anims.remove(name);
        this.anims.create({ key: name, frames: frames.map((frame) => ({ key, frame })), frameRate, repeat });
      };
      if (k === "jump") {
        // pulo v2: 1-3 impulso/subida, 4 ápice, 5 queda, 6-7 aterrissagem (0 = agachar, não usado: o pulo sai na hora)
        mk("marina-jump", [1, 2, 3], 12, 0);
        mk("marina-fall", [4, 5], 8, 0);
        mk("marina-land", [6, 7], 12, 0);
      } else mk(`marina-${k}`, [0, 1, 2, 3, 4, 5, 6, 7], 12, -1);
    }
  }

  addSheet(name, spec) {
    const fallback = spec.fallback || {};
    const poses = { ...spec.anims };
    for (const [pose, frame] of Object.entries(fallback)) {
      if (!poses[pose]) poses[pose] = { frames: [frame], frameRate: 8, repeat: -1 };
    }
    for (const [pose, clip] of Object.entries(poses)) {
      const key = `${name}-${pose}`;
      if (this.anims.exists(key)) continue;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(name, { frames: clip.frames }),
        frameRate: clip.frameRate,
        repeat: clip.repeat,
      });
    }
  }
}
