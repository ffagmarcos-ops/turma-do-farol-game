// @ts-nocheck
/**
 * SEU TONINHO E A CORDA NÁUTICA (Setor D).
 * - Seu Toninho fica no topo do paredão (sem colisão com a Sofia: nunca bloqueia a passagem).
 * - Estados do Seu Toninho:
 *    - idle      (aguardando no topo com o rolo de corda náutica)
 *    - wave      (acena quando a Sofia entra na zona helpZoneToninho)
 *    - throwRope (joga a corda náutica pela beirada e segura firme a ponta)
 *    - thumbsUp  (faz sinal de positivo e acena quando a Sofia chega ao topo; a corda continua interativa)
 * - NauticalRope: corda náutica com nós, física de pêndulo (balança com ←/→), escalada (↑/↓) e salto.
 */
import { bindAtlasGeometry } from "./AtlasGeometry.js";
import Phaser from "../phaser.js";
import { SPRITES } from "./Fase3Assets.js";

export class NauticalRope {
  constructor(scene, def) {
    this.scene = scene;
    this.id = def.id;
    this.x = def.ropeX ?? def.x;
    this.topY = def.topY;
    this.bottomY = def.bottomY;
    this.fullLen = Math.max(120, this.bottomY - this.topY);
    this.curLen = def.deployed ? this.fullLen : 0;
    this.deployed = Boolean(def.deployed);
    this.deploying = Boolean(def.deployed);
    this.canVaultTop = def.canVaultTop !== false;
    this.ledgeDir = def.ledgeDir ?? 1;
    this.anchorX = def.toninhoX ?? this.x + this.ledgeDir * 70;
    this.anchorY = this.topY - 64;
    this.swingAngle = 0;
    this.swingVel = 0;
    this.gfx = scene.add.graphics().setDepth(9.2);
  }

  deploy() {
    if (this.deploying) return;
    this.deploying = true;
    this.scene.sfx?.ropeThrow?.();
  }

  update(dt, sofia, wantClimb = false) {
    if (this.deploying && !this.deployed) {
      this.curLen = Math.min(this.fullLen, this.curLen + 920 * dt);
      if (this.curLen >= this.fullLen) this.deployed = true;
    }

    // física de pêndulo suave
    const damping = sofia.onRope === this ? 0.85 : 1.45;
    this.swingVel += (-5.8 * Math.sin(this.swingAngle) - this.swingVel * damping) * dt;
    this.swingAngle = Phaser.Math.Clamp(this.swingAngle + this.swingVel * dt, -0.56, 0.56);

    // verificar se a Sofia agarra a corda (pulando nela ou apertando subir perto dela)
    if (this.curLen >= 90 && !sofia.onRope && sofia.ropeCooldown <= 0 && sofia.hurtT <= 0 && !sofia.locked) {
      const handY = sofia.y - 80;
      if (handY >= this.topY - 10 && handY <= this.topY + this.curLen + 36) {
        const d = Phaser.Math.Clamp(handY - this.topY, 46, this.curLen - 16);
        const rx = this.x + Math.sin(this.swingAngle) * d;
        if (Math.abs(sofia.x - rx) < 54 && (!sofia.grounded || wantClimb)) {
          if (sofia.grabRope(this, d)) {
            this.scene.sfx?.ropeGrab?.();
          }
        }
      }
    }

    this.draw();
  }

  draw() {
    const g = this.gfx;
    g.clear();
    if (this.curLen <= 4) return;

    // estaca/apoio de madeira na beirada e cabo seguro pelo Seu Toninho
    g.lineStyle(11, 0x2a1a10, 1);
    g.beginPath();
    g.moveTo(this.anchorX, this.anchorY);
    g.lineTo(this.x, this.topY + 4);
    g.strokePath();
    g.lineStyle(6, 0xd8b06c, 1);
    g.beginPath();
    g.moveTo(this.anchorX, this.anchorY);
    g.lineTo(this.x, this.topY + 4);
    g.strokePath();

    // estaca de amarração na borda da rocha
    g.fillStyle(0x2a1a10, 1);
    g.fillRoundedRect(this.x - 10, this.topY - 22, 20, 28, 5);
    g.fillStyle(0x8a5a2e, 1);
    g.fillRoundedRect(this.x - 7, this.topY - 19, 14, 22, 4);

    const endX = this.x + Math.sin(this.swingAngle) * this.curLen;
    const endY = this.topY + Math.cos(this.swingAngle) * this.curLen;

    // contorno escuro da corda náutica
    g.lineStyle(14, 0x2a1a10, 1);
    g.beginPath();
    g.moveTo(this.x, this.topY);
    g.lineTo(endX, endY);
    g.strokePath();

    // miolo trançado dourado/cânhamo
    g.lineStyle(8, 0xd8b06c, 1);
    g.beginPath();
    g.moveTo(this.x, this.topY);
    g.lineTo(endX, endY);
    g.strokePath();

    // nós de apoio ao longo da corda a cada 64 px
    for (let d = 56; d < this.curLen - 16; d += 64) {
      const kx = this.x + Math.sin(this.swingAngle) * d;
      const ky = this.topY + Math.cos(this.swingAngle) * d;
      g.fillStyle(0x2a1a10, 1);
      g.fillCircle(kx, ky, 9);
      g.fillStyle(0xe8c988, 1);
      g.fillCircle(kx, ky, 5.5);
    }

    // nó de marinheiro (pinha) na ponta de baixo
    g.fillStyle(0x2a1a10, 1);
    g.fillCircle(endX, endY, 12);
    g.fillStyle(0xe8c988, 1);
    g.fillCircle(endX, endY, 8);
  }

