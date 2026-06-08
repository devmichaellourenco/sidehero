# 048 — Ataque Básico como skill ativa (padronização de combate)

## Status: concluída

## Requisito

O ataque básico deixa de ser fallback implícito e passa a ser uma **skill equipada** que já vem ativa nos heróis. Heróis e inimigos agem exclusivamente via skills do catálogo de combate.

## Alterações

### Domínio

| Arquivo | Alteração |
|---------|-----------|
| `BasicAttackSkill.ts` | Definição compartilhada `basic_attack` (herói → inimigos, inimigo → heróis) |
| `SkillCatalog.ts` | Entrada de progressão "Ataque Básico" (universal, rank 1) |
| `HeroCombatSkillCatalog.ts` | `basic_attack` no catálogo; `listHeroCombatSkills` só retorna skills **equipadas** |
| `EnemyCombatSkillCatalog.ts` | Usa `ENEMY_BASIC_ATTACK_SKILL` explícito no set de cada tipo |
| `Hero.ts` | Starter com `skillRanks.basic_attack = 1` e `equippedSkillIds: ['basic_attack']`; bloqueio de desativar |
| `SkillService.ts` | `canDeactivate`; ataque básico não pode ativar/desativar |
| `GameStateMigration.ts` | Saves antigos ganham rank + slot de ataque básico |

### Combate

- `CombatSkillSelector` resolve nome via `SkillCatalog` (sem hardcode de ataque básico)
- Sem prepend automático de `BASIC_ATTACK_SKILL` em `listHeroCombatSkills`

### UI

- Ataque Básico aparece na árvore como **maxed/ativa**
- Botão **Desativar** desabilitado para ataque básico
- Chip "Ataque Básico" visível no painel Heróis (1/3 slots)

## Como validar

1. Herói novo: painel mostra chip "Ataque Básico"
2. Combate sem outras skills: usa `basic_attack` via equipada
3. Ativar 2 skills extras → 3/3 slots (inclui básico)
4. Ficha → Skills: ataque básico sem botão Desativar
5. Inimigos continuam usando `basic_attack` do set de skills do tipo
