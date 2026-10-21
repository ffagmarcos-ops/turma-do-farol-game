# Polimento Fase 1 — Vila das Conchas (bonita e viva)

## Fontes
- **Canva (conta do Marcos):** busquei "jogo", "game", "farol", "vila das conchas" e "GDD". **Não existe design de planejamento do game.** Só aparecem as páginas da HQ ("HQ TURMA DO FAROL", "HQ Farol — Página 03/04/05"), e o texto delas são só falas: PORTO DA VILA DAS CONCHAS, O que é isso?, CLINC!, Faísca acho que você achou..., Onde vocês encontraram isso?. Nenhum item novo de polimento veio daí. As falas confirmam o beat do CLINC.
- **plano_gpt.md**: §28 (objetos animados por cima: água, bandeiras, cordas, gaivotas, folhas, fumaça, ondas, luzes, peixes), §29 (água em 3 camadas: base, ondas, reflexos), §40 (áudio em camadas: ondas, gaivotas, vento, madeira do píer, barcos, moradores), §41 (som posicional), §42 (luz de manhã com sombras suaves, sem saturar demais), §44 (SFX: madeira do píer, gaivotas, ondas, passos, água, cordas), pooling e partículas finitas.
- **CHECKLIST_FASE1.md**: itens ainda ❔/🟡 (o Grok já relatou parte deles): 15 a 17 (câmera cinematográfica), 23 (mar), 24 (ambiente animado), 28 (luz), 35 a 38 (conchas, segredo, interações, perigos), 41 (final), 44 (áudio posicional).

## 1. O que o plano prevê e ainda falta (confirmar no Grok)
| Item | Fonte | Tipo |
|---|---|---|
| Mar em 3 camadas: base, ondas em TileSprite, reflexos com alfa oscilante e espuma nos pilares | §29 / ck23 | código |
| Bandeiras, cordas, roupas no varal, redes, folhas e fumaça animadas | §28 / ck24 | código (com arte opcional) |
| Peixes pulando ocasionalmente | §28 | código (sprite simples) + arte opcional |
| Luz de manhã, camadas de fundo levemente dessaturadas, personagens destacados | §42 / ck28 | código |
| Áudio em camadas e posicional (mercado, barcos, ondas) | §40-41 / ck44 | código + sons |
| SFX de passos, madeira, água, cordas | §44 | sons |
| Abertura panorâmica, zoom na praça, revelação do Esperança | ck15-17 | código |
| Brilho e som das conchas, concha especial sob o píer | ck35-36 | código + SFX |
| Sino e caixa empurrável | ck37 | código + SFX |
| Final com aproximação, fade e FIM DA DEMO | ck41 | código |

## 2. Boas práticas de 2D vivo
### A. Só código (Phaser 3)
**Luz e cor**
- God rays: 3 a 4 retângulos em gradiente aditivo (`setBlendMode(ADD)`), alfa entre 0.06 e 0.12, rotação de cerca de 20°, pulsando com tween lento (6 a 10 s), scrollFactor 0.3.
- Color grading leve: PostFX (Phaser 3.60+) `cam.postFX.addColorMatrix()` com saturação +5% e um quente leve, mais `addVignette(0.5,0.5,0.9,0.25)`. Sem PostFX, usar um retângulo em tela cheia com tint âmbar, alfa 0.05 e blend MULTIPLY/SCREEN.
- Fundo atmosférico: tint azulado e alfa nas camadas distantes (perspectiva aérea).
- Light2D é opcional. Não vale a pena num cenário diurno pintado (exige normal maps). Reservar para cavernas e para a cena noturna.
- Bloom suave só no artefato e nas conchas (`postFX.addGlow` no sprite).

