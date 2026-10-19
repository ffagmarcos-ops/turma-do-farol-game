// @ts-nocheck
/**
 * ARTE PROVISÓRIA da Fase 3, desenhada em código (Canvas 2D), só enquanto a arte final não chega.
 * Cada função cria a textura com a MESMA chave/grade do manifesto (Fase3Assets.js), então a arte final
 * entra no lugar sem mudar código. Estilo: contorno escuro + 2-3 tons (soft cel shading), sem texto.
 */
const OL = "#2a1a10";

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function canvasTex(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return scene.textures.get(key);
  const t = scene.textures.createCanvas(key, w, h);
  const ctx = t.context;
  draw(ctx, w, h);
  t.refresh();
  return t;
}

export function canvasSheet(scene, key, fw, fh, count, cols, drawFrame) {
  if (scene.textures.exists(key)) return scene.textures.get(key);
  const rows = Math.ceil(count / cols);
  const t = scene.textures.createCanvas(key, fw * cols, fh * rows);
  const ctx = t.context;
  for (let i = 0; i < count; i++) {
    ctx.save();
    ctx.translate((i % cols) * fw, Math.floor(i / cols) * fh);
    ctx.beginPath(); ctx.rect(0, 0, fw, fh); ctx.clip();
    drawFrame(ctx, i, fw, fh, scene);
    ctx.restore();
  }
  t.refresh();
  for (let i = 0; i < count; i++) t.add(i, 0, (i % cols) * fw, Math.floor(i / cols) * fh, fw, fh);
  return t;
}

const line = (ctx, pts, width, color) => {
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = OL; ctx.lineWidth = width + 6; ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
};
const blob = (ctx, fill, stroke = OL, lw = 4) => { ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } };
const limb = (x, y, a1, l1, a2, l2) => {
  const kx = x + Math.sin(a1) * l1, ky = y + Math.cos(a1) * l1;
  return [[x, y], [kx, ky], [kx + Math.sin(a2) * l2, ky + Math.cos(a2) * l2]];
};

/* ---------------- SOFIA (provisória) ---------------- */
const SOFIA_POSES = (() => {
  const P = [];
  const base = { lean: 0, bob: 0, hipY: 146, hipL: 0.06, hipR: -0.06, kneeL: 0.05, kneeR: 0.05, armL: 0.15, armR: -0.12, elbL: 0.3, elbR: 0.3, eyes: "open" };
  const p = (o) => P.push({ ...base, ...o });
  p({}); p({ bob: 2, armL: 0.1, armR: -0.08 }); // 0-1 idle
  for (let i = 0; i < 4; i++) { const s = Math.sin(i * Math.PI / 2 + 0.6); p({ hipL: 0.45 * s, hipR: -0.45 * s, kneeL: Math.max(0, -s) * 0.7 + 0.1, kneeR: Math.max(0, s) * 0.7 + 0.1, armL: -0.5 * s, armR: 0.5 * s, bob: -Math.abs(Math.cos(i * Math.PI / 2 + 0.6)) * 4, lean: 0.06 }); } // 2-5 walk
  for (let i = 0; i < 4; i++) { const s = Math.sin(i * Math.PI / 2 + 0.6); p({ hipL: 0.8 * s, hipR: -0.8 * s, kneeL: Math.max(0, -s) * 1.3 + 0.2, kneeR: Math.max(0, s) * 1.3 + 0.2, armL: -0.95 * s, armR: 0.95 * s, elbL: 1.2, elbR: 1.2, bob: -Math.abs(Math.cos(i * Math.PI / 2 + 0.6)) * 7, lean: 0.24 }); } // 6-9 run
  p({ hipL: 0.7, kneeL: 1.4, hipR: -0.25, kneeR: 0.5, armL: 2.5, armR: 2.0, elbL: 0.2, elbR: 0.3, bob: -6 }); // 10 jump
  p({ hipL: 0.35, kneeL: 0.4, hipR: -0.35, kneeR: 0.5, armL: 1.9, armR: 1.3, elbL: 0.2, elbR: 0.2 }); // 11 fall
  p({ hipY: 168, hipL: 0.7, kneeL: 1.5, hipR: 0.3, kneeR: 1.2, armL: 0.7, armR: 0.4, lean: 0.25 }); // 12 land
  p({ crawl: 0 }); p({ crawl: 1 }); // 13-14 crouch/crawl
  p({ hipL: 0.35, hipR: -0.3, kneeR: 0.2, armL: 1.75, elbL: 0.05, armR: -0.6, lean: 0.12 }); // 15 throw
  p({ lean: -0.35, armL: 2.6, armR: 2.2, hipL: 0.2, hipR: -0.15, eyes: "shut" }); // 16 hurt
  p({ hipL: 0.3, hipR: -0.25, armL: 1.57, elbL: 0, armR: 0.2, lean: 0.05 }); // 17 point
  p({ armL: 2.9, armR: 2.6, elbL: 0.2, elbR: 0.2, bob: -4 }); p({ armL: 2.6, armR: 2.9, elbL: 0.2, elbR: 0.2, bob: 0 }); // 18-19 cheer
  p({ armL: 2.5, elbL: 2.4, armR: -0.1, lean: 0.05 }); // 20 look
  p({ hipL: 0.55, kneeL: 1.1, hipR: 0.35, kneeR: 0.9, armL: 2.2, elbL: 0.35, armR: 1.95, elbR: 0.4, lean: -0.05 }); // 21 climb_idle
  p({ hipL: 0.85, kneeL: 1.45, hipR: 0.2, kneeR: 0.6, armL: 2.55, elbL: 0.2, armR: 1.75, elbR: 0.55, bob: -4, lean: -0.04 }); // 22 climb 1
  p({ hipL: 0.2, kneeL: 0.6, hipR: 0.85, kneeR: 1.45, armL: 1.75, elbL: 0.55, armR: 2.55, elbR: 0.2, bob: 2, lean: -0.04 }); // 23 climb 2
  return P;
})();

function drawHead(ctx, x, y, eyes) {
  // cabelo (atrás) + rabo de cavalo
  ctx.beginPath(); ctx.ellipse(x - 20, y + 6, 12, 22, 0.5, 0, Math.PI * 2); blob(ctx, "#4a2a18");
  ctx.beginPath(); ctx.arc(x - 2, y, 27, 0, Math.PI * 2); blob(ctx, "#4a2a18");
  ctx.beginPath(); ctx.arc(x + 3, y + 3, 23, 0, Math.PI * 2); blob(ctx, "#c98b5e");
  ctx.beginPath(); ctx.arc(x + 9, y + 9, 10, -0.2, 1.4); ctx.fillStyle = "#b47548"; ctx.fill(); // sombra
  if (eyes === "shut") { line(ctx, [[x + 8, y - 1], [x + 16, y + 1]], 2, OL); }
  else { ctx.beginPath(); ctx.ellipse(x + 13, y - 1, 3.5, 5, 0, 0, Math.PI * 2); ctx.fillStyle = OL; ctx.fill(); }
  ctx.beginPath(); ctx.arc(x + 14, y + 12, 6, 0.2, 1.5); ctx.strokeStyle = OL; ctx.lineWidth = 2.5; ctx.stroke();
  // chapéu de palha com faixa
  ctx.beginPath(); ctx.ellipse(x + 2, y - 18, 40, 9, -0.08, 0, Math.PI * 2); blob(ctx, "#e8c870");
  ctx.beginPath(); ctx.ellipse(x, y - 26, 22, 16, 0, Math.PI, 0); ctx.closePath(); blob(ctx, "#f0d488");
  ctx.fillStyle = "#c0392b"; ctx.fillRect(x - 21, y - 27, 42, 6);
}

