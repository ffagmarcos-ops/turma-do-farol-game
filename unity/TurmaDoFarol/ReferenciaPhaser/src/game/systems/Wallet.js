// @ts-nocheck
/** Carteira de conchas v2: conchas são GASTAS nos portais; reaparecem a cada run. */
export const WALLET_KEY = "farol-conchas-v2";
const OLD_KEY = "farol-vila-das-conchas-v4";
export const BONUS_F2 = 30;

function blank() {
  return { carteira: 0, ganhoTotal: 0, run: { id: Date.now(), ids: [], bonusF2: false }, portas: ["vila"], vistos: [] };
}

export function readWallet() {
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    if (raw) {
      const w = JSON.parse(raw);
      if (w && typeof w.carteira === "number") return { ...blank(), ...w, run: { ...blank().run, ...(w.run || {}) } };
    }
  } catch {}
  // migração: conchas antigas (v4) viram saldo inicial
  const w = blank();
  try {
    const old = JSON.parse(localStorage.getItem(OLD_KEY) || "null");
    const n = Array.isArray(old?.shells) ? old.shells.length : 0;
    w.carteira = n; w.ganhoTotal = n; w.migrado = n;
  } catch {}
  saveWallet(w);
  return w;
}

export function saveWallet(w) {
  localStorage.setItem(WALLET_KEY, JSON.stringify(w));
  return w;
}

/** Nova run: conchas voltam ao mapa (saldo é mantido). */
export function newRun() {
  const w = readWallet();
  w.run = { id: Date.now(), ids: [], bonusF2: false };
  return saveWallet(w);
}

/** Coleta idempotente dentro da run. */
export function collect(id, value = 1) {
  const w = readWallet();
  if (w.run.ids.includes(id)) return w;
  w.run.ids.push(id);
  w.carteira += value; w.ganhoTotal += value;
  return saveWallet(w);
}

export function grantBonusF2() {
  const w = readWallet();
  if (w.run.bonusF2) return { w, granted: false };
  w.run.bonusF2 = true; w.carteira += BONUS_F2; w.ganhoTotal += BONUS_F2;
  return { w: saveWallet(w), granted: true };
}

/** Compra atômica: lê, valida e grava numa única operação. */
export function buyPortal(id, price) {
  const w = readWallet();
  if (w.portas.includes(id)) return { ok: true, w, already: true };
  if (w.carteira < price) return { ok: false, w };
  w.carteira -= price;
  w.portas = [...w.portas, id];
  saveWallet(w);
  return { ok: true, w };
}

export function markSeen(id) {
  const w = readWallet();
  if (!w.vistos.includes(id)) { w.vistos.push(id); saveWallet(w); }
  return w;
}

export function unlockFree(id) {
  const w = readWallet();
  if (!w.portas.includes(id)) { w.portas.push(id); saveWallet(w); }
  return w;
}

/** Tabela de portais (preço gasto). "fase" = abre por progresso, não por compra. */
export const PORTAIS = [
  { id: "vila", nome: "Vila das Conchas", tipo: "Fase", preco: 0 },
  { id: "mar", nome: "Mar Aberto: o Polvo", tipo: "Fase", preco: 0, requer: "f1" },
  { id: "marina", nome: "Marina Torres", tipo: "Curiosidade", preco: 15 },
  { id: "faisca", nome: "Faísca", tipo: "Curiosidade", preco: 25 },
  { id: "bia", nome: "Bia Oliveira", tipo: "Curiosidade", preco: 35 },
  { id: "julia", nome: "Júlia Costa", tipo: "Curiosidade", preco: 45 },
  { id: "lucas", nome: "Lucas Nogueira", tipo: "Curiosidade", preco: 55 },
  { id: "toninho", nome: "Seu Toninho Marinho", tipo: "Curiosidade", preco: 65 },
  { id: "vila-ilha", nome: "A Vila das Conchas", tipo: "Ilha", preco: 75 },
  { id: "esperanca", nome: "O Barco Esperança", tipo: "Universo", preco: 85 },
  { id: "farol", nome: "O Farol", tipo: "Ilha", preco: 95 },
  { id: "polvo", nome: "O Polvo Gigante", tipo: "Universo", preco: 110, requer: "f2" },
  { id: "cavernas", nome: "As Cavernas Azuis e o Artefato", tipo: "Universo", preco: 125 },
  { id: "bastidores", nome: "Bastidores da HQ", tipo: "Extra", preco: 130 },
];
export function f1Done() { return readWallet().portas.includes("mar"); }
export function f2Done() { try { return localStorage.getItem("farol-fase2-done") === "1"; } catch { return false; } }
export function requisitoOk(p) { return !p.requer || (p.requer === "f1" ? f1Done() : f2Done()); }
/** quantos portais ainda fechados dá para abrir em sequência com o saldo atual (mais baratos primeiro) */
export function portaisAcessiveis(w = readWallet()) {
  let saldo = w.carteira, n = 0;
  for (const p of PORTAIS.filter((p) => p.preco > 0 && !w.portas.includes(p.id) && requisitoOk(p)).sort((a, b) => a.preco - b.preco)) {
    if (saldo >= p.preco) { saldo -= p.preco; n++; } else break;
  }
  return n;
}
export function resetAll() {
  for (const k of [WALLET_KEY, OLD_KEY, "farol-fase2", "farol-fase2-done"]) localStorage.removeItem(k);
  localStorage.setItem(WALLET_KEY, JSON.stringify(blank()));
}
