// @ts-nocheck
import Phaser from "../phaser.js";
import { FX } from "./FXConfig.js";

/** Luz, mar, sombra, juice e conchas. Os números ficam em FXConfig. */
export class VisualFX {
  constructor(scene, level) {
    this.scene = scene;
    this.level = level;
    this.shadows = [];
    this.shells = [];
    this.dust = this.pool(FX.dust.pool, "fx-dust", 0xc4a574);
    this.sparks = this.pool(FX.sea.sparkle.pool, "fx-spark", 0xffffff);
    this.burst = this.pool(FX.clinc.burst, "fx-gold", 0xffd56a);
    this.sparkleTimer = 0;
    this.flyers = [];
    this.makeRays();
    this.makeGrade();
    this.makeSea();
    this.makeFoam();
    this.makeFlyers();
  }

  dot(key, color) {
    if (this.scene.textures.exists(key)) return;
    const tex = this.scene.textures.createCanvas(key, 16, 16);
    const ctx = tex.getContext();
    const g = ctx.createRadialGradient(8, 8, 1, 8, 8, 8);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 16, 16);
    tex.refresh();
  }

  pool(count, key, color) {
    this.dot(key, color);
    const items = [];
    for (let i = 0; i < count; i++) {
      const sprite = this.scene.add
        .image(-100, -100, key)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setVisible(false)
        .setDepth(30);
      items.push({ sprite, life: 0, max: 1, vx: 0, vy: 0 });
    }
    return items;
  }

  borrow(pool) {
    for (let i = 0; i < pool.length; i++) if (pool[i].life <= 0) return pool[i];
    return null;
  }

  makeRays() {
    this.rays = FX.rays.items.slice(0, FX.rays.count).map((spec) => {
      const ray = this.scene.add.graphics().setDepth(FX.rays.depth).setScrollFactor(0);
      ray.fillGradientStyle(FX.rays.color, FX.rays.color, FX.rays.color, FX.rays.color, 1, 1, 0, 0);
      ray.fillRect(-spec.w / 2, 0, spec.w, spec.h);
      ray.setPosition(spec.x, -20);
      ray.setAngle(spec.angle);
      ray.setBlendMode(Phaser.BlendModes.ADD);
      ray.setAlpha(FX.rays.alpha);
      return ray;
    });
  }

  makeGrade() {
    const cam = this.scene.cameras.main;
    if (!cam.postFX) {
      this.gradeFallback();
      return;
    }
    try {
      const matrix = cam.postFX.addColorMatrix();
      matrix.saturate(FX.grade.saturation, false);
      matrix.multiply(FX.grade.warm, true);
      cam.postFX.addVignette(0.5, 0.5, FX.grade.vignetteRadius, FX.grade.vignette);
    } catch {
      this.gradeFallback();
    }
  }

  gradeFallback() {
    if (this.scene.textures.exists("fx-vignette")) return;
    const tex = this.scene.textures.createCanvas("fx-vignette", 256, 144);
    const ctx = tex.getContext();
    const g = ctx.createRadialGradient(128, 72, 40, 128, 72, 150);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 144);
    tex.refresh();
    this.scene.add
      .image(960, 540, "fx-vignette")
      .setDisplaySize(1920, 1080)
      .setScrollFactor(0)
      .setDepth(70)
      .setAlpha(FX.grade.vignette)
      .setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.scene.add
      .rectangle(960, 540, 1920, 1080, 0xffe0b0, 0.05)
      .setScrollFactor(0)
      .setDepth(69)
      .setBlendMode(Phaser.BlendModes.ADD);
  }

  seaKey() {
    const src = this.scene.textures.get(FX.sea.key).getSourceImage();
    const name = "fx-sea-fade";
    if (this.scene.textures.exists(name) || !src) return this.scene.textures.exists(name) ? name : null;
    const h = 96;
    const canvas = this.scene.textures.createCanvas(name, src.width, h);
    const ctx = canvas.getContext();
    ctx.drawImage(src, 0, 0, src.width, h, 0, 0, src.width, h);
    ctx.globalCompositeOperation = "destination-in";
    const fade = ctx.createLinearGradient(0, 0, 0, h);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(0.42, "rgba(0,0,0,1)");
    fade.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, src.width, h);
    canvas.refresh();
    return name;
  }

  makeSea() {
    this.waves = [];
    if (!this.scene.textures.exists(FX.sea.key)) return;
    const key = this.seaKey();
    if (!key) return;
    for (const band of FX.sea.bands) {
      const node = this.scene.add
        .tileSprite(0, band.y, 1920, band.h, key)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setAlpha(band.alpha)
        .setDepth(band.depth);
      this.waves.push({ node, band, baseY: band.y });
    }
  }

  makeFoam() {
    this.foam = [];
    const cfg = FX.sea.foam;
    if (!this.scene.textures.exists("fx-foam")) {
      const tex = this.scene.textures.createCanvas("fx-foam", 48, 16);
      const ctx = tex.getContext();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.ellipse(24, 8, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      tex.refresh();
    }
    const baseY = cfg.y ?? this.level.groundY + (cfg.dy || 0);
    for (let x = cfg.offset || 0; x < this.level.width; x += cfg.step) {
      const sprite = this.scene.add.image(x, baseY, "fx-foam").setAlpha(cfg.alpha).setDepth(9);
      this.foam.push({ sprite, x, phase: x * 0.01, baseY });
    }
  }

  track(sprite, scale = 1) {
    const shadow = this.scene.add
      .ellipse(sprite.x, this.level.groundY, FX.shadow.width, FX.shadow.height, 0x061018, FX.shadow.alpha)
      .setDepth(13);
    this.shadows.push({ sprite, shadow, scale });
  }

  watchShell(shell) {
    const star = this.scene.add
      .image(shell.x, shell.y - 18, "fx-spark")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(FX.shell.sparkleScale)
      .setDepth(13);
    this.shells.push({ shell, star, phase: shell.x * 0.02 });
  }

  makeFlyers() {
    if (!this.scene.textures.exists("shell")) return;
    for (let i = 0; i < 3; i++) {
      this.flyers.push(this.scene.add.image(-200, -200, "shell").setDepth(120).setVisible(false));
    }
  }

  puff(x, y, count = FX.dust.count) {
    for (let i = 0; i < count; i++) {
      const item = this.borrow(this.dust);
      if (!item) return;
      item.life = FX.dust.life;
      item.max = FX.dust.life;
      item.vx = (Math.random() - 0.5) * 40;
      item.vy = -20 - Math.random() * 30;
      item.sprite
        .setPosition(x + (Math.random() - 0.5) * 16, y)
        .setVisible(true)
        .setAlpha(0.7)
        .setScale(0.45)
        .setDepth(15)
        .setBlendMode(Phaser.BlendModes.NORMAL)
        .setTint(0xc4a574);
    }
  }

  clinc(artifact) {
    const scene = this.scene;
    scene.physics.world.pause();
    scene.anims.pauseAll();
    scene.tweens.pauseAll();
    scene.time.delayedCall(FX.clinc.hitStop, () => {
      scene.physics.world.resume();
      scene.anims.resumeAll();
      scene.tweens.resumeAll();
    });
    scene.cameras.main.shake(FX.clinc.shakeMs, FX.clinc.shake);
    scene.cameras.main.setZoom(FX.clinc.zoom);
    scene.cameraRig?.punch(FX.clinc.zoom, FX.clinc.shakeMs / 1000);
    if (artifact) {
      if (artifact.postFX) {
        try {
          artifact.postFX.addGlow(0xffd56a, 2, 0, false, 0.1, 12);
        } catch {
          /* sem glow neste renderer */
        }
      }
      for (let i = 0; i < FX.clinc.burst; i++) {
        const item = this.borrow(this.burst);
        if (!item) break;
        const angle = (i / FX.clinc.burst) * Math.PI * 2;
        item.life = 0.45;
        item.max = 0.45;
        item.vx = Math.cos(angle) * 90;
        item.vy = Math.sin(angle) * 70 - 20;
        item.sprite
          .setPosition(artifact.x, artifact.y)
          .setVisible(true)
          .setDepth(40)
          .setTint(0xffd56a)
          .setAlpha(1)
          .setScale(0.7);
      }
    }
  }

  collect(shell) {
    const found = this.shells.find((item) => item.shell === shell);
    if (found) {
      found.star.destroy();
      found.shell = null;
    }
    const icon = this.flyers.find((node) => !node.visible);
    if (!icon) return;
    this.scene.tweens.killTweensOf(icon);
    icon.setVisible(true).setScrollFactor(1).setPosition(shell.x, shell.y).setScale(shell.scale * FX.shell.pop).setAlpha(1);
    this.scene.tweens.add({
      targets: icon,
      scale: shell.scale,
      duration: 90,
      yoyo: true,
      onComplete: () => {
        const cam = this.scene.cameras.main;
        icon.setScrollFactor(0);
        icon.setPosition((shell.x - cam.scrollX) * cam.zoom, (shell.y - cam.scrollY) * cam.zoom);
        this.scene.tweens.add({
          targets: icon,
          x: FX.shell.hudX,
          y: FX.shell.hudY,
          scale: 0.12,
          duration: FX.shell.flyMs,
          ease: "Quad.easeIn",
          onComplete: () => icon.setVisible(false),
        });
      },
    });
  }

  stepPool(pool, dt) {
    for (const item of pool) {
      if (item.life <= 0) continue;
      item.life -= dt;
      item.sprite.x += item.vx * dt;
      item.sprite.y += item.vy * dt;
      const k = Math.max(0, item.life / item.max);
      item.sprite.setAlpha(k);
      if (item.life <= 0) item.sprite.setVisible(false);
    }
  }

  update(dt, time) {
    const seconds = time / 1000;
    const pulse = 1 + Math.sin(seconds * ((Math.PI * 2) / FX.rays.period)) * FX.rays.pulse;
    for (const ray of this.rays) ray.setAlpha(FX.rays.alpha * pulse);

    const scroll = this.scene.cameras.main.scrollX;
    for (const wave of this.waves) {
      const band = wave.band;
      wave.node.tilePositionX = Math.round(scroll * band.factor - seconds * band.speed);
      wave.node.y = Math.round(wave.baseY + Math.sin(seconds * ((Math.PI * 2) / band.period)) * band.bob);
    }

    const foam = FX.sea.foam;
    for (const item of this.foam) {
      item.sprite.y = Math.round(item.baseY + Math.sin(seconds * ((Math.PI * 2) / foam.period) + item.phase) * foam.bob);
    }

    this.sparkleTimer -= dt;
    if (this.sparkleTimer <= 0 && this.waves.length) {
      this.sparkleTimer = FX.sea.sparkle.interval;
      const item = this.borrow(this.sparks);
      if (item) {
        const cfg = FX.sea.sparkle;
        item.life = cfg.life;
        item.max = cfg.life;
        item.vx = 0;
        item.vy = 0;
        item.sprite
          .setScrollFactor(0)
          .setPosition(Math.random() * 1920, Phaser.Math.Between(cfg.y0, cfg.y1))
          .setVisible(true)
          .setDepth(cfg.depth)
          .setTint(0xffffff)
          .setScale(0.35 + Math.random() * 0.45)
          .setAlpha(cfg.alpha);
      }
    }

    const ground = this.level.groundY;
    for (const item of this.shadows) {
      const feet = item.sprite.y;
      const lift = Math.max(0, ground - feet);
      const k = Phaser.Math.Clamp(1 - lift / FX.shadow.lift, FX.shadow.jumpScale, 1);
      item.shadow.setPosition(item.sprite.x, Math.max(feet, ground) + 4);
      item.shadow.setScale(item.scale * k, k);
      item.shadow.setAlpha(FX.shadow.alpha * (0.65 + 0.35 * k));
    }

    for (const item of this.shells) {
      if (!item.star.active) continue;
      if (!item.shell || !item.shell.active) {
        item.star.setVisible(false);
        continue;
      }
      item.star.setPosition(item.shell.x, item.shell.y - 20);
      item.star.setAlpha(0.35 + Math.abs(Math.sin(seconds * 5 + item.phase)) * 0.65);
      item.star.setAngle(seconds * 40);
    }

    this.stepPool(this.dust, dt);
    this.stepPool(this.sparks, dt);
    this.stepPool(this.burst, dt);
  }
}