function drawSofia(ctx, i) {
  const q = SOFIA_POSES[i];
  if (q.crawl !== undefined) {
    const hx = 62, hy = 196, sw = q.crawl ? 0.25 : 0;
    line(ctx, limb(hx, hy, 0.15 - sw, 44, -1.5, 42), 15, "#a8714a"); // perna de trás
    line(ctx, limb(hx + 8, hy, 0.2 + sw, 44, -1.45, 42), 16, "#c98b5e");
    const a = 1.3, sx = hx + Math.sin(a) * 70, sy = hy - Math.cos(a) * 70;
    line(ctx, limb(sx - 6, sy, -0.1 + sw, 34, 0.1, 30), 13, "#a8714a");
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(a);
    ctx.beginPath(); ctx.roundRect(-22, -74, 44, 76, 14); blob(ctx, "#4f9a5a");
    ctx.beginPath(); ctx.roundRect(-24, -16, 48, 30, 8); blob(ctx, "#b88a4f");
    ctx.restore();
    drawHead(ctx, sx + 26, sy - 8, "open");
    line(ctx, limb(sx, sy, 0.1 - sw, 34, -0.1, 30), 13, "#c98b5e");
    return;
  }
  const hipX = 92, hipY = q.hipY + q.bob;
  const shin = (a, k) => a - k;
  line(ctx, limb(hipX - 4, hipY, q.hipR, 46, shin(q.hipR, q.kneeR), 46), 15, "#a8714a");
  const backFoot = limb(hipX - 4, hipY, q.hipR, 46, shin(q.hipR, q.kneeR), 46)[2];
  ctx.beginPath(); ctx.ellipse(backFoot[0] + 6, backFoot[1] + 2, 13, 7, 0, 0, Math.PI * 2); blob(ctx, "#6b3f22");
  ctx.save(); ctx.translate(hipX, hipY); ctx.rotate(q.lean);
  line(ctx, limb(-4, -66, q.armR, 34, q.armR + q.elbR, 32), 12, "#a8714a");
  ctx.beginPath(); ctx.roundRect(-23, -74, 46, 78, 15); blob(ctx, "#4f9a5a");
  ctx.beginPath(); ctx.roundRect(-8, -74, 28, 70, 12); ctx.fillStyle = "#62b06c"; ctx.fill(); // luz
  ctx.beginPath(); ctx.roundRect(-25, -10, 50, 32, 8); blob(ctx, "#b88a4f");
  ctx.restore();
  const frontLeg = limb(hipX + 4, hipY, q.hipL, 46, shin(q.hipL, q.kneeL), 46);
  line(ctx, frontLeg, 16, "#c98b5e");
  ctx.beginPath(); ctx.ellipse(frontLeg[2][0] + 7, frontLeg[2][1] + 2, 14, 7, 0, 0, Math.PI * 2); blob(ctx, "#7b4a28");
  ctx.save(); ctx.translate(hipX, hipY); ctx.rotate(q.lean);
  drawHead(ctx, 4, -104, q.eyes);
  line(ctx, limb(4, -66, q.armL, 34, q.armL + q.elbL, 32), 13, "#c98b5e");
  ctx.restore();
}

/* ---------------- CARANGUEJO (provisório) ---------------- */
function drawCrab(ctx, i) {
  if (i === 8) { ctx.translate(0, 128); ctx.scale(1, -1); ctx.translate(0, 18); }
  const cx = 80, cy = i === 7 ? 84 : 78, raise = i === 4 || i === 5 || i === 6, step = i === 3 ? 1 : 0;
  for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 3; k++) {
    const bx = cx + s * (22 + k * 10), by = cy + 10, sw = ((k + step) % 2 ? 6 : -6);
    line(ctx, [[bx, by], [bx + s * 22, by + 8 + sw * 0.3], [bx + s * 30 + sw, 120]], 5, "#c8442e");
  }
  for (let s = -1; s <= 1; s += 2) {
    const up = raise ? (i === 5 ? 50 : 56) : 10, out = i === 6 ? 62 : 46;
    const ex = cx + s * out, ey = cy - up;
    line(ctx, [[cx + s * 34, cy - 4], [cx + s * (out - 6), cy - up * 0.5], [ex, ey]], 9, "#e0543a");
    ctx.beginPath(); ctx.ellipse(ex, ey - 8, 15, 12, s * 0.4, 0, Math.PI * 2); blob(ctx, "#ee6a4c");
    ctx.beginPath(); ctx.moveTo(ex + s * 2, ey - 10); ctx.lineTo(ex + s * 16, ey - 24 - (i === 5 ? 6 : 0)); ctx.strokeStyle = OL; ctx.lineWidth = 4; ctx.stroke();
  }
  ctx.beginPath(); ctx.ellipse(cx, cy, 46, i === 7 ? 22 : 27, 0, 0, Math.PI * 2); blob(ctx, "#e0543a");
  ctx.beginPath(); ctx.ellipse(cx - 6, cy - 9, 26, 10, 0, 0, Math.PI * 2); ctx.fillStyle = "#f2866a"; ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, cy + 14, 34, 9, 0, 0, Math.PI); ctx.fillStyle = "#b8392a"; ctx.fill();
  for (let s = -1; s <= 1; s += 2) {
    line(ctx, [[cx + s * 10, cy - 20], [cx + s * 13, cy - 38]], 4, "#c8442e");
    ctx.beginPath(); ctx.arc(cx + s * 13, cy - 42, 8, 0, Math.PI * 2); blob(ctx, "#fffaf0", OL, 3);
    if (i === 7 || i === 8) { line(ctx, [[cx + s * 13 - 4, cy - 46], [cx + s * 13 + 4, cy - 38]], 1.5, OL); line(ctx, [[cx + s * 13 + 4, cy - 46], [cx + s * 13 - 4, cy - 38]], 1.5, OL); }
    else { ctx.beginPath(); ctx.arc(cx + s * 13 + 2, cy - 41, raise ? 4.5 : 3.5, 0, Math.PI * 2); ctx.fillStyle = OL; ctx.fill(); }
  }
  ctx.beginPath(); if (raise) ctx.arc(cx, cy + 2, 7, Math.PI * 1.1, Math.PI * 1.9); else ctx.arc(cx, cy - 2, 7, 0.2, Math.PI - 0.2); ctx.strokeStyle = OL; ctx.lineWidth = 3; ctx.stroke();
}

