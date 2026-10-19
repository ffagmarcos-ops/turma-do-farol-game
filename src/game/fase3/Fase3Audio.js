// @ts-nocheck
/**
 * Sons sintetizados da Fase 3 (sem arquivos de terceiros): latido do Faísca, carga do latido,
 * arremesso de concha e golpe no caranguejo. Passam pelo barramento de EFEITOS do AudioManager
 * (respeitam o volume da tela SOM e o mudo).
 */
export class Fase3Audio {
  constructor(audio) { this.audio = audio; }
  ok() { const a = this.audio; return a && a.unlocked && !a.muted && a.ctx && a.buses; }
  tone(freq0, freq1, dur, vol, type = "sine", delay = 0, filter = 0) {
    if (!this.ok()) return;
    const ctx = this.audio.ctx, t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, freq1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = o;
    if (filter) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = filter; o.connect(f); node = f; }
    node.connect(g); g.connect(this.audio.buses.sfx);
    o.start(t); o.stop(t + dur + 0.05);
  }
  /** latido curto (pequeno = agudo); strong = latido do especial */
  bark(strong = false, soft = false) {
    const v = soft ? 0.12 : strong ? 0.5 : 0.3;
    this.tone(strong ? 620 : 760, strong ? 260 : 380, 0.11, v, "sawtooth", 0, 1800);
    this.tone(strong ? 560 : 700, strong ? 230 : 340, 0.12, v * 0.9, "sawtooth", 0.15, 1800);
    if (strong) { this.tone(140, 60, 0.35, 0.35, "sine", 0); this.audio.synth?.("splash", { volume: 0.2 }); }
  }
  growl() { this.tone(110, 90, 0.3, 0.12, "sawtooth", 0, 500); }
  throw() { this.tone(500, 1100, 0.12, 0.12, "triangle"); }
  hit() { this.audio.synth?.("toc"); this.tone(900, 500, 0.08, 0.12, "square", 0, 2500); }
  poof() { this.tone(300, 1400, 0.25, 0.15, "sine"); }
  /** carga: tom que sobe enquanto segura; devolve stop() */
  charge(dur = 1.5) {
    if (!this.ok()) return () => {};
    const ctx = this.audio.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "triangle"; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(620, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.2);
    o.connect(g); g.connect(this.audio.buses.sfx); o.start(t);
    let done = false;
    return () => { if (done) return; done = true; const n = ctx.currentTime; g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(g.gain.value, n); g.gain.exponentialRampToValueAtTime(0.0001, n + 0.08); o.stop(n + 0.1); };
  }
  ready() { this.tone(880, 1320, 0.15, 0.12, "sine"); }
  crumble() {
    this.tone(240, 130, 0.09, 0.14, "triangle", 0, 900);
    this.tone(190, 105, 0.11, 0.12, "sawtooth", 0.12, 700);
  }
  collapse() {
    this.tone(160, 52, 0.28, 0.22, "sawtooth", 0, 600);
    this.tone(110, 42, 0.32, 0.18, "triangle", 0.04, 450);
  }
}
