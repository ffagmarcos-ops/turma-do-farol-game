# Plano do jogo - conversa ChatGPT
URL: https://chatgpt.com/c/6ab54fc7-b46c-83e9-98d9-8f3e9c587bfd

Today 2:58 PM
You said:
escreva um aplanejamento  para eu crir este jogo comleto n grok estilo jogo jogo 2d estilo rayman utilizanod esses elementos da nossa hq. me de a orientação completa para ele criar um jogo bonito 2d
ChatGPT said:

Sim. Para esse projeto, eu estruturaria O Mistério da Ilha do Farol como um jogo de plataforma 2D de aventura, exploração e puzzles, com visual autoral inspirado em grandes platformers 2D pintados à mão — energia de jogos como Rayman, mas sem copiar personagens, cenários ou interface. A HQ já fornece praticamente tudo que precisamos: personagens, identidade visual, vila, barco, caverna, mistério, artefatos e progressão narrativa.

1. Conceito geral

Título:
O Mistério da Ilha do Farol – A Chave dos Cristais

Gênero:
Plataforma 2D + aventura + exploração + puzzles leves.

Público:
8–13 anos, mas visual e jogabilidade suficientemente caprichados para adultos também.

Plataforma inicial:
PC/Web.

Eu começaria fazendo o jogo funcionar no navegador, porque fica muito mais fácil testar o que o Grok gerar.

Tecnologia recomendada:
Phaser 3 + JavaScript/TypeScript.

Depois, se quiser transformar num jogo maior para Steam/mobile, podemos portar ou reconstruir em Godot 4.

2. A experiência que queremos

A sensação deve ser:

aventura + descoberta + plataforma fluida + cenários enormes + humor + mistério.

Não deve parecer um jogo genérico de plataforma com quadrados e sprites pequenos.

O diferencial será o cenário da HQ.

Imagine:

Vila das Conchas enorme ao fundo, barcos balançando, gaivotas, roupa nos varais, vendedores, redes, cordas, cais, água animada, moradores ao fundo.

O personagem corre pelo píer em primeiro plano.

Atrás existem pelo menos quatro camadas de cenário se movendo em velocidades diferentes.

Isso cria um efeito de profundidade semelhante a uma animação.

3. Estrutura narrativa do jogo

Eu dividiria o primeiro jogo em aproximadamente 8 capítulos.

CAPÍTULO 1 — Vila das Conchas

Tutorial.

Personagem inicial:

Marina Torres.

O jogador aprende:

andar
correr
pular
agachar
interagir
subir plataformas
usar cordas
empurrar objetos

Cenário:

Vila das Conchas
mercado
porto
casas
píer
barcos

A primeira missão pode ser:

encontrar Lucas no porto.

Durante o caminho começam pequenos acontecimentos estranhos.

4. Capítulo 2 — Porto e Esperança

O jogador conhece:

Seu Toninho
Bia
Júlia
Lucas
Faísca

O barco Esperança vira o hub de exploração.

Pequenos puzzles:

abrir caixa
consertar guincho
achar corda
buscar ferramenta
ativar motor

Lucas pode ajudar em puzzles tecnológicos.

5. Capítulo 3 — Ilha do Farol

Aqui começa a exploração de verdade.

Cenários:

praia
falésias
floresta
ruínas
farol

Elementos de plataforma:

raízes
troncos
pedras
cordas
pontes
cavernas pequenas

Primeiros inimigos.

6. Capítulo 4 — Ruínas antigas

Começam os puzzles.

Portas de pedra.

Símbolos.

Engrenagens.

Pedestais.

Cristais pequenos.

Aqui aparece a conexão com o artefato da HQ.

7. Capítulo 5 — Corredor das Marés

Fase mais rápida.

Água começa a subir.

O jogador precisa avançar antes de determinadas áreas inundarem.

Elementos:

canais
correnteza
plataformas móveis
paredes antigas
portões

Faísca pode indicar caminhos.

8. Capítulo 6 — Ponte do Abismo

Uma das fases mais cinematográficas.

Ponte de madeira destruída.

Plataformas quebradas.

Corda.

Quedas.

Lucas quase cai.

Marina ajuda.

Podemos transformar isso em uma sequência interativa.

9. Capítulo 7 — Câmara dos Cristais

Grande momento visual do jogo.

O jogador chega ao cenário que já criamos.

Cristal monumental.

Lago azul.

Ruínas.

Reflexos.

Partículas.

Som ambiente.

Aqui o jogo fica mais de exploração.

Júlia fotografa símbolos.

Lucas investiga cristais.

Bia interpreta pistas.

Marina toma decisões.

10. Capítulo 8 — Fuga da caverna

O cristal reage.

Água começa a subir.

Colunas desabam.

Portas começam a fechar.

O grupo precisa fugir.

Essa fase pode ser quase um escape level.

Final:

grupo retorna ao barco.

A câmera mostra o farol.

Algo misterioso continua ativo.

Gancho para continuação.

11. Personagens jogáveis

Um ponto muito forte seria permitir trocar personagem.

Marina

Personagem equilibrada.

Habilidades:

pulo
corrida
escalada
uso da bússola

A bússola pode revelar:

objetivos
objetos escondidos
direções secretas

Lucas

Especialista tecnológico.

Pode:

ativar máquinas
consertar mecanismos
usar scanner
resolver puzzles

O dispositivo dele pode mostrar elementos ocultos.

Júlia

Exploração e investigação.

Pode:

fotografar símbolos
registrar pistas
observar áreas distantes

Algumas pistas só aparecem pela câmera.

Bia

Conhece a ilha.

Pode:

usar passagens pequenas
identificar caminhos
interagir com elementos naturais

Também pode interpretar símbolos antigos.

Seu Toninho

Mais força.

Pode:

empurrar caixas
girar mecanismos pesados
puxar cordas

Faísca

Pode ser personagem temporariamente controlável.

Habilidades:

correr rápido
passar por buracos
farejar
seguir rastros

Isso ficaria muito divertido.

12. Mecânica de troca

Quando o grupo está junto:

Q / E

troca personagem.

Ou:

roda de personagens.

Exemplo:

Marina encontra uma máquina.

Nada acontece.

Troca para Lucas.

Lucas ativa.

Depois aparece passagem pequena.

Troca para Bia.

Isso cria puzzles usando o grupo.

13. Sistema de movimento

Esse ponto é essencial.

Não quero que o Grok faça um personagem duro.

