import registration from './atlas_registration.json' with { type: 'json' };

/** Compõe uma textura de cenário com o recorte opaco do atlas, sem alterar o PNG. */
export function paintAtlasFrame(scene, key, source, width, height, background) {
  if (scene.textures.exists(key) || !source) return false;
  const [atlas, name] = source;
  if (!scene.textures.exists(atlas)) return false;
  const frame = scene.textures.getFrame(atlas, name);
  const crop = registration[atlas]?.frames[name]?.crop;
  if (!frame || !crop) return false;
  const texture = scene.textures.createCanvas(key, width, height);
  const ctx = texture.getContext();
  if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, width, height); }
  ctx.drawImage(frame.source.image, frame.cutX + crop[0], frame.cutY + crop[1],
    crop[2], crop[3], 0, 0, width, height);
  texture.farolAtlasSource = source;
  texture.refresh();
  return true;
}
