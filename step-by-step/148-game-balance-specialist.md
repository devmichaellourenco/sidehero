# 148 — Especialista em balanceamento (SDD transversal)

## Objetivo

Agent, spec e skill dedicados ao **balanceamento holístico** do Side Hero — coordenação entre combate, gear, campanha, economia e progressão.

## Estrutura criada

```
specs/game-balance.spec.md       # spec transversal + backlog BAL-*
.cursor/agents/game-balance.md   # agent auditor/coordenador
.cursor/skills/game-balance/     # skill de auditoria e mapa de fórmulas
```

## Papel no SDD

- **11ª feature** no mapa (`specs/README.md`, `.cursor/AGENTS.md`)
- Não substitui agents de feature; atua **antes/depois** de mudanças numéricas
- Backlog inicial: BAL-001 (DOT), BAL-002 (gelo), BAL-003/004 (documentação)

## Como usar

1. Mudança de balance → `@.cursor/agents/game-balance.md` ou skill `game-balance`
2. Ler backlog em `specs/game-balance.spec.md`
3. Implementar com agent da feature + revisão balance
4. Marcar critérios e fechar itens `BAL-*`

## Próximo passo sugerido

Corrigir **BAL-001** (DOT no pipeline) com par `game-balance` + `combat-campaign`.
