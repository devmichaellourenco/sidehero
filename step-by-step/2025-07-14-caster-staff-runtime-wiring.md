# Step-by-step — Cajados ativos em combate / save / otimizar

**Data:** 2025-07-14  
**Contexto:** Stats de cajado no catálogo já tinham wiring de combate; faltava chegar nos saves e no score de otimização.

## O que já existia (batalha)

| Bônus | Onde entra |
|-------|------------|
| `castSpeedBonus` | `CombatProfileProvider` → recovery de skill |
| `cooldownReductionBonus` | perfil → `SkillCooldownTracker` |
| `*DamageBonus` / flat / `allElemental` | aggregators → `MitigationPipeline` em skills elementais |
| `requirements.int` | `GearRequirementChecker` no equip |

## Alterações feitas

1. **`resyncGearFromCatalog` / `migrateGear`**  
   Ao carregar save, gear com `catalogItemId` é recriado a partir do JSON atual (preserva id da instância).

2. **`migrateEquipment` + `migrateChest`**  
   Passam a usar `migrateGear` (antes o equipamento equipado usava `Gear.create` cru e **ignorava** o retune).

3. **`LoadoutOptimizer.scoreGearForHero`**  
   Sorcerer/priest somam cast, elemental e CDR no score (senão cajado perdia para espada só por ATK).

## Arquivos

- `GearItemCatalog.ts` — `resyncGearFromCatalog`
- `GameStateMigration.ts` — resync + equipment/chest
- `LoadoutOptimizer.ts` — score por classe
- testes em migration, optimizer, CombatProfileProvider, catalog
