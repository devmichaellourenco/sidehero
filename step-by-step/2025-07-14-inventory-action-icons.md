# Step-by-step — Ícones de ação do inventário + botão destruir

**Data:** 2025-07-14  
**Objetivo:** Trocar textos Equipar / Guardar / Destruir por ícones com tooltip; corrigir botão cinza do modal de confirmação.

## Alterações

| Arquivo | Função |
|---------|--------|
| `InventoryGearActionPresentation.ts` | Renderiza botões-ícone SVG (equip / stash / withdraw / destroy) com `title` e `aria-label` |
| `InventoryGridPresentation.ts` | Usa ícone de Equipar na row de ações do tooltip |
| `StorageGridPresentation.ts` | Usa ícones para baú / retirar / destruir |
| `panel.css` | Estilo da row de ícones; CTA vermelho no confirm de destruição |
| `panel.html` | Classe `confirm-dialog-btn--danger` no botão Destruir |
| `InventoryGearActionPresentation.test.ts` | Cobertura das ações em ícone |
| `InventoryGridPresentation.test.ts` | Asserts de ícone Equipar |

## Resultado visual

- Tooltip do item: linha de ícones com hover nativo (`title`) explicando a ação.
- Modal “Destruir item”: botão Destruir com gradiente vermelho (antes herdava estilo cinza de `<button>` nativo sem CSS de fundo).
