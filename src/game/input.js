// @ts-nocheck
/** Shared keyboard + touch actions. One compute() per frame. */

const keys = new Set();
const touch = {
  left: false,
  right: false,
  down: false,
  run: false,
  jump: false,
  interact: false,
};

const prev = { jump: false, interact: false, mute: false };
const heldDigits = new Set();

export function keyDown(code) {
  keys.add(code);
}

export function keyUp(code) {
  keys.delete(code);
}

export function clearInput() {
  keys.clear();
  touch.left = false;
  touch.right = false;
  touch.down = false;
  touch.run = false;
  touch.jump = false;
  touch.interact = false;
  prev.jump = false;
  prev.interact = false;
  prev.mute = false;
  heldDigits.clear();
}

/** QA / controls probe: replace held key codes until the next call. */
export function setKeys(codes) {
  keys.clear();
  for (const code of codes) keys.add(code);
}

export function setTouch(name, down) {
  if (name in touch) touch[name] = down;
}

export function computeActions() {
  const left = keys.has("ArrowLeft") || keys.has("KeyA") || touch.left;
  const right = keys.has("ArrowRight") || keys.has("KeyD") || touch.right;
  const down = keys.has("ArrowDown") || keys.has("KeyS") || touch.down;
  const run = keys.has("ShiftLeft") || keys.has("ShiftRight") || touch.run;
  const jump =
    keys.has("Space") || keys.has("ArrowUp") || keys.has("KeyW") || touch.jump;
  const interact = keys.has("KeyE") || keys.has("Enter") || touch.interact;

  const mute = keys.has("KeyM");
  const digits = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5"];
  const warp = digits.find((code) => keys.has(code) && !heldDigits.has(code)) || null;

  const actions = {
    left,
    right,
    down,
    run,
    jump,
    interact,
    jumpPressed: jump && !prev.jump,
    jumpReleased: !jump && prev.jump,
    interactPressed: interact && !prev.interact,
    mutePressed: mute && !prev.mute,
    warp,
  };
  prev.jump = jump;
  prev.interact = interact;
  prev.mute = mute;
  heldDigits.clear();
  for (const code of digits) if (keys.has(code)) heldDigits.add(code);
  return actions;
}

/** Fase 2: leitura direta de teclas e toque. */
export function isDown(code) {
  return keys.has(code);
}

export function getTouch() {
  return touch;
}
