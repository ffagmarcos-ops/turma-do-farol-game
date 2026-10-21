// @ts-nocheck
/**
 * Lucas no convés: anda (sempre na velocidade cheia), pula, abaixa, sônico (toque = tiro, segurar = carga).
 * Dano: recuo (knockback), tinta vermelha piscando, ~1 s invulnerável (placeholder "lucas_hurt").
 * Vida zerada: cai (placeholder "lucas_ko"), fica no chão, levanta com a barra cheia. Vidas infinitas.
 */
import CFG from "../data/boss_polvo.json";
import { clamp, lerp } from "./common.js";
import { isDown, getTouch } from "../input.js";

const HURT_IFRAMES = 1.0;
export class LucasPlayer {
  constructor(s) {
    this.s = s;
    this.key = s.textures.exists("f2_lucas_sonic") ? "f2_lucas_sonic" : "lucas";
    if (this.key === "f2_lucas_sonic") {
      // Folha final (lote 1): L1 idle 4 · L2 andar 8 · L3 atirar 6 · L4 atirar diagonal 6 · L5 agachar 4 · L6 dano 2, escorregar 2, carregar 4
      const A = (pose, frames, rate, repeat = -1) => { const k = `f2_lucas_sonic-${pose}`; if (!s.anims.exists(k)) s.anims.create({ key: k, frames: s.anims.generateFrameNumbers("f2_lucas_sonic", { frames }), frameRate: rate, repeat }); };
      A("idle", [0, 1, 2, 3], 6);
      A("run", [8, 9, 10, 11, 12, 13, 14, 15], 12);
      A("interact", [16, 17, 18, 19, 20, 21], 18, 0);
      A("shoot_up", [24, 25, 26, 27, 28, 29], 18, 0);
      A("crouch", [32, 33], 10, 0);
      A("jump", [33], 1);
      A("fall", [32], 1);
      A("hurt", [40, 41], 10, 0);
      A("slip", [42, 43], 8);
      A("charge", [44, 45, 46, 47], 10);
      A("getup", [35, 34, 0], 6, 0);
    }
    this.sp = s.add.sprite(960, CFG.deck.y, this.key, 0).setOrigin(0.5, 0.9375).setDepth(30).setScale(1.05);
    this.shadow = s.add.ellipse(960, CFG.deck.y, 120, 18, 0x000000, 0.35).setDepth(29);
    this.device = s.add.image(0, 0, "f2_glow").setBlendMode("ADD").setDepth(31).setScale(0.3).setTint(0x7ff0ff);
    this.drip = s.add.particles(0, 0, "f2_drop", { lifespan: 400, speedY: { min: 40, max: 120 }, speedX: { min: -20, max: 20 }, gravityY: 600, scale: { start: 0.25, end: 0.05 }, alpha: { start: 0.8, end: 0 }, frequency: 90 }).setDepth(31);
    this.steam = s.add.particles(0, 0, "f2_glow", { lifespan: 700, speedY: { min: -160, max: -60 }, scale: { start: 0.3, end: 0.8 }, alpha: { start: 0.5, end: 0 }, tint: 0xdddddd, emitting: false }).setDepth(31);
    this.stars = s.add.image(0, 0, "f2_stars").setDepth(32).setVisible(false).setScale(0.8);
    this.reset();
    this.koCount = 0;
  }
  reset() {
    Object.assign(this, { x: 960, y: CFG.deck.y, vx: 0, vy: 0, grounded: true, crouch: false, facing: 1, hp: 100, iframes: 0, hurtT: 0, knock: 0, recoil: 0, heat: 0, heatIdle: 0, overheat: 0, charge: 0, holdT: 0, fireCd: 0, ko: false, koT: 0, landSquash: 0 });
  }
  get muzzle() { return { x: this.x + this.facing * 50, y: this.sp.y - 150 }; }
  /** dmg em pontos de vida (0..100). Retorna true se acertou. */
  hurt(dmg, fromX) {
    if (this.iframes > 0 || this.ko) return false;
    this.hp = Math.max(0, this.hp - dmg);
    this.iframes = HURT_IFRAMES;
    this.hurtT = 0.35;
    this.redBlink = true;
    this.knock = (this.x < fromX ? -1 : 1) * 560;
    this.vy = -360;
    this.grounded = false;
    this.charge = 0;
    if (this.hp <= 0) this.knockOut();
    return true;
  }
  knockOut() {
    this.ko = true;
    this.koT = 0;
    this.koCount += 1;
    this.s.onLucasKO();
  }
  update(dt, t, control) {
    const s = this.s;
    const tch = getTouch();
    const can = control && !this.ko;
    const left = can && (isDown("ArrowLeft") || isDown("KeyA") || tch.left);
    const right = can && (isDown("ArrowRight") || isDown("KeyD") || tch.right);
    const down = can && (isDown("ArrowDown") || isDown("KeyS") || tch.down);
    const jump = can && (isDown("ArrowUp") || isDown("KeyW") || isDown("KeyK") || tch.jump);
    const fireHeld = can && (isDown("KeyJ") || isDown("Space") || isDown("KeyE") || isDown("KeyX") || tch.interact || s.mouseDown);
    this.iframes = Math.max(0, this.iframes - dt);
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.crouch = down && this.grounded;
    let speed = 400 * (this.fireCd > 0 ? 0.7 : 1) * (this.crouch ? 0.35 : 1);
    const want = (right ? 1 : 0) - (left ? 1 : 0);
    const slippery = s.onPuddle?.(this.x);
    this.vx = lerp(this.vx, want * speed, clamp(dt * (slippery ? 1.2 : 14), 0, 1));
    if (want && this.hurtT <= 0) this.facing = want;
    this.knock = lerp(this.knock, 0, dt * 6);
    const slide = s.boatSlide?.() || 0;
    this.x = clamp(this.x + (this.vx + this.knock + slide) * dt, CFG.deck.left + 10, CFG.deck.right - 60);
    let ground = s.deckYAt(this.x);
    // teto da cabine: plataforma de mão única (só pousa vindo de cima)
    const roofY = s.crew.roofYAt?.(this.x);
    if (roofY != null && this.y <= roofY + 4 && !(this.crouch && jump)) ground = roofY;
    this.onRoof = ground !== s.deckYAt(this.x);
    if (jump && this.grounded && !this.jumpHeld) { this.vy = -1120; this.grounded = false; s.sfx("jump"); }
    this.jumpHeld = jump;
    if (!this.grounded) {
      this.vy += 2600 * dt;
      this.y += this.vy * dt;
      if (this.y >= ground) { this.y = ground; this.grounded = true; this.vy = 0; this.landSquash = 0.12; s.sfx("land", { volume: 0.5 }); }
    } else if (this.y < ground - 6) this.grounded = false;
    else this.y = ground;
    // sônico
    const hc = CFG.heat;
    this.fireCd = Math.max(0, this.fireCd - dt);
    this.overheat = Math.max(0, this.overheat - dt);
    if (fireHeld && this.overheat <= 0) {
      if (!this.fireWas && this.fireCd <= 0) {
        s.fire(false);
        this.fireCd = 1 / hc.rate;
        this.heat += hc.perShot;
        this.heatIdle = 0;
        this.recoil = 0.1;
      }
      this.holdT += dt;
      if (this.holdT > 0.3) this.charge = Math.min(hc.chargeTime, this.charge + dt);
    } else {
      if (this.fireWas && this.charge >= hc.chargeTime) {
        s.fire(true);
        this.heat += hc.chargeCost;
        this.recoil = 0.25;
      }
      this.holdT = 0;
      this.charge = 0;
      this.heatIdle += dt;
      if (this.heatIdle > hc.delay) this.heat = Math.max(0, this.heat - hc.cool * dt);
    }
    this.fireWas = fireHeld;
    if (this.heat >= 100 && this.overheat <= 0) {
      this.heat = 100;
      this.overheat = hc.overheat;
      this.charge = 0;
      s.sfx("overheat");
      s.cc0?.overheat(this.muzzle.x, this.muzzle.y);
      if (s.steamFx) s.steamFx.setVisible(true).setPosition(this.muzzle.x, this.muzzle.y - 40).setScale(0.8).play("sfx-steam");
      else this.steam.explode(16, this.muzzle.x, this.muzzle.y);
    }
    if (this.overheat > 0 && this.overheat < 0.05) this.heat = 60;
    // nocaute: cai, espera, levanta com a barra cheia
    if (this.ko) {
      this.koT += dt;
      if (this.koT > 2.0) {
        this.ko = false;
        this.hp = 100;
        this.iframes = 2.0;
        this.redBlink = false;
        this.heat = 0;
        s.onLucasGetUp();
      }
    }
    this.draw(dt, t);
  }
  draw(dt, t) {
    const s = this.s, sp = this.sp;
    this.recoil = Math.max(0, this.recoil - dt);
    this.landSquash = Math.max(0, this.landSquash - dt);
    const rot = (s.crew.angle * Math.PI) / 180;
    let anim = "idle", tex = null, extraRot = 0, dy = 0, frame = -1, flipFix = false;
    const hasKO = s.textures.exists("lucas_ko"), hasHurt = s.textures.exists("lucas_hurt");
    if (this.ko && hasKO) {
      // folha lucas_ko 8x2: 0-8 queda até o chão, 9-15 levantando (2 s no total)
      const k = this.koT;
      tex = "lucas_ko";
      frame = k < 1.1 ? Math.min(8, Math.floor((k / 1.1) * 9)) : k < 1.5 ? 8 : Math.min(15, 9 + Math.floor(((k - 1.5) / 0.5) * 7));
      flipFix = frame >= 5 && frame <= 7; // quadros no chão desenhados virados para o outro lado
    } else if (this.ko) {
      const k = this.koT;
      if (k < 1.5) {
        anim = s.anims.exists(`${this.key}-slip`) ? "slip" : "crouch";
      } else {
        const u = (k - 1.5) / 0.5;
        anim = "crouch";
        extraRot = -this.facing * (1 - Math.min(1, u * 1.4)) * 1.45;
        dy = (1 - u) * 30;
      }
    } else if (this.hurtT > 0 && hasHurt) {
      // folha lucas_hurt: quadros 1-4 (impacto e recuo); o arco do knockback é feito no código (vy/knock)
      tex = "lucas_hurt";
      frame = 1 + Math.min(3, Math.floor(((0.35 - this.hurtT) / 0.35) * 4));
    } else if (this.hurtT > 0) {
      anim = s.anims.exists(`${this.key}-hurt`) ? "hurt" : "jump";
      extraRot = this.facing * 0.18;
    } else if (!this.grounded) anim = this.vy < 0 ? "jump" : "fall";
    else if (this.crouch) anim = "crouch";
    else if (this.holdT > 0.3 && s.anims.exists(`${this.key}-charge`)) anim = "charge";
    else if (this.fireCd > 0) anim = s.aimUp && s.anims.exists(`${this.key}-shoot_up`) ? "shoot_up" : "interact";
    else if (s.onPuddle?.(this.x) && Math.abs(this.vx) > 40 && s.anims.exists(`${this.key}-slip`)) anim = "slip";
    else if (Math.abs(this.vx) > 40) anim = "run";
    if (tex) { sp.anims.stop(); if (sp.texture.key !== tex || sp.frame.name !== frame) sp.setTexture(tex, frame); }
    else {
      const k = `${this.key}-${anim}`;
      const alt = `${this.key}-walk`;
      if (sp.texture.key !== this.key) sp.setTexture(this.key, 0);
      if (s.anims.exists(k)) sp.play(k, !(anim === "interact" && this.recoil > 0.09)); else if (anim === "run" && s.anims.exists(alt)) sp.play(alt, true);
    }
    const rec = this.recoil * 60;
    sp.setPosition(this.x - this.facing * rec, this.y + dy).setFlipX((this.facing < 0) !== flipFix).setRotation(rot + extraRot);
    const base = tex ? 1.05 * 1.12 : 1.05; // folhas hurt/ko desenhadas ~12% menores que lucas_sonic
    const sq = this.landSquash > 0 ? 0.12 : 0, rs = this.recoil > 0 ? 0.06 : 0;
    sp.setScale(base * (1 + sq + rs), base * (1 - sq - rs * 0.5));
    // vermelho + piscando durante a invulnerabilidade
    const blink = this.iframes > 0 && !this.ko && Math.sin(t * 40) > 0;
    sp.setAlpha(blink ? 0.35 : 1);
    if (this.hurtT > 0 || (this.redBlink && this.iframes > 0 && !this.ko && Math.sin(t * 20) > -0.2)) sp.setTint(0xff6060);
    else sp.setTint(s.storm.flashT > 0.5 ? 0xffffff : 0xdfe8f2);
    this.stars.setVisible(this.ko && this.koT < 1.6).setPosition(this.x, this.y - 90).setRotation(t * 4);
    this.shadow.setPosition(this.x, s.deckYAt(this.x) + 4).setScale(this.ko ? 1.6 : this.grounded ? 1 : 0.6, 1);
    const m = this.muzzle;
    this.device.setVisible(!this.ko).setPosition(m.x, m.y).setScale(0.22 + this.charge * 0.5 + (this.recoil > 0 ? 0.2 : 0)).setAlpha(0.6 + Math.sin(t * 9) * 0.2);
    this.drip.setPosition(this.x, sp.y - 220);
  }
}
