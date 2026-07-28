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

- Poder de combate (herói): `Base × (powerPerRank × nível) × (atributo × fator)` — sem multiplicador global; níveis começam com `powerPerRank` no rank 1
- Slot 0 = Ataque Básico (fixo)
- Slots extras = `getUnlockedBattleSkillSlotCount(upgradeLevels)`
- Scroll ao `+1 rank`: `pinScrollBeforeMutation` em `HeroDetailModalRenderer` + `HeroDetailScrollPresentation`
- Aba Skills: carregar `GET_HERO_SKILL_TREE` **e** `GET_HERO_ASCENSION_TREE` (skills de evolução vivem aqui)
- Aba Skills: sem hints de texto; slots interativos + highlight no tap-to-assign; tooltips nos cards; skills de classe + skills de evolução
- Cards da lista: estado equipado = fundo verde; sem badge Disponível (botão `[+]` basta); layout em **grade 2 colunas** de tiles (`.skill-card--tile`) com título no topo, arte full-bleed, level (bookmark) e meta rápida (ramo/atributo/elemento)
- Passivas equipadas (`evasion`, `vitality`, `iron_skin`, `mana_shield`): efeito numérico na seção **Na batalha** do tooltip via `PassiveSkillBattleStatsMapper`
- Passivas **sempre ativas** de classe/ascensão/gear: ver skill `passives` / `specs/passives.spec.md` (sistema separado)
- Cards de ascensão: requisitos/CTA no tooltip; clique no card disponível abre confirmação; `+N Aprim.` (não pool separado)
- Ascensão libera skills/passivas do caminho e concede Aprimoramento (`pointsGranted`); skills `pointType: 'ascension'` gastam o mesmo saldo até rank 3
- Aba Classe: sem retrato/classe atual (vai no header); banner + cards temáticos (`HeroClassAscensionPresentation`) — sem lista de skills
- Testes: `HeroDetailFlow.test.ts` — aba Skills dispara load de ascensão
- Reset de pontos (− e massa; skills improvement **e** evolução → mesmo pool): `specs/improvement-reset.spec.md` + skill `improvement-reset`

## Testes

`SkillService.allocate.test.ts`, `SkillService.ascension.test.ts`, `SkillBattleSlots.test.ts`, `HeroDetailScrollPresentation.test.ts`, `HeroSkillsTabRenderer.test.ts` — criar ou atualizar; não executar automaticamente.

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar
- **Não** criar pasta nem arquivos `step-by-step/`; fonte de verdade = specs, agents, skills, rules e testes
