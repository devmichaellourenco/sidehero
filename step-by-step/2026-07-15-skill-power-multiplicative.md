# Fórmula multiplicativa de poder de skill (sem ×1.9)

Data: 2026-07-15

## Objetivo

Remover `HERO_DAMAGE_SKILL_MULTIPLIER` (×1.9) e passar a calcular o poder como produto dos valores do catálogo, para balancear skill a skill.

## Nova fórmula (herói)

```
poder = floor( Base × (powerPerRank × nível) × (atributo × fator) )
```

- **Rank:** `powerPerRank × nível` — no nível 1 já vale o `powerPerRank` (ex.: 10 → 10; nível 2 → 20)
- Sem multiplicador global
- Skills físicas ainda podem usar o piso `ATK × 1.35`
- Inimigos: fórmula antiga (não alterada)

## Arquivos

| Arquivo | Papel |
|---------|--------|
| `SkillDamageBalance.ts` | Helpers `skillRankMultiplier`, `calculateHeroSkillRawPower`; remove ×1.9 |
| `SkillPowerCalculator.ts` | Usa a fórmula multiplicativa |
| `HeroCombatSkillCatalog.ts` | Valores rebalanceados (paridade aproximada no rank 1 com attr 10) |
| `DamageThroughputEstimate.ts` | Tooltip Status atualizado |
| `SkillDamageBalance.test.ts` | Cobertura rank/frost_shard |

## Rebalance do catálogo

Conversão automática por skill: `basePower = 1`, mantém `powerPerRank`, ajusta `attributeFactor` para o poder no rank 1 (attr ref 10) ficar próximo do antigo `(base + attr×fator)×1.9`. Ajuste fino futuro: mudar `basePower`, `powerPerRank` ou `attributeFactor` por skill.
