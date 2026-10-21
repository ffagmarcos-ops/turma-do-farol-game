# O Mistério da Ilha do Farol / Turma do Farol: planejamento do jogo (GDD resumido)

**Autor do projeto:** Marcos Oliveira
**Equipe:** Marcos Oliveira (direção, música no Suno) · Daniel (revisão de arte, diagramação e HQ) · Kojima (programação) · artes geradas no ChatGPT
**Versão deste documento:** 18/10/2026

### Como ler este documento
Cada informação traz a origem:

- **[Plano ChatGPT]**: vem do plano gerado no ChatGPT (`plano_gpt.md`), que é a base principal.
- **[Estado atual]**: o que já existe no jogo hoje (`vila_local`, APK v1.5, zip para PC, `fase1-vila.json`, checklists).
- **[GDD Grok]**: vem do GDD curto e da conversa do Grok (`GDD_Misterio_Ilha_do_Farol.docx`, `grok_conversa.md`).
- **[Proposta]**: sugestão deste documento para as próximas etapas. Ainda precisa ser aprovada pelo Marcos.

---

## 1. Visão geral

| Item | Definição |
|---|---|
| Título | **O Mistério da Ilha do Farol**. Subtítulo sugerido: *A Chave dos Cristais* [Plano ChatGPT]. Nome no app Android: **Turma do Farol** [Estado atual] |
| Base | HQ infantojuvenil *O Mistério da Ilha do Farol*, Vol. 1: *A Caverna das Águas Azuis* [GDD Grok] |
| Conceito | Marina e a turma atravessam a Vila das Conchas e descobrem um artefato com um símbolo de espiral. No barco Esperança, partem para a Ilha das Cavernas Azuis, passam por ruínas, marés e cavernas e chegam à Câmara dos Cristais / Coração Azul. O final deixa um gancho para a continuação (o farol continua ativo, com fendas temporais) [Plano ChatGPT + GDD Grok] |
| Gênero | Plataforma 2D com aventura, exploração e puzzles leves. Combate é secundário: os inimigos ficam atordoados ou fogem [Plano ChatGPT] |
| Referência de jogabilidade | A sensação dos grandes platformers 2D (Rayman como referência de estrutura, sem copiar a arte). A identidade visual é sempre a da HQ [Plano ChatGPT] |
| Público | 8 a 13 anos, com acabamento que agrade também aos adultos [Plano ChatGPT] |
| Experiência desejada | Aventura, descoberta, plataforma fluida, cenários enormes, humor e mistério. O diferencial é o cenário da HQ em camadas de parallax [Plano ChatGPT] |
| Plataforma alvo | O plano previa começar em PC/Web, com Steam e mobile depois (talvez portando para Godot 4) [Plano ChatGPT]. **Hoje:** PC (zip, roda no navegador) e Android (APK v1.5 via Capacitor, `com.turmadofarol.vila`) [Estado atual] |
| Resolução | 1920×1080 lógico, 16:9 responsivo, meta de 60 FPS [Plano ChatGPT, mantido no Estado atual] |

---

## 2. Mecânicas principais

### 2.1 Movimento da Marina
**[Plano ChatGPT]** Aceleração e desaceleração suaves, controle no ar, coyote time, jump buffer e pulo variável (toque rápido dá pulo curto, segurar dá pulo alto). Física arcade e máquina de estados de animação separada da física. Dash e wall jump ficam para depois: "aventura, não plataforma hardcore".

**[Estado atual]** Tudo isso está implementado (`Player.js` + `PlayerStateMachine.js`, com os estados IDLE, WALK, RUN, JUMP_START, JUMP, FALL, LAND, CROUCH e INTERACT). Os valores ficam em `fase1-vila.json` e alguns foram ajustados nos testes:

