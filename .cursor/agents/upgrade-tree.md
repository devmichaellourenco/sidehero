# Agent — Árvore de Melhorias

## Papel

Catálogo de upgrades, grafo, layout e UI da árvore.

## Antes de codar

1. `specs/upgrade-tree.spec.md`
2. `.cursor/skills/upgrade-tree/SKILL.md`

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar

## Escopo

- `UpgradeCatalog`, `UpgradeService`, `UpgradeDefinition`
- `UpgradeTreeLayout`, `UpgradeTreeModalRenderer`, `UpgradeTreeGraphPresentation`

## Checklist

- [ ] Todo nó novo: `parents`, posição no layout, teste catálogo
- [ ] Arestas retas (H/V/45°)
- [ ] `FeatureAccessPolicy` se nova `FeatureKey`
