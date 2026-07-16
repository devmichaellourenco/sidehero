# Spec — Baú de Itens e Forja Divina

## Status

**Aceite:** 9/9 (100%) · auditoria 2026-07-15  
**Testes obrigatórios:** 7/7

## Objetivo

Guardar gear extra no **baú** (capacidade por melhoria) e usar a **Forja Divina** para fundir 9 itens da mesma raridade ou destruir por ouro.

## Critérios de aceite

- [x] Stash desbloqueado por `item_stash` (24/36/48 slots)
- [x] Mover item inventário ↔ baú (drag ou ação)
- [x] Forja: fundir 9 → 1 raridade superior; validar mesma raridade
- [x] Salvage: destruir item por ouro (`ForgeSalvageGoldCatalog`)
- [x] Gates via `FeatureAccessPolicy` / melhorias `divine_forge`
- [x] Forja lista itens do **inventário e do baú**; fusão/salvage remove da origem correta
- [x] UX game-like da Forja: abas temáticas (⚒ Fundir / 💰 Destruir), chips de capacidade, grid com scroll, dock fixo com badge de seleção e botões `forge-game-btn`; confirmação com eyebrow “Forja Divina”, ritual 9→1 e cards de recompensa — sem `primary-btn` nem painéis estilo site
- [x] Seleção de itens no grid da Forja **preserva** a posição do scroll (não volta ao topo ao clicar)
- [x] Botão **Limpar seleção** no dock (aba Fundir e Destruir) remove todos os itens selecionados de uma vez

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Domain | `DivineForgeService`, `DivineForgePolicy`, `GameState` stash fields |
| Application | `MoveGearToStashUseCase`, `MoveGearFromStashUseCase`, `FuseGearInForgeUseCase`, `SalvageGearInForgeUseCase`, `DestroyGearUseCase` |
| Presentation | `StorageGridPresentation`, `DivineForgeModalRenderer`, `DivineForgePresentation`, `DivineForgeConfirmPresentation`, `ForgeGridScrollPresentation`, modal Forja |

## Invariantes

- Capacidade do baú nunca negativa
- Fusão consome exatamente 9 itens válidos
- Confirmação destruição fora da pilha principal de modais

## Fora de escopo

- Forja de skills ou materiais não-gear

## Testes obrigatórios

- [x] `DivineForgeService.test.ts`, `DivineForgePolicy.test.ts`
- [x] `GearDragDropPresentation.test.ts` (stash no drag)
- [x] `DivineForgePresentation.test.ts` — `listForgeEligibleGear` une inventário + baú; abas, dock e botões game-like
- [x] `DivineForgeConfirmPresentation.test.ts` — ritual de fusão e card de recompensa no salvage
- [x] `ForgeGridScrollPresentation.test.ts` — preserva scrollTop do grid ao re-render
