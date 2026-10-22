# Turma do Farol — planejamento de acabamento visual no Unity

**Revisão 3 · 21 de outubro de 2026 · Foco: apresentação visual das fases existentes e água interativa em todo o jogo**

Esta revisão mantém a correção do Marcos sobre as fases concluídas e acrescenta seu pedido de água transparente, objetos flutuantes e cachoeiras como padrão geral. O projeto já tem conteúdo e percurso definidos. A próxima frente de trabalho é melhorar sua apresentação no Unity, aproveitando as artes e os sistemas existentes. Este documento descreve o trabalho a implementar; os efeitos ainda não foram aplicados no Editor.

## 1. Ponto de partida correto

| Parte do jogo | Situação informada pelo Marcos | Trabalho visual previsto |
|---|---|---|
| Fase 1 — Vila das Conchas | Fase concluída | Harmonizar os pontos que precisarem de ajuste, conservando o acabamento já aprovado |
| Fase 2 — Mar aberto | Boss fight com o polvo | Refinar a apresentação do chefe, tentáculos, barco, água e tempestade |
| Fase 3 — Ilha das Cavernas Azuis | Percurso completo até o final | Aplicar o acabamento visual ao mapa inteiro, seguindo os trechos que já existem |

A conclusão do percurso da Fase 3 é a base do planejamento. Seus trechos, plataformas, encontros e chegada ao final não entram novamente como tarefas de criação.

O estado do jogo existente e a validação de sua migração para Unity são registros diferentes. Quando uma adaptação técnica for necessária para exibir uma arte ou um efeito no Unity, ela será tratada como uma tarefa específica de integração. Este documento não declara que toda a equivalência de funcionamento no novo motor já foi testada.

**Prioridade principal:** acabamento visual da Fase 3. A Vila funciona como conteúdo concluído a preservar e harmonizar; a batalha do polvo recebe uma passagem própria de acabamento.

**Ajuste global obrigatório:** todas as áreas de água existentes usarão um padrão comum de transparência, movimento, contato com objetos e efeitos. O sistema terá variações para a Vila, o mar da batalha e a ilha. Cachoeiras existentes recebem o mesmo tratamento; ambientes secos mantêm sua composição.

## 2. Resultado que buscamos

Uma aventura 2D com a identidade da HQ, personagens integrados ao ambiente, profundidade entre as camadas e leitura clara do caminho.

O ganho visual deve aparecer principalmente em:

- Cenários com composição consistente, escala correta e transições naturais.
- Terreno e plataformas com acabamento que corresponda à superfície jogável.
- Objetos posicionados com propósito e coerência de perspectiva.
- Personagens com qualidade uniforme e animações visualmente estáveis.
- Luz, atmosfera, água transparente e partículas que valorizem cada ambiente.
- Objetos flutuantes com contato convincente com a superfície, além de cachoeiras com queda, espuma e respingos.
- Interface e efeitos que combinem com a direção de arte.

A referência de composição continua sendo a tela horizontal do jogo, com 1920 × 1080 como base de enquadramento. A resolução de cada arquivo será definida conforme seu uso e tamanho na tela.

## 3. Direção de arte

**Estilo:** cartoon 2D infantojuvenil de aventura, pintura detalhada, contornos limpos, cores vivas e iluminação cinematográfica moderada. A apresentação preserva o desenho da HQ.

**Referências fixas:** as fichas aprovadas orientam rosto, cabelo, roupas, acessórios, proporções e cores. Bia é a personagem jogável da Fase 3; Júlia continua sendo a fotógrafa. Faísca mantém suas quatro patas e sua identidade.

**Elementos narrativos:** o artefato é a chave antiga com espiral e três cristais azuis. O barco Esperança conserva sua identidade. A tempestade da Fase 2 acontece no mar aberto, sem farol no cenário.

**Hierarquia de leitura:** personagem e perigos precisam se destacar; terreno jogável deve ser reconhecível; detalhes decorativos ocupam um nível visual secundário. A riqueza do fundo não pode tornar uma plataforma falsa parecida com uma passagem real.

