// @ts-nocheck
/**
 * CARANGUEJO — inimigo comum do Setor A.
 * patrulha (vira na parede/beirada/limite) → percebe a Sofia (!) → levanta as garras → avança → recupera.
 * Leva 2 conchas (1ª = machucado, 2ª = derrotado). Latido especial derrota na hora.
 * Derrota "cartoon": gira e voa para fora da tela (sem violência).
 */
import { bindAtlasGeometry } from "./AtlasGeometry.js";
import { SPRITES } from "./Fase3Assets.js";

export class Crab {
  constructor(scene, def) {
    const C = SPRITES.crab;
    this.scene = scene; this.def = def; this.id = def.uid; this.C = C;
    const useAtlas = scene.textures.exists("crab");
    this.useAtlas = useAtlas;
    const key = useAtlas ? "crab" : C.key;
    const initialFrame = useAtlas ? "f000" : 0;
    const scale = useAtlas ? 0.72 : C.scale;
    const origin = useAtlas ? [0.5, 0.95] : C.origin;
    const sp = scene.physics.add.sprite(def.x, def.y ?? 880, key, initialFrame).setOrigin(origin[0], origin[1]).setScale(scale).setDepth(8);
    scene.crabGroup?.add(sp);
    const [w, h, ox, oy] = useAtlas ? [110, 80, 54, 110] : C.body;
    sp.body.setSize(w, h, false).setOffset(ox, oy);
    if (useAtlas) bindAtlasGeometry(sp, () => [79.2, 57.6]);
    sp.body.setMaxVelocity(900, 1400);
    sp.setData("crab", this);
    this.sprite = sp; this.hp = 2; this.dir = Math.random() < 0.5 ? -1 : 1; this.state = "patrol"; this.t = 0; this.cool = 0; this.alive = true;
    this.minX = def.minX ?? def.x - 250; this.maxX = def.maxX ?? def.x + 250;
    this.play("walk");
  }
  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  play(pose) {
    let k = `${this.C.key}-${pose}`;
    if (this.useAtlas) {
      const map = {
        idle: "crab.idle",
        walk: "crab.walk",
        raise: "crab.alert",
        attack: "crab.attack",
        hurt: "crab.hurt",
        defeat: "crab.defeat",
      };
      if (map[pose] && this.scene.anims.exists(map[pose])) k = map[pose];
    }
    if (this.sprite.anims.currentAnim?.key !== k) this.sprite.play(k);
  }
  groundAhead() {
    const b = this.sprite.body;
    return this.scene.physics.overlapRect(b.center.x + this.dir * (b.width / 2 + 12), b.bottom + 4, 8, 30, false, true).length > 0;
  }
  setActive(on) {
    if (!this.alive) return;
    this.sprite.body.moves = on;
    if (on) this.sprite.anims.resume(); else this.sprite.anims.pause();
    this.active = on;
  }
  dangerous() { return this.alive && this.state !== "hurt"; }
  hurt(fromX) {
    if (!this.alive || this.state === "hurt") return;
    this.hp -= 1;
    if (this.hp <= 0) return this.defeat(fromX);
    this.state = "hurt"; this.t = 0.4;
    this.sprite.body.setVelocity((this.x < fromX ? -1 : 1) * 260, -260);
    this.sprite.setTintFill(0xffffff); this.scene.time.delayedCall(80, () => this.sprite.clearTint());
    this.play("hurt");
  }
  defeat(fromX) {
    if (!this.alive) return;
    this.alive = false; this.state = "defeated";
    const sp = this.sprite, away = this.x < fromX ? -1 : 1;
    sp.body.checkCollision.none = true; sp.body.moves = true; sp.anims.resume();
    sp.body.setVelocity(away * 520, -980); sp.body.setAngularVelocity(away * 720);
    sp.setDepth(30); this.play("defeat");
    this.scene.onCrabDefeated?.(this);
    this.scene.time.delayedCall(1700, () => sp.destroy());
  }
  update(dt, sofia) {
    if (!this.alive || !this.active) return;
    const b = this.sprite.body, grounded = b.blocked.down || b.touching.down;
    this.t -= dt; this.cool = Math.max(0, this.cool - dt);
    const dx = sofia.x - this.x, near = Math.abs(dx) < 460 && Math.abs(sofia.y - this.y) < 170;
    switch (this.state) {
      case "patrol": {
        if ((this.dir > 0 && (b.blocked.right || this.x > this.maxX)) || (this.dir < 0 && (b.blocked.left || this.x < this.minX)) || (grounded && !this.groundAhead())) this.dir *= -1;
        b.setVelocityX(this.dir * 90); this.play("walk");
        if (near && this.cool <= 0) { this.state = "notice"; this.t = 0.3; this.dir = Math.sign(dx) || 1; this.scene.crabAlert?.(this); }
        break;
      }
      case "notice": b.setVelocityX(0); this.play("idle"); if (this.t <= 0) { this.state = "raise"; this.t = 0.5; } break;
      case "raise": b.setVelocityX(0); this.play("raise"); if (this.t <= 0) { this.state = "attack"; this.t = 0.45; this.dir = Math.sign(sofia.x - this.x) || this.dir; } break;
      case "attack": {
        const edge = grounded && !this.groundAhead();
        b.setVelocityX(edge ? 0 : this.dir * 430); this.play("attack");
        if (this.t <= 0 || edge) { this.state = "recover"; this.t = 0.7; }
        break;
      }
      case "recover": b.setVelocityX(b.velocity.x * 0.85); this.play("idle"); if (this.t <= 0) { this.state = "patrol"; this.cool = 1.2; } break;
      case "hurt": b.setVelocityX(b.velocity.x * 0.92); if (this.t <= 0 && grounded) { this.state = "recover"; this.t = 0.4; } break;
    }
    this.sprite.setFlipX(this.dir < 0);
  }
}
