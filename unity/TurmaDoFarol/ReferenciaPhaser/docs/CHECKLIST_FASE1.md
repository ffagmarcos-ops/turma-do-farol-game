# Checklist Fase 1 — Vila das Conchas (plano GPT x relatos do Grok)

Fontes: `plano_gpt.md` (seções "Cenário 1 — Vila das Conchas" 1–53, prompt mestre e ETAPA 2), `grok_resposta_vila.md`, `grok_resposta_correcao.md`. O `grok_resposta_artes.md` ainda não existia quando montei este checklist.
Legenda: ✅ feito · 🟡 parcial · ❌ faltando · ❔ o Grok não relatou (tratar como faltando até confirmar no código)

## A. Base técnica
| # | Requisito do plano | Status | Ação concreta |
|---|---|---|---|
| 1 | Phaser 3 + JS ES6, 1920×1080 lógico, 16:9 responsivo, 60 FPS | ❔ | Pedir ao Grok que confirme em `GameConfig.js` (`width:1920,height:1080, Scale.FIT, fps 60`) e mostre um contador de FPS em modo debug (tecla F3). |
| 2 | Arquitetura modular (Player, Marina, CameraController, ParallaxManager, InteractionSystem, AudioManager, CheckpointSystem, HUD, LevelData) | 🟡 | Existem `fase1-vila.json` e `AssetManifest.js`. Pedir um `PROJECT_STRUCTURE.txt` e um `README_GAME.md`, como o GPT pediu, e separar o que ainda está dentro da Scene. |
| 3 | Dados do nível fora da Scene (NPCs, conchas, plataformas, triggers, sons, checkpoints) | 🟡 | Posições, colisões e falas já estão no `fase1-vila.json`. Falta mover pra lá conchas, checkpoints, sons e triggers. |
| 4 | Valores de física num arquivo de config (walk 210, run 360, acc 1800, dec 2200, grav 1800, jump −690, airControl 0.78) | ❔ | Conferir `PlayerConfig.js` com exatamente esses valores. |
| 5 | Desempenho: pooling, NPCs distantes sem update, partículas finitas | ❔ | Pedir culling (desativar update de quem estiver a mais de 1 tela de distância) e pool para brilho/partículas. |

## B. Marina: controle e sprites
| # | Requisito | Status | Ação |
|---|---|---|---|
| 6 | Pulo variável (soltar na subida → vy *= 0.55) | ✅ | Testar o pulo curto e o longo. |
| 7 | Coyote time 120 ms / jump buffer 140 ms | ✅ | Manter. |
| 8 | Máquina de estados de animação separada da física: IDLE, WALK, RUN, JUMP_START, JUMP, FALL, LAND, CROUCH, INTERACT | ❔/🟡 | **Problema do Marcos:** não há quadros de corrida, queda nem aterrissagem. Pedir uma `PlayerStateMachine.js` com todos os estados e fallback (RUN usa WALK acelerado, FALL usa o último quadro de JUMP, LAND dura 80 ms com squash 1.1×0.9). Assim, quando chegarem as folhas novas, é só trocar a arte. |
| 9 | Altura da Marina de 280 a 330 px na tela, sem variar entre poses | ❌ | **Problema do Marcos:** o tamanho muda de uma pose para outra. Normalizar cada quadro para a mesma altura-alvo (ex.: 300 px) com origem nos pés (0.5, 1), usando altura de referência fixa por personagem em vez de `frame.height`. |
| 10 | Hitbox com 55 a 60% da largura e 85% da altura, centrada no tronco e nas pernas | ❔ | Hitbox fixa, independente do quadro, para a troca de pose não mexer na colisão. |
| 11 | Visual fiel à ficha da HQ | 🟡 | O código já está pronto para receber os sprites novos. As folhas padronizadas virão do ChatGPT (fora deste pedido ao Grok). |
| 12 | Controles: A/D/←/→, SHIFT corre, SPACE pula, S/↓ agacha, E interage, ESC pausa, InputManager pronto para gamepad | 🟡 | E/toque/botão Falar ok. Confirmar SHIFT, agachar, ESC e gamepad. |

## C. Câmera
| # | Requisito | Status | Ação |
|---|---|---|---|
| 13 | Suavização (lerp 0.08 / 0.10), zona morta e antecipação com a Marina a 40–43% da tela | ✅ | Testar a virada para a esquerda, que deve ser suave. |
| 14 | Limites: nunca mostrar fora do mapa, faixas vazias nem a cor do canvas | ❔ | `setBounds(0,0,14336,1080)` e conferir no início e no fim. |
| 15 | Abertura panorâmica (mar → barcos → vila → píer → Marina) | 🟡 | Hoje abre com legendas. Acrescentar pan de câmera de cerca de 4 s, que o jogador pode pular. |
| 16 | Momento na praça: zoom-out de 5 a 8% no centro da fase | ❔ | Trigger em cerca de X 7000: zoom 0.93 com tween e volta ao sair. |
| 17 | Revelação em X ≈ 11.500 (mar aberto + Esperança + farol distante) | ❔ | Trigger de câmera e tween leve, mais farol visível nessa área. |

