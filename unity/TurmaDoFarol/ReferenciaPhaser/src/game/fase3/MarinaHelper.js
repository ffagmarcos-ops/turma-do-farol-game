// @ts-nocheck
/**
 * MARINA E A CAIXA MÓVEL (Setor F — Passo 6).
 * - Trecho alto impossível de alcançar pulando do chão (ex.: chão em y=900 e patamar alto em y=620).
 * - Ao entrar na zona helpZoneMarina, a Marina percebe a Sofia (notice), empurra uma caixa grande de
 *   madeira (128×128) até a posição certa (push → drop/positioned) e faz gesto de incentivo ("vai!" / cheer).
 * - A caixa posicionada funciona como plataforma sólida/mão única (topo em targetY - 128), permitindo
 *   que a Sofia suba na caixa e alcance o patamar superior.
 * - A Marina não tem corpo físico de colisão: nunca bloqueia a Sofia.
 */
import { bindAtlasGeometry } from "./AtlasGeometry.js";
import { SPRITES, IMAGES } from "./Fase3Assets.js";

const CRATE_W = 128, CRATE_H = 128;

export class MarinaHelper {
  constructor(scene, def, alreadyTriggered = false) {
    const M = SPRITES.marina;
    const C = IMAGES.marina_crate;
    this.scene = scene;
    this.def = def;
    this.id = def.id;
    this.M = M;

    this.topY = def.topY ?? 620;
    this.crateStartX = def.crateStartX ?? (def.crateTargetX + 200);
    this.crateStartY = def.crateStartY ?? this.topY;
    this.crateTargetX = def.crateTargetX ?? (def.x + 280);
    this.crateTargetY = def.crateTargetY ?? 900;
    this.pushDir = this.crateTargetX < this.crateStartX ? -1 : 1;

    this.crateX = alreadyTriggered ? this.crateTargetX : this.crateStartX;
    this.crateY = alreadyTriggered ? this.crateTargetY : this.crateStartY;
    this.crateVy = 0;
    this.positioned = Boolean(alreadyTriggered);
    this.cheeredTop = Boolean(alreadyTriggered);

    // Posição da Marina (atrás da caixa em relação à direção do empurrão)
    const marinaInitX = alreadyTriggered
      ? this.crateStartX - this.pushDir * 40
      : this.crateX - this.pushDir * 82;
    this.marinaX = marinaInitX;
    this.marinaY = this.crateStartY;

    // Sprite da Marina (sem colisão para nunca bloquear a Sofia)
    const useAtlas = scene.textures.exists("marina_push");
    this.useAtlas = useAtlas;
    const key = useAtlas ? "marina_push" : M.key;
    const initialFrame = useAtlas ? "f000" : 0;
    const scale = useAtlas ? 0.65 : M.scale;
    const origin = useAtlas ? [0.5, 0.95] : M.origin;
    this.sprite = scene.add
      .sprite(this.marinaX, this.marinaY, key, initialFrame)
      .setOrigin(origin[0], origin[1])
      .setScale(scale)
      .setDepth(8.8)
      .setFlipX(this.pushDir < 0);

    if (useAtlas) bindAtlasGeometry(this.sprite);

    // Imagem da caixa grande de madeira (origem na base central)
    const im = scene.art?.img(C.key) || { key: C.key, scale: 1 };
    this.crateSprite = scene.add
      .image(this.crateX, this.crateY, im.key)
      .setOrigin(0.5, 1)
      .setScale(im.scale)
      .setDepth(9.1);

    // Zona de colisão no topo da caixa (mão única, permite subir na caixa sem travar nas laterais)
    const topSurfaceY = this.crateY - CRATE_H + 4;
    this.zone = scene.add
      .zone(this.crateX, topSurfaceY + 12, CRATE_W, 24)
      .setData("oneway", true);
    scene.chunks.oneway.add(this.zone);

    this.state = alreadyTriggered ? "cheer" : "idle";
    this.t = 0;
    this.sfxT = 0;
    this.play(this.state);
  }

  play(pose) {
    let k = `${this.M.key}-${pose}`;
    if (this.useAtlas) {
      const map = {
        idle: "marina.idle",
        notice: "marina.prepare",
        push: "marina.push",
        cheer: "marina.finish",
      };
      if (map[pose] && this.scene.anims.exists(map[pose])) k = map[pose];
    }
    if (this.sprite.anims.currentAnim?.key !== k) this.sprite.play(k);
  }

