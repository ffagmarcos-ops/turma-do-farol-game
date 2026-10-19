# Fase 3: Chegada à Ilha (praia → floresta → cachoeira → ruínas → caverna)

A Fase 3 é um side-scroller longo e contínuo. O mapa parece uma única panorâmica, mas é dividido em **chunks** de 1920 px que só são montados perto da câmera. Ele tem entre 40.000 e 55.000 px no total e, com os segredos, rende 45 a 55 minutos de jogo.

- Referência visual: `docs/fase3/concept_base.png`. É só referência e não vai para o jogo.
- Lista de artes: `docs/fase3/ASSETS_FASE3.md`.

## Como testar
- **Pelo jogo:** Menu → PORTAIS (ou LISTA DE PORTAIS) → portal **"Ilha das Cavernas Azuis"** (Fase 3) → "▶ Jogar".
- **Direto, para desenvolvimento:**
  - `http://localhost:5173/?fase3` abre no último checkpoint.
  - `?fase3=novo` começa do início, com a chegada calma.
  - `?fase3=A2` abre no checkpoint A2. Também valem A0, A1 e A3.
- **Atalhos dentro da fase:**
  - **H** mostra as hitboxes.
  - **1 a 4** levam aos checkpoints A0 a A3.
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
| B | Costão Rochoso | saltos e pedras | 3 min | ⏭️ **próximo passo (Passo 2)** |
| C | Floresta Inicial | macacos | 4 min | planejado |
| D | Seu Toninho | corda (`helpZoneToninho`) | 3 min | planejado |
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
- No fim do setor aparece a placa "Continua…", com as opções EXPLORAR MAIS e MENU PRINCIPAL.
- Validado com `npm run build` e no navegador (`localhost:5173`): Fases 1 e 2 funcionando normalmente e Fase 3 abrindo pelo menu de portais sem erros.

## Arquitetura (código em `src/game/fase3/` + `src/game/scenes/Fase3Scene.js`)

| Arquivo | O que faz |
|---|---|
| `scenes/Fase3Scene.js` | Cena `fase3`. Junta tudo: colisões, HUD (conchas e medidor do latido), dicas, pausa, checkpoints, respawn, água e fim do setor. |
| `fase3/Fase3Assets.js` | **Manifesto único de arte**: nomes de arquivo, tamanhos, grades e animações. Trocar arte = mexer só aqui (ou nem isso, se o nome e a grade forem iguais). |
| `fase3/Fase3Loader.js` | Carrega só os arquivos que existem (pelo `public/assets/files.json`) e gera os provisórios que faltam. |
| `fase3/Fase3Placeholders.js` | Arte provisória desenhada em código (Canvas 2D), com as mesmas chaves e quadros da arte final. |
| `fase3/sectors/setorA.js` | **Dados** do Setor A: chão, blocos, plataformas, água, conchas, inimigos, checkpoints, dicas, segredos, gatilhos e vistas. |
| `fase3/sectors/index.js` | Lista A–O e `assembleLevel()`, que encaixa os setores em sequência (soma o x de cada um). |
| `fase3/ChunkManager.js` | Monta e desmonta chunks perto e longe da câmera. Camadas: colisão (`solids`, `oneway`), interação, inimigos, segredo (cobertura) e decor. |
| `fase3/Backdrop.js` | Parallax de 7 camadas, água animada (3 faixas de crista, brilho especular, ondas na areia, espuma), gaivotas e poeira. Também tem a **câmera** (`Fase3Camera`): deadzone, look-ahead, antecipação ao cair, zoom de vista e tremida leve. |
| `fase3/Sofia.js` | Física da Sofia: aceleração, coyote time de 120 ms, jump buffer de 120 ms, pulo variável, correr, agachar (com teto) e dano com recuo. Os números ficam em `SOFIA_TUNING`. |
| `fase3/Faisca.js` | IA do Faísca: segue, para, pula obstáculos e vãos, sobe em plataformas, rosna para inimigos, fareja segredos e reaparece atrás da Sofia quando se perde. Não colide com ela. |
| `fase3/Crab.js` | Caranguejo: patrulha → "!" → garras para cima → avanço → recupera. Tem 2 vidas; a derrota é em estilo cartoon. |
| `fase3/Fase3Input.js` | Teclado, gamepad e toque. Inclui o texto das dicas por controle. |
| `fase3/Fase3Audio.js` | Latido, carga, arremesso e golpe sintetizados, pelo barramento de EFEITOS (respeitam a tela SOM). |

