# Spec-Driven Development — Side Hero

Este diretório é a **fonte de verdade** para features do jogo. Todo trabalho novo começa pela spec; implementação e testes devem rastrear critérios de aceite aqui.

## Painel de status (auditoria 2026-07-06)

| Feature | Aceite | Testes spec | Pendências |
|---------|--------|-------------|------------|
| [combat-campaign](combat-campaign.spec.md) | 8/8 | 6/6 | — |
| [heroes-party](heroes-party.spec.md) | 5/5 | 5/5 | — |
| [skills-progression](skills-progression.spec.md) | 6/6 | 7/7 | — |
| [gear-loot](gear-loot.spec.md) | 5/5 | 5/5 | — |
| [stash-forge](stash-forge.spec.md) | 5/5 | 3/3 | — |
| [shop-economy](shop-economy.spec.md) | 4/4 | 1/1 | — |
| [upgrade-tree](upgrade-tree.spec.md) | 7/7 | 7/7 | — |
| [meta-legacy](meta-legacy.spec.md) | 5/5 | 1/1 | — |
| [battle-ui](battle-ui.spec.md) | 7/7 | 6/6 | — |
| [chrome-infra](chrome-infra.spec.md) | 6/6 | 3/3 | — |
| [game-balance](game-balance.spec.md) | 8/8 | 10/10 | — |

**Total aceite (features):** 58/58 (100%)  
**Balanceamento transversal:** 8/8  
**Total testes listados nas specs:** 54/54 (100%)

## Próxima feature sugerida

Inventário Fase 2 — backlog em [`gear-loot.spec.md`](gear-loot.spec.md). Adicionar critérios `[ ]` na spec antes de implementar.

## Regras de workflow do agente

1. **Não rodar testes automaticamente** — não execute `npm test` nem suites individuais a menos que o usuário peça explicitamente. Crie ou atualize arquivos de teste; a execução é manual pelo desenvolvedor.
2. **Release só sob pedido** — não execute `npm run release`, não gere zip em `releases/` e não faça bump de versão até o usuário solicitar.

## Fluxo SDD

```
1. Ler spec da feature (specs/<feature>.spec.md)
2. Atualizar spec se o escopo mudar (antes de codar)
3. Implementar nas camadas corretas (domain → application → presentation)
4. Criar ou atualizar testes listados na spec (não executar npm test)
5. Marcar [x] nos critérios entregues
```

## Mapa de features

| Spec | Domínio | Agent | Skill |
|------|---------|-------|-------|
| [combat-campaign](combat-campaign.spec.md) | Combate, waves, campanha, tick | `.cursor/agents/combat-campaign.md` | `.cursor/skills/combat-campaign/` |
| [heroes-party](heroes-party.spec.md) | Heróis, party, reserva, unlock | `.cursor/agents/heroes-party.md` | `.cursor/skills/heroes-party/` |
| [skills-progression](skills-progression.spec.md) | Skills, ascensão, pontos | `.cursor/agents/skills-progression.md` | `.cursor/skills/skills-progression/` |
| [gear-loot](gear-loot.spec.md) | Gear, inventário, baús, loot | `.cursor/agents/gear-loot.md` | `.cursor/skills/gear-loot/` |
| [stash-forge](stash-forge.spec.md) | Baú de itens, Forja Divina | `.cursor/agents/stash-forge.md` | `.cursor/skills/stash-forge/` |
| [shop-economy](shop-economy.spec.md) | Loja, ouro, renovar | `.cursor/agents/shop-economy.md` | `.cursor/skills/shop-economy/` |
| [upgrade-tree](upgrade-tree.spec.md) | Árvore de melhorias | `.cursor/agents/upgrade-tree.md` | `.cursor/skills/upgrade-tree/` |
| [meta-legacy](meta-legacy.spec.md) | Meta entre temporadas | `.cursor/agents/meta-legacy.md` | `.cursor/skills/meta-legacy/` |
| [battle-ui](battle-ui.spec.md) | Battle strip, modais, Wow, UX | `.cursor/agents/battle-ui.md` | `.cursor/skills/battle-ui/` |
| [chrome-infra](chrome-infra.spec.md) | Extension, storage, SW, panel | `.cursor/agents/chrome-infra.md` | `.cursor/skills/chrome-infra/` |
| [game-balance](game-balance.spec.md) | Curva, fórmulas, auditoria transversal | `.cursor/agents/game-balance.md` | `.cursor/skills/game-balance/` |

## Arquitetura global

```
domain/       → regras puras, sem Chrome/UI
application/  → use cases, DTOs, mappers
infrastructure/ → storage, messaging, DI
presentation/ → panel, renderers, controllers
```

Regra: `presentation` não importa `domain` diretamente — use DTOs e flags em `GameStateDto`.

## Balanceamento transversal

Mudanças numéricas ou de curva devem consultar [`game-balance.spec.md`](game-balance.spec.md) em conjunto com a spec da feature. Ver backlog `BAL-*`.
