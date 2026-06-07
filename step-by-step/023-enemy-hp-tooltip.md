# 023 — HP do inimigo e tooltip de informações

## Objetivo
Substituir o fundo distorcido da barra de HP do inimigo e exibir dados do inimigo atual ao passar o mouse.

## Alterações

### DTO
- `EnemyDto` ganha `attack`, `defense`, `goldReward`, `xpReward`

### Apresentação
- **`EnemyBattlePresentation.ts`**: card do inimigo na battle strip + textos do tooltip
- **`EnemyTooltipBinder.ts`**: portal fixo com informações do inimigo
- **`BattleStripRenderer.ts`**: usa o novo card e vincula tooltips

### Tooltip do inimigo (hover no sprite/nome)
```
Goblin
Stage 3
45/60
ATK 12 · DEF 4
+8 ouro · +15 XP
```

### Barra de HP do inimigo
- Trilho CSS `.strip-bar` (sem `frame.png`)
- Hover na barra: `45/60` via `BarTooltipBinder`

## Ajuste — direção do sprite
- `.enemy-image` com `scaleX(-1)` para o inimigo ficar de frente para os heróis
- Animação `enemy-shake` preserva o espelhamento

## Validação
```bash
npm run build
```
Recarregar extensão: inimigo com fundo de barra limpo; hover no inimigo mostra stats; hover na barra mostra HP.