**Coerência:** comparar lado a lado personagens, objetos e fundos para ajustar saturação, espessura de contorno, direção da luz e nível de detalhe. A aparência pintada das imagens é a referência para regular a iluminação do motor.

## 4. Recursos do Unity aplicados ao visual

| Recurso | Aplicação proposta | Cuidado na integração |
|---|---|---|
| URP com 2D Renderer e luzes 2D | Iluminação localizada, atmosfera das cavernas, luz de lanternas e cristais | Comparar as cores com a arte aprovada e conferir os materiais usados |
| SpriteRenderer, Sorting Layers e Sorting Groups | Organizar fundo, personagens, terreno, objetos e primeiro plano | Evitar elementos aparecendo na frente ou atrás da camada errada |
| Parallax | Dar profundidade ao mar, à vegetação, à vila e aos interiores | Manter a continuidade entre imagens e a estabilidade do horizonte |
| Animator e Animation Clips | Refinar a apresentação das sequências de sprites existentes | Preservar os momentos de ataque, interação e colisão |
| Cinemachine | Ajustar suavidade, limites e enquadramentos quando isso melhorar a leitura | Conservar a visão dos saltos, dos perigos e da arena do chefe |
| Prefabs e variantes | Aplicar o mesmo acabamento a objetos repetidos | Separar a aparência dos componentes que já determinam o funcionamento |
| Tilemap e Rule Tiles | Acabamento de superfícies repetidas, quando o terreno existente se beneficiar | Manter o desenho e a posição das superfícies do percurso |
| Particle System e materiais específicos | Espuma, chuva, folhas, poeira, brilhos e impactos | Limitar intensidade, quantidade e cobertura sobre a ação |
| Shader Graph e materiais compatíveis com o 2D Renderer | Água transparente com movimento, brilho e distorção suave; materiais de cachoeira | Validar a captura das camadas 2D e oferecer versão leve do efeito |
| Buoyancy Effector 2D e Rigidbody2D | Flutuação simples, resistência e correnteza nos objetos selecionados | O nível nativo é horizontal; acompanhar ondas visuais exige tratamento adicional |
| Sprite Atlas e configurações por plataforma | Organizar texturas e controlar resolução e memória | Medir o resultado e preservar a qualidade das imagens principais |
| Canvas e TextMeshPro | Harmonizar textos, molduras, ícones e botões | Manter legibilidade e espaço suficiente para o jogo |

Manter a linha Unity 6.3 LTS prevista para o projeto. As versões dos pacotes serão escolhidas pela compatibilidade com o Editor. A preparação do URP, se necessária, começa em uma cena ou cópia de trabalho de um trecho existente, conferindo materiais antes de aplicar o padrão ao restante.

Timeline poderá ser usada para acabamento de transições já existentes quando houver benefício. Novas cenas narrativas não são uma entrega obrigatória desta revisão.

### 4.1 Água transparente e interativa — padrão para todo o jogo

**Objetivo visual:** água com comportamento convincente, transparência e sensação de volume, preservando a linguagem 2D pintada da HQ. O realismo vem do movimento, da luz, da profundidade e do contato com os objetos. A proposta usa URP com 2D Renderer.

#### Aparência da superfície

- Permitir enxergar pedras, fundo e partes submersas em águas rasas, com transparência ajustável por ambiente.
- Usar gradação de cor e opacidade para sugerir profundidade: margens mais claras e regiões profundas mais densas.
- Animar pequenas ondas, brilho e distorção discreta da imagem sob a água. A tempestade terá movimento mais intenso.
- Adicionar espuma nas margens e no contato com pedras, barco e quedas; gerar ondulações e respingos quando houver interação.
- Manter personagens, plataformas e sinais de perigo legíveis. O efeito deve combinar com os contornos e as cores das artes.

A transparência resulta de um material animado sobre o cenário. As imagens de água fornecem texturas, máscaras e detalhes que esse material combina.