Precisamos pedir:

aceleração suave
desaceleração suave
controle no ar
coyote time
jump buffer
pulo variável

Exemplo:

apertar rapidamente = pulo baixo.

segurar = pulo alto.

Isso transforma completamente a sensação do jogo.

14. Movimentos básicos

O sistema deve ter:

andar
correr
pular
pulo variável
agachar
cair de plataforma
subir escada
usar corda
interagir
empurrar objetos

Depois podemos adicionar:

dash
wall jump

Mas eu evitaria no começo.

O jogo deve ser aventura, não plataforma hardcore.

15. Estrutura visual do cenário

As imagens panorâmicas que estamos criando não devem ser apenas uma imagem de fundo.

Cada fase precisa ser dividida em camadas.

Exemplo da Vila das Conchas:

Camada 1
céu.

Camada 2
montanhas.

Camada 3
ilhas distantes.

Camada 4
vila.

Camada 5
porto.

Camada 6
píer jogável.

Camada 7
objetos na frente da câmera.

Cada camada se move em velocidade diferente.

16. Parallax

Exemplo:

céu
0.05x

montanhas
0.15x

vila distante
0.30x

casas
0.50x

porto
0.75x

piso
1.00x

elementos muito próximos
1.15x

Esse efeito deixará o jogo muito mais bonito.

17. O problema das imagens panorâmicas que estávamos criando

Não recomendo depender de IA para gerar cinco imagens separadas esperando encaixe perfeito.

Esse é exatamente o problema que você encontrou.

Para o jogo devemos gerar:

uma imagem panorâmica muito longa

e depois cortá-la.

Por exemplo:

12000 × 1080

Depois:

segmento01
segmento02
segmento03
segmento04
segmento05
segmento06

Assim o encaixe fica perfeito.

18. Melhor ainda

Separar a imagem.

Por exemplo:

VILA_BG_FAR.png
VILA_BG_HOUSES.png
VILA_PIER.png
VILA_FOREGROUND.png

Então podemos fazer o cenário praticamente infinito.

19. Piso jogável

Nunca deixe o personagem andar diretamente sobre a imagem.

Crie colisões invisíveis.

Exemplo:

imagem do píer

retângulo de colisão invisível.

Assim o visual pode ser irregular sem atrapalhar o personagem.

20. Sistema de tiles

Algumas partes do cenário devem ser modulares.

Exemplo:

píer reto
píer quebrado
caixote
corda
barril
poste
escada
rede
ponte

Assim o Grok monta fases maiores sem depender de uma única imagem.

21. Inimigos

Os dois marinheiros que criamos podem virar os inimigos humanos.

Mas eu criaria diferentes categorias.

Marinheiro com arpão

Ataque de alcance médio.

Prepara ataque.

Mira.

Ataca.

Jogador pode desviar.

Marinheiro com bastão

Ataque próximo.

Corre até jogador.

Ataca.

Fica vulnerável depois.

Também podemos criar:

caranguejo
gaivota agressiva
polvo pequeno
enguia
guardião de pedra

Sem violência pesada.

Inimigos ficam atordoados ou fogem.

22. Chefes

O jogo não precisa ter combate constante.

Mas pode ter chefes cinematográficos.

Exemplo:

Polvo gigante

Não matar.

Objetivo:

escapar
soltar cordas
ativar guincho
proteger barco

Outro:

Guardião de Cristal

Puzzle + plataforma.

23. Colecionáveis

Isso aumenta muito a exploração.

Podemos ter:

conchas
fragmentos históricos
fotografias
moedas antigas
páginas do diário
cristais

Easter eggs da HQ também.

24. Conchas

As conchas podem ser o principal colecionável.

Exemplo:

100 conchas por capítulo.

Algumas simples.

Algumas escondidas.

Algumas exigem habilidade específica.

25. Fragmentos de história

Itens especiais desbloqueiam:

desenhos
informações da ilha
personagens
mapas antigos

Isso conecta diretamente com a HQ.

26. Sistema de missões

Missão principal:

Descubra o segredo do farol.

Missões secundárias:

ajudar pescador
achar gato perdido
consertar barco
entregar caixa
encontrar objeto

A vila ganha vida.

27. NPCs

A Vila das Conchas precisa parecer habitada.

Mesmo que eles fiquem no fundo.

Pescadores.

Vendedores.

Crianças.

Moradores.

Turistas.

Alguns conversam.

Outros só fazem animações.

28. Animações ambientais

Muito importante.

Mesmo em imagens estáticas podemos adicionar objetos animados por cima.

água
bandeiras
cordas
gaivotas
folhas
fumaça
ondas
luzes
peixes

Isso transforma o cenário.

29. Água

A água pode ter três camadas.

imagem de base.

ondas animadas.

reflexos.

Em fases de caverna:

pequenos brilhos.

partículas azuis.

30. Direção artística

Use sempre esta definição com o Grok:

2D hand-painted cartoon adventure platformer, vibrant colors, clean outlines, soft cel shading, detailed illustrated environments, cinematic lighting, layered parallax scenery, family-friendly adventure, expressive characters.

Evite pedir apenas:

Rayman style.

Use Rayman apenas como referência estrutural de jogabilidade.

A arte deve continuar sendo O Mistério da Ilha do Farol.

31. Resolução do jogo

Base recomendada:

1920 × 1080

Gameplay:

16:9.

Sprites preparados em alta resolução.

32. Tamanho dos personagens

Exemplo:

altura visual:

250–350 px em 1080p.

Assim o cenário continua importante.

33. Sprite sheets

Precisaremos criar para cada personagem:

idle
walk
run
jump start
jump
fall
land
crouch
interact
hurt
celebrate

Depois:

habilidades específicas.

34. Quantidade de frames

Para ficar bonito:

Idle: 6–8 frames.

Walk: 8.

Run: 8–12.

Jump: 3–5.

Fall: 2–4.

Land: 3.

35. Faísca

Faísca merece animação própria:

idle
andar
correr
farejar
latir
pular
abanar rabo

Isso pode deixá-lo um dos elementos mais carismáticos do jogo.

36. Física

Use arcade physics.

Não precisa física realista.

Precisamos priorizar controle.

37. Câmera

A câmera deve antecipar o movimento.

Quando personagem anda para direita:

câmera mostra mais espaço à direita.

Quando muda:

suavemente muda.

Não centralizar rigidamente o personagem.

