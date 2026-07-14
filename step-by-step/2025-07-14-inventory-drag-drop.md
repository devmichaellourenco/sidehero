# Step-by-step — Drag-and-drop inventário ↔ slots

**Data:** 2025-07-14  
**Objetivo:** Fazer arrastar/soltar funcionar para equipar e desequipar itens no inventário.

## Causa raiz

Em `GearDragDropBinder.onDragOver`, `previewGearDrop` era chamado com argumentos invertidos (`HTMLElement`, `source` em vez de `source`, `HTMLElement`). O `dragover` quebrava e o browser nunca liberava o drop.

## Correções

| Arquivo | Mudança |
|---------|---------|
| `GearDragDropBinder.ts` | Corrige ordem dos args; `dataTransfer` com optional chaining; esconde tooltip no `dragstart` |
| `GearDragDropBinder.test.ts` | Cobre equipar no slot e desequipar na zona do inventário |
| `AssetCatalog.ts` (`imgTag`) | `draggable="false"` nas imagens para não roubar o drag |
| `InventoryGridPresentation.ts` | Slots do grid como `div role="button"` (HTML5 DnD em `<button>` é instável) |
| `StorageGridPresentation.ts` | Idem para baú |
| `InventoryHeroLoadoutPresentation.ts` | Slots do loadout como `div role="button"` |
| `GearPresentation.ts` | Slots de equipamento como `div role="button"` |
| `panel.css` | Ajuste de `box-sizing`/`font` nos slots do grid |

## Fluxo esperado

1. Arrastar item do inventário → soltar no slot do mesmo tipo → equipa  
2. Arrastar item equipado → soltar na grade do inventário → desequipa  
3. Só funciona com `canEditGear` (fora de combate / pausa de loadout)

## Highlight proativo (atualização)

No `dragstart`, `highlightCompatibleGearTargets` marca em verde o(s) slot(s) do mesmo tipo **sem** precisar passar o mouse. O `dragover` restaura esses hints ao limpar highlights de hover.
