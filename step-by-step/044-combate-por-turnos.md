# 044 — Combate por turnos com iniciativa e alvos corretos

## Objetivo
Substituir o modelo “todos os heróis agem → inimigo contra-ataca em área” por **um turno por tick**, com fila de iniciativa, alvo único/multi conforme a skill e suporte a **múltiplos inimigos**.

## Modelo anterior (problemas)
- 1 tick = round completo (todos heróis + contra-ataque AOE).
- Dano do inimigo usava mitigação da party inteira + defesa individual → quase sempre **1** de dano.
- Apenas `currentEnemy: Enemy | null` — sem fila de turnos nem multi-inimigo.

## Novo modelo

### `CombatState`
- `enemies[]`, `turnQueue`, `turnIndex`, `round`.
- Persistido em `GameState.combat` (migração automática de `currentEnemy` legado).

### `TurnOrderService`
- Iniciativa herói: `DEX × 2 + level`.
- Iniciativa inimigo: `ATK + stage`.
- Ordem decrescente; empate por ordem da party / índice do inimigo.

### 1 tick = 1 ação
- `CombatTurnPhase` resolve o ator vivo na fila.
- Herói: `CombatSkillResolver` → `CombatActionExecutor`.
- Inimigo: `EnemyActionResolver` (ataque single-target no herói com menor HP%).
- Avança `turnIndex`; ao fim da fila, reconstrói ordem para nova rodada.

### Alvos e skills
- `SkillTargeting`: `single_enemy` | `all_enemies` | `single_ally`.
- Perfis com AoE: `reaver_cleave`, `pyro_inferno`.
- Dano inimigo: `enemy_attack` em **um** herói (`ATK - DEF` individual, sem redução da party).

### Múltiplos inimigos
- `EncounterSpawner`: 1 inimigo padrão; a partir do stage 12 a cada 6 stages → 2 inimigos.
- UI: `.enemies-row` com um card por inimigo.

### Vitória / wipe
- Vitória quando todos os inimigos morrem; recompensa soma ouro/XP de todos.
- Wipe → cura full + novo encounter no stage atual.

## Arquivos principais
| Arquivo | Função |
|---------|--------|
| `CombatState.ts` | Estado do encounter e fila de turnos |
| `TurnOrderService.ts` | Iniciativa e ordem da rodada |
| `CombatTurnPhase.ts` | Orquestra um turno por tick |
| `CombatActionExecutor.ts` | Single/multi alvo, dano e cura |
| `EnemyActionResolver.ts` | IA básica do inimigo |
| `EncounterSpawner.ts` | Gera composição do encounter |
| `GameState.ts` | `combat` substitui inimigo único |
| `BattleStripRenderer.ts` | Multi-inimigo + highlight do turno ativo |

## Removidos
- `HeroActionPhase.ts`, `EnemyCounterPhase.ts` (substituídos por `CombatTurnPhase`).

## UI
- `activeTurn` no DTO → classe `--active-turn` no sprite do ator corrente.
- `enemies[]` no DTO; `enemy` mantido como primeiro inimigo (compat).

## Validação
```bash
npm test
npm run build
```
