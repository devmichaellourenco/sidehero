# 013 — Sprite por tipo de inimigo

## Objetivo
Cada inimigo (Slime, Goblin, Orc, Wraith, Dragon) passa a exibir sua própria imagem na faixa de batalha.

## Alterações

### Domínio
- **`src/domain/entities/EnemyType.ts`** (novo): define `EnemyType`, lista `ENEMY_DEFINITIONS` e helpers `enemyTypeForStage`, `enemyNameForStage`, `inferEnemyType`.
- **`src/domain/entities/Enemy.ts`**: campo `enemyType` em `EnemyProps`; `forStage()` deriva tipo e nome a partir do stage.

### Aplicação
- **`src/application/dto/GameStateDto.ts`**: `EnemyDto` inclui `enemyType`; mapeamento em `mapGameStateToDto`.

### Infraestrutura
- **`src/infrastructure/storage/GameStateMigration.ts`**: saves antigos sem `enemyType` recebem inferência pelo nome ou stage.

### Apresentação
- **`src/presentation/assets/AssetCatalog.ts`**: mapa `ENEMY_SPRITES` + `getEnemySprite()` (mesmo padrão de `getHeroSprite`).
- **`src/presentation/components/BattleStripRenderer.ts`**: usa `getEnemySprite(state.enemy.enemyType)`.

### Build
- **`scripts/copy-assets.mjs`**: 5 sprites copiados de `ResourcesData`:
  - `character_sample_04` → `slime.png`
  - `character_sample_05` → `goblin.png`
  - `character_sample_06` → `orc.png`
  - `character_sample_08` → `wraith.png`
  - `character_sample_07` → `dragon.png`

## Mapeamento stage → inimigo
| Stage (ciclo) | Tipo    | Nome exibido   | Sprite        |
|---------------|---------|----------------|---------------|
| 1, 6, 11…     | slime   | Slime Lv.N     | slime.png     |
| 2, 7, 12…     | goblin  | Goblin Lv.N    | goblin.png    |
| 3, 8, 13…     | orc     | Orc Lv.N       | orc.png       |
| 4, 9, 14…     | wraith  | Wraith Lv.N    | wraith.png    |
| 5, 10, 15…    | dragon  | Dragon Lv.N    | dragon.png    |

## Como validar
```bash
npm run build
```
Recarregar a extensão no Chrome e avançar stages para ver cada sprite diferente.
