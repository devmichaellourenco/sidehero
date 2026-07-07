# Spec — Skills e Progressão

## Status

**Aceite:** 9/9 (100%) · auditoria 2026-07-06  
**Testes obrigatórios:** 10/10 presentes na suite

## Objetivo

Cada herói investe **pontos de melhoria** em árvore de skills, equipa até N skills ativas (slots desbloqueáveis) e pode **ascender** classe em caminho ramificado.

## Critérios de aceite

- [x] `+1 rank` respeita pré-requisitos e rank máximo
- [x] Slots de batalha: básico fixo + slots extras via melhoria `battle_skill_slots`
- [x] Equipar skill: clique ou drag para barra de slots; cooldown na strip
- [x] Ascensão: uma evolução por vez por caminho; skills de tiers anteriores acumulam
- [x] Combate usa `HeroCombatSkillCatalog` + `CombatSkillRegistry`
- [x] Ao clicar `+` rank (aba Skills ou ascensão), a lista mantém a posição de scroll no drawer/modal
- [x] Aba Skills do herói **sem** textos de instrução (equipar, drag, hover); slots e cards comunicam a ação só por highlight visual no tap-to-assign
- [x] Aba Classe lista apenas próxima(s) ascensão(ões) e skills de evolução; classe/tier atual ficam no header do modal
- [x] Cards de ascensão usam tema por caminho (military/martial/arcane/innate/sacred/life), showcase ampliado do sprite e CTA com estado pronto/bloqueado

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Domain | `src/domain/progression/*`, `SkillCatalog`, `ClassAscensionService`, `SkillService` |
| Application | `SpendImprovementPointUseCase`, `GetHeroSkillTreeUseCase`, `AssignSkillSlotUseCase`, `AscendClassUseCase` |
| Presentation | `SkillCardPresentation`, `HeroSkillsTabRenderer`, `HeroDetailModalRenderer`, `HeroDetailScrollPresentation`, `CombatSkillBar*` |

## Invariantes

- Ataque Básico não pode ser removido do slot 0
- `SkillService` valida allocate/ascension no domínio
- Ícones via `SkillIconCatalog` / `AssetCatalog`
- Scroll da lista: capturar no clique (`pinScrollBeforeMutation`) e restaurar após re-render; evitar re-render duplicado do drawer

## Fora de escopo

- Skills ativas do jogador em tempo real (só auto-battle)

## Testes obrigatórios

- [x] `SkillService.allocate.test.ts`, `SkillService.ascension.test.ts`
- [x] `SkillBattleSlots.test.ts`, `Hero.activeSkills.test.ts`
- [x] `CombatSkillSelector.test.ts`, `SkillCardPresentation.test.ts`
- [x] `HeroDetailScrollPresentation.test.ts` — captura/restaura scroll da lista de skills
- [x] `HeroSkillsTabRenderer.test.ts` — aba Skills sem parágrafos de hint estático (equipadas/hover/equipar)
- [x] `SkillCardPresentation.test.ts` — cards equipáveis sem hint “Toque para equipar · arraste até um slot”
