# Step-by-step — Slot baú + otimizar em ícone no footer do inventário

**Data:** 2025-07-14  
**Objetivo:** Remover “Guardar no baú” do tooltip; dock footer: Baú | Otimizar | Destruir.

## Layout do footer

| Posição | Elemento |
|---------|----------|
| Esquerda | Slot drop `data-drop-zone="stash"` (ícone `chest-open`) |
| Centro | Botão otimizar só com ícone + `title` / badge de upgrades |
| Direita | Slot drop destruir |

## Arquivos

| Arquivo | Função |
|---------|--------|
| `InventoryStashSlotPresentation.ts` | Slot baú (ativo / cheio / bloqueado) |
| `InventoryDestroySlotPresentation.ts` | Usa classe compartilhada `inventory-dock-slot` |
| `InventoryModalRenderer.ts` | Monta o dock; otimizar vira ícone |
| `InventoryGridPresentation.ts` | Remove ações de baú do tooltip |
| `StorageGridPresentation.ts` | Inventário sem ações de tooltip |
| `panel.css` | Dock slots + botão otimizar compacto |
