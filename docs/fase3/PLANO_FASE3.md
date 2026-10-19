# Fase 3: Chegada à Ilha (praia → floresta → cachoeira → ruínas → caverna)

A Fase 3 é um side-scroller longo e contínuo. O mapa parece uma única panorâmica, mas é dividido em **chunks** de 1920 px que só são montados perto da câmera. Ele tem entre 40.000 e 55.000 px no total e, com os segredos, rende 45 a 55 minutos de jogo.

- Referência visual: `docs/fase3/concept_base.png`. É só referência e não vai para o jogo.
- Lista de artes: `docs/fase3/ASSETS_FASE3.md`.

## Como testar
- **Pelo jogo:** Menu → PORTAIS (ou LISTA DE PORTAIS) → portal **"Ilha das Cavernas Azuis"** (Fase 3) → "▶ Jogar".
- **Direto, para desenvolvimento:**
  - `http://localhost:5173/?fase3` abre no último checkpoint.
  - `?fase3=novo` começa do início, com a chegada calma.
  - `?fase3=A2`, `?fase3=B0` ou `?fase3=C0` abre no checkpoint indicado (`A0`–`A3`, `B0`–`B3`, `C0`–`C3`).
- **Atalhos dentro da fase:**
  - **H** mostra as hitboxes.
  - **1 a 8** levam aos primeiros checkpoints (`A0`–`A3` e `B0`–`B3`).
  - **F** mostra o FPS.
  - **M** liga ou desliga o mudo.
  - **Esc/P** pausa, com CONTINUAR, MENU PRINCIPAL e SOM.

## Controles
| Ação | Teclado | Gamepad | Toque (celular) |
|---|---|---|---|
| Andar | ← → ou A D | direcional / analógico | ◀ ▶ |
| Correr | Shift | LB / LT (ou analógico no fim) | automático |
| Pular (altura variável) | Espaço, ↑ ou W | A | ⤒ |
| Agachar / engatinhar | ↓ ou S | ↓ | ▼ |
| Lançar concha | J ou X | X | botão 🐚 (toque curto) |
| Latido do Faísca (segurar ~1,5 s e soltar) | K ou C | Y / RB / RT | botão 🐚 (segurar) |
| Pausa | Esc ou P | Start | ⏸ |

## Setores (A–O)
| Setor | Nome | Jogabilidade | Duração | Status |
|---|---|---|---|---|
| A | Praia da Chegada | tutorial + caranguejos | 3–4 min | ✅ **concluído e testado** (Passos 0 e 1, arte provisória) |
| B | Costão Rochoso | saltos e pedras | 3 min | ✅ **concluído e testado** (Passo 2, arte provisória) |
| C | Floresta Inicial | macacos | 4 min | ✅ **concluído e testado** (Passo 3, arte provisória) |
| D | Seu Toninho | corda (`helpZoneToninho`) | 3 min | ⏭️ **próximo passo (Passo 4)** |
| E | Mata Densa | combate + plataforma | 4 min | planejado |
| F | Marina | plataforma móvel (caixa) | 3 min | planejado |
| G | Desfiladeiro | verticalidade | 5 min | planejado |
| H | Júlia | flashes e macacos | 4 min | planejado |
| I | Riacho / Lucas | plataformas na água | 4 min | planejado |
| J | Cachoeira | exploração | 4 min | planejado |
| K | Gruta Secreta | opcional | 2–4 min | planejado |
| L | Bia | rota secreta | 3 min | planejado |
| M | Copas Altas | desafio maior | 5 min | planejado |
| N | Ruínas | exploração / mistério | 3 min | planejado |
| O | Entrada da Caverna | encerramento | 2 min | planejado |

### Passo 0 (Base) + Passo 1 (Setor A — Praia da Chegada): concluídos ✅
- Motor da Fase 3 completo (`Fase3Scene`, `ChunkManager`, `Backdrop` + `Fase3Camera`, `Sofia`, `Faisca`, `Crab`, `Fase3Input`, `Fase3Audio`, `Fase3Assets`, `Fase3Loader`, `Fase3Placeholders`) e portal **"Ilha das Cavernas Azuis"** aberto no menu de portais (`▶ Jogar`).
- 7.680 px em 4 chunks (`A0`–`A3`) e 4 checkpoints.
- 21 conchas e 1 concha dourada (vale 5). As conchas vão para a carteira `farol-conchas-v2` e servem para os portais.
- 7 caranguejos patrulhando com aviso (`!`), garras levantadas, bote e derrota cartoon.
- 1 segredo: a toca embaixo do morro de pedra. O Faísca fareja a entrada e é preciso agachar para entrar.
- 1 poça de maré. Cair nela faz voltar para a beira.
- Dicas curtas no rodapé. Elas mudam conforme o controle usado (teclado, gamepad ou toque).