#### Objetos que boiam

O Unity oferece **Buoyancy Effector 2D** para aplicar empuxo, resistência e fluxo a corpos com **Rigidbody2D**. Ele é a base proposta para caixas, barris, madeira e outros objetos marcados como flutuantes.

O **Surface Level** desse componente é horizontal e não acompanha automaticamente as ondas desenhadas pelo shader. Para uma peça seguir uma crista visível, será necessário compartilhar a função de altura da onda com forças próprias ou usar uma oscilação visual controlada. Cada objeto terá uma única solução de empuxo, evitando somar dois sistemas de flutuação.

Definir por objeto: linha de imersão, densidade, resistência, inclinação máxima e amplitude de movimento. O peso aparente precisa combinar com a arte. Água apenas decorativa pode usar somente animação visual.

**Barco Esperança:** conservar o convés e a arena da batalha funcionais. Priorizar balanço visual limitado e movimento da água ao redor; qualquer movimento físico do barco exige conferir apoio dos personagens, colisões e alcance dos ataques.

**Objetos usados como apoio:** limitar deslocamento e inclinação aos valores que mantenham os saltos e as travessias existentes. As regras atuais de Bia, Faísca e demais personagens ao tocar a água continuam sendo a referência; esta melhoria não acrescenta natação automaticamente.

#### Cachoeiras e correntezas

Usar faixas ou sprites semitransparentes com textura animada para baixo, pequenas variações no contorno e espuma nas bordas. Na base, combinar respingos, névoa localizada, espuma e ondulações na água que recebe a queda. Integrar um som ambiente de alcance limitado quando o trecho tiver áudio correspondente.

A queda deve parecer contínua e conectada à origem e ao ponto de chegada. A névoa e os respingos precisam deixar o caminho visível. Correnteza física só será aplicada onde for compatível com a interação prevista no trecho.

#### Perfis por ambiente

| Perfil | Aparência | Flutuação e contato |
|---|---|---|
| Vila das Conchas | Água costeira clara, pequenas ondas, reflexos suaves e fundo visível nas margens | Balanço leve dos objetos selecionados e espuma discreta junto ao píer |
| Mar da batalha do polvo | Ondas fortes, espuma, luz fria e transparência menor nas áreas profundas | Respingos de tentáculos e barco; estabilidade do convés e sinais dos ataques preservados |
| Ilha e Cavernas Azuis | Água clara em tons naturais ou turquesa, com brilho localizado conforme o cenário | Objetos selecionados, ondulações em travessias e cachoeiras nos pontos já existentes |

Esses perfis pertencem ao mesmo sistema. Ajustar cor, transparência, velocidade, espuma e intensidade por trecho, mantendo a unidade do jogo. A transparência deve responder à profundidade e ao clima.

#### Estrutura proposta no Unity

Criar prefabs reutilizáveis para superfície de água, volume de flutuação, cachoeira e efeitos de contato, com materiais e perfis compartilhados. Separar a parte visual da área física e aplicar a física apenas onde houver objetos que precisem reagir.

Para a refração em URP 2D, validar a **Camera Sorting Layer Texture** do 2D Renderer, capturando as camadas de fundo e elementos submersos antes da água. A imagem capturada deve excluir a interface. O nó **Scene Color** em URP consulta a textura opaca, que pode não conter os sprites transparentes do cenário; por isso, não basta ativá-lo e esperar que toda a cena 2D apareça refletida ou distorcida. Reflexos adicionais serão estilizados e limitados ao que trouxer ganho visível.

Prever dois perfis de qualidade: completo, com distorção e mais partículas; leve, com transparência e animação de superfície, reduzindo captura, detalhes e partículas. A flutuação funcional continua consistente nos dois. Medir custo de transparências sobrepostas, luzes e captura de tela nos dispositivos alvo.

#### Critérios de aceitação

