// @ts-nocheck
export const W = 1920;
export const H = 1080;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
const SAVE = "farol-fase2";
const FLASH_KEY = "farol-reduce-flash";
export function readSave() {
  try { return JSON.parse(localStorage.getItem(SAVE) || "null"); } catch { return null; }
}
export function writeSave(v) {
  try { if (v == null) localStorage.removeItem(SAVE); else localStorage.setItem(SAVE, JSON.stringify(v)); } catch {}
}
export function reduceFlashes() {
  try { return localStorage.getItem(FLASH_KEY) === "1"; } catch { return false; }
}
export function setReduceFlashes(on) {
  try { localStorage.setItem(FLASH_KEY, on ? "1" : "0"); } catch {}
}
export const NAMES = { lucas: "Lucas", marina: "Marina", toninho: "Seu Toninho", julia: "Júlia", bia: "Bia", faisca: "Faísca" };
export const PHASE_TITLES = ["Algo sob o barco", "Todos no convés", "A ideia de Lucas", "Fúria final"];
