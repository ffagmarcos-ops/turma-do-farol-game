// @ts-nocheck
import { PlayerStateMachine } from "../systems/PlayerStateMachine.js";
import { FX } from "../fx/FXConfig.js";

/**
 * Corpo lateral. A física fica aqui. O estado de animação fica na máquina.
 * A hitbox em mundo é fixa: não muda quando o quadro troca.
 */
export class Player {
  constructor(scene, x, y, texture, physics, sheet) {
    this.scene = scene;
    this.cfg = physics;
    this.machine = new PlayerStateMachine();
    this.state = "IDLE";
    this.facing = 1;
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.jumpCutApplied = false;
    this.lock = false;
    this.slippery = false;
    this.jumpedThisFrame = false;
    this.landedThisFrame = false;
    this.targetH = physics.targetHeight || 300;
    this.squash = 1;
    this.landT = 0;
    this.sheet = sheet;
    this.hitW = 90;
    this.hitH = this.targetH * 0.85;

    this.sprite = scene.physics.add.sprite(x, y, texture);
    this.sprite.setDepth(20);
    this.sprite.body.setMaxVelocity(520, 1200);
    this.sprite.body.setDrag(0, 0);
    this.sprite.body.setBounce(0);
    this.sprite.body.setCollideWorldBounds(false);
    if (sheet) {
      this.sprite.setOrigin(sheet.originX, sheet.originY);
      this.scale = sheet.scale ?? this.targetH / sheet.contentH;
      this.sprite.setScale(this.scale);
      this.targetH = sheet.targetH || this.targetH;
      this.hitW = sheet.frameW * this.scale * 0.42;
      this.hitH = this.targetH * 0.85;
      this.applyBody(this.scale);
    } else {
      this.sprite.setOrigin(0.5, 1);
      this.fitFrame(texture);
      const idle = this.measure(texture);
      const idleScale = this.targetH / idle.h;
      this.hitW = idle.frameW * idleScale * 0.58;
      this.hitH = this.targetH * 0.85;
      this.scale = idleScale;
      this.applyBody(idleScale);
    }
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  get wasGrounded() {
    return this.machine.wasGrounded;
  }

  measure(key) {
    if (!this.boxes) this.boxes = new Map();
    if (this.boxes.has(key)) return this.boxes.get(key);
    const img = this.scene.textures.get(key).getSourceImage();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let top = canvas.height;
    let bot = 0;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        if (data[(y * canvas.width + x) * 4 + 3] > 24) {
          if (y < top) top = y;
          if (y > bot) bot = y;
        }
      }
    }
    const box = {
      h: Math.max(1, bot - top + 1),
      frameW: canvas.width,
      frameH: canvas.height,
    };
    this.boxes.set(key, box);
    return box;
  }

  fitFrame(key) {
    const box = this.measure(key);
    const scale = this.targetH / box.h;
    this.sprite.setScale(scale, scale * this.squash);
    return scale;
  }

  applyBody(scaleX, scaleY = scaleX) {
    const frame = this.sprite.frame;
    const crouch = this.state === "CROUCH";
    const worldH = crouch ? Math.min(150, this.hitH * 0.62) : this.hitH;
    const bodyW = this.hitW / scaleX;
    const bodyH = worldH / scaleY;
    const frameW = this.sheet ? this.sheet.frameW : frame.width;
    const feetY = this.sheet ? this.sheet.feetY : frame.height;
    const offsetX = (frameW - bodyW) / 2;
    const offsetY = feetY - bodyH;
    this.sprite.body.setSize(bodyW, bodyH);
    this.sprite.body.setOffset(offsetX, Math.max(0, offsetY));
  }

  onPose(_pose) {}

  update(dt, actions) {
    const cfg = this.cfg;
    const body = this.sprite.body;
    const grounded = body.blocked.down || body.touching.down;
    this.jumpedThisFrame = false;
    this.landedThisFrame = false;

    if (grounded) {
      this.coyote = cfg.coyoteTime;
      this.jumpCutApplied = false;
    } else {
      this.coyote = Math.max(0, this.coyote - dt);
    }

    if (actions.jumpPressed) this.jumpBuffer = cfg.jumpBuffer;
    else this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);

    const speed = actions.run ? cfg.runSpeed : cfg.walkSpeed;
    let target = 0;
    if (actions.left) target -= speed;
    if (actions.right) target += speed;

    const slowing = target === 0;
    let rate = slowing ? cfg.deceleration : cfg.acceleration;
    if (!grounded) rate *= cfg.airControl;
    if (this.slippery) rate *= slowing ? 0.35 : 0.55;

    let vx = body.velocity.x;
    if (this.lock) {
      vx = 0;
    } else if (slowing) {
      const step = rate * dt;
      if (Math.abs(vx) <= step) vx = 0;
      else vx -= Math.sign(vx) * step;
    } else if (vx < target) {
      vx = Math.min(target, vx + rate * dt);
    } else if (vx > target) {
      vx = Math.max(target, vx - rate * dt);
    }

    const jumped = this.jumpBuffer > 0 && (grounded || this.coyote > 0) && !this.lock;
    if (jumped) {
      body.setVelocityY(cfg.jumpVelocity);
      this.jumpBuffer = 0;
      this.coyote = 0;
      this.jumpCutApplied = false;
      this.jumpedThisFrame = true;
    }

    if (actions.jumpReleased && body.velocity.y < 0 && !this.jumpCutApplied && !grounded) {
      body.setVelocityY(body.velocity.y * cfg.jumpCut);
      this.jumpCutApplied = true;
    }

    body.setVelocityX(vx);

    if (!this.lock && actions.left) this.facing = -1;
    if (!this.lock && actions.right) this.facing = 1;
    this.sprite.setFlipX(this.facing < 0);

    const prev = this.state;
    const pose = this.machine.update(dt, {
      grounded,
      vx,
      vy: body.velocity.y,
      down: actions.down,
      locked: this.lock,
      jumped,
      walkSpeed: cfg.walkSpeed,
    });
    this.state = pose.state;
    if (pose.state === "LAND" && prev !== "LAND") {
      this.landT = FX.land.ms;
      this.landedThisFrame = true;
      this.scene.visual?.puff(this.x, this.y, FX.dust.count + 1);
    }
    this.landT = Math.max(0, this.landT - dt * 1000);
    let sx = 1;
    let sy = 1;
    if (body.velocity.y < 0 && (jumped || !grounded)) {
      sx = FX.jump.x;
      sy = FX.jump.y;
    } else if (this.landT > 0) {
      const k = this.landT / FX.land.ms;
      sx = 1 + (FX.land.x - 1) * k;
      sy = 1 + (FX.land.y - 1) * k;
    }
    this.onPose(pose);
    if (this.sheet) {
      this.sprite.setScale(this.scale * sx, this.scale * sy);
      this.applyBody(this.scale * sx, this.scale * sy);
    } else {
      const scale = this.fitFrame(this.sprite.texture.key);
      this.sprite.setScale(scale * sx, scale * sy);
      this.applyBody(scale * sx, scale * sy);
    }
  }
}
