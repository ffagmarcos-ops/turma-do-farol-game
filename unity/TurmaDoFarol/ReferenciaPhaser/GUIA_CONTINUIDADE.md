# Guia de continuidade: Turma do Farol, O Mistério da Ilha do Farol

> Para o **Marcos** e para **qualquer agente de IA** (Google Antigravity, Gemini, etc.) que continuar o jogo.
> Estado em **19/10/2026**: versão **3.6** (APK versionCode 17) e zip PC **v16**.
> As regras curtas e obrigatórias para IAs estão em [`AGENTS.md`](AGENTS.md), que o Antigravity carrega sozinho.

---

## 1. Visão geral

Jogo 2D de plataforma e aventura, baseado na HQ *O Mistério da Ilha do Farol*. Público infantojuvenil, em português, para celular (Android) e PC (navegador).

| Parte | Conteúdo |
|---|---|
| **Intro (HQ)** | Sequência de quadros da HQ. É longa na 1ª vez e pode ser pulada nas próximas. |
| **Fase 1: Vila das Conchas** | Marina segue a Faísca pela vila até o Cais e o Grande Píer. Ela fala com Júlia, Lucas, Bia e Seu Toninho, acha o artefato na rede e sobe no barco Esperança. São **120 conchas**, sendo **12 douradas** (secretas). |
| **Transição (HQ)** | Quadros da HQ entre a Fase 1 e a Fase 2. |
| **Fase 2: O Polvo Gigante** | Batalha de chefe no mar aberto, em tempestade, no barco Esperança. Lucas usa o aparelho sônico contra os tentáculos. |
| **Portais (hub)** | Corredor com 14 portais. As conchas da carteira abrem fases, curiosidades e extras. |
| **Curiosidades** | 3 cartas por portal: quadro da HQ, "Você sabia?" e um extra interativo (álbum, mapa, lente, nós etc.). |
| **Créditos / SOM** | Créditos gerados do `LICENCAS.md`. A tela SOM tem volume de música, volume de efeitos e mudo. |

---

## 2. Stack

- **Phaser 3.90** (motor do jogo). Canvas lógico de **1920×1080**, escalado na tela.
- **Vite** (dev server e build web) → `dist/`.
- **Capacitor 6** (empacota o `dist/` como app Android). App id **`com.turmadofarol.vila`**. minSdk 22, targetSdk 34.
- **Web Audio** via `AudioManager` (barramentos de música, ambiente, efeitos e UI, mais um limitador no master).
- **Python 3** + Pillow + ffmpeg para as ferramentas de arte e áudio (`tools/`).
- Testes automáticos opcionais: **Playwright** (Python), em `testes/`.

---

## 3. Instalação no Windows

1. **Git**: https://git-scm.com/download/win (aceite as opções padrão).
2. **Node.js 20 LTS**: https://nodejs.org. Confira com `node -v` e `npm -v`.
3. **Python 3.12+**: https://python.org. Marque "Add to PATH". Depois rode `pip install pillow numpy`.
4. **ffmpeg** (só para áudio): `winget install Gyan.FFmpeg`. Confira com `ffmpeg -version`.
5. **Android Studio** (só para gerar APK): https://developer.android.com/studio
   - Ele já traz o **JDK 17** (JBR). No Android Studio, abra *SDK Manager* e instale **Android SDK Platform 34** e **Build-Tools 34**.
   - Variáveis de ambiente (Painel de Controle → Sistema → Variáveis):
     - `JAVA_HOME = C:\Program Files\Android\Android Studio\jbr`
     - `ANDROID_HOME = %LOCALAPPDATA%\Android\Sdk`
6. Clone o repositório:
   ```bat
   git clone https://github.com/ffagmarcos-ops/turma-do-farol-game.git
   cd turma-do-farol-game
   npm install
   ```

## 4. Rodar em desenvolvimento