| Parâmetro | Plano ChatGPT | Estado atual |
|---|---|---|
| walkSpeed / runSpeed | 210 / 360 | 210 / 360 |
| acceleration / deceleration | 1800 / 2200 | 1800 / 2200 |
| gravity | 1800 | 1800 |
| jumpVelocity | −690 | **−820** |
| corte do pulo variável | ×0,55 | **×0,42** |
| coyoteTime / jumpBuffer | 120 ms / 140 ms | 120 ms / 140 ms |
| airControl | 0,78 | 0,78 |
| Hitbox | 55 a 60% da largura, 85% da altura | fixa, independente da pose |

> **Divergência a resolver:** o GDD do Grok cita *double jump, dash* e *coop opcional* [GDD Grok]. O plano do ChatGPT recomenda não ter dash nem wall jump no começo. **[Proposta]** Seguir o plano do ChatGPT e reavaliar essas mecânicas a partir da Fase 4.

### 2.2 Controles
| Ação | PC | Android [Estado atual] |
|---|---|---|
| Andar | A/D ou ←/→ | direcional à esquerda |
| Correr | SHIFT | **sem botão de correr** |
| Pular | ESPAÇO (também ↑/W) | botão **PULAR** à direita (o direcional para cima também pula) |
| Agachar | S/↓ | direcional para baixo |
| Interagir/Falar | E (também Enter) | botão **FALAR** à direita |
| Mudo | M | — |
| Pausa | ESC [Plano ChatGPT] | a confirmar |

O mapeamento do PC vem do [Plano ChatGPT]. O suporte a gamepad está previsto no plano e ainda não foi confirmado [Estado atual: checklist].

### 2.3 Câmera
**[Plano ChatGPT]** Suavização, zona morta e antecipação (a Marina fica a 40–43% da tela), zoom cinematográfico em momentos-chave e limites que nunca mostram fora do mapa.
**[Estado atual]** `CameraController.js` tem foco à direita e à esquerda, deadzone e look-ahead, mais a zona da Praça e a revelação do Esperança em X≈11.500.

### 2.4 Sistemas da Fase 1 [Estado atual]
- **Coletáveis:** 20 conchas. O plano sugere 12 fáceis, 5 em plataformas, 2 escondidas e 1 especial numa área secreta sob o píer [Plano ChatGPT]. O vão em X≈7.280 dá acesso a uma área secreta.
- **Checkpoints:** 3, em X 4.200 (Rua), 8.700 (Cais) e 12.300 (Píer), com respawn rápido e save em `localStorage`.
- **Rede do cais:** obstáculo baixo em X≈8.780 que só se passa **agachando**.
- **Perigo leve:** tábua molhada escorregadia em X≈2.480. Não há inimigos nem combate na Fase 1, como manda o plano.
- **Diálogos:** caixa com retrato, falas paralelas às págs. 1–5 da HQ (`falas_hq_vila_das_conchas.json`) e ducking da música durante as falas.
- **HUD:** conchas X/20 e objetivo atual, que muda conforme a zona.
- **Final:** embarque no barco Esperança (trigger de fim com `nextLevel: mar-aberto`).

### 2.5 Mecânicas previstas para o jogo completo [Plano ChatGPT]
- **Troca de personagem (Q/E ou roda):** cada membro da turma resolve um tipo de puzzle (veja a seção 4).
- **Interações:** empurrar caixas, cordas, escadas, sino, portas e barris.
- **Puzzles:** portas de pedra, símbolos, engrenagens, pedestais e cristais. O piso dos símbolos (onda, estrela, espiral) vem do [GDD Grok].
- **Missões:** a principal é "Descubra o segredo do farol". As secundárias incluem ajudar um pescador, achar um gato perdido e consertar o barco.
- **Colecionáveis extras:** fragmentos de história, fotografias, moedas antigas, páginas do diário e cristais, que desbloqueiam desenhos, mapas e informações da HQ.
- **Inimigos sem violência pesada:** marinheiro com arpão, marinheiro com bastão, caranguejo, gaivota agressiva, polvo pequeno, enguia e guardião de pedra.
- **Chefes cinematográficos:** o Polvo Gigante, para escapar e proteger o barco sem matá-lo, e o Guardião de Cristal (puzzle e plataforma).
- **Mapa ilustrado:** os locais desbloqueiam conforme o progresso.

---

