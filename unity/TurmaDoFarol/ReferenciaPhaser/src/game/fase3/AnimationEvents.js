/** Relógio de ações do manifesto. Atravessa eventos uma vez, mesmo com quadros pulados. */
export class AnimationEvents {
  constructor(manifest, dispatch) {
    this.manifest = manifest;
    this.dispatch = dispatch;
    this.cancel();
  }
  start(key) {
    this.key = key;
    this.elapsed = 0;
    this.pending = (this.manifest?.animationEvents || [])
      .filter((event) => event.animationKey === key).slice().sort((a, b) => a.atMs - b.atMs);
    this.advance(0);
  }
  advance(milliseconds) {
    this.elapsed += milliseconds;
    while (this.pending.length && this.pending[0].atMs <= this.elapsed + 0.001) {
      const event = this.pending.shift();
      this.dispatch(event);
    }
  }
  cancel() { this.key = null; this.elapsed = 0; this.pending = []; }
}