1. Em água rasa, enxergar o fundo e a parte submersa do objeto, sem contornos recortados de forma incorreta.
2. Um objeto flutuante manter uma linha de imersão coerente e reagir sem saltos ou tremores excessivos.
3. Espuma, respingos e ondulações aparecerem junto ao contato real com a água.
4. Cachoeiras existentes apresentarem queda contínua, integração com o poço e caminho visível.
5. Travessias, colisões, ataques e progressão continuarem funcionais nas três fases.
6. O perfil leve manter transparência, leitura do jogo e comportamento dos objetos.

## 5. Fase 3 — acabamento do percurso completo

A produção acompanha os setores do mapa na ordem existente, da entrada até o final. Não precisamos construir um trecho experimental novo: usaremos uma tela representativa do próprio percurso para definir o padrão visual.

### 5.1 Referência visual inicial

Escolher um trecho existente que mostre Bia, Faísca, terreno, fundo e alguns objetos, preferindo uma área com água. Registrar a aparência atual no mesmo enquadramento em que será feita a comparação. Usar esse trecho para validar transparência e um objeto flutuante; se não houver água nele, usar uma segunda área de água já existente para essa verificação.

Nesse trecho, definir:

- Proporção dos personagens em relação ao cenário.
- Paleta, contraste e intensidade da luz.
- Separação entre camadas.
- Aparência das bordas das plataformas.
- Densidade de vegetação e de objetos.
- Quantidade de efeitos e nível de detalhe.
- Transparência, linha de imersão, movimento da água e contato com um objeto de teste em uma cópia do trecho.

**Entrega:** comparação antes/depois e uma ficha curta do padrão. A aprovação visual desse trecho orientará a produção do restante da fase.

### 5.2 Camadas dos cenários

| Camada | Função visual | Exemplos, conforme o ambiente existente |
|---|---|---|
| Fundo distante | Definir lugar, clima e profundidade | Céu, mar, silhuetas distantes |
| Fundo intermediário | Dar identidade ao trecho | Mata, formações rochosas, paredes de caverna |
| Ambiente próximo | Integrar o fundo à área de jogo | Arbustos, raízes, pedras e detalhes arquitetônicos |
| Terreno jogável | Mostrar onde o personagem pisa e se apoia | Chão, plataformas, pontes e bordas |
| Objetos e personagens | Concentrar interação e ação | Ajudantes, cordas, dispositivos, conchas e inimigos |
| Primeiro plano e efeitos | Dar volume e movimento | Folhagem próxima, névoa localizada, poeira e respingos |

Usar apenas as camadas que trouxerem benefício ao trecho. O primeiro plano deverá deixar livres as áreas importantes para saltos, ataques e interações.

### 5.3 Acabamento por ambiente

Aplicar estas diretrizes aos ambientes que já fazem parte do mapa:

| Ambiente | Direção visual | Pontos a conferir |
|---|---|---|
| Praia e litoral | Areia quente, água transparente nas margens, espuma e vegetação costeira | Ligação entre terreno, água e pedras; horizonte sem emendas |
| Mata | Profundidade por sobreposição, variação de folhagem e luz filtrada | Contraste dos personagens e visibilidade das plataformas |
| Trechos rochosos | Volume nas pedras e bordas reconhecíveis | Apoio dos pés e coincidência entre aparência e colisão |
| Travessias e áreas de água | Padrão global de transparência, ondas, flutuação e cachoeiras onde existentes | Partes seguras legíveis; movimento dos apoios compatível com as passagens |
| Cavernas | Separação de planos, azuis e turquesas localizados, umidade e cristais | Leitura do caminho mesmo nas áreas escuras |
| Trecho final | Composição que valorize a chegada já prevista | Continuidade visual e clareza do ponto de conclusão |

### 5.4 Objetos e ajudas da turma

Refinar a apresentação das interações existentes:

