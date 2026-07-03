# Side Hero — Agent Registry

Guia para agentes Cursor trabalhando neste repositório. **Spec-driven:** sempre leia a spec da feature antes de implementar.

## Regras de workflow do agente

1. **Não rodar testes automaticamente** — crie ou atualize arquivos de teste; `npm test` só quando o usuário pedir explicitamente.
2. **Release só sob pedido** — não execute `npm run release`, não gere zip nem bump de versão até o usuário solicitar.

Detalhes: `specs/README.md` · regra Cursor: `.cursor/rules/workflow.mdc`

## Workflow SDD

1. Identifique a feature → leia `specs/<feature>.spec.md`
2. Siga `.cursor/skills/<feature>/SKILL.md`
3. Implemente: `domain` → `application` → `presentation` → `infrastructure`
4. Se envolver números/curva → consulte `specs/game-balance.spec.md` e skill `game-balance`
5. Crie ou atualize testes listados na spec (sem executar)
6. Documente entregas em `step-by-step/` quando relevante

## Arquitetura (todas as features)

```
domain/        regras puras — sem Chrome, sem DOM
application/   use cases + DTOs
infrastructure/ storage, messaging, DI
presentation/  UI — só consome DTOs
```

Regra crítica: `presentation/` **não** importa `domain/` diretamente.

## Feature Agents

| Agent | Quando usar | Spec | Paths principais |
|-------|-------------|------|------------------|
| [combat-campaign](agents/combat-campaign.md) | combate, waves, fases, tick, boss | `specs/combat-campaign.spec.md` | `domain/campaign`, `domain/services/combat` |
| [heroes-party](agents/heroes-party.md) | party, reserva, unlock, formação | `specs/heroes-party.spec.md` | `domain/party`, `hero-detail` |
| [skills-progression](agents/skills-progression.md) | skills, ascensão, slots | `specs/skills-progression.spec.md` | `domain/progression` |
| [gear-loot](agents/gear-loot.md) | inventário, baús, equipar | `specs/gear-loot.spec.md` | `LootService`, `GearEquipService` |
| [stash-forge](agents/stash-forge.md) | baú de itens, forja | `specs/stash-forge.spec.md` | `DivineForgeService`, stash use cases |
| [shop-economy](agents/shop-economy.md) | loja, ouro | `specs/shop-economy.spec.md` | `ShopService` |
| [upgrade-tree](agents/upgrade-tree.md) | melhorias, features | `specs/upgrade-tree.spec.md` | `UpgradeCatalog`, `UpgradeTree*` |
| [meta-legacy](agents/meta-legacy.md) | selos, temporada | `specs/meta-legacy.spec.md` | `domain/meta` |
| [battle-ui](agents/battle-ui.md) | strip, modais, wow, UX | `specs/battle-ui.spec.md` | `presentation/panel`, controllers |
| [chrome-infra](agents/chrome-infra.md) | extension, build, storage | `specs/chrome-infra.spec.md` | `infrastructure`, `manifest.json` |
| [game-balance](agents/game-balance.md) | curva, fórmulas, auditoria | `specs/game-balance.spec.md` | `domain/combat`, scaling, catálogos numéricos |

## Comandos (desenvolvedor — agente não executa test/release automaticamente)

```bash
npm test              # suite — só quando o usuário pedir
npm run build         # dist/
npm run release       # zip — só quando o usuário pedir
```

## Idioma

- Código e identificadores: inglês
- Textos de UI do jogo: português
- Specs, step-by-step e commits: português
