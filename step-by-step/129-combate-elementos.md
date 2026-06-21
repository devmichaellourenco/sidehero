# 129 — Combate: elementos, modelo de dano e gear escalável

## Objetivo

Inspirado no [TBH mechanics](https://taskbarhero.wiki/mechanics), adaptado ao combate estático do Side Hero:

- Elementos: physical, fire, cold, lightning, chaos (poison → chaos)
- Skills com `damageComponents` (multi-elemento)
- Pipeline de mitigação: resist elemental + armor física
- Gear: catálogo de 10 slots (3 ativos), 6 raridades
- UI simples (ícone/linha de elemento)

## Decisões fechadas

| Tópico | Decisão |
|--------|---------|
| Poison | Unificar em **chaos** |
| `damage_magic` | Removido; `kind: 'damage'` + componentes |
| Multi-elemento | `DamageComponent[]` com `weight` (soma = 1) |
| Saves | Sem retrocompat (fase de testes) |
| Raridades | common, uncommon, rare, epic, legendary, mythic |
| Slots ativos | weapon→hand, armor, accessory→amulet (aliases UI) |

## Domínio — combate

| Arquivo | Função |
|---------|--------|
| `domain/combat/DamageElement.ts` | Enum de elementos |
| `domain/combat/DamageDelivery.ts` | melee / projectile / aoe / dot |
| `domain/combat/DamageComponent.ts` | Componente com weight |
| `domain/combat/DamageComponentPresets.ts` | Helpers para catálogo de skills |
| `domain/combat/ResistanceProfile.ts` | Resistências + all-elemental |
| `domain/combat/MitigationPipeline.ts` | Mitigação por componente |
| `CombatDamageResolver.ts` | Crítico + pipeline |
| `CombatSkillDefinition.ts` | `damageComponents` obrigatório em `damage` |

## Domínio — gear

| Arquivo | Função |
|---------|--------|
| `domain/gear/GearSlotCatalog.ts` | 10 slots definidos, 3 ativos |
| `domain/gear/GearAffix.ts` | Affixes escaláveis (estrutura) |
| `domain/entities/Gear.ts` | 6 raridades, slot canônico |

## Sprints

- **Sprint 0** ✅ maxHealth inimigos
- **Sprint 1** ✅ elementos + pipeline + skills taggeadas
- **Sprint 2** ✅ affixes em loot, resist no gear
- **Sprint 3** ✅ dodge/block/DR, passivas, DOT elementais
- **Sprint 4** ✅ balance por tier, float colorido, resist na ficha

## Status

Sprint 0–4 implementados. Build e testes passando.

### Sprint 2 entregue
- Resistências no gear (armor: elemental; accessory: caos/all-elemental)
- `ResistanceProfileAggregator` para heróis
- `EnemyInnateResists` (tema por id + overrides no roster)
- Pipeline de dano usa resistências do alvo
- Tooltip de gear mostra resistências quando > 0

### Sprint 3 entregue
- `DefensiveMitigation` + `HeroDefensiveStatsProvider` (gear + passivas evasion/iron_skin/mana_shield)
- Pipeline: dodge → block (50%) → damage reduction % após componentes
- Status `dot` com `onHitDot` em poison_spit, slime_acid, pyro_ember, fireball
- `CombatTurnPhase` aplica tick de DOT no fim do turno do ator
- Loot: dodge/block/DR em armor legendary+
- DTO/UI: gear defensivo + ícone de DOT no combate

### Sprint 4 entregue
- `DifficultyCombatScaling`: resist inata extra por tier, DOT escalado, loot primário por tier
- Float de dano com cor por elemento dominante (`battle-float--damage-fire`, etc.)
- Tooltip de combate mostra `Resist: Fogo 12% · ...` em heróis e inimigos
- `CombatResistSummaryDto` no `HeroDto` / `EnemyDto`
