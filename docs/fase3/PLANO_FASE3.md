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
| D | Seu Toninho | corda (`helpZoneToninho`) | 3 min | ✅ **concluído e testado** (Passo 4, arte provisória) |
| E | Mata Densa | combate + plataforma | 4 min | ✅ **concluído e testado** (Passo 5, arte provisória) |
| F | Marina | plataforma móvel (caixa) | 3 min | ✅ **concluído e testado** (Passo 6, arte provisória) |
| G | Desfiladeiro | verticalidade | 5 min | ✅ **concluído e testado** (Passo 7, arte provisória) |
| H | Júlia | flashes e macacos | 4 min | ✅ **concluído e testado** (Passo 8, arte provisória) |
| I | Riacho / Lucas | plataformas na água | 4 min | ✅ **concluído e testado** (Passo 9, arte provisória) |
| J | Cachoeira | exploração | 4 min | ✅ **concluído e testado** (Passo 10, arte provisória) |
| K | Gruta Secreta | opcional | 2–4 min | ✅ **concluído e testado** (Passo 10, arte provisória) |
| L | Bia | rota secreta | 3–4 min | ✅ **concluído e testado** (Passo 11, arte provisória) |
| M | Copas Altas | desafio maior | 5 min | ✅ **concluído e testado** (Passo 12, arte provisória) |
| N | Ruínas | exploração / mistério | 3 min | ⏭️ **próximo passo (Passo 13)** |
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
- 7.680 px adicionais em 4 chunks (`C0`–`C3`, 23.040 px acumulados) e 4 checkpoints (`C0`–`C3`).
- Transição contínua `B3` → `C0` do costão rochoso para a mata costeira, com parallax de árvores altas e copa em primeiro plano (`C3`, `C5`) + tiles de grama da mata (`C_sand_top`, `C_sand_fill`), galhos (`C_log`), árvores (`tree`), samambaias (`fern`) e raízes (`roots`).
- Novo inimigo **Macaco** (`src/game/fase3/Macaco.js`): fica em galho ou plataforma alta, observa a Sofia (`watch`), pega uma pedra (`pick`), levanta o braço dando aviso claro (`aim` + `!`), marca no chão uma **sombra onde a pedra vai cair** (`createRockShadow`) e arremessa a pedra em arco parabólico (`throw` → `spawnMonkeyRock`) seguida de risada (`laugh`).
- Pode ser atordoado (`hurt` → `stun` com estrelinhas girando) com 1 concha e derrotado (`defeat` cartoon) com a 2ª concha ou pelo latido especial do Faísca. Quando há um macaco num galho alto à frente, o arremesso de concha da Sofia ajusta automaticamente o arco para cima.
- 6 macacos em galhos altos, 2 caranguejos na entrada da mata, 21 conchas + 1 concha dourada (`f3C-G1`) num esconderijo sob as raízes (`raizes-floresta`).

### Passo 4 (Setor D — Seu Toninho e a corda): concluído ✅
- 7.680 px adicionais em 4 chunks (`D0`–`D3`, 30.720 px acumulados) e 4 checkpoints (`D0`–`D3`).
- Transição contínua `C3` → `D0` rumo à Encosta do Seu Toninho, com paredões altos de pedra (`y = 480` e `y = 500`) que a Sofia não alcança pulando sozinha.
- **Seu Toninho e a corda náutica (`src/game/fase3/ToninhoHelper.js`):** ao entrar em `helpZoneToninho`, o Seu Toninho no topo do paredão acena (`wave`), lança a corda náutica (`throwRope`), segura firme a ponta e faz sinal de positivo (`thumbsUp`) quando a Sofia chega ao topo. O NPC nunca bloqueia a Sofia e a corda permanece interativa.
- **Mecânica de corda na Sofia (`Sofia.js`):** estados `climb_idle` (segurando na corda) e `climb` (subindo/descendo com `↑`/`↓` ou `W`/`S`, ou balançando com `←`/`→`), com física de pêndulo e salto com impulso (`Espaço`/`⤒`/`A` + direção) ou subida completa até o topo do paredão.
- Segunda corda náutica suspensa sobre um fosso de água em `D1` (`ropeD1`), plataformas instáveis e esconderijo secreto na encosta (`gruta-toninho` em `D2` com a concha dourada `f3D-G1`).

