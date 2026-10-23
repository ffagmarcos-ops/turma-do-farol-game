# Praia A → Costão B

As peças do pacote `costao-pacote-v01`, produzido no chat “Artes dos cenários — Turma do Farol”, foram copiadas sem alteração para `Assets/Farol/Visual/Bloco04Costao`. `ORIGEM.json` registra a origem e os hashes dos PNGs.

Aplicado na campanha `Fase3_Ilha` e na referência `Fase3_Referencia`:

- Falésias distantes e costão intermediário, com repetição espelhada para evitar abertura nas emendas.
- Terreno de rocha úmida com topo e preenchimento misturados pela geometria, mantendo a superfície original.
- Lajes normais e instáveis, pedras úmidas, rochas com musgo, arbustos e samambaias de fendas.
- Céu e mar da praia reutilizados até o fim do setor B; palmeiras e primeiro plano também reaproveitados.
- Mistura de areia e pedra nos últimos quatro metros de A. Fundos A/B cruzam gradualmente nos dez metros em torno do limite x=76,8.

As novas lajes são apenas visuais. A animação original permanece na antecipação de quebra; colisores, tempos de quebra/restauração, espaços de água e regras do mapa não foram alterados. Personagens, inimigos, portais e progressão mantidos.

## Verificação

No Unity em Play: frames avançando; texturas e shaders válidos; todos os 17 pontos de apoio de terreno de B estáveis; laje estática sólida; animação original de quebra visível; laje instável quebra e restaura apoio e imagem; transição com alfa correto no início, meio e fim; céu/mar compartilhados; sprites carregados; vão de água com retorno seguro. Capturas revisadas no limite A/B e no primeiro trecho do costão. Comparação integral de colisores antes/depois idêntica; progresso da campanha e da ilha restaurado exatamente após o teste. Editor devolvido à cena da campanha fora do Play, com renderização Built-in.

Servidor de desenvolvimento web respondeu HTTP 200. A mudança visual é no projeto Unity, não no cenário Phaser.

## Testar

Fora do Play, abrir **Turma do Farol → Acabamento → Testar praia da HQ**. Avançar para a direita até o Costão Rochoso. A areia deve se misturar à pedra e a paisagem mudar gradualmente, mantendo o mar contínuo. Pular nas lajes e observar a quebra das instáveis. Sair do Play devolve o progresso anterior.

O setor C foi solicitado ao chat de artes com prioridade para reutilização. Seu pacote inicial está pronto para avaliação; ainda não foi integrado nesta entrega. Os cantos/recortes adicionais do pacote B ficam disponíveis para ajustes pontuais, sem criar novas rampas ou alterar o mapa.
