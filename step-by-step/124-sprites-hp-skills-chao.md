# 124 — Sprites maiores, HP e skills no chão

## Pedido

- Aumentar aliados e adversários
- Manter skills pequenas
- HP logo **acima do chão**
- Skills logo **abaixo no chão** (posição original)

## Layout do card

```
[sprite grande + badges]
        ↑
   (espaço livre)
        ↓
[barra HP]  ← absolute, acima da faixa de skills
[skills]    ← absolute, sobre o strip-floor
════ chão ════
```

## Tokens CSS

| Token | Valor |
|-------|-------|
| `--strip-hero-slot` | 46px (40 crowded) |
| `--strip-enemy-slot` | 50px (44 crowded) |
| `--strip-sprite-zoom` | 1.22 |
| `--strip-skill-size` | 9px |
| `--strip-floor-height` | 28px |

## Ajuste fino (125)

- `--strip-actor-gap: 2px` — fileira de atores mais baixa, perto do chão
- `--strip-hp-bottom: 5px` — HP logo acima das skills no chão
- `--strip-card-foot: 11px` — padding do card reduzido na mesma proporção para manter distância sprite ↔ HP
