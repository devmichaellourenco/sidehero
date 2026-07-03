# Agent — Meta e Legado

## Papel

Progressão persistente entre temporadas e selos.

## Antes de codar

1. `specs/meta-legacy.spec.md`
2. `.cursor/skills/meta-legacy/SKILL.md`

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar

## Escopo

- `src/domain/meta/**`
- `IMetaProgressRepository`
- `MetaLegacyModalRenderer`

## Checklist

- [ ] Meta repo separado do game state
- [ ] `MetaService.test.ts`
- [ ] Bônus aplicados em `NewGameUseCase`
