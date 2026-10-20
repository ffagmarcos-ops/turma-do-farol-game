# Integração dos assets da Ilha do Farol

## Origem e escopo

O pacote 06–37 já estava publicado em `main` no commit `025d38b`: 32 PNGs, seus atlas e 69 animações. A reconstrução de 20/10/2026 usa esses arquivos existentes. Não recupera o commit perdido `346cdad` e não substitui as artes originais.

As oito imagens adicionais `arvores`, `ceu`, `folhagem`, `folhas`, `ilhas`, `objetos`, `oceano` e `terreno` não foram localizadas. Esta implementação mantém as camadas existentes e usa recortes do pacote nos terrenos, objetos e efeitos. Não há dependência dessas oito imagens.

## Geometria

`tools/medir_atlas_fase3.py` mede a transparência dos PNGs e gera `src/game/fase3/atlas_registration.json`. Requer Pillow; não modifica imagens. `AtlasGeometry.js` usa essas medidas para ancorar os pés e conservar a hitbox quando a animação muda de atlas.

A Bia mantém a hitbox no mundo em 70,52 × 167,28; agachada, 70,52 × 95,12. A escala visual das ações acompanha a locomoção. O nome interno `Sofia.js` é mantido por compatibilidade; o pacote define Bia como protagonista única. `BiaHelper` controla a descoberta da própria protagonista, sem criar outro NPC.

## Ações

`AnimationEvents.js` dispara os eventos ao atravessar o tempo indicado no manifesto.

| Ação | Instante |
|---|---|
| Soltar concha da Bia | 333 ms |
| Soltar pedra do macaco | 400 ms |
| Lançar corda do Toninho | 285 ms |
| Flash da Júlia | 375 ms |
| Ativar plataformas do Lucas | 1000 ms |
| Descoberta da Bia | 400 ms |

Dano, respawn, mudança de ação e desmontagem dos controladores cancelam os eventos pendentes. Cada arremesso produz um projétil. O ataque do caranguejo tem janela de garras entre 167 e 333 ms. O Faísca mantém uma única onda visual por disparo.

## Terrenos e efeitos

`PACK_TILES`, `PACK_PROPS` e `PACK_IMAGES` em `Fase3Assets.js` são os mapeamentos dos recortes existentes. `SceneryTextures.js` compõe texturas pequenas em memória, preservando as dimensões das plataformas e suas colisões. Artes soltas existentes continuam tendo prioridade. Ondas, cachoeiras e plataformas quebráveis usam os quadros do pacote; os checkpoints e o elenco final conservam os atlas oficiais.

## Verificar

1. Rodar `node --test tools/testar_eventos_animacao.mjs tools/testar_integracao_fase3.mjs`.
2. Rodar `npm run dev` e abrir `/tools/testar_integracao_fase3.html`. A página usa um iframe de teste e verifica atlas, quadros, hitboxes, ações, recortes e montagem de chunks dos setores A–O.
3. Abrir `/?fase3=novo`. Andar e correr com setas/Shift, pular com Espaço, agachar com seta para baixo e arremessar com J/X. A concha deve sair depois da preparação do braço, com os pés estáveis.
4. Abrir `?fase3=D0`, `F0`, `H0`, `I0`, `L0` e `O0` para conferir Toninho, Marina, Júlia, Lucas, a investigação e o encerramento. No setor L, parar junto à pista para Bia investigar.

Os testes de montagem e das ações não equivalem a percorrer a fase completa no celular. Não foram gerados APK, ZIP ou artes novas.