38. Zoom cinematográfico

Algumas áreas podem ter zoom.

Exemplo:

entrada na Câmara dos Cristais.

A câmera se afasta lentamente.

Mostra o cristal enorme.

Depois retorna.

39. Interface

Interface mínima.

Canto superior esquerdo:

personagem.

Coração/energia.

Conchas.

Canto direito:

objetivo.

40. Visual da interface

Nada futurista.

Use:

pergaminho
madeira
pinceladas
azul-marinho
dourado
laranja

A mesma identidade da HQ.

41. Tela inicial

Uma arte panorâmica da ilha.

Título:

O Mistério da Ilha do Farol

Botões:

Jogar
Continuar
Capítulos
Coleções
Opções

42. Mapa

Mapa ilustrado.

Não mapa técnico.

Mostra:

Vila das Conchas
Porto
Farol
Floresta
Ruínas
Caverna

Locais desbloqueiam conforme progresso.

43. Música

Cada região deve ter identidade.

Vila:

violão
ukulele
percussão leve

Mar:

cordas + flauta.

Caverna:

pads
ecos
cristais

Fuga:

percussão + cordas rápidas.

44. Efeitos sonoros

madeira do píer.

gaivotas.

ondas.

passos.

água.

cordas.

cristais.

pedras.

barco.

Tudo isso aumenta muito a qualidade percebida.

45. Estrutura técnica do projeto

Eu pediria ao Grok para criar algo assim:

Plain text
/game

index.html

/src
  main.js

/scenes
  BootScene.js
  MenuScene.js
  VillageScene.js
  HarborScene.js
  IslandScene.js
  CaveScene.js

/entities
  Player.js
  NPC.js
  Enemy.js

/characters
  Marina.js
  Lucas.js
  Julia.js
  Bia.js
  Toninho.js
  Faisca.js

/systems
  DialogueSystem.js
  QuestSystem.js
  SaveSystem.js
  CharacterSwitch.js

/ui
  HUD.js
  PauseMenu.js

/assets
  characters
  enemies
  backgrounds
  props
  audio
  ui
46. Salvar jogo

Use:

localStorage inicialmente.

Salvar:

capítulo
checkpoint
colecionáveis
missões
personagem atual

Depois podemos usar save file.

47. Sistema de checkpoints

Coloque checkpoints:

antes de puzzles.

antes de chefe.

depois de sequências difíceis.

Sem punição exagerada.

48. Primeira versão

Não devemos pedir ao Grok:

faça o jogo completo.

Ele provavelmente fará algo superficial.

Precisamos construir em etapas.

49. Ordem correta

Primeiro:

movimento.

Depois:

câmera.

Depois:

colisão.

Depois:

cenário.

Depois:

parallax.

Depois:

animação.

Depois:

inimigos.

Depois:

missões.

Depois:

puzzles.

Depois:

história.

50. Primeiro protótipo

O primeiro jogo funcional deve ter apenas:

Marina.

Um pedaço do píer.

Uma plataforma.

Um barril.

Um coletável.

Um inimigo.

Uma porta.

Quando isso estiver perfeito, escalamos.

51. PROMPT MESTRE PARA O GROK

Eu começaria com algo assim:

Quero criar um jogo profissional de plataforma 2D chamado “O Mistério da Ilha do Farol”.

O jogo será baseado em uma HQ infantojuvenil original.

Quero que você atue simultaneamente como game designer, programador principal, level designer e technical artist.

Desenvolva inicialmente em Phaser 3 usando JavaScript ES6 para rodar diretamente no navegador.

A resolução lógica do jogo será 1920x1080 e o layout será 16:9 responsivo.

O visual deve ser um platformer 2D ilustrado à mão, colorido, detalhado e cinematográfico, com parallax multicamadas, inspirado na sensação de grandes jogos de plataforma 2D modernos, mas mantendo identidade visual totalmente original de “O Mistério da Ilha do Farol”.

Não crie gráficos genéricos ou formas geométricas como arte final.

Todos os elementos visuais reais serão fornecidos como PNG.

Crie uma arquitetura modular para que possamos adicionar dezenas de fases posteriormente.

O personagem deve ter movimento extremamente responsivo:
aceleração suave, desaceleração, coyote time, jump buffer, pulo variável e controle aéreo.

Implemente primeiro somente:

movimento do personagem,
câmera suave,
colisão,
plataformas,
cenário com 5 camadas de parallax,
coletáveis,
um NPC,
um inimigo simples,
checkpoint.

Não crie ainda o restante do jogo.

Organize o projeto em módulos e explique onde cada asset deverá ser colocado.

Gere todos os arquivos necessários para executar o protótipo no navegador.

52. Depois mande para o Grok

Agora substitua os placeholders pelo cenário da Vila das Conchas.

O chão jogável será um píer de madeira horizontal contínuo.

O cenário deve possuir múltiplas camadas de parallax.

Não altere a escala do personagem.

O cenário precisa suportar pelo menos 10.000 pixels de largura.

53. Depois

Adicione Marina Torres como personagem jogável utilizando sprite sheet.

Estados:

idle
walk
run
jump
fall
land
interact.

Crie uma máquina de estados de animação independente da física.

54. Depois criamos os outros personagens

Um por vez.

Nunca todos de uma vez.

Isso facilita corrigir.

55. O mais importante para o nosso jogo

Eu seguiria esta prioridade:

1. Cenário fantástico.

2. Movimento agradável.

3. Personagens fiéis à HQ.

4. Exploração.

5. Puzzles.

6. História.

Combate vem depois.

56. Resultado final que eu imagino

Você começa com Marina andando pelo píer.

Ao fundo:

Vila das Conchas.

O barco Esperança.

Gaivotas.

Pescadores.

O farol distante.

A câmera acompanha.

Faísca passa correndo.

Bia chama Marina.

Uma pequena missão começa.

Depois a história vai ficando progressivamente maior até chegar à Câmara dos Cristais.

Isso pode transformar a HQ em um universo muito mais amplo do que apenas um jogo simples de plataforma.

Próxima etapa

Eu recomendo agora fazermos algo mais prático: montar o “Game Design Document – GDD” completo do jogo, já com todos os capítulos, fases, inimigos, puzzles, chefes, colecionáveis, diálogos principais, controles e lista exata de imagens/sprites que teremos que gerar.

Depois disso eu posso te entregar também o PROMPT MESTRE definitivo para colar no Grok e mandar ele começar a programar a primeira fase da Vila das Conchas, em etapas para evitar que ele crie um protótipo genérico.

