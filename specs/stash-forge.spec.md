# Spec — Baú de Itens e Forja Divina

## Status

**Aceite:** 5/5 (100%) · auditoria 2026-07-03  
**Testes obrigatórios:** 3/3

## Objetivo

Guardar gear extra no **baú** (capacidade por melhoria) e usar a **Forja Divina** para fundir 9 itens da mesma raridade ou destruir por ouro.

## Critérios de aceite

- [x] Stash desbloqueado por `item_stash` (24/36/48 slots)
- [x] Mover item inventário ↔ baú (drag ou ação)
- [x] Forja: fundir 9 → 1 raridade superior; validar mesma raridade
- [x] Salvage: destruir item por ouro (`ForgeSalvageGoldCatalog`)
- [x] Gates via `FeatureAccessPolicy` / melhorias `divine_forge`

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Domain | `DivineForgeService`, `DivineForgePolicy`, `GameState` stash fields |
| Application | `MoveGearToStashUseCase`, `MoveGearFromStashUseCase`, `FuseGearInForgeUseCase`, `SalvageGearInForgeUseCase`, `DestroyGearUseCase` |
| Presentation | `StorageGridPresentation`, modal Forja, `step-by-step/134-forja-divina.md` |

## Invariantes

- Capacidade do baú nunca negativa
- Fusão consome exatamente 9 itens válidos
- Confirmação destruição fora da pilha principal de modais

## Fora de escopo

- Forja de skills ou materiais não-gear

## Testes obrigatórios

- [x] `DivineForgeService.test.ts`, `DivineForgePolicy.test.ts`
- [x] `GearDragDropPresentation.test.ts` (stash no drag)
