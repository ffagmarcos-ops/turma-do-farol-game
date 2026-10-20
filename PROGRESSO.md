# Progresso e retomada — Turma do Farol

Atualizado em 20/10/2026 (America/Sao_Paulo).

## Estado atual

- Repositório: `ffagmarcos-ops/turma-do-farol-game`.
- Branch desta implementação: `retomar-integracao-fase3`. Base: `main` em `025d38bb334624f66ac2d84db8944c4f6deb8798`.
- O Marcos autorizou recriar os ajustes da integração usando o código e os sprites disponíveis. Trata-se de implementação nova, não de recuperação exata do commit antigo.
- O pacote de 32 sprites/atlas e 69 animações já estava no GitHub desde 19/10. A pasta indicada em Downloads contém 66 arquivos idênticos aos desse pacote.
- A cópia original do Mac em `~/Documents/turma-do-farol-game` foi inspecionada e preservada. O trabalho está na cópia isolada desta conversa.

## Concluído

- Pés alinhados pelas medidas reais dos PNGs. A hitbox da Bia permanece estável ao trocar de atlas e diminui ao agachar.
- Concha, pedra, corda, flash, plataformas do Lucas e descoberta da Bia sincronizados com os eventos do manifesto. Cancelamentos impedem ações pendentes após interrupções.
- Uma única Bia: o setor L usa a protagonista para investigar e o encerramento não cria outra Bia.
- Terrenos, ruínas, plataformas, partículas, ondas e cachoeiras aproveitam recortes do pacote existente; nenhuma imagem original foi sobrescrita.
- Corrigidas as texturas das plataformas secretas e a permanência da arte oficial dos checkpoints.
- Ferramenta reproduzível de medição, testes e documentação em `docs/fase3/INTEGRACAO_ASSETS.md`.

## Lotes e último commit

1. `3764f9ab0282ee28778d836c5b5d5d9e49555b54`: registro inicial da auditoria. Push confirmado.
2. `2778a8286ea816042b845fac136a40a283b573d9`: recuperação exata de AnimationEvents.js e quatro testes. Push confirmado.
3. `892ab83ede636e4b51b6292e5abb6f4146c464a2`: alinhamento dos atlas e colisões; 431 verificações no navegador. Push confirmado.
4. `aa152db`: ações sincronizadas e Bia única; 456 verificações no navegador. Push confirmado.
5. Este lote: arte existente aplicada em terrenos e efeitos, correções das plataformas e checkpoints, testes e documentação. Seu hash é consultado com `git log -1 --format='%H %s'`; o arquivo não pode incluir o hash do próprio commit que o contém.

## Verificado

- `node --test tools/testar_eventos_animacao.mjs tools/testar_integracao_fase3.mjs`: oito testes passaram.
- `npm run dev`: a página `/tools/testar_integracao_fase3.html` passou 554 verificações, incluindo montagem de chunks nos checkpoints A0–O0, sem criar Bia duplicada.
- Sintaxe dos módulos alterados e `git diff --check` sem erros.
- A montagem dos chunks e testes controlados das ações não equivalem a uma partida completa no celular.
- Não foram gerados APK, ZIP ou dependências novas.

## Arquivos antigos indisponíveis

O chat anterior registrou `346cdad0898a35c3609be96b9a6151748f6335e0` com 41 arquivos, mas confirmou que o ambiente `/workspace/scratch/bcafa4d4b8b6/turma-do-farol-game` ficou indisponível. Somente AnimationEvents.js foi recuperado exatamente, pelo blob `b73958b368ac5c4ffde4992dc964d2e2cf42fbaa`.

As oito imagens extras de cenário não foram localizadas. A reconstrução usa as camadas existentes e os recortes do pacote 06–37, sem depender dessas imagens. Não há uma fila de “40 arquivos locais prontos para subir”, nem foi necessário criar 40 arquivos novos para implementar os ajustes.

## Pendências e retomada

1. Ler `AGENTS.md`, `GUIA_CONTINUIDADE.md` e `docs/fase3/INTEGRACAO_ASSETS.md`.
2. Conferir branch, `git status --short`, `git log -5 --oneline` e referências remotas antes de editar. Não sobrescrever alterações, não usar force push.
3. A publicação ocorre na branch `retomar-integracao-fase3`; a incorporação em `main` ainda é uma etapa separada de revisão.
4. Para conferir visualmente: `?fase3=novo`, D0 (corda), F0 (Marina), H0 (flash), I0 (Lucas), L0 (investigação) e O0 (caverna). Controles e expectativas estão no documento da integração.
5. Após cada novo lote: revisar diff, testar, atualizar este documento, fazer commit em português e push; comparar `git rev-parse HEAD` com `git ls-remote origin refs/heads/retomar-integracao-fase3`.
6. Alterações futuras na arte devem preservar identidade e originais. As oito imagens antigas só seriam necessárias para reproduzir exatamente aquele visual perdido, não para executar esta integração.