You said:
vamos para a proxima eapa mas a principio vamos focar apenas na no cenario 1 da vila das conchas. mede tudos os detalhes para orientar o grok a fazer o game
ChatGPT said:

Perfeito. Para a próxima etapa eu faria a Vila das Conchas como um “vertical slice” completo do jogo: uma fase realmente jogável, bonita e polida, mas sem tentar construir o restante da aventura ainda. O objetivo é terminar essa primeira área com movimentação, câmera, cenário panorâmico, parallax, NPCs, coletáveis, sons e transição final funcionando muito bem. Depois usamos exatamente a mesma arquitetura nas outras fases.

Cenário 1 — Vila das Conchas

Nome interno: LEVEL_01_VILA_DAS_CONCHAS
Nome exibido: Vila das Conchas
Engine recomendada para o protótipo: Phaser 3 + JavaScript ES6
Formato: 16:9
Resolução lógica: 1920×1080
FPS alvo: 60 FPS
Direção principal: esquerda → direita
Exploração: permitir voltar para a esquerda
Duração inicial: aproximadamente 8–12 minutos
Extensão aproximada: 14.336 px de largura
Objetivo narrativo: Marina atravessa a Vila das Conchas para encontrar os amigos e chegar ao barco Esperança no fim do píer.

A primeira versão deve funcionar como tutorial sem parecer um tutorial tradicional.

1. O que o jogador deve sentir

A Vila das Conchas precisa parecer uma verdadeira cidadezinha costeira viva.

Não quero uma sequência de plataformas genéricas com um background bonito atrás.

O jogador deve perceber:

água se movimentando, barcos balançando, gaivotas passando, pescadores trabalhando, bandeiras mexendo, redes penduradas, caixas no porto, moradores conversando, plantas e flores nas casas, roupa secando, cordas, bóias, postes, pequenos barcos e o mar sempre presente.

A sensação visual deve ser de uma ilustração da HQ que ganhou vida.

O visual continua exatamente no universo de O Mistério da Ilha do Farol:

contorno 2D limpo, cores vibrantes, pintura detalhada, soft cel-shading, luz solar quente, profundidade por camadas e aparência infantojuvenil de aventura.

Nada de 3D.

Nada de Pixar.

Nada de pixel art.

Nada de anime dark.

2. História da primeira fase

A abertura pode começar com uma vista panorâmica da Vila das Conchas.

A câmera mostra lentamente:

mar → barcos → vila → píer → Marina.

Depois volta para a escala normal.

Marina está indo encontrar Seu Toninho e os demais no barco Esperança.

Essa justificativa simples permite ensinar o jogador a andar enquanto conhece a vila.

No percurso, Marina encontra alguns moradores, coleta conchas, passa pelo comércio, atravessa o porto e chega finalmente ao píer principal.

No final aparece o Esperança.

Isso fecha o cenário sem precisar ainda entrar em grandes eventos da história.

3. Estrutura física da fase

Divida internamente o mapa em sete setores de aproximadamente 2048 px.

Área	Coordenadas aproximadas	Conteúdo
A — Entrada da Vila	X 0–2048	casas, flores, pequena praça costeira
B — Rua dos Pescadores	X 2048–4096	redes, caixas, pescadores e barcos
C — Mercado	X 4096–6144	barracas, toldos, moradores e objetos interativos
D — Praça do Porto	X 6144–8192	área mais aberta, vista do mar
E — Cais de Pesca	X 8192–10240	barcos, guindaste, caixas, redes
F — Grande Píer	X 10240–12288	extensão longa sobre o mar
G — Esperança	X 12288–14336	barco Esperança e final da fase

Apesar dessa divisão técnica, o jogador não pode perceber cortes entre as áreas.

Visualmente precisa parecer um único cenário contínuo.

4. Regra fundamental para os panoramas

Esta parte é muito importante porque já tivemos problemas tentando gerar imagens que deveriam encaixar.

O Grok NÃO deve tratar cada trecho visual como uma cena independente.

O jogo deve trabalhar com uma composição contínua.

A solução correta é:

criar um panorama-mestre por camada e depois dividi-lo tecnicamente em pedaços.

Por exemplo:

Plain text
vila_far_master
vila_mid_master
vila_pier_master

Depois:

Plain text
vila_far_01.webp
vila_far_02.webp
vila_far_03.webp
...

As divisões são apenas técnicas.

Não devem ser novas ilustrações independentes.

Isso garante encaixe perfeito.

5. O farol não pode ficar se repetindo

Uma das regras principais da Vila das Conchas:

existe apenas UM farol.

Não quero que, a cada segmento panorâmico, apareça novamente o mesmo morro com o farol.

A paisagem deve evoluir.

Começo:

casas + vegetação + montanhas.

Depois:

mais porto.

Depois:

mar aberto.

Somente mais próximo do final o morro do farol começa a aparecer ao longe.

Ele permanece numa posição geográfica coerente conforme o jogador anda.

6. Camadas de parallax

O cenário não deve ser uma imagem única.

Use aproximadamente estas camadas:

Camada	Conteúdo	Scroll Factor
Sky	céu e nuvens	0.02
Horizon	mar e montanhas muito distantes	0.08
Distant Island	ilhas distantes	0.15
Village Far	casas e morros distantes	0.28
Village Mid	casas próximas, árvores, barcos	0.48
Harbor	cais e objetos médios	0.70
Gameplay	chão onde Marina anda	1.00
Foreground	redes, postes e objetos próximos	1.08

Não aplicar simplesmente o mesmo fator em tudo.

Isso é fundamental para criar profundidade.

7. Céu

O céu deve ser praticamente independente do mundo.

Dia claro.

Azul forte.

Nuvens brancas.

Pequena movimentação das nuvens.

Nada de rolagem rápida.

O céu deve parecer extremamente distante.

8. Mar

O mar também precisa ter várias camadas.

Uma base estática.

Uma camada de pequenas ondas.

Uma camada de reflexos.

Algumas áreas de espuma próximas ao píer.

Movimentos suaves.

Nada exagerado.

O mar não deve parecer uma textura se repetindo rapidamente.

9. Chão principal

O jogador não anda na própria imagem do píer.

Crie colisões invisíveis separadas.

A arte pode ter irregularidades.

A colisão continua limpa.

Estrutura aproximada:

