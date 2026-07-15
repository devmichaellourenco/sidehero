# Step-by-step — Preview de imagem no topo do tooltip

**Data:** 2025-07-14  
**Objetivo:** Exibir a imagem do item/skill no topo do tooltip (altura 82px, largura proporcional).

## Alterações

| Arquivo | Função |
|---------|--------|
| `TooltipPreviewPresentation.ts` | Helper `renderTooltipPreviewImage` |
| `InventoryGridPresentation.ts` / `StorageGridPresentation.ts` / `DivineForgePresentation.ts` | Preview no tooltip de gear |
| `GearPresentation.ts` | Preview no tooltip do slot equipado |
| `SkillTooltipPresentation.ts` | Preview com `getSkillIconUrl` |
| `panel.css` | `.tooltip-preview-image { height: 82px; width: auto }` |

## Visual

- Altura fixa: **82px**
- Largura: **auto** (proporcional), limitada a `max-width: 100%` do portal
