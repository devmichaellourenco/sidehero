# Aba Status — skills e equipamento

Data: 2026-07-15

## Objetivo

Na aba Status do herói, além de STR/DEX/INT e ficha agregada, mostrar:

1. Skills de batalha equipadas com descrição e efeitos (incl. DPS estimado)
2. Itens equipados com bônus e efeitos únicos (passivas de gear)

## Alterações

| Arquivo | Função |
|---------|--------|
| `SkillBattleStatsMapper.ts` | DPS contínuo (ATK) ou `poder ÷ recarga` para skills de dano |
| `HeroStatusSkillsPresentation.ts` | Seções Skills de batalha + Equipamento e passivas |
| `HeroAttributesTabRenderer.ts` | Inclui extras na aba Status |
| `panel.css` | Estilos das seções |
| Specs + testes | Aceite Status + cobertura |

## Notas

- Estimativa central em `domain/combat/DamageThroughputEstimate.ts`
- Inclui: ATK/poder da skill, ranks, atributos, bônus %/flat de dano do gear, crit esperado, APS com piso de intervalo, CD com CDR e recovery de cast
- Exclui: armadura/resist/esquiva do alvo, DOT e multi-alvo
- Ficha de combate e cards de skill usam a mesma fonte

## Fix 2026-07-15

1. NaN — `Hero` não tem `attackSpeed`; uso de `CombatProfileProvider`
2. Cálculo completo — helper compartilhado com gear + CDR + recovery + APS real