/* ---------------- CHECKPOINT (provisório): estaca com fita ---------------- */
function drawCheckpoint(ctx, i) {
  ctx.beginPath(); ctx.roundRect(56, 40, 18, 184, 5); blob(ctx, "#8a5a2e");
  ctx.fillStyle = "#a8743e"; ctx.fillRect(60, 44, 5, 176);
  ctx.beginPath(); ctx.arc(65, 40, 16, 0, Math.PI * 2); blob(ctx, i ? "#bff7ff" : "#9aa7ad");
  if (i) { const g = ctx.createRadialGradient(65, 40, 4, 65, 40, 40); g.addColorStop(0, "rgba(140,240,255,.7)"); g.addColorStop(1, "rgba(140,240,255,0)"); ctx.fillStyle = g; ctx.fillRect(20, 0, 90, 90); }
  ctx.beginPath();
  if (!i) { ctx.moveTo(74, 62); ctx.quadraticCurveTo(86, 90, 78, 130); ctx.lineTo(70, 128); ctx.quadraticCurveTo(76, 92, 74, 76); }
  else { const w = i === 2 ? 8 : -8; ctx.moveTo(74, 60); ctx.quadraticCurveTo(100, 54 + w, 124, 66); ctx.lineTo(118, 80); ctx.lineTo(124, 94); ctx.quadraticCurveTo(100, 84 - w, 74, 90); }
  ctx.closePath(); blob(ctx, i ? "#2fb8c8" : "#6d7f88");
}

/* ---------------- TILES / PROPS DO SETOR A ---------------- */
function sandTile(ctx, w, h, top) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top ? "#f3dc9e" : "#e0bd7a"); g.addColorStop(1, top ? "#e2bf7c" : "#cfa566");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const r = rng(top ? 7 : 11);
  for (let k = 0; k < 40; k++) { ctx.fillStyle = r() < 0.5 ? "rgba(150,110,60,.35)" : "rgba(255,245,215,.5)"; ctx.fillRect(r() * w, (top ? 24 : 0) + r() * (h - (top ? 24 : 0)), 3, 2); }
  if (top) {
    ctx.beginPath(); ctx.moveTo(0, 14);
    for (let x = 0; x <= w; x += 8) ctx.lineTo(x, 12 + Math.sin((x / w) * Math.PI * 2) * 3);
    ctx.lineTo(w, 30); ctx.lineTo(0, 30); ctx.closePath(); ctx.fillStyle = "#fbecc4"; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 12); for (let x = 0; x <= w; x += 8) ctx.lineTo(x, 12 + Math.sin((x / w) * Math.PI * 2) * 3);
    ctx.strokeStyle = OL; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = "rgba(0,0,0,0)"; ctx.clearRect(0, 0, w, 9);
  }
}
function rockTile(ctx, w, h, top) {
  ctx.fillStyle = top ? "#8d857a" : "#6f675e"; ctx.fillRect(0, 0, w, h);
  const r = rng(top ? 3 : 5);
  for (let k = 0; k < 4; k++) { const x = r() * w, y = (top ? 30 : 0) + r() * (h - 30); ctx.beginPath(); ctx.ellipse(x, y, 22 + r() * 18, 12 + r() * 10, r(), 0, Math.PI * 2); ctx.fillStyle = top ? "#a39b8e" : "#81786d"; ctx.fill(); ctx.strokeStyle = "rgba(42,26,16,.45)"; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.strokeStyle = "rgba(42,26,16,.5)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(r() * w, h); ctx.lineTo(r() * w, h * 0.5); ctx.lineTo(r() * w, top ? 30 : 0); ctx.stroke();
  if (top) {
    ctx.clearRect(0, 0, w, 8);
    ctx.fillStyle = "#b9b0a2"; ctx.fillRect(0, 10, w, 16);
    ctx.fillStyle = "#6fae4c"; for (let x = 0; x < w; x += 16) { ctx.beginPath(); ctx.ellipse(x + 8, 12, 10, 6, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = OL; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(w, 8); ctx.stroke();
  }
}
function logTile(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 6, 0, h - 6); g.addColorStop(0, "#b07a45"); g.addColorStop(0.45, "#8a5a30"); g.addColorStop(1, "#5e3a1c");
  ctx.fillStyle = g; ctx.fillRect(0, 6, w, h - 14);
  ctx.strokeStyle = "rgba(42,26,16,.55)"; ctx.lineWidth = 3;
  for (let y = 20; y < h - 12; y += 12) { ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(w * 0.3, y + 4, w * 0.6, y - 4, w, y); ctx.stroke(); }
  ctx.fillStyle = "#d4a066"; ctx.fillRect(0, 8, w, 5);
  ctx.strokeStyle = OL; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(w, 6); ctx.moveTo(0, h - 8); ctx.lineTo(w, h - 8); ctx.stroke();
}
function ledgeTile(ctx, w, h) {
  ctx.fillStyle = "#8d857a"; ctx.fillRect(0, 6, w, h - 16);
  ctx.fillStyle = "#b9b0a2"; ctx.fillRect(0, 8, w, 12);
  ctx.fillStyle = "#6fae4c"; for (let x = 0; x < w; x += 18) { ctx.beginPath(); ctx.ellipse(x + 9, 9, 10, 5, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = OL; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(w, 6); ctx.moveTo(0, h - 10); ctx.lineTo(w, h - 10); ctx.stroke();
  ctx.strokeStyle = "rgba(42,26,16,.45)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * 0.4, 22); ctx.lineTo(w * 0.5, h - 12); ctx.stroke();
}
function palm(ctx, w, h, lean = 0.12, dark = false) {
  const bx = w * 0.45, by = h, tx = bx + w * lean * 2.2, ty = h * 0.2;
  ctx.lineCap = "round";
  ctx.strokeStyle = OL; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + 10, h * 0.55, tx, ty); ctx.stroke();
  ctx.strokeStyle = dark ? "#6d5a44" : "#9a7650"; ctx.lineWidth = 26; ctx.stroke();
  ctx.strokeStyle = dark ? "#5a4936" : "#7d5c3b"; ctx.lineWidth = 4;
  for (let k = 0; k < 14; k++) { const t = k / 14, x = (1 - t) * (1 - t) * bx + 2 * (1 - t) * t * (bx + 10) + t * t * tx, y = (1 - t) * (1 - t) * by + 2 * (1 - t) * t * h * 0.55 + t * t * ty; ctx.beginPath(); ctx.moveTo(x - 11, y); ctx.lineTo(x + 11, y - 4); ctx.stroke(); }
  const fronds = [-2.7, -2.1, -1.5, -0.9, -0.35, 0.3, 2.9];
  for (const a of fronds) {
    const L = w * 0.42, ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * 0.55 + L * 0.35;
    ctx.beginPath(); ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(a) * L * 0.5, ty + Math.sin(a) * L * 0.6 - 40, ex, ey);
    ctx.quadraticCurveTo(tx + Math.cos(a) * L * 0.45, ty + Math.sin(a) * L * 0.3 - 6, tx, ty + 8);
    blob(ctx, dark ? "#2f6b48" : "#3f9a4a", OL, 4);
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * L * 0.5, ty + Math.sin(a) * L * 0.6 - 34, ex, ey); ctx.strokeStyle = dark ? "#4a8a5e" : "#6cc061"; ctx.lineWidth = 3; ctx.stroke();
  }
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(tx - 10 + k * 12, ty + 14 + (k % 2) * 6, 9, 0, Math.PI * 2); blob(ctx, "#6b4a22", OL, 3); }
}
function bush(ctx, w, h, c1 = "#3f9a4a", c2 = "#6cc061") {
  const r = rng(w + h);
  for (let k = 0; k < 7; k++) { const x = w * 0.15 + r() * w * 0.7, y = h * 0.45 + r() * h * 0.35, rr = h * (0.22 + r() * 0.16); ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); blob(ctx, c1); }
  for (let k = 0; k < 5; k++) { const x = w * 0.2 + r() * w * 0.6, y = h * 0.4 + r() * h * 0.2; ctx.beginPath(); ctx.arc(x, y, h * 0.1, 0, Math.PI * 2); ctx.fillStyle = c2; ctx.fill(); }
}

