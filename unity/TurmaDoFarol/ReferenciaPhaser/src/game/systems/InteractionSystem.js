// @ts-nocheck
/** Júlia e Lucas são opcionais. Seu Toninho só abre depois da reunião no píer. */
export class InteractionSystem {
  constructor(talks, savedIds = []) {
    const done = new Set(savedIds);
    this.talks = talks.map((talk) => ({ ...talk, done: done.has(talk.id) }));
    this.openId = null;
    this.line = 0;
    this.positions = Object.fromEntries(talks.map((talk) => [talk.id, talk.x]));
  }

  setX(id, x) {
    this.positions[id] = x;
  }

  doneIds() {
    return this.talks.filter((talk) => talk.done).map((talk) => talk.id);
  }

  toninhoDone() {
    return Boolean(this.talks.find((talk) => talk.id === "toninho")?.done);
  }

  nearest(player) {
    let best = null;
    let distance = Infinity;
    for (const talk of this.talks) {
      const dx = Math.abs(player.x - this.positions[talk.id]);
      if (dx < talk.radius && dx < distance) {
        best = talk;
        distance = dx;
      }
    }
    return best;
  }

  update(player, actions, tap, gates) {
    const patch = { prompt: "", dialogue: null, finishedId: null };
    const current = this.talks.find((talk) => talk.id === this.openId);
    const pressed = Boolean(actions.interactPressed || tap);

    if (current) {
      if (pressed) {
        this.line += 1;
        if (this.line >= current.lines.length) {
          current.done = true;
          this.openId = null;
          patch.finishedId = current.id;
          return patch;
        }
      }
      const line = current.lines[this.line];
      patch.dialogue = {
        name: line.speaker,
        portrait: line.portrait,
        text: line.text,
        mark: line.mark,
        step: this.line + 1,
        total: current.lines.length,
      };
      return patch;
    }

    const near = this.nearest(player);
    if (!near) return patch;

    if (near.gate && !gates?.[near.gate]) {
      patch.prompt =
        near.id === "toninho" ? "Seu Toninho espera a turma no píer" : "Ainda não";
      return patch;
    }

    patch.prompt = near.optional
      ? `E  ·  ${near.name} (opcional)`
      : `E  ·  Falar com ${near.name}`;
    if (!pressed) return patch;

    this.openId = near.id;
    this.line = 0;
    const line = near.lines[0];
    patch.prompt = "";
    patch.dialogue = {
      name: line.speaker,
      portrait: line.portrait,
      text: line.text,
      mark: line.mark,
      step: 1,
      total: near.lines.length,
    };
    return patch;
  }
}
