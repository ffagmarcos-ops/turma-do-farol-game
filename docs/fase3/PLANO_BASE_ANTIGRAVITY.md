# Fase 3 — Plano base para continuar sozinho no Antigravity

Fase 3: "Chegada à Ilha" — Praia → Floresta → Caverna. Plataforma 2D longa (40.000–55.000 px), Phaser 3, Arcade Physics, 1920×1080, teclado + gamepad, mapa dividido em CHUNKS (setores) que só ativam perto da câmera.

## Como usar este plano
1. Abra a pasta `turma-do-farol-game` no **Antigravity IDE**.
2. Garanta o jogo rodando: peça *"rode npm run dev"* e abra http://localhost:5173.
3. Faça **um passo por vez**, na ordem abaixo. Copie o "Pedido" de cada passo no chat do Antigravity.
4. Depois de cada passo: teste no navegador. Se estiver bom, peça *"faça commit e push com a mensagem: Fase 3 – passo X"*. Se quebrou, peça *"desfaça as mudanças desde o último commit"*.
5. Sempre comece um chat novo do Antigravity com: *"Leia AGENTS.md, docs/fase3/PLANO_BASE_ANTIGRAVITY.md e docs/fase3/PLANO_FASE3.md antes de mexer."*

## Regras que valem sempre (lembre o Antigravity se ele esquecer)
- Não mexer nas Fases 1 e 2, no save (`farol-conchas-v2`, `farol-som`) nem nos créditos.
- Vida infinita: ao cair/levar dano, volta no último checkpoint, sem game over.
- Sofia jogável; Faísca é cachorro (sempre quadrúpede), segue a Sofia, nunca colide/empurra/bloqueia ela.
- Arte: todas as imagens e animações ficam num arquivo-manifesto único (ver `docs/fase3/ASSETS_FASE3.md`). Trocar arte = trocar o arquivo, sem mexer na lógica.
- Só assets próprios (gerados por você) ou CC0.
- Textos do jogo em português.
- Sem texto escrito nas ruínas. Sem violência: inimigos derrotados saem "voando" estilo desenho.

## Passos

**Passo 0 — Base (eu já comecei)**  
Motor da fase: chunks, câmera (deadzone, olhar à frente, leve antecipação na queda), parallax de 7 camadas, Sofia (aceleração suave, coyote time 120 ms, jump buffer 120 ms, salto variável, correr, agachar), Faísca seguindo, concha (arco, gira, ricochete), latido especial (segurar ~1,5 s, onda que derrota inimigos comuns, cooldown), checkpoints, conchas coletáveis, Fase 3 no menu de portais.  
*Se eu parar no meio:* "Leia docs/fase3/PLANO_FASE3.md e termine o Passo 0 que ficou pela metade. Rode npm run build e corrija erros."

**Passo 1 — Setor A: Praia da Chegada**  
Pedido: "Implemente o Setor A (Praia): ondas em camadas com espuma e brilho chegando na areia, pedras, troncos, plataformas baixas, caranguejos patrulhando (viram na parede/beirada, levantam garras, atacam, derrota cartoon). Dicas curtas de tutorial: andar, pular, lançar concha, Faísca seguindo. Área opcional atrás das pedras com um colecionável. Checkpoint no fim."

**Passo 2 — Setor B: Costão rochoso**  
Pedido: "Implemente o Setor B (Costão): plataformas de pedra estreitas e molhadas, primeiras quedas, ondas batendo nas pedras, caranguejos em posições altas, algumas plataformas que desmoronam depois de pisadas. Checkpoint no fim."

**Passo 3 — Setor C: Entrada da floresta + macacos**  
Pedido: "Implemente o Setor C e o inimigo MACACO: fica em galho/plataforma alta, pega pedra, levanta o braço (aviso claro), joga em arco e a pedra tem sombra no chão mostrando onde cai. Pode ser atordoado e derrotado por concha. Estados: idle, observar, pegar pedra, mirar, jogar, rir, dano, atordoado, derrota."

**Passo 4 — Setor D: Seu Toninho e a corda**  
Pedido: "Implemente o Setor D: paredão alto; ao entrar na zona helpZoneToninho, o Seu Toninho (em cima) joga uma corda náutica. Sofia agarra, sobe, balança e salta para outra plataforma. Ele segura a corda o tempo todo e acena depois. A corda continua interativa. O NPC nunca bloqueia a Sofia."

**Passo 5 — Setor E: Floresta densa**  
Pedido: "Implemente o Setor E: raízes, troncos, cipós e galhos, plataformas na vertical e na horizontal, macacos em cima e caranguejos embaixo. Dificuldade um pouco maior, com uma área segura no meio."

**Passo 6 — Setor F: Marina empurra a caixa**  
Pedido: "Implemente o Setor F: trecho alto impossível; ao entrar na zona, Marina empurra uma caixa grande até a posição certa; Sofia sobe e alcança a área de cima; Marina faz gesto de 'vai'."

