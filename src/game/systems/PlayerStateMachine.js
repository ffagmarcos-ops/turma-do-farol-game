// @ts-nocheck
/**
 * Estados da Marina, separados da integração física.
 * Quadros que ainda não existem caem no fallback indicado.
 */
export const POSES = {
  IDLE: { key: "marina-idle", fallback: "marina-idle", frameRate: 6 },
  WALK: { key: "marina-walk", fallback: "marina-walk", frameRate: 12 },
  RUN: { key: "marina-run", fallback: "marina-walk", frameRate: 14 },
  JUMP_START: { key: "marina-jump", fallback: "marina-jump", frameRate: 12 },
  JUMP: { key: "marina-jump", fallback: "marina-jump", frameRate: 12 },
  FALL: { key: "marina-fall", fallback: "marina-jump", frameRate: 8 },
  LAND: { key: "marina-land", fallback: "marina-idle", frameRate: 12 },
  CROUCH: { key: "marina-crouch", fallback: "marina-land", frameRate: 4 },
  INTERACT: { key: "marina-interact", fallback: "marina-idle", frameRate: 6 },
};

export class PlayerStateMachine {
  constructor() {
    this.state = "IDLE";
    this.wasGrounded = false;
    this.landMs = 0;
    this.jumpStartMs = 0;
  }

  update(dt, sense) {
    const ms = dt * 1000;
    let next = this.state;

    if (sense.locked) {
      next = "INTERACT";
    } else if (sense.jumped) {
      next = "JUMP_START";
      this.jumpStartMs = 0;
    } else if (!sense.grounded && sense.vy < -80) {
      if (this.state === "JUMP_START") {
        this.jumpStartMs += ms;
        next = this.jumpStartMs > 70 ? "JUMP" : "JUMP_START";
      } else {
        next = "JUMP";
      }
    } else if (!sense.grounded) {
      next = "FALL";
    } else if (!this.wasGrounded) {
      next = "LAND";
      this.landMs = 180;
    } else if (this.state === "LAND") {
      this.landMs -= ms;
      next = this.landMs > 0 ? "LAND" : this.groundedMove(sense);
    } else if (sense.down) {
      next = "CROUCH";
    } else {
      next = this.groundedMove(sense);
    }

    this.state = next;
    this.wasGrounded = sense.grounded;
    const pose = POSES[next];
    return {
      state: next,
      anim: pose.key,
      fallback: pose.fallback,
      frameRate: pose.frameRate,
      squash: next === "LAND" ? 0.86 : 1,
    };
  }

  groundedMove(sense) {
    const speed = Math.abs(sense.vx);
    // histerese: evita alternar WALK/RUN a cada quadro perto do limite (reiniciava a animação)
    if (speed > sense.walkSpeed + (this.state === "RUN" ? 0 : 40)) return "RUN";
    if (speed > 20) return "WALK";
    return "IDLE";
  }
}