### Passo 5 (Setor E — Floresta Densa): concluído ✅
- 7.680 px adicionais em 4 chunks (`E0`–`E3`, 38.400 px acumulados) e 4 checkpoints (`E0`–`E3`).
- Transição contínua `D3` → `E0` para o interior da Floresta Densa, com camada de parallax de mata fechada e cipós pendurados (`E3`: `denseForestLayer`) e novos props (`vine` e `hollow_log`).
- **Plataformas na vertical e na horizontal (`ChunkManager.js`):** suporte a plataformas móveis (`moveX` / `moveY`) que transportam a Sofia suavemente, combinadas com galhos em múltiplos níveis, cordas/cipós suspensos (`ropeE1`, `ropeE3`) e troncos ocos onde é preciso passar agachada (`crawl`).
- **Macacos em cima e caranguejos embaixo:** 7 macacos nos galhos superiores e 6 caranguejos patrulhando no solo da mata, com uma **clareira segura no meio** do setor (início de `E2`, com checkpoint `E2`, zoom de vista `0,94` e sem inimigos por perto).
- **Área secreta (`tronco-secreto-e` em `E1`):** esconderijo sob raízes e tronco oco farejado pelo Faísca (`sniffX`), revelando a concha dourada `f3E-G1` + 21 conchas normais no setor.

### Passo 6 (Setor F — Marina empurra a caixa): concluído ✅
- 7.680 px adicionais em 4 chunks (`F0`–`F3`, 46.080 px acumulados) e 4 checkpoints (`F0`–`F3`).
- Transição contínua `E3` → `F0` rumo à Clareira da Marina, com paredões altos (`y = 620`, 280 px acima do chão `y = 900`) que a Sofia não alcança pulando sozinha.
- **Marina e a caixa de madeira (`src/game/fase3/MarinaHelper.js`):** ao entrar em `helpZoneMarina` (`marinaF0`, `marinaF2`, `marinaF3`), a Marina percebe a Sofia (`notice`), empurra uma caixa grande de madeira (`128×128`) até o ponto certo (`push` → `drop`) e faz gesto de incentivo `"Vai, Sofia!"` (`cheer`). A Marina nunca bloqueia a Sofia e a caixa vira degrau sólido (`topSurfaceY = 776`) para alcançar o paredão alto (`y = 620`).
- **Arte da Marina (`Fase3Placeholders.js`):** reutiliza os quadros oficiais de `marina_sheet_1536.png` com escala e proporções consistentes, compondo os estados `idle`, `notice`, `push` e `cheer` + caixa de madeira reforçada (`f3_caixa_marina`).
- **Área secreta (`pedra-marina` em `F1`):** esconderijo sob o rochedo farejado pelo Faísca (`sniffX`), revelando a concha dourada `f3F-G1` + 21 conchas normais no setor.

### Passo 7 (Setor G — Desfiladeiro): concluído ✅
- 7.680 px adicionais em 4 chunks (`G0`–`G3`, 53.760 px acumulados) e 4 checkpoints (`G0`–`G3`).
- Transição contínua `F3` → `G0` para o Desfiladeiro, com camada de parallax de pilares rochosos altos e vista aberta do oceano ao fundo (`G3`: `gorgeLayer` + `vistas` com zoom `0,94`).
- **Área vertical grande (`y = 900` até `y = 380`):** subida e descida em várias alturas combinando cipós (`ropes`), lajes que desmoronam (`crumble`), plataforma móvel vertical (`moveY`) e **plataformas suspensas que balançam** (`sway: true` em `ChunkManager.js`, penduradas por cipós/cordas com movimento de pêndulo). Sem inimigos nas plataformas mais estreitas.
- **Rota alternativa do Faísca (`faiscaDetour` em `Faisca.js`):** enquanto a Sofia atravessa os trechos suspensos e escala o desfiladeiro (`detourG0` e `detourG2`), o Faísca percorre a trilha inferior/lateral e reaparece alegremente nos platôs superiores (`reunionX`, `reunionY`) para reencontrá-la.
- **Área secreta (`fenda-desfiladeiro` em `G1`):** esconderijo no fundo do desfiladeiro farejado pelo Faísca (`sniffX`), com a concha dourada `f3G-G1` + 21 conchas normais no setor.

