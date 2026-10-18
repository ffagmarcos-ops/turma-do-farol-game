// @ts-nocheck
import Phaser from "../phaser.js";

/**
 * Vento, folhas, fumaça e peixe. Toldo e bandeirola oscilam;
 * a bandeirola usa Rope no WebGL.
 */
export class WindLife {
  constructor(scene, level) {
    this.scene = scene;
    this.level = level;
    this.cfg = level.life || {};
    this.deg = this.cfg.windDeg ?? 2.6;
    this.sway = [];
    this.ropes = [];
    this.leaves = [];
    this.puffs = [];
    this.chimneys = this.cfg.chimneys || [];
    this.smokeTimer = 0;
    this.fishTimer = 3;
    this.fish = null;
    this.splashes = [];
    this.makeTextures();
    this.placeAwnings();
    this.placePennants();
    this.placeLeaves();
    this.fishSprite = scene.add
      .image(-400, -400, "fx-fish")
      .setDepth(17)
      .setVisible(false);
    this.fishState = { x: 0, water: 0, t: 0, dur: 0.7, h: 86, dir: 1, splashed: false, active: false };
    this.puffs = [];
    this.splashes = [];
    for (let i = 0; i < 8; i++) this.puffs.push(this.makeSlot("fx-smoke", 15));
    for (let i = 0; i < 8; i++) this.splashes.push(this.makeSlot("fx-splash", 18));
  }

  makeSlot(key, depth) {
    return {
      sprite: this.scene.add.image(-400, -400, key).setDepth(depth).setVisible(false),
      life: 0,
      max: 1,
      vx: 0,
      vy: 0,
    };
  }