## D. Cenário, parallax e continuidade
| # | Requisito | Status | Ação |
|---|---|---|---|
| 18 | 8 camadas com fatores diferentes (0.02 / 0.08 / 0.15 / 0.28 / 0.48 / 0.70 / 1.0 / 1.08) | 🟡 | O Grok listou 8 camadas, mas `harbor.png` serve às camadas 5 e 6 juntas. Separar e aplicar exatamente esses fatores. |
| 19 | Panorama contínuo, segmentos de 2048 px vindos do mesmo master, sem cortes perceptíveis | ❌ | **Problema do Marcos:** dá pra ver que são duas imagens coladas. Em código: (a) posicionar os segmentos com sobreposição de 64 a 128 px e degradê alfa (máscara de fade) na borda; (b) arredondar posições (`Math.round`) para eliminar a fresta de subpixel; (c) `TileSprite`/repetição só no céu e no mar; (d) cobrir junções com props da camada à frente. A arte contínua nova vem do ChatGPT. |
| 20 | Uma imagem só, sem repetir trechos nem o farol | ✅/🟡 | O Grok diz que o farol aparece uma vez só. Garantir que nenhum segmento de `village_*` se repita em loop. |
| 21 | Céu independente, com nuvens bem lentas | 🟡 | **Problema do Marcos:** há gaivotas paradas, pintadas no céu. Até chegar o céu limpo, aplicar uma máscara ou recorte que esconda a faixa das gaivotas e mover só a camada de nuvens com drift lento (cerca de 2 px/s). |
| 22 | Gaivotas voando de verdade | ❌ | `SeagullSystem`: 3 a 6 gaivotas como sprites separados, batendo asas (2 a 3 quadros ou tween de escalaY), em rota senoidal da esquerda para a direita, com respawn e profundidade entre as camadas 2 e 4. Enquanto a arte não chega, usar uma forma vetorial simples (V), não retângulo. |
| 23 | Mar em camadas (base, ondas, reflexos, espuma perto do píer) | ❔ | Ondas com `TileSprite` deslizando devagar, reflexos com alfa oscilante e espuma nos pilares do píer. |
| 24 | Animações ambientais: barcos balançando, bandeiras, roupas, redes, folhas, fumaça | ❔ | Tweens de rotação e posição (±2°) nos barcos e no Esperança, onda leve nas redes e bandeiras, e emissor de fumaça com poucas partículas. |
| 25 | Chão variado (subidas, escadas, caixas, plataformas naturais) e nada flutuando | 🟡 | O chão é contínuo. Confirmar desníveis, escadas e caixotes usados como plataforma. |
| 26 | Colisão invisível separada da arte | ✅ | Ok (`fase1-vila.json`). |
| 27 | Sem placeholders de retângulo colorido | 🟡 | Trocar todo placeholder pelos PNGs do kit de artes quando o pacote chegar. Por enquanto, os fallbacks devem ser formas neutras. |
| 28 | Iluminação de manhã com personagens destacados do fundo | ❔ | Leve dessaturação ou escurecimento das camadas 1 a 5 (tint) para destacar quem está na camada de gameplay. |

## E. Conteúdo, narrativa e personagens
| # | Requisito | Status | Ação |
|---|---|---|---|
| 29 | 7 zonas de cerca de 2048 px, totalizando 14.336 px | ✅ | Ok (cerca de 14.000 px). |
| 30 | Bia como NPC interativo perto do meio da fase, com ícone discreto + E | ✅ | Ok (Cais, pág. 4). Conferir o ícone discreto. |
| 31 | Faísca sempre em quatro patas, correndo na direção do porto, sem gesto humano | ✅ | Ok (pág. 2, latido traduzido pela Marina). |
| 32 | Diálogos paralelos à HQ, págs. 1 a 5 | 🟡 | A ordem está correta, mas as falas ainda são paráfrases. Colar o texto literal no bloco `script` do `fase1-vila.json`. |
| 33 | Retratos na caixa de diálogo | 🟡 | Já existem slots `ui/portrait_*.png`. Os retratos do ChatGPT estão sendo entregues. |
| 34 | 8 a 12 NPCs ambientais (pescador, vendedora, senhora regando flores etc.) | ❔ | Adicionar no JSON, com idle simples, sem diálogo. Não inventar personagens da HQ: são só moradores genéricos de fundo. |
| 35 | 20 conchas (12 fáceis, 5 com plataforma, 2 escondidas, 1 especial), a primeira entre 15 e 20 s do início, com brilho e som, sem pausa | ❔ | Lista no JSON + `Collectible.js`. |
| 36 | Área secreta sob o píer com a concha especial | ❔ | Plataforma inferior no Grande Píer. |
| 37 | Interações leves (caixa empurrável, sino, barril) | ❔ | Pelo menos caixa empurrável e sino. |
| 38 | Perigos leves, sem inimigos nem combate | ❔ | Tábua que cede e um vão pequeno. Vilões só como assets. |
| 39 | 3 checkpoints (X 4200 / 8700 / 12300) com retorno rápido | ❔ | `CheckpointSystem.js` + respawn em menos de 0,5 s ao cair. |
| 40 | Esperança fiel ao modelo (casco creme, faixa vermelha, detalhes azuis) | 🟡 | Trocar pelo `props/boat_esperanca.png` novo. |
| 41 | Final: trigger, câmera aproxima, turma perto do barco, fade, FIM DA DEMO, gancho para o próximo nível | 🟡 | Hoje o fim libera após o Toninho com a legenda de destino. Acrescentar aproximação, fade e `LEVEL_01_COMPLETE` com `nextLevel` configurável. |

