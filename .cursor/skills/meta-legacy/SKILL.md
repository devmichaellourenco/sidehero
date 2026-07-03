---
name: meta-legacy
description: Meta progressão e legado entre temporadas no Side Hero. Use para meta, selos, temporada, legado ou MetaService.
---

# Meta e Legado

## Spec

`specs/meta-legacy.spec.md`

## Fluxo

1. Definição → `MetaUpgradeCatalog`
2. Selos/bônus → `MetaService`
3. Persistência → `IMetaProgressRepository` (storage separado)
4. Nova run → `NewGameUseCase` aplica `MetaBonuses`

## Padrões

- Não misturar selos no `GameState` principal
- UI: `MetaLegacyModalRenderer`, Wow fim de temporada

## Testes

`MetaService.test.ts` — criar ou atualizar; não executar automaticamente.

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar

## Referência

`step-by-step/142-meta-entre-temporadas.md`
