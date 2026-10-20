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
    const isBia = scene.textures.exists("bia_locomotion");
    this.isBia = isBia;
    const initialKey = isBia ? "bia_locomotion" : S.key;
    const initialFrame = isBia ? "f000" : 0;
    const initialScale = isBia ? 0.82 : S.scale;
    const initialOrigin = isBia ? [0.5, 0.96] : S.origin;
    const sp = scene.physics.add.sprite(x, y, initialKey, initialFrame).setOrigin(initialOrigin[0], initialOrigin[1]).setScale(initialScale).setDepth(10);
    this.sprite = sp;
    sp.body.setMaxVelocity(900, this.T.maxFall);
    sp.body.setCollideWorldBounds(true);
    this.setBody("stand");
    this.facing = 1; this.coyoteT = 0; this.bufferT = 0; this.grounded = false; this.crouching = false;
    this.jumpsLeft = 2; this.isDoubleJump = false;
    this.hurtT = 0; this.invulnT = 0; this.throwT = 0; this.landT = 0; this.locked = false; this.pointing = false;
    this.wasGrounded = false; this.airVy = 0; this.cheering = false;
    this.onRope = null; this.ropeDist = 0; this.ropeCooldown = 0; this.climbingActive = false;
    this.play("idle");
  }
  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  get body() { return this.sprite.body; }
  setBody(kind) {
    if (this.isBia) {
      if (kind === "stand") {
        this.sprite.body.setSize(86, 204, false).setOffset(113, 114);
      } else {
        this.sprite.body.setSize(86, 116, false).setOffset(113, 202);
      }
      this.bodyKind = kind;
      return;
    }
    const [w, h, ox, oy] = this.S.body[kind];
    this.sprite.body.setSize(w, h, false).setOffset(ox, oy);
    this.bodyKind = kind;
  }
  /** há teto sólido onde a Sofia ficaria em pé? */
  canStand() {
    const b = this.body;
    const standH = this.isBia ? 204 * 0.82 : this.S.body.stand[1] * this.S.scale;
    const hits = this.scene.physics.overlapRect(b.x + 2, b.bottom - standH, b.width - 4, standH - 6, false, true);
    return !hits.some((hb) => hb.gameObject?.getData?.("solid"));
  }
  grabRope(rope, dist) {
    if (this.onRope === rope || this.ropeCooldown > 0 || this.hurtT > 0 || this.locked) return false;
    const vx = this.body.velocity.x || 0;
    this.onRope = rope;
    this.ropeDist = Math.max(46, Math.min(rope.curLen - 16, dist));
    this.crouching = false;
    if (this.bodyKind !== "stand") this.setBody("stand");
    this.body.setAllowGravity(false);
    this.body.setVelocity(0, 0);
    rope.swingVel = (rope.swingVel || 0) + vx * 0.0022;
    return true;
  }
  leaveRope(jumpDir = 0, vaultTop = false) {
    if (!this.onRope) return;
    const rope = this.onRope;
    this.onRope = null;
    this.climbingActive = false;
    this.ropeCooldown = 0.42;
    this.body.setAllowGravity(true);
    this.sprite.setRotation(0);
    if (vaultTop) {
      const dir = rope.ledgeDir || 1;
      this.facing = dir;
      this.sprite.setPosition(rope.x + dir * 64, rope.topY - 6);
      this.body.reset(rope.x + dir * 64, rope.topY - 6);
      this.body.setVelocity(dir * 260, -280);
      this.jumpedThisFrame = true;
      this.jumpsLeft = 1; this.isDoubleJump = false;
    } else if (jumpDir !== 0) {
      this.facing = jumpDir;
      const swingBoost = Math.cos(rope.swingAngle || 0) * (rope.swingVel || 0) * 170;
      this.body.setVelocity(jumpDir * 540 + swingBoost, -960);
      this.jumpedThisFrame = true;
      this.jumpHeld = true;
      this.jumpsLeft = 1; this.isDoubleJump = false;
    }
  }
  hurt(fromX) {
    if (this.invulnT > 0) return false;
    if (this.onRope) this.leaveRope(0, false);
    const dir = this.x < fromX ? -1 : 1;
    this.body.setVelocity(dir * 420, -440);
    this.hurtT = 0.45; this.invulnT = 1.4;
    return true;
  }
  respawn(x, y) {
    if (this.onRope) this.leaveRope(0, false);
    this.sprite.setPosition(x, y); this.body.reset(x, y);
    this.hurtT = 0; this.invulnT = 0.8; this.coyoteT = 0; this.bufferT = 0; this.ropeCooldown = 0;
    this.jumpsLeft = 2; this.isDoubleJump = false;
    if (this.bodyKind !== "stand") this.setBody("stand");
    this.crouching = false;
  }
  update(dt, a) {
    const T = this.T, b = this.body, sp = this.sprite;
    this.ropeCooldown = Math.max(0, this.ropeCooldown - dt);
    this.hurtT = Math.max(0, this.hurtT - dt); this.invulnT = Math.max(0, this.invulnT - dt);
    this.throwT = Math.max(0, this.throwT - dt); this.landT = Math.max(0, this.landT - dt);

    if (this.onRope) {
      const rope = this.onRope;
      this.grounded = false; this.wasGrounded = false; this.jumpedThisFrame = false; this.landedSpeed = 0;
      const control = !this.locked && this.hurtT <= 0;
      const dir = control ? (a.right ? 1 : 0) - (a.left ? 1 : 0) : 0;
      if (dir) {
        this.facing = dir;
        rope.swingVel = (rope.swingVel || 0) + dir * 3.4 * dt;
      }
      let climbDir = 0;
      if (control) {
        if (a.up || (a.jump && !dir)) climbDir = -1;
        else if (a.down) climbDir = 1;
      }
      this.ropeDist = Math.max(38, Math.min(rope.curLen - 12, this.ropeDist + climbDir * 270 * dt));
      this.climbingActive = climbDir !== 0 || Math.abs(rope.swingVel || 0) > 0.65;
      const ang = rope.swingAngle || 0;
      const rx = rope.x + Math.sin(ang) * this.ropeDist;
      const ry = rope.topY + Math.cos(ang) * this.ropeDist + 80;
      sp.setPosition(rx, ry);
      b.reset(rx, ry);
      sp.setRotation(-ang * 0.45);
      sp.setFlipX(this.facing < 0);
      sp.setAlpha(this.invulnT > 0 ? (Math.floor(this.invulnT * 12) % 2 ? 0.45 : 1) : 1);

      if (control) {
        if (this.ropeDist <= 42 && climbDir < 0 && rope.canVaultTop) {
          this.leaveRope(rope.ledgeDir || 1, true);
        } else if ((a.jumpOffPressed || a.jumpPressed) && dir !== 0) {
          this.leaveRope(dir, false);
        } else if (this.ropeDist >= rope.curLen - 14 && a.down) {
          this.leaveRope(0, false);
        }
      }
      this.animate();
      return;
    }

    this.grounded = b.blocked.down || b.touching.down;
    this.jumpedThisFrame = false; this.landedSpeed = 0;
    if (this.grounded) {
      this.jumpsLeft = 2;
      this.isDoubleJump = false;
    } else if (this.coyoteT <= 0 && this.jumpsLeft === 2) {
      this.jumpsLeft = 1;
    }
    if (this.grounded && !this.wasGrounded && this.airVy > 420) { this.landedSpeed = this.airVy; this.landT = 0.12; }
    if (!this.grounded) this.airVy = Math.max(this.airVy, b.velocity.y); else this.airVy = 0;
    this.wasGrounded = this.grounded;

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
    const accG = this.onSlippery ? 1650 : T.accGround;
    const decG = this.onSlippery ? 760 : T.decGround;
    const acc = this.grounded ? (dir ? accG : decG) : (dir ? T.accAir : T.decAir);
    const step = acc * dt;
    b.setVelocityX(Math.abs(target - vx) <= step ? target : vx + Math.sign(target - vx) * step);

    const canFirstJump = control && this.bufferT > 0 && this.coyoteT > 0 && !this.crouching;
    const canAirJump = control && this.bufferT > 0 && this.coyoteT <= 0 && !this.grounded && this.jumpsLeft > 0 && !this.crouching;

    if (canFirstJump) {
      b.setVelocityY(-(Math.abs(vx) > T.walk + 40 ? T.runJumpV : T.jumpV));
      this.bufferT = 0; this.coyoteT = 0; this.jumpsLeft = 1;
      this.jumpedThisFrame = true; this.jumpHeld = true; this.isDoubleJump = false;
    } else if (canAirJump) {
      b.setVelocityY(-(Math.abs(vx) > T.walk + 40 ? T.runJumpV * 0.96 : T.jumpV * 0.96));
      this.bufferT = 0; this.jumpsLeft = 0;
      this.jumpedThisFrame = true; this.jumpHeld = true; this.isDoubleJump = true;
      this.scene.puff?.(this.x, this.y, 0.45, 0xbff7ff);
      this.scene.stars?.(this.x, this.y - 30);
    }
    if (this.jumpHeld && !a.jump) { if (b.velocity.y < -300) b.setVelocityY(b.velocity.y * T.jumpCut); this.jumpHeld = false; }
    if (b.velocity.y >= 0) this.jumpHeld = false;
    b.setGravityY(b.velocity.y > 0 ? T.fallGravity : 0);

    sp.setFlipX(this.facing < 0);
    sp.setAlpha(this.invulnT > 0 && this.hurtT <= 0 ? (Math.floor(this.invulnT * 12) % 2 ? 0.45 : 1) : 1);
    this.animate();
  }
  play(pose) {
    if (this.isBia) {
      let animKey = "bia.idle";
      const b = this.body, speed = Math.abs(b?.velocity?.x || 0);
      switch (pose) {
        case "idle":
          animKey = "bia.idle";
          break;
        case "walk":
          animKey = "bia.walk";
          break;
        case "run":
          animKey = "bia.run";
          break;
        case "jump":
          animKey = "bia.jump";
          break;
        case "fall":
          animKey = b && b.velocity.y > 200 ? "bia.fall" : "bia.apex";
          break;
        case "land":
          animKey = "bia.land";
          break;
        case "crouch":
          animKey = "bia.crouch_hold";
          break;
        case "crawl":
          animKey = "bia.crawl";
          break;
        case "throw":
          if (!this.grounded) animKey = "bia.throw_air";
          else if (speed > 40) animKey = "bia.throw_run";
          else animKey = "bia.throw_stand";
          break;
        case "point":
          animKey = "bia.point";
          break;
        case "cheer":
          animKey = "bia.discover";
          break;
        case "look":
          animKey = "bia.observe";
          break;
        case "hurt":
          animKey = "bia.land";
          break;
        case "climb":
        case "climb_idle":
          animKey = "bia.jump";
          break;
        default:
          animKey = `bia.${pose}`;
          break;
      }
      if (this.scene.anims.exists(animKey)) {
        if (this.sprite.anims.currentAnim?.key !== animKey) {
          this.sprite.play(animKey);
        }
        return;
      }
    }
    const k = `${this.S.key}-${pose}`;
    if (this.sprite.anims.currentAnim?.key !== k) this.sprite.play(k);
  }
  animate() {
    const b = this.body, sp = this.sprite, speed = Math.abs(b.velocity.x);
    sp.anims.timeScale = 1;
    if (this.cheering) return this.play("cheer");
    if (this.hurtT > 0) return this.play("hurt");
    if (this.onRope) return this.play(this.climbingActive ? "climb" : "climb_idle");
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
