# 059 — Fase 3: buff/debuff no combate

## Objetivo

Introduzir efeitos temporários de combate (`buff_attack`, `debuff_defense`) persistidos em `CombatState`, aplicados no cálculo de dano e visíveis no battle strip.

## Domínio

### Novos tipos
- `SkillCombatKind` — `buff_attack`, `debuff_defense` + helper `isStatusCombatKind()`
- `CombatSkillDefinition.effectDurationTurns` — duração em turnos do afetado
- `CombatStatusEffect` / `StatusApplication` — efeito ativo e aplicação pendente
- `CombatStatusEffectTracker` — apply, tick no fim do turno, bônus/penalidade
- `CombatStatResolver` — `resolveEffectiveAttack/Defense`, `mitigateDamage`

### `CombatState`
- Campo `statusEffects: StatusEffectMap`
- `withStatusEffects()`, serialização em `toProps()`
- `CombatState.start()` inicia com `{}`

### Execução
- `CombatActionExecutor` — ramo de status + dano usa defesa efetiva
- `CombatTurnPhase` — aplica `statusApplications`, tick no fim do turno do ator
- `SkillPowerCalculator` — ATK efetivo com buff para `usesAttackStat`
- `CombatSkillSelector` — monta ações com `effectDurationTurns`

## Skills piloto

| Skill | Tipo | Quem | Efeito |
|-------|------|------|--------|
| `blessing` (Bênção) | `buff_attack` | Priest | +ATK em todos aliados, 3 turnos |
| `wraith_curse` (Maldição) | `debuff_defense` | Wraith | -DEF no herói mais ferido, 2 turnos |

## Application / UI

- `CombatStatusEffectDto` em `HeroDto` / `EnemyDto`
- `CombatStatusEffectMapper` — lista chips por combatente
- `CombatStatusEffectPresentation` — chips `ATK+4 · 2t` / `DEF-3 · 1t`
- CSS `.combat-status-effect--buff` / `--debuff`
- `SkillBattleStatsMapper` — label "Duração" para status skills
- `GameStateMigration` — default `{}` para saves antigos

## Testes (+8)

| Arquivo | Cobertura |
|---------|-----------|
| `CombatStatusEffectTracker.test.ts` | apply, tick, refresh |
| `CombatStatResolver.test.ts` | ATK/DEF efetivos |
| `CombatActionExecutor.test.ts` | blessing + debuff no dano |
| `CombatSkillSelector.test.ts` | prioridade da Bênção |
| `CombatTurnPhase.test.ts` | persistência no combate |

**56 testes** passando.

## Arquivos principais

| Arquivo | Função |
|---------|--------|
| `CombatStatusEffect.ts` | Tipos de efeito |
| `CombatStatusEffectTracker.ts` | Estado efêmero de buff/debuff |
| `CombatStatResolver.ts` | Stats efetivos no dano |
| `CombatActionExecutor.ts` | Aplica status e dano mitigado |
| `CombatTurnPhase.ts` | Orquestra apply + tick |
| `HeroCombatSkillCatalog.ts` | Perfil de `blessing` |
| `EnemyCombatSkillCatalog.ts` | Perfil de `wraith_curse` |
| `CombatStatusEffectPresentation.ts` | Chips no strip |

## Próximos passos

- `iron_skin` / `mana_shield` como buff de DEF
- Debuff em inimigos (slime/goblin)
- Destacar ATK/DEF efetivo no tooltip durante combate
