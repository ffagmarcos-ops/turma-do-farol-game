# Menu dos Portais — catálogo p/ curadoria (nada no jogo). Fundo = salão noturno roxo.
| Prévia | Conteúdo | Nota |
|---|---|---|
| previews/preview_portal_vortex.png | Cosmic Time (25 efeitos: relógios mágicos, anéis, vórtices) + twirl Kenney | Destaque: Cosmic_08-10 parecem "janelas do tempo"; 23-25 = vórtice. |
| previews/preview_aneis_brilho.png | anéis e ondas de choque mágicas renderizadas em Blender (sequências) | Realistas/volumétricos. |
| previews/preview_particulas_magicas.png | magic Kenney + efeito mágico Blender | |
| previews/preview_poeira_luz.png | círculos/luzes suaves p/ poeira flutuante | Usar com tint e baixa opacidade. |
| previews/preview_brilhos_estrelas.png | estrelas/faíscas Kenney + sparkles animados (fundo preto → blend ADD) | Sparkles vwolfdog: confirmar se não ficam "cartoon". |
Responder por item: aprovado / com tint / reprovado.

## Curadoria Daniel (18/10)
Critério: salão de pedra/bronze/madeira no alto do farol; luz turquesa `#3fd6c8` e dourada `#f2c14e`. Nada de neon roxo/violeta saturado sem tint. Partículas só de APOIO: atrás dos personagens, nunca cobrem rostos. Anel de energia e vitral próprios continuam sendo a base.

**Portal / vórtice (Cosmic Time + twirl)**
- Cosmic_01 a Cosmic_12 (estrelas, mandalas, selos, esferas): **REJEITADOS**. Fantasia/neon e runas geométricas — conflitam com as runas de onda/concha do menu.
- Cosmic_08 a Cosmic_10 (relógios romanos / "janelas do tempo"): **REJEITADOS**. Relógio sci-fi destoa do farol HQ; o portal já tem vitral e anel próprios.
- Cosmic_13 a Cosmic_20 (halos/bursts): **REJEITADOS** na maioria — roxo saturado demais mesmo com tint leve.
- Cosmic_21 a Cosmic_25 (vórtice suave): **APROVADOS COM TINT** `#3fd6c8` (ou `#3fd6c8` + leve `#f2c14e` no núcleo). Blend ADD, alfa 0,35–0,6, escala contida DENTRO do vitral/anel, depth atrás da moldura e dos personagens. Só no portal abrindo/disponível.
- twirl_01 a twirl_03: **APROVADOS COM TINT** `#3fd6c8`. ADD/NORMAL misto, alfa baixo, como rastro curto ao girar o anel — não como slash de combate.

**Anéis de brilho (Blender ring + shockwave)**
- Sequência de anéis (blender_ring_magic): **APROVADA COM TINT** `#3fd6c8`. ADD, alfa 0,4–0,7, depth atrás da moldura do portal. Usar no "portal disponível/abrir".
- Sequência de puff/shockwave (blender_shockwave_magic): **APROVADA COM TINT** `#3fd6c8` (ou `#f2c14e` no flash inicial). ADD, alfa 0,35–0,55, um único pulso ao destrancar — não loop contínuo.

**Partículas mágicas**
- blender_magic_flat 0001–0030 (nuvem roxa): **APROVADOS COM TINT** `#3fd6c8`. NORMAL ou ADD suave, alfa 0,3–0,5, só como névoa no limiar do portal. Depth atrás.
- magic_01.png (pentágono) e magic_02.png (anel de círculos): **REJEITADOS**. Geometria oculta — fora da identidade de concha/onda.
- magic_03 a magic_05 (estrelas/brilho): **APROVADOS**. ADD, tint `#f2c14e` no dourado do bronze ou `#3fd6c8` no anel. Escala minúscula.

