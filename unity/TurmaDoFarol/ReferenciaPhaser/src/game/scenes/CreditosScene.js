// @ts-nocheck
import Phaser from "../phaser.js";
import { makeButton, BTN_FONT } from "../systems/UIButton.js";
import CREDITOS from "../data/creditos.json";
const W = 1920, H = 1080;
/** Tela de CRÉDITOS: página de HQ (carta_moldura) com rolagem. data.back = cena de retorno. */
export class CreditosScene extends Phaser.Scene {
  constructor() { super("creditos"); }
  init(d) { this.back = d?.back || "menu"; }
  preload() { if (!this.textures.exists("carta_moldura")) this.load.image("carta_moldura", "assets/farol/fase3/curio/carta_moldura.png"); }
  create() {
    document.body.classList.add("is-title");
    this.add.rectangle(W / 2, H / 2, W, H, 0x061018);
    for (let i = 0; i < 40; i++) this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(1, 3), 0xf2c14e, 0.35);
    this.add.image(W / 2, H / 2 - 20, "carta_moldura").setDisplaySize(1500, 960);
    this.add.text(W / 2, 120, "CRÉDITOS", { fontFamily: BTN_FONT, fontSize: "76px", color: "#fff3d6", stroke: "#4a2a14", strokeThickness: 12 }).setOrigin(0.5).setDepth(5);
    const c = this.add.container(W / 2, 0);
    const ink = "#3a2412", T = (y, s, o = {}) => { const t = this.add.text(0, y, s, { fontFamily: "Georgia, serif", fontSize: "28px", color: ink, align: "center", wordWrap: { width: 1140 }, lineSpacing: 6, ...o }).setOrigin(0.5, 0); c.add(t); return y + t.height; };
    let y = 0;
    y = T(y, "Obrigado aos game designers", { fontFamily: BTN_FONT, fontSize: "44px", color: "#7a3d12" }) + 14;
    y = T(y, "Marcos Oliveira\nMatheus Oliveira", { fontFamily: BTN_FONT, fontSize: "64px", color: "#4a2a14", lineSpacing: 12 }) + 50;
    y = T(y, "— Sons, efeitos e fonte —", { fontFamily: BTN_FONT, fontSize: "36px", color: "#7a3d12" }) + 8;
    y = T(y, "Assets externos em domínio público (CC0), com agradecimento aos autores:", { fontStyle: "italic", fontSize: "24px" }) + 24;
    for (const e of CREDITOS) {
      y = T(y, e.autor, { fontStyle: "bold", fontSize: "30px" });
      y = T(y, `${e.obras.join(" · ")}${e.obras.length ? " — " : ""}${e.lic}`, { fontSize: "23px", color: "#5a3a20" }) + 18;
    }
    y = T(y + 20, "Luckiest Guy © Astigmatic, sob a Apache License 2.0\n(texto da licença em assets/fonts/LICENSE_LuckiestGuy_Apache2.txt)", { fontSize: "22px", fontStyle: "italic" }) + 30;
    y = T(y, "Turma do Farol · obrigado por jogar!", { fontFamily: BTN_FONT, fontSize: "40px", color: "#7a3d12" });
    const top = 210, bot = 880, maskG = this.make.graphics().fillRect(W / 2 - 640, top, 1280, bot - top);
    c.setMask(maskG.createGeometryMask());
    this.minY = bot - y - 20; this.maxY = top + 40; c.y = this.maxY; this.cont = c;
    this.auto = true;
    const scroll = (d) => { this.auto = false; c.y = Phaser.Math.Clamp(c.y - d, this.minY, this.maxY); };
    this.input.on("wheel", (p, o, dx, dy) => scroll(dy));
    this.input.on("pointermove", (p) => { if (p.isDown) scroll(p.prevPosition.y - p.y); });
    this.input.keyboard?.on("keydown-DOWN", () => scroll(80)); this.input.keyboard?.on("keydown-UP", () => scroll(-80));
    const voltar = () => { this.registry.get("audio")?.play("ui_back"); this.scene.start(this.back); };
    makeButton(this, W / 2, 985, "VOLTAR", voltar, { kind: "menu", depth: 10 });
    this.input.keyboard?.on("keydown-ESC", voltar);
    window.__creditos = this;
  }
  update(t, dt) { if (this.auto && this.cont.y > this.minY) this.cont.y -= dt * 0.045; }
}
