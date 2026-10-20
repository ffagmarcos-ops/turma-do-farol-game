import registration from './atlas_registration.json' with { type: 'json' };

// Alturas visuais no mundo. A Bia conserva a escala de locomoção já usada no jogo.
const HEIGHTS = {
  bia_locomotion: 192.7, bia_throw: 192.7, bia_secret: 192.7,
  faisca_run: 95, faisca_bark: 95, crab: 79.92, monkey: 187.68,
  toninho_rope: 240, marina_push: 215, julia_camera: 215, lucas_device: 215,
};

/** Mantém os pés e a hitbox no mesmo lugar quando o atlas troca de tamanho. */
export function bindAtlasGeometry(sprite, bodySize) {
  const refresh = () => {
    const texture = sprite.texture.key;
    const data = registration[texture];
    const point = data?.frames[sprite.frame.name];
    if (!point) return;
    const scale = HEIGHTS[texture] / data.frames.f000.height;
    sprite.setScale(scale).setOrigin(point.footX / sprite.width, point.footY / sprite.height);
    if (sprite.body && bodySize) {
      const [width, height] = bodySize();
      sprite.body.setSize(width / scale, height / scale, false);
      sprite.body.setOffset(point.footX - width / scale / 2, point.footY - height / scale);
    }
  };
  sprite.on('animationupdate', refresh);
  sprite.on('animationstart', refresh);
  sprite.refreshAtlasGeometry = refresh;
  refresh();
  return refresh;
}
