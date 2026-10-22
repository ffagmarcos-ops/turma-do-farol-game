# Resultado do bloco 1 — V01 + V02

Implementação do padrão visual inicial e de um trecho de comparação no riacho do Lucas, na fase 3. A aplicação ao restante do jogo continua nos próximos blocos.

## Verificação em execução

18 verificações aprovadas no Unity 6000.3.24f1. Console sem erros e sem avisos no momento da captura. O jogo avançou em Play, com URP 2D 17.3.0. Perfis completo e leve testados com a mesma física.

Imersão: 43.3 %; posição: (623.00, 1.40); massa: 0.5264999; contatos: 1; ondulações: 16

```text
PASS Jogo avança durante a referência
PASS Renderização URP ativa na referência
PASS Shader de água sem erros
PASS Linha de imersão coerente da caixa
PASS Contato real produz ondulações
PASS Empuxo restrito aos objetos flutuantes
PASS Água visual não vira piso para a personagem
PASS Flutuação estável após acomodação
PASS Inclinação física limitada
PASS Perfil leve ativo
PASS Perfil leve preserva o empuxo
PASS Retorno ao perfil completo
PASS Captura 2D habilitada no perfil completo
PASS Captura termina antes de atores e interface
PASS Lucas ativa a travessia original
PASS Personagem continua apoiada na boia
PASS Boia retorna após a saída da personagem
PASS Sprites permanecem carregados
```

## Comparação visual

- `antes.png`: trecho original, com a água plana.
- `depois-completo.png`: água com captura 2D, refração discreta, pedras submersas e caixa flutuante.
- `depois-leve.png`: transparência sem captura de tela, preservando o empuxo.

As três imagens usam câmera ortográfica 5,4, posição (618,8; 4,1; −10), em 1280 × 720. Personagens e boias podem ocupar poses diferentes, pois o jogo permanece em execução.

A vegetação do primeiro plano recebeu redução de cobertura. Os desenhos provisórios das árvores e dos fundos continuam identificados para V03. O teste não demonstra acabamento de toda a ilha nem desempenho final de um aparelho móvel.

## Encerramento e isolamento

As 18 verificações passaram também após salvar os prefabs e reabrir a referência. O nível de imersão medido nas duas execuções ficou entre 41% e 43%, estabilizando em aproximadamente 43%.

A recarga inicial do Editor demorou e interrompeu temporariamente a conexão. A troca do pipeline foi retirada dos callbacks de desativação e passou ao ciclo normal do Editor; uma nova entrada e saída do Play foi concluída com sucesso.

A campanha original não tem diferenças em relação ao commit base c7eacbe. Os dois registros de progresso foram comparados ao backup da sessão após encerrar o teste. A cena original da ilha foi reaberta e o renderizador padrão foi restaurado. O servidor de desenvolvimento web também foi aberto para conferir o menu existente.

A qualidade visual do piloto ainda precisa da avaliação de Marcos antes de orientar a expansão para os demais setores. Não foi feita medição de desempenho em dispositivo móvel.