- **Toninho:** mãos, corda, ponto de fixação e apoio do personagem coerentes durante a ação.
- **Marina:** contato com a plataforma ou objeto movimentado, sombra de apoio e animação compatível.
- **Júlia:** câmera, preparação do flash e efeito visível sem encobrir a ação.
- **Lucas:** dispositivo legível, peças com escala coerente e indicação visual do estado já previsto.
- **Bia e Faísca:** coerência entre apontar, preparar o latido e mostrar o impacto do especial.

O objetivo é fazer a ação parecer convincente e fácil de entender, usando os eventos e o comportamento existentes como referência.

## 6. Fase 1 — harmonização da Vila concluída

A Vila já está pronta. A passagem visual será localizada nos pontos que precisarem acompanhar o padrão do conjunto.

**Possíveis ajustes, a decidir pelas imagens da fase:**

- Harmonização entre casas, barracas, píer, personagens e objetos.
- Continuidade das camadas do fundo e das emendas do cenário.
- Contato visual dos pés com o chão e dos objetos com suas superfícies.
- Aplicação do perfil de água calma: transparência nas margens, ondas suaves e flutuação dos objetos selecionados junto ao píer.
- Animação ambiente discreta de vegetação e elementos apropriados.
- Consistência de molduras, textos e elementos de interface.

Preservar as composições e artes já aprovadas. A etapa está concluída quando os ajustes escolhidos estiverem aplicados e os pontos principais do percurso continuarem claros.

## 7. Fase 2 — acabamento do boss fight com o polvo

O trabalho se concentra na apresentação da batalha existente.

| Elemento | Acabamento proposto | Critério de leitura |
|---|---|---|
| Polvo | Coerência entre corpo, olhos e tentáculos; volume e reação visual | O estado do chefe é reconhecível durante a luta |
| Tentáculos | Movimento contínuo, contato com água e convés, respingos | Preparação e área de impacto permanecem visíveis |
| Barco Esperança | Integração com o mar, luz da lanterna e materiais coerentes | Convés e plataformas utilizáveis ficam claros |
| Água | Perfil global de mar em tempestade: ondas, transparência conforme a profundidade, espuma e impactos | A superfície não encobre projéteis ou personagens; balanço do barco mantém a arena funcional |
| Tempestade | Chuva em profundidade e relâmpagos controlados | O jogador consegue acompanhar o combate |
| Aparelho sônico | Efeito visual consistente com disparo e impacto | A ação de Lucas é reconhecida imediatamente |
| Interface do chefe | Barra, indicadores e feedback de acerto | Informação legível sobre o fundo em movimento |

A intensidade visual acompanhará os estados que a batalha já usa. Preservar o ritmo dos ataques e a opção de reduzir flashes. No perfil de efeitos reduzidos, os sinais essenciais do combate continuam perceptíveis.

## 8. Personagens, animações e efeitos

### Personagens

Priorizar a consistência da arte existente: resolução aparente, recorte, transparência, posição dos pés, escala e alinhamento entre quadros.

A revisão de animação é visual. Ajustes de transição ou tempo de exibição devem respeitar os eventos de ataque e interação. A forma do corpo de colisão não deve oscilar junto com cada quadro do desenho.

Animações secundárias de cabelo, roupa ou acessórios só entram quando houver material apropriado e benefício perceptível.

### Efeitos

Organizar um conjunto visual comum para coleta de concha, impacto, arremesso, latido especial, flash da Júlia, poeira de movimento e respingo de água. Cada efeito precisa de cor, duração, tamanho e intensidade consistentes.

O efeito acompanha a ação real. A representação de um ataque não deve indicar alcance ou momento diferentes daqueles usados pelo jogo.

### Interface, menus e HQ

Harmonizar ícones, molduras, tipografia, cores e estados dos botões. Usar os elementos visuais do universo da HQ para dar unidade às telas.

Preservar a apresentação integral dos quadros, os diálogos no topo e a arte de menu já escolhida. Ajustar áreas seguras e legibilidade no celular. Uma tela concluída só entra em retrabalho quando houver um problema visual identificado.

## 9. Ordem de execução revisada

