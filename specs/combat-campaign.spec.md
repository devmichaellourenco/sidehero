# Spec — Combate e Campanha

## Status

**Aceite:** 7/7 (100%) · auditoria 2026-07-03  
**Testes obrigatórios:** 5/5 presentes na suite

## Objetivo

O jogador avança em **fases** com **waves** de inimigos, com combate em tempo real na battle strip, intermissões visuais e progressão de stage/tier.

## Critérios de aceite

- [x] Tick avança combate quando não pausado; respeita `combatIntermission` e pausa de loadout
- [x] Wave intermediária: ouro parcial, sem XP de boss; boss concede XP, ouro, progresso de fase
- [x] Wipe na fase: cura completa + reinicia wave 1 da mesma fase
- [x] Seleção de fase: apenas desbloqueadas ou já concluídas (replay)
- [x] Overlay CLEAR/WARNING/VITÓRIA antes da próxima wave/fase
- [x] Scaling de inimigos segue `StageScalingCatalog` por tier global
- [x] Skills inimigas e heróis resolvem via `CombatActionExecutor` com elementos e status

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Domain | `src/domain/campaign/*`, `src/domain/services/combat/*`, `src/domain/combat/*` |
| Application | `TickGameUseCase`, `ResumeCombatIntermissionUseCase`, `SelectPhaseUseCase`, `GetCampaignOverviewUseCase` |
| Presentation | `BattleStripRenderer`, `BattleVictoryFlow`, controllers de combate |

## Invariantes

- Domínio não conhece Chrome nem DOM
- `phaseRun` nulo + tick não inicia fase se campanha pausada para loadout
- Herói derrotado não permanece como turno ativo
- Dano/cura publicados como eventos para UI (`CombatFloatingEvent`)

## Fora de escopo

- Sprites novos de inimigos (arte incremental)
- PvP ou combate manual por turno do jogador

## Testes obrigatórios

- [x] `PhaseCombatHandlers.test.ts`
- [x] `CombatTurnPhase.test.ts`, `CombatActionExecutor.test.ts`
- [x] `EncounterResolver.test.ts`, `WaveEnemyFactory.test.ts`
- [x] `BattleVictoryFlow.test.ts`
