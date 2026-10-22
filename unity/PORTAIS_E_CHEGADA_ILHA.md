# Portais e ligação Polvo → Ilha no Unity

Implementado em 21/10/2026. Branch: `integrar-portais-chegada-ilha`.

## O que mudou

O final nativo chamava um diálogo inexistente (`vitoria`), portanto não mostrava a sequência original nem abria a ilha. Agora o tiro final inicia os dez quadros/falas originais (`cut_p0`, `cut_curva`, `cut_epilogo`, `cut_gancho`), concede 30 conchas uma vez por aventura e abre a Fase 3. Pular a sequência também chega à ilha. Continuar retoma a ilha; sair durante o encerramento permite retomá-lo.

Portais acessíveis pelo menu e pela pausa. Tela com 15 entradas: os 14 portais originais e o acesso gratuito à Fase 3, liberado pela vitória sobre o polvo. Preços importados diretamente da tabela original. Compras verificam saldo e requisitos, não cobram duas vezes e persistem entre cenas. Foco inicial da confirmação em “Agora não”; abrir exige segurar o botão por 0,6 segundo. Carteira e desbloqueios permanecem ao iniciar nova aventura.

As 36 cartas usam os textos e as imagens existentes. Álbum seleciona fotos, imagens permitem ampliação, lente gira ao toque e nós exibem os quadros animados. O mapa mostra o total de conchas da vila.

A chegada usa checkpoint na praia e integra a carteira da ilha à campanha, com pausa única e acesso aos portais. A cena antiga da ilha foi preservada; a campanha usa uma cópia.

## Como testar

1. No Unity, a cena aberta é `Assets/Farol/Campanha_20261021_215901/Menu_Campanha.unity`. Pressione Play.
2. Clique em **Portais do Farol**. Portais de fases respeitam os desbloqueios; curiosidades mostram o custo. Com saldo, escolha uma porta, confira “Agora não” e segure “Abrir” por 0,6 segundo.
3. Para o caminho completo, jogue a vila e embarque. Para ir direto à batalha, use **Testar Fase 2 · O Polvo Gigante**.
4. Vença o polvo com o tiro carregado final. Avance os quadros pelo botão Continuar ou E/Enter/Espaço. Ao terminar, a ilha abre automaticamente.
5. Na ilha, Esc abre a pausa com acesso aos portais e ao menu. No menu, Continuar retorna à ilha.

## Validação realizada

- Unity compilou sem erros de C#.
- 15 portais; requisitos; saldo insuficiente; preço exato; compra idempotente.
- Eventos de ponteiro: toque breve sem cobrança e compra por pressão longa; curiosidade aberta após compra.
- Saldo e desbloqueios mantidos após carregar outra cena.
- Todas as imagens das 36 cartas presentes na biblioteca.
- Tiro final real da batalha em preparação controlada: vitória → bônus → sequência; dez quadros conferidos na ordem → ilha.
- Pular sequência, bônus não repetido, checkpoint de chegada, coleta idempotente na carteira e pausa unificada.
- Menu → Continuar → ilha.
- Desbloqueios permanentes preservados e jogador novo bloqueado; cinco cenas válidas na lista de execução.
- Versão original aberta com `npm run dev`; menu carregou. Nenhum código de gameplay do Phaser foi alterado.
- Progresso de campanha e progresso anterior da ilha restaurados após os testes. Unity parado no menu; execução em segundo plano restaurada.

## Limites observados

A Fase 3 ainda é a base migrada existente, não uma fase finalizada. Foram observados problemas visuais de sprites/camadas e avisos de estados de Animator ausentes em `FarolPose`/`FarolCompanion`. A conexão foi validada; não foi concluída a revisão de todas as mecânicas, artes ou do percurso completo da ilha. Os portais do Unity usam uma galeria de seleção, não reproduzem ainda o corredor caminhável do Phaser. O mapa das cartas apresenta o total, sem contagem por zona.

## Arquivos principais

`Assets/Farol/Scripts/FarolCampaign.cs`, `FarolCampaignPortals.cs`, `FarolOctopusBattle.cs`, `FarolGameSession.cs`; interface `Assets/Farol/UI/Campanha.uxml/.uss`; preparação `Assets/Farol/Editor/FarolCampaignSetup.cs`; exportação `tools/exportar_campanha_unity.py`.

Cenas e biblioteca novas: `Assets/Farol/Campanha_20261021_215901/`. A lista de execução aponta para esta campanha. Artes originais preservadas; metadados de importação das novas imagens foram atualizados pelo próprio Unity para Texture2D.