Plain text
GROUND_COLLISION

com pequenos segmentos retangulares.

Isso evita personagens presos em detalhes da arte.

10. Altura do piso

Evitar uma linha completamente horizontal por 14.000 px.

O caminho deve variar levemente.

Exemplo:

piso normal.

subida pequena.

pequena escada.

caixas.

plataforma.

descida.

novo trecho do píer.

Mas nada deve parecer uma fase difícil logo no começo.

11. Plataformas

A Vila é uma fase de apresentação.

Use elementos naturais do cenário:

caixotes
plataformas de madeira
escadas
bancos
pequenos telhados baixos
barcos atracados
passarelas

Nenhuma plataforma flutuando sem explicação.

Tudo deve fazer sentido fisicamente.

12. Personagem inicial

Nesta primeira versão:

Marina Torres é a única personagem controlável.

Usar rigorosamente o visual da ficha da HQ:

cachos castanho-avermelhados volumosos, camisa laranja, camiseta clara, calça cargo verde-oliva, botas, mochila e bússola dourada.

Não alterar o design dela.

13. Tamanho da Marina na tela

Em 1920×1080:

altura aproximada:

280–330 px.

Ela não deve ocupar metade da tela.

O cenário é parte muito importante da experiência.

14. Hitbox

Nunca utilizar toda a imagem da personagem como colisão.

Exemplo:

sprite:

300 px de altura.

Hitbox aproximadamente:

55–60% da largura visual.

85% da altura.

Centralizada principalmente nas pernas e tronco.

Isso torna o controle muito melhor.

15. Movimento da Marina

A movimentação precisa ser excelente antes de qualquer outra coisa.

Valores iniciais sugeridos:

Plain text
walkSpeed = 210
runSpeed = 360

acceleration = 1800
deceleration = 2200

gravity = 1800
jumpVelocity = -690

coyoteTime = 120ms
jumpBuffer = 140ms

airControl = 0.78

Esses valores deverão ficar em um arquivo de configuração para facilitar ajustes.

16. Pulo variável

Não quero um pulo sempre igual.

Se o jogador apertar rapidamente:

pulo curto.

Se segurar:

pulo mais alto.

Quando o botão for liberado cedo, reduza a velocidade vertical.

Algo próximo a:

JavaScript
velocityY *= 0.55;

quando estiver subindo.

17. Coyote Time

Permitir que o jogador ainda pule aproximadamente 120 ms depois de sair da plataforma.

Isso torna o jogo muito mais agradável.

18. Jump Buffer

Se o jogador apertar pulo alguns milissegundos antes de tocar no chão, execute o pulo assim que aterrissar.

Isso evita sensação de comando perdido.

19. Estados de animação

A arquitetura deve usar uma máquina de estados.

Plain text
IDLE
WALK
RUN
JUMP_START
JUMP
FALL
LAND
CROUCH
INTERACT

Movimento físico e animação devem ser separados.

20. Animações ambientais

Mesmo na primeira versão quero movimento no cenário.

Alguns exemplos:

gaivotas voando.

barcos balançando.

bandeiras.

folhas.

roupas em varais.

redes mexendo.

água.

fumaça de alguma cozinha.

NPCs trabalhando.

Essas pequenas coisas fazem uma diferença enorme.

21. Câmera

Não quero a Marina fixamente no centro.

A câmera deve antecipar a direção.

Se Marina corre para a direita:

ela fica aproximadamente nos 40–43% da largura da tela.

Assim existe mais espaço para enxergar o caminho à frente.

Quando virar para esquerda:

o enquadramento muda suavemente.

Nunca instantaneamente.

22. Suavização

Algo próximo de:

Plain text
lerpX = 0.08
lerpY = 0.10

Ajustar depois conforme necessário.

Não quero câmera com atraso exagerado.

23. Deadzone

Utilizar uma pequena deadzone.

Marina pode se mover um pouco sem a câmera reagir imediatamente.

Isso evita tremores.

24. Limites da câmera

A câmera nunca deve mostrar:

fora do mapa.

faixas vazias.

cores de fundo do canvas.

O início e o final da vila precisam possuir limites adequados.

25. Primeiro ponto de interesse

Nos primeiros segundos, deixe o jogador apenas andar.

Nenhum inimigo.

Nenhum puzzle.

A pessoa precisa apreciar a Vila das Conchas.

Depois aparecem pequenos elementos interativos.

26. Conchas colecionáveis

Para a primeira fase:

20 conchas.

Não precisa mostrar 100 elementos na tela.

Distribuição sugerida:

12 fáceis.

5 que exigem pequenas plataformas.

2 escondidas.

1 especial.

Quando coletada:

pequeno brilho.

som leve.

animação.

Sem tela interrompendo a ação.

27. Primeira concha

A primeira deve ficar diretamente no caminho aproximadamente 15–20 segundos depois do início.

Assim o jogador entende naturalmente que pode coletá-las.

28. NPCs

A vila deve possuir aproximadamente 8–12 NPCs visíveis.

Mas nem todos precisam conversar.

Alguns:

pescador trabalhando.

vendedora.

senhora regando flores.

criança observando barco.

homem carregando caixa.

dois moradores conversando.

Isso faz a cidade parecer habitada.

29. NPC principal

Bia pode aparecer perto da metade da fase.

Ela pode ser a primeira personagem conhecida da HQ encontrada.

Interação:

Marina se aproxima.

ícone discreto aparece.

Jogador aperta E.

Bia dá uma pequena orientação sobre o Esperança.

Não precisamos implementar diálogos complexos agora.

30. Faísca

Uma pequena aparição seria ótima.

Em determinado momento:

Faísca entra correndo de uma lateral.

cruza parte da tela.

para.

olha Marina.

late.

continua correndo em direção ao porto.

Isso ajuda a guiar o jogador sem seta artificial.

31. Faísca precisa agir como cachorro

Nunca:

andar sobre duas patas.

segurar objetos como pessoa.

gesticular como humano.

Sempre quatro patas.

Pequeno.

Coleira azul.

Medalha de estrela dourada.

32. Interações ambientais

Alguns objetos podem reagir.

Caixa de madeira:

pode ser empurrada.

Sino:

pode tocar.

Porta:

pode abrir.

Barril:

pode rolar levemente.

Mas não coloque interação em tudo.

33. Área secreta

Podemos colocar uma pequena área abaixo do píer.

Não uma fase inteira.

Algo como:

