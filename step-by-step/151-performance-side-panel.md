# 151 — Performance do side panel

## Objetivo

Reduzir trabalho de DOM e derivações repetidas no painel durante auto-batalha e navegação na campanha.

## Otimizações

| Área | Antes | Depois |
|------|-------|--------|
| **Log de batalha** | `innerHTML` completo a cada tick | `BattleLogRenderer` com prepend incremental e skip quando inalterado |
| **Badge de upgrade** | `countUpgradeItems` percorria inventário × party a cada render | `activePartyUpgradeCount` pré-calculado no `GameStatePresenter` |
| **Campanha (toggle)** | `renderModal` recriava todo o modal | `refreshViewMode` atualiza só abas/painel e rebind pontual |

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `BattleLogRenderer.ts` | Render incremental do `<ul id="battle-log">` |
| `GameStatePresenter.ts` | Campo `activePartyUpgradeCount` |
| `LoadoutOptimizer.ts` | `countActivePartyUpgrades()` |
| `GearComparison.ts` | Usa contagem do DTO |
| `CampaignFlow.ts` | `refreshViewMode` / `updateViewToggleUi` |
| `GameViewController.ts` | Integra `BattleLogRenderer` |

## Testes

- `BattleLogRenderer.test.ts`
- `LoadoutOptimizer.test.ts` (contagem party)

```bash
npx vitest run src/presentation/components/BattleLogRenderer.test.ts
npx vitest run src/domain/services/LoadoutOptimizer.test.ts
```

## Fora de escopo

- Virtualização de inventário (ver `127-inventario-grid-ux.md` Fase 2)
- Release / bump de versão