### Passo 8 (Setor H — Júlia e o flash): concluído ✅
- 7.680 px adicionais em 4 chunks (`H0`–`H3`, 61.440 px acumulados) e 4 checkpoints (`H0`–`H3`).
- Transição contínua `G3` → `H0` do Desfiladeiro para a Clareira da Júlia, com 13 macacos nos galhos altos e copas.
- **Júlia e o flash fotográfico (`src/game/fase3/JuliaHelper.js`):** posicionada em plataformas laterais elevadas (`helpZoneJulia`: `juliaH0`–`juliaH3`), a Júlia tira fotos em intervalo regular (`~3,1 s`, estados `idle` → `aimCamera` → `snap` → `cheer`). Cada flash produz um clarão rápido na área, dissipa pedras de macacos em pleno ar na zona e deixa os macacos próximos tontos (`stun`) por `~2,2 s`, abrindo janelas seguras para a Sofia atravessar.
- **Arte da Júlia (`Fase3Placeholders.js`):** reutiliza os quadros oficiais de `julia_sheet_1536.png` compondo os estados `idle`, `aimCamera` (luzinha vermelha de foco), `snap` (clarão na lente) e `cheer`.
- **Área secreta (`moita-julia` em `H1`):** esconderijo sob a moita densa e tronco caído farejado pelo Faísca (`sniffX`), com a concha dourada `f3H-G1` + 21 conchas normais no setor.

### Passo 9 (Setor I — Riacho e o aparelho do Lucas): concluído ✅
- 7.680 px adicionais em 4 chunks (`I0`–`I3`, mapa total atual: 69.120 px) e 4 checkpoints (`I0`–`I3`).
- Transição contínua `H3` → `I0` para o Riacho do Lucas, com 4 travessias largas de riacho (`I0`, `I1`, `I2` e `I3`) com água detalhada (transparência em camadas, reflexo ondulante, crista de espuma e partículas de correnteza). Cair na água dá respingo e volta para a margem segura.
- **Lucas e as plataformas/boias flutuantes (`src/game/fase3/LucasHelper.js`):** ao entrar em `helpZoneLucas` (`lucasI0`–`lucasI3`), o Lucas na margem se ajoelha mexendo no aparelho (`operateGadget`), emite um pulso de ativação (`activate`) e faz emergir em sequência **4 a 5 boias flutuantes (`f3_boia_lucas`)** na água. As boias oscilam com a correnteza e **afundam um pouco com o peso da Sofia** (`sinkDepth ≈ 22–26 px`), voltando à superfície quando ela salta. Ao chegar à margem oposta (`celebrateX`), o Lucas comemora (`celebrate`).
- **Arte do Lucas (`Fase3Placeholders.js`):** reutiliza os quadros oficiais de `lucas_sheet_1536.png` compondo os estados `idle`, `operateGadget` (ajoelhado), `activate` (antena emitindo ondas) e `celebrate` + sprite de boia flutuante (`f3_boia_lucas`).
- **Área secreta (`margem-lucas` em `I1`):** esconderijo sob as rochas molhadas da margem farejado pelo Faísca (`sniffX`), com a concha dourada `f3I-G1` + 21 conchas normais no setor.
### Passo 10 (Setores J e K — Cachoeira e Gruta Secreta): concluído ✅
- 11.520 px adicionais (Setor J com 7.680 px em `J0`–`J3` + Setor K com 3.840 px em `K0`–`K1`, mapa total acumulado: 80.640 px) e 6 novos checkpoints (`J0`–`J3`, `K0`–`K1`).
- **Setor J (Cachoeira dos Penhascos):**
  - Cenário de cachoeira com paredões de pedra e quedas d'água volumosas (`J3`: `waterfallLayer`).
  - **Superfícies molhadas e escorregadias (`slippery: true`):** alteram a física da Sofia (`Sofia.js`), reduzindo a aceleração (`accG = 1650`) e o atrito de frenagem (`decG = 760`), fazendo-a deslizar com suavidade e soltar respingos de água sob os pés.
  - **Cortinas de cachoeira animadas verticais (`waterfalls` em `ChunkManager.js`):** `tileSprite` com descida contínua de água (`f3_cortina_cachoeira`) e spray na base.
  - **Grande Cachoeira Principal e Segredo em `J2`:** cortina d'água em profundidade superior que diminui de opacidade (`alpha ≈ 0.28`) quando a Sofia entra atrás da queda d'água, revelando uma plataforma rochosa escondida (`atras-da-cachoeira`), conchas secretas e onde o Faísca para, fareja e late suavemente (`sniffX: 4440`).