### Passo 2 (Setor B — Costão Rochoso): concluído ✅
- 7.680 px adicionais em 4 chunks (`B0`–`B3`, 15.360 px acumulados) e 4 checkpoints (`B0`–`B3`).
- Transição contínua `A3` → `B0` com crossfade suave de parallax em `Backdrop.js` (árvores da praia → paredões rochosos do costão).
- Plataformas estreitas de pedra molhada (`ledge`) e **plataformas que tremem e desmoronam após pisadas** (`crumble`), reconstruindo-se após ~2,6 s.
- Fendas de maré com ondas batendo nas pedras (`waveHits` + `rockWaveSpray`) e água escorrendo pelas rochas molhadas (`trickles`).
- Caranguejos em posições altas (sobre blocos rochosos), 21 conchas + 1 concha dourada (`f3B-G1`) num esconderijo sob o penhasco (`fenda-costao`).

### Passo 3 (Setor C — Floresta Inicial + Macacos): concluído ✅
- 7.680 px adicionais em 4 chunks (`C0`–`C3`, mapa total atual: 23.040 px) e 4 checkpoints (`C0`–`C3`).
- Transição contínua `B3` → `C0` do costão rochoso para a mata costeira, com parallax de árvores altas e copa em primeiro plano (`C3`, `C5`) + tiles de grama da mata (`C_sand_top`, `C_sand_fill`), galhos (`C_log`), árvores (`tree`), samambaias (`fern`) e raízes (`roots`).
- Novo inimigo **Macaco** (`src/game/fase3/Macaco.js`): fica em galho ou plataforma alta, observa a Sofia (`watch`), pega uma pedra (`pick`), levanta o braço dando aviso claro (`aim` + `!`), marca no chão uma **sombra onde a pedra vai cair** (`createRockShadow`) e arremessa a pedra em arco parabólico (`throw` → `spawnMonkeyRock`) seguida de risada (`laugh`).
- Pode ser atordoado (`hurt` → `stun` com estrelinhas girando) com 1 concha e derrotado (`defeat` cartoon) com a 2ª concha ou pelo latido especial do Faísca. Quando há um macaco num galho alto à frente, o arremesso de concha da Sofia ajusta automaticamente o arco para cima.
- 6 macacos em galhos altos, 2 caranguejos na entrada da mata, 21 conchas + 1 concha dourada (`f3C-G1`) num esconderijo sob as raízes (`raizes-floresta`).
- Placa `"Continua…"` posicionada no fim do Setor C (`C3`).

## Arquitetura (código em `src/game/fase3/` + `src/game/scenes/Fase3Scene.js`)

| Arquivo | O que faz |
|---|---|
| `scenes/Fase3Scene.js` | Cena `fase3`. Junta tudo: colisões, HUD (conchas e medidor do latido), dicas, pausa, checkpoints, respawn, água e fim do setor. |
| `fase3/Fase3Assets.js` | **Manifesto único de arte**: nomes de arquivo, tamanhos, grades e animações. Trocar arte = mexer só aqui (ou nem isso, se o nome e a grade forem iguais). |
| `fase3/Fase3Loader.js` | Carrega só os arquivos que existem (pelo `public/assets/files.json`) e gera os provisórios que faltam. |
| `fase3/Fase3Placeholders.js` | Arte provisória desenhada em código (Canvas 2D), com as mesmas chaves e quadros da arte final. |
| `fase3/sectors/setorA.js` | **Dados** do Setor A (Praia da Chegada). |
| `fase3/sectors/setorB.js` | **Dados** do Setor B (Costão Rochoso): fendas no mar, lajes que desmoronam, ondas nas pedras e caranguejos no alto. |
| `fase3/sectors/setorC.js` | **Dados** do Setor C (Floresta Inicial): árvores, galhos altos, esconderijo nas raízes e 6 macacos. |
| `fase3/sectors/index.js` | Lista A–O e `assembleLevel()`, que encaixa os setores em sequência (soma o x de cada um). |
| `fase3/ChunkManager.js` | Monta e desmonta chunks perto e longe da câmera. Camadas: colisão (`solids`, `oneway`), plataformas instáveis (`crumbles`), rochas molhadas (`trickles`), ondas (`waveHits`), interação, inimigos (`crabs`, `monkeys`), segredo e decor. |
| `fase3/Backdrop.js` | Parallax de 7 camadas com crossfade por setor, água animada (3 faixas de crista, brilho especular, ondas na areia, espuma), gaivotas e poeira. Também tem a **câmera** (`Fase3Camera`). |
| `fase3/Sofia.js` | Física da Sofia: aceleração, coyote time de 120 ms, jump buffer de 120 ms, pulo variável, correr, agachar (com teto) e dano com recuo. Os números ficam em `SOFIA_TUNING`. |
| `fase3/Faisca.js` | IA do Faísca: segue, para, pula obstáculos e vãos, sobe em plataformas, rosna para inimigos, fareja segredos e reaparece atrás da Sofia quando se perde. Não colide com ela. |
| `fase3/Crab.js` | Caranguejo: patrulha → "!" → garras para cima → avanço → recupera. Tem 2 vidas; a derrota é em estilo cartoon. |
| `fase3/Macaco.js` | Macaco: fica em galho alto (`idle` → `watch` → `pick` → `aim` → `throw` → `laugh`), marca sombra no chão e lança pedra em arco. Tem 2 vidas (`hurt` → `stun` → `defeat`). |
| `fase3/Fase3Input.js` | Teclado, gamepad e toque. Inclui o texto das dicas por controle. |
| `fase3/Fase3Audio.js` | Latido, carga, arremesso, golpe, pedra rachando/desmoronando e sons do macaco sintetizados, pelo barramento de EFEITOS (respeitam a tela SOM). |