```bat
npm run dev
```
Abra o endereço que aparecer (em geral http://localhost:5173). Atalhos úteis:
- `?boss=0` (ou `?boss=1`, `?boss=2`...) abre direto a Fase 2 no segmento indicado.
- `?play` ou `?qa` abre direto a Fase 1.
- No jogo: **F** mostra o FPS, **H** mostra as hitboxes, **1 a 5** teleportam pela Fase 1 (Entrada, Júlia, Lucas, Bia, Toninho), **Esc/P** pausa, **M** liga/desliga o mudo.
- Para "zerar" o save, abra o DevTools (F12) → Application → Local Storage → apague as chaves `farol-*`.

---

## 5. Gerar o APK (passo a passo)

```bat
:: 1) ajuste a versão em android\app\build.gradle
::      versionCode 18        (número inteiro; SEMPRE +1 a cada APK)
::      versionName "3.7"
:: 2) build web + cópia para o Android
npm run build
npx cap sync android
:: 3) processo LEVE (mantém o APK < ~70 MB; demora 8-15 min)
python tools\otimizar_assets.py android\app\src\main\assets\public
:: 4) compilar
cd android
gradlew.bat clean assembleDebug
:: APK: android\app\build\outputs\apk\debug\app-debug.apk
```
- Renomeie o arquivo para `TurmaDoFarol_VilaDasConchas_v3.7.apk` e suba para o Drive (seção 13). Tamanho esperado: **~63 MB**.
- **Por que o processo leve:** sem ele o APK passa de 100 MB (a v2.1 tinha 100 MB). O script converte PNG/JPG grandes para WebP e MP3/OGG grandes para OGG 96k **mantendo os nomes**, então o código não muda.
- Ele só mexe na **cópia** do Android. **Nunca** rode no `public/`, onde ficam os originais.
- Confira a versão do APK com `aapt dump badging app-debug.apk`. O `aapt` fica em `%ANDROID_HOME%\build-tools\34.x\`.

### 5.1 Assinatura e keystore (IMPORTANTE)
- **Todos os APKs até a v3.6 são de DEBUG.** Eles foram assinados com a chave de debug padrão do Android, que ficou no computador de build da IA (`~/.android/debug.keystore`).
- **Não existe keystore de release.** Nenhum APK foi assinado para a Play Store.
- **A keystore NÃO está no repositório e nunca deve entrar.** O `.gitignore` bloqueia `*.jks`, `*.keystore`, `*.p12` e `*.pem`.
- **Consequência:** um APK que você gerar no seu PC sai assinado com a **sua** chave de debug, que é outra. O Android vai recusar instalar "por cima" da versão antiga (erro *"conflito de assinatura"* / *"app não instalado"*). Há duas saídas:
  1. **Mais simples:** desinstale o app antigo do celular e instale o novo. **O save do celular (conchas, portais) se perde**, porque fica no armazenamento do app.
  2. **Para manter o save:** use a mesma `debug.keystore` dos builds antigos. Peça ao assistente (Grok Bot): *"copie a debug.keystore do box para o meu Drive, numa pasta privada"*. Ele só faz isso sob pedido explícito. Depois coloque o arquivo em `C:\Users\<você>\.android\debug.keystore` (substituindo o seu) antes de rodar o `gradlew`.
- **Para publicar na Play Store** (futuro), crie uma keystore de **release** sua e guarde em 2 lugares seguros (fora do Git):
  ```bat
  keytool -genkeypair -v -keystore turmadofarol-release.jks -alias farol -keyalg RSA -keysize 2048 -validity 10000
  ```
  - Gere um AAB pelo Android Studio (*Build → Generate Signed Bundle/APK*) ou configure `signingConfigs` no `build.gradle`, lendo as senhas de `android/keystore.properties`, que **não** vai para o Git.
  - Perdeu a keystore de release, perdeu o direito de atualizar o app na loja. Faça backup.

---

## 6. Gerar o zip PC

Depois do passo 3 do APK (a cópia otimizada precisa existir):
```bat
python tools\montar_zip_pc.py 17 3.7
:: -> ..\builds\TurmaDoFarol_VilaDasConchas_v17.zip  (~54 MB)
```
- O script copia `android/app/src/main/assets/public` para `jogo/` (sem `cordova*.js`).
- Também copia os arquivos de `pc_pacote/` (`LEIA-ME.txt`, `jogar.bat`, `servidor.ps1`, `jogar.command`) e o `LICENCAS.md` como `LICENCAS.txt`, e atualiza a linha de versão do LEIA-ME.
- Para jogar: extrair → `jogar.bat` (Windows) ou `jogar.command` (Mac/Linux). Isso sobe um servidor local na porta 8765. Abrir o `index.html` direto **não funciona**.

---

## 7. Mapa de pastas e código

```
src/main.js                 config do Phaser (1920x1080, fps alvo 60/mín 30) e lista de cenas
src/game/scenes/            cenas (abaixo)
src/game/systems/           sistemas reutilizáveis
src/game/boss/              tudo da Fase 2
src/game/entities/          Player.js (física/hitbox) e Marina.js (animações)
src/game/fx/                efeitos visuais (poeira, brilho, hit-stop)
src/game/data/              JSONs de fases, falas, créditos, curiosidades e sprites
public/assets/              ARTE E ÁUDIO ORIGINAIS (farol/, audio/, fontes)
tools/                      scripts Python de arte, áudio e build
pc_pacote/                  modelo do pacote PC (LEIA-ME, jogar.bat...)
testes/                     scripts de QA (Playwright); testes/box/ = os usados nas últimas versões
docs/                       planejamento (GDD), checklists, catálogo de músicas, mixagem da Fase 2
android/                    projeto Capacitor (só configuração; build/ e assets/public são gerados)
LICENCAS.md                 origem e licença de TODO asset de terceiros
```

### 7.1 Cenas (`src/game/scenes/`)
| Cena (chave) | Arquivo | O que faz |
|---|---|---|
| `boot` | BootScene.js | Carrega só a tela de loading (`loading_bg.jpg`). |
| `preload` | PreloadScene.js | **Loading** com barra. Carrega arte e áudio, cria as animações (incluindo as tiras HD da Marina em `addMarinaV2`) e decide a 1ª cena (`menu`, ou `vila`/`boss-polvo` pelos parâmetros de URL). |
| `menu` | MenuScene.js | Menu principal (fundo `menu_capa` = quadro da **página 09** da HQ, música Treasure Hunter). Botões: JOGAR, PORTAIS · saldo, LISTA DE PORTAIS (L), SOM (O), CRÉDITOS. |
| `intro-hq` | HQSeqScene.js | Intro em quadros da HQ (longa na 1ª vez: `vistos` sem `"intro"`). |
| `transicao-hq` | HQSeqScene.js | Quadros entre a Fase 1 e a Fase 2. |
| `vila` | VilaScene.js | **Fase 1.** Pausa (Esc/P/⏸) com CONTINUAR, MENU PRINCIPAL e SOM. |
| `boss-polvo` | BossScene.js | **Fase 2.** Pausa com Continuar, Reduzir flashes (L), MENU PRINCIPAL e SOM. |
| `portais` | PortaisScene.js | Hub de portais (andar) e modo lista. Compra com pergaminho de confirmação. |
| `curiosidade` | CuriosidadeScene.js | Cartas de cada portal. ✕/Esc volta ao hub. |
| `creditos` | CreditosScene.js | Rolagem dos créditos (`data/creditos.json`). |

Telas sobrepostas, que não são cenas:
- `systems/SoundOptions.js` → tela **SOM**.
- `systems/PauseMenu.js` → "Voltar ao menu principal?".
- `systems/HQPanel.js` → quadro de HQ dentro da moldura.

### 7.2 Arquivos-chave
- `systems/AudioManager.js`: música, ambientes e efeitos. Também cuida das preferências de volume (`setPrefs`) e do limitador. `useSceneMusic` troca a música por cena.
- `boss/BossAudio.js`: mixagem da Fase 2. Detalhes em `docs/MIXAGEM_FASE2.md`.
- `systems/Wallet.js`: carteira de conchas, **tabela de portais e preços** (`PORTAIS`), compras, "vistos".
- `systems/CheckpointSystem.js`: checkpoint da Fase 1.
- `systems/StoryDirector.js`: roteiro da Fase 1 (objetivos, falas, artefato).
- `systems/PlayerStateMachine.js` + `entities/Player.js` + `entities/Marina.js`: estados (IDLE/WALK/RUN/JUMP/FALL/LAND/CROUCH/INTERACT), física, hitbox fixa e animações.
- `data/castScale.js`: escala do elenco (humanos +32%, Faísca na altura do joelho).
- `data/fase1-vila.json`: mapa da Fase 1 (plataformas, 120 conchas, NPCs, física, áudio).
- `data/curiosidades.json`: textos das cartas dos portais.

### 7.3 Ferramentas (`tools/`)
| Script | Uso |
|---|---|
| `integrar_marina_v2.py` | Encaixa as tiras de 8 quadros do Daniel (andar/correr/pulo) na geometria da Marina: altura, linha do pé e tronco. Exemplos: `python tools/integrar_marina_v2.py walk <tira.png> --res 2` (HD 384×512) ou `jump <tira.png>`. Gera `public/assets/farol/chars/marina_<walk/run/jump>_v2.png`. O jogo lê o tamanho do quadro do próprio arquivo. |
| `gerar_conchas.py` | (Re)distribui as 120 conchas (12 douradas/secretas) no `fase1-vila.json`. |
| `gerar_creditos.py` | Gera `src/game/data/creditos.json` a partir do `LICENCAS.md`. **Rode sempre que mudar o LICENCAS.** |
| `assar_hub.py` | "Assa" (pré-compõe) os arcos dos portais do hub em imagens prontas (desempenho no celular). |
| `normalizar_musicas.py` | Normaliza as músicas a **-16 LUFS** (loudnorm em 2 passadas) e faz crossfade de 1 s no ponto de laço. Guarda os originais fora do jogo. |
| `gerar_placeholders_fase3.py` | Placeholders da Fase 3 / portais. |
| `otimizar_assets.py` | Processo leve do APK (seção 5). |
| `montar_zip_pc.py` | Zip da versão PC (seção 6). |

### 7.4 Chaves de save (localStorage)
| Chave | Conteúdo |
|---|---|
| `farol-conchas-v2` | **Carteira**: `carteira` (saldo), `ganhoTotal`, `run` (id da partida, conchas pegas `ids`, `bonusF2`), `portas` (portais abertos), `vistos` (intro, hub, cartas vistas...). |
| `farol-vila-das-conchas-v4` | Checkpoint e progresso da Fase 1 (`checkpointX` etc.). |
| `farol-fase2-done` | `"1"` quando a Fase 2 foi vencida (libera o portal do Polvo). |
| `farol-som` | `{music, sfx, muted}`: tela SOM. |
| `farol-reduce-flash` | Opção "Reduzir flashes" da Fase 2. |

---

## 8. Regras do jogo e decisões já tomadas (NÃO mudar sem o Marcos)

- **Vida infinita, sem game over.** Na Fase 2 a Marina/turma nunca "morre". O jogo recua/reinicia o trecho, sem tela de derrota.
- **Fase 2: tempestade no mar aberto, SEM farol** no cenário (o farol é único na história e não aparece ali).
- **Ilustrações da HQ em tela cheia**, dentro da moldura (`carta_moldura`) e **sem cortar** a arte. A **caixa de diálogo fica no topo**. **Sem rótulos de página** ("pág. X") nos quadros.
- **Fundo do menu = quadro da página 09** da HQ.
- **120 conchas** na Fase 1, sendo **12 douradas** (secretas). As conchas vão para a carteira, que é gasta nos portais.
- **Preços dos portais** (`systems/Wallet.js`):

  | Portal | Tipo | Preço |
  |---|---|---|
  | Vila das Conchas | Fase | grátis |
  | Mar Aberto: o Polvo | Fase | grátis, requer terminar a Fase 1 |
  | Marina Torres | Curiosidade | 15 |
  | Faísca | Curiosidade | 25 |
  | Bia Oliveira | Curiosidade | 35 |
  | Júlia Costa | Curiosidade | 45 |
  | Lucas Nogueira | Curiosidade | 55 |
  | Seu Toninho Marinho | Curiosidade | 65 |
  | A Vila das Conchas | Ilha | 75 |
  | O Barco Esperança | Universo | 85 |
  | O Farol | Ilha | 95 |
  | O Polvo Gigante | Universo | 110, requer vencer a Fase 2 |
  | As Cavernas Azuis e o Artefato | Universo | 125 |
  | Bastidores da HQ | Extra | 130 |
  | Ilha das Cavernas Azuis | Fase 3 | "Em breve" |
- **Confirmação de compra:** o pergaminho abre com o foco em **"Agora não"** (padrão seguro). No toque/mouse, **"Abrir" exige segurar 0,6 s**, e um anel vai enchendo.
- **Intro longa na 1ª vez que joga**. Nas próximas ela é curta/pulável.
- **Música** (todas CC0, todas normalizadas a **-16 LUFS**):

  | Onde | Faixa | Autor |
  |---|---|---|
  | Menu | Treasure Hunter (laço com crossfade de 1 s) | TAD |
  | Hub dos portais | Mystical Enigmatic | CleytonKauffman |
  | Fase 1 | `music_vila.mp3` (ducking 0,35 nos diálogos) | — |
  | Fase 2 | abertura + `bgm_boss` | — |
  | Fase 2, polvo com ≤ 28% de vida (até o fim) | **Pirate's Orchestra** | Dizzy Crow |

  - A faixa curta "Pirate Indenture" foi **removida** por decisão do Marcos.
  - Na fúria final (≤ 5%) só entra um tambor grave **sintetizado no código**, no tempo da orquestra (~72 bpm).
- **Mixagem da Fase 2** (`docs/MIXAGEM_FASE2.md`):
  - A música fica em ~-20 LUFS, **abaixo** dos efeitos.
  - A troca para Pirate's Orchestra é um crossfade de 4 s em curva seno/cosseno.
  - Tem limitador no master. A chuva e o mar ficam bem baixos.
- **Animações da Marina:**
  - Idle, agachar e interagir vêm do `marina_sheet_1536.png` (quadros de 192×256, escala 1,32).
  - **Andar e correr são HD** (tiras de 384×512, desenhadas a 0,66). O **pulo é a v2** do Daniel: quadros 1-3 subida, 4-5 ápice e queda, 6-7 aterrissagem.
  - A hitbox é **fixa** (106×234) em todos os estados.
  - **Para trocar a arte**, salve a nova tira (8 quadros numa linha, qualquer resolução) e rode `integrar_marina_v2.py walk|run|jump <arquivo> [--res 2]`. Não precisa mudar código.
  - O passo acompanha a velocidade real (`timeScale` = velocidade ÷ walk/runSpeed).

---

## 9. Regras de arte e licenças

- **Só CC0** (ou arte própria/gerada para o projeto). **Nada com licença duvidosa**: sem página de licença clara, não entra.
  - Exemplo: os latidos gravados ficaram de fora e o latido da Faísca é sintetizado.
- **Todo asset de terceiros vai no `LICENCAS.md`**: arquivo, link da fonte, autor e licença. Guarde a prova da licença, como a página salva ou um print.
  - Depois rode `python tools/gerar_creditos.py` para atualizar a tela CRÉDITOS.
- **Identidade visual (a ficha da HQ vence o prompt):**
  - Marina: sobrecamisa laranja, bússola no cinto, cabelo castanho cacheado volumoso.
  - Lucas: camiseta azul-marinho.
  - Júlia: locs finas e bandana amarela.
  - Bia: jardineira verde-sálvia, chapéu de palha e pingente de concha (só ela usa).
  - Toninho: lenço vermelho-alaranjado.
  - Faísca: coleira azul com estrela dourada, **sempre em quatro patas**, sem gesto humano.
- **Nenhum texto dentro das artes.** O barco Esperança e o porto não mudam. Existe **um farol só**, que nunca se repete.
- Estilo: cartoon 2D infantojuvenil pintado à mão, contorno limpo, soft cel shading. **Sem** 3D, pixel art ou visual Pixar.
- **O polvo (Fase 2) foi gerado no ChatGPT** e é arte do projeto. Mantenha o mesmo design ao pedir variações.

## 10. Pipeline de arte

1. **Gerar** no ChatGPT (ou Gemini), sempre anexando as fichas/referências da HQ. Peça PNG com fundo transparente e uma imagem por vez.
   - Para spritesheets, peça a grade exata (por exemplo, 8 quadros de 192×256 numa linha, pés na mesma linha).
   - Os prompts antigos e as regras estão no repositório de trabalho (`arte_gpt/PEDIDOS.md` e `REVISAO_DANIEL.md`, fora deste repo).
2. **Curadoria** (Daniel/Marcos): conferir identidade, braços e pés cortados, quadros repetidos, alinhamento da cabeça e do tronco entre os quadros (balanço ≤ ~3 px) e pés na mesma linha.
3. **Integração** com os scripts: `integrar_marina_v2.py` (Marina), `assar_hub.py` (hub), `normalizar_musicas.py` (áudio). Arte nova vai em `public/assets/farol/...` com o **mesmo nome** do arquivo que substitui.
4. **Testar** no `npm run dev`. Depois **LICENCAS.md + gerar_creditos.py** (se for de terceiros), commit e build.

## 11. Problemas conhecidos e backlog

- **Assinatura:** só existem APKs de debug, e não há keystore de release (seção 5.1).
- **`pc_pacote/LEIA-ME.txt` está desatualizado** no texto do objetivo: ainda fala em "20 conchas" e "a concha dourada no Mercado". O certo é 120 conchas e 12 douradas. Os controles também mudaram: SOM no menu e O/M.
- **Fase 3 (Ilha das Cavernas Azuis):** só o portal "Em breve". A fase não existe.
- **Textos das curiosidades** (`data/curiosidades.json`) são **propostas** ainda à espera da aprovação final do Marcos.
- **Corrida HD:** o tronco varia ~12 px entre quadros por causa da inclinação. É aceitável, mas pode ser alinhado pelo Daniel.
- **Músicas pendentes** (GDD): Mistério, Mar, Caverna e Fuga, todas a produzir.
- **Em PC fraco ou em teste automático com FPS baixo**, cliques muito rápidos em botões podem falhar (segurar funciona).
- **Os testes em `testes/`** usam portas e caminhos do computador de build antigo (8099/8111, `/tmp`). Ajuste `PORT` e caminhos antes de usar. Precisam de `pip install playwright` e `playwright install chromium`.

## 12. Histórico de versões

Todas as builds estão na pasta do Drive **`1kbpjxqSg9dn0mYr7wGOLp-2U0cdkGXMM`**: https://drive.google.com/drive/folders/1kbpjxqSg9dn0mYr7wGOLp-2U0cdkGXMM

**Nunca apague builds antigas.**

| APK | Zip PC | Principais mudanças |
|---|---|---|
| 1.x | v1 a v7 | Fase 1 (Vila das Conchas) e polimentos. |
| 2.0 | v8 | Grande atualização de arte e conteúdo; 87 MB. |
| 2.1 / 2.1b | v9 | Correções; o 2.1 chegou a 100 MB e o 2.1b introduziu o processo leve (39 MB). |
| 3.0 | v10 | Portais (cenas 22 a 26), CRÉDITOS, artes das curiosidades (27 a 33), menu da pág. 09. |
| 3.1 | v11 | Hub com arcos assados, lista de portais no menu, pausa com "Voltar ao menu", tela de loading, HQ dentro da moldura sem rótulos, ajustes de sprite da Marina. |
| 3.2 | v12 | Todas as músicas a -16 LUFS; Treasure Hunter com crossfade; Pirate's Orchestra como faixa tensa; licença CC0 da Mystical confirmada. |
| 3.3 | v13 | Mixagem da Fase 2 (limitador, tambor no tempo, crossfade suave); tela SOM; ciclo de passo da Marina. |
| 3.4 | v14 | Marina HD (andar/correr) + pulo v2; escala e hitbox por resolução. |
| 3.5 | v15 | Andar HD com cabeça e tronco alinhados (sem balanço). |
| 3.6 | v16 | ✕/Esc das curiosidades e da entrada dos portais voltam a funcionar (flag `leaving` presa). |

O versionCode da 3.6 é 17. **O próximo APK deve ser versionCode 18.**

## 13. Fluxo seguro com o Antigravity (ou qualquer IA)

1. **Uma mudança pequena por vez.** Peça uma coisa só ("o botão X não fecha"), não dez.
2. **Antes de começar:** `git pull`, e depois `git checkout -b ajuste-nome-curto`. Trabalhe num **branch**, nunca direto no `main`.
3. **Teste no dev** (`npm run dev`) no navegador e, se possível, no celular pela rede (`npm run dev -- --host`).
4. **Commit a cada passo que funcionou:** `git add -A` e depois `git commit -m "o que mudou"`. Se quebrar, `git checkout .` volta ao último commit.
5. Quando estiver bom, faça o merge no main e o push:
   ```bat
   git checkout main
   git merge ajuste-nome-curto
   git push
   ```
6. **Build só depois de testar.** Suba a versão (versionCode +1). Suba APK e zip para o Drive com **nome novo**, **sem apagar** os antigos.
7. **Revise o que a IA mudou** (`git diff`) antes do commit. Desconfie de mudanças grandes em arquivos que você não pediu.
8. **Nunca** comite keystore, senhas, tokens, `node_modules`, `dist`, APKs ou zips (o `.gitignore` já bloqueia).

## 14. Como pedir para a IA (exemplos de prompt)

Dê **contexto, o que quer, o critério de pronto e o que não pode mudar**:

> Leia o AGENTS.md e o GUIA_CONTINUIDADE.md. Na Fase 1 (`src/game/scenes/VilaScene.js`), a Marina atravessa a rede do cais em vez de ter que agachar. Ache a causa, corrija só isso, não mexa na física geral nem na hitbox (106×234). Me diga como testar no `npm run dev`.

> Quero trocar a música do hub por `nova_musica.ogg` (CC0, link: …). Normalize a -16 LUFS com `tools/normalizar_musicas.py`, atualize o LICENCAS.md e rode `tools/gerar_creditos.py`. Não mude outras músicas.

> O Daniel mandou `marina_walk_v3.png` (8 quadros de 384×512). Integre com `python tools/integrar_marina_v2.py walk arte/marina_walk_v3.png --res 2` e confira no dev se os pés ficam no chão e se não há tremida.

> Prepare o APK 3.7: versionCode 18, versionName "3.7". Siga a seção 5 do guia (com o otimizar_assets.py) e o zip PC v17 (seção 6). Não apague nada.

> Explique, sem mudar código, como funciona a compra de portais (`systems/Wallet.js` e `PortaisScene.js`).

Dicas:
- Peça para a IA **mostrar o diff** e **explicar a causa** antes de aplicar.
- Se ela propuser "refatorar tudo", diga **não**: o jogo funciona, o objetivo é mudar pouco.
- Peça um passo de teste concreto ("o que eu clico para ver que funcionou?").
