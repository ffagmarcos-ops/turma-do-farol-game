// @ts-nocheck
/** Céu, nuvens, mares (mar aberto, sem terra) em parallax, chuva em 3 camadas, raios com silhueta do polvo. */
import { W, H, clamp, lerp } from "./common.js";

export class StormFX {
  constructor(s) {
    this.s = s;
    const has = (k) => s.textures.exists(k);
    const skyKey = has("f2_sky") ? "f2_sky" : "r2_sky";
    this.sky = s.add.tileSprite(W / 2, H / 2 - 120, W + 600, H + 500, skyKey).setScrollFactor(0.05).setDepth(0);
    const ss = (H + 500) / s.textures.get(skyKey).getSourceImage().height;
    this.sky.setTileScale(ss, ss);
    this.clouds = s.add.tileSprite(W / 2, 260, W + 600, 600, "f2_clouds").setTileScale(600 / s.textures.get("f2_clouds").getSourceImage().height).setScrollFactor(0.05).setDepth(1).setAlpha(0.95);
    this.clouds2 = s.add.tileSprite(W / 2, 160, W + 600, 600, "f2_clouds").setTileScale(600 / s.textures.get("f2_clouds").getSourceImage().height).setScrollFactor(0.08).setDepth(1.2).setAlpha(0.7).setFlipX(true);
    this.sil = s.add.container(560, 640).setDepth(2.5).setScrollFactor(0.15).setAlpha(0);
    this.sil.add(s.add.image(0, 0, "f2_p_corpo").setTintFill(0x03060c).setScale(1.1).setOrigin(0.5, 1));
    for (let i = 0; i < 4; i++) this.sil.add(s.add.image(-500 + i * 330, -150 - (i % 2) * 120, "f2_t_meio").setTintFill(0x03060c).setScale(1.8, 5).setRotation(-0.6 + i * 0.4));
    const sea = (k) => (has(k) ? k : "r2_sea");
    this.seaFar = s.add.tileSprite(W / 2, 640, W + 600, 145, sea("f2_sea_far")).setScrollFactor(0.2).setDepth(3);
    this.seaMid = s.add.tileSprite(W / 2, 800, W + 600, 331, sea("f2_sea_mid")).setScrollFactor(0.45).setDepth(5);
    this.waves = s.add.tileSprite(W / 2, 1080, W + 600, 300, sea("f2_waves_front")).setDepth(38).setTint(0xdde6ef);
    this.waves2 = s.add.tileSprite(W / 2, 1120, W + 600, 220, sea("f2_waves_front")).setDepth(39).setTint(0x6f8298).setAlpha(0.85).setFlipX(true);
    this.wind = 0.35; this.windTarget = 0.35; this.gust = 0; this.lightningIn = 3;
    const layer = (speed, scale, alpha, qty, depth) => s.add.particles(0, 0, "f2_rain", {
      x: { min: -500, max: W + 500 }, y: -80, lifespan: 1400,
      speedY: { min: speed * 0.9, max: speed * 1.1 },
      speedX: { onEmit: () => this.wind * speed },
      rotate: { onEmit: () => (-Math.atan(this.wind) * 180) / Math.PI },
      scaleX: scale, scaleY: { min: scale * 0.7, max: scale * 1.3 },
      alpha: { min: alpha * 0.6, max: alpha }, quantity: qty, frequency: 16, blendMode: "ADD",
    }).setDepth(depth);
    layer(900, 0.5, 0.28, 3, 1.5);
    layer(1300, 0.8, 0.45, 3, 27);
    layer(1800, 1.3, 0.6, 2, 90);
    this.bolt = s.add.graphics().setDepth(1.8).setBlendMode("ADD");
    // Arte aprovada (Daniel, lote Gemini v2): relampago_sheet 4x2 (384x512) e agua_spray_sheet 6x4 (256x256)
    this.boltSprite = has("f2_relampago") ? s.add.sprite(0, 0, "f2_relampago", 0).setOrigin(0.5, 0).setBlendMode("ADD").setDepth(1.85).setAlpha(0) : null;
    if (has("f2_spray")) {
      const mk = (key, a, b, rate) => { if (!s.anims.exists(key)) s.anims.create({ key, frames: s.anims.generateFrameNumbers("f2_spray", { start: a, end: b }), frameRate: rate, repeat: 0 }); };
      mk("f2-splash", 0, 5, 16);
      mk("f2-wave", 6, 11, 12);
      mk("f2-wave2", 12, 17, 12);
      if (!s.anims.exists("f2-rain")) s.anims.create({ key: "f2-rain", frames: s.anims.generateFrameNumbers("f2_spray", { start: 18, end: 23 }), frameRate: 10, repeat: -1 });
      this.splashPool = [];
      for (let i = 0; i < 8; i++) this.splashPool.push(s.add.sprite(0, 0, "f2_spray", 0).setOrigin(0.5, 0.85).setDepth(36.5).setVisible(false).on("animationcomplete", function () { this.setVisible(false); }));
      // cortina de chuva desenhada (linha 4), em 2 faixas na frente
      this.rainSheets = [];
      for (let i = 0; i < 8; i++) {
        const r = s.add.sprite(-120 + i * 300, 120 + (i % 2) * 380, "f2_spray", 18).setScale(1.4).setOrigin(0.5).setDepth(88).setAlpha(0.32).setBlendMode("ADD");
        r.play({ key: "f2-rain", startFrame: i % 6 });
        r.setScrollFactor(0);
        this.rainSheets.push(r);
      }
    }
    this.flashRect = s.add.rectangle(W / 2, H / 2, W + 1200, H + 1200, 0xdfeaff, 0).setScrollFactor(0).setDepth(96);
    s.add.rectangle(W / 2, H / 2, W + 1200, H + 1200, 0x0a1a33, 0.18).setScrollFactor(0).setDepth(60).setBlendMode("MULTIPLY");
    this.flashT = 0; this.boltT = 0; this.silT = 0; this.peak = 0.5;
  }
  flash(alpha) {
    this.flashT = 1;
    this.peak = this.s.reduceFlash ? Math.min(alpha, 0.15) : alpha;
  }
  lightning(force) {
    const g = this.bolt;
    g.clear();
    let x = 200 + Math.random() * 1500, y = -20;
    g.lineStyle(6, 0xe8f2ff, 1);
    g.beginPath(); g.moveTo(x, y);
    while (y < 560) { x += (Math.random() - 0.5) * 120; y += 40 + Math.random() * 50; g.lineTo(x, y); }
    g.strokePath();
    this.boltT = 0.22; this.silT = 0.35;
    if (this.boltSprite) {
      g.clear();
      const sc = 0.9 + Math.random() * 0.5;
      this.boltSprite.setFrame(Math.floor(Math.random() * 8)).setPosition(200 + Math.random() * 1500, -10).setScale(Math.random() < 0.5 ? -sc : sc, sc).setAlpha(1);
    }
    this.flash(0.55);
    const far = Math.random();
    this.s.sfx("thunder", { delay: force ? 0.1 : 0.4 + far * 1.6, far: far > 0.5, volume: 1 - far * 0.4 });
    this.lightningIn = this.s.fury ? 3 + Math.random() * 4 : 6 + Math.random() * 8;
    this.lastBolt = this.s.clock;
    this.s.cc0?.lightning(this.boltSprite ? this.boltSprite.x : x, 0);
  }
  /** Respingo desenhado (arte aprovada); kind: splash | wave | wave2. */
  splash(x, y, kind = "splash", scale = 1) {
    if (!this.splashPool) return false;
    const sp = this.splashPool.find((p) => !p.visible) || this.splashPool[0];
    sp.setVisible(true).setPosition(x, y).setScale(scale).setFlipX(Math.random() < 0.5).play(`f2-${kind}`);
    return true;
  }
  update(dt, t, amp, rise) {
    this.gust -= dt;
    if (this.gust <= 0) {
      this.gust = 3 + Math.random() * 5;
      this.windTarget = (this.s.fury ? 0.55 : 0.3) + Math.random() * 0.5;
    }
    this.wind = lerp(this.wind, this.windTarget, dt * 1.2);
    this.seaFar.setY(640 + Math.sin(t * 1.3) * 7 * amp + rise * 0.5); this.seaFar.tilePositionX += dt * 30;
    this.seaMid.setY(800 + Math.sin(t * 1.6 + 1) * 22 * amp + rise); this.seaMid.tilePositionX += dt * 70;
    this.waves.setY(1080 + Math.sin(t * 2 + 2) * 26 * amp + rise * 0.6); this.waves.tilePositionX += dt * 140;
    this.waves2.setY(1120 + Math.sin(t * 2.4) * 18 * amp); this.waves2.tilePositionX -= dt * 200;
    this.clouds.tilePositionX += dt * (20 + this.wind * 50);
    this.clouds2.tilePositionX += dt * (35 + this.wind * 80);
    this.lightningIn -= dt;
    if (this.lightningIn <= 0 && this.s.mode !== "end") this.lightning(false);
    this.boltT -= dt;
    this.bolt.setAlpha(clamp(this.boltT / 0.22, 0, 1));
    if (this.boltSprite) this.boltSprite.setAlpha(this.boltT > 0.12 ? 1 : clamp(this.boltT / 0.12, 0, 1) * (Math.sin(t * 90) > -0.3 ? 1 : 0.4));
    if (this.rainSheets) for (const r of this.rainSheets) { r.x += (this.wind * 260 + 40) * dt; if (r.x > 2200) r.x -= 2400; }
    this.flashT = Math.max(0, this.flashT - dt / 0.18);
    this.flashRect.setAlpha(this.flashT * this.peak);
    this.silT = Math.max(0, this.silT - dt);
    this.sil.setAlpha(this.silT > 0.15 ? 0.85 : this.silT * 4);
  }
}