plataforma inferior.

algumas caixas.

uma concha especial.

O jogador curioso recebe recompensa.

34. Perigos iniciais

Não precisamos colocar inimigos humanos nesta primeira implementação.

É melhor fazer o gameplay funcionar primeiro.

Podemos ter apenas perigos ambientais leves:

tábua quebrada.

caixa rolando.

pequeno espaço entre plataformas.

Nada mortal demais.

35. Os vilões que já criamos

O marinheiro com arpão e o marinheiro com bastão devem ficar preparados como assets para depois.

Mas não colocar ainda na primeira build da Vila.

Quando movimento e level design estiverem aprovados, podemos introduzir um deles próximo ao final.

36. Set piece da praça

Quando Marina chega aproximadamente ao centro da fase, abra o cenário.

A câmera pode se afastar uns 5–8%.

Mostrar:

praça.

porto.

barcos.

vila.

mar.

Isso cria um pequeno momento cinematográfico.

Depois a câmera retorna.

37. Grande revelação final

Perto de X ≈ 11.500:

o cenário começa a abrir.

Menos casas.

Mais mar.

O píer fica mais comprido.

Então surge:

o Esperança.

O farol também pode aparecer distante no morro.

Este deve ser o momento visual mais bonito da fase.

38. Esperança

O barco precisa respeitar o modelo que criamos.

Casco creme.

Faixa vermelha.

Detalhes azuis.

Cabine.

Convés.

Bóias.

Equipamentos.

Não criar barco genérico.

39. Final da fase

Marina chega próximo ao Esperança.

Ela não precisa subir no barco ainda.

Um trigger ativa:

câmera se aproxima suavemente.

outros personagens aparecem próximos do barco.

fade.

Plain text
FIM DA DEMO – VILA DAS CONCHAS

Na versão final isso levará para a próxima cena.

40. Áudio

A vila deve ter áudio em camadas.

Ambiente:

ondas.

gaivotas.

vento leve.

madeira do píer.

barcos.

moradores distantes.

Música:

aventura marítima alegre.

violão.

flauta.

percussão leve.

Sem música infantil demais.

41. Som baseado na posição

Barco distante:

baixo volume.

Chega perto:

som aumenta.

Mercado:

vozes.

Sai do mercado:

vozes diminuem.

Isso cria sensação espacial.

42. Iluminação

Manhã ou começo da tarde.

Sol quente.

Sombras suaves.

Mar azul vibrante.

A imagem não pode ficar excessivamente saturada.

Os personagens precisam destacar-se do cenário.

43. Assets recomendados

Em vez de um arquivo gigante com tudo junto, organize assim:

Plain text
assets/
    backgrounds/
    foreground/
    characters/
    npcs/
    props/
    collectibles/
    fx/
    audio/
    ui/

Dentro de backgrounds/vila:

Plain text
sky.webp
mountains.webp
islands.webp

village_far_01.webp
village_far_02.webp
...

village_mid_01.webp
village_mid_02.webp
...

harbor_01.webp
harbor_02.webp
...
44. PNG x WebP

Para grandes imagens opacas de cenário:

WebP.

Para objetos recortados com transparência:

PNG.

Exemplo:

poste.

rede.

barril.

barco.

planta.

NPC.

45. Não usar um PNG de 14.000 px

Mesmo que funcione em algumas GPUs, não é uma boa solução.

Divida tecnicamente em blocos.

Sugestão:

2048 px por trecho.

O jogo posiciona:

Plain text
0
2048
4096
6144
8192
10240
12288

Mas os arquivos precisam ter origem no mesmo panorama.

46. Sistema de level data

Não hardcode tudo dentro da Scene.

Crie:

Plain text
vilaLevelData.js

ou:

Plain text
vila.json

Contendo:

posição de NPC.

conchas.

plataformas.

triggers.

sons.

checkpoints.

objetos.

Assim podemos editar o nível sem quebrar código.

47. Estrutura de código desta etapa

Eu usaria:

Plain text
src/

main.js

config/
GameConfig.js
PlayerConfig.js

scenes/
BootScene.js
MenuScene.js
VilaDasConchasScene.js

entities/
Player.js
NPC.js
Collectible.js
InteractiveObject.js

characters/
Marina.js

systems/
PlayerStateMachine.js
ParallaxManager.js
CameraController.js
InteractionSystem.js
AudioManager.js
CheckpointSystem.js

levels/
VilaDasConchasData.js

ui/
HUD.js
InteractionPrompt.js
48. HUD

Muito discreto.

Superior esquerdo:

ícone de Marina.

conchas coletadas:

Plain text
7 / 20

Superior direito:

objetivo atual.

Exemplo:

Plain text
Encontre Seu Toninho no porto.

Nada ocupando grande parte da tela.

49. Controles PC
Plain text
A / ← = esquerda
D / → = direita

SHIFT = correr

SPACE = pular

S / ↓ = agachar

E = interagir

ESC = pausa

Também estruturar o InputManager para aceitar gamepad posteriormente.

50. Checkpoints

Nesta primeira fase eu colocaria três.

Aproximadamente:

Plain text
X 4200
X 8700
X 12300

Ao morrer ou cair:

retorno rápido.

Sem tela longa.

51. Desempenho

Meta:

60 FPS estáveis.

O Grok deve:

usar object pooling para efeitos.

não deixar centenas de objetos invisíveis atualizando.

carregar assets adequadamente.

desativar atualização de NPCs muito distantes.

não criar partículas infinitas.

52. O que NÃO quero

Quando enviar isso ao Grok, enfatize muito:

não criar placeholders como retângulos coloridos na versão visual.

não trocar nossas artes por gráficos genéricos.

não inventar personagens.

não redesenhar Marina.

não repetir o mesmo trecho de cenário.

não repetir o farol.

não criar píer sem continuidade.

não transformar a fase numa sequência de ilhas flutuantes.

não centralizar a câmera rigidamente.

não usar física excessivamente pesada.

não criar combate ainda.

53. Critério para considerar a Vila pronta

Antes de ir para a próxima fase, eu só avançaria quando estes pontos estiverem bons:

Marina gostosa de controlar.

pulo responsivo.

câmera agradável.

cenário realmente contínuo.

parallax convincente.

píer com colisão correta.

20 conchas.

NPCs.

Bia.

Faísca.

sons ambientais.

Esperança no final.

60 FPS.

Só depois seguimos.

Prompt mestre para mandar ao Grok

