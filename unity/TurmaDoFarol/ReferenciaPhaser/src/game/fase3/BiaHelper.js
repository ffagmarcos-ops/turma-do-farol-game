// @ts-nocheck
/** Setor L: a própria Bia investiga a pista. Não cria uma segunda personagem. */
import { SECTOR_ART } from "./Fase3Assets.js";
import { tileKey } from "./Fase3Loader.js";

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

    // Plataformas secretas da rota superior que a Bia revela
    this.secretPlatforms = (def.secretPlatforms || []).map((p, idx) => {
      const art = SECTOR_ART[def.sector || "L"];
      const defPlat = art.tiles?.[p.kind] || { h: 64, surfaceY: 6 };
      const baseY = p.y - (defPlat.surfaceY || 0);
      const ts = scene.add
        .tileSprite(p.x, baseY - (alreadyTriggered ? 0 : 36), p.w, defPlat.h, tileKey(def.sector || "L", p.kind))
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

    this.pathRevealed = alreadyTriggered;
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

  update(dt, bia) {
    if (this.pathRevealed) return;
    const d = this.def;
    const inside = bia.x >= d.x && bia.x <= d.x + d.w && bia.y >= d.y && bia.y <= d.y + d.h;
    if (inside && bia.grounded && Math.abs(bia.body.velocity.x) < 25) {
      bia.startAction("discover", () => {
        this.scene.toast("A Bia descobriu o caminho nas copas!", 260, "#FFE08A");
        this.revealSecretPath();
      });
    }
  }

  destroy() {
    if (this.scene.sofia?.action === "discover") this.scene.sofia.cancelAction();
    for (const p of this.secretPlatforms) {
      p.ts?.destroy();
      p.zone?.destroy();
    }
  }
}
