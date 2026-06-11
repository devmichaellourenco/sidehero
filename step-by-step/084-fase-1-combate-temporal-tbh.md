# 084 — Fase 1: combate temporal inspirado no TBH

## Objetivo

Migrar o combate para timeline por **Attack Speed / Cast Speed**, adicionar **crítico**, **armadura com diminishing returns**, **gear com ASPD/crit** e **baús tipados**.

## Domínio — Combate temporal

| Arquivo | Função |
|---------|--------|
| `CombatTimingConstants.ts` | Constantes de tempo e recovery |
| `CombatProfile.ts` | Value object ASPD, Cast, Crit |
| `ClassCombatBaselines.ts` | Baselines por classe (TBH-inspired) |
| `EnemyCombatBaselines.ts` | Baselines por tipo de inimigo |
| `CombatProfileProvider.ts` | Agrega base + gear + DEX |
| `SkillCooldownTiming.ts` | Cooldowns em segundos (legado: 1 turno = 1s) |
| `ActionTimerService.ts` | Timeline de ações por combatente |
| `CombatDamageResolver.ts` | Armadura TBH-like + roll de crítico |
| `CombatState.ts` | `actionTimers` + `combatTime` (substitui fila de turnos) |
| `CombatTurnPhase.ts` | Orquestra timeline + skills + cast speed |

## Domínio — Loot e baús

| Arquivo | Função |
|---------|--------|
| `ChestType.ts` | `monster` / `boss` / `act_boss` |
| `Chest.ts` | Tipo de baú na entidade |
| `LootService.ts` | Loot tables por tipo + stats secundários no gear |
| `PhaseCombatHandlers.ts` | Drop de baú boss/act_boss e 12% monster em wave |

## Application / Presentation

- DTOs: `attackSpeed`, `castSpeed`, `critChance`, `critDamage` no herói
- Gear DTO: bônus ASPD/Cast/Crit
- Chest DTO: `chestType` + `chestLabel`
- Skill intent: cooldown em **segundos** na UI
- Floats: kind `crit` com estilo dourado

## Migração

- Saves antigos: `actionTimers` recriados; baús sem tipo viram `monster`
- Cooldowns legados convertidos via `LEGACY_TURN_SECONDS`

## Próxima fase (não implementada)

- Elementos/resistências
- Dodge/Block
- Árvore de skills por classe (8 tiers TBH)