- **Setor K (Gruta Secreta):**
  - Cenário subterrâneo místico com paredões azuis escuros, teto com estalactites cristalinas, lago subterrâneo calmo espelhado e cristais bioluminescentes reluzentes (`K0`–`K5`: `caveSkyLayer`, `caveRoofLayer`, `caveWaterLayer`, `caveWallLayer`, `caveStalagmitesLayer`).
  - **Orbe de Energia Cristalina (`f3_orbe_energia` em `K0`):** ao tocar o orbe, recarrega instantaneamente o latido especial do Faísca (`specialCool = 0`) e emite pulso de energia com aura luminosa.
  - **Grande Relíquia da História Antiga da Ilha (`f3_reliquia_historia` em `K1`):** medalhão ancestral entalhado em espiral mística de concha (sem texto per `AGENTS.md`), concedendo 10 conchas e salvando `reliquiaK: true`.
  - Placa `"Continua…"` posicionada comemorativamente no fim de `K1` (`fimK`).

## Arquitetura (código em `src/game/fase3/` + `src/game/scenes/Fase3Scene.js`)

| Arquivo | O que faz |
|---|---|
| `scenes/Fase3Scene.js` | Cena `fase3`. Junta tudo: colisões, HUD (conchas e medidor do latido), dicas, pausa, checkpoints, respawn, água, relíquias, orbes e fim do setor. |
| `fase3/Fase3Assets.js` | **Manifesto único de arte**: nomes de arquivo, tamanhos, grades e animações. Trocar arte = mexer só aqui (ou nem isso, se o nome e a grade forem iguais). |
| `fase3/Fase3Loader.js` | Carrega só os arquivos que existem (pelo `public/assets/files.json`) e gera os provisórios que faltam. |
| `fase3/Fase3Placeholders.js` | Arte provisória desenhada em código (Canvas 2D), com as mesmas chaves e quadros da arte final. |
| `fase3/sectors/setorA.js` | **Dados** do Setor A (Praia da Chegada). |
| `fase3/sectors/setorB.js` | **Dados** do Setor B (Costão Rochoso): fendas no mar, lajes que desmoronam, ondas nas pedras e caranguejos no alto. |
| `fase3/sectors/setorC.js` | **Dados** do Setor C (Floresta Inicial): árvores, galhos altos, esconderijo nas raízes e 6 macacos. |
| `fase3/sectors/setorD.js` | **Dados** do Setor D (Encosta do Seu Toninho): paredões altos, zonas `helpZoneToninho`, corda sobre água e segredo `gruta-toninho`. |
| `fase3/sectors/setorE.js` | **Dados** do Setor E (Floresta Densa): troncos ocos, cipós, plataformas móveis verticais/horizontais, macacos em cima e caranguejos embaixo, clareira segura e segredo `tronco-secreto-e`. |
| `fase3/sectors/setorF.js` | **Dados** do Setor F (Clareira da Marina): paredões altos, zonas `helpZoneMarina`, caixas que viram degrau e segredo `pedra-marina`. |
| `fase3/sectors/setorG.js` | **Dados** do Setor G (Desfiladeiro): área vertical (`y=900..380`), plataformas que balançam (`sway`), cipós, lajes instáveis, rota alternativa do Faísca (`faiscaDetour`) e segredo `fenda-desfiladeiro`. |
| `fase3/sectors/setorH.js` | **Dados** do Setor H (Clareira da Júlia): sequência de macacos nos galhos altos, zonas `helpZoneJulia` com flashes periódicos e segredo `moita-julia`. |
| `fase3/sectors/setorI.js` | **Dados** do Setor I (Riacho do Lucas): riacho com água detalhada, zonas `helpZoneLucas` com 4–5 boias flutuantes e segredo `margem-lucas`. |
| `fase3/sectors/setorJ.js` | **Dados** do Setor J (Cachoeira dos Penhascos): solo molhado escorregadio (`slippery`), cortinas de água animadas (`waterfalls`) e segredo atrás da cascata. |
| `fase3/sectors/setorK.js` | **Dados** do Setor K (Gruta Secreta): caverna bioluminescente azulada, orbe de energia (`f3_orbe_energia`) e Relíquia da Ilha (`f3_reliquia_historia`). |
| `fase3/sectors/setorL.js` | **Dados** do Setor L (Caminho Escondido da Bia): floresta com copas altas, monólito com símbolos circulares (`ancient_rune_stone`), zonas `helpZoneBia`, plataformas secretas reveladas e concha dourada `f3L-G1` no ninho das copas. |
| `fase3/sectors/setorM.js` | **Dados** do Setor M (Copas Altas): maior desafio acrobático, múltiplos níveis verticais (solo, pontes de galhos, copas e dossel), cipós suspensos (`ropes`), plataformas móveis/instáveis/balanço, tronco oco com passagem agachada e segredo `ninho-copas-altas` com a concha dourada `f3M-G1`. |
| `fase3/sectors/index.js` | Lista A–O e `assembleLevel()`, que encaixa os setores em sequência (soma o x de cada um). |
| `fase3/ChunkManager.js` | Monta e desmonta chunks perto e longe da câmera. Camadas: colisão (`solids`, `oneway`), plataformas móveis e que balançam (`movers`, `sway`), plataformas instáveis (`crumbles`), solo escorregadio (`slippery`), cortinas de cachoeira (`waterfalls`), rochas molhadas (`trickles`), ondas (`waveHits`), cordas (`toninhos`, `ropes`), caixas da Marina (`marinas`), flashes da Júlia (`julias`), boias do Lucas (`lucases`), revelação da Bia (`bias`), relíquias (`relics`), orbes (`energyOrbs`), interação, inimigos (`crabs`, `monkeys`), segredo e decor. |
| `fase3/Backdrop.js` | Parallax de 7 camadas com crossfade por setor, água animada (3 faixas de crista, brilho especular, ondas na areia, espuma), gaivotas e poeira. Também tem a **câmera** (`Fase3Camera`). |
| `fase3/Sofia.js` | Física da Sofia: aceleração, desaceleração suave em solo escorregadio (`onSlippery`), coyote time de 120 ms, jump buffer de 120 ms, pulo variável, correr, agachar (com teto), escalar/balançar na corda (`climb_idle`, `climb`) e dano com recuo. |
| `fase3/Faisca.js` | IA do Faísca: segue, para, pula obstáculos e vãos, sobe em plataformas, percorre rota alternativa no desfiladeiro/riacho (`detour`), rosna para inimigos, fareja segredos e reaparece atrás da Sofia quando se perde. Não colide com ela. |
| `fase3/ToninhoHelper.js` | Seu Toninho (`idle`, `wave`, `throwRope`, `thumbsUp`) e corda náutica (`NauticalRope`) com física de pêndulo e nós. |
| `fase3/MarinaHelper.js` | Marina (`idle`, `notice`, `push`, `cheer`) e caixa de madeira (`128×128`) que ela empurra até formar degrau para a Sofia subir. |
| `fase3/JuliaHelper.js` | Júlia (`idle`, `aimCamera`, `snap`, `cheer`): tira fotos periódicas em `helpZoneJulia`, produzindo clarão que atordoa os macacos da área por ~2,2 s e dissipa pedras no ar. |
| `fase3/LucasHelper.js` | Lucas (`idle`, `operateGadget`, `activate`, `celebrate`) e 4–5 boias flutuantes (`f3_boia_lucas`) que emergem na água, oscilam e afundam um pouco com o peso da Sofia. |
| `fase3/BiaHelper.js` | Bia (`idle`, `inspect`, `point`, `cheer`): analisa o monólito de pedras antigas rúnicas com a lupa, aponta para a vegetação alta, faz as plataformas secretas descerem suavemente e comemora no reencontro. |
| `fase3/Crab.js` | Caranguejo: patrulha → "!" → garras para cima → avanço → recupera. Tem 2 vidas; a derrota é em estilo cartoon. |
| `fase3/Macaco.js` | Macaco: fica em galho alto (`idle` → `watch` → `pick` → `aim` → `throw` → `laugh`), marca sombra no chão e lança pedra em arco. Tem 2 vidas (`hurt` → `stun` → `defeat`). |
| `fase3/Fase3Input.js` | Teclado, gamepad e toque. Inclui o texto das dicas por controle. |
| `fase3/Fase3Audio.js` | Latido, carga, arremesso, golpe, pedra rachando/desmoronando, macaco, corda/Seu Toninho, caixa/Marina, câmera/Júlia, aparelho/Lucas, apontar/Bia (`biaPoint`), revelação secreta, sino de relíquia, orbe e eco de caverna sintetizados, pelo barramento de EFEITOS. |

