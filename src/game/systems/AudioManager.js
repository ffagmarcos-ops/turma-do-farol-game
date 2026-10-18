// @ts-nocheck
/**
 * Buses: music 0.6, ambience 0.45, sfx 0.8, ui 0.5.
 * No máximo 6 SFX ao mesmo tempo. Arquivo ausente não toca nada.
 *
 * Chaves em /assets/audio/:
 *   sfx_step_wood_01..03  sfx_step_stone_01..03  sfx_step_grass_01..03
 *   sfx_jump  sfx_land  sfx_shell  sfx_bell  sfx_clinc  sfx_bark  sfx_plank
 *   sfx_ui_dialog_open  sfx_ui_dialog_close  sfx_ui_dialog_next  sfx_ui_confirm
 *   amb_waves.ogg  amb_gulls.ogg  amb_market.ogg
 *   music_vila.mp3
 */

const BUSES = { music: 0.6, ambience: 0.45, sfx: 0.8, ui: 0.5 };
const MAX_SFX = 6;
const PREF_KEY = "farol-som";

const VARIANTS = {
  step_wood: ["sfx_step_wood_01", "sfx_step_wood_02", "sfx_step_wood_03", "sfx_passo_madeira_01", "sfx_passo_madeira_02", "sfx_passo_madeira_03", "sfx_passo_madeira_04", "sfx_passo_madeira_05"],
  step_stone: ["sfx_step_stone_01", "sfx_step_stone_02", "sfx_step_stone_03"],
  step_grass: ["sfx_step_grass_01", "sfx_step_grass_02", "sfx_step_grass_03"],
  jump: ["sfx_jump"],
  land: ["sfx_land"],
  shell: ["sfx_shell", "sfx_concha_brilho_01", "sfx_concha_brilho_02", "sfx_concha_brilho_03"],
  bell: ["sfx_bell"],
  clinc: ["sfx_clinc"],
  bark: ["sfx_bark"],
  plank: ["sfx_plank"],
  // CC0 (ver LICENCAS): ondas do píer, rangido de madeira, respingo
  praia: ["sfx_praia_onda_01", "sfx_praia_onda_02", "sfx_praia_onda_03", "sfx_praia_onda_04"],
  rangido: ["sfx_madeira_rangido_01", "sfx_madeira_rangido_02", "sfx_madeira_rangido_03", "sfx_madeira_rangido_04", "sfx_rangido_corda_01", "sfx_rangido_corda_02", "sfx_rangido_corda_03"],
  vento: ["sfx_vento_01", "sfx_vento_02"],
  // menu dos portais (CC0, curadoria 18/10)
  portal_hum: ["menu/portal_zumbido"],
  sino_vidro: ["menu/sino_vidro_01", "menu/sino_vidro_02", "menu/sino_vidro_03", "menu/sino_vidro_04", "menu/sino_vidro_05", "menu/sino_vidro_06"],
  sino_bong: ["menu/sino_bong"],
  whoosh: ["menu/whoosh"],
  moedas: ["menu/moedas_01", "menu/moedas_02"],
  splash: ["sfx_splash_02", "sfx_splash_03", "sfx_splash_06", "sfx_splash_08"],
  ui_open: ["sfx_ui_dialog_open"],
  ui_close: ["sfx_ui_dialog_close"],
  ui_next: ["sfx_ui_dialog_next"],
  ui_confirm: ["ui/confirmation_001", "ui/confirmation_002"],
  // sons de botão CC0 (assets_externos/ui_botoes, liberados)
  ui_click: ["ui/click_001", "ui/click_002"],
  ui_hover: ["ui/tick_001", "ui/tick_002"],
  ui_back: ["ui/back_001", "ui/back_002"],
};

const AMBIENT_KEY = {
  sea: "amb_waves",
  harbor: "amb_waves",
  boats: "amb_waves",
  wood: "amb_waves",
  gulls: "amb_gulls",
  villagers: "amb_market",
  birds: "amb_birds",
  wind: "amb_wind",
};

function compressedCandidates(base) {
  return [`assets/audio/${base}.ogg`, `assets/audio/${base}.mp3`];
}

