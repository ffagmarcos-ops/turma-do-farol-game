// @ts-nocheck
/**
 * SETOR L — Bia e o caminho escondido nas copas (Passo 11).
 * - Bia observa marcas antigas nas pedras com sua lupa (sem nunca bloquear a Sofia).
 * - Ao entrar em `helpZoneBia`, ela aponta uma passagem secreta no alto da vegetação (`point`).
 * - Isso faz descer/revelar plataformas e cipós da Rota Superior (opcional, com conchas e concha dourada).
 * - As rotas (inferior pela mata e superior pelas copas) se reencontram no final da bifurcação.
 * - Quando a Sofia alcança o ponto de reencontro (`celebrateX`), a Bia comemora (`cheer`).
 */
import { SPRITES } from "./Fase3Assets.js";

export class BiaHelper {
  constructor(scene, def, alreadyTriggered = false) {
    this.scene = scene;
    this.def = def;
    this.id = def.id;
    this.x = def.biaX;
    this.y = def.biaY;
    this.facing = def.facing ?? 1;
    this.celebrateX = def.celebrateX;
    this.alreadyTriggered = alreadyTriggered;

    const S = SPRITES.bia;
    this.sprite = scene.add
      .sprite(this.x, this.y, S.key, 0)
      .setOrigin(...S.origin)
      .setScale(S.scale)
      .setFlipX(this.facing < 0)
      .setDepth(6.3);

    this.beamGfx = scene.add.graphics().setDepth(12.5);

    // Plataformas secretas da rota superior que a Bia revela
    this.secretPlatforms = (def.secretPlatforms || []).map((p, idx) => {
      const art = scene.art;
      const defPlat = art.tiles?.[p.kind] || { h: 64, surfaceY: 6 };
      const baseY = p.y - (defPlat.surfaceY || 0);
      const ts = scene.add
        .tileSprite(p.x, baseY - (alreadyTriggered ? 0 : 36), p.w, defPlat.h, p.kind)
        .setOrigin(0)
        .setTilePosition(p.x, 0)
        .setAlpha(alreadyTriggered ? 1 : 0)
        .setDepth(11.8);
      const zone = scene.add.zone(p.x + p.w / 2, p.y + 12, p.w, 24).setData("oneway", true);
      scene.chunks.oneway.add(zone);
      if (!alreadyTriggered) {
        zone.setData("disabled", true);
        if (zone.body) {
          zone.body.enable = false;
          zone.body.checkCollision.none = true;
        }
      }
      return { def: p, ts, zone, baseY, revealed: alreadyTriggered };
    });

    if (alreadyTriggered) {
      this.state = "point";
      this.t = 0;
      this.sprite.play("f3_bia-point", true);
    } else {
      this.state = "inspect";
      this.t = 0;
      this.sprite.play("f3_bia-inspect", true);
    }
  }

  revealSecretPath() {
    if (this.pathRevealed) return;
    this.pathRevealed = true;
    this.scene.sfx?.secretPathReveal?.();
    this.scene.onBiaTriggered?.(this.id);

    // Efeito de estrelas indicando a subida para as copas
    for (let k = 0; k < 6; k++) {
      const sx = this.x + this.facing * (60 + k * 45);
      const sy = this.y - 60 - k * 50;
      this.scene.time.delayedCall(k * 120, () => {
        this.scene.stars(sx, sy);
        this.scene.puff?.(sx, sy, 0.4, 0xbff7ff);
      });
    }

    // Animação das plataformas secretas descendo suavemente
    this.secretPlatforms.forEach((p, idx) => {
      this.scene.time.delayedCall(idx * 160, () => {
        p.revealed = true;
        p.zone.setData("disabled", false);
        if (p.zone.body) {
          p.zone.body.enable = true;
          p.zone.body.checkCollision.none = false;
        }
        this.scene.tweens.add({
          targets: p.ts,
          y: p.baseY,
          alpha: 1,
          duration: 380,
          ease: "Back.easeOut",
        });
      });
    });
  }

  update(dt, sofia) {
    this.t += dt;
    const def = this.def;

    if (this.state === "inspect" || this.state === "idle") {
      const inside =
        sofia.x >= def.x &&
        sofia.x <= def.x + def.w &&
        sofia.y >= def.y &&
        sofia.y <= def.y + def.h;

      if (inside) {
        this.state = "point";
        this.t = 0;
        this.sprite.play("f3_bia-point", true);
        this.scene.sfx?.biaPoint?.();
        this.scene.toast("A Bia indicou o caminho nas copas!", 260, "#FFE08A");
        this.revealSecretPath();
      } else {
        // Alterna entre olhar com lupa (inspect) e olhar ao redor (idle)
        if (this.t > 3.4) {
          this.t = 0;
          const next = this.state === "inspect" ? "idle" : "inspect";
          this.state = next;
          this.sprite.play(next === "inspect" ? "f3_bia-inspect" : "f3_bia-idle", true);
        }
      }
    } else if (this.state === "point") {
      if (this.celebrateX && sofia.x >= this.celebrateX) {
        this.state = "celebrate";
        this.t = 0;
        this.sprite.play("f3_bia-cheer", true);
        this.scene.audio?.synth?.("gold3");
      }
    }
  }

  destroy() {
    this.beamGfx?.destroy();
    this.sprite?.destroy();
    for (const p of this.secretPlatforms) {
      p.ts?.destroy();
      p.zone?.destroy();
    }
  }
}