### Resolução
O jogo inteiro já roda em 1920×1080 lógico (Phaser `Scale.FIT`), então a Fase 3 usa a mesma configuração, sem escala própria. O "zoom de vista" é um zoom suave da câmera para 0,94 nos trechos marcados em `vistas`.

### Formato do chunk
Cada chunk é um objeto dentro de `chunks: [...]` do setor. As coordenadas são **locais do setor**, com x começando em 0, e todos os campos são opcionais:
```js
{ id: "M0", x0: 0, x1: 1920,
  ground:     [{ x, w, y?, tiles: "sand" | "rock", slippery? }],      // chão sólido até o fundo
  blocks:     [{ x, y, w, h, tiles: "rock", wet?, slippery? }],       // bloco sólido (wet = água escorrendo)
  platforms:  [{ x, y, w, kind: "log" | "ledge" | "crumble", crumble?, moveX?, moveY?, sway?, slippery?, speed? }],
  ropes:      [{ id, ropeX, topY, bottomY, deployed? }],              // corda náutica / cipó interativo
  water:      [{ x, w, y, stream?, respawn: { x, y } }],               // cair = volta ao respawn
  waterfalls: [{ x, y, w, h, secretPassage? }],                        // cortina animada de cachoeira
  relics:     [{ id, x, y }],                                          // relíquia da história antiga
  energyOrbs: [{ id, x, y }],                                          // orbe de recarga rápida de energia
  waveHits:   [{ x, y, phase? }],                                      // onda batendo na pedra (espuma)
  decor:      [{ kind, x, y, scale?, flip?, front? }],                 // props do tileset, sem colisão
  shells:     [{ id: "f3M-01", x, y, gold? }],                         // id ÚNICO (vai para a carteira)
  enemies:    [{ type: "crab" | "monkey", x, y?, minX, maxX }],
  checkpoints:[{ id: "M0", x }],
  hints:      [{ id, x, text: "{jump} para pular" }],                  // tokens: {move} {up} {run} {jump} {attack} {special} {down}
  secrets:    [{ id, sniffX, zone: {x,y,w,h}, cover: {x,y,w,h} }],
  triggers:   [{ id, x, y, w, h, event: "end" | "helpZoneToninho" | "helpZoneMarina" | "helpZoneJulia" | "helpZoneLucas" | "helpZoneBia" | "faiscaDetour" }],
  vistas:     [{ x0, x1, zoom: 0.94 }] }
```

### Onde trocar a arte
- Solte o PNG em `public/assets/farol/fase3_ilha/...` com o nome do `ASSETS_FASE3.md`.
- Rode `node list_assets.mjs` e recarregue.
- Se a grade for outra, ajuste `frameWidth`, `frameHeight`, `anims` e `body` em `Fase3Assets.js`. Nada mais muda.

### Save
- `farol-fase3` (localStorage) guarda `{ cp, reliquiaK, setorA..setorM }`: o último checkpoint, relíquia coletada e os setores concluídos.
- As conchas usam a carteira normal (`farol-conchas-v2`), com ids `f3A-..` a `f3M-..`.
- O `resetAll()` da carteira ainda **não** apaga o `farol-fase3`. Para zerar, apague essa chave no DevTools ou use `?fase3=novo`.

## Próximo marco: Passo 13 — Setor N (Ruínas Antigas)
- **Setor N (Ruínas):** a vegetação diminui gradualmente, revelando estruturas de pedra talhadas com símbolos circulares e espirais arcaicas (sem texto), com iluminação azulada translúcida se aproximando do fundo.
- A placa `"Continua…"` avança de `M3` para o Setor N.
