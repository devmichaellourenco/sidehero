# 132 — Combate: tempo real, cooldowns e fila paralela

## Problema

- Cooldown na UI não acompanhava o tempo real (atualizava só a cada tick de jogo).
- Apenas **1 ação por tick** (~2,5 s na auto-batalha) — personagens esperavam uns aos outros.
- Skill de 3 s podia levar 10+ s para voltar.
- Cast Speed era aplicado **duas vezes** no CD (divide ao usar + multiplica ao decair).
- `pendingSkillActions` + stagger artificial entre skills multi-hit.

## Decisões

| Tópico | Decisão |
|--------|---------|
| Δ por tick | `COMBAT_DELTA_SECONDS = 1` (1 s simulado por tick) |
| Ações por tick | Até `MAX_ACTIONS_PER_TICK = 24` (loop até esgotar prontos) |
| Fila de ação | `listReadyActors()` — todos com timer ≤ 0 podem agir no mesmo tick |
| CD decay | Linear em segundos, **sem** × castSpeed no decay |
| CD ao usar | `cooldownSeconds / castSpeed` (única aplicação de cast speed) |
| Multi-skill | Removido `pendingSkillActions` e stagger |
| Auto-batalha | Intervalo base **600 ms** / speed (antes 2500 ms) |
| UI CD | Interpolação visual a cada 100 ms entre ticks |

## Domínio

| Arquivo | Função |
|---------|--------|
| `CombatTimingConstants.ts` | Δ, max ações, recovery mínimo |
| `ActionTimerService.ts` | `listReadyActors`, `peekNextActor` |
| `SkillCooldownTracker.ts` | Decay linear; cast speed só em `onSkillUsed` |
| `SkillCooldownTiming.ts` | Label com décimos abaixo de 10 s |
| `CombatTurnPhase.ts` | Loop multi-ação; limpa `pendingSkillActions` |
| `CombatSkillBarResolver.ts` | Highlight só da skill `next` (sem fila pending) |

## Aplicação / UI

| Arquivo | Função |
|---------|--------|
| `CombatSkillBarMapper.ts` | Opções `{ isActiveTurn }` apenas |
| `GameStatePresenter.ts` | Sem `pendingActions` / `combatTime` na skill bar |
| `GamePreferencesController.ts` | Auto-batalha 600 ms / speed |
| `SkillCooldownDisplayAnimator.ts` | Interpola `[data-cd-remaining]` entre ticks |
| `HeroPanelCooldownPatcher.ts` | Grava snapshot para animador |
| `CombatSkillIntentPresentation.ts` | Idem na battle strip |
| `GameViewController.ts` | `setCombatActive` durante fase de combate |

## Migração

| Arquivo | Função |
|---------|--------|
| `GameStateMigration.ts` | `pendingSkillActions: []` em saves legados |

## Validação manual sugerida

1. Auto-batalha: dois heróis com skills prontas devem agir no mesmo “ciclo”, não em fila serial.
2. Skill 3 s: contagem na UI deve chegar perto de 3 s reais (não 10+ s).
3. Cast Speed alto: CD efetivo menor, sem “dobrar” o efeito.
4. Número do CD deve decair suavemente (décimos abaixo de 10 s), não ficar congelado entre ticks.
