# Spec — Árvore de Melhorias

## Status

**Aceite:** 7/7 (100%) · auditoria 2026-07-06  
**Testes obrigatórios:** 7/7 presentes na suite

## Objetivo

Desbloquear automações e QoL comprando nós na **árvore única** com ouro, dependências visíveis e ramos retos.

## Critérios de aceite

- [x] Canvas único: pan, zoom, legenda por ramo
- [x] Cada nó tem `parents[]` válidos; `UpgradeService.areParentsOwned` bloqueia compra
- [x] Layout colinear (H/V/45°) em `UpgradeTreeLayout.ts`
- [x] Ramos integrados à raiz `optimize_loadout_1`: combate, baús, slots, loja, heróis; log via `auto_battle_3`
- [x] Compra aplica `feature` level + `unlockHeroClass` quando aplicável
- [x] Tooltip com requisitos e botão comprar
- [x] **Viewport estável após compra:** ao habilitar uma melhoria (botão Comprar no tooltip), o canvas **mantém** pan e zoom atuais — a visão não volta ao início nem recentraliza sozinha

## Comportamento esperado do viewport

| Situação | Pan / zoom |
|----------|------------|
| **Abertura do modal** de melhorias | Pode focar o próximo nó disponível (`findFocusNodeId`) — comportamento atual |
| **Re-render após compra** (ouro/nós atualizados) | **Preservar** `scale`, `panX`, `panY` exatamente como antes da compra |
| **Botão "Ir para disponível"** | Centraliza manualmente no próximo nó — comportamento atual, inalterado |
| **Scroll / arrastar** entre compras | Continua funcionando; estado persiste até o usuário mover ou usar o botão de foco |

O tooltip/card de compra deve continuar aparecendo e fechando normalmente; apenas o **reset involuntário** do canvas é proibido.

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
- Re-render da árvore (ex.: após `PurchaseUpgradeUseCase`) não reinicializa viewport salvo na **primeira** montagem do modal na sessão aberta

## Fora de escopo

- Árvore de meta legado (spec separada)
- Mini-map ou botões extras de zoom (+/−) — pan/zoom atuais permanecem

## Testes obrigatórios

- [x] `UpgradeCatalog.test.ts`, `UpgradeTreeLayout.test.ts`, `UpgradeService.test.ts`
- [x] `UpgradeTreeGraphPresentation.test.ts`
- [x] `UpgradeTreeModalRenderer.test.ts`, `UpgradeTreeViewportBinder.test.ts`
- [x] `UpgradeTreeViewportBinder.test.ts` — restaurar `UpgradeTreeViewportState` (`scale`, `panX`, `panY`) após re-bind
- [x] `UpgradeTreeModalRenderer.test.ts` — segundo `render()` após compra simulada **não** chama foco automático nem reseta transform do stage

## Notas de implementação (orientação)

Implementado via `captureUpgradeTreeViewport`, `bindUpgradeTreeViewport({ initialState })` e `UpgradeTreeModalRenderer.beginSession()` na abertura do modal. Auto-foco só na primeira montagem da sessão.

## Notas

- `optimize_loadout_1` é a **única raiz** (`parents: []`); demais ramos partem dela ou de descendentes
