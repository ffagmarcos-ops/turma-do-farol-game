# Integração K–O — gruta, copas e ruínas

Pacotes gruta-secreta, caminho-bia, copas-altas, ruinas-antigas e entrada-caverna, versão 01, aplicados na campanha Fase3_Ilha e na referência visual. ORIGEM.json registra os caminhos de produção e os hashes das cópias intactas; APLICACAO.json resolve os vínculos das peças reaproveitadas para os assets do Unity. Arquivos originais e atlas permanecem preservados.

K recebe o interior azul e peças oficiais de cristal/estalactite; L/M compartilham a floresta E, árvores C, vegetação A e galhos reaproveitados. N introduz arcos, pilares, monólitos e pedestal; a floresta diminui gradualmente para 32% ao longo das ruínas. O0 reutiliza o paredão seco de J. O1 recebe uma única entrada, fixa nas coordenadas do mirante, sem repetição de caverna por paralaxe.

Os materiais da gruta e ruínas são aplicados em malhas com a proporção original (295×195 e 300×163 px), sem forçar o formato 128×128. Bordas físicas continuam nos colisores originais. Tetos de M2/N2 usam painéis de 48 px, e a parede quebrável N conserva seus estados originais. Os materiais e a pintura ainda apresentam motivos reconhecíveis na repetição; não há certificação de textura contínua.

Todas as 76 plataformas, incluindo as sete secretas de L, receberam peças com a linha de apoio definida nos manifestos. Revelação, movimento, quebra e restauração permanecem ligados aos corpos originais. As duas suspensões com altura explícita em L receberam cordas visuais. Não foram inventadas âncoras para plataformas sem ropeTopY.

Primeiro plano estendido até O, oculto gradualmente dentro de K e restaurado na saída. Fundos transitam em torno das bordas J/K, K/L, L/M, M/N e N/O. Água e efeitos permanecem separados.

## Ajuste de passagem baixa

O mapa original tem vãos de 92 cm sob os tetos de M2/N2, mas a colisão agachada da Bia tinha 95,12 cm. A integração limita essa altura a 88 cm nas duas cenas da fase 3, dando 4 cm de folga. Posição dos tetos, largura do corpo, altura em pé e animações permanecem iguais. A medida da Marina em outras fases não foi alterada.

## Como conferir

No Unity: Turma do Farol → Acabamento → Testar praia da HQ. Avance pela gruta K, os caminhos da Bia L, copas M e ruínas N até o mirante O. Observe as plataformas reveladas após a investigação da Bia; use S/baixo nos tetos baixos e X/K para carregar o latido junto à parede N. A celebração deve abrir ao alcançar o trecho final da entrada da caverna. A ferramenta de prévia restaura o progresso ao sair do Play.

## Validação

76 apoios vinculados, materiais e sprites conferidos. Sete apoios secretos de L permanecem ocultos até as duas descobertas da Bia e tornam-se visíveis/colidíveis depois. Solo K–O sustenta a personagem; plataformas móveis L/M/N/O transportam; quatro instáveis M/N quebram e restauram; três segredos reconhecidos. Parede N quebra com latido. Orbe K recarrega e relíquia K registra coleta. Transições J/K, K/L, L/M, M/N e N/O verificadas antes, no centro e depois de cada borda. Primeiro plano some na gruta e retorna fora dela.

As cordas M0/M1/M3 passaram na repetição controlada de agarrar/soltar, após isolar no teste a reanexação automática e o cooldown disparado pelo teleporte. Uma referência de inimigo destruído interrompeu o trecho final do primeiro roteiro de inspeção; a repetição busca referências atuais e confirmou as suspensões e todos os sprites. Não foi necessário mudar o código das cordas.

A travessia física dos vãos M2/N2 foi repetida com a colisão agachada de 88 cm e passou nos dois. Entrada O aparece uma única vez. Chegada em O1 aciona o evento fase3-concluida e quatro atores da celebração. Capturas de gruta, copas, ruínas e entrada revisadas; o acabamento dos recortes retangulares e os padrões repetidos continuam perceptíveis. Servidor de desenvolvimento respondeu HTTP 200.

Ao encerrar, o conjunto de colisores da cena permaneceu idêntico ao registro anterior. Os dois registros de progresso foram comparados com a cópia anterior aos testes e restaurados; o da ilha exigiu restauração explícita dessa cópia após as várias sessões de prévia. Prévia encerrada. A consulta atual do Unity confirmou compilação concluída e zero erros no console; o histórico retém falhas dos roteiros de inspeção, corrigidos e repetidos antes da conclusão.
