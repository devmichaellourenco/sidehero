---
name: skills-progression
description: Skills, ranks, slots de batalha e ascensão de classe no Side Hero. Use para skill tree, allocate, ascension, skill slot, cooldown ou SkillService.
---

# Skills e Progressão

## Spec

`specs/skills-progression.spec.md`

## Fluxo

1. Nova skill → `SkillCatalog` + `HeroCombatSkillCatalog` (combate)
2. Lógica → `SkillService`, `ClassAscensionService`
3. UI → `SkillCardPresentation`, `HeroSkillsTabRenderer`
4. Mensagens → `GET_HERO_SKILL_TREE`, `SPEND_IMPROVEMENT_POINT`

## Padrões

- Slot 0 = Ataque Básico (fixo)
- Slots extras = `getUnlockedBattleSkillSlotCount(upgradeLevels)`
- Scroll ao `+1 rank`: `pinScrollBeforeMutation` em `HeroDetailModalRenderer` + `HeroDetailScrollPresentation`
- Aba Skills: sem hints de texto; slots interativos + highlight no tap-to-assign; tooltips nos cards
- Cards da lista: estado equipado = fundo verde; sem badge Disponível (botão `[+]` basta)
- Cards de ascensão: requisitos/CTA no tooltip; clique no card disponível abre confirmação
- Aba Classe: sem retrato/classe atual (vai no header); banner + cards temáticos (`HeroClassAscensionPresentation`) + skills de evolução

## Testes

`SkillService.allocate.test.ts`, `SkillService.ascension.test.ts`, `SkillBattleSlots.test.ts`, `HeroDetailScrollPresentation.test.ts`, `HeroSkillsTabRenderer.test.ts` — criar ou atualizar; não executar automaticamente.

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar
