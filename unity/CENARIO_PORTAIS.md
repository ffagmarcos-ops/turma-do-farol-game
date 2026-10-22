# Cenário dos portais recuperado — 22/10/2026

Branch: `corrigir-cenario-portais`.

## Causa

A preparação anterior do Unity montava somente a parede de fundo e uma galeria de seleção. O salão caminhável do original, suas outras camadas e os elementos individuais dos portais não tinham sido implementados. Não era apenas uma demora para carregar imagens.

## Correção

O salão original de 3840×1080 foi reconstruído na cena `Assets/Farol/Campanha_20261021_215901/Portais_Farol.unity`, mantendo a distribuição do código original: oito portais no chão e sete no mezanino, incluindo o acesso à ilha após o polvo.

Foram recuperados céu/mar, paredes e janelas, lente, feixes, chão/mezanino, escadas, cordas em primeiro plano, molduras, imagens internas, detalhes de primeiro plano das imagens, vitrais, cadeados, anéis, placas, ícones de concha, nomes e preços. A cena contém 116 SpriteRenderers com referências válidas e 30 textos nas placas.

Marina pode andar, pular e subir pelos degraus. A câmera acompanha as duas metades do salão. E interage com a porta próxima; Tab ou “Lista de portais” abre a galeria. A lista bloqueia o movimento e permite voltar ao salão. A música mística já existente é usada no hub.

O estado das portas no mundo acompanha as compras: abrir remove vitral e cadeado e revela a imagem interna. A confirmação e as regras de custo/progresso foram preservadas. Um portal fechado mostra o vitral azul por regra do jogo, não por falta de imagem.

`FarolPortalHallSetup` também é chamado na preparação de novas campanhas. As imagens originais foram importadas pelo Unity; PNGs de origem preservados. O catálogo agora inclui as imagens do cenário e da interface que faltavam.

## Verificação

- 15 portas; 116 sprites sem referência ausente; 30 textos nas placas.
- Capturas das metades esquerda/direita e das imagens internas, com portas abertas temporariamente apenas no estado de teste.
- Caminhada real do controlador e limite horizontal do salão.
- Piso do mezanino sustentando a personagem.
- Lista bloqueia movimento; retorno ao salão libera movimento.
- Confirmação com foco em “Agora não”; compra com ponteiro segurado por 0,6 s cobrou 15 conchas, abriu a imagem da porta e a carta de curiosidade.
- Console sem erros e sem avisos.
- `npm run dev` iniciado e menu original conferido no navegador. Servidor e aba temporários encerrados; gameplay do Phaser não foi alterado.
- Progresso original restaurado e igualdade do save conferida. Play encerrado; cena dos portais aberta no Unity.

## Como testar

Pressione Play na cena aberta. Use A/D para andar, Espaço para pular os degraus, E perto de uma porta e Tab para a lista. Portas bloqueadas mantêm o vitral azul e indicam preço ou requisito. As imagens aparecem quando a porta é liberada.

A captura `portais-salao-corrigido.png` foi feita com portas abertas temporariamente para comprovar as imagens; esses desbloqueios não foram gravados no progresso do usuário.

Os elementos principais e a interação do salão estão implementados. Efeitos de partículas e alguns efeitos mágicos animados do Phaser ainda não são reproduzidos integralmente nesta versão nativa.
