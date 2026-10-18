// @ts-nocheck
/** Placeholders gerados por código (mesmas chaves do AssetManifest; PNG real tem prioridade). */
function canvasTex(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h);
  draw(tex.getContext(), w, h);
  tex.refresh();
}
const skin = (ctx, x, y, r) => {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, "#d46a8f");
  g.addColorStop(0.55, "#8e2f63");
  g.addColorStop(1, "#4a1538");
  return g;
};
const radial = (ctx, w, stops) => {
  const g = ctx.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, w);
};
export function makeBossTextures(scene) {
  const T = (k, w, h, d) => canvasTex(scene, k, w, h, d);
  T("f2_p_corpo", 900, 760, (ctx, w, h) => {
    ctx.fillStyle = skin(ctx, w / 2, h * 0.42, w * 0.5);
    ctx.beginPath();
    ctx.moveTo(w * 0.06, h);
    ctx.bezierCurveTo(0, h * 0.35, w * 0.22, h * 0.02, w * 0.5, h * 0.02);
    ctx.bezierCurveTo(w * 0.78, h * 0.02, w, h * 0.35, w * 0.94, h);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#2a0a22";
    ctx.stroke();
    ctx.fillStyle = "rgba(255,190,220,0.18)";
    for (let i = 0; i < 26; i++) {
      ctx.beginPath();
      ctx.ellipse(w * (0.15 + Math.random() * 0.7), h * (0.08 + Math.random() * 0.5), 14 + Math.random() * 26, 10 + Math.random() * 16, Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.ellipse(w * 0.36, h * 0.16, w * 0.16, h * 0.07, -0.4, 0, Math.PI * 2);
    ctx.fill();
  });
  T("f2_p_olho", 200, 200, (ctx, w) => {
    const g = ctx.createRadialGradient(w * 0.45, w * 0.4, 10, w / 2, w / 2, w / 2);
    g.addColorStop(0, "#fffef2");
    g.addColorStop(1, "#d8cdb2");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(w / 2, w / 2, w / 2 - 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#2a0a22";
    ctx.stroke();
  });
  T("f2_p_pupila", 96, 96, (ctx, w) => {
    ctx.fillStyle = "#e0a400";
    ctx.beginPath(); ctx.arc(w / 2, w / 2, w / 2 - 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#120612";
    ctx.beginPath(); ctx.ellipse(w / 2, w / 2, w * 0.18, w * 0.36, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(w * 0.36, w * 0.3, 8, 0, Math.PI * 2); ctx.fill();
  });
  T("f2_p_palpebra", 220, 120, (ctx, w, h) => {
    ctx.fillStyle = "#7a2756";
    ctx.beginPath(); ctx.ellipse(w / 2, 0, w / 2 - 4, h - 6, 0, 0, Math.PI); ctx.fill();
    ctx.lineWidth = 8; ctx.strokeStyle = "#2a0a22"; ctx.stroke();
  });
  T("f2_p_boca", 180, 110, (ctx, w, h) => {
    ctx.fillStyle = "#1c0612";
    ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w / 2 - 6, h / 2 - 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#a8344e";
    ctx.beginPath(); ctx.ellipse(w / 2, h * 0.68, w * 0.3, h * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  });
  const seg = (key, w, h, tip) => T(key, w, h, (ctx) => {
    ctx.fillStyle = skin(ctx, w * 0.45, h * 0.5, w * 0.6);
    ctx.beginPath();
    if (tip) {
      ctx.moveTo(w * 0.15, h);
      ctx.quadraticCurveTo(w * 0.1, h * 0.3, w * 0.55, 4);
      ctx.quadraticCurveTo(w * 0.95, h * 0.4, w * 0.85, h);
    } else ctx.ellipse(w / 2, h / 2, w / 2 - 4, h / 2 + 6, 0, 0, Math.PI * 2);
    ctx.closePath(); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = "#2a0a22"; ctx.stroke();
    for (let i = 0; i < (tip ? 2 : 3); i++) {
      const y = h * (0.25 + i * 0.28);
      ctx.fillStyle = "#f2b7c9";
      ctx.beginPath(); ctx.ellipse(w * 0.78, y, w * 0.13, h * 0.09, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#b85d7c";
      ctx.beginPath(); ctx.ellipse(w * 0.78, y, w * 0.06, h * 0.045, 0, 0, Math.PI * 2); ctx.fill();
    }
  });
  seg("f2_t_base", 150, 120, false);
  seg("f2_t_meio", 120, 104, false);
  seg("f2_t_ponta", 100, 130, true);
  T("f2_glow", 220, 220, (ctx, w) => radial(ctx, w, [[0, "rgba(255,240,180,1)"], [0.4, "rgba(255,200,90,0.5)"], [1, "rgba(255,200,90,0)"]]));
  T("f2_stars", 160, 60, (ctx) => {
    ctx.fillStyle = "#ffe36a";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const r = k % 2 ? 8 : 20, a = (k / 10) * Math.PI * 2 - Math.PI / 2;
        ctx.lineTo(30 + i * 50 + Math.cos(a) * r, 30 + Math.sin(a) * r);
      }
      ctx.fill();
    }
  });
  T("f2_ring", 160, 160, (ctx, w) => {
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(140,240,255,${0.9 - i * 0.28})`;
      ctx.lineWidth = 10 - i * 3;
      ctx.beginPath(); ctx.arc(w / 2, w / 2, w / 2 - 10 - i * 18, -1.1, 1.1); ctx.stroke();
    }
  });
  T("f2_rain", 6, 64, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(200,225,255,0)"); g.addColorStop(1, "rgba(220,240,255,0.95)");
    ctx.fillStyle = g; ctx.fillRect(1, 0, w - 2, h);
  });
  T("f2_drop", 16, 16, (ctx) => { ctx.fillStyle = "rgba(220,240,255,0.95)"; ctx.beginPath(); ctx.arc(8, 8, 6, 0, Math.PI * 2); ctx.fill(); });
  T("f2_bubble", 40, 40, (ctx) => { ctx.strokeStyle = "rgba(220,250,255,0.9)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(20, 20, 14, 0, Math.PI * 2); ctx.stroke(); });
  T("f2_ink", 110, 110, (ctx) => {
    const g = ctx.createRadialGradient(40, 38, 6, 55, 55, 52);
    g.addColorStop(0, "#5a3a7a"); g.addColorStop(1, "#120818");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(55, 55, 48, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.beginPath(); ctx.arc(40, 36, 10, 0, Math.PI * 2); ctx.fill();
  });
  T("f2_puddle", 260, 50, (ctx, w, h) => {
    ctx.fillStyle = "rgba(24,10,32,0.92)"; ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w / 2 - 4, h / 2 - 4, 0, 0, Math.PI * 2); ctx.fill();
  });
  T("f2_tinta_tela", 1536, 1024, (ctx, w, h) => {
    ctx.fillStyle = "rgba(18,8,26,0.94)";
    for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(w * 0.62 + (Math.random() - 0.3) * w * 0.5, h * 0.3 + (Math.random() - 0.5) * h * 0.5, 30 + Math.random() * 170, 0, Math.PI * 2); ctx.fill(); }
    for (let i = 0; i < 14; i++) ctx.fillRect(w * (0.45 + Math.random() * 0.5), h * 0.4, 14 + Math.random() * 18, h * (0.2 + Math.random() * 0.4));
  });
  T("f2_clouds", 1536, 600, (ctx, w, h) => {
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * w, y = Math.random() * h * 0.7, r = 60 + Math.random() * 160;
      const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
      g.addColorStop(0, "rgba(40,58,78,0.75)"); g.addColorStop(1, "rgba(20,30,44,0)");
      ctx.fillStyle = g;
      for (const dx of [-w, 0, w]) ctx.fillRect(x - r + dx, y - r, r * 2, r * 2);
    }
  });
  T("f2_beam", 900, 160, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, "rgba(255,236,170,0.65)"); g.addColorStop(1, "rgba(255,236,170,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, h / 2 - 6); ctx.lineTo(w, 0); ctx.lineTo(w, h); ctx.lineTo(0, h / 2 + 6); ctx.fill();
  });
  T("f2_warn", 520, 120, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(4,10,20,0.85)"); g.addColorStop(1, "rgba(4,10,20,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
  });
  T("f2_excl", 90, 130, (ctx) => {
    ctx.fillStyle = "#ffcf3a"; ctx.strokeStyle = "#2a1400"; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(45, 4); ctx.lineTo(86, 120); ctx.lineTo(4, 120); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#2a1400"; ctx.fillRect(39, 34, 12, 52); ctx.fillRect(39, 96, 12, 12);
  });
}
