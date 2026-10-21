// @ts-nocheck
import Phaser from "../phaser.js";
/** Suavização, deadzone, look-ahead, zoom da praça e pixels inteiros. */
export class CameraController {
  constructor(scene, level) {
    this.scene = scene;
    this.level = level;
    this.cfg = level.camera;
    this.maxX = Math.max(0, level.width - scene.cameras.main.width);
    this.lookBoost = 0;
    this.revealZoom = 0;
    this.revealTimer = 0;
    this.punchZoom = 1;
    this.punchTimer = 0;
    const cam = scene.cameras.main;
    cam.setBounds(0, 0, level.width, level.height);
    cam.setRoundPixels(true);
    cam.setZoom(1);
  }

  boost(seconds) {
    this.lookBoost = Math.max(this.lookBoost, seconds);
  }

  reveal(zoom, seconds) {
    this.revealZoom = zoom;
    this.revealTimer = seconds;
    this.lookBoost = Math.max(this.lookBoost, seconds);
  }

  punch(zoom, seconds) {
    this.punchZoom = zoom;
    this.punchTimer = seconds;
  }

  desiredZoom(playerX) {
    let zoom = 1;
    if (this.revealTimer > 0 && this.revealZoom) zoom = this.revealZoom;
    for (const zone of this.level.zoomZones || []) {
      if (playerX >= zone.x && playerX < zone.x + zone.w) zoom = zone.zoom;
    }
    return Math.max(1, zoom);
  }

  update(dt, player) {
    const cam = this.scene.cameras.main;
    const cfg = this.cfg;
    const vx = player.sprite.body.velocity.x;
    let focus = player.facing >= 0 ? cfg.rightFocus : cfg.leftFocus;
    if (this.lookBoost > 0) {
      focus = player.facing >= 0 ? 0.3 : 0.7;
      this.lookBoost -= dt;
    }
    if (this.revealTimer > 0) this.revealTimer -= dt;
    if (this.punchTimer > 0) this.punchTimer -= dt;

    const viewW = cam.width / cam.zoom;
    this.maxX = Math.max(0, this.level.width - viewW);
    const screenX = player.x - cam.scrollX;
    const [deadL, deadR] = cfg.deadzone;
    let desired = player.x - viewW * focus + vx * cfg.lookAhead;
    if (
      this.lookBoost <= 0 &&
      screenX > viewW * deadL &&
      screenX < viewW * deadR &&
      Math.abs(vx) < 28
    ) {
      desired = cam.scrollX;
    }

    desired = Phaser.Math.Clamp(desired, 0, this.maxX);
    const t = 1 - Math.exp(-cfg.lerp * dt);
    cam.scrollX += (desired - cam.scrollX) * t;
    cam.scrollY = 0;

    let zoom = this.desiredZoom(player.x);
    if (this.punchTimer > 0) zoom = Math.max(zoom, this.punchZoom);
    cam.setZoom(cam.zoom + (zoom - cam.zoom) * (1 - Math.exp(-3 * dt)));
  }
}