**Poeira de luz**
- circle_01 a circle_05: **APROVADOS COM TINT** `#f2c14e` (poeira dourada no salão) ou `#3fd6c8` perto do portal. NORMAL, alfa 0,3–0,5. Depth atrás.
- light_01 a light_03: **APROVADOS COM TINT** `#f2c14e`. Mesmo blend/alfa. Motes no feixe da lente; nunca cobrir rostos.

**Brilhos / estrelas**
- flare_01: **APROVADO COM TINT** `#f2c14e`. ADD, glint em bronze/concha.
- spark_01 a spark_07: **APROVADOS COM TINT** `#3fd6c8` (anel) ou `#f2c14e` (bronze). ADD, impacto curto ao abrir portal / coletar concha.
- star_01, star_04, star_06, star_07: **APROVADOS**. ADD, brilho de UI e do vitral.
- star_02, star_03, star_05, star_08, star_09: **REJEITADOS** (excesso / cartoon), alinhado à curadoria da Fase 2.
- sparkles_vwolfdog (0001–0035, poeira escura): **REJEITADOS**. Sujeira/fuligem no fundo preto — não serve de sparkle ADD no salão; usar circle/light acima.

**Sons:** fora da curadoria.

---
## Músicas v3.1 (18/10) — candidatas CC0 para o MENU, o HUB e a tensão da Fase 2
Arquivos originais em `assets_externos/musica_v31/raw/`. Todas **CC0** (OpenGameArt, licença conferida na página de cada uma).

| Uso | Faixa | Autor | Link | Duração | Observação | Escolha |
|---|---|---|---|---|---|---|
| Menu principal | Treasure Hunter | TAD | https://opengameart.org/content/treasure-hunter | 1:05 (loop) | orquestral, aventura quente, feita para loop | **ESCOLHIDA** |
| Menu principal (alt.) | Pirate's Orchestra | Dizzy Crow | https://opengameart.org/content/pirates-orchestra-208 | 2:08 | orquestra + acordeão, clima de vila de pescadores; não é loop perfeito | alternativa |
| Menu principal (alt.) | Pirate Ship Theme Loop | beardalaxy | https://opengameart.org/content/pirate-ship-theme-loop | 0:16 (loop) | curta, mais "chiptune" | alternativa |
| Menu principal (alt.) | Last Journey | Crocdent | https://opengameart.org/content/last-journey | loops no zip | orquestral calmo | alternativa |
| Hub dos portais | Mystical Enigmatic Background Music | cleytonkauffman | https://opengameart.org/content/mystical-enigmatic-background-music | loop | mistério; volume subido ~5 dB para igualar | **MANTIDA** |
| Hub dos portais (alt.) | Deep Blue Ambient Piano | yoiyami | https://opengameart.org/content/yoiyami-core-theme-–-deep-blue-ambient-piano | loop | piano calmo | alternativa |
| Fase 2, polvo com ≤ 28% de vida | Pirate Indenture (loop) | Eldritch Grim | https://opengameart.org/content/pirate-indenture | 0:14 (loop) | épica e rápida; crossfade de 2,5 s + tambor grave sintetizado no código | descartada (Marcos: só a faixa longa) |

Daniel: se preferir outra, é só trocar o arquivo (`audio/menu/musica_menu.ogg`, `audio/menu/musica_mistica.ogg`, `audio/fase2/bgm_boss_tenso.mp3`).

### Revisão Daniel aplicada (v3.2)
- Todas as músicas do jogo normalizadas a **-16 LUFS** (loudnorm 2 passadas, TP -1.5).
- Treasure Hunter: laço com crossfade de 1 s no ponto de volta.
- Fase 2: tensão (≤ 28% de vida) até o fim = **Pirate's Orchestra** (Dizzy Crow, 128 s, CC0), única faixa tensa; na fúria final só entra o tambor grave sintetizado. Pirate Indenture removida.
- Mystical Enigmatic: original + página salva + captura da licença (CC0) em `musica_v31/raw/` (`LICENCA_mystical_enigmatic.txt`). Licença CC0 confirmada; mantida.
