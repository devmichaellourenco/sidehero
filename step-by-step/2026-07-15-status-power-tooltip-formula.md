# Status — tooltip de cálculo do Poder da skill

Data: 2026-07-15

## Objetivo

No hover da linha **Poder** na aba Status, mostrar o cálculo completo que gera o valor aproximado exibido.

## Alteração

| Arquivo | Função |
|---------|--------|
| `DamageThroughputEstimate.ts` | Exporta `buildHeroSkillPowerBreakdown` com fórmula, base, rank, atributo, ×1.9 (só dano) e poder final |
| `SkillBattleStatsMapper.ts` | Linha Poder sempre usa esse breakdown (dano, cura, buff e ATK) |
| Testes | `frost_shard` e fireball cobrem lines da fórmula |

## Exemplo (frost_shard rank 2)

```
Fórmula: base + (rank−1)×porRank + INT×fator → ×1.9
Base da skill = 7
Rank 2: +4.0 (4 por rank após o 1º)
INT N × 1.25 = …
Soma bruta = …
× multiplicador de skill 1.9 → floor(…) = …
Poder final ≈ …
```
