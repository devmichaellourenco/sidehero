---
name: upgrade-tree
description: Árvore de melhorias com grafo, layout e UI no Side Hero. Use para upgrade tree, melhorias, UpgradeCatalog, parents, FeatureKey ou viewport da árvore.
---

# Árvore de Melhorias

## Spec

`specs/upgrade-tree.spec.md`

## Fluxo ao adicionar nó

1. `UpgradeDefinition` em `UpgradeCatalog.ts` — `parents`, `requirements`, `branch`
2. Posição em `UpgradeTreeLayout.ts` — reta com pai (H/V/45°)
3. Se desbloqueia feature → `FeatureKey` + `FeatureAccessPolicy`
4. Se desbloqueia herói → `unlockHeroClass`
5. Testes: `UpgradeCatalog.test.ts`, `UpgradeTreeLayout.test.ts` — criar ou atualizar; não executar automaticamente.

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar

## UI

- `UpgradeTreeModalRenderer` — canvas único
- `UpgradeTreeViewportBinder` — pan/zoom
- `buildEdgePath` — linha reta entre nodos

## Núcleo

Ramo principal parte de `optimize_loadout_1`; integrar novos ramos com `parents` explícitos.