Você pode copiar este bloco praticamente inteiro:

Estamos desenvolvendo um jogo original chamado O Mistério da Ilha do Farol, baseado em uma HQ infantojuvenil de aventura.

Quero que você atue como lead game developer, game designer, level designer e technical artist.

Nesta etapa NÃO desenvolva o jogo inteiro.

Desenvolva somente o primeiro cenário jogável:

LEVEL 01 — VILA DAS CONCHAS.

Tecnologia:
Phaser 3 + JavaScript ES6.

Resolução lógica:
1920×1080.

Formato:
16:9 responsivo.

FPS alvo:
60 FPS.

O cenário terá aproximadamente 14.336 pixels de largura.

A direção predominante do jogador será da esquerda para a direita, mas deve ser possível retornar.

A personagem controlável inicialmente será somente Marina Torres.

Utilize os assets gráficos fornecidos por mim. Não redesenhe personagens e não substitua os assets por arte genérica.

A Vila das Conchas deve parecer uma cidade costeira ilustrada viva, com casas, porto, píeres, barcos, redes de pesca, vegetação, gaivotas, moradores, mercado, caixas, cordas, bóias, mar e pequenos elementos animados.

O visual é cartoon aventureiro 2D infantojuvenil, contorno limpo, soft cel shading, cores vibrantes, cenário detalhado e iluminação cinematográfica.

NÃO usar 3D.

NÃO usar pixel art.

NÃO usar visual Pixar.

NÃO criar plataformas flutuantes genéricas.

A arquitetura visual deve utilizar parallax multicamadas.

Camadas:

SKY scroll factor 0.02

HORIZON 0.08

DISTANT ISLANDS 0.15

VILLAGE FAR 0.28

VILLAGE MID 0.48

HARBOR 0.70

GAMEPLAY 1.0

FOREGROUND aproximadamente 1.08.

Não utilizar uma única textura de 14 mil pixels.

Organize os panoramas em segmentos de aproximadamente 2048 pixels, mas todos os segmentos devem vir da mesma arte panorâmica contínua para evitar costuras.

Nunca repita o farol em diversos trechos.

O farol é um único elemento geográfico distante e deve aparecer principalmente próximo da parte final da fase.

O piso jogável será formado principalmente por ruas costeiras, passarelas e píeres contínuos.

A arte do chão e a colisão devem ser sistemas separados.

Use colliders invisíveis simples e confiáveis.

Marina deve possuir movimento extremamente responsivo.

Valores iniciais:

walkSpeed 210

runSpeed 360

acceleration 1800

deceleration 2200

gravity 1800

jumpVelocity -690

coyoteTime 120 ms

jumpBuffer 140 ms

airControl 0.78.

Implemente pulo variável.

Se o botão de pulo for liberado durante a subida, reduza a velocidade vertical para aproximadamente 55%.

Utilize uma máquina de estados independente:

IDLE

WALK

RUN

JUMP_START

JUMP

FALL

LAND

CROUCH

INTERACT.

A câmera deve possuir smoothing, deadzone e look-ahead.

Marina não deve ficar rigidamente centralizada.

Quando andando para direita, mantenha-a aproximadamente entre 40 e 43% da largura da tela, permitindo que o jogador veja o caminho à frente.

A fase deve ser dividida conceitualmente em:

Entrada da Vila;

Rua dos Pescadores;

Mercado;

Praça do Porto;

Cais de Pesca;

Grande Píer;

Barco Esperança.

Visualmente não podem existir cortes perceptíveis entre essas áreas.

Crie 20 conchas colecionáveis.

Crie aproximadamente 8–12 NPCs ambientais.

Nem todos precisam possuir diálogo.

Inclua Bia como NPC interativo próximo da metade da fase.

Inclua Faísca em uma pequena sequência ambiental correndo sobre quatro patas em direção ao porto.

Não permita comportamento humano para Faísca.

Não implementar ainda inimigos humanos ou combate.

Utilize apenas perigos ambientais leves.

Adicione três checkpoints aproximadamente em X=4200, X=8700 e X=12300.

Próximo de X=11500 faça uma pequena revelação cinematográfica do porto aberto, do mar e do Esperança.

O barco Esperança ficará no final da fase e será o objetivo principal.

O final ocorre quando Marina chega ao Esperança.

Crie um trigger de conclusão preparado para futuramente carregar o próximo nível.

Adicione sons ambientes posicionais:

mar,

gaivotas,

madeira,

porto,

moradores,

barcos.

Música leve de aventura marítima.

Implemente um HUD mínimo com contador de conchas e objetivo atual.

Organize o projeto de forma modular.

Crie arquivos separados para Player, Marina, CameraController, ParallaxManager, InteractionSystem, AudioManager, CheckpointSystem, HUD e LevelData.

Todos os objetos da fase devem ser configuráveis pelo arquivo de dados do nível.

Não coloque posições importantes hardcoded diretamente dentro da Scene.

Antes de acrescentar qualquer outra fase ou sistema, quero que a Vila das Conchas esteja totalmente jogável e polida.

Gere todos os arquivos necessários.

Ao responder, mostre primeiro a estrutura das pastas. Depois forneça cada arquivo completo individualmente, indicando claramente seu caminho. Não omita código com frases como “restante igual” ou “adicione conforme necessário”. O protótipo precisa conseguir rodar.

Eu acrescentaria ainda uma instrução separada para o Grok depois que ele gerar a primeira versão:

Não avance para outro cenário. Primeiro vamos testar a Vila das Conchas. Quando eu enviar erros, altere somente os sistemas relacionados ao erro e preserve todos os sistemas que já estão funcionando. Não reescreva o projeto inteiro a cada correção.

Essa última frase é importante para impedir que ele “conserte” uma coisa e destrua três outras.

You said:
qual  o proximo passo ?
ChatGPT said:

O próximo passo é parar de ampliar o escopo e transformar a Vila das Conchas em uma primeira build realmente jogável. Antes de colocar inimigos, diálogos, missões, HUD complexo ou novas fases, precisamos validar três coisas: Marina + câmera + cenário contínuo.

Eu faria agora a ETAPA 2 — Protótipo Jogável da Vila das Conchas. Nessa etapa o Grok deve montar apenas o núcleo do jogo:

