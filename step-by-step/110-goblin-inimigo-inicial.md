# 110 — Goblin inimigo inicial + sprite dedicado

## Objetivo

Trocar os inimigos do início da campanha de Slime para Goblin e usar o sprite customizado em `public/sprites/enemies/goblin.png`.

## Alterações

| Arquivo | Mudança |
|---------|---------|
| `EnemyType.ts` | Goblin primeiro em `ENEMY_DEFINITIONS` (ciclo e fases procedurais) |
| `HandcraftedPhaseCatalog.ts` | Boss das fases iniciais (`tier < 40`) passa de slime para goblin |
| `MilestonePhaseBlueprints.ts` | Marco 1-50 (Guardião das Esgotos) só com goblins nas waves 1–2 |
| `copy-assets.mjs` | `ENEMY_SPRITE_MAP` copia `goblin.png` e `goblin_boss.png` → `characters/` |
| `AssetCatalog.ts` | `ENEMY_BOSS_SPRITES.goblin` + `getEnemySprite(type, { isBoss })` |
| `BattleStripRenderer.ts` | Boss detectado pelo prefixo `"Boss "` no nome (gerado em `WaveEnemyFactory`) |

## Pipeline do sprite

```
public/sprites/enemies/goblin.png
        ↓ copy-assets.mjs (ENEMY_SPRITE_MAP)
dist/panel/assets/characters/goblin.png
        ↓ AssetCatalog.ts → getEnemySprite('goblin')
        ↓ BattleStripRenderer
```

## Validação

```bash
npm test
npm run build
ls dist/panel/assets/characters/goblin.png
```

Recarregar extensão → fase 1-1 deve exibir Goblin com o novo sprite.
