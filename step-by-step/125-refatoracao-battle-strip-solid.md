# 125 — Refatoração battle strip (SOLID / escalabilidade)

## Objetivo

Aperfeiçoar a arquitetura da battle strip **sem alterar o comportamento visual**: unificar renderização herói/inimigo, mover formatação de cooldown e paths de ícones para a camada de aplicação, e reduzir acoplamento da presentation com o domínio.

## Alterações

### 1. DTOs enriquecidos (`GameStateDto.ts`)

| DTO | Campos novos |
|-----|----------------|
| `CombatStatusEffectDto` | `iconPath` |
| `CombatBattleSkillDto` | `cooldownLabel`, `cooldownRatio` |
| `HeroSkillCooldownDto` | `cooldownLabel`, `cooldownRatio` |

A presentation consome valores já prontos; não chama mais funções de domínio para countdown ou ratio.

### 2. Mappers de aplicação

| Arquivo | Função |
|---------|--------|
| `CombatStatusEffectIconMapper.ts` | Resolve `iconPath` por `kind` de status |
| `SkillCooldownPresentationMapper.ts` | Centraliza `formatSkillCooldownCountdown` + cálculo de ratio |
| `CombatStatusEffectMapper.ts` | Passa a incluir `iconPath` |
| `CombatSkillBarMapper.ts` | Preenche `cooldownLabel` / `cooldownRatio` |
| `HeroSkillCooldownMapper.ts` | Idem para cooldowns do painel de heróis |

### 3. Presentation unificada

| Arquivo | Função |
|---------|--------|
| `BattleActorHealthPresentation.ts` | `clampHealthPercent`, `renderStripHealthBar` compartilhados |
| `BattleActorCardPresentation.ts` | Renderer único de `.battle-actor-card` (herói e inimigo) |
| `HeroBattlePresentation.ts` | Delega para `renderBattleActorCard` |
| `EnemyBattlePresentation.ts` | Delega para `renderBattleActorCard` |
| `HeroBarsPresentation.ts` | Reusa barra de HP da strip |
| `BattleStripPatcher.ts` | Exporta `shouldUseCrowdedBattleStrip` (testável) |
| `CombatStatusEffectPresentation.ts` | Usa `dto.iconPath` via `getAssetUrl` |
| `CombatSkillIntentPresentation.ts` | Usa `dto.cooldownLabel` / `dto.cooldownRatio` |
| `HeroSkillCooldownPresentation.ts` | Idem; sem import de domínio |
| `HeroActiveSkillsPresentation.ts` | Hint de recarga via `cooldownLabel` |
| `HeroPanelCooldownPatcher.ts` | Patch via campos do DTO |

### 4. Testes adicionados/atualizados

- `CombatStatusEffectIconMapper.test.ts`
- `SkillCooldownPresentationMapper.test.ts`
- `BattleActorCardPresentation.test.ts`
- `BattleStripPatcher.test.ts`
- `BattleStripStructure.test.ts` (casos de estabilidade e ordem)
- Fixtures atualizadas em `CombatSkillIntentPresentation.test.ts` e `HeroSkillCooldownPresentation.test.ts`

## Comportamento preservado

- HTML/CSS da strip permanece equivalente (mesmas classes, estrutura `battle-actor-card`, skills no chão, HP acima do chão).
- Ícones de buff/debuff continuam usando `ui/defense.png`.
- Countdown de skills continua inteiro arredondado para cima (via domínio, só na application).

## Próximos passos opcionais

- Testes de integração com jsdom para `patchBattleStripInPlace`.
- Ícones distintos por tipo de status no `CombatStatusEffectIconMapper` quando houver assets dedicados.

## Status

Concluído — validar com `npm test` no ambiente local.
