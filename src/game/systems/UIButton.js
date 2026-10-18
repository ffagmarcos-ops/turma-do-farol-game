// @ts-nocheck
/**
 * Botão padrão do jogo: arte final do Matheus (btn_<tipo>_normal/hover/pressed, 480x88) como 9-slice
 * horizontal (ponta esquerda 30% = 144 px, direita 14% = 67 px). Texto no miolo em Luckiest Guy creme
 * #fff3d6, contorno #4a2a14; no pressed o texto desce 4 px. Tipos: portais, continuar, jogar_de_novo, menu, jogar.
 */
export const BTN_FONT = '"Luckiest Guy", Georgia, serif';
const L = 144, R = 67;
export function makeButton(scene, x, y, label, onClick, opts = {}) {
  const w = Math.max(opts.w ?? 480, L + R + 40), h = opts.h ?? 88, depth = opts.depth ?? 3, sf = opts.scrollFactor ?? 1;
  const kind = opts.kind ?? "menu";
  const key = (st) => `btn_${kind}_${st}`;
  const audio = () => scene.registry.get("audio");
  const has = scene.textures.exists(key("normal"));
  const bg = has
    ? scene.add.nineslice(x, y, key("normal"), undefined, w, h, L, R, 0, 0)
    : scene.add.rectangle(x, y, w, h, 0x8a5a2a, 1).setStrokeStyle(4, 0x4a2a14);
  bg.setDepth(depth).setScrollFactor(sf).setInteractive({ useHandCursor: true });
  const mid = has ? (L - R) / 2 : 0; // centro do miolo, entre as pontas
  const fs = opts.fontSize ?? Math.round(h * 0.42);
  const text = scene.add.text(x + mid, y, label, { fontFamily: BTN_FONT, fontSize: `${fs}px`, color: "#fff3d6", stroke: "#4a2a14", strokeThickness: Math.max(4, Math.round(fs / 6)) })
    .setOrigin(0.5).setDepth(depth + 0.01).setScrollFactor(sf);
  const maxW = w - L - R - 16;
  if (text.width > maxW) text.setScale(maxW / text.width);
  const ty0 = text.y;
  const set = (state) => {
    if (has) bg.setTexture(key(state));
    text.setY(ty0 + (state === "pressed" ? 4 : 0));
  };
  const btn = { bg, text, focused: false };
  bg.on("pointerover", () => { set("hover"); audio()?.play("ui_hover", { volume: 0.5 }); });
  bg.on("pointerout", () => set(btn.focused ? "hover" : "normal"));
  bg.on("pointerdown", () => { set("pressed"); audio()?.play("ui_click"); });
  bg.on("pointerup", (p, lx, ly, ev) => { set("hover"); ev?.stopPropagation?.(); onClick?.(); });
  btn.setFocus = (on) => { btn.focused = on; set(on ? "hover" : "normal"); };
  btn.setText = (t) => { text.setText(t).setScale(1); if (text.width > maxW) text.setScale(maxW / text.width); };
  btn.setVisible = (v) => { bg.setVisible(v); text.setVisible(v); return btn; };
  btn.destroy = () => { bg.destroy(); text.destroy(); };
  btn.objs = [bg, text];
  return btn;
}
