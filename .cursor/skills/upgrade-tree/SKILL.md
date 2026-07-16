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
- **Não** criar pasta nem arquivos `step-by-step/`; fonte de verdade = specs, agents, skills, rules e testes

## UI

- `UpgradeTreeModalRenderer` — canvas único; sem hint estático de pan/zoom
- `UpgradeTreeViewportBinder` — pan/zoom; exporta `UpgradeTreeViewportState`
- `buildEdgePath` — linha reta entre nodos

## Viewport após compra

Ao comprar melhoria, **preservar** pan/zoom (não resetar canvas). Auto-foco (`findFocusNodeId`) só na **abertura** do modal; botão "Ir para disponível" continua manual. Ver critério pendente em `specs/upgrade-tree.spec.md`.

Padrão: `beginSession()` na abertura → capturar estado antes do re-render → `bindUpgradeTreeViewport(..., { initialState })`.

## Núcleo

Ramo principal parte de `optimize_loadout_1`; integrar novos ramos com `parents` explícitos.

## Relacionado

- Novo nó `improvement_reset_1` / `_2` (Forja + herói 12+ / após I + herói 22+): ver `specs/improvement-reset.spec.md` e skill `improvement-reset`
