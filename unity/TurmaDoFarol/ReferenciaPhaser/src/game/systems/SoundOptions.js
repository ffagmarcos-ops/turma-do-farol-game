// @ts-nocheck
/**
 * SOM / OPÇÕES: sliders MÚSICA e EFEITOS (0-100%) + botão SOM LIGADO/MUDO.
 * Mesmo cartão de HQ do "Voltar ao menu", botões do Matheus, fonte Luckiest Guy.
 * Salva em localStorage ("farol-som") e aplica na hora (AudioManager.setPrefs).
 */
import { makeButton, BTN_FONT } from "./UIButton.js";
import { AudioManager } from "./AudioManager.js";
const W = 1920, H = 1080;
export function openSoundOptions(scene, { depth = 320, onClose } = {}) {
  if (scene.__som) return scene.__som;
  let audio = scene.registry.get("audio");
  if (!audio) { audio = new AudioManager(); scene.registry.set("audio", audio); }
  const prefs = audio.loadPrefs();
  const objs = [], offs = [];
  const add = (o) => { o.setScrollFactor?.(0); objs.push(o); return o; };
  add(scene.add.rectangle(W / 2, H / 2, W + 1200, H + 1200, 0x02060c, 0.72).setDepth(depth).setInteractive());
  add(scene.add.rectangle(W / 2, H / 2, 1000, 640, 0xf3e6c8).setDepth(depth + 0.9));
  if (scene.textures.exists("carta_moldura")) add(scene.add.image(W / 2, H / 2, "carta_moldura").setDisplaySize(1220, 820).setDepth(depth + 1));
  const T = (x, y, s, size, color = "#fff3d6", stroke = "#4a2a14") => add(scene.add.text(x, y, s, { fontFamily: BTN_FONT, fontSize: `${size}px`, color, stroke, strokeThickness: Math.round(size / 6) }).setOrigin(0.5).setDepth(depth + 2));
  T(W / 2, H / 2 - 250, "SOM", 64);
  const slider = (y, label, key) => {
    const x0 = W / 2 - 190, len = 460;
    T(W / 2 - 330, y, label, 38);
    add(scene.add.rectangle(x0 + len / 2, y, len, 18, 0x4a2a14).setDepth(depth + 2));
    const fill = add(scene.add.rectangle(x0, y, 1, 18, 0xe8a23a).setOrigin(0, 0.5).setDepth(depth + 2.1));
    const knob = add(scene.add.circle(x0, y, 30, 0xfff3d6).setStrokeStyle(8, 0x4a2a14).setDepth(depth + 2.2));
    const pct = T(x0 + len + 75, y, "", 32);
    const draw = (v) => { fill.width = Math.max(1, v * len); knob.x = x0 + v * len; pct.setText(`${Math.round(v * 100)}%`); };
    draw(prefs[key]);
    // área de toque grande (100 px de altura) para dedo
    const hit = add(scene.add.rectangle(x0 + len / 2, y, len + 80, 100, 0, 0.001).setDepth(depth + 2.3).setInteractive({ useHandCursor: true }));
    let drag = false;
    const set = (p) => {
      const v = Math.round(Math.max(0, Math.min(1, (p.x - x0) / len)) * 20) / 20;
      if (v === prefs[key]) return;
      audio.setPrefs({ [key]: v }); draw(v);
      if (key === "sfx") audio.play?.("ui_hover", { volume: 0.6 });
    };
    hit.on("pointerdown", (p) => { drag = true; set(p); });
    const mv = (p) => { if (drag && p.isDown) set(p); }, up = () => { drag = false; };
    scene.input.on("pointermove", mv); scene.input.on("pointerup", up);
    offs.push(() => { scene.input.off("pointermove", mv); scene.input.off("pointerup", up); });
    return { draw };
  };
  slider(H / 2 - 110, "MÚSICA", "music");
  slider(H / 2 + 10, "EFEITOS", "sfx");
  let muteBtn;
  const muteLabel = () => (audio.muted ? "SOM: MUDO" : "SOM: LIGADO");
  const toggle = () => { audio.setPrefs({ muted: !audio.muted }); muteBtn.text.setText(muteLabel()); };
  muteBtn = makeButton(scene, W / 2 - 240, H / 2 + 170, muteLabel(), toggle, { w: 440, h: 88, depth: depth + 2, scrollFactor: 0, fontSize: 30, kind: "menu" });
  const close = () => {
    window.removeEventListener("keydown", onKey, true);
    offs.forEach((f) => f());
    objs.forEach((o) => o.destroy());
    scene.__som = null;
    onClose?.();
  };
  const back = makeButton(scene, W / 2 + 240, H / 2 + 170, "VOLTAR", () => { audio.play?.("ui_back"); close(); }, { w: 440, h: 88, depth: depth + 2, scrollFactor: 0, fontSize: 30, kind: "continuar" });
  objs.push(...muteBtn.objs, ...back.objs);
  const onKey = (e) => { if (e.code === "Escape" || e.code === "Backspace") { e.stopImmediatePropagation?.(); close(); } else if (e.code === "KeyM") toggle(); };
  setTimeout(() => { if (scene.__som) window.addEventListener("keydown", onKey, true); }, 80);
  scene.events.once("shutdown", () => window.removeEventListener("keydown", onKey, true));
  scene.__som = { close, toggle };
  return scene.__som;
}
