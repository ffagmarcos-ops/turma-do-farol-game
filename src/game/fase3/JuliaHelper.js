// @ts-nocheck
/**
 * JÚLIA E O FLASH FOTOGRÁFICO — Setor H (Passo 8).
 * Fica numa plataforma lateral/elevada (nunca bloqueia a Sofia) e tira fotos em intervalo regular:
 *  - idle      (observa os macacos com a câmera na mão)
 *  - aimCamera (levanta a câmera ~0,7 s antes do disparo, com bip de foco e mira luminosa)
 *  - snap      (dispara o flash: clarão rápido que deixa os macacos da área tontos por ~2,2 s)
 *  - cheer     (comemora quando a Sofia atravessa o trecho)
 */
import { SPRITES } from "./Fase3Assets.js";

export class JuliaHelper {
  constructor(scene, tr) {
    this.scene = scene;
    this.tr = tr;
    this.id = tr.id;
    this.zone = { x: tr.x, y: tr.y, w: tr.w, h: tr.h };
    this.juliaX = tr.juliaX ?? tr.x + 120;
    this.juliaY = tr.juliaY ?? 680;
    this.interval = tr.interval ?? 3.2;
    this.stunDuration = tr.stunDuration ?? 2.2;
    this.flashRadius = tr.flashRadius ?? 980;

    const J = SPRITES.julia;
    this.J = J;
    const useAtlas = scene.textures.exists("julia_camera");
    this.useAtlas = useAtlas;
    const key = useAtlas ? "julia_camera" : J.key;
    const initialFrame = useAtlas ? "f000" : 0;
    const scale = useAtlas ? 0.62 : J.scale;
    const origin = useAtlas ? [0.5, 0.95] : J.origin;
    this.sprite = scene.add
      .sprite(this.juliaX, this.juliaY - 2, key, initialFrame)
      .setOrigin(origin[0], origin[1])
      .setScale(scale)
      .setDepth(7.6);

    // cone luminoso no mundo + clarão suave na tela
    this.coneGfx = scene.add.graphics().setDepth(14.5);
    this.screenFlash = scene.add
      .rectangle(960, 540, 2200, 1300, 0xfffbe6, 0)
      .setScrollFactor(0)
      .setDepth(140);

    this.state = "idle";
    this.cycleT = this.interval - 0.85; // primeiro flash dispara ~0,85 s após a Sofia chegar perto
    this.flashT = 0;
    this.cheerT = 0;
    this.beeped = false;
    this.flashCount = 0;
    this.cheeredPass = false;
    this.facing = 1;
    this.play("idle");
  }

  play(pose) {
    let k = `${this.J.key}-${pose}`;
    if (this.useAtlas) {
      const map = {
        idle: "julia.idle",
        aimCamera: "julia.idle",
        snap: "julia.flash",
        cheer: "julia.idle",
      };
      if (map[pose] && this.scene.anims.exists(map[pose])) k = map[pose];
    }
    if (this.scene.anims.exists(k) && this.sprite.anims.currentAnim?.key !== k) {
      this.sprite.play(k);
    }
  }

  triggerFlash(sofiaNear) {
    const s = this.scene;
    this.flashCount += 1;
    this.flashT = 0.28;
    if (sofiaNear) {
      s.sfx?.cameraShutter?.();
      this.screenFlash.setAlpha(0.38);
    }
    const zMinX = this.zone.x - 160;
    const zMaxX = this.zone.x + this.zone.w + 160;
    // Deixa todos os macacos da zona/alcance tontos por ~2,2 s
    for (const mk of s.chunks?.monkeys || []) {
      if (!mk.alive) continue;
      const inZone = mk.x >= zMinX && mk.x <= zMaxX;
      const inDist = Math.abs(mk.x - this.juliaX) <= this.flashRadius;
      if (inZone || inDist) {
        mk.stun(this.stunDuration);
      }
    }
    // Dissipa pedras no ar dentro da zona do flash para garantir janela limpa de travessia
    for (const r of s.monkeyRocks?.getChildren?.()?.slice?.() || []) {
      if (r.x >= zMinX && r.x <= zMaxX) {
        const sh = r.getData("shadow");
        if (sh) sh.destroy();
        s.puff?.(r.x, r.y, 0.4, 0xfff3a0);
        r.destroy();
      }
    }
  }

