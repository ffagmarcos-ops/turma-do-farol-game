// @ts-nocheck
/**
 * SETOR I — Lucas e o aparelho de boias/plataformas flutuantes (Passo 9).
 * - Lucas fica na margem do riacho (sem nunca bloquear a Sofia).
 * - Ao entrar em `helpZoneLucas`, ele se ajoelha mexendo no aparelho (`operateGadget`),
 *   dispara o pulso de ativação (`activate`) e faz emergir em sequência 4–5 boias/plataformas
 *   flutuantes na água (`buoys`).
 * - Algumas boias oscilam com a correnteza e afundam um pouco com o peso da Sofia (`sinkDepth`),
 *   voltando à superfície quando ela sai.
 * - Quando a Sofia chega ao outro lado (`celebrateX`), o Lucas comemora (`celebrate`).
 */
import { SPRITES } from "./Fase3Assets.js";

const SURF_Y = 8; // altura da superfície onde o pé da Sofia pisa no sprite f3_boia_lucas (168×58)

export class LucasHelper {
  constructor(scene, def, alreadyTriggered = false) {
    this.scene = scene;
    this.def = def;
    this.id = def.id;
    this.x = def.lucasX;
    this.y = def.lucasY;
    this.facing = def.facing ?? 1;

    const S = SPRITES.lucas;
    const useAtlas = scene.textures.exists("lucas_device");
    this.useAtlas = useAtlas;
    const key = useAtlas ? "lucas_device" : S.key;
    const initialFrame = useAtlas ? "f000" : 0;
    const scale = useAtlas ? 0.62 : S.scale;
    const origin = useAtlas ? [0.5, 0.95] : S.origin;
    this.sprite = scene.add
      .sprite(this.x, this.y, key, initialFrame)
      .setOrigin(...origin)
      .setScale(scale)
      .setFlipX(this.facing < 0)
      .setDepth(6.3);

    this.pulseGfx = scene.add.graphics().setDepth(12.6);
    this.foamGfx = scene.add.graphics().setDepth(12.2);

    const im = scene.art.img("f3_boia_lucas");
    this.buoys = (def.buoys || []).map((b, idx) => {
      const w = b.w || 168;
      const spr = scene.add
        .image(b.x + w / 2, b.y + 42, im.key)
        .setOrigin(0.5, 0)
        .setDisplaySize(w, 58)
        .setAlpha(0)
        .setDepth(12.3);
      const zone = scene.add.zone(b.x + w / 2, b.y + 12, w - 16, 24).setData("oneway", true);
      scene.chunks.oneway.add(zone);
      zone.setData("disabled", true);
      if (zone.body) {
        zone.body.enable = false;
        zone.body.checkCollision.none = true;
      }
      return {
        def: b,
        idx,
        w,
        baseX: b.x,
        baseY: b.y,
        oscAmp: b.oscAmp ?? 8,
        oscSpeed: b.oscSpeed ?? 2.1,
        phase: b.phase ?? idx * 1.15,
        sinkDepth: b.sinkDepth ?? 22,
        sinkOffset: 0,
        emergeOffset: alreadyTriggered ? 0 : 46,
        active: alreadyTriggered,
        delay: idx * 0.13,
        prevY: b.y,
        wasOnTop: false,
        spr,
        zone,
      };
    });

    if (alreadyTriggered) {
      for (const b of this.buoys) this.enableBuoyImmediate(b);
      this.state = "celebrate";
      this.t = 0;
      this.play("celebrate");
    } else {
      this.state = "idle";
      this.t = 0;
      this.play("idle");
    }
  }

  play(pose) {
    let k = `f3_lucas-${pose}`;
    if (this.useAtlas) {
      const map = {
        idle: "lucas.idle",
        operateGadget: "lucas.assemble",
        activate: "lucas.ready",
        celebrate: "lucas.ready",
      };
      if (map[pose] && this.scene.anims.exists(map[pose])) k = map[pose];
    }
    if (this.scene.anims.exists(k) && this.sprite.anims.currentAnim?.key !== k) {
      this.sprite.play(k, true);
    }
  }

  enableBuoyImmediate(b) {
    b.active = true;
    b.emergeOffset = 0;
    b.spr.setAlpha(1).setPosition(b.baseX + b.w / 2, b.baseY - SURF_Y);
    b.zone.setData("disabled", false);
    if (b.zone.body) {
      b.zone.body.enable = true;
      b.zone.body.checkCollision.none = false;
    }
    b.zone.setPosition(b.baseX + b.w / 2, b.baseY + 12);
    b.zone.body?.updateFromGameObject();
    b.prevY = b.baseY;
  }

  popBuoy(b) {
    if (b.active) return;
    b.active = true;
    b.emergeOffset = 38;
    b.spr.setAlpha(1);
    b.zone.setData("disabled", false);
    if (b.zone.body) {
      b.zone.body.enable = true;
      b.zone.body.checkCollision.none = false;
    }
    this.scene.sfx?.buoyPop?.();
    this.scene.puff?.(b.baseX + b.w / 2, b.baseY + 8, 0.55, 0xd8f8ff);
  }