### Resolução
O jogo inteiro já roda em 1920×1080 lógico (Phaser `Scale.FIT`), então a Fase 3 usa a mesma configuração, sem escala própria. O "zoom de vista" é um zoom suave da câmera para 0,94 nos trechos marcados em `vistas`.

### Formato do chunk
Cada chunk é um objeto dentro de `chunks: [...]` do setor. As coordenadas são **locais do setor**, com x começando em 0, e todos os campos são opcionais:
```js
{ id: "C0", x0: 0, x1: 1920,
  ground:     [{ x, w, y?, tiles: "sand" | "rock" }],      // chão sólido até o fundo
  blocks:     [{ x, y, w, h, tiles: "rock", wet? }],       // bloco sólido (wet = água escorrendo)
  platforms:  [{ x, y, w, kind: "log" | "ledge" | "crumble", crumble? }], // mão única / desmorona
  water:      [{ x, w, y, respawn: { x, y } }],             // cair = volta ao respawn
  waveHits:   [{ x, y, phase? }],                           // onda batendo na pedra (espuma)
  decor:      [{ kind, x, y, scale?, flip?, front? }],      // props do tileset, sem colisão
  shells:     [{ id: "f3C-01", x, y, gold? }],              // id ÚNICO (vai para a carteira)
  enemies:    [{ type: "crab" | "monkey", x, y?, minX, maxX }],
  checkpoints:[{ id: "C0", x }],
  hints:      [{ id, x, text: "{jump} para pular" }],       // tokens: {move} {run} {jump} {attack} {special} {down}
  secrets:    [{ id, sniffX, zone: {x,y,w,h}, cover: {x,y,w,h} }],
  triggers:   [{ id, x, y, w, h, event: "end" | "helpZoneToninho" }],
  vistas:     [{ x0, x1, zoom: 0.94 }] }
```

### Onde trocar a arte
- Solte o PNG em `public/assets/farol/fase3_ilha/...` com o nome do `ASSETS_FASE3.md`.
- Rode `node list_assets.mjs` e recarregue.
- Se a grade for outra, ajuste `frameWidth`, `frameHeight`, `anims` e `body` em `Fase3Assets.js`. Nada mais muda.

### Save
- `farol-fase3` (localStorage) guarda `{ cp, setorA, setorB, setorC }`: o último checkpoint e os setores concluídos.
- As conchas usam a carteira normal (`farol-conchas-v2`), com ids `f3A-..`, `f3B-..`, `f3C-..`.
- O `resetAll()` da carteira ainda **não** apaga o `farol-fase3`. Para zerar, apague essa chave no DevTools ou use `?fase3=novo`.

## Próximo marco: Passo 4 — Setor D (Seu Toninho e a corda)
- Parede alta que a Sofia não alcança sozinha.
- Quando ela entra em `helpZoneToninho`, o Seu Toninho aparece no topo, acena, joga uma corda e faz sinal de positivo (`idle`, `wave`, `throwRope`, `thumbsUp`).
- A Sofia sobe pela corda (estados `climb_idle` e `climb` da Sofia ativados na corda) e segue caminho.
- A placa `"Continua…"` sai do fim do C e vai para o fim do D.
