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
    if (current === key) return;
    // andar <-> correr: continua no mesmo ponto do passo (não volta ao quadro 0)
    const gait = (k) => /-(walk|run)$/.test(k || "");
    const prog = gait(current) && gait(key) ? this.sprite.anims.getProgress() : 0;
    this.sprite.play({ key, frameRate: pose.frameRate }, true);
    if (prog) this.sprite.anims.setProgress(prog);
  }
}