/* ---------------- CAMADAS DE PARALLAX ---------------- */
function skyLayer(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#3d9fdc"); g.addColorStop(0.45, "#86cbee"); g.addColorStop(0.66, "#cdeef6"); g.addColorStop(0.72, "#fbeccc"); g.addColorStop(1, "#fbeccc");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const r = rng(21);
  for (let c = 0; c < 3; c++) { const cx = r() * w, cy = 120 + r() * 300; for (let k = 0; k < 6; k++) { for (const dx of [0, -w, w]) { ctx.beginPath(); ctx.arc(cx + dx + (k - 3) * 30, cy + Math.sin(k) * 10, 26 + (k % 3) * 10, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fill(); } } }
}
function islandsLayer(ctx, w, h) {
  const isle = (x, wid, hei, col, top) => {
    ctx.beginPath(); ctx.moveTo(x - wid / 2, h);
    ctx.bezierCurveTo(x - wid * 0.35, h - hei * 0.9, x - wid * 0.1, h - hei, x, h - hei);
    ctx.bezierCurveTo(x + wid * 0.2, h - hei, x + wid * 0.35, h - hei * 0.6, x + wid / 2, h);
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); ctx.ellipse(x - wid * 0.05, h - hei * 0.82, wid * 0.22, hei * 0.12, 0, 0, Math.PI * 2); ctx.fillStyle = top; ctx.fill();
  };
  isle(320, 520, 170, "#7fb0ad", "#93c2b8");
  isle(1180, 760, 250, "#6fa39f", "#86b8ae");
  isle(1820, 360, 110, "#8cbab5", "#a2cbc3");
  ctx.fillStyle = "rgba(205,238,246,.35)"; ctx.fillRect(0, h - 26, w, 26); // névoa do horizonte
}
function oceanLayer(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#a9e0ec"); g.addColorStop(0.08, "#62bfdc"); g.addColorStop(0.4, "#2f9cc9"); g.addColorStop(1, "#16699a");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const r = rng(33);
  for (let k = 0; k < 70; k++) {
    const y = 6 + Math.pow(r(), 1.6) * h * 0.9, x = r() * w, len = 20 + (y / h) * 90;
    for (const dx of [0, -w, w]) { ctx.beginPath(); ctx.ellipse(x + dx, y, len, 1.5 + (y / h) * 3, 0, 0, Math.PI * 2); ctx.fillStyle = `rgba(220,248,255,${0.5 - (y / h) * 0.3})`; ctx.fill(); }
  }
  ctx.fillStyle = "#e8fbff"; ctx.fillRect(0, 0, w, 3);
}
function treesLayer(ctx, w, h) {
  const r = rng(44);
  ctx.save(); ctx.translate(0, 0);
  // touceiras de mata atrás da praia (deixam o mar aparecer entre elas)
  for (const [x, sc] of [[150, 1], [420, 0.8], [980, 1.15], [1250, 0.85], [1700, 1]]) {
    for (const dx of [0, -w, w]) {
      ctx.save(); ctx.translate(x + dx - 180 * sc, h - 620 * sc); ctx.scale(sc, sc); palm(ctx, 360, 620, 0.06 + r() * 0.1, true); ctx.restore();
    }
  }
  for (const [x, wid] of [[300, 520], [1100, 640], [1750, 420]]) for (const dx of [0, -w, w]) { ctx.save(); ctx.translate(x + dx - wid / 2, h - 210); bush(ctx, wid, 200, "#2f6b48", "#4a8a5e"); ctx.restore(); }
  ctx.restore();
}
function foliageLayer(ctx, w, h) {
  for (const [x, wid] of [[120, 360], [640, 260]]) for (const dx of [0, -w, w]) {
    ctx.save(); ctx.translate(x + dx, h - 40);
    for (let k = -6; k <= 6; k++) { const a = k * 0.17 - Math.PI / 2, L = wid * (0.45 + (6 - Math.abs(k)) * 0.06); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(Math.cos(a) * L * 0.6 + k * 6, Math.sin(a) * L * 0.6, Math.cos(a) * L, Math.sin(a) * L * 0.9); ctx.quadraticCurveTo(Math.cos(a) * L * 0.4, Math.sin(a) * L * 0.4 + 10, 10, 0); blob(ctx, k % 2 ? "#245a36" : "#2f7040", OL, 3); }
    ctx.restore();
  }
}
function leavesLayer(ctx, w, h) {
  if ("filter" in ctx) ctx.filter = "blur(7px)";
  const leaf = (x, y, a, L, col) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L * 0.5, -L * 0.28, L, 0); ctx.quadraticCurveTo(L * 0.5, L * 0.28, 0, 0); ctx.fillStyle = col; ctx.fill(); ctx.restore(); };
  for (let k = 0; k < 6; k++) leaf(120 + k * 22, -20, 0.6 + k * 0.28, 260 + (k % 3) * 40, k % 2 ? "rgba(24,70,40,.9)" : "rgba(34,92,52,.9)");
  for (let k = 0; k < 4; k++) leaf(700, h + 30, -1.2 - k * 0.25, 300, k % 2 ? "rgba(24,70,40,.85)" : "rgba(30,84,46,.85)");
  if ("filter" in ctx) ctx.filter = "none";
}

