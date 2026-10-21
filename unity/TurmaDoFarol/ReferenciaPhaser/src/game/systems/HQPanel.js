// @ts-nocheck
/**
 * Ilustração da HQ em tela cheia DENTRO da moldura (carta_moldura), escala "contain" (nada cortado), fundo escuro, fade-in/fade-out suave
 * e um Ken Burns leve (zoom lento a partir do topo, para os rostos não subirem para baixo da caixa
 * de diálogo, que fica no topo da tela, y 24-244). anchor = fração do excesso vertical cortada em cima.
 */
const W = 1920, H = 1080;
export const HQ_ANCHOR = {
  // Fase 2
  cut_intro1: 0.55, cut_p0: 0.06, cut_p50: 0.12, cut_p75: 0.12, cut_epilogo: 0.45, hq_p09: 0.16,
  // Fase 1 (quadros 4:3: cabeças ficam abaixo da caixa com o recorte quase no topo)
  hq_P01_Q01: 0.3, hq_P02_Q05: 0.0, hq_P03_Q01: 0.0, hq_P04_Q05: 0.0, hq_P05_Q04: 0.0,
};
/** Moldura da HQ (carta_moldura 1600x1000 esticada na tela): vão útil, onde a ilustração entra INTEIRA (contain). */
export const HQ_FRAME = { cx: 965, cy: 540, w: 1480, h: 770 };
export function containScale(scene, key) {
  const src = scene.textures.get(key).getSourceImage();
  return Math.min(HQ_FRAME.w / src.width, HQ_FRAME.h / src.height);
}
/** Fundo escuro (a própria ilustração em cover, escurecida) + moldura; a ilustração fica por cima, sem cortes. */
export function makeHQBackdrop(scene, depth, sf = 0) {
  const solid = scene.add.rectangle(W / 2, H / 2, W + 400, H + 400, 0x05080c, 1).setScrollFactor(sf).setDepth(depth - 0.001).setAlpha(0).setVisible(false);
  const bg = scene.add.image(W / 2, H / 2, "__WHITE").setScrollFactor(sf).setDepth(depth).setTint(0x3a3c42).setAlpha(0).setVisible(false);
  const fr = scene.textures.exists("carta_moldura") ? scene.add.image(W / 2, H / 2, "carta_moldura").setDisplaySize(W, H).setScrollFactor(sf).setDepth(depth + 0.001).setAlpha(0).setVisible(false) : null;
  return {
    bg, fr,
    set(key) {
      if (!key || !scene.textures.exists(key)) return;
      const src = scene.textures.get(key).getSourceImage();
      bg.setTexture(key).setScale(Math.max(W / src.width, H / src.height) * 1.04);
    },
    alpha(a) { solid.setAlpha(a).setVisible(a > 0); bg.setAlpha(a * 0.55).setVisible(a > 0); fr?.setAlpha(a).setVisible(a > 0); },
  };
}
export class HQPanel {
  constructor(scene, depth = 99) {
    this.s = scene;
    this.back = makeHQBackdrop(scene, depth - 0.05);
    this.a = scene.add.image(W / 2, 0, "__WHITE").setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(depth).setAlpha(0).setVisible(false);
    this.b = scene.add.image(W / 2, 0, "__WHITE").setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(depth - 0.01).setAlpha(0).setVisible(false);
    this.key = null; this.t = 0; this.fadeOut = 0;
  }
  fit(img, key) {
    // contain dentro da moldura: a ilustração inteira aparece, sem cortes (pedido do Marcos)
    const sc = containScale(this.s, key);
    img.setTexture(key).setScale(sc).setPosition(HQ_FRAME.cx, HQ_FRAME.cy);
    img.base = sc;
    img.y0 = HQ_FRAME.cy;
    this.back.set(key);
  }
  show(key) {
    if (!key || !this.s.textures.exists(key)) return this.hide();
    if (this.key === key && this.a.visible) return;
    // o painel anterior vira "fantasma" e some em fade
    if (this.a.visible && this.a.alpha > 0) {
      this.b.setTexture(this.a.texture.key).setScale(this.a.scaleX).setPosition(this.a.x, this.a.y).setAlpha(this.a.alpha).setVisible(true);
      this.fadeOut = 1;
    }
    this.key = key; this.t = 0;
    this.fit(this.a, key);
    this.a.setAlpha(0).setVisible(true);
  }
  hide() {
    if (!this.key) return;
    this.b.setTexture(this.a.texture.key).setScale(this.a.scaleX).setPosition(this.a.x, this.a.y).setAlpha(this.a.alpha).setVisible(true);
    this.fadeOut = 1;
    this.a.setVisible(false).setAlpha(0);
    this.key = null;
  }
  get visible() { return Boolean(this.key); }
  update(dt) {
    if (this.key) {
      this.t += dt;
      // fade-in 0.45 s; zoom de 1.00 a ~1.06 em 10 s (centro horizontal, topo fixo)
      const k = Math.min(1, this.t / 0.45);
      this.a.setAlpha(k).setScale(this.a.base).setY(this.a.y0);
      this.back.alpha(Math.max(k, this.fadeOut));
    } else if (this.fadeOut > 0) this.back.alpha(this.fadeOut);
    else this.back.alpha(0);
    if (this.fadeOut > 0) {
      this.fadeOut = Math.max(0, this.fadeOut - dt / 0.4);
      this.b.setAlpha(this.b.alpha * 0 + this.fadeOut * (this.b.alphaStart ?? 1));
      if (this.fadeOut <= 0) this.b.setVisible(false);
    }
  }
}
