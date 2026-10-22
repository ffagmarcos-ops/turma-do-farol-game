# Praia — nova direção da HQ aplicada no Unity

Escopo: setor A, Praia da Chegada, na campanha e na cena de referência. Fonte: pacote `praia-pacote-v01` do chat de artes, seguindo a proposta aprovada pelo Marcos. Personagens, inimigos, mecânicas, posições e colisores foram preservados.

## Emendas identificadas e solução aplicada

| Problema recebido | Solução na montagem |
|---|---|
| Nuvens com mudança abrupta entre direita e esquerda | Repetição alternadamente espelhada: cada borda encontra a própria imagem refletida |
| Perfil das montanhas e copas diferente nas duas pontas | Mesma continuidade por espelhamento, com período de 38,4 unidades para céu/relevo/mar e 21,12 para vegetação |
| Padrões do mar distante reconhecíveis | Período longo e repetição refletida; não altera a água física próxima |
| Rochas com diferença entre topo e preenchimento | Malha de cobertura com opacidade progressiva, misturando topo e preenchimento no próprio material |
| Terreno repetido com bordas visíveis | UVs refletidas em X/Y, alinhadas às coordenadas do mapa; últimos módulos recortados sem esticar o desenho |
| Cantos recebidos com vista incompatível com a lateral do jogo | Não comprimidos ou usados como rampas; a cobertura segue os limites reais dos colisores existentes |

A solução preserva os PNGs recebidos e resolve as juntas na geometria/renderização. Ela não transforma os arquivos originais em texturas seamless universais. A repetição refletida pode ser reconhecida em panorâmicas muito amplas; não há mudança brusca de borda no percurso preparado.

## Aplicação

- Céu, relevo costeiro distante, mar distante e vegetação intermediária em camadas independentes.
- Palmeira, árvore costeira, arbustos, samambaias e pedras substituem as respectivas decorações da praia.
- Topos e preenchimentos de areia/rocha usam os materiais novos; apoios de areia em y=12 e rocha em y=8 no tile de128px.
- Planos próximos provisórios da praia foram desativados para preservar a leitura dos personagens.
- Imagens recebidas, incluindo transições e cantos, ficam em `Assets/Farol/Visual/Bloco03Praia`, com manifesto de origem e hash.
- Os novos cenários estão nas duas cenas, mas o teste da praia usa a campanha com sua renderização padrão. A referência do riacho mantém o próprio modo URP.

## Limites de escopo

O pacote recebido cobre a praia. O costão, a floresta, as ruínas e a caverna continuam aguardando seus próprios pacotes na nova direção artística. A passagem para os ambientes ainda antigos não representa a direção final de toda a fase. Nenhum novo portal, história, objeto interativo ou armadilha foi acrescentado a partir das pranchas.

## Testes e acesso

20 verificações de execução passaram: avanço de quadros, materiais/shaders, ausência de novos colisores, dez apoios do setor A, pulo/aterrissagem, quatro camadas e alinhamento das emendas em x=12,42e68. As capturas de chegada e rochas foram inspecionadas. A vegetação intermediária foi reduzida uniformemente para55% e reposicionada para abrir o mar sem deformar árvores.

No Unity: **Turma do Farol → Acabamento → Testar praia da HQ**. O atalho abre uma partida temporária desde a praia. Sair do Play restaura o progresso anterior; a cópia de recuperação do atalho fica nas preferências locais do Editor, fora do Git. A cena da campanha permanece com a nova arte.

O menu web existente também foi aberto pelo servidor de desenvolvimento. Nenhum arquivo do jogo web foi alterado por esta integração Unity. Não foi feita medição em dispositivo móvel.

A comparação final de todos os colisores da campanha permaneceu idêntica. Os registros de progresso da campanha e da ilha foram restaurados e comparados ao backup feito antes da inspeção.

O novo atalho foi testado: inicia na praia e, ao encerrar o Play, restaura os registros da campanha/ilha e a execução em segundo plano. Avisos de nome interno das malhas foram corrigidos nos assets e na ferramenta de montagem.
