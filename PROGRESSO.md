# Progresso e retomada — Turma do Farol

Atualizado em 20/10/2026 (America/Sao_Paulo).

## Concluído

- Repositório conferido: `ffagmarcos-ops/turma-do-farol-game`.
- `AGENTS.md` e `GUIA_CONTINUIDADE.md` lidos antes das alterações.
- Base remota verificada: `main` e `integrar-bia-assets-fase3` em `025d38bb334624f66ac2d84db8944c4f6deb8798`.
- Cópia existente no Mac (`~/Documents/turma-do-farol-game`) inspecionada, limpa, sem alterações pendentes. Nenhum arquivo dessa cópia foi alterado.
- Trabalho desta retomada isolado na branch `retomar-integracao-fase3`.
- Histórico recente: Passo 16 (`025d38b`), pulo duplo (`530d852`), Passo 15 (`e41ceb9`), Passo 14 (`e5a5eb3`). Esses trabalhos já estão no GitHub.
- Recuperada do histórico a identificação do commit pendente: `346cdad0898a35c3609be96b9a6151748f6335e0`, “Integra assets da Ilha do Farol e corrige animações da Bia”, 41 arquivos, baseado em `025d38b`.
- Confirmado que esse commit ainda não pode ser obtido pelo GitHub. Os testes relatados no chat antigo não substituem testes desta retomada.
- Com autorização explícita do Marcos, foi solicitado ao chat anterior que exportasse o commit completo. Resposta: o ambiente original e os dados temporários não estão mais acessíveis; nenhum pacote completo pôde ser exportado e nenhuma branch foi publicada por aquele chat.
- Recuperado integralmente `src/game/fase3/AnimationEvents.js` pelo blob remoto `b73958b368ac5c4ffde4992dc964d2e2cf42fbaa`; `git hash-object` confirmou igualdade exata com o original. O módulo organiza eventos de ações pelo tempo, incluindo quadros pulados. Ainda depende dos demais arquivos para ser usado pelos personagens.
- Quatro testes automáticos passaram: ordem e execução única com salto de quadros, cancelamento/reinício, troca de animação e manifesto ausente. Comando: `node --test tools/testar_eventos_animacao.mjs`.

## Pendências

- Recuperar os outros 40 arquivos do commit original. Caminho histórico: `/workspace/scratch/bcafa4d4b8b6/turma-do-farol-game`; chat Codex `01a15544-9514-7628-bcd2-ac70ea7a3000`, host `durable`. O próprio chat confirmou que o ambiente está indisponível. Para concluir, é necessário um backup desse diretório/commit, um `git bundle`, patch binário ou o pacote completo dos arquivos. Não repetir tentativas de acesso ao mesmo ambiente sem nova evidência de restauração.
- Não reconstruir imagens ou código a partir de trechos truncados. O histórico relata oito PNGs em `public/assets/farol/fase3_ilha/setorA/fontes/`, integração de cenários, animações/eventos da Bia e ajudantes, além de documentação e ferramentas de verificação.
- Conferir arquivos recuperados contra a base e o commit original; preservar alterações já publicadas ou locais.
- Separar em lotes coerentes; testar antes de publicar cada lote. Registrar commit, arquivos e resultado da verificação abaixo.
- Testar `npm run dev`, abrir `?fase3=novo` e conferir ações da Bia, ajudantes, colisões e cenários conforme os arquivos recuperados. Não gerar APK/ZIP sem pedido.

## Último commit

- Último commit de código confirmado na abertura desta retomada: `025d38bb334624f66ac2d84db8944c4f6deb8798`.
- Lote 1 publicado e verificado no GitHub: `3764f9ab0282ee28778d836c5b5d5d9e49555b54`.
- O commit que contém esta versão do registro é localizado com `git log -1 --format='%H %s' -- PROGRESSO.md`; seu próprio hash não pode ser incluído no mesmo commit.

## Lotes

1. Registro inicial da auditoria e das pendências: somente este documento. Conferir publicação pela igualdade entre HEAD local e branch remota.
2. Recuperação exata do relógio de eventos de animação, quatro testes e atualização deste registro. Lote preparatório: não conecta o módulo às ações do jogo, pois os controladores originais ainda não foram recuperados. Verificação do dev por HTTP; a integração visual dos 41 arquivos continua pendente.

## Instruções de retomada

1. Ler este arquivo, `AGENTS.md` e `GUIA_CONTINUIDADE.md`.
2. Conferir `git status --short`, branch, `git log -5 --oneline` e referências remotas. Nunca sobrescrever trabalho existente, usar force push ou reset de commits publicados.
3. Continuar em `retomar-integracao-fase3`. A branch de integração antiga ainda não contém as mudanças pendentes; não presumir que seu nome comprova a publicação.
4. Recuperar o pacote completo antes de implementar o lote de integração. O histórico identifica o trabalho, mas algumas saídas estão truncadas.
5. Após cada lote: revisar diff e `git diff --check`, executar verificações apropriadas e teste no dev, atualizar este registro, criar commit em português e enviar a branch.
6. Confirmar `git ls-remote origin refs/heads/retomar-integracao-fase3` igual a `git rev-parse HEAD`. Se falhar, registrar a falha; não declarar envio concluído.
7. Manter `main` preservada até revisão da integração. Não incluir credenciais, dependências, builds ou arquivos temporários nos commits.

## Reconstrução autorizada em 20/10/2026

O Marcos pediu uma nova implementação dos ajustes. Os arquivos antigos continuam indisponíveis; não confundir reconstrução com recuperação do commit 346cdad. A pasta fornecida em Downloads contém os mesmos 66 arquivos do pacote já publicado.

### Lote 3 — alinhamento dos atlas
- Criados AtlasGeometry.js e atlas_registration.json medindo a transparência das imagens existentes, com ferramenta reproduzível tools/medir_atlas_fase3.py. Nenhuma arte foi substituída.
- Bia mantém a hitbox de 70,52 × 167,28 no mundo (95,12 de altura agachada) em todos os atlas; os pés ficam ancorados ao mudar de quadro. Faísca, inimigos e ajudantes usam a mesma rotina de alinhamento.
- Teste em npm run dev: tools/testar_integracao_fase3.html passou 431 verificações de atlas, animações, quadros e hitbox. Quatro testes do relógio de eventos também passaram.
- Próximo lote: conectar eventos do manifesto às ações e eliminar a segunda instância da Bia no setor L.

### Lote 4 — eventos das ações
- Lote anterior publicado: 892ab83ede636e4b51b6292e5abb6f4146c464a2.
- Concha no evento de 333 ms, pedra no de 400 ms, corda em 285 ms, flash em 375 ms, plataformas do Lucas em 1000 ms e descoberta da Bia em 400 ms.
- Golpe do caranguejo respeita a janela de garras; dano, respawn e troca de estado cancelam ações pendentes.
- Setor L usa a protagonista para investigar, sem criar outra Bia; o final também não duplica a personagem.
- Página de teste no dev passou 456 verificações, incluindo ações, cancelamentos e ausência de duplicação.
- Próximo lote: aproveitar a arte do pacote existente em terrenos, objetos e efeitos; manter registrada a ausência das oito imagens extras antigas.