## F. HUD e áudio
| # | Requisito | Status | Ação |
|---|---|---|---|
| 42 | HUD discreto: ícone da Marina + conchas X/20 em cima à esquerda, objetivo em cima à direita | ❔ | `HUD.js` com objetivo que muda por beat da HQ. |
| 43 | Música leve de aventura marítima | 🟡 | A faixa do Suno ainda não foi para o projeto do Grok. Anexar `music_vila.mp3` em loop, com ducking nos diálogos e M para mudo. A faixa misteriosa vai na cena do Toninho quando existir. |
| 44 | Ambiente em camadas e posicional (mar, gaivotas, madeira, vozes do mercado, barcos) | ❔ | `AudioManager` com volume proporcional à distância de cada emissor do JSON. |

## Problemas apontados pelo Marcos (prioridade máxima)
1. Gaivotas paradas pintadas no céu → itens 21 e 22.
2. Emendas visíveis entre painéis → item 19.
3. Sprites com erros: tamanho inconsistente e falta de corrida, queda e aterrissagem → itens 8, 9 e 10. Além do código, é preciso gerar folhas de sprite novas no ChatGPT, começando pela Marina.

## Critério de "Vila pronta" (seção 53 do plano)
Controle gostoso ✅ · pulo responsivo ✅ · câmera agradável ✅ · cenário contínuo ❌ · parallax convincente 🟡 · colisão do píer ✅ · 20 conchas ❔ · NPCs ❔ · Bia ✅ · Faísca ✅ · sons ambientais ❔ · Esperança no final 🟡 · 60 FPS ❔

---

## Mensagem pronta para o Grok (somente código, sem gerar imagens)

```
Grok, a ordem da HQ ficou ótima. Agora preciso só de correções de código na Fase 1. Não gere nenhuma imagem. Altere apenas os sistemas citados e preserve o que já funciona.

1. Emendas do cenário: os segmentos de 2048 px estão mostrando costura. Sobreponha cada segmento de 64 a 128 px com degradê alfa na borda, arredonde as posições (sem subpixel) e use exatamente os scroll factors 0.02/0.08/0.15/0.28/0.48/0.70/1.0/1.08, separando harbor das camadas 5 e 6.
2. Gaivotas: as do céu são parte da imagem e ficam paradas. Crie um SeagullSystem com 3 a 6 gaivotas como sprites separados (ui/fx/seagull.png, com fallback vetorial simples), batendo asas, em rota senoidal da esquerda para a direita, com respawn. Só as nuvens do céu devem ter um drift bem lento.
3. Sprites da Marina: a altura muda entre poses. Normalize todos os quadros para cerca de 300 px na tela, com origem nos pés (0.5, 1) e hitbox fixa (58% da largura, 85% da altura), independente do quadro.
4. Animações: crie PlayerStateMachine.js separada da física com IDLE, WALK, RUN, JUMP_START, JUMP, FALL, LAND, CROUCH e INTERACT. Enquanto não houver quadros próprios, use fallback: RUN = WALK mais rápido, FALL = último quadro do pulo, LAND = 80 ms de squash. Deixe as chaves no AssetManifest para eu trocar pelos sprites novos.
5. O que falta do plano do GPT, tudo configurável no fase1-vila.json: 20 conchas (a primeira a cerca de 15 s do início, uma especial numa área secreta sob o píer), 8 a 12 moradores ambientais sem diálogo, checkpoints em X 4200/8700/12300 com respawn rápido, HUD discreto (conchas X/20 e objetivo atual), zoom-out leve na Praça e revelação do Esperança em X≈11500, barcos balançando e mar com ondas animadas.
6. Áudio: AudioManager com música da vila em loop (assets/audio/music_vila.mp3, que vou anexar), volume baixo durante diálogos, tecla M para mudo e sons ambientes posicionais definidos no JSON.

No fim, me passe a lista dos arquivos alterados e um PROJECT_STRUCTURE.txt atualizado.
```
