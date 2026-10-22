# Campanha do Turma do Farol no Unity — 21/10/2026

## Como jogar

No Unity, a cena `Menu_Campanha` já está aberta. Pressione **Play**, abra a aba **Game** e clique em **Jogar · Vila das Conchas**. Para testar o polvo imediatamente, use **Testar Fase 2 · O Polvo Gigante**.

As cenas atuais estão em `Assets/Farol/Campanha_20261021_212822/`: `Menu_Campanha`, `Fase1_Vila` e `Fase2_Polvo`.

**Vila:** A/D ou setas para andar; Shift para correr; Espaço/W para pular; S para agachar; E para conversar e embarcar. **Polvo:** A/D para andar; W/seta acima para pular; S para agachar; J/E/Espaço para o sônico. Segure por aproximadamente 1,5 segundo e solte para disparar a carga. Esc pausa; M alterna o mudo.

## O que mudou

A base anterior só continha geometria e conchas da Vila; não havia batalha nativa do polvo. A campanha agora conecta introdução em HQ, exploração da Vila, conversas originais, artefato, embarque, transição e combate.

- Importação 2D, biblioteca com 91 conjuntos de imagens/folhas e 49 sequências de animação da campanha.
- Marina com animações HD e colisão em pé de 106 × 234 pixels; movimento, corrida, salto e agachamento.
- 120 conchas, incluindo 12 douradas; prevenção de coleta duplicada; checkpoints e progresso local.
- Faísca, Júlia, Lucas, Bia e Seu Toninho com artes existentes; falas e quadros da HQ preservados, sem cortar os quadros.
- Polvo com 2.400 pontos de vida, quatro etapas, tentáculos, varreduras, tinta, poças, onda e ataque ao mastro.
- Lucas com sônico, carga, aquecimento/superaquecimento, recuperação após nocaute e vidas infinitas.
- Menu, pausa, volumes, mudo, redução de flashes, acesso direto à batalha e confirmação antes de reiniciar a campanha.
- Correção dos caminhos de estados de animação da base da ilha.

As imagens e os áudios originais não foram substituídos. A cena da ilha que estava modificada foi preservada numa cópia em `Assets/Farol/Preservado_20261021_211633/`.

## Verificação executada no Unity aberto

| Verificação | Resultado |
|---|---|
| Compilação final e Console | Sem erros ou avisos na conferência final |
| Movimento e salto | Deslocamento físico confirmado; salto atingiu mais de 2,1 unidades de altura |
| Rede baixa | Bloqueio encontrado e corrigido; travessia agachada de x=87 até além de x=90,5 confirmada |
| Conchas | 120 objetos, 12 dourados; coletar duas vezes o mesmo objeto incrementou uma única vez |
| Sprites da Vila | Nenhum SpriteRenderer sem sprite na conferência final |
| Conversas | Bia entrega o artefato; conversa com Toninho libera o objetivo de embarque |
| Transição | Embarque e oito quadros da transição carregaram a Fase 2 |
| Sônico real | Projétil acertou e reduziu a vida do polvo |
| Carga e calor | Carga atingiu 1,2 s; soltura aumentou o calor de 8 para 48; superaquecimento acionou o bloqueio |
| Nocaute | Lucas caiu a zero e voltou a 100 de vida, sem game over |
| Etapas | Checkpoints A → B → C → D e proteção do golpe final verificados |
| Batalha completa | De 2.400 a zero usando disparos reais; quatro etapas e vitória em 78,10 s de teste acelerado |
| Estado depois do teste | Velocidade normal e progresso anterior restaurados; Editor fora de Play, no menu |
| Versão Phaser | Servidor de desenvolvimento iniciado e menu original conferido no navegador; código e artes originais sem alterações |

O teste completo usou controles automáticos temporários para carregar/soltar o sônico e avançar os diálogos. Não foi uma sessão manual de balanceamento. Os controles de teste foram desativados e não são serializados nas cenas.

## Limites atuais

Esta integração entrega um percurso jogável das fases 1 e 2, mas **a migração de todo o jogo original ainda não está completa**. O hub de portais/curiosidades e os sistemas avançados da ilha permanecem pendentes. Alguns efeitos, apresentações e detalhes do combate foram adaptados, sem equivalência quadro a quadro com o Phaser. A base da ilha continua disponível e ainda inclui arte provisória e mecânicas não portadas.

Não foi gerado APK ou outro build de publicação. A validação foi feita no Play Mode do Unity 6.3 no Mac.