## 3. Estrutura de fases e progressão

### 3.1 Fase 1: Vila das Conchas (vertical slice, **pronta**) [Estado atual, baseado no Plano ChatGPT]
Cerca de 14.336 px de largura, divididos em 7 zonas contínuas. A ordem das cenas segue as págs. 1–5 da HQ:

| Zona | X aprox. | O que acontece |
|---|---|---|
| Entrada da Vila | 0 | Abertura com legendas (pág. 1). Faísca dispara rumo ao cais (pág. 2) |
| Rua dos Pescadores | 2.000 | Tábua molhada. Objetivo: "Siga a Faísca até o cais" |
| Mercado | 4.200 | Checkpoint 1. Júlia mostra a concha estranha (pág. 3) |
| Praça | 6.400 | Zona de câmera da praça. Lucas e o "tinido" no aparelho (pág. 3). Vão com área secreta |
| Cais de Pesca | 8.600 | Checkpoint 2. Rede baixa (agachar). Faísca puxa a rede, **CLINC!**, o artefato cai e Bia comenta (pág. 4) |
| Grande Píer | 10.800 | Revelação do Esperança (X≈11.500). A turma se reúne. Checkpoint 3 (X 12.300). Seu Toninho reconhece o símbolo das Cavernas Azuis (pág. 5) |
| Barco Esperança | 12.800 | Embarque. "Destino: Ilha das Cavernas Azuis" |

O critério de "Vila pronta" do plano (controle, câmera, cenário contínuo, parallax, 20 conchas, NPCs, Bia, Faísca, sons, Esperança e 60 FPS) guiou o polimento [Plano ChatGPT]. Ainda faltam os ambientes sonoros (seção 5) e alguns retoques de arte apontados pelo Daniel (seção 4).

### 3.2 Próximas fases
O plano do ChatGPT propõe 8 capítulos, e o Grok sugeriu 8 fases (com 7 no GDD curto). A tabela junta as duas listas. A ordem final é **[Proposta]**:

| # | Fase | Origem | Destaques |
|---|---|---|---|
| 1 | Vila das Conchas | ambos (**pronta**) | Tutorial, artefato, embarque |
| 2 | A bordo do Esperança / Mar Aberto | Plano ChatGPT (Cap. 2, Esperança como hub) + GDD Grok | Puzzles no barco: caixa, guincho, corda, ferramenta, motor. Lucas ajuda nos puzzles tecnológicos |
| 3 | Polvo Gigante | GDD Grok + chefe do Plano ChatGPT | Chefe de fuga: soltar cordas, ativar o guincho, proteger o barco |
| 4 | Ilha do Farol / Ilha na Neblina e Trilha das Ruínas | ambos | Praia, falésias, floresta, raízes, cordas, pontes. Primeiros inimigos |
| 5 | Ruínas antigas: Porta de Pedra e Piso dos Símbolos | ambos | Portas, símbolos (onda/estrela/espiral), engrenagens, o artefato abre a porta |
| 6 | Corredor das Marés e Ponte do Abismo | ambos | A água sobe, correnteza, plataformas móveis. Lucas quase cai e Marina ajuda (sequência interativa) |
| 7 | Câmara dos Cristais / Coração Azul | ambos | Grande momento visual: lago azul, partículas, zoom. Júlia fotografa, Lucas investiga, Bia interpreta |
| 8 | Fuga da caverna e retorno / Portas no Tempo | ambos | Fase de fuga. Volta ao barco, os cristais ressoam com o artefato, fendas temporais e gancho para a continuação |

### 3.3 Progressão
- **Personagens:** Marina é a única jogável na Fase 1. Os outros entram um por vez ("nunca todos de uma vez") e a troca de personagem fica liberada quando o grupo está junto [Plano ChatGPT].
- **Conteúdo:** checkpoints antes dos puzzles e dos chefes, sem punição exagerada [Plano ChatGPT]. As conchas e os colecionáveis desbloqueiam extras da HQ.
- **Ordem de construção de cada fase:** movimento → câmera → colisão → cenário → parallax → animação → inimigos → missões → puzzles → história [Plano ChatGPT].

