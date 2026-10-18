// Gera public/assets/files.json (lista de arquivos) para o jogo não pedir arquivos ausentes (sem 404 no console).
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
const root = "public";
const out = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else out.push(relative(root, p).split("\\").join("/")); } };
walk(join(root, "assets"));
writeFileSync(join(root, "assets", "files.json"), JSON.stringify(out));
console.log("files.json:", out.length);
