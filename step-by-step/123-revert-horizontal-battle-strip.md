# 123 — Revert layout horizontal battle strip

## Alteração

Revertido o layout **vertical** (colunas empilhadas) para o **horizontal** original, com altura fixa **128px**.

## Mantido da 122

- Skills in-flow abaixo da HP (sem empilhar no chão)
- Badges icônicos de buff/debuff no sprite com tooltip
- Estrutura unificada `battle-actor-card` / `battle-actor-hitbox`
- Modo `battle-strip--crowded` quando muitos atores no campo

## Ajustes de tamanho (visibilidade em 128px)

| Token | Normal | Crowded |
|-------|--------|---------|
| `--strip-hero-slot` | 36px | 32px |
| `--strip-enemy-slot` | 40px | 36px |
| `--strip-sprite-zoom` | 1.1 | 1.05 |
| Skills | 10px / wrap 12px | 9px / 11px |
| HP bar | 6px altura | igual |

Heróis em `.heroes-row` (esquerda), inimigos em `.enemies-row` (direita).

## Arquivos

- `panel.html` — remove `battle-actors-layer`
- `panel.css` — layout horizontal + altura 128px
- `BattleStripRenderer.ts` — `enemies-row` + `syncBattleStripCrowdedLayout`
- `BattleStripPatcher.ts` — crowded por total de atores
- `BattleStripStructure.ts` — checagem `.enemies-row`