  destroy() {
    if (this.scene.sofia?.onRope === this) {
      this.scene.sofia.leaveRope(0, false);
    }
    this.gfx?.destroy();
  }
}

export class ToninhoHelper {
  constructor(scene, def, alreadyTriggered = false) {
    const T = SPRITES.toninho;
    this.scene = scene;
    this.def = def;
    this.id = def.id;
    this.T = T;
    this.toninhoX = def.toninhoX ?? def.x + 320;
    this.topY = def.topY ?? 480;
    const useAtlas = scene.textures.exists("toninho_rope");
    this.useAtlas = useAtlas;
    const key = useAtlas ? "toninho_rope" : T.key;
    const initialFrame = useAtlas ? "f000" : 0;
    const scale = useAtlas ? 0.62 : T.scale;
    const origin = useAtlas ? [0.5, 0.95] : T.origin;
    // Sprite visual (sem corpo físico de colisão para nunca bloquear a Sofia)
    this.sprite = scene.add
      .sprite(this.toninhoX, this.topY, key, initialFrame)
      .setOrigin(origin[0], origin[1])
      .setScale(scale)
      .setDepth(8.8)
      .setFlipX((def.ropeX ?? def.x) < this.toninhoX);

    if (useAtlas) bindAtlasGeometry(this.sprite);

    this.rope = new NauticalRope(scene, {
      id: `${def.id}_rope`,
      ropeX: def.ropeX ?? this.toninhoX - 96,
      toninhoX: this.toninhoX - 24,
      topY: this.topY,
      bottomY: def.bottomY ?? 850,
      ledgeDir: (def.ropeX ?? this.toninhoX - 96) < this.toninhoX ? 1 : -1,
      canVaultTop: true,
      deployed: alreadyTriggered,
    });

    this.state = alreadyTriggered ? "thumbsUp" : "idle";
    this.t = 0;
    this.cheeredTop = alreadyTriggered;
    this.play(this.state);
  }

  play(pose) {
    let k = `${this.T.key}-${pose}`;
    if (this.useAtlas) {
      const map = {
        idle: "toninho.idle",
        wave: "toninho.brace",
        throwRope: "toninho.throw_rope",
        thumbsUp: "toninho.confirm",
      };
      if (map[pose] && this.scene.anims.exists(map[pose])) k = map[pose];
    }
    if (this.sprite.anims.currentAnim?.key !== k) this.sprite.play(k);
  }

  trigger() {
    if (this.state !== "idle") return;
    this.state = "wave";
    this.t = 0.65;
    this.play("wave");
    this.scene.icon?.(this.toninhoX, this.topY - 210);
    this.scene.sfx?.toninhoCall?.();
    this.scene.showHint?.("Seu Toninho jogou uma corda! Pule nela, suba com {up} ou balance com {move} + {jump}");
  }

  update(dt, sofia, wantClimb = false) {
    this.t -= dt;

    // dispara quando a Sofia entra na zona helpZoneToninho
    if (this.state === "idle") {
      if (
        sofia.x >= this.def.x &&
        sofia.x <= this.def.x + this.def.w &&
        sofia.y >= (this.def.y ?? 0) &&
        sofia.y <= (this.def.y ?? 0) + (this.def.h ?? 1080)
      ) {
        this.trigger();
        this.scene.onToninhoTriggered?.(this.id);
      }
    } else if (this.state === "wave") {
      this.play("wave");
      if (this.t <= 0) {
        this.state = "throwRope";
        this.t = 0.55;
        this.play("throwRope");
        this.rope.deploy();
      }
    } else if (this.state === "throwRope") {
      this.play("throwRope");
      if (this.t <= 0 && this.rope.deployed) {
        if (sofia.y <= this.topY + 30 && Math.abs(sofia.x - this.toninhoX) < 340) {
          this.state = "thumbsUp";
          this.play("thumbsUp");
        }
      }
    }

    // quando a Sofia sobe até o topo do paredão, Seu Toninho faz sinal de positivo e comemora
    if (!this.cheeredTop && this.rope.deployed && sofia.y <= this.topY + 24 && sofia.x >= this.rope.x - 40 && sofia.x <= this.toninhoX + 260) {
      this.cheeredTop = true;
      this.state = "thumbsUp";
      this.play("thumbsUp");
      this.scene.stars?.(this.toninhoX, this.topY - 180);
      this.scene.toast?.("Boa, Sofia!", 260, "#FFE08A");
    }

    // olha sempre na direção da Sofia de forma amigável
    if (Math.abs(sofia.x - this.toninhoX) > 24) {
      this.sprite.setFlipX(sofia.x < this.toninhoX);
    }

    this.rope.update(dt, sofia, wantClimb);
  }

  destroy() {
    this.rope?.destroy();
    this.sprite?.destroy();
  }
}
