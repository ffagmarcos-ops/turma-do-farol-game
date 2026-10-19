// @ts-nocheck
/**
 * FAÍSCA — companheiro automático (sempre em 4 patas). Não colide com a Sofia (nunca empurra nem bloqueia).
 * Segue atrás dela, para quando ela para, pula obstáculos e vãos pequenos, sobe nas plataformas,
 * reage a inimigos (rosnado), fareja segredos (hook: sniffTarget) e, se ficar longe/preso,
 * reaparece discretamente num ponto seguro atrás dela.
 */
import { SPRITES } from "./Fase3Assets.js";

export class Faisca {
  constructor(scene, x, y, art) {
    const F = SPRITES.faisca;
    this.scene = scene; this.anim = art.faisca.anim;
    const sp = scene.physics.add.sprite(x, y, art.faisca.key, 0).setOrigin(F.origin[0], F.origin[1]).setScale(F.scale).setDepth(9);
    const [w, h, ox, oy] = F.body;
    sp.body.setSize(w, h, false).setOffset(ox, oy);
    sp.body.setMaxVelocity(900, 1400);
    sp.body.setCollideWorldBounds(true);
    this.sprite = sp; this.facing = 1; this.mode = "follow"; this.stuckT = 0; this.sniffT = 0; this.alertT = 0; this.sniffCooldown = 0;
    this.trail = []; this.trailT = 0;
    this.play("idle");
  }
  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  play(pose) { const k = this.anim[pose]; if (k && this.scene.anims.exists(k) && this.sprite.anims.currentAnim?.key !== k) this.sprite.play(k); }
  groundAhead(dir) {
    const b = this.sprite.body;
    const hits = this.scene.physics.overlapRect(b.center.x + dir * 70, b.bottom + 4, 10, 40, false, true);
    return hits.length > 0;
  }
  /** ponto seguro: posição em que a Sofia pisou ~160-300 px atrás dela */
  safeSpot(sofia) {
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const p = this.trail[i];
      if (Math.abs(p.x - sofia.x) > 120 && Math.abs(p.y - sofia.y) < 120) return p;
    }
    return { x: sofia.x - sofia.facing * 110, y: sofia.y };
  }
  teleport(sofia) {
    const p = this.safeSpot(sofia);
    this.sprite.setPosition(p.x, p.y - 4); this.sprite.body.reset(p.x, p.y - 4);
    this.scene.puff?.(p.x, p.y - 30, 0.6);
    this.stuckT = 0;
  }
  update(dt, sofia, ctx = {}) {
    const sp = this.sprite, b = sp.body;
    const grounded = b.blocked.down || b.touching.down;
    this.trailT -= dt;
    if (sofia.grounded && this.trailT <= 0) { this.trailT = 0.1; this.trail.push({ x: sofia.x, y: sofia.y }); if (this.trail.length > 40) this.trail.shift(); }
    this.sniffCooldown = Math.max(0, this.sniffCooldown - dt); this.alertT = Math.max(0, this.alertT - dt);

    let targetX = sofia.x - sofia.facing * 120;
    let pose = null;
    if (ctx.charging) { targetX = sofia.x + sofia.facing * 95; pose = "attack"; }
    else if (ctx.sniffX != null && this.sniffCooldown <= 0) { targetX = ctx.sniffX; this.mode = "sniff"; }
    else this.mode = "follow";

    const dx = targetX - sp.x, adx = Math.abs(dx), dir = Math.sign(dx) || this.facing;
    const sofiaSpeed = Math.abs(sofia.body.velocity.x);
    let speed = 0;
    if (adx > 320) speed = 640; else if (adx > 45) speed = Math.max(240, Math.min(600, sofiaSpeed + 60));
    const vx = b.velocity.x, tv = dir * speed;
    b.setVelocityX(vx + (tv - vx) * Math.min(1, dt * (grounded ? 9 : 3)));
    if (speed) this.facing = dir;
    else if (!ctx.charging) this.facing = Math.sign(sofia.x - sp.x) || this.facing;
    if (ctx.charging) this.facing = sofia.facing;

    if (grounded && speed) {
      const blocked = (dir > 0 && b.blocked.right) || (dir < 0 && b.blocked.left);
      if (blocked) b.setVelocityY(-820);
      else if (!this.groundAhead(dir)) b.setVelocityY(-880); // vão pequeno: pula
    }
    // Sofia numa plataforma logo acima: sobe atrás dela
    if (grounded && sofia.grounded && sofia.y < sp.y - 80 && Math.abs(sofia.x - sp.x) < 300) b.setVelocityY(-1000);

    // sniff (segredo): para, fareja, late baixinho
    if (this.mode === "sniff" && adx < 50 && grounded) {
      b.setVelocityX(0); pose = "sniff"; this.sniffT += dt;
      if (this.sniffT > 1.1) { pose = "bark"; if (this.sniffT - dt <= 1.1) ctx.onSniff?.(); }
      if (this.sniffT > 1.9) { this.sniffT = 0; this.sniffCooldown = 9; }
    } else if (this.mode !== "sniff") this.sniffT = 0;

    // inimigo perto: rosna e encara
    if (ctx.enemyNear && this.alertT <= 0 && !ctx.charging) { this.alertT = 4; ctx.onGrowl?.(); }

    // longe demais / preso / caiu: reaparece atrás da Sofia (fora da vista, se der)
    const dist = Math.hypot(sofia.x - sp.x, sofia.y - sp.y);
    if (Math.abs(sofia.y - sp.y) > 380 || (adx > 400 && Math.abs(vx) < 30)) this.stuckT += dt; else this.stuckT = 0;
    if (dist > 1150 || this.stuckT > 1.4 || sp.y > (ctx.killY || 1300)) this.teleport(sofia);

    sp.setFlipX(this.facing < 0);
    if (!pose) {
      if (!grounded) pose = b.velocity.y < 0 ? "jump" : "fall";
      else if (Math.abs(b.velocity.x) > 380) pose = "run";
      else if (Math.abs(b.velocity.x) > 30) pose = "walk";
      else pose = this.alertT > 3.2 ? "bark" : "idle";
    }
    this.play(pose);
  }
}
