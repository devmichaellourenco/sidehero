# Spec — Skills e Progressão

## Status

**Aceite:** 5/5 (100%) · auditoria 2026-07-03  
**Testes obrigatórios:** 6/6 presentes na suite

## Objetivo

Cada herói investe **pontos de melhoria** em árvore de skills, equipa até N skills ativas (slots desbloqueáveis) e pode **ascender** classe em caminho ramificado.

## Critérios de aceite

- [x] `+1 rank` respeita pré-requisitos e rank máximo
- [x] Slots de batalha: básico fixo + slots extras via melhoria `battle_skill_slots`
- [x] Equipar skill: clique ou drag para barra de slots; cooldown na strip
- [x] Ascensão: uma evolução por vez por caminho; skills de tiers anteriores acumulam
- [x] Combate usa `HeroCombatSkillCatalog` + `CombatSkillRegistry`

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Domain | `src/domain/progression/*`, `SkillCatalog`, `ClassAscensionService`, `SkillService` |
| Application | `SpendImprovementPointUseCase`, `GetHeroSkillTreeUseCase`, `AssignSkillSlotUseCase`, `AscendClassUseCase` |
| Presentation | `SkillCardPresentation`, `HeroSkillsTabRenderer`, `CombatSkillBar*` |

## Invariantes

- Ataque Básico não pode ser removido do slot 0
- `SkillService` valida allocate/ascension no domínio
- Ícones via `SkillIconCatalog` / `AssetCatalog`

## Fora de escopo

- Skills ativas do jogador em tempo real (só auto-battle)

## Testes obrigatórios

- [x] `SkillService.allocate.test.ts`, `SkillService.ascension.test.ts`
- [x] `SkillBattleSlots.test.ts`, `Hero.activeSkills.test.ts`
- [x] `CombatSkillSelector.test.ts`, `SkillCardPresentation.test.ts`
