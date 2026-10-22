# Cordas e Seu Toninho no Unity — 22/10/2026

Branch: `integrar-cordas-ilha`.

## O problema

A ilha tinha imagens de cordas e o Seu Toninho, porém faltavam a lógica de lançamento e a ligação com os controles e a física da protagonista. Os dados completos já existiam no jogo original.

## Implementação

`FarolIslandRopes` usa o mapa original para as 16 cordas (14 já disponíveis e duas lançadas pelo Toninho). Ao entrar na zona de ajuda, Toninho prepara o lançamento por 0,65 s e solta a corda no evento de animação de 285,714 ms. A corda desce a 920 px/s. O progresso fica salvo.

A protagonista agarra pulando perto da corda ou apertando ↑/W/E. Na corda: ↑/↓ sobe/desce, A/D balança e A/D + Espaço salta. Ao alcançar o topo, sai para a borda. Descer até a ponta solta a corda. A física, o amortecimento e os impulsos usam os valores do original. A pose de escalada usa `bia.jump`, como o mapeamento original da Bia.

O controlador normal deixa temporariamente de comandar o corpo durante a escalada e recupera gravidade e movimento ao soltar. Dano e renascimento interrompem a corda. O estado suporta a recarga dos scripts no Unity sem deixar o jogador suspenso. A nova preparação de campanha inclui a referência ao mapa automaticamente.

## Testes no Editor em Play

- As 16 cordas do mapa inicializadas.
- Entrada real na zona do Toninho iniciou a animação, o lançamento e a gravação do progresso.
- Agarrar desliga gravidade; subir altera a distância ao topo; balançar produz impulso.
- Salto solta a corda e restaura velocidade e gravidade normais.
- Saída no topo posiciona a protagonista sobre a borda; recaptura imediata bloqueada por 0,42 s.
- Renascer solta a corda e recupera a física.
- Recompilação real dos scripts com a protagonista pendurada: cordas, referência do jogador e sessão sobreviveram; o salto continuou funcionando depois.
- Recarregar a cena mantém a corda do Toninho disponível.
- Console sem erros/avisos após os testes.
- Progresso de campanha e ilha restaurado; cena salva sem estado de teste; Play encerrado.

## Para testar

Abra `Assets/Farol/Campanha_20261021_215901/Fase3_Ilha.unity` e pressione Play. Na área do Seu Toninho, entre na zona de aproximação. Aguarde a corda descer, pule em direção a ela ou aperte ↑/E. Suba, balance e salte para a borda. O texto na tela mostra os controles enquanto estiver na corda.

Esta etapa conclui as cordas e a ajuda do Toninho. Marina, Júlia, Lucas, rotas secretas e encerramento da ilha ainda têm interações pendentes. A Fase 3 completa ainda não foi validada de ponta a ponta.