/* ---------------- EFEITOS ---------------- */
function sparkTex(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.3, "rgba(220,250,255,.6)"); g.addColorStop(1, "rgba(220,250,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2 + 2, h / 2 - 2); ctx.lineTo(w, h / 2); ctx.lineTo(w / 2 + 2, h / 2 + 2); ctx.lineTo(w / 2, h); ctx.lineTo(w / 2 - 2, h / 2 + 2); ctx.lineTo(0, h / 2); ctx.lineTo(w / 2 - 2, h / 2 - 2); ctx.closePath(); ctx.fill();
}
function softDot(ctx, w, h, col) { const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, col); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
function crestTex(ctx, w, h) {
  const P = 128, top = (x) => 30 + Math.sin((x / P) * Math.PI * 2) * 9 + Math.sin((x / P) * Math.PI * 4 + 1) * 3;
  ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w; x += 4) ctx.lineTo(x, top(x)); ctx.lineTo(w, h); ctx.closePath();
  const g = ctx.createLinearGradient(0, 20, 0, h); g.addColorStop(0, "rgba(120,215,235,.95)"); g.addColorStop(1, "rgba(40,150,200,0)"); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); for (let x = 0; x <= w; x += 4) ctx.lineTo(x, top(x)); ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 7; ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 0; x <= w; x += 4) ctx.lineTo(x, top(x) + 11); ctx.stroke();
  const r = rng(5); for (let k = 0; k < 40; k++) { const x = r() * w; ctx.beginPath(); ctx.arc(x, top(x) - 4 - r() * 8, 1.5 + r() * 2, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fill(); }
}
function barkWave(ctx, w, h) {
  for (let k = 0; k < 3; k++) {
    ctx.beginPath(); ctx.arc(-h * 0.25 + k * 40, h / 2, h * 0.5 - 20 - k * 30, -1.15, 1.15);
    ctx.strokeStyle = `rgba(160,235,255,${0.95 - k * 0.25})`; ctx.lineWidth = 22 - k * 5; ctx.lineCap = "round"; ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 5 - k; ctx.stroke();
  }
}
function alertTex(ctx, w, h) {
  ctx.beginPath(); ctx.ellipse(w / 2, h / 2 - 4, w / 2 - 3, h / 2 - 8, 0, 0, Math.PI * 2); blob(ctx, "#fff6d8", OL, 3);
  ctx.fillStyle = "#e0543a"; ctx.beginPath(); ctx.roundRect(w / 2 - 4, 12, 8, 24, 4); ctx.fill(); ctx.beginPath(); ctx.arc(w / 2, 44, 4.5, 0, Math.PI * 2); ctx.fill();
}

function wetRockTile(ctx, w, h, top) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top ? "#6d7880" : "#535d66"); g.addColorStop(1, top ? "#4d565e" : "#3f4850");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const r = rng(top ? 13 : 17);
  for (let k = 0; k < 5; k++) {
    const x = r() * w, y = (top ? 28 : 0) + r() * (h - 28);
    ctx.beginPath(); ctx.ellipse(x, y, 22 + r() * 18, 12 + r() * 10, r(), 0, Math.PI * 2);
    ctx.fillStyle = top ? "#7e8a92" : "#616c75"; ctx.fill();
    ctx.strokeStyle = "rgba(24,32,40,.5)"; ctx.lineWidth = 3; ctx.stroke();
  }
  // brilho molhado vertical
  ctx.fillStyle = "rgba(190,235,250,.18)";
  ctx.fillRect(w * 0.22, top ? 18 : 0, 10, h); ctx.fillRect(w * 0.68, top ? 22 : 0, 7, h * 0.8);
  if (top) {
    ctx.clearRect(0, 0, w, 8);
    ctx.fillStyle = "#95a3ab"; ctx.fillRect(0, 9, w, 14);
    ctx.fillStyle = "rgba(220,248,255,.55)"; ctx.fillRect(0, 9, w, 4); // película d'água
    ctx.fillStyle = "#4e9452";
    for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.ellipse(x + 10, 13, 11, 5, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = OL; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(w, 8); ctx.stroke();
  }
}
function wetLedgeTile(ctx, w, h) {
  ctx.fillStyle = "#5f6a73"; ctx.fillRect(0, 6, w, h - 16);
  ctx.fillStyle = "#88969e"; ctx.fillRect(0, 8, w, 12);
  ctx.fillStyle = "rgba(220,250,255,.55)"; ctx.fillRect(0, 8, w, 4);
  ctx.fillStyle = "#4e9452"; for (let x = 0; x < w; x += 22) { ctx.beginPath(); ctx.ellipse(x + 10, 10, 9, 4.5, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = OL; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(w, 6); ctx.moveTo(0, h - 10); ctx.lineTo(w, h - 10); ctx.stroke();
}
function crumbleTile(ctx, w, h) {
  ctx.fillStyle = "#7a6855"; ctx.fillRect(0, 6, w, h - 18);
  ctx.fillStyle = "#a38d74"; ctx.fillRect(0, 8, w, 11);
  // rachaduras bem visíveis + pedrinhas soltas embaixo
  ctx.strokeStyle = OL; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(w, 6); ctx.moveTo(0, h - 12); ctx.lineTo(w, h - 12); ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.28, 7); ctx.lineTo(w * 0.22, 26); ctx.lineTo(w * 0.34, h - 12);
  ctx.moveTo(w * 0.68, 7); ctx.lineTo(w * 0.74, 24); ctx.lineTo(w * 0.62, h - 12);
  ctx.moveTo(w * 0.22, 26); ctx.lineTo(w * 0.5, 29);
  ctx.stroke();
  for (const [px, py, r] of [[24, h - 6, 5], [64, h - 5, 6], [102, h - 6, 4.5]]) {
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); blob(ctx, "#7a6855", OL, 2.5);
  }
}
function cliffsLayer(ctx, w, h) {
  // paredões e pontas rochosas do costão atrás da área jogável, deixando o mar aparecer nos vãos
  const cliff = (x, wid, hei, col, hi) => {
    for (const dx of [0, -w, w]) {
      const cx = x + dx;
      ctx.beginPath(); ctx.moveTo(cx - wid / 2, h);
      ctx.lineTo(cx - wid * 0.38, h - hei * 0.72);
      ctx.lineTo(cx - wid * 0.14, h - hei);
      ctx.lineTo(cx + wid * 0.18, h - hei * 0.92);
      ctx.lineTo(cx + wid * 0.36, h - hei * 0.55);
      ctx.lineTo(cx + wid / 2, h);
      ctx.closePath(); blob(ctx, col, OL, 4);
      ctx.beginPath();
      ctx.moveTo(cx - wid * 0.34, h - hei * 0.7);
      ctx.lineTo(cx - wid * 0.14, h - hei + 6);
      ctx.lineTo(cx + wid * 0.14, h - hei * 0.9);
      ctx.lineTo(cx - wid * 0.06, h - hei * 0.45);
      ctx.closePath(); ctx.fillStyle = hi; ctx.fill();
      // vegetação no topo do penhasco
      ctx.save(); ctx.translate(cx - wid * 0.22, h - hei - 36); bush(ctx, wid * 0.44, 70, "#2f6b48", "#539a62"); ctx.restore();
    }
  };
  cliff(280, 560, 470, "#56636c", "#74838d");
  cliff(1080, 680, 560, "#4c5861", "#687782");
  cliff(1740, 480, 410, "#5b6872", "#798892");
}
function rocksFgLayer(ctx, w, h) {
  for (const [x, wid, hei] of [[160, 260, 150], [720, 220, 125]]) {
    for (const dx of [0, -w, w]) {
      const cx = x + dx;
      ctx.beginPath();
      ctx.moveTo(cx - wid / 2, h);
      ctx.quadraticCurveTo(cx - wid * 0.3, h - hei, cx, h - hei);
      ctx.quadraticCurveTo(cx + wid * 0.35, h - hei * 0.9, cx + wid / 2, h);
      ctx.closePath(); blob(ctx, "#2c3840", OL, 4);
    }
  }
}

