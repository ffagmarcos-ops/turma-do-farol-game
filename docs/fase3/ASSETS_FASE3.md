# Fase 3: lista de artes (o que gerar e onde soltar)

Toda a arte da Fase 3 fica em **`public/assets/farol/fase3_ilha/`**. O jogo usa o arquivo se ele existir. Se não existir, desenha um **provisório** no código com o mesmo nome e a mesma grade, então dá para trocar uma arte por vez.

Os nomes, tamanhos e quadros também estão no código, num só arquivo: **`src/game/fase3/Fase3Assets.js`**. Se uma arte vier com outra grade, por exemplo com outro tamanho de quadro, ajuste só ali.

## Como colocar uma arte nova
1. Salve o PNG com o **nome exato** da tabela, na pasta indicada.
2. No terminal da pasta do projeto, rode `node list_assets.mjs`. Isso atualiza a lista de arquivos que o jogo procura. O `npm run build` já roda esse passo sozinho.
3. Recarregue a aba do jogo em `http://localhost:5173/?fase3=novo`.

## Regras de estilo (da HQ)
- Cartoon 2D infantojuvenil, contorno escuro limpo, soft cel shading de 2 ou 3 tons, cores vibrantes.
- Sem 3D/Pixar, sem anime sombrio, sem terror.
- **Nenhum texto nas artes.** O texto da placa "continua…" é escrito pelo código.
- Faísca **sempre em 4 patas**: coleira azul com estrela dourada e uma orelha diferente da outra, como na ficha. A Sofia segue a ficha oficial, sem redesenhar.
- Spritesheets com **fundo transparente**. Os quadros vão em grade, da esquerda para a direita e linha por linha, com **os pés sempre na mesma linha** de todos os quadros.

---

## 1. Cenário do Setor A (Praia da Chegada): `fase3_ilha/setorA/`

Camadas de parallax com **1080 px de altura**, que **repetem na horizontal**: a borda direita precisa emendar na esquerda. Uma largura de 3840 px é suficiente. A camada 4 é a jogável e não é uma imagem; ela é montada com os tiles.

| Arquivo | Camada / velocidade | Tamanho sugerido | Transparente? | Conteúdo |
|---|---|---|---|---|
| `cenarioA_0_ceu.png` | 0 · céu (0) | 3840×1080 | não | céu azul e nuvens, com o horizonte claro por volta de y≈700 |
| `cenarioA_1_ilhas.png` | 1 · ilhas distantes (0,07) | 3840×1080 | sim | ilhas no horizonte, com a base em y≈715 |
| `cenarioA_2_oceano.png` | 2 · oceano distante (0,2) | 3840×1080 | sim | mar do horizonte (y≈700) até embaixo, com reflexo do céu. O jogo põe por cima ondas animadas e brilhos |
| `cenarioA_3_arvores.png` | 3 · árvores/costão (0,42) | 3840×1080 | sim | palmeiras e mata atrás da praia, com espaços para o mar aparecer |
| `cenarioA_5_folhagem.png` | 5 · folhagem próxima (1,15) | 3840×1080 | **sim** | moitas e samambaias só na faixa de baixo (y>850), bem espaçadas |
| `cenarioA_6_folhas_desfocadas.png` | 6 · folhas muito próximas (1,38) | 3840×1080 | **sim** | folhas grandes e desfocadas nos cantos, poucas, para não tapar o jogo |

Enquanto o céu final não chega, o jogo usa o `bg/sky_01_seamless.png` da Fase 1.

### Tiles e objetos: `fase3_ilha/setorA/tileset_praia/`

| Arquivo | Tamanho | Transparente? | Uso |
|---|---|---|---|
| `areia_topo.png` | 128×128 | sim, acima da superfície | topo do chão de areia. **O pé pisa em y=12** (contorno da superfície). Precisa emendar na horizontal |
| `areia_meio.png` | 128×128 | não | areia por baixo, repetida para baixo e para os lados |
| `rocha_topo.png` | 128×128 | sim, acima da superfície | topo de pedra (pode ter musgo). **O pé pisa em y=8** |
| `rocha_meio.png` | 128×128 | não | miolo de pedra |
| `plataforma_tronco.png` | 128×64 | sim | tronco deitado (plataforma). **O pé pisa em y=6**. Precisa emendar na horizontal |
| `plataforma_pedra.png` | 128×64 | sim | laje de pedra natural (plataforma). **O pé pisa em y=6** |
| `palmeira.png` | 360×620 | sim | palmeira (enfeite), com a base no pé da imagem |
| `arbusto.png` | 260×160 | sim | moita (enfeite) |
| `tronco_praia.png` | 300×110 | sim | tronco caído na areia (enfeite) |
| `estrela_do_mar.png` | 64×64 | sim | enfeite na frente |
| `pedrinhas.png` | 180×70 | sim | pedrinhas (enfeite na frente) |
| `placa_continua.png` | 200×220 | sim | placa de madeira no fim do Setor A, **sem texto** |

