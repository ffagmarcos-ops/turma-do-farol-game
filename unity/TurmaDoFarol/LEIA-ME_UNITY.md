# Jogar a campanha no Unity

A campanha nativa atual fica em `Assets/Farol/Campanha_20261021_212822/`.
Abra `Menu_Campanha.unity`, pressione Play e clique na aba Game.

- **Jogar · Vila das Conchas:** introdução em HQ, Marina, Faísca, 120 conchas (12 douradas), conversas, checkpoints e embarque.
- **Continuar aventura:** retoma o checkpoint da Vila ou a etapa salva do polvo.
- **Testar Fase 2 · O Polvo Gigante:** abre diretamente a batalha para teste, sem percorrer a Vila.
- **Som:** volumes de música/efeitos, mudo e redução de flashes.
- **Abrir base da ilha:** preserva o acesso à cena anterior; essa base ainda tem as pendências de portabilidade descritas abaixo.

Na Vila: A/D ou setas para andar, Shift para correr, Espaço/W para pular, S para agachar e E para conversar/embarcar. Na batalha: A/D para andar, W/seta acima para pular, S para agachar e J/E/Espaço para o sônico. Segure o sônico por cerca de 1,5 s e solte para disparar a carga. Esc pausa e M alterna o mudo.

O progresso da campanha usa `farol.unity.campanha.v1` no PlayerPrefs e não apaga nem migra o save do Phaser/APK. Começar uma nova aventura pede confirmação. Os testes de desenvolvimento usam controles próprios não serializados e não ficam ativos ao sair do Play.

A campanha acrescenta uma implementação nativa das fases 1 e 2. Ainda não representa paridade integral com a versão Phaser: o hub de portais/curiosidades e os sistemas avançados da ilha permanecem pendentes. A apresentação e o comportamento do combate foram adaptados para o Unity, sem equivalência quadro a quadro de todos os efeitos e eventos da versão original.

Para reproduzir a geração: execute `python3 tools/exportar_campanha_unity.py` na raiz e, com o Editor fora do Play e a cena salva, invoque `TurmaDoFarol.Editor.FarolCampaignBuilder.Build()` pelo Pipeline. A preparação gera uma pasta nova, preservando cenas anteriores. Os arquivos PNG/JPG e áudios originais não são sobrescritos.

---

# Turma do Farol — base de migração para Unity

Esta pasta é o projeto Unity. A raiz do repositório continua sendo o projeto Phaser.

## Abrir no computador

1. No Unity Hub, entre em **Projects → Add → Add project from disk**.
2. Selecione **esta pasta `unity/TurmaDoFarol`**: ela contém `Assets`, `Packages` e `ProjectSettings`.
3. Abra com **Unity 6.3 LTS**, versão de referência **6000.3.24f1**. Um patch mais recente da mesma linha pode ser escolhido no Hub. Outras versões precisam de validação de compatibilidade.
4. Espere o Unity baixar o pacote oficial 2D Sprite e importar os arquivos. A primeira importação pode demorar: há aproximadamente 223 MB de originais.
5. Na janela **Turma do Farol**, clique em **Preparar projeto e abrir a ilha**. Se a janela não aparecer, use **Turma do Farol → 1 - Preparar projeto e cenas**.
6. A cena **Fase3_Ilha** será criada e aberta. Clique em **Play** e depois na janela **Game** para dar foco ao teclado.

Não selecione a pasta `Assets` isoladamente, nem a raiz que contém `package.json`.

## O que foi preparado

- 363 arquivos de assets preservados byte a byte, com manifesto SHA-256.
- 32 folhas do pacote 06–37 e seis folhas anteriores do elenco: 600 recortes cadastrados.
- Importação dos pivôs medidos, conversão de Y e escala visual independente da colisão.
- Conversão das 69 sequências existentes em AnimationClips e um AnimatorController.
- Cena de edição da ilha com 15 setores A–O, 56 trechos e seus dados de origem.
- Geometria, plataformas, decorações disponíveis, conchas, checkpoints, água e posições de inimigos e ajudantes.
- Scripts C# de movimentação básica da Bia, corrida, agachar, pulo duplo, conchas arremessadas, retorno seguro, acompanhamento básico do Faísca e patrulha básica de caranguejos.
- Cena-base da Vila com geometria e conchas. Marina preserva a hitbox de 106×234 pixels em pé.
- Artes, áudios, textos, dados e código JavaScript da Fase 2, HQ, portais e demais sistemas preservados para continuar a conversão.

**Esta entrega permite começar a edição no Unity. Não representa equivalência completa com o jogo Phaser.** O editor Unity não está instalado no ambiente onde a conversão foi preparada; a compilação C#, a geração das cenas e o Play Mode ainda precisam ser validados no seu Unity. As verificações executadas aqui estão no relatório de validação.

## Editar