/* ---------------- MACACO (provisório): 15 quadros (0..14) ---------------- */
function drawMonkey(ctx, i) {
  // 0-1 idle · 2-3 watch · 4-5 pick · 6-7 aim (braço erguido c/ pedra) · 8 throw · 9-10 laugh · 11 hurt · 12-13 stun · 14 defeat
  if (i === 14) { ctx.translate(0, 160); ctx.scale(1, -1); ctx.translate(0, 16); }
  const pick = i === 4 || i === 5, aim = i === 6 || i === 7, thr = i === 8, laugh = i === 9 || i === 10, hurt = i === 11, stun = i === 12 || i === 13;
  const watch = i === 2 || i === 3;
  const bob = (i % 2 === 1 ? -3 : 0) + (laugh ? (i === 9 ? -8 : 2) : 0) + (pick ? 14 : 0);
  const cx = 80 + (watch ? 5 : hurt ? -8 : 0), cy = 104 + bob;
  // cauda enrolada
  ctx.beginPath();
  ctx.moveTo(cx - 18, cy + 12);
  ctx.bezierCurveTo(cx - 56, cy + 4, cx - 64, cy - 36 + (i % 2) * 8, cx - 38, cy - 46);
  ctx.arc(cx - 36, cy - 38, 8, -Math.PI * 0.5, Math.PI * 0.8);
  ctx.strokeStyle = OL; ctx.lineWidth = 13; ctx.lineCap = "round"; ctx.stroke();
  ctx.strokeStyle = "#7a4928"; ctx.lineWidth = 7; ctx.stroke();
  // pernas
  for (const s of [-1, 1]) {
    const lx = cx + s * 14, ly = 144;
    line(ctx, [[cx + s * 10, cy + 12], [lx + s * 8, cy + 26], [lx, ly]], 10, "#7a4928");
    ctx.beginPath(); ctx.ellipse(lx + 4, ly + 2, 11, 5, 0, 0, Math.PI * 2); blob(ctx, "#d8a074", OL, 3);
  }
  // braço esquerdo (atrás)
  const laX = watch ? cx + 22 : laugh ? cx - 28 : cx - 26, laY = watch ? cy - 46 : laugh ? cy - 28 : pick ? cy + 32 : cy + 4;
  line(ctx, [[cx - 12, cy - 12], [laX, laY]], 10, "#683c1f");
  // tronco e barriga clara
  ctx.beginPath(); ctx.ellipse(cx, cy, 24, 30, pick ? 0.25 : hurt ? -0.25 : 0, 0, Math.PI * 2); blob(ctx, "#8a532d", OL, 4);
  ctx.beginPath(); ctx.ellipse(cx + 4, cy + 3, 15, 21, 0, 0, Math.PI * 2); ctx.fillStyle = "#dfb086"; ctx.fill();
  // cabeça e orelhas
  const hx = cx + (pick ? 10 : watch ? 6 : 2), hy = cy - 42 + (pick ? 8 : 0);
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.arc(hx + s * 22, hy + 2, 10, 0, Math.PI * 2); blob(ctx, "#7a4928", OL, 3.5);
    ctx.beginPath(); ctx.arc(hx + s * 22, hy + 2, 5.5, 0, Math.PI * 2); ctx.fillStyle = "#dfb086"; ctx.fill();
  }
  ctx.beginPath(); ctx.arc(hx, hy, 22, 0, Math.PI * 2); blob(ctx, "#8a532d", OL, 4);
  // topete
  ctx.beginPath(); ctx.moveTo(hx - 6, hy - 20); ctx.lineTo(hx + 2, hy - 31); ctx.lineTo(hx + 10, hy - 20); ctx.closePath(); blob(ctx, "#7a4928", OL, 3);
  // rosto claro
  ctx.beginPath(); ctx.ellipse(hx + 4, hy + 5, 16, 13, 0, 0, Math.PI * 2); ctx.fillStyle = "#e6ba90"; ctx.fill();
  ctx.beginPath(); ctx.arc(hx - 3, hy - 2, 8, 0, Math.PI * 2); ctx.arc(hx + 9, hy - 2, 8, 0, Math.PI * 2); ctx.fillStyle = "#e6ba90"; ctx.fill();
  // olhos e boca
  if (hurt || stun || i === 14) {
    for (const ox of [hx - 3, hx + 10]) { line(ctx, [[ox - 3, hy - 5], [ox + 3, hy + 1]], 1.8, OL); line(ctx, [[ox + 3, hy - 5], [ox - 3, hy + 1]], 1.8, OL); }
  } else {
    for (const ox of [hx - 3, hx + 10]) { ctx.beginPath(); ctx.arc(ox + 1, hy - 2, 3.2, 0, Math.PI * 2); ctx.fillStyle = OL; ctx.fill(); }
  }
  ctx.beginPath();
  if (laugh) { ctx.arc(hx + 4, hy + 6, 8, 0, Math.PI); ctx.fillStyle = "#b8392a"; ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 2.5; ctx.stroke(); }
  else if (hurt || stun) { ctx.arc(hx + 4, hy + 10, 5, 0, Math.PI * 2); ctx.strokeStyle = OL; ctx.lineWidth = 2.5; ctx.stroke(); }
  else { ctx.arc(hx + 4, hy + 6, 6, 0.15, Math.PI - 0.15); ctx.strokeStyle = OL; ctx.lineWidth = 2.5; ctx.stroke(); }
  // braço direito (ação: pegar pedra, levantar bem alto p/ mirar, arremessar)
  let rx = cx + 22, ry = cy + 6;
  if (pick) { rx = cx + 26; ry = 138; }
  else if (aim) { rx = cx - 8 + (i === 7 ? -6 : 0); ry = hy - 34 + (i === 7 ? -4 : 0); }
  else if (thr) { rx = cx + 44; ry = cy - 18; }
  else if (laugh) { rx = cx + 28; ry = cy - 26 + (i === 10 ? -8 : 0); }
  line(ctx, [[cx + 10, cy - 12], [(cx + 10 + rx) / 2 + (aim ? -10 : 8), (cy - 12 + ry) / 2], [rx, ry]], 10, "#8a532d");
  // pedra na mão durante pick (5) e aim (6-7) — aviso claro!
  if (i === 5 || aim) {
    ctx.beginPath(); ctx.arc(rx, ry - 6, 13, 0, Math.PI * 2); blob(ctx, "#7d756c", OL, 3.5);
    ctx.beginPath(); ctx.arc(rx - 3, ry - 9, 5, 0, Math.PI * 2); ctx.fillStyle = "#a89f94"; ctx.fill();
    if (aim) {
      ctx.strokeStyle = "#ffe08a"; ctx.lineWidth = 3;
      for (let a = 0; a < 4; a++) {
        const ang = -Math.PI * 0.85 + a * 0.55;
        ctx.beginPath(); ctx.moveTo(rx + Math.cos(ang) * 17, ry - 6 + Math.sin(ang) * 17);
        ctx.lineTo(rx + Math.cos(ang) * 24, ry - 6 + Math.sin(ang) * 24); ctx.stroke();
      }
    }
  }
  // estrelinhas de atordoado (stun: 12-13)
  if (stun) {
    const off = i === 13 ? 0.5 : 0;
    for (let k = 0; k < 3; k++) {
      const a = off + (k * Math.PI * 2) / 3, sx = hx + Math.cos(a) * 26, sy = hy - 28 + Math.sin(a) * 7;
      ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); blob(ctx, "#ffe08a", OL, 2);
    }
  }
}

