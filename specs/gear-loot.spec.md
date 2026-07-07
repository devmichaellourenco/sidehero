# Spec — Gear, Inventário e Baús

## Status

**Aceite:** 7/7 (100%)  
**Testes obrigatórios:** 7/7

## Objetivo

Loot de baús e combate vira **gear** no inventário; o jogador equipa, compara e otimiza loadout da party.

## Critérios de aceite

- [x] Baú a cada N vitórias; abrir 1 ou todos (se melhoria desbloqueada)
- [x] **Abrir todos** preenche inventário vazio, depois baú de itens (se desbloqueado); baús restantes ficam pendentes — nunca falha em silêncio por falta de espaço total
- [x] Loot procedural por raridade/template (`LootService`, `GearTemplateCatalog`)
- [x] Equipar valida slot, nível e classe (`GearRequirementChecker`)
- [x] Otimizar equipe sugere upgrades por herói (`LoadoutOptimizer`)
- [x] Comparação visual no picker/modal (setas ▲)
- [x] Inventário (global e embedded): filtro por categoria exclusivamente pelos ícones do loadout; toolbar de ordenação única; sem painel inline duplicado para escolha por slot

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Domain | `src/domain/entities/Gear.ts`, `LootService`, `GearEquipService`, `LoadoutOptimizer`, `ChestService`, `GearStorageService` |
| Application | `OpenChestUseCase`, `EquipGearUseCase`, `EquipBestLoadoutUseCase`, `UnequipGearUseCase` |
| Presentation | `InventoryGridPresentation`, `GearPresentation`, `GearDragDrop*`, `GearComparison` |

## Invariantes

- IDs de gear únicos no inventário
- Abrir todos consome espaço disponível (inventário → baú de itens) antes de parar
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
- Virtualização para 500+ itens

## Testes obrigatórios

- [x] `LootService.test.ts`
- [x] `GearEquipService.test.ts`, `LoadoutOptimizer.test.ts`
- [x] `GearDragDropPolicy.test.ts`, `InventoryGridPresentation.test.ts`
- [x] `EquipGearRace.test.ts`
- [x] `ChestService.test.ts` — abrir todos parcial (inventário + baú de itens)
