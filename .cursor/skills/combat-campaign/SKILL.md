---
name: combat-campaign
description: Implementa combate em tempo real, campanha por fases/waves, tick e intermissões no Side Hero. Use para combate, boss, wave, fase, tick, PhaseCombatHandlers, CombatActionExecutor ou campanha.
---

# Combate e Campanha

## Spec

`specs/combat-campaign.spec.md`

## Fluxo de implementação

1. Regra nova → `domain/campaign` ou `domain/services/combat`
2. Orquestração → use case (`TickGameUseCase`, etc.)
3. UI de resultado → `presentation/flows/BattleVictoryFlow`, strip
4. Testes listados na spec — criar ou atualizar; não executar automaticamente.

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar

## Padrões

- Boss vs wave: `PhaseCombatHandlers.onBossDefeated` vs `onWaveCleared`
- XP só em boss wave (`WaveEnemyFactory`)
- Intermissão: setar `combatIntermission`, não avançar combate até resume

## Arquivos frequentes

- `PhaseCombatHandlers.ts`, `CombatTurnPhase.ts`, `CombatActionExecutor.ts`
- `HandcraftedPhaseCatalog.ts`, `StageScalingCatalog.ts`
- `CampaignMapPresentation.ts`, `CampaignModalRenderer.ts`, `CampaignTooltipBinder.ts`
