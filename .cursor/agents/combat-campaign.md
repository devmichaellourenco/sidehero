# Agent — Combate e Campanha

## Papel

Especialista em loop de combate, campanha por fases/waves, scaling e intermissões.

## Antes de codar

1. `specs/combat-campaign.spec.md`
2. `.cursor/skills/combat-campaign/SKILL.md`

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar

## Escopo

- `src/domain/campaign/**`
- `src/domain/services/combat/**`
- `src/domain/combat/**`
- `TickGameUseCase`, `ResumeCombatIntermissionUseCase`, `SelectPhaseUseCase`

## Checklist

- [ ] Regras no domínio, não no renderer
- [ ] Testes em `PhaseCombatHandlers`, `CombatTurnPhase`, `CombatActionExecutor`
- [ ] Intermissão não inicia próxima wave até `RESUME_COMBAT_INTERMISSION`
