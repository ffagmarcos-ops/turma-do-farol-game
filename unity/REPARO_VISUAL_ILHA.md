# Reparo visual da ilha no Unity — 22/10/2026

Branch: `corrigir-sprites-ilha`.

## Causas e correções

Os scripts buscavam estados como `faisca.idle`, mas os estados reais do Animator tinham nomes como `faisca_idle`. A busca falhava e vários personagens e efeitos exibiam a Bia, que era a animação padrão. As chamadas de Bia, Faísca, inimigos e poses de ajudantes agora usam os nomes existentes. O gerador também cria esses nomes explicitamente.

85 definições de decorações sem PNG e 71 camadas de fundo omitidas eram desenhadas em Canvas pelo código original. `tools/exportar_decor_unity.mjs` renderiza exatamente as funções de `src/game/fase3/Fase3Placeholders.js`, usando @napi-rs/canvas. Foram exportados 31 desenhos distintos, sem modificar as artes originais. No Unity, `FarolIslandVisualRepair.Apply()` restaura 191 decorações e as 71 camadas faltantes, mantendo alturas e posições do manifesto.

`FarolParallaxLayer.verticalCenter` permite o posicionamento vertical original das camadas; as camadas existentes continuam com centro em 5,4.

## Verificações

- 259 objetos de decoração com sprite válido e sem marcação de arte faltante (191 restaurados nesta etapa).
- 90 camadas completas nos 15 setores, com pelo menos três painéis e nenhuma referência de sprite ausente.
- Estados dos personagens e efeitos encontrados; Bia alterna andar, correr, pular, cair, rastejar, arremessar e repousar.
- Capturas no Play da praia, floresta e entrada da caverna. Faísca e inimigos exibem suas próprias artes.
- Console sem erros e sem avisos após carregar e testar os setores.
- Progresso da campanha e da ilha restaurado após os testes.

## Como testar

A cena da ilha na campanha continua em `Assets/Farol/Campanha_20261021_215901/Fase3_Ilha.unity`. Pressione Play. Bia é a protagonista; Faísca deve aparecer como cachorro e acompanhar Bia. Os blocos cinza de decoração foram substituídos pelos desenhos provisórios originais. As florestas e a caverna agora possuem seus fundos.

Os desenhos recuperados são provisórios e já existiam no projeto original. Esta etapa não cria novas artes finais nem conclui as mecânicas de ajudantes, cordas e encerramento da ilha, que permanecem em revisão.