---

## 4. Personagens e elementos visuais

### 4.1 Elenco
| Personagem | Papel na HQ | Na Fase 1 [Estado atual] | Habilidade prevista [Plano ChatGPT / GDD Grok] |
|---|---|---|---|
| **Marina Torres** | Líder exploradora, **protagonista** | Única jogável | Pulo, corrida, escalada, **bússola** (revela objetivos e segredos) |
| **Lucas Nogueira** | Inventor | NPC na Praça (pág. 3) | Ativa máquinas, conserta mecanismos, scanner. Plataformas temporárias [GDD Grok] |
| **Júlia Costa** | Fotógrafa | NPC no Mercado (pág. 3) | A câmera revela pistas e áreas distantes |
| **Bia Oliveira** | Guia local | NPC no Cais (pág. 4) | Passagens pequenas, lê símbolos antigos, rotas secretas |
| **Seu Toninho Marinho** | Marinheiro, dono do Esperança | NPC no Grande Píer (pág. 5) | Força: empurrar, girar mecanismos pesados, puxar cordas |
| **Faísca** | Cão da turma | Corre até o cais e puxa a rede (págs. 2 e 4) | Controlável por um tempo: corre rápido, passa por buracos, fareja rastros |

### 4.2 Regras visuais obrigatórias
- **Estilo [Plano ChatGPT]:** cartoon 2D infantojuvenil pintado à mão, contorno limpo, soft cel shading, cores vibrantes, luz cinematográfica de manhã e parallax em camadas. **Não** usar 3D, pixel art nem visual Pixar.
- **Regras do Daniel [arte_gpt/PEDIDOS.md]:** a ficha da HQ vence o texto do prompt.
  - Marina: sobrecamisa laranja e bússola no cinto.
  - Lucas: camiseta azul-marinho.
  - Júlia: locs finas e bandana amarela.
  - Bia: jardineira verde-sálvia, chapéu de palha e pingente de concha (só ela usa).
  - Toninho: lenço vermelho-alaranjado.
  - Faísca: coleira azul com estrela dourada, **sempre em quatro patas**, sem gesto humano.
  - Nenhum texto nas artes. O barco Esperança e o porto não mudam. Existe **um farol só**, que nunca se repete.
- **Escala [Estado atual]:** humanos +32% (`castScale.js`) e Faísca na altura do joelho. Altura e hitbox ficam fixas entre as poses.

### 4.3 Cenário e assets
- **Parallax em 8 camadas [Plano ChatGPT → Estado atual]:** céu 0,02 · horizonte 0,08 · ilhas 0,15 · vila distante 0,28 · vila média 0,48 · porto 0,70 · chão 1,00 · primeiro plano 1,08. Os painéis vêm de um mesmo panorama e são emendados com crossfade (`ParallaxManager.js` e o script `import_gpt_art.py`).
- **Vida no ambiente [Estado atual]:** gaivotas animadas (`SeagullSystem`), ondas, barcos balançando, vento, folhas, fumaça, peixe saltando e bandeirolas (`WindLife.js`). Também há god rays, color grading e juice no CLINC (`VisualFX.js`).
- **Kit de arte da Fase 1 [arte_gpt/PEDIDOS.md]:** 6 retratos de diálogo, painéis de cenário (sky, islands, village_far, village_mid, harbor) e props (Esperança, artefato, caixote, redes, barraca, chafariz, piso do píer).
- **Pendências de arte [REVISAO_DANIEL.md]:**
  - Retrato da Júlia: refazer (tom de pele e locs).
  - Retoques nos retratos da Marina e do Lucas e na cabine do Esperança.
  - Painéis do harbor estão repetitivos.
  - Decidir o farol de `village_far_02`.
  - Folhas de sprite com ciclo de caminhada real (célula 192×256).
- **Fluxo de arte [Estado atual]:** a arte é gerada no ChatGPT, o Daniel revisa e a importação é automática para o jogo.

---

## 5. Áudio e trilha

