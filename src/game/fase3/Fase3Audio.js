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
  monkeyChatter() {
    this.tone(580, 920, 0.08, 0.14, "triangle", 0, 2200);
    this.tone(640, 1040, 0.09, 0.14, "triangle", 0.1, 2200);
  }
  monkeyThrow() {
    this.tone(420, 220, 0.14, 0.16, "sine");
  }
  monkeyLaugh() {
    for (let i = 0; i < 3; i++) this.tone(680 + i * 50, 480, 0.08, 0.12, "triangle", i * 0.11, 2000);
  }
  rockImpact() {
    this.tone(150, 55, 0.14, 0.2, "triangle", 0, 500);
  }
  toninhoCall() {
    this.tone(330, 440, 0.12, 0.14, "triangle", 0, 1600);
    this.tone(440, 520, 0.16, 0.14, "triangle", 0.14, 1600);
  }
  ropeThrow() {
    this.tone(380, 140, 0.26, 0.18, "sine", 0, 1200);
  }
  ropeGrab() {
    this.tone(220, 320, 0.08, 0.14, "triangle", 0, 1100);
  }
  /** Chamado alegre da Marina, arrasto da caixa de madeira e batida quando encaixa */
  marinaCall() {
    this.tone(420, 620, 0.11, 0.16, "triangle", 0, 1800);
    this.tone(620, 780, 0.14, 0.18, "triangle", 0.09, 2100);
  }
  cratePush() {
    this.tone(140, 95, 0.12, 0.14, "sawtooth", 0, 420);
    this.tone(110, 80, 0.12, 0.12, "triangle", 0.03, 380);
  }
  crateThud() {
    this.tone(130, 52, 0.18, 0.24, "triangle", 0, 520);
    this.tone(95, 42, 0.22, 0.18, "sawtooth", 0.02, 420);
  }
  /** Bip de foco e clique/flash da câmera fotográfica da Júlia (Setor H) */
  cameraBeep() {
    this.tone(1180, 1320, 0.06, 0.11, "sine", 0, 2600);
  }
  cameraShutter() {
    this.tone(1600, 420, 0.045, 0.18, "square", 0, 3200);
    this.tone(920, 1840, 0.14, 0.16, "triangle", 0.03, 2800);
  }
  /** Aparelho do Lucas e boias flutuantes emergindo na água (Setor I) */
  gadgetBeep() {
    this.tone(740, 980, 0.07, 0.12, "triangle", 0, 2400);
    this.tone(980, 1320, 0.08, 0.12, "sine", 0.09, 2600);
  }
  gadgetActivate() {
    this.tone(520, 1480, 0.22, 0.16, "sine", 0, 2800);
    this.tone(780, 1760, 0.18, 0.14, "triangle", 0.06, 3000);
  }
  buoyPop() {
    this.tone(240, 560, 0.14, 0.15, "sine", 0, 1600);
    this.tone(420, 740, 0.09, 0.11, "triangle", 0.04, 2000);
  }
  /** Sons da Cachoeira e Gruta Secreta (Setores J e K): relíquia da história, energia especial e eco da gruta */
  relicChime() {
    this.tone(587, 880, 0.18, 0.15, "sine", 0, 3200);
    this.tone(880, 1175, 0.22, 0.16, "triangle", 0.12, 3400);
    this.tone(1175, 1760, 0.34, 0.18, "sine", 0.24, 3600);
  }
  energyOrb() {
    this.tone(440, 880, 0.18, 0.16, "triangle", 0, 2800);
    this.tone(660, 1320, 0.24, 0.16, "sine", 0.08, 3200);
    this.tone(880, 1760, 0.28, 0.14, "sine", 0.16, 3600);
  }
  caveEcho() {
    this.tone(320, 480, 0.28, 0.12, "sine", 0, 1400);
    this.tone(480, 360, 0.34, 0.09, "triangle", 0.18, 1200);
  }
  /** Sons da Bia e caminho escondido nas copas (Setor L) */
  biaPoint() {
    this.tone(680, 1020, 0.12, 0.14, "sine", 0, 2400);
    this.tone(1020, 1360, 0.16, 0.15, "triangle", 0.08, 2800);
  }
  secretPathReveal() {
    this.tone(380, 760, 0.22, 0.16, "triangle", 0, 1800);
    this.tone(520, 1040, 0.28, 0.14, "sine", 0.12, 2200);
  }
}
