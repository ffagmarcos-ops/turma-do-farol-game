// @ts-nocheck
/**
 * CHUNKS: a fase é uma panorâmica única, mas cada pedaço (1920 px) só é MONTADO quando a câmera chega
 * perto (1 chunk de folga) e DESMONTADO quando fica longe (2 chunks), sem tela de loading.
 * Camadas por chunk: colisão (solids/oneway), interação (conchas/checkpoints), inimigos, segredos (cobertura), decor.
 * O estado (conchas pegas, caranguejos derrotados) fica na cena, então remontar não "ressuscita" nada.
 */
import Phaser from "../phaser.js";
import { SECTOR_ART } from "./Fase3Assets.js";
import { tileKey, propKey } from "./Fase3Loader.js";
import { Crab } from "./Crab.js";
import { Macaco } from "./Macaco.js";
import { ToninhoHelper, NauticalRope } from "./ToninhoHelper.js";
import { MarinaHelper } from "./MarinaHelper.js";

export const DEPTH = { ground: 0, wash: 1, back: -2, interior: -3, pickup: 5, checkpoint: 4, enemy: 8, cover: 15, front: 16 };
const BUILD_MARGIN = 1920, KEEP_MARGIN = 3840, BOTTOM = 1240;

export class ChunkManager {
  constructor(scene, level) {
    this.scene = scene; this.level = level; this.built = new Map();
    this.solids = scene.physics.add.staticGroup();
    this.oneway = scene.physics.add.staticGroup();
    this.crabs = []; this.monkeys = []; this.shells = scene.physics.add.group({ allowGravity: false, immovable: true });
    this.checkpoints = []; this.covers = []; this.waters = [];
    this.crumbles = []; this.movers = []; this.trickles = []; this.waveHits = [];
    this.toninhos = []; this.marinas = []; this.ropes = [];
  }
  update(camLeft, camRight, force = false) {
    for (const c of this.level.chunks) {
      const near = c.x0 < camRight + BUILD_MARGIN && c.x1 > camLeft - BUILD_MARGIN;
      const far = c.x1 < camLeft - KEEP_MARGIN || c.x0 > camRight + KEEP_MARGIN;
      if (near && !this.built.has(c.id)) this.build(c);
      else if (far && this.built.has(c.id)) this.unbuild(c.id);
    }
  }
  tiles(c, set) {
    const art = SECTOR_ART[c.art];
    const top = set === "rock" ? "rock_top" : "sand_top", fill = set === "rock" ? "rock_fill" : "sand_fill";
    return { top: tileKey(c.art, top), fill: tileKey(c.art, fill), surf: art.tiles[top].surfaceY || 0 };
  }
  solid(x, y, w, h, objs) {
    const z = this.scene.add.zone(x + w / 2, y + h / 2, w, h).setData("solid", true);
    this.solids.add(z); objs.push(z); return z;
  }
  tileRect(x, y, w, h, t, depth, objs, outline) {
    const s = this.scene;
    if (h >= 100) {
      const topH = Math.min(128, h + t.surf);
      objs.push(s.add.tileSprite(x, y - t.surf, w, topH, t.top).setOrigin(0).setTilePosition(x, 0).setDepth(depth));
      if (h + t.surf > 128) objs.push(s.add.tileSprite(x, y - t.surf + 128, w, h + t.surf - 128, t.fill).setOrigin(0).setTilePosition(x, 0).setDepth(depth));
    } else objs.push(s.add.tileSprite(x, y, w, h, t.fill).setOrigin(0).setTilePosition(x, y).setDepth(depth));
    if (outline) objs.push(s.add.rectangle(x + w / 2, y + h / 2, w, h).setStrokeStyle(4, 0x2a1a10).setDepth(depth + 0.01));
  }
  build(c) {
    const s = this.scene, objs = [], crabs = [], monkeys = [], toninhos = [], marinas = [], ropes = [], G = 900;
    for (const g of c.ground || []) {
      const y = g.y ?? G;
      this.tileRect(g.x, y, g.w, BOTTOM - y, this.tiles(c, g.tiles), DEPTH.ground, objs, y < G);
      this.solid(g.x, y, g.w, BOTTOM - y, objs);
    }
    for (const bl of c.blocks || []) {
      this.tileRect(bl.x, bl.y, bl.w, bl.h, this.tiles(c, bl.tiles || "rock"), DEPTH.ground + 0.1, objs, true);
      this.solid(bl.x, bl.y, bl.w, bl.h, objs);
      if (bl.wet && bl.h >= 100) {
        const count = Math.max(1, Math.floor(bl.w / 140));
        for (let i = 0; i < count; i++) {
          const tx = bl.x + 36 + i * ((bl.w - 72) / Math.max(1, count));
          const tr = s.add.tileSprite(tx, bl.y + 12, 10, bl.h - 20, "f3_espuma")
            .setOrigin(0.5, 0).setAlpha(0.32).setTint(0xbff7ff).setDepth(DEPTH.ground + 0.15);
          objs.push(tr);
          this.trickles.push({ ts: tr, speed: 55 + (i % 2) * 20, chunk: c.id });
        }
      }
    }
    const art = SECTOR_ART[c.art];
    for (const p of c.platforms || []) {
      const def = art.tiles[p.kind] || art.tiles.log;
      const baseY = p.y - (def.surfaceY || 0);
      const ts = s.add.tileSprite(p.x, baseY, p.w, def.h, tileKey(c.art, p.kind)).setOrigin(0).setTilePosition(p.x, 0).setDepth(DEPTH.ground + 0.2);
      objs.push(ts);
      const z = s.add.zone(p.x + p.w / 2, p.y + 12, p.w, 24).setData("oneway", true);
      this.oneway.add(z); objs.push(z);
      if (p.crumble || p.kind === "crumble") {
        this.crumbles.push({ def: p, ts, zone: z, baseX: p.x, baseY, state: "idle", t: 0, puffT: 0, chunk: c.id });
      }
      if (p.moveX || p.moveY) {
        this.movers.push({ def: p, ts, zone: z, baseX: p.x, baseY, surfY: def.surfaceY || 0, prevX: p.x, prevY: p.y, chunk: c.id });
      }
    }
    for (const w of c.water || []) {
      const wat = s.makeWater(w); objs.push(...wat.objs); this.waters.push(wat);
    }
    for (const wh of c.waveHits || []) {
      this.waveHits.push({ ...wh, chunk: c.id, lastCycle: -1 });
    }
    for (const d of c.decor || []) {
      const key = propKey(c.art, d.kind);
      if (!s.textures.exists(key)) continue;
      objs.push(s.add.image(d.x, d.y, key).setOrigin(0.5, 1).setScale(d.scale || 1).setFlipX(Boolean(d.flip)).setDepth(d.front ? DEPTH.front : DEPTH.back));
    }
    for (const sec of c.secrets || []) {
      const z = sec.zone, cv = sec.cover;
      objs.push(s.add.rectangle(z.x + z.w / 2, z.y + z.h / 2, z.w, z.h, 0x2e2420).setDepth(DEPTH.interior));
      const t = this.tiles(c, "rock"), cover = s.add.container(0, 0).setDepth(DEPTH.cover);
      cover.add(s.add.tileSprite(cv.x, cv.y - t.surf, cv.w, 128, t.top).setOrigin(0).setTilePosition(cv.x, 0));
      cover.add(s.add.tileSprite(cv.x, cv.y - t.surf + 128, cv.w, cv.h + t.surf - 128, t.fill).setOrigin(0).setTilePosition(cv.x, 0));
      cover.add(s.add.rectangle(cv.x + cv.w / 2, cv.y + cv.h / 2, cv.w, cv.h).setStrokeStyle(4, 0x2a1a10));
      objs.push(cover); this.covers.push({ sec, cover });
    }
    for (const sh of c.shells || []) {
      if (s.collected.has(sh.id)) continue;
      const im = s.art.img("f3_concha");
      const o = this.shells.create(sh.x, sh.y, im.key).setScale(im.scale * (sh.gold ? 1.45 : 1)).setDepth(DEPTH.pickup);
      if (sh.gold) o.setTint(0xffe08a);
      o.setData({ id: sh.id, value: sh.gold ? 5 : 1, gold: Boolean(sh.gold) });
      o.body.setSize(o.width * 0.8, o.height * 0.8);
      s.tweens.add({ targets: o, y: sh.y - 10, yoyo: true, repeat: -1, duration: 900 + (sh.x % 300), ease: "Sine.easeInOut" });
      objs.push(o);
    }
    for (const cp of c.checkpoints || []) {
      const on = s.cpActive === cp.id || s.cpReached.has(cp.id);
      const spr = s.add.sprite(cp.x, s.levelGroundY(cp.x) + 4, "f3_checkpoint", on ? 1 : 0).setOrigin(0.5, 1).setScale(0.9).setDepth(DEPTH.checkpoint);
      spr.play(on ? "f3_checkpoint-on" : "f3_checkpoint-off");
      const entry = { def: cp, sprite: spr, chunk: c.id }; this.checkpoints.push(entry); objs.push(spr);
    }
    for (const tr of c.triggers || []) {
      if (tr.event === "helpZoneToninho") {
        const th = new ToninhoHelper(s, tr, s.toninhoTriggered?.has(tr.id));
        toninhos.push(th); this.toninhos.push(th);
      } else if (tr.event === "helpZoneMarina") {
        const mh = new MarinaHelper(s, tr, s.marinaTriggered?.has(tr.id));
        marinas.push(mh); this.marinas.push(mh);
      }
    }
    for (const rp of c.ropes || []) {
      const rope = new NauticalRope(s, rp);
      ropes.push(rope); this.ropes.push(rope);
    }
    (c.enemies || []).forEach((e, i) => {
      const uid = `${c.id}-${i}`;
      if (s.defeated.has(uid)) return;
      if (e.type === "monkey") {
        const mk = new Macaco(s, { ...e, uid, y: (e.y ?? s.levelGroundY(e.x)) - 2 });
        monkeys.push(mk); this.monkeys.push(mk);
      } else {
        const crab = new Crab(s, { ...e, uid, y: (e.y ?? s.levelGroundY(e.x)) - 2 });
        crabs.push(crab); this.crabs.push(crab);
      }
    });
    this.built.set(c.id, { objs, crabs, monkeys, toninhos, marinas, ropes });
  }
  updateMechanics(dt, sofia, timeSec, camMid, wantClimb = false) {
    const s = this.scene;
    for (const th of this.toninhos) {
      th.update(dt, sofia, wantClimb);
    }
    for (const mh of this.marinas) {
      mh.update(dt, sofia);
    }
    for (const rp of this.ropes) {
      rp.update(dt, sofia, wantClimb);
    }
    for (const mv of this.movers) {
      if (!mv.ts.active) continue;
      const p = mv.def;
      const ang = timeSec * (p.speed || 1.6) + (p.phase || 0);
      const nx = mv.baseX + Math.sin(ang) * (p.moveX || 0);
      const ny = mv.baseY + Math.sin(ang) * (p.moveY || 0);
      const curPlatY = ny + mv.surfY;
      const dx = nx - mv.prevX, dy = curPlatY - mv.prevY;
      const b = sofia.body;
      const onTop = !sofia.onRope && sofia.grounded && b.bottom >= mv.prevY - 12 && b.bottom <= mv.prevY + 20 && sofia.x >= mv.prevX - 24 && sofia.x <= mv.prevX + p.w + 24;
      mv.ts.setPosition(nx, ny);
      mv.zone.setPosition(nx + p.w / 2, curPlatY + 12);
      mv.zone.body?.updateFromGameObject();
      if (onTop) {
        sofia.sprite.x += dx; sofia.sprite.y += dy;
        b.x += dx; b.y += dy;
      }
      mv.prevX = nx; mv.prevY = curPlatY;
    }
    for (const tr of this.trickles) {
      if (tr.ts.active) tr.ts.tilePositionY -= dt * tr.speed;
    }
    for (const wh of this.waveHits) {
      if (Math.abs(wh.x - camMid) > 1300) continue;
      const period = 3.6, cyc = Math.floor((timeSec + (wh.phase || 0)) / period);
      const phase = ((timeSec + (wh.phase || 0)) % period) / period;
      if (phase < 0.08 && wh.lastCycle !== cyc) {
        wh.lastCycle = cyc;
        s.rockWaveSpray?.(wh.x, wh.y, Math.abs(wh.x - sofia.x) < 750);
      }
    }
    for (const cr of this.crumbles) {
      if (!cr.ts.active) continue;
      const p = cr.def;
      if (cr.state === "idle") {
        const b = sofia.body;
        const onTop = sofia.grounded && b.bottom >= p.y - 8 && b.bottom <= p.y + 18 && sofia.x >= p.x - 24 && sofia.x <= p.x + p.w + 24;
        if (onTop) {
          cr.state = "shaking"; cr.t = 0.52; cr.puffT = 0;
          s.sfx?.crumble?.();
          s.puff?.(p.x + p.w / 2, p.y + 12, 0.45, 0xa38d74);
        }
      } else if (cr.state === "shaking") {
        cr.t -= dt; cr.puffT -= dt;
        cr.ts.x = cr.baseX + Math.sin(timeSec * 65) * 4;
        cr.ts.y = cr.baseY + (1 - Math.max(0, cr.t) / 0.52) * 4;
        if (cr.puffT <= 0) { cr.puffT = 0.16; s.puff?.(p.x + Math.random() * p.w, p.y + 16, 0.3, 0xa38d74); }
        if (cr.t <= 0) {
          cr.state = "fallen"; cr.t = 2.6;
          cr.zone.setData("disabled", true);
          if (cr.zone.body) { cr.zone.body.enable = false; cr.zone.body.checkCollision.none = true; }
          s.sfx?.collapse?.();
          s.puff?.(p.x + p.w / 2, p.y + 18, 0.75, 0x8d7862);
          s.tweens.add({ targets: cr.ts, y: cr.baseY + 110, alpha: 0, duration: 340, ease: "Quad.easeIn" });
        }
      } else if (cr.state === "fallen") {
        cr.t -= dt;
        if (cr.t <= 0) {
          cr.state = "idle";
          s.tweens.killTweensOf(cr.ts);
          cr.ts.setPosition(cr.baseX, cr.baseY).setAlpha(0);
          s.tweens.add({ targets: cr.ts, alpha: 1, duration: 260 });
          cr.zone.setData("disabled", false);
          if (cr.zone.body) { cr.zone.body.enable = true; cr.zone.body.checkCollision.none = false; }
        }
      }
    }
  }
  unbuild(id) {
    const b = this.built.get(id); if (!b) return;
    for (const crab of b.crabs) { if (crab.alive) crab.sprite.destroy(); }
    for (const mk of b.monkeys || []) mk.destroy();
    for (const th of b.toninhos || []) th.destroy();
    for (const mh of b.marinas || []) mh.destroy();
    for (const rp of b.ropes || []) rp.destroy();
    this.crabs = this.crabs.filter((cr) => !b.crabs.includes(cr));
    this.monkeys = this.monkeys.filter((mk) => !(b.monkeys || []).includes(mk));
    this.toninhos = this.toninhos.filter((th) => !(b.toninhos || []).includes(th));
    this.marinas = this.marinas.filter((mh) => !(b.marinas || []).includes(mh));
    this.ropes = this.ropes.filter((rp) => !(b.ropes || []).includes(rp));
    this.checkpoints = this.checkpoints.filter((e) => e.chunk !== id);
    this.crumbles = this.crumbles.filter((cr) => cr.chunk !== id);
    this.movers = this.movers.filter((mv) => mv.chunk !== id);
    this.trickles = this.trickles.filter((tr) => tr.chunk !== id);
    this.waveHits = this.waveHits.filter((wh) => wh.chunk !== id);
    for (const o of b.objs) { this.scene.tweens.killTweensOf(o); o.destroy(); }
    this.covers = this.covers.filter((cv) => cv.cover.active);
    this.waters = this.waters.filter((w) => w.objs[0].active);
    this.built.delete(id);
  }
}