Os códigos V01–V09 substituem as etapas U01–U12 do plano anterior.

| Etapa | Entrega | Critério de conclusão |
|---|---|---|
| V01 | Ficha do padrão visual usando as referências aprovadas | Paleta, escala, contornos, luz e camadas descritos com exemplos |
| V02 | Acabamento de um trecho existente da Fase 3 e primeira validação da água | Comparação antes/depois; transparência e contato com um objeto flutuante demonstrados em área existente |
| V03 | Fundos, terreno e transições da Fase 3 | Percurso inteiro, incluindo o final, com continuidade e plataformas legíveis |
| V04 | Objetos, personagens, animações e flutuação selecionada da Fase 3 | Escala, recortes, imersão e apoios consistentes; travessias preservadas |
| V05 | Iluminação, atmosfera, água e cachoeiras existentes da Fase 3 | Padrão global aplicado nos trechos de água; efeitos legíveis e perfil leve validado |
| V06 | Harmonização pontual da Vila e perfil de água calma | Ajustes selecionados e água concluídos, mantendo a identidade da fase pronta |
| V07 | Acabamento do boss fight e perfil de mar em tempestade | Chefe, água e barco integrados, com sinais de combate claros e convés funcional |
| V08 | Interface, menus, HQ e portais | Elementos visuais coerentes e legíveis nas telas existentes |
| V09 | Revisão visual do jogo completo, sistema de água e desempenho | Transições e água coerentes nas três fases; flutuação e resultados medidos nos dispositivos de referência |

Em V03, V04 e V05, trabalhar por setor ou trecho existente. Cada entrega pequena deve registrar quais partes foram finalizadas. A sequência de produção é flexível para resolver primeiro um defeito visual que impeça a leitura do jogo.

## 10. Produção das imagens e controle de pendências

A lista de imagens será criada a partir das necessidades visuais de cada trecho, usando capturas e as artes já disponíveis. Não é necessário revisitar todo o código para começar.

Cada item receberá uma classificação:

| Situação | Ação |
|---|---|
| Aprovado e adequado ao uso | Reaproveitar |
| Arte correta com problema de importação ou montagem | Ajustar recorte, escala, posição, material ou camada |
| Arte precisa de acabamento | Editar com a referência aprovada |
| Peça visual ausente | Gerar a imagem específica |
| Elemento precisa reagir ou se mover | Preparar camadas ou quadros de animação necessários |

**Ficha de produção:** identificador, fase, trecho, imagem de referência, função, camada, dimensões, transparência, ponto de apoio, repetição nas bordas, ação prevista e critério de aprovação.

**Assets de água:** priorizar texturas repetíveis de movimento, ruído/distorção, espuma e máscaras de margem; mapas de normais quando o material escolhido os aproveitar; quadros ou faixas de cachoeira, respingos e ondulações. Registrar escala, direção do fluxo e continuidade das bordas. Produzir esses elementos em camadas para que o material controle transparência e animação.

Gerar ou editar uma peça por vez, verificando-a no contexto do trecho. Uma imagem bonita isoladamente só está pronta quando funciona na composição do jogo.

Para cenários, separar fundos e elementos interativos. Para objetos, definir a posição de contato e as partes móveis. Para spritesheets, manter grade e apoio consistentes. Preservar os arquivos originais e aplicar otimizações nas cópias ou configurações de importação.

## 11. Integração e verificação visual

A integração começa pelo objeto, trecho ou efeito que está sendo trabalhado. O jogo existente é a referência para posição, escala funcional, ações e progressão.

Antes e depois de um ajuste relevante, conferir:

1. O mesmo enquadramento e posição do personagem.
2. Correspondência entre desenho do chão e área de apoio.
3. Visibilidade dos perigos, colecionáveis e interações.
4. Ordem correta das camadas e ausência de recortes indevidos.
5. Continuidade das animações e sincronização dos efeitos.
6. Ausência de bloqueio no trecho alterado.
7. Aparência no tamanho de tela e perfil visual escolhidos.
8. Água: transparência, ordem de desenho das partes submersas, flutuação estável e contato dos efeitos.
9. Travessias e combate com água ativa, incluindo o convés do Esperança e os perfis de qualidade.