let FILE_LIST = null;
function fileList() {
  if (!FILE_LIST) FILE_LIST = fetch("assets/files.json").then((r) => (r.ok ? r.json() : null)).then((l) => (l ? new Set(l) : null)).catch(() => null);
  return FILE_LIST;
}
async function headOk(url) {
  const list = await fileList();
  if (list) return list.has(url.replace(/^\.?\//, ""));
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url);
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.send();
  });
}

let sharedCtx = null;

export function primeAudio() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx) sharedCtx = new Ctx();
  if (sharedCtx.state === "suspended") sharedCtx.resume();
  return sharedCtx;
}

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.buses = null;
    this.musicTrim = null;
    this.unlocked = false;
    this.muted = false;
    this.talking = false;
    this.musicStarted = false;
    this.buffers = new Map();
    this.loading = new Set();
    this.voices = [];
    this.queue = [];
    this.beds = [];
    this.sources = [];
    this.surfaces = [];
    this.musicCfg = { file: "assets/audio/music_vila.mp3", duck: 0.35 };
    this.levelBound = false;
    this.duck = 0.35;
    this.loadPrefs();
  }

  unlock() {
    const ctx = primeAudio();
    if (!ctx) return;
    this.ctx = ctx;
    if (this.unlocked) return;
    this.master = ctx.createGain();
    this.master.gain.value = 1;
    // limitador no fim da cadeia: evita clipping quando música, chuva e efeitos somam
    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -3; this.limiter.knee.value = 2; this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.003; this.limiter.release.value = 0.15;
    this.master.connect(this.limiter); this.limiter.connect(ctx.destination);
    this.buses = {};
    for (const [name, value] of Object.entries(BUSES)) {
      const gain = ctx.createGain();
      gain.gain.value = value * this.volOf(name);
      gain.connect(this.master);
      this.buses[name] = gain;
    }
    this.musicTrim = ctx.createGain();
    this.musicTrim.gain.value = 1;
    this.musicTrim.connect(this.buses.music);
    this.unlocked = true;
    this.loadVariants();
    if (this.levelBound) {
      this.startMusic();
      this.startAmbience();
    }
  }

  bindLevel(level) {
    this.sources = level.audio || [];
    this.surfaces = level.surfaces || [];
    this.musicCfg = level.music || this.musicCfg;
    this.duck = this.musicCfg.duck ?? 0.35;
    const buses = level.buses || BUSES;
    if (this.buses) {
      for (const name of Object.keys(BUSES)) {
        if (typeof buses[name] === "number") this.buses[name].gain.value = buses[name] * this.volOf(name);
      }
    }
    this.levelBound = true;
    this.baseBuses = { ...BUSES, ...level.buses };
    if (!this.unlocked) return;
    this.loadAmbient();
    this.startMusic();
    this.startAmbience();
  }

  keysToLoad() {
    const keys = new Set();
    for (const list of Object.values(VARIANTS)) {
      for (const key of list) keys.add(key);
    }
    return [...keys];
  }

  loadVariants() {
    for (const key of this.keysToLoad()) this.loadBuffer(key, compressedCandidates(key));
    this.loadAmbient();
  }

  loadAmbient() {
    const keys = new Set(Object.values(AMBIENT_KEY));
    for (const key of keys) this.loadBuffer(key, compressedCandidates(key));
  }

  async loadBuffer(key, candidates) {
    if (!this.ctx || this.buffers.has(key) || this.loading.has(key)) return;
    this.loading.add(key);
    try {
      let url = null;
      for (const candidate of candidates) {
        if (await headOk(candidate)) {
          url = candidate;
          break;
        }
      }
      if (!url) return;
      const response = await fetch(url);
      if (!response.ok) return;
      const data = await response.arrayBuffer();
      const buffer = await this.ctx.decodeAudioData(data.slice(0));
      this.buffers.set(key, buffer);
      this.flushQueue();
      this.startAmbience();
    } catch {
      /* arquivo ausente ou codec: silêncio */
    } finally {
      this.loading.delete(key);
    }
  }

  async startMusic() {
    if (!this.unlocked || this.musicStarted) return;
    this.musicStarted = true;
    try {
      const file = this.musicCfg.file || "assets/audio/music_vila.mp3";
      if (!/\.(ogg|mp3)(\?|$)/i.test(file) || !(await headOk(file))) {
        this.musicStarted = false;
        return;
      }
      const response = await fetch(file);
      if (!response.ok) return;
      const data = await response.arrayBuffer();
      const buffer = await this.ctx.decodeAudioData(data.slice(0));
      // a faixa mudou enquanto carregava (troca de cena): não toca a antiga por cima
      if ((this.musicCfg.file || "assets/audio/music_vila.mp3") !== file) return;
      const node = this.ctx.createBufferSource();
      node.buffer = buffer;
      node.loop = true;
      node.connect(this.musicTrim);
      node.start();
      this.musicNode = node;
      this.musicFile = file;
    } catch {
      this.musicStarted = false;
    }
  }

  startAmbience() {
    if (!this.unlocked) return;
    for (const src of this.sources) this.tryStartBed(src);
  }

  tryStartBed(src) {
    if (src.started) return;
    const key = AMBIENT_KEY[src.kind];
    const buffer = key && this.buffers.get(key);
    if (!buffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) {
      source.connect(panner);
      panner.connect(gain);
    } else {
      source.connect(gain);
    }
    gain.connect(this.buses.ambience);
    source.start();
    src.started = true;
    this.beds.push({ ...src, gain, panner });
  }

  /** Música própria de uma cena (menu, hub): toca já (ou no 1º toque/tecla, se o áudio ainda estiver travado)
   *  e, quando a cena fecha, para e devolve a música anterior (sem tocar por cima das fases). */
  useSceneMusic(scene, file) {
    const cur = this.musicCfg?.file; const prev = cur && !cur.includes("/menu/") ? cur : "assets/audio/music_vila.mp3";
    let alive = true;
    const go = () => { if (alive) this.switchMusic(file); };
    if (this.unlocked) go();
    else { scene.input.once("pointerdown", () => { this.unlock(); go(); }); scene.input.keyboard?.once("keydown", () => { this.unlock(); go(); }); }
    scene.events.once("shutdown", () => {
      alive = false;
      try { this.musicNode?.stop(); } catch {}
      this.musicNode = null; this.musicFile = null; this.musicStarted = false;
      this.musicCfg = { ...this.musicCfg, file: prev };
    });
  }

  /** Troca a faixa de música (silêncio se o arquivo não existir). */
  switchMusic(file) {
    if (this.musicFile === file && this.musicNode) return;
    try { this.musicNode?.stop(); } catch {}
    this.musicNode = null;
    this.musicFile = null;
    this.musicCfg = { ...this.musicCfg, file };
    this.musicStarted = false;
    this.startMusic();
  }

  /** Som sintetizado (ruído/oscilador) para a Fase 2: trovão, chuva, splash, sônico. */
  synth(kind, opts = {}) {
    if (!this.unlocked || this.muted || !this.ctx) return null;
    const ctx = this.ctx;
    const now = ctx.currentTime + (opts.delay || 0);
    const out = ctx.createGain();
    out.connect(kind.startsWith("ui") ? this.buses.ui : this.buses.sfx);
    const noise = (dur) => {
      const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
      if (!this.noiseBuf || this.noiseBuf.length < len) {
        const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 4), ctx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        this.noiseBuf = b;
      }
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      return src;
    };
    const env = (g, a, peak, dur) => {
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(peak, now + a);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    };
    if (kind === "thunder" || kind === "splash" || kind === "slam" || kind === "roar" || kind === "ink") {
      const cfg = {
        thunder: [2.6, 0.05, 1.0, 180],
        splash: [0.7, 0.01, 0.7, 1800],
        slam: [0.5, 0.005, 1.0, 400],
        roar: [1.4, 0.15, 0.8, 160],
        ink: [0.35, 0.01, 0.5, 900],
      }[kind];
      const [dur, a, peak, freq] = cfg;
      const src = noise(dur);
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(freq * (opts.far ? 0.5 : 1), now);
      if (kind === "splash") f.frequency.exponentialRampToValueAtTime(300, now + dur);
      src.connect(f);
      f.connect(out);
      env(out, a, peak * (opts.volume ?? 1), dur);
      src.start(now, Math.random() * 2, dur + 0.1);
      if (kind === "roar") {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(70, now);
        o.frequency.linearRampToValueAtTime(45, now + dur);
        const og = ctx.createGain();
        o.connect(og);
        og.connect(out);
        og.gain.value = 0.25;
        o.start(now);
        o.stop(now + dur);
      }
      return null;
    }
    if (kind === "sonic" || kind === "sonic_big" || kind === "overheat" || kind === "hurt" || kind === "hit") {
      const o = ctx.createOscillator();
      const cfg = {
        sonic: ["sine", 220, 90, 0.18, 0.5],
        sonic_big: ["sawtooth", 140, 40, 0.9, 0.7],
        overheat: ["square", 1800, 1400, 0.6, 0.15],
        hurt: ["triangle", 420, 160, 0.3, 0.5],
        hit: ["sine", 160, 70, 0.15, 0.6],
      }[kind];
      o.type = cfg[0];
      o.frequency.setValueAtTime(cfg[1], now);
      o.frequency.exponentialRampToValueAtTime(cfg[2], now + cfg[3]);
      o.connect(out);
      env(out, 0.01, cfg[4] * (opts.volume ?? 1), cfg[3] + 0.05);
      o.start(now);
      o.stop(now + cfg[3] + 0.1);
      return null;
    }
    if (kind === "rain") {
      const src = noise(4);
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 2400;
      f.Q.value = 0.4;
      src.connect(f);
      f.connect(out);
      out.disconnect();
      out.connect(this.buses.ambience);
      out.gain.value = opts.volume ?? 0.35;
      src.start();
      return { stop: () => { try { src.stop(); } catch {} out.disconnect(); }, gain: out };
    }
    // sons gerados em código (sem arquivo): sino de vidro FM, "plim", "toc", acorde dourado
    const tone = (freq, t0, dur, peak, type = "sine", mod = 0, modRatio = 2.76) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, now + t0);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now + t0);
      g.gain.exponentialRampToValueAtTime(peak * (opts.volume ?? 1), now + t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + t0 + dur);
      if (mod) {
        const m = ctx.createOscillator(); m.frequency.value = freq * modRatio;
        const mg = ctx.createGain(); mg.gain.setValueAtTime(freq * mod, now + t0); mg.gain.exponentialRampToValueAtTime(1, now + t0 + dur);
        m.connect(mg); mg.connect(o.frequency); m.start(now + t0); m.stop(now + t0 + dur + 0.05);
      }
      o.connect(g); g.connect(out); o.start(now + t0); o.stop(now + t0 + dur + 0.05);
    };
    out.gain.value = 1;
    if (kind === "bell") {
      // sino de vidro (FM inarmônico) + acorde mágico em arpejo
      tone(1318, 0, 2.6, 0.32, "sine", 1.6, 3.5);
      tone(1976, 0.01, 1.8, 0.12, "sine", 0.8, 2.76);
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.12 + i * 0.09, 2.2, 0.1, "triangle"));
      return null;
    }
    if (kind === "plim") { tone(880 * Math.pow(2, (opts.step || 0) / 12), 0, 0.28, 0.16, "sine", 0.4, 2); return null; }
    if (kind === "gold3") { [988, 1319, 1760].forEach((f, i) => tone(f, i * 0.08, 0.5, 0.18, "sine", 0.5, 2)); return null; }
    if (kind === "toc") { tone(140, 0, 0.18, 0.5, "triangle"); tone(90, 0.02, 0.22, 0.3, "sine"); return null; }
    return null;
  }

  busOf(name) {
    return name.startsWith("ui_") ? this.buses.ui : this.buses.sfx;
  }

  resolve(name) {
    const list = VARIANTS[name];
    if (!list || !list.length) return null;
    return list[(Math.random() * list.length) | 0];
  }

  play(name, opts = {}) {
    if (!this.unlocked || this.muted || !this.ctx) return;
    const key = this.resolve(name);
    if (!key) return;
    if (!this.buffers.has(key)) {
      this.queue.push({ key, name, opts, at: this.ctx.currentTime });
      return;
    }
    this.spawn(key, name, opts);
  }

  flushQueue() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.queue = this.queue.filter((item) => {
      if (now - item.at > 1.2) return false;
      if (!this.buffers.has(item.key)) return true;
      this.spawn(item.key, item.name, item.opts);
      return false;
    });
  }

  spawn(key, name, opts) {
    const buffer = this.buffers.get(key);
    if (!buffer) return;
    const voice = this.alloc();
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = opts.rate || 1;
    const gain = this.ctx.createGain();
    gain.gain.value = opts.volume ?? 1;
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) {
      panner.pan.value = Math.max(-1, Math.min(1, opts.pan || 0));
      source.connect(gain);
      gain.connect(panner);
      panner.connect(this.busOf(name));
    } else {
      source.connect(gain);
      gain.connect(this.busOf(name));
    }
    const stop = () => {
      try {
        source.stop();
      } catch {
        /* já parou */
      }
    };
    voice.stop = stop;
    source.onended = () => {
      voice.done = true;
    };
    source.start();
  }

  alloc() {
    this.voices = this.voices.filter((voice) => !voice.done);
    if (this.voices.length >= MAX_SFX) {
      const old = this.voices.shift();
      old.stop?.();
      old.done = true;
    }
    const voice = { done: false, stop: () => {} };
    this.voices.push(voice);
    return voice;
  }

  surfaceAt(x) {
    const row = this.surfaces.find((item) => x >= item.from && x < item.to);
    return row?.kind || "wood";
  }

  step(x) {
    const kind = this.surfaceAt(x);
    const name = kind === "stone" || kind === "grass" || kind === "wood" ? `step_${kind}` : "step_wood";
    this.play(name, { rate: 0.92 + Math.random() * 0.16 });
  }

  clinc() {
    this.play("clinc");
  }

  woodStep() {
    this.play("step_wood", { rate: 0.92 + Math.random() * 0.16 });
  }

  setDialogue(talking) {
    this.talking = talking;
  }

  /** Volume do jogador (SOM/OPÇÕES): música e efeitos 0..1 + mudo, salvo no localStorage. */
  loadPrefs() {
    if (this.prefs) return this.prefs;
    let p = {};
    try { p = JSON.parse(localStorage.getItem(PREF_KEY) || "{}"); } catch {}
    this.prefs = { music: p.music ?? 1, sfx: p.sfx ?? 1, muted: Boolean(p.muted) };
    this.muted = this.prefs.muted;
    return this.prefs;
  }
  volOf(name) {
    const p = this.loadPrefs();
    return name === "music" ? p.music : p.sfx;
  }
  setPrefs(patch) {
    Object.assign(this.loadPrefs(), patch);
    this.muted = this.prefs.muted;
    try { localStorage.setItem(PREF_KEY, JSON.stringify(this.prefs)); } catch {}
    if (this.buses) {
      const base = this.baseBuses || BUSES;
      const now = this.ctx.currentTime;
      for (const name of Object.keys(this.buses)) this.buses[name].gain.setTargetAtTime((base[name] ?? BUSES[name]) * this.volOf(name), now, 0.03);
    }
    if (this.master) this.master.gain.value = this.muted ? 0 : 1;
    return this.prefs;
  }

  toggleMute() {
    this.setPrefs({ muted: !this.muted });
    return this.muted;
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 1;
    return this.muted;
  }

  update(dt, listenerX) {
    if (!this.unlocked || !this.ctx) return;
    this.master.gain.value = this.muted ? 0 : 1;
    const target = this.talking ? this.duck : 1;
    const current = this.musicTrim.gain.value;
    this.musicTrim.gain.value = current + (target - current) * Math.min(1, dt * 4);
    const now = this.ctx.currentTime;
    for (const bed of this.beds) {
      const dx = bed.x - listenerX;
      const dist = Math.abs(dx);
      const closeness = Math.max(0, 1 - dist / (bed.radius || 1));
      const vol = closeness * closeness * 0.4;
      bed.gain.gain.setTargetAtTime(vol, now, 0.08);
      if (bed.panner) {
        const pan = Math.max(-1, Math.min(1, dx / (bed.radius || 1)));
        bed.panner.pan.setTargetAtTime(pan, now, 0.08);
      }
    }
  }
}
