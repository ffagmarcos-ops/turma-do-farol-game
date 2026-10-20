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
import { JuliaHelper } from "./JuliaHelper.js";
import { LucasHelper } from "./LucasHelper.js";
import { BiaHelper } from "./BiaHelper.js";

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
    this.toninhos = []; this.marinas = []; this.julias = []; this.lucases = []; this.bias = []; this.ropes = [];
    this.waterfalls = []; this.relics = []; this.energyOrbs = []; this.breakables = [];
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
    const s = this.scene, objs = [], crabs = [], monkeys = [], toninhos = [], marinas = [], julias = [], lucases = [], bias = [], ropes = [], G = 900;
    for (const g of c.ground || []) {
      const y = g.y ?? G;
      this.tileRect(g.x, y, g.w, BOTTOM - y, this.tiles(c, g.tiles), DEPTH.ground, objs, y < G);
      const z = this.solid(g.x, y, g.w, BOTTOM - y, objs);
      if (g.slippery || (c.art === "J" && g.tiles === "rock")) z.setData("slippery", true);
    }
    for (const bl of c.blocks || []) {
      this.tileRect(bl.x, bl.y, bl.w, bl.h, this.tiles(c, bl.tiles || "rock"), DEPTH.ground + 0.1, objs, true);
      const z = this.solid(bl.x, bl.y, bl.w, bl.h, objs);
      if (bl.slippery || (c.art === "J" && (bl.wet || bl.tiles === "rock"))) z.setData("slippery", true);
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
      if (p.slippery || (c.art === "J" && (p.kind?.includes("ledge") || p.slippery !== false))) z.setData("slippery", true);
      this.oneway.add(z); objs.push(z);
      if (p.crumble || p.kind === "crumble") {
        this.crumbles.push({ def: p, ts, zone: z, baseX: p.x, baseY, state: "idle", t: 0, puffT: 0, chunk: c.id });
      }
      if (p.moveX || p.moveY || p.sway) {
        let swayGfx = null;
        if (p.sway) {
          swayGfx = s.add.graphics().setDepth(DEPTH.ground + 0.18);
          objs.push(swayGfx);
        }
        this.movers.push({ def: p, ts, zone: z, swayGfx, baseX: p.x, baseY, surfY: def.surfaceY || 0, prevX: p.x, prevY: p.y, chunk: c.id });
      }
    }
    for (const wf of c.waterfalls || []) {
      const imKey = "f3_cortina_cachoeira";
      const ts = s.add.tileSprite(wf.x, wf.y, wf.w, wf.h, imKey)
        .setOrigin(0, 0)
        .setDepth(12)
        .setAlpha(0.88);
      objs.push(ts);
      this.waterfalls.push({ ...wf, ts, chunk: c.id });
    }
    for (const rel of c.relics || []) {
      if (s.collected?.has(rel.id) || s.reliquiaK) continue;
      const spr = s.add.image(rel.x, rel.y, "f3_reliquia_historia")
        .setScale(0.85)
        .setDepth(DEPTH.pickup);
      s.tweens.add({ targets: spr, y: rel.y - 12, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      objs.push(spr);
      this.relics.push({ ...rel, spr, chunk: c.id });
    }
    for (const orb of c.energyOrbs || []) {
      if (s.collected?.has(orb.id)) continue;
      const spr = s.add.image(orb.x, orb.y, "f3_orbe_energia")
        .setScale(0.9)
        .setDepth(DEPTH.pickup);
      s.tweens.add({ targets: spr, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      objs.push(spr);
      this.energyOrbs.push({ ...orb, spr, chunk: c.id });
    }
    for (const br of c.breakables || []) {
      if (s.brokenWalls?.has(br.id)) continue;
      const t = this.tiles(c, br.tiles || "rock");
      const wallContainer = s.add.container(0, 0).setDepth(DEPTH.ground + 0.15);
      const ts = s.add.tileSprite(br.x, br.y, br.w, br.h, t.fill).setOrigin(0).setTilePosition(br.x, br.y);
      wallContainer.add(ts);
      const cracks = s.add.graphics();
      cracks.lineStyle(3.5, 0x1f140e, 0.85);
      cracks.beginPath();
      cracks.moveTo(br.x + br.w * 0.25, br.y + 10);
      cracks.lineTo(br.x + br.w * 0.45, br.y + br.h * 0.4);
      cracks.lineTo(br.x + br.w * 0.35, br.y + br.h * 0.7);
      cracks.lineTo(br.x + br.w * 0.55, br.y + br.h - 10);
      cracks.moveTo(br.x + br.w * 0.45, br.y + br.h * 0.4);
      cracks.lineTo(br.x + br.w * 0.75, br.y + br.h * 0.55);
      cracks.stroke();
      cracks.lineStyle(4, 0x2a1a10, 1);
      cracks.strokeRect(br.x, br.y, br.w, br.h);
      wallContainer.add(cracks);
      objs.push(wallContainer);

      const zone = this.solid(br.x, br.y, br.w, br.h, objs);
      zone.setData("breakable", true);
      zone.setData("breakableId", br.id);

      this.breakables.push({
        id: br.id,
        x: br.x,
        y: br.y,
        w: br.w,
        h: br.h,
        chunk: c.id,
        zone,
        container: wallContainer,
        hp: br.hp || 1,
      });
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
      const useAtlas = s.textures.exists("checkpoint");
      const key = useAtlas ? "checkpoint" : "f3_checkpoint";
      const frame = useAtlas ? (on ? "f001" : "f000") : (on ? 1 : 0);
      const scale = useAtlas ? 0.28 : 0.9;
      const spr = s.add.sprite(cp.x, s.levelGroundY(cp.x) + 4, key, frame).setOrigin(0.5, 1).setScale(scale).setDepth(DEPTH.checkpoint);
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
      } else if (tr.event === "helpZoneJulia") {
        const jh = new JuliaHelper(s, tr);
        julias.push(jh); this.julias.push(jh);
      } else if (tr.event === "helpZoneLucas") {
        const lh = new LucasHelper(s, tr, s.lucasTriggered?.has(tr.id));
        lucases.push(lh); this.lucases.push(lh);
      } else if (tr.event === "helpZoneBia") {
        const bh = new BiaHelper(s, tr, s.biaTriggered?.has(tr.id));
        bias.push(bh); this.bias.push(bh);
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
    this.built.set(c.id, { objs, crabs, monkeys, toninhos, marinas, julias, lucases, bias, ropes });
  }
  updateMechanics(dt, sofia, timeSec, camMid, wantClimb = false) {
    const s = this.scene;
    for (const th of this.toninhos) {
      th.update(dt, sofia, wantClimb);
    }
    for (const mh of this.marinas) {
      mh.update(dt, sofia);
    }
    for (const jh of this.julias) {
      jh.update(dt, sofia);
    }
    for (const lh of this.lucases) {
      lh.update(dt, sofia, timeSec);
    }
    for (const bh of this.bias) {
      bh.update(dt, sofia);
    }
    for (const rp of this.ropes) {
      rp.update(dt, sofia, wantClimb);
    }
    for (const mv of this.movers) {
      if (!mv.ts.active) continue;
      const p = mv.def;
      const ang = timeSec * (p.speed || 1.6) + (p.phase || 0);
      const ampX = p.moveX ?? (p.sway ? 72 : 0);
      const nx = mv.baseX + Math.sin(ang) * ampX;
      const ny = p.sway
        ? mv.baseY - (1 - Math.cos(ang)) * (p.swayLift || 14)
        : mv.baseY + Math.sin(ang) * (p.moveY || 0);
      const curPlatY = ny + mv.surfY;
      const dx = nx - mv.prevX, dy = curPlatY - mv.prevY;
      const b = sofia.body;
      const onTop = !sofia.onRope && sofia.grounded && b.bottom >= mv.prevY - 12 && b.bottom <= mv.prevY + 20 && sofia.x >= mv.prevX - 24 && sofia.x <= mv.prevX + p.w + 24;
      mv.ts.setPosition(nx, ny);
      mv.zone.setPosition(nx + p.w / 2, curPlatY + 12);
      mv.zone.body?.updateFromGameObject();
      if (mv.swayGfx) {
        const topY = p.ropeTopY ?? (mv.baseY - 180);
        const g = mv.swayGfx;
        g.clear();
        for (const offX of [22, p.w - 22]) {
          const ax = mv.baseX + offX, bx = nx + offX, by = curPlatY + 4;
          g.lineStyle(8, 0x2a1a10, 1);
          g.beginPath(); g.moveTo(ax, topY); g.lineTo(bx, by); g.strokePath();
          g.lineStyle(4, 0x4b7d42, 1);
          g.beginPath(); g.moveTo(ax, topY); g.lineTo(bx, by); g.strokePath();
          g.fillStyle(0x6e472b, 1); g.lineStyle(3, 0x2a1a10, 1);
          g.fillCircle(ax, topY, 6); g.strokeCircle(ax, topY, 6);
          g.fillCircle(bx, by, 6); g.strokeCircle(bx, by, 6);
        }
      }
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
    // mecânica de solo/plataforma escorregadia (Setor J - Cachoeira)
    let onSlip = false;
    if (sofia.grounded && !sofia.onRope) {
      const sb = sofia.body;
      for (const z of this.oneway.getChildren()) {
        if (z.getData("slippery") && !z.getData("disabled")) {
          const zb = z.body;
          if (zb && sb.bottom >= zb.top - 6 && sb.bottom <= zb.top + 24 && sb.right >= zb.left && sb.left <= zb.right) {
            onSlip = true; break;
          }
        }
      }
      if (!onSlip) {
        for (const z of this.solids.getChildren()) {
          if (z.getData("slippery")) {
            const zb = z.body;
            if (zb && sb.bottom >= zb.top - 6 && sb.bottom <= zb.top + 24 && sb.right >= zb.left && sb.left <= zb.right) {
              onSlip = true; break;
            }
          }
        }
      }
    }
    sofia.onSlippery = onSlip;
    if (onSlip && Math.abs(sofia.body.velocity.x) > 40 && Math.random() < 0.25) {
      s.puff?.(sofia.x + (Math.random() - 0.5) * 20, sofia.y - 2, 0.28, 0xbff7ff);
    }
    // animação da cortina de água das cachoeiras e revelação de passagem secreta
    for (const wf of this.waterfalls) {
      if (!wf.ts.active) continue;
      wf.ts.tilePositionY -= dt * 380;
      if (wf.secretPassage) {
        const inside = sofia.x >= wf.x - 24 && sofia.x <= wf.x + wf.w + 24 && sofia.y >= wf.y && sofia.y <= wf.y + wf.h + 20;
        const targetAlpha = inside ? 0.28 : 0.88;
        wf.ts.alpha += (targetAlpha - wf.ts.alpha) * Math.min(1, dt * 6);
      }
      if (Math.abs(wf.x + wf.w / 2 - camMid) < 1400 && Math.random() < 0.22) {
        s.puff?.(wf.x + Math.random() * wf.w, wf.y + wf.h - 12, 0.38, 0xd4f6ff);
      }
    }
    // coleta de relíquias antigas da ilha e orbes de energia
    for (let i = this.relics.length - 1; i >= 0; i--) {
      const rel = this.relics[i];
      if (!rel.spr.active) { this.relics.splice(i, 1); continue; }
      if (Math.hypot(sofia.x - rel.x, sofia.y - (rel.y + 36)) < 65) {
        rel.spr.destroy();
        this.relics.splice(i, 1);
        s.collectRelic?.(rel);
      }
    }
    for (let i = this.energyOrbs.length - 1; i >= 0; i--) {
      const orb = this.energyOrbs[i];
      if (!orb.spr.active) { this.energyOrbs.splice(i, 1); continue; }
      if (Math.hypot(sofia.x - orb.x, sofia.y - (orb.y + 30)) < 60) {
        orb.spr.destroy();
        this.energyOrbs.splice(i, 1);
        s.collectEnergyOrb?.(orb);
      }
    }
  }
  unbuild(id) {
    const b = this.built.get(id); if (!b) return;
    for (const crab of b.crabs) { if (crab.alive) crab.sprite.destroy(); }
    for (const mk of b.monkeys || []) mk.destroy();
    for (const th of b.toninhos || []) th.destroy();
    for (const mh of b.marinas || []) mh.destroy();
    for (const jh of b.julias || []) jh.destroy();
    for (const lh of b.lucases || []) lh.destroy();
    for (const bh of b.bias || []) bh.destroy();
    for (const rp of b.ropes || []) rp.destroy();
    this.crabs = this.crabs.filter((cr) => !b.crabs.includes(cr));
    this.monkeys = this.monkeys.filter((mk) => !(b.monkeys || []).includes(mk));
    this.toninhos = this.toninhos.filter((th) => !(b.toninhos || []).includes(th));
    this.marinas = this.marinas.filter((mh) => !(b.marinas || []).includes(mh));
    this.julias = this.julias.filter((jh) => !(b.julias || []).includes(jh));
    this.lucases = this.lucases.filter((lh) => !(b.lucases || []).includes(lh));
    this.bias = this.bias.filter((bh) => !(b.bias || []).includes(bh));
    this.ropes = this.ropes.filter((rp) => !(b.ropes || []).includes(rp));
    this.checkpoints = this.checkpoints.filter((e) => e.chunk !== id);
    this.crumbles = this.crumbles.filter((cr) => cr.chunk !== id);
    this.movers = this.movers.filter((mv) => mv.chunk !== id);
    this.trickles = this.trickles.filter((tr) => tr.chunk !== id);
    this.waveHits = this.waveHits.filter((wh) => wh.chunk !== id);
    this.waterfalls = this.waterfalls.filter((wf) => wf.chunk !== id);
    this.relics = this.relics.filter((rel) => rel.chunk !== id);
    this.energyOrbs = this.energyOrbs.filter((orb) => orb.chunk !== id);
    this.breakables = this.breakables.filter((br) => br.chunk !== id);
    for (const o of b.objs) { this.scene.tweens.killTweensOf(o); o.destroy(); }
    this.covers = this.covers.filter((cv) => cv.cover.active);
    this.waters = this.waters.filter((w) => w.objs[0].active);
    this.built.delete(id);
  }
}