  syncCrateZone() {
    const topSurfaceY = this.crateY - CRATE_H + 4;
    this.crateSprite.setPosition(this.crateX, this.crateY);
    this.zone.setPosition(this.crateX, topSurfaceY + 12);
    this.zone.body?.updateFromGameObject();
  }

  trigger() {
    if (this.state !== "idle") return;
    this.state = "notice";
    this.t = 0.48;
    this.play("notice");
    this.scene.icon?.(this.marinaX, this.marinaY - 210);
    this.scene.sfx?.marinaCall?.();
    this.scene.showHint?.("A Marina vai empurrar a caixa! Suba nela com {jump} para alcançar o patamar alto.");
  }

  update(dt, sofia) {
    this.t -= dt;
    this.sfxT -= dt;

    if (this.state === "idle") {
      if (
        sofia.x >= this.def.x &&
        sofia.x <= this.def.x + this.def.w &&
        sofia.y >= (this.def.y ?? 0) &&
        sofia.y <= (this.def.y ?? 0) + (this.def.h ?? 1080)
      ) {
        this.trigger();
        this.scene.onMarinaTriggered?.(this.id);
      }
    } else if (this.state === "notice") {
      this.play("notice");
      if (this.t <= 0) {
        this.state = "push";
        this.sfxT = 0;
        this.play("push");
      }
    } else if (this.state === "push") {
      this.play("push");
      const speed = 185;
      const rem = (this.crateTargetX - this.crateX) * this.pushDir;
      if (rem > 2) {
        const step = Math.min(rem, speed * dt);
        this.crateX += this.pushDir * step;
        this.marinaX = this.crateX - this.pushDir * 82;
        this.sprite.setPosition(this.marinaX, this.marinaY);
        this.sprite.setFlipX(this.pushDir < 0);
        this.syncCrateZone();
        if (this.sfxT <= 0) {
          this.sfxT = 0.22;
          this.scene.sfx?.cratePush?.();
          this.scene.puff?.(this.crateX - this.pushDir * 44, this.crateY - 6, 0.35, 0xc8b090);
        }
      } else {
        this.crateX = this.crateTargetX;
        this.syncCrateZone();
        if (this.crateY < this.crateTargetY - 2) {
          this.state = "drop";
          this.crateVy = 80;
          this.play("notice");
        } else {
          this.finishCratePlacement();
        }
      }
    } else if (this.state === "drop") {
      this.crateVy += 2200 * dt;
      this.crateY = Math.min(this.crateTargetY, this.crateY + this.crateVy * dt);
      this.syncCrateZone();
      if (this.crateY >= this.crateTargetY) {
        this.finishCratePlacement();
      }
    } else if (this.state === "cheer") {
      this.play("cheer");
      // Olha na direção da Sofia fazendo o gesto de "vai!"
      if (Math.abs(sofia.x - this.marinaX) > 24) {
        this.sprite.setFlipX(sofia.x < this.marinaX);
      }
    }

    // Quando a Sofia usa a caixa e alcança o patamar alto, a Marina comemora
    if (
      !this.cheeredTop &&
      this.positioned &&
      sofia.y <= this.topY + 24 &&
      Math.abs(sofia.x - this.marinaX) < 380
    ) {
      this.cheeredTop = true;
      this.state = "cheer";
      this.play("cheer");
      this.scene.stars?.(this.marinaX, this.marinaY - 180);
      this.scene.toast?.("Vai, Sofia!", 260, "#FFE08A");
    }
  }

  finishCratePlacement() {
    this.crateY = this.crateTargetY;
    this.positioned = true;
    this.state = "cheer";
    this.play("cheer");
    this.syncCrateZone();
    this.scene.sfx?.crateThud?.();
    this.scene.puff?.(this.crateX, this.crateY - 8, 0.7, 0xc8b090);
    this.scene.camera3?.shake?.(0.002, 90);
  }

  destroy() {
    this.sprite?.destroy();
    this.crateSprite?.destroy();
    this.zone?.destroy();
  }
}