### Resolução
O jogo inteiro já roda em 1920×1080 lógico (Phaser `Scale.FIT`), então a Fase 3 usa a mesma configuração, sem escala própria. O "zoom de vista" é um zoom suave da câmera para 0,94 nos trechos marcados em `vistas`.

### Formato do chunk
Cada chunk é um objeto dentro de `chunks: [...]` do setor. As coordenadas são **locais do setor**, com x começando em 0, e todos os campos são opcionais:
```js
{ id: "B0", x0: 0, x1: 1920,
  ground:     [{ x, w, y?, tiles: "sand" | "rock" }],      // chão sólido até o fundo
  blocks:     [{ x, y, w, h, tiles: "rock" }],              // bloco sólido
  platforms:  [{ x, y, w, kind: "log" | "ledge" }],         // mão única (sobe por baixo)
  water:      [{ x, w, y, respawn: { x, y } }],             // cair = volta ao respawn
  decor:      [{ kind, x, y, scale?, flip?, front? }],      // props do tileset, sem colisão
  shells:     [{ id: "f3B-01", x, y, gold? }],              // id ÚNICO (vai para a carteira)
  enemies:    [{ type: "crab", x, minX, maxX }],
  checkpoints:[{ id: "B0", x }],
  hints:      [{ id, x, text: "{jump} para pular" }],       // tokens: {move} {run} {jump} {attack} {special} {down}
  secrets:    [{ id, sniffX, zone: {x,y,w,h}, cover: {x,y,w,h} }],
  triggers:   [{ id, x, y, w, h, event: "end" | "helpZoneToninho" }],
  vistas:     [{ x0, x1, zoom: 0.94 }] }
```

### Como adicionar um setor (exemplo: B, Costão Rochoso)
1. Copie `sectors/setorA.js` para `sectors/setorB.js`, troque `id: "B"`, `art: "B"` e o `length`, e desenhe os chunks com o x começando em 0.
2. Em `sectors/index.js`, importe o `SETOR_B` e troque o `data: null` do B por `data: SETOR_B`.
3. Em `Fase3Assets.js`, crie `SECTOR_ART.B`:
   - pasta `setorB/` e camadas `cenarioB_0_ceu.png` … `cenarioB_6_folhas_desfocadas.png`;
   - `tileset: "tileset_costao/"` e tiles/props.
   - Enquanto não houver arte, aponte o provisório para os desenhos do A ou acrescente funções em `Fase3Placeholders.js`.
4. Em `Fase3Scene.js`, inclua `"B"` em `preloadFase3(this, ["A", "B"])` e `buildFase3Art(this, ["A", "B"])`. O `Backdrop` hoje é criado só para o A. No marco do Setor B, ele passa a trocar o parallax por setor com um crossfade na fronteira.
5. Para inimigos novos (macaco etc.), crie `fase3/Macaco.js` no padrão do `Crab.js` e registre o `type` no `ChunkManager.build()`.
6. Para ajudantes (Toninho, Marina, Júlia, Lucas, Bia), use `triggers` com `event: "helpZone..."` e trate o evento na cena. Depois do evento, deixe o objeto interativo (por exemplo, a corda) como objeto do chunk.

### Onde trocar a arte
- Solte o PNG em `public/assets/farol/fase3_ilha/...` com o nome do `ASSETS_FASE3.md`.
- Rode `node list_assets.mjs` e recarregue.
- Se a grade for outra, ajuste `frameWidth`, `frameHeight`, `anims` e `body` em `Fase3Assets.js`. Nada mais muda.

### Save
- `farol-fase3` (localStorage) guarda `{ cp, setorA }`: o último checkpoint e se o Setor A terminou.
- As conchas usam a carteira normal (`farol-conchas-v2`), com ids `f3A-..`.
- O `resetAll()` da carteira ainda **não** apaga o `farol-fase3`. Para zerar, apague essa chave no DevTools ou use `?fase3=novo`.

## Próximo marco: Setor B, Costão Rochoso
- Dados do `setorB.js`: saltos entre pedras (blocos e lajes em alturas variadas), poças e ondas batendo nas pedras (respingo), sem caranguejos novos (ou só alguns). Dois checkpoints.
- Arte: `cenarioB_0..6` e `tileset_costao/` (rocha molhada, musgo, poça), seguindo o padrão do A.
- Código:
  1. Troca de parallax por setor (crossfade na fronteira A→B).
  2. "Água escorrendo nas pedras" (partículas ou tileSprite vertical).
  3. Plataforma de pedra que balança ou afunda, um mecanismo novo.
  4. Música de transição.
- A placa "continua…" sai do fim do A e vai para o fim do B.
