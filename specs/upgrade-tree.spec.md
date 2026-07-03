# Spec — Árvore de Melhorias

## Status

**Aceite:** 6/6 (100%) · auditoria 2026-07-03  
**Testes obrigatórios:** 5/5 presentes na suite

## Objetivo

Desbloquear automações e QoL comprando nós na **árvore única** com ouro, dependências visíveis e ramos retos.

## Critérios de aceite

- [x] Canvas único: pan, zoom, legenda por ramo
- [x] Cada nó tem `parents[]` válidos; `UpgradeService.areParentsOwned` bloqueia compra
- [x] Layout colinear (H/V/45°) em `UpgradeTreeLayout.ts`
- [x] Ramos integrados à raiz `optimize_loadout_1`: combate, baús, slots, loja, heróis; log via `auto_battle_3`
- [x] Compra aplica `feature` level + `unlockHeroClass` quando aplicável
- [x] Tooltip com requisitos e botão comprar

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Domain | `UpgradeCatalog`, `UpgradeService`, `FeatureAccessPolicy`, `UpgradeRequirementEvaluator` |
| Application | `GetUpgradeTreeUseCase`, `PurchaseUpgradeUseCase`, `UpgradeTreeMapper` |
| Presentation | `UpgradeTreeModalRenderer`, `UpgradeTreeGraphPresentation`, `UpgradeTreeViewportBinder`, `UpgradeTreeLayout` |

## Invariantes

- Sem ciclos em `parents`
- Todo ID do catálogo tem posição no layout
- Arestas retas entre pai e filho posicionados

## Fora de escopo

- Árvore de meta legado (spec separada)

## Testes obrigatórios

- [x] `UpgradeCatalog.test.ts`, `UpgradeTreeLayout.test.ts`, `UpgradeService.test.ts`
- [x] `UpgradeTreeGraphPresentation.test.ts`
- [x] `UpgradeTreeModalRenderer.test.ts`, `UpgradeTreeViewportBinder.test.ts`

## Notas

- `optimize_loadout_1` é a **única raiz** (`parents: []`); demais ramos partem dela ou de descendentes