  update(dt, sofia, timeSec = 0) {
    if (!this.sprite?.active) return;
    const d = this.def;

    if (sofia.x < this.x - 40) this.sprite.setFlipX(true);
    else if (sofia.x > this.x + 40) this.sprite.setFlipX(false);

    if (this.state === "idle") {
      const inZone =
        sofia.x >= d.x &&
        sofia.x <= d.x + d.w &&
        sofia.y >= (d.y ?? 180) &&
        sofia.y <= (d.y ?? 180) + (d.h ?? 820);
      if (inZone) {
        this.state = "operateGadget";
        this.t = 0.42;
        this.play("operateGadget");
        this.scene.sfx?.gadgetBeep?.();
        this.scene.icon?.(this.x, this.y - 190);
      }
    } else if (this.state === "operateGadget") {
      this.t -= dt;
      if (this.t <= 0) {
        this.state = "activate";
        this.t = 0.68;
        this.play("activate");
        this.scene.sfx?.gadgetActivate?.();
        this.scene.onLucasTriggered?.(this.id);
      }
    } else if (this.state === "activate") {
      this.t -= dt;
      const elapsed = 0.68 - Math.max(0, this.t);
      for (const b of this.buoys) {
        if (!b.active && elapsed >= b.delay) this.popBuoy(b);
      }
      // desenha pulso de energia saindo da antena do aparelho do Lucas
      this.pulseGfx.clear();
      const gx = this.x + (this.sprite.flipX ? -28 : 28), gy = this.y - 92;
      const r = 18 + elapsed * 240;
      const alpha = Math.max(0, 0.85 - elapsed * 1.1);
      this.pulseGfx.lineStyle(4, 0x7fe3f2, alpha).strokeCircle(gx, gy, r);
      this.pulseGfx.lineStyle(2, 0xffffff, alpha * 0.8).strokeCircle(gx, gy, r * 0.65);

      if (this.t <= 0) {
        this.pulseGfx.clear();
        for (const b of this.buoys) if (!b.active) this.popBuoy(b);
        this.state = "active";
        this.play("idle");
      }
    } else if (this.state === "active") {
      if (d.celebrateX && sofia.x >= d.celebrateX) {
        this.state = "celebrate";
        this.play("celebrate");
        this.scene.stars?.(this.x, this.y - 165);
        this.scene.sfx?.ready?.();
      }
    }

    // atualiza todas as boias ativas (emergência, oscilação na água e afundamento com o peso da Sofia)
    this.foamGfx.clear();
    const sb = sofia.body;
    for (const b of this.buoys) {
      if (!b.active) continue;
      if (b.emergeOffset > 0) {
        b.emergeOffset = Math.max(0, b.emergeOffset - dt * 150);
      }
      const osc = Math.sin(timeSec * b.oscSpeed + b.phase) * b.oscAmp;
      const onTop =
        !sofia.onRope &&
        sofia.grounded &&
        sb.bottom >= b.prevY - 14 &&
        sb.bottom <= b.prevY + 22 &&
        sofia.x >= b.baseX - 20 &&
        sofia.x <= b.baseX + b.w + 20;

      if (onTop) {
        if (!b.wasOnTop) {
          this.scene.puff?.(b.baseX + b.w / 2, b.prevY + 14, 0.35, 0xd8f8ff);
        }
        b.sinkOffset = Math.min(b.sinkDepth, b.sinkOffset + dt * 95);
      } else {
        b.sinkOffset = Math.max(0, b.sinkOffset - dt * 75);
      }
      b.wasOnTop = onTop;

      const curY = b.baseY + osc + b.sinkOffset + b.emergeOffset;
      const dy = curY - b.prevY;

      b.spr.setPosition(b.baseX + b.w / 2, curY - SURF_Y);
      b.zone.setPosition(b.baseX + b.w / 2, curY + 12);
      b.zone.body?.updateFromGameObject();

      if (onTop) {
        sofia.sprite.y += dy;
        sb.y += dy;
      }
      b.prevY = curY;

      // anel de espuma ao redor da boia na linha d'água
      const waterLineY = curY + 28;
      const ripple = Math.sin(timeSec * 4 + b.phase) * 4;
      this.foamGfx.lineStyle(3, 0xe8fbff, 0.72);
      this.foamGfx.strokeEllipse(b.baseX + b.w / 2, waterLineY, b.w + 10 + ripple, 14);
    }
  }

  destroy() {
    this.pulseGfx?.destroy();
    this.foamGfx?.destroy();
    for (const b of this.buoys || []) {
      b.spr?.destroy();
      b.zone?.destroy();
    }
    this.sprite?.destroy();
  }
}
