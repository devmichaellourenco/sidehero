# 147 — Spec-Driven Development, agents e skills

## Objetivo

Estrutura SDD para o Side Hero: specs por feature, agents Cursor e skills de projeto.

## Estrutura criada

```
specs/                    # fonte de verdade por feature
  README.md
  *.spec.md               # 10 features

.cursor/
  AGENTS.md               # registro central
  agents/*.md             # 10 agent prompts
  rules/architecture.mdc  # regra always-apply
  skills/*/SKILL.md       # 10 skills de projeto
```

## Features mapeadas

1. combat-campaign
2. heroes-party
3. skills-progression
4. gear-loot
5. stash-forge
6. shop-economy
7. upgrade-tree
8. meta-legacy
9. battle-ui
10. chrome-infra

## Como usar

1. Escolha a feature → leia `specs/<nome>.spec.md`
2. No Cursor, referencie `@.cursor/AGENTS.md` ou agent específico
3. Skill carrega com menção à feature (ex.: upgrade tree → skill `upgrade-tree`)
4. Implemente e marque critérios de aceite na spec

## Manutenção

- Nova feature principal → adicionar trio spec + agent + skill
- Critério entregue → `[x]` na spec (última auditoria: 2026-07-03 em `specs/README.md`)
- Release notes / step-by-step separados por entrega
