// @ts-nocheck
/** Gaivotas soltas, à parte das que já estão pintadas no céu. */
export class SeagullSystem {
  constructor(scene, level) {
    this.scene = scene;
    this.cfg = level.seagulls;
    this.width = level.width;
    this.texture = this.pickTexture(scene);
    this.birds = [];
    const count = Math.max(3, Math.min(6, this.cfg.count || 5));
    for (let i = 0; i < count; i++) this.birds.push(this.make(i, true));
  }

  pickTexture(scene) {
    if (scene.textures.exists("seagull")) return "seagull";
    this.drawVector(scene, "seagull-down", 1);
    this.drawVector(scene, "seagull-up", -1);
    return "seagull-down";
  }

  drawVector(scene, key, wing) {
    if (scene.textures.exists(key)) return;
    const tex = scene.textures.createCanvas(key, 96, 48);
    const ctx = tex.getContext();
    ctx.clearRect(0, 0, 96, 48);
    ctx.fillStyle = "#f4f7fb";
    ctx.strokeStyle = "#1b2a33";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(40, 28, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(24, 28);
    ctx.quadraticCurveTo(8, 28 + wing * 16, 4, 20 + wing * 10);
    ctx.quadraticCurveTo(20, 24, 28, 26);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(48, 26);
    ctx.quadraticCurveTo(78, 10 + wing * 14, 90, 18 + wing * 8);
    ctx.quadraticCurveTo(70, 28, 50, 28);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(54, 28);
    ctx.lineTo(66, 30);
    ctx.lineTo(54, 32);
    ctx.fillStyle = "#f0b429";
    ctx.fill();
    tex.refresh();
  }

  make(i, scattered) {
    const cfg = this.cfg;
    const x = scattered ? (i + 1) * (this.width / (cfg.count + 1)) : -180 - i * 90;
    const scale = (cfg.scale || 0.2) * (0.82 + (i % 4) * 0.1);
    const animated = this.scene.anims.exists("seagull-fly");
    const sprite = this.scene.add
      .sprite(Math.round(x), cfg.y, this.texture)
      .setDepth(cfg.depth || -42)
      .setScale(scale);
    if (animated) {
      sprite.play({ key: "seagull-fly", frameRate: 8 + (i % 3) * 2, startFrame: i % 6 });
    }
    return {
      sprite,
      x,
      baseY: cfg.y + (i % 3) * 46 - 20,
      amp: (cfg.amp || 22) + (i % 3) * 8,
      speed: (cfg.speed || 90) + i * 18,
      phase: i * 1.7,
      flap: i * 0.05,
      up: i % 2 === 0,
      scale,
      animated,
    };
  }

  update(dt) {
    const vector = !this.animatedBirds();
    for (const bird of this.birds) {
      bird.x += bird.speed * dt;
      if (bird.x > this.width + 220) {
        bird.x = -180;
        bird.baseY = this.cfg.y + Math.random() * 90;
      }
      if (vector) {
        bird.flap += dt;
        if (bird.flap > 0.16) {
          bird.flap = 0;
          bird.up = !bird.up;
          bird.sprite.setTexture(bird.up ? "seagull-up" : "seagull-down");
        }
      }
      const y = bird.baseY + Math.sin(bird.x * 0.01 + bird.phase) * bird.amp;
      bird.sprite.setPosition(Math.round(bird.x), Math.round(y));
    }
  }

  animatedBirds() {
    return this.birds.length > 0 && this.birds[0].animated;
  }
}
