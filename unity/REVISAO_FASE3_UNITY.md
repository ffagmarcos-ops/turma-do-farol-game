# Revisão funcional da fase 3 no Unity

22/10/2026 — projeto TurmaDoFarol, cena Fase3_Ilha da campanha ativa.

## Resultado

A ilha tinha as artes carregadas, mas várias ações ainda eram prévias estáticas da migração. Foram ligadas as ajudas, o combate e o encerramento com os dados da fase original. Não foram encontradas referências vazias de SpriteRenderer nas verificações dos setores A–O.

## Correções

- Marina: três caixas com preparação, empurrão, queda e superfície para subir. A trajetória é independente da taxa de quadros.
- Júlia: quatro áreas com flash no tempo da animação, atordoamento dos macacos, dissipação de pedras e opção de reduzir flashes respeitada.
- Lucas: quatro travessias, com 17 plataformas que surgem em sequência, oscilam, cedem com o peso e retornam quando Bia sai.
- Bia: investiga a pista com a própria protagonista e revela os sete apoios dos dois caminhos secretos, sem criar outra Bia.
- Faísca: animações de carga/latido, onda, alcance direcional e recarga de 3,5 segundos. O orbe recarrega o especial. Rotas alternativas usam as posições do mapa original.
- Caranguejos e macacos: estados animados de combate, duas vidas, ataques de garras, aviso e arremesso de pedras, dano, atordoamento e derrota. Inimigos derrotados ficam salvos.
- Concha: sai após 333 ms, segue em arco, mira os macacos elevados e cancela o lançamento pendente ao sofrer dano. Projéteis respeitam a pausa.
- Plataformas instáveis quebram e reaparecem; piso molhado altera a desaceleração. Bia acompanha o deslocamento das plataformas móveis.
- Treze segredos com cobertura e descoberta salva; cachoeira fica translúcida nas proximidades. Relíquia, orbe, dicas e espuma animada foram ligados.
- Encerramento na Caverna Azul, celebração, estatísticas e botões para explorar novamente ou voltar ao menu.
- Catálogo de sprites ligado à cena e configurações de importação dos atlas preservadas no projeto. Caixa e orbe usam os desenhos originais já existentes no código, exportados para a cópia Unity.

## Verificações

A rotina FarolIslandGameplayVerification executou 57 verificações no Unity em Play, todas aprovadas na última rodada. Inclui carregamento dos 15 setores, atlas dos NPCs, todas as ajudas, colisões das plataformas, quebra/restauração, transporte pela plataforma móvel, arremesso dos macacos, duas conchas para derrotar o caranguejo, latido, parede, orbe, relíquia, corda, respawn e encerramento.

Verificações adicionais aprovaram os 13 segredos (toca-rochas e fenda-costao exigem agachar), peso e retorno das boias, atraso/cancelamento da concha, pausa dos projéteis e persistência das ajudas/inimigos ao reabrir a cena. O botão de explorar a ilha novamente foi clicado e seu destino conferido.

Na versão web original, npm run dev abriu o teste de integração e as 554 verificações do navegador passaram. Os oito testes de dados e eventos também passaram.

Console final do Unity sem erros ou avisos; compilação concluída. Progresso original restaurado e conferido, com Play encerrado e Fase3_Ilha aberta.

## Como testar

Pressione Play com Fase3_Ilha aberta. Use A/D para andar, Shift para correr, Espaço para salto duplo, S para agachar, Z/J para concha e X/K segurado por 1,5 segundo e solto para o latido. Nas cordas, use ↑/↓, A/D e Espaço. Esc abre a pausa.

As ajudas ficam nos setores D (Toninho), F (Marina), H (Júlia), I (Lucas) e L (Bia). O final fica no setor O. A partida retoma o checkpoint salvo quando houver um.

## Limites da revisão

Os testes foram feitos por setor e por situações específicas, com deslocamento controlado da personagem. Não equivalem a uma partida contínua completa feita no teclado por uma pessoa. Algumas camadas de cenário continuam usando as artes provisórias já existentes no projeto; a revisão não criou nem substituiu ilustrações originais. Não foi gerado um novo build.