function forestGrassTile(ctx, w, h, top) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top ? "#6d4c32" : "#593c26"); g.addColorStop(1, top ? "#543822" : "#442c1b");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const r = rng(top ? 31 : 37);
  for (let k = 0; k < 30; k++) {
    ctx.fillStyle = r() < 0.5 ? "rgba(35,20,10,.35)" : "rgba(145,105,68,.3)";
    ctx.fillRect(r() * w, (top ? 26 : 0) + r() * (h - 26), 5, 3);
  }
  if (top) {
    ctx.clearRect(0, 0, w, 9);
    ctx.fillStyle = "#3f8c45"; ctx.fillRect(0, 10, w, 18);
    ctx.fillStyle = "#62b558"; ctx.fillRect(0, 10, w, 8);
    for (let x = 0; x < w; x += 16) {
      ctx.beginPath(); ctx.arc(x + 8, 26, 8, 0, Math.PI); ctx.fillStyle = "#3f8c45"; ctx.fill();
    }
    ctx.strokeStyle = OL; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(w, 10); ctx.stroke();
  }
}
function branchTile(ctx, w, h) {
  logTile(ctx, w, h);
  // musgo e folhinhas no galho da floresta
  ctx.fillStyle = "#4d9e4a";
  for (let x = 14; x < w - 10; x += 32) {
    ctx.beginPath(); ctx.ellipse(x, 8, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
  }
}
function forestTree(ctx, w, h) {
  const cx = w / 2;
  // tronco largo com raízes
  ctx.beginPath();
  ctx.moveTo(cx - 56, h); ctx.quadraticCurveTo(cx - 32, h * 0.7, cx - 28, h * 0.28);
  ctx.lineTo(cx + 28, h * 0.28); ctx.quadraticCurveTo(cx + 32, h * 0.7, cx + 56, h);
  ctx.closePath(); blob(ctx, "#6e472b", OL, 4);
  ctx.fillStyle = "#875a38"; ctx.fillRect(cx - 10, h * 0.3, 14, h * 0.66);
  // copa frondosa em camadas
  for (const [dx, dy, rx, ry, col] of [[-70, 210, 110, 75, "#265c37"], [75, 215, 105, 72, "#265c37"], [0, 155, 135, 92, "#317544"], [-45, 135, 85, 58, "#469652"], [50, 145, 80, 54, "#469652"], [0, 105, 95, 62, "#5cb062"]]) {
    ctx.beginPath(); ctx.ellipse(cx + dx, dy, rx, ry, 0, 0, Math.PI * 2); blob(ctx, col, OL, 4);
  }
}
function forestLayer(ctx, w, h) {
  // árvores altas de mata costeira com feixes suaves de luz solar e cipós
  for (const [x, sc] of [[180, 0.95], [520, 1.08], [940, 0.92], [1340, 1.12], [1760, 0.98]]) {
    for (const dx of [0, -w, w]) {
      ctx.save(); ctx.translate(x + dx - 210 * sc, h - 720 * sc); ctx.scale(sc, sc);
      forestTree(ctx, 420, 720);
      ctx.restore();
    }
  }
  for (const [x, wid] of [[340, 560], [1140, 680], [1820, 480]]) {
    for (const dx of [0, -w, w]) {
      ctx.save(); ctx.translate(x + dx - wid / 2, h - 200); bush(ctx, wid, 195, "#255836", "#3f7d4e"); ctx.restore();
    }
  }
}

/* ---------------- SEU TONINHO (usa o sheet oficial da Fase 1 + rolo de corda náutica) ---------------- */
function drawToninho(ctx, i, fw, fh, scene) {
  // i: 0-1 idle, 2-3 wave, 4-5 throwRope, 6-7 thumbsUp
  const srcFrames = [0, 1, 40, 41, 32, 33, 40, 1];
  const sf = srcFrames[i] ?? 0;
  if (scene?.textures?.exists("toninho")) {
    const img = scene.textures.get("toninho").getSourceImage();
    if (img) {
      const sx = (sf % 8) * 192, sy = Math.floor(sf / 8) * 256;
      ctx.drawImage(img, sx, sy, 192, 256, 0, 0, fw, fh);
    }
  } else {
    // fallback Canvas 2D caso a textura "toninho" não esteja carregada
    ctx.beginPath(); ctx.roundRect(72, 118, 48, 86, 14); blob(ctx, "#3b6e8c");
    ctx.beginPath(); ctx.arc(96, 88, 24, 0, Math.PI * 2); blob(ctx, "#d89c6c");
    ctx.beginPath(); ctx.ellipse(96, 98, 22, 16, 0, 0, Math.PI); blob(ctx, "#e6e2da");
    ctx.beginPath(); ctx.ellipse(96, 68, 34, 10, 0, 0, Math.PI * 2); blob(ctx, "#e8b93c");
  }
  // rolo de corda náutica na mão / cintura nos estados idle, wave e throwRope
  if (i <= 5) {
    const rx = i >= 4 ? 128 : 118, ry = i >= 4 ? 174 : 158;
    for (let r = 18; r >= 10; r -= 4) {
      ctx.beginPath(); ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.strokeStyle = OL; ctx.lineWidth = 6; ctx.stroke();
      ctx.strokeStyle = r === 14 ? "#e4be78" : "#c89d54"; ctx.lineWidth = 3.5; ctx.stroke();
    }
  }
  // joinha / sinal de positivo brilhante nos quadros 6-7 (thumbsUp)
  if (i === 6 || i === 7) {
    const bx = 136, by = i === 6 ? 94 : 90;
    ctx.beginPath(); ctx.arc(bx, by, 18, 0, Math.PI * 2); blob(ctx, "#fff3a0", OL, 3.5);
    ctx.beginPath(); ctx.roundRect(bx - 6, by - 2, 14, 11, 3); blob(ctx, "#d89c6c", OL, 2.5);
    ctx.beginPath(); ctx.roundRect(bx - 4, by - 12, 7, 12, 3); blob(ctx, "#d89c6c", OL, 2.5);
  }
}

/** Desenha o provisório de uma camada/tile/prop/efeito pelo "kind". */
export const PLACEHOLDER = {
  layer: { 0: skyLayer, 1: islandsLayer, 2: oceanLayer, 3: treesLayer, 5: foliageLayer, 6: leavesLayer, B3: cliffsLayer, B5: rocksFgLayer, C3: forestLayer, C5: foliageLayer },
  tile: {
    sand_top: (c, w, h) => sandTile(c, w, h, true), sand_fill: (c, w, h) => sandTile(c, w, h, false),
    rock_top: (c, w, h) => rockTile(c, w, h, true), rock_fill: (c, w, h) => rockTile(c, w, h, false),
    B_rock_top: (c, w, h) => wetRockTile(c, w, h, true), B_rock_fill: (c, w, h) => wetRockTile(c, w, h, false),
    B_ledge: wetLedgeTile,
    C_sand_top: (c, w, h) => forestGrassTile(c, w, h, true), C_sand_fill: (c, w, h) => forestGrassTile(c, w, h, false),
    C_log: branchTile,
    D_sand_top: (c, w, h) => forestGrassTile(c, w, h, true), D_sand_fill: (c, w, h) => forestGrassTile(c, w, h, false),
    D_log: branchTile,
    log: logTile, ledge: ledgeTile, crumble: crumbleTile,
  },
  prop: {
    palm: (c, w, h) => palm(c, w, h, 0.12), bush: (c, w, h) => bush(c, w, h),
    tree: forestTree,
    fern: (c, w, h) => { c.save(); c.translate(w / 2, h - 8); for (let k = -4; k <= 4; k++) { const a = k * 0.22 - Math.PI / 2, L = h * (0.78 - Math.abs(k) * 0.06); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(Math.cos(a) * L * 0.55, Math.sin(a) * L * 0.55, Math.cos(a) * L, Math.sin(a) * L); c.quadraticCurveTo(Math.cos(a) * L * 0.35, Math.sin(a) * L * 0.35 + 10, 6, 0); blob(c, k % 2 ? "#2f7d40" : "#4ca356", OL, 3); } c.restore(); },
    roots: (c, w, h) => { c.lineCap = "round"; for (const [x0, x1, y1] of [[w * 0.3, 18, h - 10], [w * 0.5, w * 0.48, h - 8], [w * 0.7, w - 20, h - 10]]) { line(c, [[x0, 16], [(x0 + x1) / 2, h * 0.58], [x1, y1]], 14, "#6e472b"); } },
    driftwood: (c, w, h) => { c.save(); c.translate(10, 30); c.rotate(0.05); logTile(c, w - 20, 64); c.restore(); },
    boulder: (c, w, h) => {
      c.beginPath(); c.moveTo(18, h - 6); c.quadraticCurveTo(28, 22, w * 0.48, 16); c.quadraticCurveTo(w - 22, 20, w - 16, h - 6); c.closePath();
      blob(c, "#637079", OL, 4);
      c.beginPath(); c.ellipse(w * 0.42, 48, w * 0.24, 22, -0.1, 0, Math.PI * 2); c.fillStyle = "#84939d"; c.fill();
      c.fillStyle = "rgba(210,245,255,.45)"; c.fillRect(w * 0.32, 26, 8, h - 42);
    },
    moss_rock: (c, w, h) => {
      c.beginPath(); c.ellipse(w / 2, h - 28, w * 0.44, 34, 0, Math.PI, 0); c.lineTo(w * 0.94, h - 8); c.lineTo(w * 0.06, h - 8); c.closePath();
      blob(c, "#5c6870", OL, 4);
      c.fillStyle = "#529b56"; for (let x = 28; x < w - 28; x += 22) { c.beginPath(); c.ellipse(x, h - 54, 14, 7, 0, 0, Math.PI * 2); c.fill(); }
    },
    starfish: (c, w, h) => { c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 11 : 28; c.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } c.closePath(); blob(c, "#f08a4b", OL, 3); },
    pebbles: (c, w, h) => { const r = rng(9); for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(20 + r() * (w - 40), h - 18 - r() * 16, 14 + r() * 14, 9 + r() * 7, 0, 0, Math.PI * 2); blob(c, k % 2 ? "#a39b8e" : "#8d857a", OL, 3); } },
    sign_end: (c, w, h) => { c.beginPath(); c.roundRect(w / 2 - 9, 70, 18, h - 70, 4); blob(c, "#8a5a2e"); c.beginPath(); c.moveTo(20, 30); c.lineTo(w - 50, 30); c.lineTo(w - 10, 70); c.lineTo(w - 50, 110); c.lineTo(20, 110); c.closePath(); blob(c, "#c08a52"); c.fillStyle = "#a8743e"; c.fillRect(30, 60, w - 90, 6); c.fillRect(30, 82, w - 100, 6); },
  },
  image: {
    f3_onda_latido: barkWave, f3_brilho: sparkTex, f3_espuma: (c, w, h) => softDot(c, w, h, "rgba(255,255,255,.95)"),
    f3_poeira: (c, w, h) => softDot(c, w, h, "rgba(250,236,200,.9)"), f3_crista_onda: crestTex, f3_alerta: alertTex,
    f3_concha_projetil: (c, w, h) => { c.beginPath(); c.moveTo(w / 2, 8); c.bezierCurveTo(w - 4, 14, w - 6, h - 12, w / 2, h - 6); c.bezierCurveTo(6, h - 12, 4, 14, w / 2, 8); blob(c, "#f6d9b8", OL, 3); },
    f3_concha: (c, w, h) => { c.beginPath(); c.moveTo(w / 2, 10); c.bezierCurveTo(w - 6, 18, w - 8, h - 14, w / 2, h - 8); c.bezierCurveTo(8, h - 14, 6, 18, w / 2, 10); blob(c, "#f6d9b8", OL, 4); },
    f3_pedra_macaco: (c, w, h) => { c.beginPath(); c.arc(w / 2, h / 2, w * 0.38, 0, Math.PI * 2); blob(c, "#7d756c", OL, 3.5); c.beginPath(); c.arc(w * 0.4, h * 0.38, w * 0.14, 0, Math.PI * 2); c.fillStyle = "#a89f94"; c.fill(); },
  },
  sheet: { f3_sofia: drawSofia, f3_toninho: drawToninho, f3_caranguejo: drawCrab, f3_macaco: drawMonkey, f3_checkpoint: drawCheckpoint },
  sheetCount: { f3_sofia: SOFIA_POSES.length, f3_toninho: 8, f3_caranguejo: 9, f3_macaco: 15, f3_checkpoint: 3 },
};
