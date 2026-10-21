// @ts-nocheck
import { FX } from "../fx/FXConfig.js";

/**
 * Oito camadas, fatores fixos no JSON.
 * Panoramas contínuos repetem com crossfade só na junção.
 * O píer repete o tile inteiro. As ondas ficam no VisualFX.
 */
export class ParallaxManager {
  constructor(scene, level) {
    this.scene = scene;
    this.level = level;
    this.cam = scene.cameras.main;
    this.bands = [];
    this.segments = [];
    this.waters = [];
    this.cam.setRoundPixels(true);

    for (const layer of level.layers) {
      if (layer.mode === "tile") this.placeTile(layer);
      else if (layer.mode === "segments") this.placeSegments(layer);
      else if (layer.mode === "ground") this.placeGround(layer);
      else if (layer.mode === "strip") this.placeStrip(layer);
    }
  }

  dress(layer, node) {
    if (FX.distant.ids.includes(layer.id)) {
      node.setTint(FX.distant.tint);
      node.setAlpha(FX.distant.alpha);
    }
    return node;
  }

  placeTile(layer) {
    if (!this.scene.textures.exists(layer.key)) return;
    const band = this.scene.add
      .tileSprite(0, Math.round(layer.bottom != null ? layer.bottom - layer.h : layer.y), 1920, layer.h, layer.key)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(layer.depth);
    const source = this.scene.textures.get(layer.key).getSourceImage();
    if (source && source.height && source.height !== layer.h) {
      const scale = layer.h / source.height;
      band.setTileScale(scale, scale);
    }
    this.dress(layer, band);
    this.bands.push({ node: band, factor: layer.factor, drift: layer.drift || 0 });
  }

  /** Cópias inteiras de um panorama (bordas em mar), entrando na tela quando a câmera passa de startScroll. */
  placeStrip(layer) {
    if (!this.scene.textures.exists(layer.key)) return;
    const source = this.scene.textures.get(layer.key).getSourceImage();
    const scale = layer.h / source.height;
    const w = Math.round(source.width * scale);
    const x0 = Math.round(1920 + layer.startScroll * layer.factor);
    for (let i = 0; i < (layer.count || 1); i++) {
      const image = this.scene.add
        .image(x0 + i * (w - 2), layer.bottom, layer.key)
        .setOrigin(0, 1)
        .setScale(scale)
        .setScrollFactor(layer.factor)
        .setDepth(layer.depth);
      this.dress(layer, image);
      this.segments.push(image);
    }
  }

  placeSegments(layer) {
    const overlap = layer.overlap || this.level.seam.overlap || 256;
    const keys = layer.panels?.length ? layer.panels : [layer.key];
    const images = [];
    for (const key of keys) {
      if (!this.scene.textures.exists(key)) return;
      images.push(this.scene.textures.get(key).getSourceImage());
    }
    const stitchedKey = this.stitch(layer.id, images, overlap, keys);
    const source = this.scene.textures.get(stitchedKey).getSourceImage();
    const span =
      layer.repeat === false
        ? source.width
        : Math.ceil(1920 + (this.level.width - 1920) * layer.factor) + overlap;
    const step = Math.max(1, source.width - overlap);
    const faded = layer.repeat === false ? null : this.fadeLeft(stitchedKey, source, overlap);
    for (let x = 0; x < span; x += step) {
      const key = x === 0 || !faded ? stitchedKey : faded;
      const image = this.scene.add
        .image(Math.round(x), Math.round(layer.y || 0), key)
        .setOrigin(0, 0)
        .setScrollFactor(layer.factor)
        .setDepth(layer.depth);
      this.dress(layer, image);
      this.segments.push(image);
      if (layer.repeat === false) break;
      if (x + source.width >= span) break;
    }
  }

  stitch(id, images, overlap, keys) {
    if (images.length === 1 && keys && keys[0]) return keys[0];
    const name = `${id}-stitch`;
    if (this.scene.textures.exists(name)) return name;
    if (images.length === 1) {
      const only = images[0];
      const canvas = this.scene.textures.createCanvas(name, only.width, only.height);
      canvas.getContext().drawImage(only, 0, 0);
      canvas.refresh();
      return name;
    }
    const height = images[0].height;
    let width = images[0].width;
    for (let i = 1; i < images.length; i++) width += images[i].width - overlap;
    const canvas = this.scene.textures.createCanvas(name, width, height);
    const ctx = canvas.getContext();
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(images[0], 0, 0);
    let x = images[0].width - overlap;
    for (let i = 1; i < images.length; i++) {
      ctx.drawImage(this.maskLeft(images[i], overlap), Math.round(x), 0);
      x += images[i].width - overlap;
    }
    canvas.refresh();
    return name;
  }

  maskLeft(image, overlap) {
    const mask = document.createElement("canvas");
    mask.width = image.width;
    mask.height = image.height;
    const ctx = mask.getContext("2d");
    ctx.drawImage(image, 0, 0);
    ctx.globalCompositeOperation = "destination-in";
    const fade = ctx.createLinearGradient(0, 0, overlap, 0);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, overlap, image.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(overlap, 0, image.width - overlap, image.height);
    return mask;
  }

  fadeLeft(key, source, overlap) {
    const name = `${key}-fadein`;
    if (this.scene.textures.exists(name)) return name;
    const canvas = this.scene.textures.createCanvas(name, source.width, source.height);
    const ctx = canvas.getContext();
    ctx.drawImage(source, 0, 0);
    ctx.globalCompositeOperation = "destination-in";
    const fade = ctx.createLinearGradient(0, 0, overlap, 0);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, overlap, source.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(overlap, 0, source.width - overlap, source.height);
    canvas.refresh();
    return name;
  }

  placeGround(layer) {
    if (!this.scene.textures.exists(layer.key)) return;
    const source = this.scene.textures.get(layer.key).getSourceImage();
    const floors = this.level.colliders || [];
    const spans = floors.length
      ? floors
      : [{ x: 0, y: this.level.groundY, w: this.level.width, h: 240 }];
    for (const box of spans) {
      const lower = box.y > this.level.groundY + 8;
      const height = lower ? Math.min(source.height, Math.max(box.h, 96)) : source.height;
      this.layPier(layer, layer.key, box.x, box.y, box.w, height, box.x);
    }
    this.layGapWater(layer);
  }

  layPier(layer, key, x, y, width, height, phase) {
    if (width < 8 || height < 8) return;
    const tile = this.scene.add
      .tileSprite(Math.round(x), Math.round(y), Math.round(width), Math.round(height), key)
      .setOrigin(0, 0)
      .setScrollFactor(layer.factor)
      .setDepth(layer.depth);
    const k = this.level.pierScale || 1;
    tile.setTileScale(k, k);
    tile.tilePositionX = Math.round(phase / k);
    tile.setData("pier", true);
  }

  layGapWater(layer) {
    if (!this.scene.textures.exists("bg_sea")) return;
    for (const gap of this.level.gaps || []) {
      const water = this.scene.add
        .tileSprite(Math.round(gap.x), this.level.groundY, Math.round(gap.w), 200, "bg_sea")
        .setOrigin(0, 0)
        .setScrollFactor(1)
        .setDepth(3);
      this.waters.push(water);
    }
  }

  update(time) {
    const scroll = this.cam.scrollX;
    const seconds = time / 1000;
    for (const band of this.bands) {
      if (band.node.getData("pier")) continue;
      band.node.tilePositionX = Math.round(scroll * band.factor + seconds * band.drift);
    }
    for (const water of this.waters) {
      water.tilePositionX = Math.round(scroll * 0.35 - seconds * 18);
    }
  }
}
