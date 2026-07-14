# Spec — Árvore de Melhorias

## Status

**Aceite:** 9/9 (100%) · auditoria 2026-07-14  
**Testes obrigatórios:** 8/8 presentes na suite

## Objetivo

Desbloquear automações e QoL comprando nós na **árvore única** com ouro, dependências visíveis e ramos retos.

## Critérios de aceite

- [x] Canvas único: pan, zoom, legenda por ramo
- [x] Cada nó tem `parents[]` válidos; `UpgradeService.areParentsOwned` bloqueia compra
- [x] Layout colinear (H/V/45°) em `UpgradeTreeLayout.ts`
- [x] Ramos integrados à raiz `optimize_loadout_1`: combate, baús, slots, loja, heróis; log via `auto_battle_3`
- [x] Compra aplica `feature` level + `unlockHeroClass` quando aplicável
- [x] Tooltip com requisitos; runas **não compradas** mostram o custo no canto inferior direito (sem botão Comprar)
- [x] Clique no nó **disponível** (ouro suficiente) compra direto; hover continua só informativo
- [x] **Viewport estável após compra:** ao habilitar uma melhoria (clique no nó disponível), o canvas **mantém** pan e zoom atuais — a visão não volta ao início nem recentraliza sozinha
- [x] Modal **sem** hint estático de pan/zoom/hover; legenda, nodos com tooltip e botão **Ir para disponível** comunicam a interação

## Comportamento esperado do viewport

| Situação | Pan / zoom |
|----------|------------|
| **Abertura do modal** de melhorias | Pode focar o próximo nó disponível (`findFocusNodeId`) — comportamento atual |
| **Re-render após compra** (ouro/nós atualizados) | **Preservar** `scale`, `panX`, `panY` exatamente como antes da compra |
| **Botão "Ir para disponível"** | Centraliza manualmente no próximo nó — comportamento atual, inalterado |
| **Scroll / arrastar** entre compras | Continua funcionando; estado persiste até o usuário mover ou usar o botão de foco |

O tooltip continua informativo no hover; a compra ocorre pelo **clique no nó** quando há ouro. O **reset involuntário** do canvas após a compra permanece proibido.

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
- [x] `UpgradeTreeModalRenderer.test.ts` — clique no nó disponível dispara compra; tooltip sem `data-upgrade-buy` e com preço; segundo `render()` após compra **não** chama foco automático nem reseta transform; **sem** parágrafo `upgrade-intro`
- [x] `UpgradeNodeTooltipBinder.test.ts` — hover informativo; clique compra se `available`; pin só fora de compra

## Notas de implementação (orientação)

Implementado via `captureUpgradeTreeViewport`, `bindUpgradeTreeViewport({ initialState })` e `UpgradeTreeModalRenderer.beginSession()` na abertura do modal. Auto-foco só na primeira montagem da sessão.

## Notas

- `optimize_loadout_1` é a **única raiz** (`parents: []`); demais ramos partem dela ou de descendentes