**Água**
- Brilho do mar: partículas pequenas e aditivas sobre a faixa do mar, piscando (lifespan de 600 a 1200 ms, alfa 0→1→0).
- Ondas: 2 TileSprites com `tilePositionX` em velocidades diferentes, mais um bob senoidal em y (±3 px).
- Opcional: shader de distorção (WebGL pipeline / `postFX.addDisplacement`) só na faixa do mar.
- Respingos quando a Marina pousa perto da borda ou quando um peixe salta.

**Partículas (todas finitas e em pool)**
- Poeira dos passos: emitir 2 a 3 partículas em cada contato do pé e 6 a 8 na aterrissagem.
- Folhas: 4 a 6 por tela, com drift e rotação.
- Brilho das conchas: sparkle em loop no item e burst de estrelinhas ao coletar.
- Fumaça de chaminé: 1 emissor por casa visível, partículas grandes, lentas e de alfa baixo.
- No CLINC: burst de faíscas douradas + glow no artefato.

**Vento e ambiente**
- Palmeiras e toldos: tween de `skewX`/rotação com origem na base (±2 a 3°) e fases aleatórias.
- Bandeirolas: cada bandeira oscila com uma fase deslocada (efeito onda). Com Mesh/Rope (`this.add.rope`) dá pra ondular de verdade.
- Barcos: bob + roll (±2°), já feito; conferir.
- Sombras de contato: elipse escura (alfa 0.25) sob cada personagem, encolhendo e clareando conforme a altura do pulo.

**Juice**
- Squash/stretch: pulo 0.9×1.1, aterrissagem 1.12×0.88 voltando em 120 ms.
- Screen shake leve no CLINC: `cam.shake(180, 0.004)`.
- Camera punch: zoom de 1.0 para 1.04 e volta em 250 ms, no CLINC e na revelação do Esperança.
- Hit-stop de 60 ms no CLINC.
- Coleta de concha: pop de escala, voo do ícone até o HUD e contador fazendo bounce.
- Ícone do E pulsando perto de NPC. NPC vira para a Marina ao falar.

**Transições**
- Menu → jogo: `cam.fadeOut/fadeIn` 400 ms, ou wipe circular (máscara).
- Diálogos: letterbox (barras pretas entrando 60 px) e a caixa entrando com slide.
- Fim da fase: íris fechando sobre o Esperança.

### B. Precisa de arte nova (Daniel, no ChatGPT)
- Opcional: folha de bandeirolas, folhas de palmeira separadas e toldo separado para animar por parte.
- Silhuetas de peixe e sprite de respingo (dá pra usar placeholder vetorial).
- Normal maps só se for usar Light2D (não recomendado agora).

### C. Precisa de som novo (fontes CC0 verificadas por pesquisa)
- **Kenney Impact Sounds (CC0)**, https://kenney.nl/assets/impact-sounds: `footstep_wood_*` (píer), `footstep_concrete_*` (calçada), `footstep_grass_*`, `impactPlank_*` (caixa, aterrissagem na madeira), `impactBell_heavy_*` (sino) e `impactMetal_light_*` (CLINC).
- **Kenney Interface Sounds (CC0)**, https://kenney.nl/assets/interface-sounds (também em https://opengameart.org/content/interface-sounds): concha, UI, abrir diálogo e o E.
- **Ambiente de porto com gaivotas e ondas (CC0)**, "harbour, seagulls-48k" por Further_Roman (Freesound): https://soundspool.com/sounds/harbour-seagulls-48k
- **Ondas suaves com gaivota distante (CC0)**, por jackmichaelking: https://freesound.org/s/518637/
- **Marina calma com gaivotas e latido distante (CC0)**, por yaranik: https://freesound.org/people/yaranik/sounds/71700/
- **Porto com rangido de barcos e respingos (CC0)**, "Genaral Habour Ambience" por Kinoton: https://soundspool.com/sounds/genaral-habour-ambience
- Evitar: "harbour ambiance" do klankbeeld (exige atribuição e é industrial).
- Ainda falta achar: latido isolado do Faísca e vozes de feira. Buscar em freesound.org com o filtro License = Creative Commons 0 ("dog bark", "market crowd"), ou gravar.
- Converter para OGG + MP3, mono para SFX, cortar em loops de 30 a 60 s e manter cada arquivo abaixo de 1 MB.

