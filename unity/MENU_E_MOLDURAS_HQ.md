# Menu e molduras da HQ no Unity

Corrigido em 22/10/2026 no projeto TurmaDoFarol.

## Ajustes

- Reconexão dos botões após recompilar os scripts durante o Play. Antes, o menu podia continuar visível com ações perdidas.
- Botões com as artes originais e estados normal, foco/hover e pressionado. Texturas configuradas pelo importador do Unity.
- Acesso direto à lista de portais e créditos originais; retorno, pausa, som e confirmação de nova partida com foco apropriado.
- Continuar respeita a fase salva, incluindo a vila quando o embarque já foi registrado.
- Moldura original carta_moldura na HQ e nas curiosidades dos portais. Ilustração inteira dentro da janela, sem corte; fundo escurecido e diálogo no topo.
- Clique na ilustração ou em Continuar avança a HQ, sem duplicar o avanço por foco do teclado.

## Verificação realizada

No Unity aberto, cliques enviados aos botões após verificar a área atingida e a textura: Jogar, Continuar, Polvo, Portais do Farol, Lista de portais, Som, Créditos, fechar painéis, cancelar nova partida, continuar/pular HQ e pausa/retomada/menu. Destinos conferidos: Vila, Polvo e salão/lista de portais. Volume e mudo conferidos. Recompilação solicitada durante o Play e botão Som voltou a abrir o painel normalmente.

Captura da HQ conferida visualmente: moldura original carregada e arte em ScaleToFit. Console final sem erros ou avisos; compilação concluída. Abertura da versão web também conferida com npm run dev.

O progresso e as preferências anteriores aos testes foram restaurados. Unity deixado fora do Play, com Menu_Campanha aberto.

## Como testar

1. No Unity, pressione Play com Menu_Campanha aberto.
2. Clique em Som e Créditos; feche cada painel e confira o retorno ao menu.
3. Clique em Jogar; se houver progresso, cancele primeiro para conferir a confirmação. Para jogar sem reiniciar, use Continuar.
4. Durante a HQ, confira a moldura, a imagem inteira e os botões Continuar/Pular sequência.
5. Confira Portais do Farol e Lista de portais pelo menu.
