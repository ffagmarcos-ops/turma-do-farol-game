// @ts-nocheck
import { Player } from "./Player.js";

import { MARINA_SHEET as SHEET } from "../data/castScale.js";

export class Marina extends Player {
  constructor(scene, x, y, physics) {
    const sheet = scene.textures.exists("marina");
    super(scene, x, y, sheet ? "marina" : "marina_idle_0", physics, sheet ? SHEET : null);
  }

  onPose(pose) {
    const key = this.scene.anims.exists(pose.anim) ? pose.anim : pose.fallback;
    if (!this.scene.anims.exists(key)) return;
    const current = this.sprite.anims.currentAnim?.key;
    // passo sincronizado com a velocidade real (antes os pés "patinavam" no chão)
    const vx = Math.abs(this.sprite.body?.velocity.x || 0);
    const ref = /-run$/.test(key) ? this.cfg.runSpeed : /-walk$/.test(key) ? this.cfg.walkSpeed : 0;
    this.sprite.anims.timeScale = ref ? Math.max(0.6, Math.min(1.5, vx / ref)) : 1;
    if (current === key) return;
    // andar <-> correr: continua no mesmo ponto do passo (não volta ao quadro 0)
    const gait = (k) => /-(walk|run)$/.test(k || "");
    const prog = gait(current) && gait(key) ? this.sprite.anims.getProgress() : 0;
    this.sprite.play({ key, frameRate: pose.frameRate }, true);
    if (prog) this.sprite.anims.setProgress(prog);
    // troca de textura (sheet 1x <-> tiras HD 2x) já neste quadro: senão a escala/hitbox usa o quadro antigo por 1 frame
    const cf = this.sprite.anims.currentFrame;
    if (cf && (cf.textureKey !== this.sprite.texture.key || cf.textureFrame !== this.sprite.frame.name)) this.sprite.setTexture(cf.textureKey, cf.textureFrame);
  }
}