### 5.1 Música (Marcos, no Suno)
| Faixa | Direção [Plano ChatGPT] | Estado atual |
|---|---|---|
| Vila das Conchas | Aventura marítima alegre: violão/ukulele, flauta, percussão leve | ✅ **Pronta** (`music_vila.mp3`, em loop, com ducking em 0,35 nos diálogos) |
| Mistério (cena do artefato / Seu Toninho) | — | ⏳ **Pendente** |
| Mar | Cordas e flauta | a produzir |
| Caverna | Pads, ecos, timbres de cristal | a produzir |
| Fuga | Percussão e cordas rápidas | a produzir |

### 5.2 Efeitos sonoros (SFX)
- **Prontos [Estado atual]:** Kenney (CC0). Passos em madeira, pedra e grama (3 variações cada), pulo, pouso, concha, sino, CLINC, tábua e sons de UI (abrir, avançar e fechar diálogo, confirmar).
- **Faltam [Estado atual]:** ambientes de **ondas**, **gaivotas**, **feira** e **latido** do Faísca. O código já espera `amb_waves`, `amb_gulls`, `amb_market` e `sfx_bark` e fica em silêncio enquanto os arquivos não existirem. O `POLIMENTO_FASE1.md` lista fontes CC0 candidatas (Freesound/Soundspool) para ondas, gaivotas e porto. Ainda falta encontrar o latido e as vozes de feira.
- **Mixagem [Estado atual]:** buses music 0,6 · ambience 0,45 · sfx 0,8 · ui 0,5. Há 8 emissores posicionais no JSON (mar, gaivotas, madeira, porto, barcos), com volume pela distância [Plano ChatGPT §41].

---

## 6. Cronograma por etapas

Não há datas fixas nas fontes para as próximas fases. Os prazos abaixo são **estimativas de esforço [Proposta]**, para revisar a cada entrega. A única data registrada é 17/10/2026, quando os arquivos de entrega da Fase 1 foram gerados.

### Etapas concluídas ✅
| Etapa | Status |
|---|---|
| E0. Conceito e plano no ChatGPT, mais GDD/protótipo HTML no Grok | ✅ Concluído |
| E1. Protótipo jogável: movimento, câmera, colisão, chão contínuo e Esperança no final (a "ETAPA 2" do plano) | ✅ Concluído |
| E2. Vila viva: Faísca, Bia e a turma, 20 conchas, checkpoints, HUD, falas das págs. 1–5 e rede do cais (a "ETAPA 3" do plano) | ✅ Concluído |
| E3. Kit de arte da Fase 1 (ChatGPT) e revisão do Daniel | ✅ Concluído (com retoques pendentes, seção 4.3) |
| E4. Polimento: luz, água, juice, vento, transições, AudioManager e SFX Kenney, além de performance e limpeza | ✅ Concluído |
| E5. Builds: PC (zip v1→v6) e Android (APK v1.0→v1.5 via Capacitor, com controles de toque) | ✅ Concluído, 17/10/2026 |
| E6. Música da vila (Suno) | ✅ Concluído |

### Pendências da Fase 1 ⏳ (estimativa: poucos dias de trabalho)
- [ ] Música de mistério (Suno, Marcos)
- [ ] Ambientes de ondas, gaivotas e feira, e o latido do Faísca (CC0)
- [ ] Retoques de arte do Daniel (retrato da Júlia, harbor, cabine do Esperança, folhas de sprite)
- [ ] Confirmar a pausa (ESC) e o gamepad. Decidir se o Android vai ter correr