**Mixagem (AudioManager)**
- Buses: music 0.6 · ambience 0.45 · sfx 0.8 · ui 0.5. Ducking da música para 0.35 nos diálogos (já feito).
- Passos com pitch aleatório (`rate` entre 0.92 e 1.08) e variação de 5 arquivos, com intervalo mínimo de 90 ms.
- Ambiente posicional: volume = clamp(1 − dist/1200), pan = dx/960.
- Limitar a 6 vozes simultâneas de SFX e desbloquear o áudio no primeiro input (o clique no menu).

## 3. Mensagens prontas para o Grok (só código, sem gerar imagens)

### Mensagem 1 (prioridade alta: luz, água e juice)
```
Grok, só código, não gere imagens e preserve o que já funciona. Polimento visual da Fase 1, nesta ordem:
1. Luz de manhã: 3 god rays (retângulos em gradiente, blend ADD, alfa 0.08, pulsando lento), color grading leve (postFX colorMatrix com +5% de saturação e tom quente, vinheta 0.25) e tint azulado/alfa nas camadas distantes.
2. Mar: 2 TileSprites de ondas em velocidades diferentes com bob de ±3 px, brilhos aditivos piscando sobre o mar (partículas finitas em pool) e espuma nos pilares do píer.
3. Sombra de contato (elipse alfa 0.25) sob todos os personagens, que encolhe no pulo.
4. Juice: squash/stretch no pulo (0.9x1.1) e na aterrissagem (1.12x0.88, 120 ms), poeira nos passos e na aterrissagem, e no CLINC: hit-stop de 60 ms, cam.shake(180, 0.004), zoom punch 1.04 e burst dourado + glow no artefato.
5. Conchas: sparkle em loop, pop ao coletar e ícone voando até o HUD.
Tudo configurável num FXConfig.js. Me diga os arquivos alterados.
```

### Mensagem 2 (vida no ambiente, transições e áudio)
```
Grok, só código, sem imagens. Segunda etapa de polimento da Fase 1:
1. Vento: palmeiras, toldos e bandeirolas oscilando (rotação/skew de ±2 a 3° com origem na base e fases aleatórias; bandeirolas com Rope se possível). Folhas caindo (4 a 6 por tela) e fumaça leve nas chaminés.
2. Peixe saltando de vez em quando com respingo (placeholder vetorial).
3. Transições: fade de 400 ms entre menu e jogo, letterbox de 60 px nos diálogos, íris fechando no fim da fase sobre o Esperança.
4. AudioManager com buses (music 0.6, ambience 0.45, sfx 0.8, ui 0.5). Anexei estes OGG; coloque-os em assets/audio/:
   - Passos por superfície, sorteando entre 3 variações com rate aleatório de 0.92 a 1.08: madeira no píer (sfx_step_wood_01..03), pedra na rua (sfx_step_stone_01..03) e grama (sfx_step_grass_01..03).
   - sfx_jump, sfx_land, sfx_shell (concha), sfx_clinc (artefato), sfx_bell (sino), sfx_plank (caixa e tábua).
   - Diálogo: sfx_ui_dialog_open, sfx_ui_dialog_next e sfx_ui_dialog_close. Menu: sfx_ui_confirm.
   - Ambientes posicionais amb_waves e amb_harbor em loop, com volume pela distância e pan. Os arquivos ainda vão chegar; enquanto isso, falhe em silêncio. Latido do Faísca (sfx_bark) idem.
5. Limite de 6 SFX simultâneos e desbloqueio do áudio no clique do menu.
Liste os arquivos alterados e as chaves de áudio esperadas.
```
