// @ts-nocheck
/**
 * "Voltar ao MENU PRINCIPAL?" — confirmação simples, igual em todas as fases e no hub.
 * As conchas já coletadas seguem as regras de save atuais (a carteira já foi gravada na coleta).
 * Esc ou "CANCELAR" fecha; "SIM, IR AO MENU" chama onYes.
 */
import { makeButton, BTN_FONT } from "./UIButton.js";
const W = 1920, H = 1080;
export function askMainMenu(scene, { depth = 300, onYes, onNo } = {}) {
  if (scene.__askMenu) return;
  const objs = [];
  const shade = scene.add.rectangle(W / 2, H / 2, W + 1200, H + 1200, 0x02060c, 0.7).setScrollFactor(0).setDepth(depth).setInteractive();
  const card = scene.textures.exists("carta_moldura")
    ? scene.add.image(W / 2, H / 2, "carta_moldura").setDisplaySize(1100, 690).setScrollFactor(0).setDepth(depth + 1)
    : scene.add.rectangle(W / 2, H / 2, 1000, 560, 0xf1e2bf).setStrokeStyle(8, 0x6b4a26).setScrollFactor(0).setDepth(depth + 1);
  const paper = scene.add.rectangle(W / 2, H / 2, 900, 520, 0xf3e6c8).setScrollFactor(0).setDepth(depth + 0.9);
  const t1 = scene.add.text(W / 2, H / 2 - 120, "Voltar ao menu principal?", { fontFamily: BTN_FONT, fontSize: "56px", color: "#fff3d6", stroke: "#4a2a14", strokeThickness: 10 }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);
  const t2 = scene.add.text(W / 2, H / 2 - 30, "As conchas já coletadas continuam na sua carteira.", { fontFamily: "Georgia, serif", fontSize: "30px", color: "#3a2412", align: "center", wordWrap: { width: 760 } }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);
  objs.push(shade, paper, card, t1, t2);
  const close = () => {
    window.removeEventListener("keydown", onKey);
    objs.forEach((o) => o.destroy());
    scene.__askMenu = null;
  };
  const yes = () => { close(); onYes?.(); };
  const no = () => { close(); scene.registry.get("audio")?.play("ui_back"); onNo?.(); };
  const onKey = (e) => { if (e.code === "Escape" || e.code === "Backspace") no(); };
  objs.push(...makeButton(scene, W / 2 - 230, H / 2 + 120, "CANCELAR", no, { w: 420, h: 84, depth: depth + 2, scrollFactor: 0, fontSize: 30, kind: "continuar" }).objs);
  objs.push(...makeButton(scene, W / 2 + 230, H / 2 + 120, "IR AO MENU", yes, { w: 420, h: 84, depth: depth + 2, scrollFactor: 0, fontSize: 30, kind: "menu" }).objs);
  setTimeout(() => { if (scene.__askMenu) window.addEventListener("keydown", onKey); }, 80);
  scene.events.once("shutdown", () => window.removeEventListener("keydown", onKey));
  scene.__askMenu = { close, yes, no };
  return scene.__askMenu;
}
