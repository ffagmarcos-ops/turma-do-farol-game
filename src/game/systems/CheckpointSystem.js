// @ts-nocheck
const SAVE_KEY = "farol-vila-das-conchas-v4";

export function readProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== 4) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeProgress(partial) {
  const prev = readProgress() || {
    version: 4,
    checkpointX: null,
    shells: [],
    talks: [],
    story: null,
  };
  const next = { ...prev, ...partial, version: 4 };
  localStorage.setItem(SAVE_KEY, JSON.stringify(next));
  return next;
}

export class CheckpointSystem {
  constructor(scene, level, savedX) {
    this.scene = scene;
    this.level = level;
    this.points = level.checkpoints.map((cp) => ({
      ...cp,
      y: level.groundY,
      armed: savedX != null && savedX >= cp.x,
    }));
    this.spawn = {
      x: savedX || level.spawn.x,
      y: level.groundY,
    };
    this.flags = this.points.map((cp) => this.drawFlag(cp));
  }

  drawFlag(cp) {
    const g = this.scene.add.graphics().setDepth(19);
    const y = cp.y;
    g.fillStyle(0x4a3424, 1);
    g.fillRoundedRect(cp.x - 8, y - 250, 16, 250, 4);
    g.fillStyle(0xd7c4a3, 1);
    g.fillCircle(cp.x, y - 250, 10);
    g.fillStyle(cp.armed ? 0xf2d37a : 0xe25b2a, 1);
    g.fillTriangle(cp.x + 8, y - 244, cp.x + 8, y - 188, cp.x + 78, y - 216);
    g.lineStyle(3, 0xfff6df, 0.9);
    g.strokeTriangle(cp.x + 8, y - 244, cp.x + 8, y - 188, cp.x + 78, y - 216);
    return g;
  }

  refreshFlags() {
    this.flags.forEach((g) => g.destroy());
    this.flags = this.points.map((cp) => this.drawFlag(cp));
  }

  respawn(player) {
    player.sprite.setPosition(Math.round(this.spawn.x), this.level.groundY);
    player.sprite.setVelocity(0, 0);
  }

  update(player) {
    let changed = false;
    for (const cp of this.points) {
      if (!cp.armed && player.x >= cp.x - 20) {
        cp.armed = true;
        this.spawn = { x: cp.x + 30, y: this.level.groundY };
        changed = true;
      }
    }
    if (changed) {
      this.refreshFlags();
      writeProgress({ checkpointX: this.spawn.x });
      this.scene.audio?.play("bell");
    }
  }
}

export function clearProgress() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {}
}
