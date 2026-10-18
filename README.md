# Turma do Farol: Vila das Conchas

Jogo 2D de plataforma e aventura (Phaser 3 + Vite), empacotado para Android com Capacitor e com uma versão para PC que roda no navegador.

- **Fase 1: Vila das Conchas.** Marina explora a vila, coleta conchas, conversa com os moradores e vive páginas de HQ.
- **Fase 2: O Polvo Gigante.** Batalha de chefe no mar, com trilha tensa (Pirate's Orchestra) e a fúria final.
- **Portais e Curiosidades.** Hub de portais (cenas 22 a 33), menu principal, pausa e créditos.

## Requisitos
- Node.js 18 ou mais novo, e npm
- Para o APK: JDK 17 e Android SDK (API 34)
- Opcional: Python 3 e ffmpeg, para as ferramentas de `tools/` e os testes de `testes/` (Playwright)

## Rodar em desenvolvimento
```bash
npm install
npm run dev        # abre em http://localhost:5173
```

## Gerar o build web
```bash
npm run build      # saída em dist/
npm run preview
```

## Gerar o APK (Android)
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```
A versão do app fica em `android/app/build.gradle` (`versionCode` / `versionName`).
Para manter o APK abaixo de ~70 MB, as imagens e áudios grandes da pasta `android/app/src/main/assets/public` são convertidos (PNG > 150 KB vira WebP, áudio > 60 KB vira OGG 96k) antes do `assembleDebug`.

## Gerar a versão para PC
1. Rode `npm run build` (ou use a pasta otimizada do Android, `android/app/src/main/assets/public`).
2. Copie o conteúdo para `TurmaDoFarol_VilaDasConchas/jogo/`, sem os arquivos `cordova*.js`.
3. Inclua `LICENCAS.md` (como `LICENCAS.txt`) e o LEIA-ME com o iniciador.
4. Compacte a pasta em `.zip`. Para jogar, sirva a pasta `jogo/` por HTTP (por exemplo, `python3 -m http.server`) e abra no navegador.

## Estrutura
```
src/                 código do jogo
  game/scenes/       cenas Phaser (Boot, Preload, Menu, Vila, Boss, Portais, HQ, Créditos...)
  game/boss/         lógica e áudio da batalha do polvo
  game/data/         fases, falas, créditos (JSON)
public/assets/       artes, sprites, músicas e efeitos usados pelo jogo
tools/               scripts (normalizar músicas a -16 LUFS, gerar créditos, assar o hub...)
testes/              scripts de QA automatizados (Playwright)
docs/                planejamento, checklists e catálogo de músicas
android/             projeto Capacitor Android
LICENCAS.md          origem e licença de cada arte e música de terceiros
capacitor.config.json, vite.config.js, package.json
```

## Licenças
Os assets de terceiros (músicas e efeitos, CC0/CC-BY) estão listados em `LICENCAS.md` e na tela de CRÉDITOS do jogo.
