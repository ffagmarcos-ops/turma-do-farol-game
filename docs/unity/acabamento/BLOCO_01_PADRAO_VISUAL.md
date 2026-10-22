# Bloco 1 — padrão visual e referência de água

Base: revisão 3 do planejamento entregue por Marcos. Escopo: V01 + V02, com o trecho I0 da fase 3. A campanha, as colisões do percurso, o convés do Esperança e os preços dos portais permanecem como referência funcional.

## Referências reaproveitadas

- `public/assets/farol/ui/portrait_bia.png`: rosto, tranças, chapéu, jardineira verde-sálvia e pingente de concha.
- `public/assets/farol/ui/portrait_faisca.png`: identidade do companheiro, quatro patas e coleira.
- Atlas oficiais `bia_locomotion`, `faisca_run`, `lucas_device`, `floating_platforms` e `ruins_cave_tiles` já integrados.
- Os desenhos existentes do terreno, da caixa e da vegetação são mantidos. Não há geração ou substituição de arte original neste bloco.

## Composição de referência

Trecho: riacho do Lucas, I0. Coordenada inicial de Bia: (616,8; 1,84). Câmera: (618,8; 4,1; −10), ortográfica 5,4, proporção 16:9. A posição vertical da câmera da referência revela melhor a faixa submersa. A comparação usa esse mesmo enquadramento antes/depois.

| Plano | Tratamento | Critério |
|---|---|---|
| Fundo distante | Preservar arte e horizonte; reduzir discretamente a saturação aparente por cor | O fundo não disputa o personagem |
| Mata e rochas do fundo | Manter silhuetas e transparência das imagens disponíveis | Separação clara entre profundidades |
| Submerso | Pedras e parte inferior do objeto abaixo da superfície | Reconhecer o desenho sob a água |
| Água | Turquesa na margem e azul mais denso na profundidade | Transparência sem apagar o contato |
| Terreno e plataformas | Preservar topo, tamanho e colisões | Área de apoio coincide com o desenho |
| Bia, Faísca e Lucas | Manter cores pintadas, escala e atlas | Rosto, pés e ações legíveis |
| Primeiro plano | Diminuir a cobertura da vegetação sobre a ação | Ler os saltos e os perigos |
| Interface | Fora da captura de refração | Texto estável e sem distorção |

## Escala, contorno e luz

- Escala: preservar os tamanhos dos personagens, colisores, apoios e atlas existentes. Usar Bia de pé ao lado do Lucas e a boia como comparação de proporção.
- Contorno: conservar o traço original dos sprites; não aplicar contorno global que engrosse detalhes pequenos. Os fundos provisórios terão o desenho revisto em V03.
- Luz: este piloto usa Sprite Unlit para manter a cor pintada das referências. Luzes locais e atmosfera dependem da composição de V05; este bloco não valida iluminação final.
- Paleta: turquesa/azul na água, verde-sálvia e ocre já presentes nos personagens. Conservar contraste entre rosto, mãos, topo do terreno e fundo.
- Exemplos: as capturas antes/depois no relatório do bloco mostram escala, camadas e leitura do contato. A ficha é a proposta inicial para revisão visual antes de expandir o tratamento.

## Perfil inicial de água da ilha

| Parâmetro | Valor inicial |
|---|---|
| Margem | RGB 0,10 / 0,66 / 0,62; opacidade 0,20 |
| Região profunda | RGB 0,015 / 0,20 / 0,31; opacidade 0,65 |
| Amplitude da ondulação | 0,025 unidade, com segunda onda de 35% |
| Velocidade | 0,65 |
| Distorção de tela | 0,0015 no perfil completo |
| Empuxo | Buoyancy Effector 2D, densidade 1,5 |
| Resistência | Linear 3; angular 2,5 |
| Objeto de comparação | Caixa de 0,9 × 0,9; densidade 0,65 |
| Qualidade leve | Transparência e onda; sem captura/refração; menos ondulações de contato |

O empuxo físico é exclusivamente do Effector 2D, em nível horizontal. A pequena variação adicional da imagem acompanha a função de onda, sem adicionar outro sistema de forças. A caixa de referência não substitui as plataformas do Lucas.

## Organização no Unity

Cena: `Assets/Farol/Visual/Bloco01/Fase3_Referencia.unity`.

URP oficial 17.3.0, compatível com Unity 6000.3.24f1. Dois assets de renderização 2D, para os perfis completo e leve. A troca de renderizador está limitada ao carregamento da cena de referência e é revertida ao sair dela. As cenas originais continuam com suas configurações anteriores.

A captura 2D termina na Sorting Layer `Farol Submerso`. A água fica na camada `Farol Agua`; terreno, atores e interface mantêm sua leitura por cima. O perfil completo usa Camera Sorting Layer Texture; o leve faz a transparência diretamente sobre as imagens.

A cena de referência usa uma partida temporária e restaura o progresso ao ser encerrada. F8 alterna a qualidade durante o Play. O perfil e os materiais são assets separados para serem reutilizados nos próximos blocos. Os prefabs `AguaRiacho` e `CaixaFlutuante` guardam a montagem de superfície, volume, contato e objeto de teste. A cachoeira terá prefab próprio no bloco V05, em um trecho que já contenha esse elemento.

## Pendências de produção

| Peça | Classificação | Encaminhamento |
|---|---|---|
| Bia, Faísca e Lucas | Reaproveitar | Conferir pés, escala e contraste no trecho |
| Plataformas do Lucas | Reaproveitar | Conservar travessia e afundamento funcional |
| Desenho da caixa | Reaproveitar | Usar como objeto de teste da imersão |
| Água plana anterior | Ajustar montagem/material | Substituir apenas na cópia de referência |
| Vegetação do primeiro plano | Ajustar montagem | Reduzir cobertura sobre personagem e apoios |
| Árvores e fundos ainda provisórios | Precisa de acabamento | Produção por setor em V03, após avaliar esta referência |
| Cachoeiras | Outro trecho existente | I0 não possui cachoeira; validação própria em V05 |

A revisão desta referência orienta a expansão. Luzes localizadas, acabamento artístico dos outros setores, água da Vila e da batalha ficam nos seus blocos próprios.