### Próximas etapas (estimativas)
| Etapa | Escopo | Estimativa de esforço |
|---|---|---|
| E7. Fase 2: Mar Aberto / Esperança | Arte do barco e do mar, puzzles de bordo, Lucas como 2º personagem | 2 a 4 semanas |
| E8. Fase 3: Polvo Gigante | 1º chefe (fuga/proteção), música do mar | 2 a 3 semanas |
| E9. Fase 4: Ilha e Ruínas | Novo tileset, primeiros inimigos, troca de personagem | 3 a 5 semanas |
| E10. Fases 5–6: Símbolos, Marés e Ponte | Puzzles de símbolos, água subindo, sequência da ponte | 4 a 6 semanas |
| E11. Fases 7–8: Coração Azul e Fuga/Portas no Tempo | Set piece dos cristais, fase de fuga, final e gancho | 4 a 6 semanas |
| E12. Sistemas globais | Menu de capítulos e coleções, mapa ilustrado, save completo, opções | em paralelo, 2 a 3 semanas |
| E13. Teste e publicação | Testes com o público de 8 a 13 anos, ajuste de dificuldade, lojas | a definir |

*As estimativas consideram o ritmo atual: um responsável por etapa e arte gerada por IA com revisão humana. Ainda precisam ser validadas pelo Marcos e pelo Kojima.*

---

## 7. Ferramentas e tecnologias

| Área | Ferramenta | Origem |
|---|---|---|
| Engine | **Phaser 3** (v3.90), JavaScript ES6 | Plano ChatGPT → Estado atual |
| Build / dev server | **Vite 6** | Estado atual |
| Android | **Capacitor 6** (APK, `com.turmadofarol.vila`, versionName 1.5) | Estado atual |
| PC | Build web empacotado em zip (roda no navegador) | Estado atual |
| Futuro (opcional) | Godot 4, para Steam/mobile maiores | Plano ChatGPT |
| Dados de nível | JSON (`fase1-vila.json`, falas, sprite sheets), `AssetManifest.js` | Plano ChatGPT §46 → Estado atual |
| Save | `localStorage` (checkpoints) | Plano ChatGPT → Estado atual |
| Arte | **ChatGPT** (geração de imagens), revisão do **Daniel**, importação com script Python (remoção de fundo, recorte, emenda) | Estado atual |
| HQ e referências | Canva (páginas da HQ), Google Drive (fichas e cenários) | Estado atual |
| Música | **Suno** (Marcos) | Estado atual |
| SFX | **Kenney** (CC0). Candidatos CC0 no Freesound/Soundspool | Estado atual |
| Programação e planejamento | **Grok** (código e GDD), ChatGPT (plano e revisões) | Estado atual |
| Formatos | WebP/JPG para fundos opacos, PNG para recortes, OGG/MP3 para áudio | Plano ChatGPT §44 / POLIMENTO |

---

## 8. Orçamento estimado

As fontes **não citam nenhum valor em dinheiro**. Por isso, nenhum valor foi inventado: onde não há dado, está "a definir".

| Item | Tipo | Custo |
|---|---|---|
| Assinatura do ChatGPT (geração de arte e plano) | assinatura | a definir |
| Assinatura do Grok (programação e GDD) | assinatura | a definir |
| Assinatura do Suno (música) | assinatura | a definir |
| Canva (HQ) | assinatura | a definir |
| Google Drive (armazenamento) | assinatura | a definir |
| SFX Kenney | licença CC0 | gratuito (CC0) |
| Ambientes CC0 (Freesound/Soundspool) | licença CC0 | gratuito (CC0), se as candidatas forem adotadas |
| Phaser 3, Vite e Capacitor | software livre (open source) | sem custo de licença |
| Equipe (Marcos, Daniel, Kojima) | horas | a definir |
| Conta de desenvolvedor Google Play / Steam | publicação | a definir |
| Testes com público, marketing | — | a definir |
| **Total** | | **a definir** |

---

## Fontes usadas
`plano_gpt.md` (base principal) · `CHECKLIST_FASE1.md` · `POLIMENTO_FASE1.md` · `arte_gpt/PEDIDOS.md` · `arte_gpt/REVISAO_DANIEL.md` · `grok_code/AGENTS.md` (contrato técnico do sandbox do Grok, sem dados de design) · `grok_code/PROJECT_STRUCTURE.txt` · `grok_code/artifacts/GDD_Misterio_Ilha_do_Farol.docx` · `grok_conversa.md` · `vila_local/` (código, `fase1-vila.json`, `capacitor.config.json`, `android/app/build.gradle`, áudio em `public/assets/audio`).
