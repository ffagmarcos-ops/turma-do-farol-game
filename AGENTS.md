# Regras para agentes de IA: Turma do Farol (Phaser 3 + Vite + Capacitor)

Leia o **GUIA_CONTINUIDADE.md** antes de mudar qualquer coisa. Responda e comente em **português do Brasil**.

## Trabalho
- **Mudanças pequenas e focadas.** Corrija só o que foi pedido. Não refatore, não renomeie arquivos, não troque bibliotecas nem a versão do Phaser.
- Ache a **causa** antes de corrigir e explique em 1-3 frases. Mostre o diff.
- Trabalhe num **branch** (`git checkout -b ...`). Faça um commit por passo que funcionou, com mensagem clara em pt-BR.
- Teste no `npm run dev` antes de dizer que terminou e diga ao usuário **como testar** (o que clicar e o que deve acontecer).
- Não invente fatos da HQ, dos personagens ou das licenças. Pergunte.

## Nunca
- **Nunca apague** builds, artes originais, `public/assets/` existentes ou arquivos do Drive. Substitua uma arte só com o **mesmo nome** e depois de confirmar.
- **Nunca comite** keystores (`*.jks`, `*.keystore`), senhas, tokens, `.env`, `node_modules/`, `dist/`, `android/app/build/`, `android/app/src/main/assets/public/`, APKs ou zips.
- **Nunca rode** `tools/otimizar_assets.py` em `public/` (só na cópia do Android).
- Nunca faça `git push --force`, `reset --hard` em commits publicados nem apague branches sem pedido explícito.
- Nunca adicione asset de terceiros sem **licença CC0 comprovada** (link e prova da licença). Licença duvidosa: não usa.

## Regras do jogo (não mudar sem pedido do Marcos)
- Vida infinita, **sem game over**. Fase 2 = tempestade no mar **sem farol**.
- Quadros da HQ: tela cheia na moldura, **sem cortar**, diálogo no topo, **sem "pág. X"**. Menu com o quadro da pág. 09.
- 120 conchas (12 douradas). Portais custam conchas (tabela em `src/game/systems/Wallet.js`). Confirmação com foco em **"Agora não"** e "Abrir" segurando 0,6 s no toque.
- Músicas CC0 normalizadas a **-16 LUFS** (`tools/normalizar_musicas.py`). Fase 2: orquestra tensa a ≤ 28% e música abaixo dos efeitos (`docs/MIXAGEM_FASE2.md`).
- Marina: **hitbox fixa 106×234** e escala 1,32 do sheet base. Para trocar andar/correr/pulo, use `tools/integrar_marina_v2.py`. Não edite quadros à mão no código.
- Identidade: a ficha da HQ vence o prompt. Faísca sempre em 4 patas, nenhum texto nas artes, um farol só.

## Licenças e créditos
- Todo asset de terceiros vai em `LICENCAS.md` (arquivo, fonte, autor, licença). Depois rode `python tools/gerar_creditos.py`.

## Build (só quando pedirem)
- `android/app/build.gradle`: **versionCode +1** (o último publicado é 17 = 3.6) e versionName novo.
- `npm run build` → `npx cap sync android` → `python tools/otimizar_assets.py android/app/src/main/assets/public` → `cd android && gradlew assembleDebug`. O APK precisa ficar **< 70 MB**.
- Zip PC: `python tools/montar_zip_pc.py <zipN> <apkX.Y>`.
- Nome dos arquivos: `TurmaDoFarol_VilaDasConchas_v<X.Y>.apk` e `..._v<N>.zip`. Sobem para o Drive **sem apagar** os antigos.
- O APK é assinado com chave de **debug**. Não existe keystore de release no repo (veja o guia, seção 5.1).