Os setores seguintes usam o mesmo padrão:
- `setorB/cenarioB_0_ceu.png` … `cenarioB_6_folhas_desfocadas.png` + `setorB/tileset_costao/`
- `setorC/cenarioC_…` + `tileset_floresta/`
- e assim por diante. Veja a lista no `PLANO_FASE3.md`.

---

## 2. Personagens e inimigos: `fase3_ilha/chars/` e `fase3_ilha/inimigos/`

### Sofia: `chars/sofia_sheet.png`
- **Quadro 192×256**, **8 colunas** e 3 linhas, num total de 21 quadros. A folha fica com 1536×768.
- Os pés ficam em **y=240** dentro do quadro, com o corpo centrado em x=96. A Sofia em pé ocupa ~220 px de altura, olhando para a **direita**.
- A hitbox é fixa: em pé, 80×196; agachada, 80×108. Agachada, ela precisa caber em **~115 px** de altura.

| Quadros | Animação |
|---|---|
| 0-1 | parada (respirando) |
| 2-5 | andar (4 quadros) |
| 6-9 | correr (4 quadros) |
| 10 | pulo (subindo) |
| 11 | queda |
| 12 | aterrissagem |
| 13 | agachada |
| 13-14 | engatinhar (passar em vão baixo) |
| 15 | lançar concha (braço à frente) |
| 16 | levou dano (recuo) |
| 17 | apontar (carregando o latido do Faísca) |
| 18-19 | comemoração curta |
| 20 | observar o cenário (mão na testa) |

As poses previstas para os próximos setores, segurar e balançar na corda, entram depois como quadros 21 em diante.

### Faísca: `chars/faisca_f3_sheet.png` (opcional)
Hoje a Fase 3 usa o **sheet oficial da Fase 1** (`chars/faisca_sheet_1536.png`). Um sheet próprio só é necessário para as poses novas:
- **Quadro 192×256**, 8 colunas, com os pés em y=240 e o corpo olhando para a direita.
- Linhas na mesma ordem da Fase 1:
  - 0-3: parado
  - 8-15: andar
  - 16-23: correr
  - 24-26: pulo
  - 27-28: queda
  - 32-33: **farejar / pose de ataque** (agachado, focinho baixo)
  - 40-41: **latir**

### Caranguejo: `inimigos/caranguejo_sheet.png`
- **Quadro 160×128**, 8 colunas e 2 linhas, num total de 9 quadros. A folha fica com 1280×256. As patas encostam em y≈118.

| Quadros | Animação |
|---|---|
| 0-1 | parado |
| 2-3 | andar de lado |
| 4-5 | garras levantadas (aviso antes do ataque) |
| 6 | ataque (garras abertas, avançando) |
| 7 | machucado (olhos em X) |
| 8 | derrotado (de barriga para cima). O jogo faz ele girar e voar para fora da tela |

---

## 3. Objetos, efeitos e interface: `fase3_ilha/props/` e `fase3_ilha/fx/`

| Arquivo | Tamanho | Transparente? | Uso |
|---|---|---|---|
| `props/checkpoint_sheet.png` | quadro 128×224, 3 quadros numa linha (384×224) | sim | marca de exploração: 0 = apagada, 1-2 = acesa (fita/luz balançando). Base no pé da imagem |
| `props/concha_projetil.png` | 64×64 | sim | concha que a Sofia lança. O jogo faz ela girar. Hoje usa a `props/shell.png` da Fase 1 |
| `props/concha_coletavel.png` | 96×96 | sim | concha para coletar. A dourada é a mesma, com brilho dourado aplicado pelo código |
| `fx/onda_latido.png` | 256×512 | sim | onda de energia em meia-lua, abrindo para a **direita**, azul-clara |
| `fx/brilho_agua.png` | 32×32 | sim | brilho/estrela do reflexo do sol na água |
| `fx/espuma.png` | 32×32 | sim | bolinha de espuma (respingo) |
| `fx/poeira.png` | 64×64 | sim | nuvenzinha de poeira/areia |
| `fx/crista_onda.png` | 512×96 | sim | crista de onda com espuma em cima. Precisa emendar na horizontal (período de 128 px) |
| `fx/alerta.png` | 48×64 | sim | balão de "!" desenhado (sem letra) quando o caranguejo vê a Sofia |

## 4. Som
O Setor A reaproveita os sons CC0 da Fase 1:
- ondas: `sfx_praia_onda_*`
- vento: `sfx_vento_*`
- pulo, aterrissagem, concha, respingo

O latido, a carga, o arremesso e o golpe são **sintetizados no código** (`src/game/fase3/Fase3Audio.js`). A música é **provisória** (`music_vila.mp3`) até chegar a trilha da Fase 3. Música nova precisa ser CC0, normalizada a -16 LUFS, e entrar no `LICENCAS.md`.