A flutuação dos objetos selecionados integra este pedido e deve receber sua própria tarefa de implementação e verificação. Quando outra melhoria visual exigir alteração de comportamento, registrar essa necessidade em uma tarefa separada e justificar seu efeito. A revisão visual, por si só, não exige redesenhar fases, rebalancear inimigos ou recriar sistemas de save e progressão.

**Desempenho:** medir com arte real e efeitos ativos. Usar 60 fps como meta principal proposta e avaliar um perfil de 30 fps estáveis para aparelhos mais limitados. Reduzir efeitos decorativos antes de comprometer a clareza da ação.

Conferir memória de texturas, luzes sobrepostas e grandes áreas transparentes. O tamanho do pacote Unity deve ser medido; a meta histórica de APK abaixo de 70 MB permanece registrada como orçamento a avaliar.

## 12. Primeira entrega concreta

**V01 e V02: definir o padrão e aplicá-lo a um trecho já existente da Fase 3.**

O pacote dessa entrega deverá conter:

- Captura atual do trecho.
- Referências visuais aprovadas.
- Composição proposta com as camadas indicadas.
- Lista curta de imagens a reaproveitar, ajustar ou criar.
- Comparação visual no mesmo enquadramento.
- Demonstração de água transparente, contato e flutuação em uma área de água existente; incluir cachoeira se houver nesse trecho.
- Perfil inicial de água e critérios para repetir o acabamento nos trechos seguintes e nas outras fases.

**Comando para continuar:** “Vamos começar o acabamento visual da Fase 3 por um trecho que já existe. Defina a composição das camadas, as artes que vamos aproveitar e os ajustes de terreno, objetos e iluminação. Valide também a água transparente e um objeto flutuante em uma área de água existente. Use esse trecho como referência para levar o mesmo padrão até o final da fase e adaptar a água à Vila e à batalha do polvo.”

A configuração da conexão com o Editor poderá ser retomada depois. A preparação das referências, das fichas de assets e das imagens pode avançar a partir deste roteiro.

## Referências oficiais dos recursos

Fontes consultadas no planejamento em 21/10/2026. As aplicações descritas são propostas de direção de arte para este projeto.

- [Unity 6.3 LTS — iluminação 2D na URP](https://docs.unity3d.com/6000.3/Documentation/Manual/urp/2d-index.html)
- [Cinemachine 3.1 — limites de câmera em 2D](https://docs.unity3d.com/Packages/com.unity.cinemachine@3.1/api/Unity.Cinemachine.CinemachineConfiner2D.html)
- [Timeline — sequências de animação e apresentação](https://docs.unity3d.com/Packages/com.unity.timeline@1.8/manual/index.html)
- [Unity 6.3 LTS — Sprite Atlas](https://docs.unity3d.com/6000.3/Documentation/Manual/sprite/atlas/atlas-landing.html)
- [2D Tilemap Extras — ferramentas de montagem](https://docs.unity3d.com/6000.1/Documentation/Manual/com.unity.2d.tilemap.extras.html)

- [Unity 6.3 LTS — Buoyancy Effector 2D: flutuação, densidade e fluxo](https://docs.unity3d.com/6000.3/Documentation/Manual/2d-physics/effectors/buoyancy-effector-2d-reference.html)
- [Unity 6.3 LTS — 2D Renderer e Camera Sorting Layer Texture](https://docs.unity3d.com/6000.3/Documentation/Manual/urp/2DRendererData-overview.html)
- [Shader Graph — Scene Color e textura opaca na URP](https://docs.unity3d.com/Packages/com.unity.shadergraph@17.7/manual/Scene-Color-Node.html)

As referências de pacotes explicam os recursos; a versão a instalar deve ser a compatível com o Unity 6.3 LTS usado pelo projeto.
