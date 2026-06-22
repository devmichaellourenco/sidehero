# 131 — Stage Scaling de monstros

## Objetivo

Definir a escala de stats e recompensas dos inimigos por tier de fase, adaptada para **500 fases** (tier global 1–500).

## Domínio

| Arquivo | Função |
|---------|--------|
| `domain/progression/StageScalingCatalog.ts` | Curva de referência (170 pontos), interpolação e `stageScalingFactorsForTier()` |
| `domain/campaign/WaveEnemyFactory.ts` | Aplica multiplicadores separados de ATK, HP, ouro e XP |

## Regras

- Multiplicadores em **centésimos** (100 = ×1,0)
- `curveStage = 1 + (tier − 1) / 499 × 169` — interpolação linear entre pontos da curva
- **DEF** segue o multiplicador de **ATK** (sem coluna DEF dedicada na curva)
- `phaseMultiplier` (marcos/finale) multiplica todos os fatores, como antes
- Stats base inimigo comum: ATK 10 · DEF 4 · HP 60 · ouro 8 · XP boss 15

## Wiki (curriculum-michael)

- `src/app/sidehero/wiki/stage-scaling-data.ts` — 500 tiers pré-calculados
- `src/app/sidehero/wiki/sections/CampaignSection.tsx` — tabela completa
- `src/app/sidehero/wiki/sections/CombatSection.tsx` — fórmulas atualizadas
