// @ts-nocheck
/**
 * MACACO — inimigo de galho/plataforma alta (Setor C em diante).
 * Estados:
 *  - idle      (parado no galho)
 *  - watch     (observar a Sofia)
 *  - pick      (pegar pedra)
 *  - aim       (mirar: braço levantado com aviso claro + sombra no chão onde a pedra vai cair)
 *  - throw     (jogar a pedra em arco parabólico)
 *  - laugh     (rir depois do arremesso)
 *  - hurt      (dano ao levar concha)
 *  - stun      (atordoado: fica tonto com estrelinhas; próxima concha derrota)
 *  - defeat    (derrota estilo desenho animado: gira e sai voando)
 */
import { bindAtlasGeometry } from "./AtlasGeometry.js";
import Phaser from "../phaser.js";
import { AnimationEvents } from "./AnimationEvents.js";
import { SPRITES } from "./Fase3Assets.js";

export class Macaco {
  constructor(scene, def) {
    const M = SPRITES.monkey;
    this.scene = scene; this.def = def; this.id = def.uid; this.M = M;
    const useAtlas = scene.textures.exists("monkey");
    this.useAtlas = useAtlas;
    const key = useAtlas ? "monkey" : M.key;
    const initialFrame = useAtlas ? "f000" : 0;
    const scale = useAtlas ? 0.68 : M.scale;
    const origin = useAtlas ? [0.5, 0.95] : M.origin;
    const sp = scene.physics.add.sprite(def.x, def.y ?? 650, key, initialFrame).setOrigin(origin[0], origin[1]).setScale(scale).setDepth(8.2);
    scene.monkeyGroup?.add(sp);
    const [w, h, ox, oy] = useAtlas ? [90, 116, 103, 172] : M.body;
    sp.body.setSize(w, h, false).setOffset(ox, oy);
    if (useAtlas) bindAtlasGeometry(sp, () => [61.2, 78.88]);
    sp.body.setMaxVelocity(700, 1400);
    sp.setData("monkey", this);
    this.sprite = sp;
    this.baseX = def.x;
    this.hp = 2;
    this.dir = -1;
    this.state = "idle";
    this.t = 0;
    this.cool = 0.5 + Math.random() * 0.6;
    this.alive = true;
    this.active = true;
    this.aimX = def.x;
    this.aimGroundY = scene.levelGroundY(def.x);
    this.aimShadow = null;
    this.actionEvents = new AnimationEvents(scene.cache.json.get("ilha_farol_manifest"), event => {
      if (event.action === "spawn_stone" && this.state === "throw" && this.alive) this.throwStone();
    });
    this.play("idle");
  }
  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  play(pose) {
    if (this.useAtlas && pose === "aim") {
      this.sprite.anims.stop();
      this.sprite.setTexture("monkey", "f009");
      this.sprite.refreshAtlasGeometry();
      return;
    }
    let k = `${this.M.key}-${pose}`;
    if (this.useAtlas) {
      const map = {
        idle: "monkey.idle",
        watch: "monkey.notice",
        pick: "monkey.pickup",
        aim: "monkey.throw",
        throw: "monkey.throw",
        laugh: "monkey.taunt",
        hurt: "monkey.hurt",
        stun: "monkey.stun_hanging",
        defeat: "monkey.hurt",
      };
      if (map[pose] && this.scene.anims.exists(map[pose])) k = map[pose];
    }
    if (this.sprite.anims.currentAnim?.key !== k) this.sprite.play(k);
  }
  throwStone() {
    const shadow = this.aimShadow;
    this.aimShadow = null;
    this.scene.spawnMonkeyRock?.(this.x + this.dir * 24, this.y - 96, this.aimX, this.aimGroundY, shadow);
  }
  setActive(on) {
    if (!this.alive) return;
    this.sprite.body.moves = on;
    if (on) this.sprite.anims.resume(); else this.sprite.anims.pause();
    this.active = on;
  }
  clearAimShadow() {
    if (this.aimShadow) { this.aimShadow.destroy(); this.aimShadow = null; }
  }
  dangerous() {
    return this.alive && this.state !== "hurt" && this.state !== "stun" && this.state !== "defeat";
  }
  /** Atordoa o macaco (usado após levar 1ª concha e também pelo flash da Júlia no Setor H). */
  stun(duration = 2.4) {
    if (!this.alive || this.state === "defeat") return;
    this.actionEvents?.cancel();
    this.clearAimShadow();
    this.state = "stun";
    this.t = duration;
    this.sprite.body.setVelocityX(0);
    this.play("stun");
  }
  hurt(fromX) {
    if (!this.alive || this.state === "hurt" || this.state === "defeat") return;
    this.actionEvents?.cancel();
    this.clearAimShadow();
    this.hp -= 1;
    if (this.hp <= 0 || this.state === "stun") return this.defeat(fromX);
    this.state = "hurt";
    this.t = 0.35;
    this.sprite.body.setVelocity((this.x < fromX ? -1 : 1) * 90, -180);
    this.sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => this.sprite.active && this.sprite.clearTint());
    this.play("hurt");
  }
  defeat(fromX) {
    if (!this.alive) return;
    this.actionEvents?.cancel();
    this.clearAimShadow();
    this.alive = false;
    this.state = "defeat";
    const sp = this.sprite, away = this.x < fromX ? -1 : 1;
    sp.body.checkCollision.none = true;
    sp.body.moves = true;
    sp.anims.resume();
    sp.body.setVelocity(away * 480, -960);
    sp.body.setAngularVelocity(away * 680);
    sp.setDepth(30);
    this.play("defeat");
    this.scene.onMonkeyDefeated?.(this);
    this.scene.time.delayedCall(1700, () => sp.destroy());
  }
  destroy() {
    this.actionEvents?.cancel();
    this.clearAimShadow();
    if (this.sprite?.active) this.sprite.destroy();
  }
  update(dt, sofia) {
    if (!this.alive || !this.active) return;
    const b = this.sprite.body;
    if (this.state === "throw") this.actionEvents.advance(dt * 1000);
    this.t -= dt;
    this.cool = Math.max(0, this.cool - dt);
    const dx = sofia.x - this.x, adx = Math.abs(dx);
    const inRange = adx < 840 && Math.abs(sofia.y - this.y) < 520;

    // mantém o macaco perto do ponto do galho
    if (this.state !== "hurt" && this.state !== "defeat") {
      const drift = this.baseX - this.x;
      b.setVelocityX(Math.abs(drift) > 6 ? drift * 4 : 0);
    }

    switch (this.state) {
      case "idle": {
        this.play("idle");
        if (inRange) this.dir = Math.sign(dx) || this.dir;
        if (inRange && this.cool <= 0) {
          this.state = "watch";
          this.t = 0.45;
          this.dir = Math.sign(dx) || 1;
          this.scene.icon?.(this.x, this.y - 140);
          this.scene.sfx?.monkeyChatter?.();
        }
        break;
      }
      case "watch": {
        this.dir = Math.sign(dx) || this.dir;
        this.play("watch");
        if (!inRange) { this.state = "idle"; this.cool = 0.4; break; }
        if (this.t <= 0) {
          this.state = "pick";
          this.t = 0.42;
        }
        break;
      }
      case "pick": {
        this.dir = Math.sign(dx) || this.dir;
        this.play("pick");
        if (this.t <= 0) {
          this.state = "aim";
          this.t = 0.68;
          const lead = Phaser.Math.Clamp(sofia.body.velocity.x * 0.22, -140, 140);
          const targetOffset = Phaser.Math.Clamp(dx + lead, -660, 660);
          this.aimX = this.x + (Math.abs(targetOffset) < 90 ? (this.dir || 1) * 140 : targetOffset);
          this.aimGroundY = this.scene.levelGroundY(this.aimX);
          this.actionEvents?.cancel();
    this.clearAimShadow();
          this.aimShadow = this.scene.createRockShadow?.(this.aimX, this.aimGroundY);
        }
        break;
      }
      case "aim": {
        this.play("aim");
        if (this.aimShadow?.active) {
          const pulse = 0.75 + Math.sin(this.scene.time.now * 0.025) * 0.2;
          this.aimShadow.setScale(pulse, pulse).setAlpha(0.55);
        }
        if (this.t <= 0) {
          this.state = "throw";
          this.t = this.useAtlas ? this.scene.anims.get("monkey.throw").duration / 1000 : 0.32;
          this.sprite.anims.stop();
          this.play("throw");
          if (this.useAtlas) this.actionEvents.start("monkey.throw");
          else this.throwStone();
        }
        break;
      }
      case "throw": {
        this.play("throw");
        if (this.t <= 0) {
          this.state = "laugh";
          this.t = 0.9;
          this.scene.sfx?.monkeyLaugh?.();
        }
        break;
      }
      case "laugh": {
        this.play("laugh");
        if (this.t <= 0) {
          this.state = "idle";
          this.cool = 1.1;
        }
        break;
      }
      case "hurt": {
        b.setVelocityX(b.velocity.x * 0.88);
        this.play("hurt");
        if (this.t <= 0) this.stun(2.4);
        break;
      }
      case "stun": {
        this.play("stun");
        if (this.t <= 0) {
          this.state = "idle";
          this.cool = 0.9;
        }
        break;
      }
    }
    this.sprite.setFlipX(this.dir < 0);
  }
}
