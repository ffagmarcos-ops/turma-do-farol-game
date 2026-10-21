// @ts-nocheck
/** Minimal camera-fixed HUD: shells, objective, talk, letterbox, ending. */
export class HUD {
  constructor(scene) {
    this.scene = scene;
    const style = {
      fontFamily: "Georgia, 'Palatino Linotype', serif",
      color: "#F6E7C1",
    };

    this.panel = scene.add.graphics().setScrollFactor(0).setDepth(80);
    this.panel.fillStyle(0x0b3a5b, 0.45);
    this.panel.fillRoundedRect(24, 18, 460, 64, 12);

    this.shells = scene.add
      .text(40, 26, "Conchas 0/20", { ...style, fontSize: "22px" })
      .setScrollFactor(0)
      .setDepth(81);
    this.objective = scene.add
      .text(40, 52, "", { ...style, fontSize: "16px", color: "#E2B657" })
      .setScrollFactor(0)
      .setDepth(81);

    this.zone = scene.add
      .text(1880, 28, "1–5", {
        ...style,
        fontSize: "14px",
        color: "#F6E7C1",
      })
      .setOrigin(1, 0)
      .setAlpha(0.45)
      .setScrollFactor(0)
      .setDepth(81);

    this.prompt = scene.add
      .text(960, 900, "", {
        fontFamily: "Georgia, serif",
        fontSize: "26px",
        color: "#1B2A33",
        backgroundColor: "#F6E7C1",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(90)
      .setVisible(false);

    this.letterTop = scene.add
      .rectangle(960, 0, 1920, 60, 0x061525, 0)
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(85);
    this.letterBottom = scene.add
      .rectangle(960, 1080, 1920, 60, 0x061525, 0)
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(85);
    this.reveal = scene.add
      .text(960, 120, "", {
        ...style,
        fontSize: "30px",
        align: "center",
        wordWrap: { width: 980 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(86)
      .setVisible(false);

    this.dialogueBox = scene.add.graphics().setScrollFactor(0).setDepth(92);
    this.dialogueName = scene.add
      .text(390, 112, "", { ...style, fontSize: "22px", color: "#E2B657" })
      .setScrollFactor(0)
      .setDepth(93)
      .setVisible(false);
    this.dialogueText = scene.add
      .text(390, 148, "", {
        ...style,
        fontSize: "26px",
        wordWrap: { width: 1280 },
        color: "#F6E7C1",
      })
      .setScrollFactor(0)
      .setDepth(93)
      .setVisible(false);
    this.portrait = scene.add
      .image(268, 182, "portrait_marina")
      .setScrollFactor(0)
      .setDepth(94)
      .setDisplaySize(132, 132)
      .setVisible(false);
    this.cinematic = false;

    this.complete = scene.add
      .text(960, 460, "", {
        ...style,
        fontSize: "40px",
        align: "center",
        color: "#F6E7C1",
        wordWrap: { width: 1100 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(220)
      .setVisible(false);
  }

  setShells(count, total, carteira) {
    this.shells.setText(carteira == null ? `Conchas ${count}/${total}` : `Conchas ${count}/${total} · Carteira ${carteira}`);
  }

  setObjective(_zoneName, objective) {
    this.objective.setText(objective);
  }

  setMuted(muted) {
    this.zone.setText(muted ? "mudo" : "1–5");
  }

  setPrompt(text) {
    const show = Boolean(text);
    this.prompt.setVisible(show);
    if (show) this.prompt.setText(text);
  }

  setDialogue(dialogue) {
    this.dialogueBox.clear();
    if (!dialogue) {
      this.dialogueName.setVisible(false);
      this.dialogueText.setVisible(false);
      this.portrait.setVisible(false);
      return;
    }
    this.dialogueBox.fillStyle(0x0b3a5b, 0.92);
    this.dialogueBox.fillRoundedRect(180, 96, 1560, 200, 18);
    this.dialogueBox.lineStyle(4, 0xe2b657, 1);
    this.dialogueBox.strokeRoundedRect(194, 108, 148, 148, 12);
    this.dialogueName.setVisible(true).setText(
      dialogue.mark ? `${dialogue.name}   ${dialogue.mark}` : dialogue.name,
    );
    this.dialogueText
      .setVisible(true)
      .setText(`${dialogue.text}\n\nE ou toque para continuar  (${dialogue.step}/${dialogue.total})`);
    if (dialogue.portrait && this.scene.textures.exists(dialogue.portrait)) {
      this.portrait.setTexture(dialogue.portrait).setVisible(true);
    }
  }

  setCinematic(on) {
    if (this.cinematic === on) return;
    this.cinematic = on;
    this.scene.tweens.add({
      targets: [this.letterTop, this.letterBottom],
      alpha: on ? 0.92 : 0,
      duration: 280,
    });
  }

  setReveal(text) {
    const on = Boolean(text);
    this.reveal.setVisible(on);
    if (on) this.reveal.setText(text);
  }

  showComplete(message) {
    this.complete.setVisible(true).setText(message);
  }
}
