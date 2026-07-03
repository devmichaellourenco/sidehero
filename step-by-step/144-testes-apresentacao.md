# 144 — Testes de apresentação

## Status: em andamento

## Objetivo

Cobrir com testes as camadas de HTML/markup e políticas visuais que mais regredem em refactors: Wow Strip, sprites de inimigos e drag-and-drop.

## Escopo

| Área | Arquivos de teste |
|------|-------------------|
| Wow Strip | `WowBannerBuilder.test.ts`, `WowStripRenderPolicy.test.ts`, `WowStripDismissStore.test.ts`, `WowStripPresentation.test.ts` |
| Sprites | `EnemySpriteCatalog.test.ts`, `AssetCatalog.test.ts` |
| Drag-and-drop | `GearDragDropPolicy.test.ts`, `GearDragDropPresentation.test.ts`, `PartyDragDropPresentation.test.ts`, `InventoryGridPresentation.test.ts` |
| Árvore de melhorias | `UpgradeTreeLayout.test.ts`, `UpgradeTreeGraphPresentation.test.ts`, `UpgradeTreeModalRenderer.test.ts`, `UpgradeTreeViewportBinder.test.ts`, `UpgradeCatalog.test.ts` |

## Fora do escopo

- Testes E2E no browser
- Snapshot visual de PNG/CSS pixel-perfect

## Validação

```bash
npm test
```
