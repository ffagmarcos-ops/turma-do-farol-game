// @ts-nocheck
/**
 * Controles da Fase 3: teclado (input.js compartilhado), gamepad (API padrão do navegador) e toque
 * (botões do index.html: o botão de ação vira CONCHA; toque curto = concha, segurar = latido).
 */
import { isDown, getTouch } from "../input.js";

const any = (codes) => codes.some((c) => isDown(c));
const TOUCH_HOLD = 0.3;

export const LABELS = {
  kbd: { move: "← →", up: "↑ / W", run: "Shift", jump: "Espaço", attack: "J", special: "K", down: "↓" },
  pad: { move: "o direcional", up: "↑", run: "LB", jump: "A", attack: "X", special: "Y", down: "↓" },
  touch: { move: "◀ ▶", up: "⤒", run: null, jump: "⤒", attack: "🐚", special: "🐚 (segure)", down: "▼" },
};

export class Fase3Input {
  constructor() {
    this.prev = { jump: false, attack: false, special: false, pause: false };
    this.device = "kbd";
    this.touchT = 0; this.touchWas = false;
  }
  pad() {
    const list = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of list || []) if (p && p.connected) return p;
    return null;
  }
  read(dt) {
    const t = getTouch();
    const p = this.pad();
    const b = (i) => Boolean(p && p.buttons[i] && p.buttons[i].pressed);
    const ax = p ? p.axes[0] || 0 : 0, ay = p ? p.axes[1] || 0 : 0;
    const padLeft = b(14) || ax < -0.35, padRight = b(15) || ax > 0.35;
    const k = {
      left: any(["ArrowLeft", "KeyA"]), right: any(["ArrowRight", "KeyD"]),
      up: any(["ArrowUp", "KeyW"]), down: any(["ArrowDown", "KeyS"]),
      space: isDown("Space"),
      run: any(["ShiftLeft", "ShiftRight"]), jump: any(["Space", "ArrowUp", "KeyW"]),
      attack: any(["KeyJ", "KeyX"]), special: any(["KeyK", "KeyC"]),
    };
    const pd = {
      left: padLeft, right: padRight, up: b(12) || ay < -0.5, down: b(13) || ay > 0.6, run: b(4) || b(6) || Math.abs(ax) > 0.88,
      jump: b(0), attack: b(2), special: b(3) || b(5) || b(7), pause: b(9),
    };
    // toque: botão de ação = concha (curto) / latido (segurar)
    let tAttack = false, tSpecial = false;
    if (t.interact) { this.touchT += dt; if (this.touchT >= TOUCH_HOLD) tSpecial = true; }
    else { if (this.touchWas && this.touchT < TOUCH_HOLD) tAttack = true; this.touchT = 0; }
    this.touchWas = t.interact;
    const tc = { left: t.left, right: t.right, up: t.jump, down: t.down, run: t.run, jump: t.jump };

    const anyKbd = Object.values(k).some(Boolean), anyPad = Object.values(pd).some(Boolean), anyTouch = t.left || t.right || t.jump || t.interact || t.down;
    if (anyPad) this.device = "pad"; else if (anyTouch) this.device = "touch"; else if (anyKbd) this.device = "kbd";

    const jump = k.jump || pd.jump || tc.jump;
    const spaceOrPadJump = k.space || pd.jump || tc.jump;
    const attackHeld = k.attack || pd.attack;
    const special = k.special || pd.special || tSpecial;
    const pause = pd.pause;
    const a = {
      left: k.left || pd.left || tc.left,
      right: k.right || pd.right || tc.right,
      up: k.up || pd.up || tc.up,
      down: k.down || pd.down || tc.down,
      run: k.run || pd.run || tc.run,
      jump,
      jumpPressed: jump && !this.prev.jump,
      jumpOffPressed: spaceOrPadJump && !this.prev.spaceOrPadJump,
      jumpReleased: !jump && this.prev.jump,
      attackPressed: (attackHeld && !this.prev.attack) || tAttack,
      special,
      specialReleased: !special && this.prev.special,
      pausePressed: pause && !this.prev.pause,
      device: this.device,
    };
    this.prev = { jump, spaceOrPadJump, attack: attackHeld, special, pause };
    return a;
  }
}

/** Troca {tokens} pelo nome do botão do controle atual; remove trechos sem botão (ex.: correr no toque). */
export function hintText(text, device) {
  const L = LABELS[device] || LABELS.kbd;
  return text.split(" · ").filter((part) => !(/\{(\w+)\}/g.test(part) && [...part.matchAll(/\{(\w+)\}/g)].some((m) => L[m[1]] === null)))
    .map((part) => part.replace(/\{(\w+)\}/g, (_, t) => L[t] ?? t)).join(" · ");
}