  makeTextures() {
    this.canvas("fx-awning", 220, 72, (ctx) => {
      ctx.clearRect(0, 0, 220, 72);
      ctx.fillStyle = "#c45c26";
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(220, 8);
      ctx.lineTo(196, 64);
      ctx.lineTo(18, 64);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f4e2b0";
      for (let x = 18; x < 200; x += 28) {
        ctx.fillRect(x, 14, 12, 46);
      }
    });
    this.canvas("fx-bunting", 128, 40, (ctx) => {
      ctx.clearRect(0, 0, 128, 40);
      const colors = ["#e25b2a", "#f4e2b0", "#2f6f8f", "#7fbf4a"];
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.moveTo(i * 32, 0);
        ctx.lineTo(i * 32 + 32, 0);
        ctx.lineTo(i * 32 + 16, 36);
        ctx.closePath();
        ctx.fill();
      }
    });
    this.canvas("fx-flag", 28, 46, (ctx) => {
      ctx.clearRect(0, 0, 28, 46);
      ctx.fillStyle = "#e25b2a";
      ctx.beginPath();
      ctx.moveTo(2, 2);
      ctx.lineTo(26, 12);
      ctx.lineTo(2, 40);
      ctx.closePath();
      ctx.fill();
    });
    this.canvas("fx-leaf", 22, 14, (ctx) => {
      ctx.clearRect(0, 0, 22, 14);
      ctx.fillStyle = "#7fbf4a";
      ctx.beginPath();
      ctx.ellipse(11, 7, 10, 5, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3f6b28";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(2, 8);
      ctx.lineTo(20, 6);
      ctx.stroke();
    });
    this.canvas("fx-smoke", 32, 32, (ctx) => {
      const g = ctx.createRadialGradient(16, 16, 2, 16, 16, 16);
      g.addColorStop(0, "rgba(255,255,255,0.85)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 32, 32);
    });
    this.canvas("fx-fish", 54, 28, (ctx) => {
      ctx.clearRect(0, 0, 54, 28);
      ctx.fillStyle = "#e07a32";
      ctx.beginPath();
      ctx.ellipse(28, 14, 16, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(8, 14);
      ctx.lineTo(0, 6);
      ctx.lineTo(0, 22);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#1b2a33";
      ctx.beginPath();
      ctx.arc(38, 12, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    this.canvas("fx-splash", 18, 18, (ctx) => {
      ctx.clearRect(0, 0, 18, 18);
      ctx.fillStyle = "rgba(232,248,255,0.9)";
      ctx.beginPath();
      ctx.ellipse(9, 9, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  canvas(key, w, h, draw) {
    if (this.scene.textures.exists(key)) return;
    const tex = this.scene.textures.createCanvas(key, w, h);
    draw(tex.getContext());
    tex.refresh();
  }

  placeAwnings() {
    const rows = this.cfg.awnings || [
      { x: 2480, y: 760 },
      { x: 5080, y: 690 },
      { x: 6760, y: 730 },
    ];
    for (const row of rows) {
      const sprite = this.scene.add
        .image(row.x, row.y, "fx-awning")
        .setOrigin(0, 0)
        .setDepth(11);
      if (row.tint) sprite.setTint(row.tint);
      this.sway.push({
        sprite,
        phase: Math.random() * Math.PI * 2,
        amp: 2 + Math.random() * 0.8,
        speed: 0.9 + Math.random() * 0.3,
        skew: true,
      });
    }
  }

  placePennants() {
    const rows = this.cfg.pennants || [
      { x: 1600, y: 640, span: 280 },
      { x: 4700, y: 610, span: 340 },
      { x: 7600, y: 650, span: 260 },
      { x: 11200, y: 620, span: 320 },
    ];
    const webgl = this.scene.game.renderer?.type === Phaser.WEBGL && this.scene.add.rope;
    for (const row of rows) {
      if (webgl) {
        const rope = this.makeRope(row);
        if (rope) {
          this.ropes.push({ rope, ...row, phase: Math.random() * Math.PI * 2 });
          continue;
        }
      }
      this.fallbackPennant(row);
    }
  }

  makeRope(row) {
    try {
      const n = 12;
      const points = [];
      for (let i = 0; i < n; i++) {
        points.push(new Phaser.Math.Vector2(-row.span / 2 + (row.span / (n - 1)) * i, 0));
      }
      const rope = this.scene.add
        .rope(row.x + row.span / 2, row.y, "fx-bunting", null, points, true)
        .setDepth(12);
      rope.setData("anchorX", row.x);
      rope.setData("anchorY", row.y);
      rope.setData("span", row.span);
      return rope;
    } catch {
      return null;
    }
  }

  fallbackPennant(row) {
    const count = 6;
    for (let i = 0; i < count; i++) {
      const sprite = this.scene.add
        .image(row.x + (row.span / (count - 1)) * i, row.y, "fx-flag")
        .setOrigin(0, 0.15)
        .setDepth(12);
      this.sway.push({
        sprite,
        phase: i * 0.6,
        amp: 2.4,
        speed: 2.2,
      });
    }
  }

  placeLeaves() {
    const count = Phaser.Math.Clamp(this.cfg.leaves ?? 5, 4, 6);
    for (let i = 0; i < count; i++) {
      const sprite = this.scene.add.image(0, 0, "fx-leaf").setDepth(24).setTint(i % 2 ? 0xc6a24a : 0x7fbf4a);
      const leaf = { sprite, vx: 0, vy: 0, spin: 0 };
      this.relocate(leaf, false);
      this.leaves.push(leaf);
    }
  }

  relocate(leaf, fromTop) {
    const cam = this.scene.cameras.main;
    const view = cam.width / cam.zoom;
    leaf.sprite.x = cam.scrollX + Math.random() * view;
    leaf.sprite.y = fromTop ? -30 - Math.random() * 80 : Math.random() * 900;
    leaf.vx = 24 + Math.random() * 46;
    leaf.vy = 32 + Math.random() * 36;
    leaf.spin = -50 + Math.random() * 100;
    leaf.sprite.setAngle(Math.random() * 360);
    leaf.sprite.setScale(0.8 + Math.random() * 0.6);
  }

  puff(x, y) {
    let slot = null;
    for (let i = 0; i < this.puffs.length; i++) {
      if (this.puffs[i].life <= 0) {
        slot = this.puffs[i];
        break;
      }
    }
    if (!slot) return;
    slot.life = 1.4;
    slot.max = 1.4;
    slot.vx = 8 + Math.random() * 10;
    slot.vy = -18 - Math.random() * 16;
    slot.sprite.setPosition(x, y).setVisible(true).setAlpha(0.28).setScale(0.4);
  }

  splash(x, y) {
    for (let i = 0; i < 4; i++) {
      let slot = null;
      for (let s = 0; s < this.splashes.length; s++) {
        if (this.splashes[s].life <= 0) {
          slot = this.splashes[s];
          break;
        }
      }
      if (!slot) return;
      const angle = -Math.PI / 2 + (i - 1.5) * 0.45;
      slot.life = 0.35;
      slot.max = 0.35;
      slot.vx = Math.cos(angle) * 80;
      slot.vy = Math.sin(angle) * 90;
      slot.sprite.setPosition(x, y).setVisible(true).setAlpha(0.85).setScale(0.6);
    }
  }

  spawnFish() {
    const cam = this.scene.cameras.main;
    const view = cam.width / cam.zoom;
    const water = this.cfg.fish?.waterY ?? this.level.groundY + 70;
    const fish = this.fishState;
    fish.x = cam.scrollX + 180 + Math.random() * Math.max(200, view - 360);
    fish.water = water;
    fish.t = 0;
    fish.dur = 0.7;
    fish.h = 86 + Math.random() * 30;
    fish.dir = Math.random() < 0.5 ? -1 : 1;
    fish.splashed = false;
    fish.active = true;
    this.fishSprite.setVisible(true).setFlipX(fish.dir < 0);
    this.splash(fish.x, water);
  }

  update(dt, time) {
    const seconds = time / 1000;
    for (const item of this.sway) {
      const deg = Math.sin(seconds * item.speed + item.phase) * item.amp;
      item.sprite.setAngle(Phaser.Math.Clamp(deg, -3, 3));
      if (item.skew && item.sprite.setSkew) {
        item.sprite.setSkew(Math.sin(seconds * item.speed + item.phase) * 0.04, 0);
      }
    }
    for (const item of this.ropes) {
      const rope = item.rope;
      const points = rope.points;
      for (let i = 0; i < points.length; i++) {
        points[i].y = i === 0 ? 0 : Math.sin(seconds * 1.7 + item.phase + i * 0.55) * (3 + i * 0.55);
      }
      rope.setDirty();
      const deg = Math.sin(seconds * 0.85 + item.phase) * Math.min(3, this.deg);
      const rad = Phaser.Math.DegToRad(deg);
      const span = item.span;
      const lx = -span / 2;
      rope.setAngle(deg);
      rope.x = item.x - Math.cos(rad) * lx;
      rope.y = item.y - Math.sin(rad) * lx;
    }

    const cam = this.scene.cameras.main;
    const view = cam.width / cam.zoom;
    for (const leaf of this.leaves) {
      leaf.sprite.x += leaf.vx * dt;
      leaf.sprite.y += leaf.vy * dt;
      leaf.sprite.angle += leaf.spin * dt;
      leaf.sprite.x += Math.sin(seconds * 2 + leaf.sprite.y * 0.01) * 12 * dt;
      const off =
        leaf.sprite.y > 1120 ||
        leaf.sprite.x > cam.scrollX + view + 80 ||
        leaf.sprite.x < cam.scrollX - 80;
      if (off) this.relocate(leaf, true);
    }

    this.smokeTimer -= dt;
    if (this.smokeTimer <= 0) {
      this.smokeTimer = 0.45;
      for (const chimney of this.chimneys) {
        if (Math.abs(chimney.x - (cam.scrollX + view * 0.5)) > view) continue;
        this.puff(chimney.x, chimney.y);
      }
    }
    for (const puff of this.puffs) {
      if (puff.life <= 0) continue;
      puff.life -= dt;
      puff.sprite.x += puff.vx * dt;
      puff.sprite.y += puff.vy * dt;
      const k = Math.max(0, puff.life / puff.max);
      puff.sprite.setAlpha(0.28 * k);
      puff.sprite.setScale(0.4 + (1 - k) * 1.1);
      if (puff.life <= 0) puff.sprite.setVisible(false);
    }

    const every = this.cfg.fish?.every || [4.5, 8];
    const fish = this.fishState;
    if (!fish.active) {
      this.fishTimer -= dt;
      if (this.fishTimer <= 0) {
        this.spawnFish();
        this.fishTimer = every[0] + Math.random() * (every[1] - every[0]);
      }
    } else {
      fish.t += dt;
      const k = Math.min(1, fish.t / fish.dur);
      const y = fish.water - Math.sin(k * Math.PI) * fish.h;
      this.fishSprite.setPosition(fish.x + fish.dir * k * 70, y);
      this.fishSprite.setAngle(Math.cos(k * Math.PI) * -28 * fish.dir);
      if (!fish.splashed && k > 0.92) {
        fish.splashed = true;
        this.splash(this.fishSprite.x, fish.water);
      }
      if (k >= 1) {
        this.fishSprite.setVisible(false);
        fish.active = false;
      }
    }
    for (const drop of this.splashes) {
      if (drop.life <= 0) continue;
      drop.life -= dt;
      drop.sprite.x += drop.vx * dt;
      drop.sprite.y += drop.vy * dt;
      drop.vy += 280 * dt;
      drop.sprite.setAlpha(Math.max(0, drop.life / drop.max));
      if (drop.life <= 0) drop.sprite.setVisible(false);
    }
  }
}
