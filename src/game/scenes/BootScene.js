// @ts-nocheck
/**
 * Boot leve: carrega SÓ o que a tela de carregamento usa (fundo 960x540 da página 09 ~60 KB,
 * ícone de concha 22 KB) e espera a fonte Luckiest Guy (máx. 1,5 s). Depois abre o PreloadScene.
 */
import Phaser from "../phaser.js";
export class BootScene extends Phaser.Scene {
  constructor() { super("boot"); }
  preload() {
    this.load.image("loading_bg", "assets/farol/ui/loading_bg.jpg");
    this.load.image("icone_concha_hud", "assets/farol/fase3/ui/icone_concha_hud.png");
  }
  create() {
    const font = document.fonts?.load ? Promise.race([document.fonts.load('40px "Luckiest Guy"'), new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
    font.catch(() => {}).then(() => this.scene.start("preload"));
  }
}
