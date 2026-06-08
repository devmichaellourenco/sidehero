# 045 — Skills como única ação de combate (cooldown + alvos)

## Objetivo
Toda ação de heróis e inimigos passa a ser uma **skill** com regras próprias de alvo, prioridade de seleção e cooldown.

## Modelo `CombatSkillDefinition`
| Campo | Função |
|-------|--------|
| `targetPool` | `heroes` ou `enemies` (pool absoluto no combate) |
| `targetScope` | `single` ou `all` |
| `targetPriority` | `lowest_hp_percent`, `highest_hp_percent`, etc. |
| `usePriority` | Ordem de preferência quando pronta (básico = 0) |
| `initialCooldown` | Turnos até a 1ª utilização no combate |
| `cooldownTurns` | Turnos de recarga após usar |
| `healConditionThreshold` | Cura só elegível se aliado ferido |

## Exemplos configurados
- **Bola de Fogo** (`fireball`): `initialCooldown: 2`, `cooldownTurns: 2`, `usePriority: 90`, alvo inimigo com menor HP%.
- **Ataque Básico**: sempre pronto, `usePriority: 0` (fallback).
- **Cura Menor**: aliado com menor HP%, cooldown 2 após uso.
- **Santuário do Oráculo**: cura em massa (`targetScope: all`), CD longo.
- **Julgamento do Inquisidor**: inimigo com **maior** HP% (mata gigantes).
- **Inimigos**: sets por `EnemyType` (goblin_stab, dragon_breath AoE, etc.).

## Componentes novos
- `HeroCombatSkillCatalog` / `EnemyCombatSkillCatalog`
- `SkillTargetResolver` — resolve IDs de alvo pela prioridade
- `SkillCooldownTracker` — estado por `hero:id` / `enemy:id` em `CombatState.skillCooldowns`
- `CombatSkillSelector` — escolhe skill pronta de maior `usePriority`

## Fluxo por turno
1. Carrega cooldowns do `CombatState`.
2. Lista skills do combatente; filtra prontas + condição de cura.
3. Ordena por `usePriority`; monta `CombatAction` com alvos resolvidos.
4. `CombatActionExecutor` aplica dano/cura single ou mass.
5. Ao fim do turno: decrementa CDs; skill usada recebe `cooldownTurns`.

## Persistência
- `CombatState.skillCooldowns` serializado no storage.

## Removidos
- `CombatSkillResolver`, `EnemyActionResolver`, `CombatTargetSelector`
- Tipos `basic_attack` / `enemy_attack` separados — agora são skills no catálogo

## Validação
```bash
npm test   # 20 testes
npm run build
```
