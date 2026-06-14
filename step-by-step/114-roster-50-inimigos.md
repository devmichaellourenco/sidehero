# 114 — Roster de 50 inimigos + acervo unificado de skills

## Decisões confirmadas

- **Saci** mantido na fase 1-50 (Guardião Elemental)
- **Nomes de mapas/marcos** inalterados
- **Skills** — acervo único em `SkillCatalog` + `CombatSkillRegistry` (monstros usam `scope: 'monster'`)
- **Sprites** — `goblin` (comuns), `goblin_boss` (sub/chefes), `saci_boss` (Saci); placeholders Demo removidos

## Arquivos novos

| Arquivo | Função |
|---------|--------|
| `EnemyRosterCatalog.ts` | 50 inimigos + Saci, tiers, skills, sprites |
| `EnemyTierProgression.ts` | Desbloqueio por tier, picks procedural |
| `CombatSkillRegistry.ts` | Acervo de combate unificado herói/monstro |

## Distribuição

- 2 mapas por nível de poder (tiers 1–500)
- Comuns desbloqueados gradualmente no 1º mapa de cada nível
- Marcos X-50 alternam subchefe / chefe (Saci no 1-50)
- Fases 1–49 usam `pickCommonForGlobalTier` / subboss / boss do nível

## Validação

```bash
npm test
npm run build
```

Recarregar extensão — inimigos exibem nomes do roster com sprites placeholder.
