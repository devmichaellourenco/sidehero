# 058 — Gameplay: inimigos memoráveis + intent no battle strip

## Objetivo

Implementar a **Fase 1** (inimigos com skills distintas), o **item 5** (UX no battle strip) e o **item 6** (pacote pequeno + testes) da Opção B de gameplay.

## Fase 1 — Inimigos memoráveis

### `EnemySkillDisplayCatalog.ts`
Catálogo de nomes e descrições das skills exclusivas de inimigos. Remove o hardcode de nomes no seletor de combate.

### `CombatSkillNaming.ts`
Função `resolveCombatSkillName()` unificada: consulta o catálogo de inimigo, depois `SkillCatalog` de heróis.

### `EnemyCombatSkillCatalog.ts`
Pacote enxuto com poderes distintos (não só `usesAttackStat`):

| Inimigo | Skill nova/ajustada | Comportamento |
|---------|---------------------|---------------|
| Slime | `slime_acid` (Ácido) | Dano mágico fixo `4 + stage`, prioridade 40 |
| Goblin | `goblin_stab` (Facada) | Dano físico fixo `6 + stage`, prioridade 55 |
| Dragon | `dragon_breath` (Baforada) | AoE mágica `12 + stage`, CD inicial 2 |
| Dragon | `dragon_bite` (Mordida) | Single `8 + stage`, alvo com mais HP% |

Orc e Wraith mantidos com `usesAttackStat` (fora do pacote principal).

### `CombatSkillSelector.ts`
Passa a usar `resolveCombatSkillName()` em vez de `if` encadeados.

## Item 5 — UX no battle strip

### Domínio
- `CombatSkillIntent.ts` — tipo de intent de combate.
- `CombatSkillIntentResolver.ts` — resolve próxima skill + lista de skills em recarga.
- `SkillCooldownTracker.getRemaining()` — expõe turnos restantes de cooldown.

### Application
- `CombatSkillIntentDto` em `GameStateDto.ts`.
- `HeroDto.combatIntent` e `EnemyDto.combatIntent`.
- `EnemyDto.signatureSkills` — skills do tipo para tooltip.
- `CombatSkillIntentMapper.ts` — mapeia intent por combatente.
- `GameStatePresenter.ts` — enriquece heróis/inimigos durante combate.

### Presentation
- `CombatSkillIntentPresentation.ts` — chip `→ Facada` + cargas `Baforada · 2t`.
- `HeroBattlePresentation.ts` / `EnemyBattlePresentation.ts` — renderizam intent abaixo do sprite.
- `panel.css` — estilos `.combat-skill-intent`, `.combat-skill-charge`.
- Tooltip de inimigo lista `signatureSkills` com descrição.

## Item 6 — Testes

| Arquivo | Cobertura |
|---------|-----------|
| `CombatSkillSelector.test.ts` | Goblin, Slime, Dragon (prioridade, poder, targeting) |
| `SkillPowerCalculator.test.ts` | Poder fixo por stage das 3 skills |
| `CombatSkillIntentResolver.test.ts` | Telegrafia + skills em recarga |

**48 testes** passando após a etapa.

## Arquivos alterados (resumo)

| Arquivo | Função |
|---------|--------|
| `EnemySkillDisplayCatalog.ts` | Nomes/descrições de skills de inimigo |
| `CombatSkillNaming.ts` | Resolução unificada de nome de skill |
| `EnemyCombatSkillCatalog.ts` | Definições de combate por tipo |
| `CombatSkillIntentResolver.ts` | Próxima ação + cooldowns visíveis |
| `CombatSkillIntentMapper.ts` | Ponte domain → DTO |
| `CombatSkillIntentPresentation.ts` | HTML do chip de intent |
| `GameStatePresenter.ts` | Injeta intent e signatureSkills |
| `HeroBattlePresentation.ts` | UI herói no strip |
| `EnemyBattlePresentation.ts` | UI inimigo no strip + tooltip |
| `panel.css` | Estilos do chip |

## Próximos passos sugeridos

- Fase 2: rebalancear orc/wraith com `basePower` próprio.
- Fase 3: buff/debuff (novos `SkillCombatKind`).
- Destacar chip de intent apenas no turno ativo (opcional UX).
