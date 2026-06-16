# 117 — Sprites Goblin Arqueiro e Vorax (chefão final)

## Objetivo

Integrar novos sprites de `public/sprites/enemies/`:
- `goblin_arqueiro.png` / `goblin_arqueiro_1.png` → Goblin Arqueiro
- `vorax_final_boss.png` → Vorax, chefão final da campanha

## Pipeline de assets

| Origem | Destino no build |
|--------|------------------|
| `goblin_arqueiro.png` | `characters/goblin_archer.png` |
| `goblin_arqueiro_1.png` | `characters/goblin_archer_alt.png` |
| `vorax_final_boss.png` | `characters/vorax_boss.png` |

Atualizado em `scripts/copy-assets.mjs`.

## Domínio

| Arquivo | Alteração |
|---------|-----------|
| `EnemyRosterCatalog.ts` | `spriteVariant: 'goblin_archer'` em `goblin_archer`; entrada única `vorax` |
| `EnemyTierProgression.ts` | Marco mapa 10 → `vorax` |
| `MilestonePhaseBlueprints.ts` | Fase 10-50 boss `Vorax` |
| `HandcraftedPhaseCatalog.ts` | Finale temporada → `vorax` |
| `EnemyType.ts` | Inferência e legado para `vorax` |

## Apresentação

| Arquivo | Alteração |
|---------|-----------|
| `AssetCatalog.ts` | Resolução por `spriteVariant`; arqueiros alternam sprite por `enemyId` |
| `BattleStripRenderer.ts` | Passa `enemy.id` para `getEnemySpriteUrl` |

## Validação

```bash
npm test
npm run build
```

Recarregar extensão — Goblin Arqueiro com sprite dedicado; fase 10-50 e finale com Vorax.
