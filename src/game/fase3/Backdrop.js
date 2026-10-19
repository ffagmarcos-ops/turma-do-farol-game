// @ts-nocheck
/**
 * PARALLAX + ÁGUA da Fase 3.
 * Camadas: 0 céu (0) · 1 ilhas distantes (0,07) · 2 oceano distante (0,2) · 3 árvores/costão (0,42)
 *          4 = JOGO (1,0, montado pelo ChunkManager) · 5 folhagem próxima (1,15) · 6 folhas desfocadas (1,38).
 * Cada camada é um TileSprite fixo na tela (scrollFactor 0) cujo tilePosition anda com a câmera × factor.
 * Água: 3 faixas de cristas animadas (velocidades/alturas diferentes), brilho especular (partículas ADD),
 * reflexo do céu (no gradiente do oceano) e ondas que chegam na areia (crista + espuma na beira).
 */
import Phaser from "../phaser.js";
import { SECTOR_ART } from "./Fase3Assets.js";
import { layerKey } from "./Fase3Loader.js";

const W = 1920, H = 1080, PAD = 140; // folga para o zoom de vista (0,94) não mostrar borda
const DEPTH = { 0: -100, 1: -90, 2: -80, 3: -60, 5: 20, 6: 25 };

export class Backdrop {
  constructor(scene, sectorId, art) {
    this.scene = scene; this.layers = []; this.t = 0;
    const S = SECTOR_ART[sectorId];
    for (const L of S.layers) {
      const info = art.layers[layerKey(sectorId, L.n)];
      const scale = info.final || info.key === L.fallbackKey ? H / info.h : 1;
      const y = info.final || info.key === L.fallbackKey ? 0 : info.y;
      const h = (info.final || info.key === L.fallbackKey ? H : info.h);
      const ts = scene.add.tileSprite(-PAD, y - (L.n === 0 || L.n === 6 ? PAD : 0), W + PAD * 2, h * 1 + (L.n === 0 || L.n === 6 ? PAD * 2 : 0), info.key)
        .setOrigin(0).setScrollFactor(0).setDepth(DEPTH[L.n]).setTileScale(scale).setAlpha(L.alpha ?? 1);
      this.layers.push({ L, ts, scale });
      if (L.animatedWater) this.makeOcean(y);
    }
    this.makeGulls();
    // poeira/brilho no ar (partículas de ambiente)
    if (scene.textures.exists("f3_poeira")) {
      this.dust = scene.add.particles(0, 0, "f3_poeira", {
        x: { min: 0, max: W }, y: { min: 200, max: 900 }, lifespan: 6000, speedX: { min: 8, max: 30 }, speedY: { min: -8, max: 6 },
        scale: { min: 0.05, max: 0.12 }, alpha: { start: 0, end: 0, ease: (t) => Math.sin(t * Math.PI) * 0.5 }, frequency: 380, quantity: 1,
      }).setScrollFactor(0).setDepth(22);
    }
  }
  makeOcean(oceanTop) {
    const s = this.scene;
    this.waves = [];
    const bands = [
      { y: oceanTop + 22, sc: 0.45, f: 0.24, speed: 10, bob: 2, a: 0.55 },
      { y: oceanTop + 70, sc: 0.65, f: 0.3, speed: -16, bob: 3, a: 0.65 },
      { y: oceanTop + 130, sc: 0.85, f: 0.38, speed: 22, bob: 4, a: 0.75 },
    ];
    for (const b of bands) {
      const ts = s.add.tileSprite(-PAD, b.y, W + PAD * 2, 96, "f3_crista_onda").setOrigin(0, 0).setScrollFactor(0).setDepth(-79).setTileScale(b.sc, b.sc).setAlpha(b.a);
      this.waves.push({ ...b, ts, off: Math.random() * 500 });
    }
    // brilho especular do sol na água
    this.sparkle = s.add.particles(0, 0, "f3_brilho", {
      x: { min: 0, max: W }, y: { min: oceanTop + 8, max: oceanTop + 190 }, lifespan: { min: 500, max: 1100 },
      scale: { start: 0.2, end: 0.55 }, alpha: { start: 0.9, end: 0 }, frequency: 70, quantity: 1, blendMode: "ADD",
    }).setScrollFactor(0).setDepth(-78);
    // ondas que chegam na areia: crista atrás da beira + espuma na areia
    this.shore = s.add.tileSprite(-PAD, 850, W + PAD * 2, 96, "f3_crista_onda").setOrigin(0).setScrollFactor(0, 1).setDepth(-1).setTileScale(1.1, 0.9).setAlpha(0.95);
    this.wash = s.add.graphics().setDepth(1);
    this.foam = s.add.particles(0, 0, "f3_espuma", {
      lifespan: 700, speedY: { min: -120, max: -40 }, speedX: { min: -40, max: 40 }, gravityY: 300, scale: { start: 0.35, end: 0 }, alpha: { start: 0.9, end: 0 }, emitting: false,
    }).setDepth(2);
  }
  makeGulls() {
    const s = this.scene;
    if (!s.anims.exists("seagull-fly")) return;
    this.gulls = [0, 1, 2].map((i) => s.add.sprite(300 + i * 700, 180 + i * 60, "seagull").play({ key: "seagull-fly", startFrame: i }).setScale(0.11 - i * 0.015).setScrollFactor(0).setDepth(-85).setAlpha(0.9));
  }
  /** shoreFrom/To: trecho da praia (em x do mundo) onde as ondas chegam na areia */
  update(dt, cam, shore) {
    this.t += dt;
    const sx = cam.scrollX;
    for (const { L, ts, scale } of this.layers) {
      ts.tilePositionX = (sx * L.factor) / scale + (L.n === 0 ? this.t * 3 : 0);
    }
    for (const w of this.waves || []) {
      w.ts.tilePositionX = (sx * w.f + this.t * w.speed + w.off) / w.sc;
      w.ts.y = w.y + Math.sin(this.t * 1.3 + w.off) * w.bob;
    }
    for (const g of this.gulls || []) {
      g.x += dt * 40; if (g.x > 2100) { g.x = -150; g.y = 150 + Math.random() * 180; }
    }
    if (!this.shore) return;
    // vai e vem da onda (ciclo de ~4,5 s)
    const cyc = (this.t % 4.5) / 4.5, surge = Math.max(0, Math.sin(cyc * Math.PI * 2));
    const onShore = shore && cam.scrollX + W > shore.from && cam.scrollX < shore.to;
    this.shore.setVisible(onShore);
    this.wash.clear();
    if (!onShore) return;
    this.shore.tilePositionX = (sx * 0.9 + this.t * 30) / 1.1;
    this.shore.y = 868 - surge * 24;
    const x0 = Math.max(shore.from, sx - 50), x1 = Math.min(shore.to, sx + W + 50), y0 = shore.y;
    // areia molhada (mais escura) + renda de espuma que avança e recua
    this.wash.fillStyle(0xb88f55, 0.35 * surge + 0.12);
    this.wash.fillRect(x0, y0 + 2, x1 - x0, 10 + surge * 6);
    this.wash.fillStyle(0xffffff, 0.75 * surge);
    this.wash.beginPath(); this.wash.moveTo(x0, y0 + 2);
    for (let x = x0; x <= x1; x += 24) this.wash.lineTo(x, y0 + 4 + surge * (6 + Math.sin(x * 0.03 + this.t * 2) * 4));
    this.wash.lineTo(x1, y0 + 2); this.wash.closePath(); this.wash.fillPath();
    if (surge > 0.92 && Math.random() < 0.5) this.foam.emitParticleAt(sx + Math.random() * W, y0 - 4, 2);
    this.surge = surge;
  }
}

