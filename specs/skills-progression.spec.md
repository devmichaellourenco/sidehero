# Spec — Skills e Progressão

## Status

**Aceite:** 13/13 (100%)  
**Testes obrigatórios:** 12/12 presentes na suite

## Objetivo

Cada herói investe **pontos de aprimoramento** (saldo único) em árvore de skills, equipa até N skills ativas (slots desbloqueáveis) e pode **ascender** classe em caminho ramificado.

## Critérios de aceite

- [x] `+1 rank` respeita pré-requisitos e rank máximo
- [x] Slots de batalha: básico fixo + slots extras via melhoria `battle_skill_slots`
- [x] Equipar skill: clique ou drag para barra de slots; cooldown na strip
- [x] Ascensão: uma evolução por vez por caminho; skills de tiers anteriores acumulam; concede `pointsGranted` em **Aprimoramento** (não há pool separado de evolução)
- [x] Skills de evolução (`pointType: 'ascension'`) gastam/refundam o mesmo `unspentImprovementPoints` e sobem até `maxRank` 3
- [x] Combate usa `HeroCombatSkillCatalog` + `CombatSkillRegistry`
- [x] Ao clicar `+` rank (aba Skills ou ascensão), a lista mantém a posição de scroll no drawer/modal
- [x] Aba Skills do herói **sem** textos de instrução (equipar, drag, hover); slots e cards comunicam a ação só por highlight visual no tap-to-assign
- [x] Cards da lista de skills **sem** badges Ativa/Inativa nem Disponível; skill equipada usa fundo verde no card; rank disponível comunicado só pelo botão `[+]`
- [x] Aba Classe lista apenas próxima(s) ascensão(ões) e skills de evolução; classe/tier atual ficam no header do modal
- [x] Cards de ascensão usam tema por caminho (military/martial/arcane/innate/sacred/life), showcase ampliado do sprite e CTA com estado pronto/bloqueado
- [x] Cards de ascensão **sem** requisitos, status nem CTA no corpo visível — detalhes no tooltip ao apontar; nome e `+N Aprim.` em linhas separadas; ascensão disponível abre modal de confirmação ao clicar no card

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Domain | `src/domain/progression/*`, `SkillCatalog`, `ClassAscensionService`, `SkillService` |
| Application | `SpendImprovementPointUseCase`, `GetHeroSkillTreeUseCase`, `AssignSkillSlotUseCase`, `AscendClassUseCase` |
| Presentation | `SkillCardPresentation`, `HeroSkillsTabRenderer`, `HeroDetailModalRenderer`, `HeroDetailScrollPresentation`, `CombatSkillBar*` |

## Invariantes

- Ataque Básico não pode ser removido do slot 0
- `SkillService` valida allocate/ascension no domínio; skills de evolução usam `unspentImprovementPoints`
- Ascensão concede Aprimoramento (`pointsGranted`); `unspentAscensionPoints` legado migra para 0
- Ícones via `SkillIconCatalog` / `AssetCatalog`
- Scroll da lista: capturar no clique (`pinScrollBeforeMutation`) e restaurar após re-render; evitar re-render duplicado do drawer

## Fora de escopo

- Skills ativas do jogador em tempo real (só auto-battle)
- Reset/refund de ranks (ver [`improvement-reset.spec.md`](improvement-reset.spec.md))

## Relacionado

- [`improvement-reset.spec.md`](improvement-reset.spec.md) — devolver ranks `pointType: 'improvement'` e `'ascension'` (unitário + massa); **não** desfaz `ascensionId`

## Testes obrigatórios

- [x] `SkillService.allocate.test.ts`, `SkillService.ascension.test.ts`
- [x] `SkillBattleSlots.test.ts`, `Hero.activeSkills.test.ts`
- [x] `CombatSkillSelector.test.ts`, `SkillCardPresentation.test.ts`
- [x] `HeroDetailScrollPresentation.test.ts` — captura/restaura scroll da lista de skills
- [x] `HeroSkillsTabRenderer.test.ts` — aba Skills sem parágrafos de hint estático (equipadas/hover/equipar)
- [x] `HeroClassAscensionPresentation.test.ts` — cards com requisitos/CTA só no tooltip
- [x] `AscendClassConfirmPresentation.test.ts` — confirmação de ascensão com preview e aviso permanente
