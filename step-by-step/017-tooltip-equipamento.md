# 017 — Tooltip completo em equipamentos

## Objetivo
Ao passar o mouse sobre um slot equipado, exibir todos os dados do item (não só tipo e nome).

## Alterações
- **`GameStateDto`**: equipamento do herói inclui `attackBonus`, `defenseBonus`, `healthBonus`.
- **`GearPresentation.ts`**: tooltip customizado com nome, slot, raridade e bônus; slots vazios mantêm `title` nativo.
- **`panel.css`**: estilos `.equipment-slot-tooltip` com borda por raridade e animação no hover.

## Conteúdo do tooltip
```
Nome do item
ARMA · ÉPICO
+12 ATK · +3 DEF · +0 HP
```

## Correção de camada (modal)
- Tooltip inline era cortado pelo `overflow` do `.modal-body`.
- **`EquipmentTooltipBinder.ts`**: renderiza tooltip em portal `position: fixed` (`z-index: 1100`) acima dos modais.
- Escondido ao fechar modal via `ModalController.close()`.