- As cenas geradas ficam em `Assets/Farol/Gerado/Importacao_<data>/`.
- A Hierarchy separa **Setor → Trecho → objetos**. Selecione um objeto e pressione **F** na Scene para localizá-lo.
- `FarolSourceMarker`, no Inspector, mostra o tipo do objeto e a pendência de portabilidade.
- Scripts C#: `Assets/Farol/Scripts/`.
- Ferramentas de importação: `Assets/Farol/Editor/`.
- Imagens e áudios originais: `Assets/Originais/`.
- Dados JSON completos: `Assets/Farol/Dados/`.
- JavaScript e documentação de referência: `ReferenciaPhaser/`, fora da pasta Assets.

Execute a preparação uma vez e edite a cena gerada. Uma nova execução cria outra pasta de cenas e animações; ela não incorpora as edições manuais da cena anterior. Os parâmetros de importação das folhas de origem são reaplicados. Para personalizar uma folha, faça uma cópia antes de modificar seus recortes.

## Controles da base da ilha

- A/D ou setas: andar; Shift: correr.
- Espaço/W/seta acima: pular; segundo toque: pulo duplo.
- S/seta abaixo: agachar.
- Z/J: concha; X/K: segurar por 1,2 s e soltar para testar o alcance do especial.
- Esc: pausar/continuar.

O especial é uma implementação básica de alcance, ainda sem equivalência de barra de energia e eventos de animação. O save desta base usa chaves próprias de PlayerPrefs; ele não transfere automaticamente o localStorage do navegador ou o save do APK.

## Pendências reais

| Área | Estado |
|---|---|
| Importação de bytes, mapas e recortes | Validada por scripts fora do Unity. |
| AnimationClips e geração das cenas | Código preparado; depende de execução no Unity. |
| Controle, salto e colisão | Base C# preparada; calibrar no Play Mode. |
| Faísca | Segue e salta na base; faltam farejo, rotas alternativas, energia e sequência completa do especial. |
| Inimigos | Caranguejo tem patrulha básica; faltam arremessos dos macacos, estados completos e balanceamento. |
| Toninho | Arte e cordas posicionadas; subir e balançar na corda ainda não portados. |
| Marina | Animação de repouso com caixa composta; interação de empurrar e sincronização do colisor pendentes. |
| Júlia | Arte e posição preservadas; ativação do flash e atordoamento pendentes. |
| Lucas | Boias posicionadas e oscilação básica; ativação e afundamento com peso pendentes. |
| Plataformas e segredos | Geometria importada; desabamento, revelações, atrito especial e máscaras precisam de portabilidade. |
| Cenários | Usa PNGs disponíveis. Fundos ainda procedurais no Phaser e arte ausente continuam pendentes. |
| Artefato | Usar a CHAVE da referência ARTEFATO_ESPIRAL; não promover o sextante/medalhão a artefato definitivo. |
| Vila | Cena-base de geometria; portabilidade da narrativa, elenco, animações HD e acabamento pendente. |
| Chefe no mar | Dados e assets preservados; IA do polvo, combate e tempestade ainda precisam de C#. |
| HQ, menu, portais e curiosidades | Conteúdo preservado; interfaces, progressão e regras ainda precisam de C#. |
| Áudio | Originais e licenças preservados; AudioMixer, síntese e reprodução ainda pendentes. |
| Celular | Touch, layout, desempenho e build Android ainda não validados. |

Alguns setores não poderão ser atravessados integralmente até a portabilidade das ajudas. Para editar esses setores, use a Hierarchy/Scene. Uma arte faltante aparece como bloco provisório ou marcador, sem substituir a arte original.

## Conferência no Unity

1. Verifique a aba Console: a importação precisa terminar sem erros vermelhos.
2. Em Fase3_Ilha, teste andar, correr, pular duas vezes, agachar e pousar sem atravessar o chão.
3. Recolha conchas e confira que a mesma concha não é contada novamente após recarregar.
4. Ative um checkpoint e caia na água: deve retornar a um ponto seguro, sem game over.
5. Observe pés e escala durante a troca entre locomoção e arremesso.
6. Confira o acompanhamento do Faísca, a patrulha e os contatos do caranguejo.
7. Edite e salve uma cena; feche e abra para conferir persistência das referências.
8. Só depois desses testes considere empacotamento e publicação.

## Atualizar a exportação a partir do Phaser

Na raiz do repositório, com Node.js instalado: `node tools/exportar_unity.mjs`.
Esse comando atualiza a cópia dos arquivos rastreados e os JSONs de exportação, sem alterar `public/assets` nem o código Phaser. Use commit/backup antes de reexportar caso tenha modificado diretamente os originais copiados em `Assets/Originais`.

## Referências

- Origem inicial: `3079418e19fd59b584e609a4adc986f72cfdc949`.
- Unity: https://unity.com/releases/editor/whats-new/6000.3.24f1
- Unity Hub: https://docs.unity.com/en-us/hub/project-manage
- Licenças: `LICENCAS_ORIGINAIS.md`.

As regras narrativas continuam válidas: Bia é a protagonista da ilha, Júlia permanece fotógrafa, Faísca é quadrúpede, não há game over e a Fase 2 acontece na tempestade sem farol.
