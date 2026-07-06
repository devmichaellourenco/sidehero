# Spec — Gear, Inventário e Baús

## Status

**Aceite:** 5/5 (100%) · auditoria 2026-07-03  
**Testes obrigatórios:** 5/5

## Objetivo

Loot de baús e combate vira **gear** no inventário; o jogador equipa, compara e otimiza loadout da party.

## Critérios de aceite

- [x] Baú a cada N vitórias; abrir 1 ou todos (se melhoria desbloqueada)
- [x] Loot procedural por raridade/template (`LootService`, `GearTemplateCatalog`)
- [x] Equipar valida slot, nível e classe (`GearRequirementChecker`)
- [x] Otimizar equipe sugere upgrades por herói (`LoadoutOptimizer`)
- [x] Comparação visual no picker/modal (setas ▲)

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Domain | `src/domain/entities/Gear.ts`, `LootService`, `GearEquipService`, `LoadoutOptimizer` |
| Application | `OpenChestUseCase`, `EquipGearUseCase`, `EquipBestLoadoutUseCase`, `UnequipGearUseCase` |
| Presentation | `InventoryGridPresentation`, `GearPresentation`, `GearDragDrop*`, `GearComparison` |

## Invariantes

- IDs de gear únicos no inventário
- Equipar fora da pausa só via auto-equip se melhoria ativa
- Race de equip: `EquipGearRace` / fila de mutação no UI

## Fora de escopo

- Trading entre jogadores

## Backlog (Fase 2 — não implementado)

Adicionar critérios `[ ]` aqui antes de codar:

- Busca textual no grid de inventário
- Favoritar itens
- Vender/descartar lixo em lote
- Compare side-by-side
- Aba inventário no drawer do herói
- Virtualização para 500+ itens

## Testes obrigatórios

- [x] `LootService.test.ts`
- [x] `GearEquipService.test.ts`, `LoadoutOptimizer.test.ts`
- [x] `GearDragDropPolicy.test.ts`, `InventoryGridPresentation.test.ts`
- [x] `EquipGearRace.test.ts`
