// @ts-nocheck
import raw from "./fase1-vila.json";
import falas from "./falas_hq_vila_das_conchas.json";

const NAMES = {
  julia: "Júlia",
  lucas: "Lucas",
  bia: "Bia",
  toninho: "Seu Toninho",
  marina: "Marina",
  faisca: "Faísca",
};

function speech(lines) {
  return lines
    .filter((line) => line.who !== "narrador")
    .map((line) => ({
      speaker: NAMES[line.who] || line.who,
      portrait: `portrait_${line.who}`,
      text: line.text,
      mark: "", // sem referência de página da HQ (pedido do Marcos)
    }));
}

const shellY = [900, 760, 900, 820];

export const LEVEL = {
  ...raw,
  segmentSize: { y: 390, w: 2048, h: 690 },
  shells: raw.shells.map((shell, i) =>
    typeof shell === "number"
      ? { id: `shell-${i + 1}`, x: shell, y: shellY[i % shellY.length] }
      : shell,
  ),
  talks: [
    {
      id: "julia",
      who: "julia",
      name: "Júlia",
      optional: true,
      x: raw.actors.julia.x,
      radius: 190,
      lines: speech(falas.julia_porto.lines),
    },
    {
      id: "lucas",
      who: "lucas",
      name: "Lucas",
      optional: true,
      x: raw.actors.lucas.x,
      radius: 190,
      lines: speech(falas.lucas_praca.lines),
    },
  ],
};

export function zoneAt(x) {
  let current = LEVEL.zones[0];
  for (const zone of LEVEL.zones) {
    if (x >= zone.x) current = zone;
  }
  return current;
}