  update(dt, sofia) {
    const s = this.scene;
    const z = this.zone;
    const inZone =
      sofia.x >= z.x - 260 &&
      sofia.x <= z.x + z.w + 260 &&
      sofia.y >= z.y - 220 &&
      sofia.y <= z.y + z.h + 220;

    // Olha na direção do centro da travessia (ou para a Sofia se já passou)
    const lookTargetX = z.x + z.w * 0.55;
    this.facing = lookTargetX >= this.juliaX ? 1 : -1;
    this.sprite.setFlipX(this.facing < 0);

    // Clarão decai suavemente por dt
    if (this.flashT > 0) {
      this.flashT = Math.max(0, this.flashT - dt);
      const prog = this.flashT / 0.28;
      this.screenFlash.setAlpha(prog * 0.38);
    } else if (this.screenFlash.alpha > 0) {
      this.screenFlash.setAlpha(0);
    }

    // Comemoração curta quando a Sofia conclui a travessia da zona
    if (!this.cheeredPass && sofia.x >= z.x + z.w - 120 && sofia.x <= z.x + z.w + 180) {
      this.cheeredPass = true;
      this.cheerT = 1.1;
      s.stars?.(this.juliaX, this.juliaY - 190);
      s.toast?.("Boa foto! Vai, Sofia!", 250, "#FFE08A");
    }

    if (!inZone) {
      this.coneGfx.clear();
      this.play("idle");
      return;
    }

    this.cycleT += dt;
    const timeToFlash = this.interval - this.cycleT;

    if (timeToFlash <= 0) {
      this.cycleT = 0;
      this.beeped = false;
      this.state = "snap";
      this.play("snap");
      this.triggerFlash(true);
    } else if (timeToFlash <= 0.72) {
      if (!this.beeped) {
        this.beeped = true;
        s.sfx?.cameraBeep?.();
      }
      this.state = "aimCamera";
      this.play("aimCamera");
    } else if (this.cheerT > 0) {
      this.cheerT -= dt;
      this.state = "cheer";
      this.play("cheer");
    } else if (this.flashT > 0.08) {
      this.state = "snap";
      this.play("snap");
    } else {
      this.state = "idle";
      this.play("idle");
    }

    // Desenha o indicador de foco ou o cone do flash saindo da câmera da Júlia
    this.coneGfx.clear();
    const lensX = this.juliaX + this.facing * 32;
    const lensY = this.juliaY - 134;
    if (this.flashT > 0) {
      const a = (this.flashT / 0.28) * 0.55;
      const reach = this.facing * 640;
      this.coneGfx.fillStyle(0xfffbe0, a);
      this.coneGfx.beginPath();
      this.coneGfx.moveTo(lensX, lensY);
      this.coneGfx.lineTo(lensX + reach, lensY - 280);
      this.coneGfx.lineTo(lensX + reach, lensY + 260);
      this.coneGfx.closePath();
      this.coneGfx.fillPath();
      this.coneGfx.fillStyle(0xffffff, Math.min(1, a * 1.6));
      this.coneGfx.fillCircle(lensX, lensY, 28);
    } else if (this.state === "aimCamera") {
      const pulse = 8 + Math.sin(this.cycleT * 24) * 3;
      this.coneGfx.lineStyle(3, 0xffe08a, 0.9);
      this.coneGfx.strokeCircle(lensX + this.facing * 10, lensY, pulse);
    }
  }

  destroy() {
    this.coneGfx?.destroy();
    this.screenFlash?.destroy();
    this.sprite?.destroy();
  }
}
