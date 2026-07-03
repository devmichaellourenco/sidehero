# Agent — Gear, Inventário e Baús

## Papel

Loot, baús, equipar e otimização de loadout.

## Antes de codar

1. `specs/gear-loot.spec.md`
2. `.cursor/skills/gear-loot/SKILL.md`

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar

## Escopo

- `LootService`, `GearEquipService`, `LoadoutOptimizer`
- Chest/equip use cases
- `InventoryGridPresentation`, `GearDragDrop*`

## Checklist

- [ ] Compra/abertura validada no use case
- [ ] Drag policy em `GearDragDropPolicy.ts`
- [ ] `EquipGearRace` se tocar equip concorrente