/** Câmera: deadzone horizontal, look-ahead, antecipação ao cair, zoom de vista e tremida leve. */
export class Fase3Camera {
  constructor(scene, bounds) {
    this.scene = scene; this.cam = scene.cameras.main;
    this.cam.setBounds(bounds.x, bounds.y, bounds.w, bounds.h);
    this.look = 0; this.cx = null; this.cy = null; this.zoom = 1;
  }
  snap(x, y) { this.cx = x; this.cy = y; this.look = 0; this.cam.centerOn(x, y); }
  update(dt, sofia, zoomTarget = 1) {
    const vx = sofia.body.velocity.x, vy = sofia.body.velocity.y;
    const lookTarget = Math.abs(vx) > 60 ? Math.sign(vx) * (Math.abs(vx) > 400 ? 300 : 200) : sofia.facing * 110;
    this.look += (lookTarget - this.look) * Math.min(1, dt * 1.6);
    const fx = sofia.x + this.look, DZ = 110;
    if (this.cx == null) this.cx = fx;
    if (fx > this.cx + DZ) this.cx += (fx - DZ - this.cx) * Math.min(1, dt * 7);
    else if (fx < this.cx - DZ) this.cx += (fx + DZ - this.cx) * Math.min(1, dt * 7);
    const fall = vy > 350 ? Math.min((vy - 350) * 0.18, 150) : 0;
    const fy = sofia.y - 330 + fall;
    if (this.cy == null) this.cy = fy;
    this.cy += (fy - this.cy) * Math.min(1, dt * (fall ? 5 : 2.5));
    this.zoom += (zoomTarget - this.zoom) * Math.min(1, dt * 0.9);
    this.cam.setZoom(this.zoom);
    this.cam.centerOn(this.cx, this.cy);
  }
  shake(strength = 0.003, ms = 140) { this.cam.shake(ms, strength); }
}
