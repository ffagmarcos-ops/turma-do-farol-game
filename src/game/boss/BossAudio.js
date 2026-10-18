// @ts-nocheck
/**
 * Sons da Fase 2 (todos CC0, créditos em LICENCAS.txt): trovão, chuva, mar, madeira/pancadas no barco,
 * splash e a música de chefe (abertura + loop). Usa o AudioContext e os barramentos do AudioManager.
 * Se um arquivo faltar, cai no som sintetizado (AudioManager.synth).
 */
const BASE = "assets/audio/fase2/";
const FILES = {
  thunder: ["trovao_estrondo", "trovao_longo"],
  rain: ["chuva_loop"],
  sea: ["mar_loop_01"],
  wave: ["mar_onda_01"],
  slam: ["barco_pancada_01", "barco_pancada_02", "barco_pancada_03"],
  wood: ["madeira_impacto_01", "madeira_impacto_02"],
  creak: ["madeira_rangido_01"],
  splash: ["splash_01", "splash_02", "splash_03", "splash_04"],
  music_intro: ["bgm_boss_abertura"],
  music_loop: ["bgm_boss"],
  music_tense: ["bgm_boss_tenso"], // CC0 "Pirate's Orchestra" (Dizzy Crow, 128 s): polvo com pouca vida
};

export class BossAudio {
  constructor(audio) {
    this.a = audio;
    this.buf = new Map();
    this.loops = [];
    this.dead = false;
    this.ready = this.load();
  }
  get ctx() { return this.a?.ctx; }
  async load() {
    const ctx = this.ctx;
    if (!ctx) return;
    const names = [...new Set(Object.values(FILES).flat())];
    await Promise.all(names.map(async (n) => {
      try {
        const r = await fetch(`${BASE}${n}.mp3`);
        if (!r.ok) return;
        this.buf.set(n, await ctx.decodeAudioData(await r.arrayBuffer()));
      } catch {}
    }));
    if (this.dead) return;
    this.startBeds();
    this.startMusic();
  }
  pick(kind) {
    const list = (FILES[kind] || []).filter((n) => this.buf.has(n));
    return list.length ? this.buf.get(list[Math.floor(Math.random() * list.length)]) : null;
  }
  has(kind) { return Boolean(this.pick(kind)); }
  /** Toca um efeito; retorna false se não houver amostra (o chamador usa o sintetizado). */
  play(kind, opts = {}) {
    const ctx = this.ctx;
    const b = this.pick(kind);
    if (!ctx || !b || !this.a.unlocked || this.a.muted) return false;
    const src = ctx.createBufferSource();
    src.buffer = b;
    src.playbackRate.value = (opts.rate || 1) * (0.94 + Math.random() * 0.12);
    const g = ctx.createGain();
    g.gain.value = (opts.volume ?? 1) * (opts.far ? 0.55 : 1);
    src.connect(g);
    g.connect(this.a.buses.sfx);
    src.start(ctx.currentTime + (opts.delay || 0));
    return true;
  }
  loop(kind, bus, vol) {
    const b = this.pick(kind);
    if (!b || !this.a.buses) return null;
    const src = this.ctx.createBufferSource();
    src.buffer = b;
    src.loop = true;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    src.connect(g);
    g.connect(bus);
    src.start();
    this.loops.push(src);
    return src;
  }
  startBeds() {
    if (!this.a.unlocked) return;
    this.rainOn = Boolean(this.loop("rain", this.a.buses.ambience, 0.55));
    this.loop("sea", this.a.buses.ambience, 0.45);
  }
  startMusic() {
    const a = this.a;
    if (!a.unlocked || !a.musicTrim) return;
    try { a.musicNode?.stop(); } catch {}
    a.musicNode = null;
    a.musicFile = "fase2";
    const intro = this.pick("music_intro");
    const loop = this.pick("music_loop");
    if (!loop) return;
    const ctx = this.ctx;
    let t = ctx.currentTime + 0.05;
    if (intro) {
      const s = ctx.createBufferSource();
      s.buffer = intro;
      s.connect(a.musicTrim);
      s.start(t);
      this.loops.push(s);
      t += intro.duration;
    }
    const l = ctx.createBufferSource();
    l.buffer = loop;
    l.loop = true;
    this.gMain = ctx.createGain();
    this.gMain.gain.value = 1;
    l.connect(this.gMain);
    this.gMain.connect(a.musicTrim);
    l.start(t);
    this.loops.push(l);
    a.musicNode = l;
    if (this.tensePending) this.setTension(true);
  }
  /** Fúria final (≤ 5%): mantém a orquestra (faixa tensa única) + tambor grave sintetizado. */
  setFury() {
    if (this.fury) return;
    this.fury = true;
    this.setTension(true);
    if (!this.drumT) this.drumT = setInterval(() => this.drum(), 400);
  }
  /** Polvo com pouca vida: crossfade (2,5 s) para a faixa tensa (orquestra, 128 s). */
  setTension(on = true) {
    if (!on || this.tense) return;
    const ctx = this.ctx, a = this.a, b = this.pick("music_tense");
    if (!ctx || !a.musicTrim || !this.gMain) { this.tensePending = true; return; }
    this.tense = true;
    const now = ctx.currentTime, X = 2.5;
    this.gMain.gain.cancelScheduledValues(now);
    this.gMain.gain.setValueAtTime(this.gMain.gain.value, now);
    this.gMain.gain.linearRampToValueAtTime(b ? 0 : 0.8, now + X);
    if (b) {
      const s = ctx.createBufferSource();
      s.buffer = b; s.loop = true;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(1, now + X);
      s.connect(g); g.connect(a.musicTrim);
      s.start(now);
      this.loops.push(s);
      this.gTense = g;
    }
  }
  drum() {
    const ctx = this.ctx;
    if (!ctx || this.dead || !this.a.unlocked || this.a.muted) return;
    const t0 = ctx.currentTime + 0.01;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(120, t0);
    o.frequency.exponentialRampToValueAtTime(45, t0 + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.32, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25);
    o.connect(g); g.connect(this.a.musicTrim);
    o.start(t0); o.stop(t0 + 0.27);
  }
  /** Latido sintetizado do Faísca (os latidos gravados ficaram de fora por licença incerta). */
  woof(volume = 0.5) {
    const ctx = this.ctx;
    if (!ctx || !this.a.unlocked || this.a.muted) return;
    const now = ctx.currentTime;
    for (let k = 0; k < 2; k++) {
      const t0 = now + k * 0.16;
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(520, t0);
      o.frequency.exponentialRampToValueAtTime(260, t0 + 0.09);
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 900;
      f.Q.value = 1.2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(volume * 0.6, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.11);
      o.connect(f); f.connect(g); g.connect(this.a.buses.sfx);
      o.start(t0); o.stop(t0 + 0.13);
    }
  }
  stop() {
    this.dead = true;
    clearInterval(this.drumT);
    for (const s of this.loops) { try { s.stop(); } catch {} }
    this.loops = [];
    if (this.a) { this.a.musicNode = null; this.a.musicFile = null; this.a.musicStarted = false; }
  }
}