**Passo 7 — Setor G: Desfiladeiro**  
Pedido: "Implemente o Setor G: área vertical grande, plataformas em várias alturas, cipós, plataformas que balançam, saltos seguidos. Faísca vai por uma rota alternativa e reencontra a Sofia (ou reaparece atrás dela)."

**Passo 8 — Setor H: Júlia e o flash**  
Pedido: "Implemente o Setor H: vários macacos; Júlia numa plataforma lateral tira fotos em intervalo regular; cada flash dá um clarão rápido e deixa os macacos tontos ~2 s. A travessia é feita aproveitando as janelas do flash."

**Passo 9 — Setor I: Riacho e o aparelho do Lucas**  
Pedido: "Implemente o Setor I: poça/riacho fundo com água bem detalhada (transparência, reflexo, espuma, partículas). Lucas ajoelhado ativa um aparelho que cria 4–5 plataformas flutuantes (algumas oscilam). Sofia atravessa pulando; Lucas comemora."

**Passo 10 — Setor J e K: Cachoeira e gruta secreta**  
Pedido: "Implemente o Setor J (cachoeira grande ao fundo, névoa, respingos, plataformas molhadas que escorregam um pouco) com entrada secreta atrás da cachoeira, onde o Faísca para, fareja e late baixo. E o Setor K: gruta opcional com luz azul suave, conchas, colecionável da história e energia especial."

**Passo 11 — Setor L: Bia e o caminho escondido**  
Pedido: "Implemente o Setor L: Bia observa marcas antigas nas pedras e aponta uma passagem escondida na vegetação. Duas rotas: principal e opcional (plataformas mais altas com colecionáveis), que se reencontram depois."

**Passo 12 — Setor M: Floresta alta (desafio maior)**  
Pedido: "Implemente o Setor M: maior desafio de plataforma, vários níveis, galhos, cipós, pontes naturais, troncos caídos, macacos jogando pedras de alturas diferentes e caranguejos embaixo. Checkpoints antes e no meio."

**Passo 13 — Setor N: Ruínas**  
Pedido: "Implemente o Setor N: a vegetação diminui, surgem pedras talhadas com símbolos abstratos (sem texto), e o azul da caverna aparece aos poucos na iluminação."

**Passo 14 — Setor O: Entrada da caverna (final)**  
Pedido: "Implemente o Setor O: a mata se abre para a grande entrada da Caverna Azul com luz azul de dentro. Faísca para ao lado da Sofia, ela observa, os amigos aparecem chegando ao longe, a câmera desacelera e faz fade para a tela de fim de fase."

**Passo 15 — Segredos e polimento**  
Pedido: "Revise os segredos da fase (folhagem, buraco sob plataforma, atrás da cachoeira, parede quebrável, caminho superior, túnel estreito, pedra móvel, plataforma que aparece). O Faísca indica só alguns. Revise os sons por área (praia, floresta, cachoeira, caverna) e os volumes de música/efeitos."

**Passo 16 — Trocar a arte provisória pela sua**  
Coloque seus PNGs nas pastas indicadas em `docs/fase3/ASSETS_FASE3.md` (mesmos nomes) e peça: "Troquei as artes da Fase 3 na pasta X; ajuste o manifesto para os tamanhos e quadros reais e teste as animações."

**Passo 17 — Gerar versão (APK + PC)**  
Pedido: "Gere a versão 3.7 seguindo o AGENTS.md (versionCode 18, processo leve, `./gradlew clean assembleDebug`, APK < 70 MB) e o zip PC v17. Não apague versões antigas." Depois suba os arquivos na pasta do Drive "GAMES - Turma do Farol".

## Se algo der errado
- Tela preta / erro: "Abra o console do navegador, leia o erro e corrija."
- Jogo lento: "Confira se os chunks distantes estão desativados e se as texturas estão grandes demais."
- APK grande (170 MB): faltou o `clean` ou o processo leve (`tools/otimizar_assets.py`).
- APK não instala por cima: a chave `~/.android/debug.keystore` não foi usada. Ela fica também na pasta privada do Drive "PRIVADO - Chave APK Turma do Farol". Nunca suba essa chave no GitHub.

## Se o Kojima (Grok Bot) congelar — cole isto no Antigravity
```
O assistente anterior parou no meio da Fase 3. Leia AGENTS.md, docs/fase3/PLANO_BASE_ANTIGRAVITY.md e docs/fase3/PLANO_FASE3.md (se existir). Rode git status e git diff para ver o que ficou pela metade. Depois rode npm run build e corrija qualquer erro. Confira no navegador (localhost:5173) se as Fases 1 e 2 continuam funcionando e se a Fase 3 abre pelo menu de portais. Termine o passo que estava incompleto, atualize o PLANO_FASE3.md com o status, faça commit e push com a mensagem "Fase 3 – continuação". Então me diga qual é o próximo passo do plano antes de começá-lo.
```
