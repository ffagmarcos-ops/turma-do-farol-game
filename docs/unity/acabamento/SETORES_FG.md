# Clareira F e desfiladeiro G

Pacotes `clareira-marina-pacote-v01` e `desfiladeiro-pacote-v01` importados para `Bloco08Clareira` e `Bloco09Desfiladeiro`, sem alterar PNGs. ORIGEM.json contém fontes e hashes; MANIFESTO.json conserva âncoras e posições.

Aplicado na campanha e na referência: painéis rochosos grandes de F/G, fundo de pilares de G, floresta aberta C em F. Reuso de céu/mar A, falésias B, árvores/raízes/terra/galhos C, cipós E e variantes de lajes E. Personagens, caixa, inimigos, geometria, progressão e estados de quebra preservados. O estudo da base de parede quebrável não substitui os estados originais.

Transições E→F e F→G cruzam camadas em dez metros. Céu compartilhado até G; mar/falésias reaparecem gradualmente no desfiladeiro. Um material comum com alfa nas bordas suaviza a junta mineral do platô F3/G0. Primeiro plano reutilizado com fator 1,24. Decoração próxima aos segredos perde opacidade para liberar a leitura.

A migração nativa tinha o movimento das quatro plataformas suspensas G, mas não desenhava suas cordas. Foram adicionadas duas linhas visuais em cada uma, com âncoras nas alturas do mapa e extremidades acompanhando o corpo móvel. Nenhuma colisão ou regra de balanço foi adicionada.

## Validação

Jogo avançando; materiais válidos e sprites carregados. Apoios F/G estáveis; a amostra G2 foi repetida fora do percurso da plataforma vertical, pois o primeiro raio atingiu o apoio móvel. Três caixas da Marina atingiram os destinos; corda G0 permite agarrar/soltar; plataforma móvel carrega a personagem; quatro instáveis quebram e restauram. Segredos pedra-marina e fenda-desfiladeiro descobertos agachada. Os dois desvios G do Faísca iniciam e reencontram no platô, retestados após limpar apenas a memória da partida de teste. Parede G quebra com latido.

Quatro pares de cordas acompanham os apoios. Transições verificadas no início/meio/fim com posição da personagem fixada durante a amostragem. Capturas de F0/G0 revisadas; nenhum erro novo no Unity. Servidor web respondeu HTTP 200; mudança visual entregue no Unity.

Ao encerrar o Play, os dois registros de progresso foram restaurados exatamente e a comparação completa dos colisores confirmou que ficaram idênticos ao estado anterior à integração.

## Conferir

Turma do Farol → Acabamento → Testar praia da HQ; avançar até a Clareira da Marina e o Desfiladeiro. Aproxime-se da Marina para mover as caixas. Nas cordas, ↑/E para agarrar e A/D+Espaço para saltar. Agache com S/baixo nos segredos. Sair do Play devolve o progresso anterior.

As pinturas mantêm simetrias e detalhes reconhecíveis sob repetição; as juntas não foram certificadas como seamless. H/I/J foram solicitados antes da aplicação, priorizando reuso e o material já existente do riacho; não estão incluídos nesta entrega.
