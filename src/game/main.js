// @ts-nocheck
import Phaser from "./phaser.js";
import { BootScene } from "./scenes/BootScene.js";
import { PreloadScene } from "./scenes/PreloadScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { VilaScene } from "./scenes/VilaScene.js";
import { BossScene } from "./scenes/BossScene.js";
import { IntroHQScene, TransicaoHQScene } from "./scenes/HQSeqScene.js";
import { PortaisScene } from "./scenes/PortaisScene.js";
import { CreditosScene } from "./scenes/CreditosScene.js";
import { CuriosidadeScene } from "./scenes/CuriosidadeScene.js";

export function createGame(parent) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1920,
    height: 1080,
    backgroundColor: "#7ec8e8",
    fps: { target: 60, min: 30 },
    render: { antialias: true, pixelArt: false },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1920,
      height: 1080,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 1800 },
        debug: false,
      },
    },
    scene: [BootScene, PreloadScene, MenuScene, VilaScene, BossScene, IntroHQScene, TransicaoHQScene, PortaisScene, CuriosidadeScene, CreditosScene],
  });

  const root = typeof parent === "string" ? document.getElementById(parent) : parent;
  const meter = document.createElement("div");
  meter.style.cssText =
    "display:none;position:absolute;top:8px;left:8px;z-index:40;padding:4px 8px;font:600 14px/1 ui-monospace,monospace;color:#f6e7c1;background:rgba(6,16,24,.55);pointer-events:none";
  if (root) {
    if (getComputedStyle(root).position === "static") root.style.position = "relative";
    root.appendChild(meter);
  }
  let shown = false;
  const onKey = (event) => {
    if (event.code !== "KeyF" || event.repeat) return;
    const tag = event.target && event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    shown = !shown;
    meter.style.display = shown ? "block" : "none";
  };
  window.addEventListener("keydown", onKey, true);
  game.events.on("step", () => {
    if (!shown) return;
    meter.textContent = `FPS ${Math.round(game.loop.actualFps)}`;
  });
  game.events.once("destroy", () => {
    window.removeEventListener("keydown", onKey, true);
    meter.remove();
  });
  return game;
}
