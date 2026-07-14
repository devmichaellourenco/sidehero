# Step-by-step — Slot de destruir + remoção do Equipar no tooltip

**Data:** 2025-07-14  
**Objetivo:** Remover ação Equipar/Destruir por item no inventário; destruir via drop no canto inferior direito.

## Mudanças

| Arquivo | Função |
|---------|--------|
| `InventoryGridPresentation.ts` | Sem botão Equipar; drag em todos os itens do inventário |
| `StorageGridPresentation.ts` | Destruir no tooltip só no baú (não no inventário) |
| `InventoryDestroySlotPresentation.ts` | Slot `data-drop-zone="destroy"` no footer |
| `InventoryModalRenderer.ts` | Footer com optimize + slot destruir |
| `GearDragDropBinder.ts` | Drop na zona destroy → `onDestroyGear` |
| `GameViewController.ts` | Abre `DestroyGearConfirmDialog` via `GearStorageFlow.destroy` |
| `panel.css` | Layout do footer e visual do slot destruir (vermelho) |

## Fluxo

1. Equipar: arrastar item → slot do herói  
2. Destruir: arrastar item → slot Destruir (canto inferior direito) → modal de confirmação  
3. Guardar no baú: permanece no tooltip (quando baú disponível)
