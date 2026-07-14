# Step-by-step — Tooltip hover vs seleção (itens/skills)

**Data:** 2025-07-14  
**Objetivo:** Evitar que o tooltip cubra itens abaixo e impeça seleção; hover só informa; clique fixa o tooltip para interação.

## Problema

Em inventário, baú e Forja Divina, ao tirar o mouse do item o tooltip permanecia se o cursor entrava no portal (ponteiro + `pointer-events: auto` + bridge CSS). Isso bloqueava cliques em slots cobertos pelo tooltip.

## Comportamento novo

1. **Hover** → mostra detalhes; ao sair do item/skill, o tooltip some imediatamente (portal sem `pointer-events`).
2. **Clique (selecionar)** → tooltip fica “pinned”; dá para mover o mouse para o tooltip (ações Equipar / Retirar / Destruir); ao sair do tooltip (e do slot), some.

## Arquivos alterados

| Arquivo | Função |
|---------|--------|
| `src/presentation/components/InventoryGearTooltipBinder.ts` | Lógica de pin/hover do inventário, baú e forja |
| `src/presentation/components/SkillChipTooltipBinder.ts` | Mesmo padrão para tooltips de skill |
| `src/presentation/panel/panel.css` | `pointer-events` só com `data-pinned`; outline de slot pinned |
| `src/presentation/components/InventoryModalRenderer.ts` | Remove equipar no clique do slot (ação fica no tooltip / drag) |
| `src/presentation/components/StashModalRenderer.ts` | Remove retirar no clique do slot (ação fica no tooltip) |
| `src/presentation/flows/ModalStackController.ts` | Remove handler `onWithdrawGear` do modal do baú |
| `src/presentation/components/InventoryGearTooltipBinder.test.ts` | Testes do binder de gear |
| `src/presentation/components/SkillChipTooltipBinder.test.ts` | Testes do binder de skill |

## Detalhes de implementação

- Padrão alinhado a `UpgradeNodeTooltipBinder` (hover informativo + pin no clique).
- Forja / picker (`data-forge-gear-id` / `data-pick-gear`): clique ainda propaga para seleção/equipar.
- Inventário / baú: clique só seleciona (pin); Equipar/Retirar/Destruir no tooltip.

## Testes

Criados testes unitários listados acima. Suite completa fica a cargo do desenvolvedor (`npm test` sob demanda).
