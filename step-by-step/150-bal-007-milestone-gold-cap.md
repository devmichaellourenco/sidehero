# 150 — BAL-007 cap de ouro em milestones

## Problema

Marcos de capítulo (fases X-50) pagavam 6–9× a renda de referência. Com preços da loja ancorados na curva suave, um épico ficava trivial após um único milestone (ex. tier 100: 9172 ouro vs épico ~9670).

## Solução

`MilestoneGoldCap.ts` aplica escala proporcional ao ouro dos inimigos quando a fase é `milestoneBoss` ou `seasonFinale`:

- **Teto:** `preço épico ÷ 2` → épico exige pelo menos 2 clears do marco
- **Piso implícito:** marco continua ≥1,5× renda de referência (testado)

Integração em `EncounterResolver` → `WaveEnemyFactory.milestoneGoldScale`.

## Resultado nos marcos principais

| Fase | Ouro antes | Ouro após | Épico (fases de milestone) |
|------|------------|-----------|----------------------------|
| 1-50 | 2142 | 836 | 2.0 |
| 2-50 | 9172 | 4834 | 2.0 |
| 5-50 | 72288 | 46308 | 2.0 |
| 10-50 | 407793 | 244499 | 2.0 |

HP, XP e loot de baú permanecem inalterados — só o ouro por kill é escalado.

## Testes

`src/domain/balance/MilestoneGoldCap.test.ts` + caso em `BalanceAudit.test.ts`.

## Spec

BAL-007 marcado como resolvido em `specs/game-balance.spec.md`.
