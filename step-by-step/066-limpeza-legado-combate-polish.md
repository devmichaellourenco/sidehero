# 066 — Limpeza legado + polish de combate

## Etapa concluída (prioridades 3 e 4 parcial)

### 1. Remoção de código legado (stage antigo)

Arquivos removidos — não referenciados pelo fluxo de campanha:

| Arquivo | Motivo |
|---------|--------|
| `VictoryRewardPhase.ts` | Recompensa pós-vitória por stage |
| `EncounterSpawner.ts` | Spawn de inimigos por stage |

O combate atual usa `CombatTurnPhase` + `PhaseCombatHandlers`.

### 2. Skill intent só no turno ativo

`HeroBattlePresentation.ts` e `EnemyBattlePresentation.ts` exibem ícone de próxima skill **apenas** quando `isActiveTurn === true`. Reduz poluição visual no battle strip.

### 3. Orc e Wraith com poder distinto

`EnemyCombatSkillCatalog.ts`:

| Skill | Antes | Depois |
|-------|-------|--------|
| `orc_smash` | `usesAttackStat` (= ATK) | `basePower: 8` + stage |
| `wraith_drain` | `usesAttackStat` | `basePower: 6` + stage |

Testes em `CombatSkillSelector.test.ts`.

## Validação

```bash
npm test
npm run build
```

## Próximo passo sugerido

**Playtest de balanceamento** (tiers 30, 100, 250) ou **marcos handcrafted** nas fases 50/100/250/500.
