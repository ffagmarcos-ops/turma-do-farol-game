// @ts-nocheck
import falas from "../data/falas_hq_vila_das_conchas.json";

const NAMES = {
  julia: "Júlia",
  lucas: "Lucas",
  bia: "Bia",
  toninho: "Seu Toninho",
  marina: "Marina",
  faisca: "Faísca",
};

/** Falas do roteiro. hq=true leva a marca HQ · pág. N. Narração vira legenda. */
export class StoryDirector {
  constructor(_level, saved) {
    this.openingDone = true;
    this.artifact = Boolean(saved?.artifact);
    this.gathered = Boolean(saved?.gathered);
    this.toninho = Boolean(saved?.toninho);
    this.boarded = false;
    this.mode = "play";
    this.sceneId = null;
    this.queue = [];
    this.index = 0;
    this.timer = 0;
    this.caption = null;
    this.dialogue = null;
    this.lock = false;
    this.dirty = false;
  }

  objective() {
    if (!this.artifact) return "Siga a Faísca até o Cais de Pesca";
    if (!this.toninho) return "Mostre o artefato ao Seu Toninho";
    return "Suba no Esperança";
  }

  snapshot() {
    return {
      opening: true,
      artifact: this.artifact,
      gathered: this.gathered,
      toninho: this.toninho,
    };
  }

  beginScene(id) {
    if (this.mode !== "play" || !falas[id]) return [];
    this.sceneId = id;
    this.mode = "scene";
    this.queue = falas[id].lines.map((line) => ({ ...line }));
    this.index = 0;
    this.timer = 0;
    this.lock = true;
    const actions = [];
    this.showCurrent(actions);
    return actions;
  }

  showCurrent(actionOut) {
    const step = this.queue[this.index];
    if (!step) return;
    const mark = ""; // sem referência de página da HQ
    if (step.who === "narrador") {
      this.dialogue = null;
      this.caption = mark ? `${mark}\n\n${step.text}` : step.text;
    } else {
      this.caption = null;
      this.dialogue = {
        name: NAMES[step.who] || step.who,
        portrait: `portrait_${step.who}`,
        text: step.text,
        mark,
        step: this.index + 1,
        total: this.queue.length,
      };
    }
    if (step.sfx === "clinc") actionOut.push("clinc");
    if (step.event === "artefato_cai") actionOut.push("pull", "drop");
    if (step.who === "narrador" && step.text.startsWith("O grupo se reúne")) {
      actionOut.push("gather");
    }
  }

  advance(actionOut) {
    this.index += 1;
    if (this.index < this.queue.length) {
      this.showCurrent(actionOut);
      return;
    }
    this.caption = null;
    this.dialogue = null;
    this.lock = false;
    if (this.sceneId === "bia_redes") {
      this.artifact = true;
      this.dirty = true;
    }
    if (this.sceneId === "toninho_artefato") {
      this.toninho = true;
      this.gathered = true;
      this.dirty = true;
    }
    if (this.sceneId === "toninho_embarcar") {
      this.boarded = true;
      this.mode = "ending";
      this.lock = true;
      this.caption = "Destino: Ilha das Cavernas Azuis.";
      this.timer = 0;
      return;
    }
    this.mode = "play";
    this.sceneId = null;
  }

  update(dt, pressed) {
    const actions = [];
    let consumed = false;
    if (this.mode === "scene") {
      this.timer += dt;
      if (pressed || this.timer > 5.6) {
        this.timer = 0;
        this.advance(actions);
        consumed = true;
      }
    } else if (this.mode === "ending") {
      this.timer += dt;
      if (pressed || this.timer > 3.2) {
        actions.push("complete");
        consumed = true;
        this.mode = "done";
      }
    }
    const dirty = this.dirty;
    this.dirty = false;
    return {
      lock: this.lock,
      caption: this.caption,
      dialogue: this.dialogue,
      actions,
      dirty,
      consumed,
    };
  }
}
