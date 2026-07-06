# 149 — Auditoria de balanceamento (curva, economia, clear)

## Objetivo

Fechar os critérios pendentes da spec `game-balance` (item 3 do roadmap UX/balance): auditoria automatizada da curva por tier, economia ouro vs loja/forja e tempo de clear estimado.

## Arquivos criados/alterados

| Arquivo | Papel |
|---------|--------|
| `src/domain/balance/BalanceAudit.ts` | Snapshots por fase, faixas early/mid/late, alvos `BALANCE_TARGETS` |
| `src/domain/balance/BalanceAudit.test.ts` | 10 testes nos tiers âncora |
| `src/domain/balance/EconomyReference.ts` | Renda de referência (`goldMultiplier`) e fases para comprar na loja |
| `src/domain/shop/ShopPricing.ts` | Preços derivados da renda de referência (extraído de `ShopService`) |
| `src/domain/services/ShopService.ts` | Delega preços para `ShopPricing` |

## Tiers âncora (auditoria)

| Tier | Fase | Banda | Ouro fase | Ouro ref | HP | Clear (s) | Épico (fases ref) |
|------|------|-------|-----------|----------|-----|-----------|-------------------|
| 1 | 1-1 | early | 15 | 15 | 105 | 74 | 5.20 |
| 10 | 1-10 | early | 70 | 53 | 448 | 74 | 5.25 |
| 25 | 1-25 | early | 218 | 91 | 2906 | 74 | 5.24 |
| 26 | 1-26 | mid | 230 | 97 | 3084 | 120 | 7.00 |
| 40 | 1-40 | mid | 439 | 163 | 11132 | 120 | 7.00 |
| 60 | 2-10 | mid | 360 | 349 | 15752 | 120 | 7.00 |
| 61 | 2-11 | late | 372 | 363 | 16530 | 188 | 8.25 |
| 100 | 2-50 | late | 9172 | 1172 | 464504 | 188 | 8.25 |
| 250 | 5-50 | late | 72288 | 11227 | 4054252 | 188 | 8.25 |
| 500 | 10-50 | late | 407793 | 59273 | 21943268 | 188 | 8.25 |

**Ouro ref** = `referenceGoldPerPhaseForTier` (curva suave a partir de `StageScalingCatalog.goldMultiplier`).  
**Épico (fases ref)** = preço épico ÷ ouro ref — alinhado às faixas `BALANCE_TARGETS.epicPhasesToAfford`.

## Decisões de design

1. **Scaling monotônico** — validado via `StageScalingCatalog`, não ouro bruto por fase (varia com waves/handcrafted).
2. **HP por fase** — monotônico nos tiers âncora; milestones (1-50, 2-50…) concentram mais recompensa.
3. **Tempo de clear** — modelo relativo ao HP da fase âncora do tier, mapeado para faixas 18–130s (early), 40–200s (mid), 55–320s (late).
4. **Preços da loja** — `referência × fases-alvo por banda/raridade`; evita épico trivial no late game com curva linear antiga.
5. **BAL-007** — `MilestoneGoldCap` limita ouro de milestones/finales para épico custar ≥2 clears do marco; piso 1,5× renda de referência.

## BAL-007 — cap de ouro em milestones

`src/domain/balance/MilestoneGoldCap.ts` calcula escala `cap / ouroBruto` quando a fase é milestone ou finale:

- **Teto:** `preço épico ÷ 2` (épico exige ≥2 clears do marco)
- **Piso:** `1,5 × ouro de referência` (marco continua acima da média)

| Fase | Tier | Ouro antes | Ouro após | Épico (fases) |
|------|------|------------|-----------|---------------|
| 1-50 | 50 | 2142 | 836 | 2.0 |
| 2-50 | 100 | 9172 | 4834 | 2.0 |
| 5-50 | 250 | 72288 | 46308 | 2.0 |
| 10-50 | 500 | 407793 | 244499 | 2.0 |

## Como rodar

```bash
npx vitest run src/domain/balance/BalanceAudit.test.ts
npx vitest run src/domain/balance/MilestoneGoldCap.test.ts
npx vitest run src/domain/services/ShopService.test.ts
```

## Spec

Critérios 4–8 marcados em `specs/game-balance.spec.md` (aceite 8/8).
