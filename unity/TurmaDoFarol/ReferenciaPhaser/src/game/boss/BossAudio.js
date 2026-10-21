// @ts-nocheck
/**
 * Sons da Fase 2 (todos CC0, créditos em LICENCAS.txt): trovão, chuva, mar, madeira/pancadas no barco,
 * splash e a música de chefe (abertura + loop). Usa o AudioContext e os barramentos do AudioManager.
 * Se um arquivo faltar, cai no som sintetizado (AudioManager.synth).
 */
const BASE = "assets/audio/fase2/";
const MUSIC_LVL = 1.0; // -16 LUFS (arquivo) x 0,6 (bus música) = ~ -20,4 LUFS na mistura
// ajuste por tipo (LUFS medidos: splash -26,5, pancada -11,8, trovão -20,5) para ficarem acima da música
const TRIM = { splash: 1.6, slam: 0.6, wood: 0.8 };
const BEAT = 0.836; // Pirate's Orchestra ~ 72 bpm (medido por autocorrelação de ataques)
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
    g.gain.value = (opts.volume ?? 1) * (opts.far ? 0.55 : 1) * (TRIM[kind] ?? 1);
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
    this.rainOn = Boolean(this.loop("rain", this.a.buses.ambience, 0.32));
    this.loop("sea", this.a.buses.ambience, 0.3);
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
    // nível da música na luta: MUSIC_LVL x barramento 0,6 -> ~ -21 LUFS, abaixo dos efeitos
    this.out = ctx.createGain(); this.out.gain.value = MUSIC_LVL; this.out.connect(a.musicTrim);
    if (intro) {
      const s = ctx.createBufferSource();
      s.buffer = intro;
      this.gIntro = ctx.createGain(); s.connect(this.gIntro); this.gIntro.connect(this.out);
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
    this.gMain.connect(this.out);
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
    if (!this.drumT) this.drumT = setInterval(() => this.schedDrums(), 100);
  }
  /** Polvo com pouca vida: crossfade (2,5 s) para a faixa tensa (orquestra, 128 s). */
  setTension(on = true) {
    if (!on || this.tense) return;
    const ctx = this.ctx, a = this.a, b = this.pick("music_tense");
    if (!ctx || !a.musicTrim || !this.gMain) { this.tensePending = true; return; }
    this.tense = true;
    const now = ctx.currentTime, X = 4;
    // crossfade suave de 4 s (curvas seno/cosseno, potência constante, sem buraco nem pico)
    const N = 32, down = new Float32Array(N), up = new Float32Array(N);
    for (let i = 0; i < N; i++) { const k = i / (N - 1); down[i] = Math.cos(k * Math.PI / 2); up[i] = Math.sin(k * Math.PI / 2); }
    for (const g of [this.gMain, this.gIntro]) {
      if (!g) continue;
      g.gain.cancelScheduledValues(now);
      const v = g.gain.value; g.gain.setValueCurveAtTime(down.map((d) => d * v + 0.0001), now, X);
    }
    if (b) {
      const s = ctx.createBufferSource();
      s.buffer = b; s.loop = true;
      const g = ctx.createGain();
      g.gain.value = 0; g.gain.setValueCurveAtTime(up, now, X);
      s.connect(g); g.connect(this.out);
      s.start(now);
      this.tenseT0 = now;
      this.loops.push(s);
      this.gTense = g;
    }
  }
  /** Tambor sutil, agendado no pulso da orquestra (72 bpm) com 0,3 s de antecedência. */
  schedDrums() {
    const ctx = this.ctx;
    if (!ctx || this.dead) return;
    const t0 = this.tenseT0 ?? ctx.currentTime;
    if (this.nextBeat == null) this.nextBeat = t0 + Math.ceil((ctx.currentTime - t0) / BEAT + 0.05) * BEAT;
    while (this.nextBeat < ctx.currentTime + 0.3) { this.drum(this.nextBeat); this.nextBeat += BEAT; }
  }
  drum(at) {
    const ctx = this.ctx;
    if (!ctx || this.dead || !this.a.unlocked || this.a.muted) return;
    const t0 = Math.max(at ?? 0, ctx.currentTime + 0.01);
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(120, t0);
    o.frequency.exponentialRampToValueAtTime(45, t0 + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.11, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25);
    o.connect(g); g.connect(this.out || this.a.musicTrim);
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
