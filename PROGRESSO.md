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

## Pendências

- Recuperar os 41 arquivos completos do ambiente do chat anterior. Caminho histórico: `/workspace/scratch/bcafa4d4b8b6/turma-do-farol-game`; chat Codex `01a15544-9514-7628-bcd2-ac70ea7a3000`, host `durable`.
- Não reconstruir imagens ou código a partir de trechos truncados. O histórico relata oito PNGs em `public/assets/farol/fase3_ilha/setorA/fontes/`, integração de cenários, animações/eventos da Bia e ajudantes, além de documentação e ferramentas de verificação.
- Conferir arquivos recuperados contra a base e o commit original; preservar alterações já publicadas ou locais.
- Separar em lotes coerentes; testar antes de publicar cada lote. Registrar commit, arquivos e resultado da verificação abaixo.
- Testar `npm run dev`, abrir `?fase3=novo` e conferir ações da Bia, ajudantes, colisões e cenários conforme os arquivos recuperados. Não gerar APK/ZIP sem pedido.

## Último commit

- Último commit de código confirmado na abertura desta retomada: `025d38bb334624f66ac2d84db8944c4f6deb8798`.
- O commit que contém esta versão do registro é localizado com `git log -1 --format='%H %s' -- PROGRESSO.md`; seu próprio hash não pode ser incluído no mesmo commit.

## Lotes

1. Registro inicial da auditoria e das pendências: somente este documento. Conferir publicação pela igualdade entre HEAD local e branch remota.

## Instruções de retomada

1. Ler este arquivo, `AGENTS.md` e `GUIA_CONTINUIDADE.md`.
2. Conferir `git status --short`, branch, `git log -5 --oneline` e referências remotas. Nunca sobrescrever trabalho existente, usar force push ou reset de commits publicados.
3. Continuar em `retomar-integracao-fase3`. A branch de integração antiga ainda não contém as mudanças pendentes; não presumir que seu nome comprova a publicação.
4. Recuperar o pacote completo antes de implementar o lote de integração. O histórico identifica o trabalho, mas algumas saídas estão truncadas.
5. Após cada lote: revisar diff e `git diff --check`, executar verificações apropriadas e teste no dev, atualizar este registro, criar commit em português e enviar a branch.
6. Confirmar `git ls-remote origin refs/heads/retomar-integracao-fase3` igual a `git rev-parse HEAD`. Se falhar, registrar a falha; não declarar envio concluído.
7. Manter `main` preservada até revisão da integração. Não incluir credenciais, dependências, builds ou arquivos temporários nos commits.
