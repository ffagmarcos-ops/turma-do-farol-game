# Floresta C — integração

Pacote `floresta-inicial-pacote-v01` copiado sem alterar PNGs para `Assets/Farol/Visual/Bloco05Floresta`. `ORIGEM.json` contém caminhos e hashes. Aplicado à campanha e à referência visual.

Novos fundos distante/intermediário, árvores completas, raízes, galhos de 128/192/220/256 pixels, terra com grama e preenchimento. A repetição dos fundos usa espelhamento; grupos intermediários se sobrepõem nas terminações transparentes. Cor e ordenação reduzem a competição dos fundos com os apoios. O terreno mistura topo/preenchimento sem alterar as imagens originais.

Reuso: céu de A, mar compartilhado até a transição, arbustos e samambaias de A, rochas e lajes de B, animação original da plataforma instável e primeiro plano com fator 1,24. Rochas usam os materiais de B e malhas próprias de C, evitando modificar o terreno de B. Os cantos candidatos ficam disponíveis, sem forçar uma nova geometria no mapa.

A passagem B→C cruza os fundos em dez metros e mistura terra sobre os últimos quatro metros de B. O banco decorativo de pedras/raízes foi alinhado por sua âncora visível, sem criar apoio. A decoração próxima à entrada secreta fica discreta quando a personagem se aproxima e após a descoberta; não muda o segredo nem os colisores.

## Verificação

- Comparação integral dos colisores antes/depois idêntica.
- Frames avançando; texturas/shaders válidos; sprites carregados.
- Dez pontos de apoio do terreno C estáveis; galho estático sólido e visível.
- Plataforma instável mostra animação original, quebra e restaura visual/colisão.
- Transição B→C com alfa correto no início, meio e fim.
- Macaco continua lançando pedras; retorno seguro no vão de água de C1.
- Entrada C2 libera leitura decorativa e registra descoberta com a personagem agachada (altura física 0,9512). A tentativa em pé esbarrou no teto, como a geometria original exige.
- Capturas da floresta, corredor secreto e limite B/C revisadas; nenhum erro novo na execução. Progresso anterior restaurado ao sair do Play.
- Servidor web iniciado e resposta HTTP 200; alteração visual entregue no Unity.

## Conferir

Unity → Turma do Farol → Acabamento → Testar praia da HQ. Avançar à direita pelo costão até **Floresta Inicial**. Galhos devem ser reconhecíveis como apoios; a terra substitui a rocha gradualmente. No barranco de raízes, usar S/baixo para agachar.

Os setores D/E foram solicitados ao chat de artes antes desta integração, com prioridade para reutilizar A/B/C. Estão em produção e não foram aplicados nesta entrega. A repetição de motivos das texturas permanece uma limitação das peças candidatas; não equivale a uma pintura única contínua de todo o setor.