Criar o projeto base em Phaser 3, com resolução 1920×1080, tela responsiva e estrutura de pastas organizada.
Importar a Marina e criar os estados idle, walk, run, jump, fall e land. Mesmo que no começo alguma animação seja provisória, o sistema já deve estar pronto para trocar pelos sprites definitivos.
Criar o chão jogável da Vila, começando com uma versão simples de aproximadamente 8.000–14.000 px. Nada de detalhes ainda: apenas ruas, píer, pequenas diferenças de altura, escadas e algumas plataformas naturais.
Implementar a física da Marina: aceleração, desaceleração, corrida, pulo variável, coyote time e jump buffer.
Fazer a câmera lateral funcionar perfeitamente, com suavização e antecipação para o lado em que Marina está andando.
Montar o cenário panorâmico da Vila das Conchas em camadas de parallax, usando as imagens que já criamos. O ponto crítico aqui é testar se as partes realmente emendam sem costura.
Criar limites e colisões invisíveis separados da arte. Marina deve andar sobre o píer e as ruas sem depender do contorno visual da imagem.
Colocar apenas o início e o final da fase, com o barco Esperança no final. Por enquanto, sem inimigos, NPCs e missões.
Testar a fase andando do começo ao fim. Somente quando isso estiver agradável começamos a adicionar Bia, Faísca, conchas, NPCs, sons e eventos.

O resultado dessa etapa deve ser mais ou menos assim:

Marina nasce → anda pela Vila → corre → pula → câmera acompanha → cenário se move em parallax → atravessa ruas/píeres → chega ao Esperança.

Se isso estiver bonito e gostoso de controlar, teremos a fundação do jogo inteiro.

O que eu pediria agora ao Grok

Envie esta instrução como a próxima tarefa:

Vamos iniciar a ETAPA 2 do jogo O Mistério da Ilha do Farol.

Nesta etapa quero construir somente o protótipo jogável da Vila das Conchas.

NÃO implemente ainda inimigos, combate, diálogos, missões, conchas, HUD complexo ou outras fases.

O objetivo desta build é validar:

1. movimentação da Marina
2. física e pulo
3. câmera
4. colisão
5. cenário panorâmico contínuo
6. parallax
7. chegada ao barco Esperança

Utilize Phaser 3 + JavaScript ES6.

Resolução lógica 1920×1080, 60 FPS.

Crie primeiro uma fase horizontal com aproximadamente 10.000–14.000 pixels.

A Marina começa no lado esquerdo e precisa conseguir chegar ao barco Esperança no lado direito.

O cenário deve utilizar várias camadas:

céu
horizonte
ilhas distantes
vila distante
vila intermediária
porto
chão jogável
foreground.

Não utilize uma única imagem gigante.

Use segmentos de aproximadamente 2048 px que se encaixem perfeitamente, provenientes do mesmo panorama.

Implemente inicialmente:

Idle

Walk

Run

Jump

Fall

Land

Física inicial:

walkSpeed = 210

runSpeed = 360

acceleration = 1800

deceleration = 2200

gravity = 1800

jumpVelocity = -690

coyoteTime = 120

jumpBuffer = 140

airControl = 0.78

Implemente pulo variável.

Implemente CameraController separado da personagem.

Quando Marina andar para direita, ela deve ficar aproximadamente entre 40% e 43% da largura da tela.

Utilize smoothing e deadzone.

Crie colisões invisíveis independentes da arte.

O chão deve possuir algumas pequenas variações de altura, caixas, escadas e trechos de píer, mas ainda sem perigos importantes.

Coloque o barco Esperança no final como objetivo visual.

Quando Marina chegar perto do barco, apenas execute um trigger temporário no console:

LEVEL_01_COMPLETE

NÃO avance para outra fase.

Quero primeiro testar esta build.

Organize o projeto de forma modular e não coloque toda a lógica dentro de VilaDasConchasScene.js.

Antes de escrever código, apresente a estrutura completa de arquivos que você pretende criar. Depois gere os arquivos completos necessários para executar a primeira build.

Depois que o Grok entregar essa build, não avançamos imediatamente. Você me manda aqui o que ele criou — código, ZIP, prints ou erros — e eu faço uma revisão técnica da Vila das Conchas para identificar o que precisa ser corrigido.

A etapa seguinte, depois dessa aprovação, será a ETAPA 3: transformar o cenário estático em uma Vila viva, adicionando Faísca, Bia, NPCs, conchas, barcos animados, gaivotas, mercado, efeitos de água, sons e pequenas interações.

You said:
o aqeuivo ficou muit  grande para anexar aqui
ChatGPT said:

Sem problema. Para eu revisar o projeto, não precisa enviar o jogo inteiro. O ideal é criar um ZIP só com a parte técnica do projeto.

Envie apenas:

src/
index.html
package.json
package-lock.json ou equivalente
vite.config.js, se existir
arquivos .js, .ts, .json
sprites essenciais da Marina e, se necessário, 1 ou 2 imagens do cenário
qualquer arquivo de configuração do Phaser

Pode excluir sem medo:

node_modules/, dist/, .git/, caches, vídeos, arquivos PSD, imagens de cenário gigantes, músicas e efeitos sonoros pesados.

Se o peso estiver principalmente na pasta assets, você pode até não mandar os assets por enquanto. Eu consigo revisar estrutura, física, câmera, colisões e lógica apenas pelo código. Se houver referências como:

JavaScript
this.load.image('vila_bg_01', 'assets/backgrounds/vila_01.png')

já consigo entender como ele organizou.

Para facilitar ainda mais, peça ao Grok para gerar um arquivo chamado:

Plain text
PROJECT_STRUCTURE.txt

com a árvore do projeto, por exemplo:

Plain text
src/
  main.js
  scenes/
    VilaDasConchasScene.js
  player/
    Marina.js
  controllers/
    CameraController.js
  systems/
    CollisionSystem.js
assets/
  characters/
  backgrounds/
  props/

E também um:

Plain text
README_GAME.md

explicando como executar o projeto e quais arquivos controlam Marina, câmera, física, cenário e colisões.

Se mesmo esse ZIP ficar grande, pode dividir em 2 ou 3 ZIPs, por exemplo:

Plain text
VilaDasConchas_CODE.zip
VilaDasConchas_CHARACTERS.zip
VilaDasConchas_SCENARIO.zip

Comece me enviando VilaDasConchas_CODE.zip. Esse é o mais importante. Depois eu reviso a build e digo exatamente quais outros arquivos preciso ver.

ChatGPT can make mistakes. Check important info.
Latest response




5.6 High