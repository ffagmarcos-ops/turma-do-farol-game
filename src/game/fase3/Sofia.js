// @ts-nocheck
/**
 * SOFIA — personagem jogável da Fase 3.
 * Aceleração suave, controle aéreo moderado, coyote time 120 ms, jump buffer 120 ms,
 * pulo de altura variável (soltar cedo = pulo baixo), correr, agachar (passa em vão de 120 px).
 */
import { SPRITES } from "./Fase3Assets.js";

export const SOFIA_TUNING = {
  walk: 340, run: 580, crouch: 170,
  accGround: 2600, decGround: 3400, accAir: 1500, decAir: 600,
  jumpV: 1000, runJumpV: 1060, jumpCut: 0.45,
  coyote: 0.12, buffer: 0.12, fallGravity: 600, maxFall: 1400,
};

export class Sofia {
  constructor(scene, x, y) {
    const S = SPRITES.sofia;
    this.scene = scene; this.S = S; this.T = SOFIA_TUNING;
    const sp = scene.physics.add.sprite(x, y, S.key, 0).setOrigin(S.origin[0], S.origin[1]).setScale(S.scale).setDepth(10);
    this.sprite = sp;
    sp.body.setMaxVelocity(900, this.T.maxFall);
    sp.body.setCollideWorldBounds(true);
    this.setBody("stand");
    this.facing = 1; this.coyoteT = 0; this.bufferT = 0; this.grounded = false; this.crouching = false;
    this.hurtT = 0; this.invulnT = 0; this.throwT = 0; this.landT = 0; this.locked = false; this.pointing = false;
    this.wasGrounded = false; this.airVy = 0; this.cheering = false;
    sp.play(`${S.key}-idle`);
  }
  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  get body() { return this.sprite.body; }
  setBody(kind) {
    const [w, h, ox, oy] = this.S.body[kind];
    this.sprite.body.setSize(w, h, false).setOffset(ox, oy);
    this.bodyKind = kind;
  }
  /** há teto sólido onde a Sofia ficaria em pé? */
  canStand() {
    const b = this.body, [, h] = this.S.body.stand, H = h * this.S.scale;
    const hits = this.scene.physics.overlapRect(b.x + 2, b.bottom - H, b.width - 4, H - 6, false, true);
    return !hits.some((hb) => hb.gameObject?.getData?.("solid"));
  }
  hurt(fromX) {
    if (this.invulnT > 0) return false;
    const dir = this.x < fromX ? -1 : 1;
    this.body.setVelocity(dir * 420, -440);
    this.hurtT = 0.45; this.invulnT = 1.4;
    return true;
  }
  respawn(x, y) {
    this.sprite.setPosition(x, y); this.body.reset(x, y);
    this.hurtT = 0; this.invulnT = 0.8; this.coyoteT = 0; this.bufferT = 0;
    if (this.bodyKind !== "stand") this.setBody("stand");
    this.crouching = false;
  }
  update(dt, a) {
    const T = this.T, b = this.body, sp = this.sprite;
    this.grounded = b.blocked.down || b.touching.down;
    this.jumpedThisFrame = false; this.landedSpeed = 0;
    if (this.grounded && !this.wasGrounded && this.airVy > 420) { this.landedSpeed = this.airVy; this.landT = 0.12; }
    if (!this.grounded) this.airVy = Math.max(this.airVy, b.velocity.y); else this.airVy = 0;
    this.wasGrounded = this.grounded;

    this.hurtT = Math.max(0, this.hurtT - dt); this.invulnT = Math.max(0, this.invulnT - dt);
    this.throwT = Math.max(0, this.throwT - dt); this.landT = Math.max(0, this.landT - dt);
    this.coyoteT = this.grounded ? T.coyote : Math.max(0, this.coyoteT - dt);
    this.bufferT = a.jumpPressed ? T.buffer : Math.max(0, this.bufferT - dt);
    const control = !this.locked && this.hurtT <= 0 && !this.pointing;

    // agachar (fica agachada enquanto houver teto baixo)
    const wantCrouch = control && a.down && this.grounded;
    if (wantCrouch && !this.crouching) { this.crouching = true; this.setBody("crouch"); }
    else if (!wantCrouch && this.crouching && this.canStand()) { this.crouching = false; this.setBody("stand"); }

    let dir = 0;
    if (control) dir = (a.right ? 1 : 0) - (a.left ? 1 : 0);
    if (dir) this.facing = dir;
    const max = this.crouching ? T.crouch : a.run ? T.run : T.walk;
    const target = dir * max, vx = b.velocity.x;
    const acc = this.grounded ? (dir ? T.accGround : T.decGround) : (dir ? T.accAir : T.decAir);
    const step = acc * dt;
    b.setVelocityX(Math.abs(target - vx) <= step ? target : vx + Math.sign(target - vx) * step);

    if (control && this.bufferT > 0 && this.coyoteT > 0 && !this.crouching) {
      b.setVelocityY(-(Math.abs(vx) > T.walk + 40 ? T.runJumpV : T.jumpV));
      this.bufferT = 0; this.coyoteT = 0; this.jumpedThisFrame = true; this.jumpHeld = true;
    }
    if (this.jumpHeld && !a.jump) { if (b.velocity.y < -300) b.setVelocityY(b.velocity.y * T.jumpCut); this.jumpHeld = false; }
    if (b.velocity.y >= 0) this.jumpHeld = false;
    b.setGravityY(b.velocity.y > 0 ? T.fallGravity : 0);

    sp.setFlipX(this.facing < 0);
    sp.setAlpha(this.invulnT > 0 && this.hurtT <= 0 ? (Math.floor(this.invulnT * 12) % 2 ? 0.45 : 1) : 1);
    this.animate();
  }
  play(pose) {
    const k = `${this.S.key}-${pose}`;
    if (this.sprite.anims.currentAnim?.key !== k) this.sprite.play(k);
  }
  animate() {
    const b = this.body, sp = this.sprite, speed = Math.abs(b.velocity.x);
    sp.anims.timeScale = 1;
    if (this.cheering) return this.play("cheer");
    if (this.hurtT > 0) return this.play("hurt");
    if (this.pointing) return this.play("point");
    if (this.looking) return this.play("look");
    if (this.crouching) { this.play(speed > 20 ? "crawl" : "crouch"); return; }
    if (!this.grounded) return this.play(b.velocity.y < 0 ? "jump" : "fall");
    if (this.throwT > 0) return this.play("throw");
    if (this.landT > 0) return this.play("land");
    if (speed > this.T.walk + 40) { this.play("run"); sp.anims.timeScale = speed / this.T.run; return; }
    if (speed > 25) { this.play("walk"); sp.anims.timeScale = Math.max(0.5, speed / this.T.walk); return; }
    this.play("idle");
  }
}
