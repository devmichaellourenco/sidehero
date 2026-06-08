# 041 — HP dos heróis na battle strip

## Objetivo
Exibir a barra de vida dos heróis no campo de batalha, no mesmo padrão visual e de interação da barra de HP do inimigo.

## Alterações

### `HeroBarsPresentation.ts`
- Nova função **`renderHeroStripHealthBar(hero)`**: gera a barra `.strip-bar` com preenchimento `.health-fill.hero`, rótulo `data-bar-label` e `aria-label` para acessibilidade.
- Reutiliza `clampPercent`, `formatHealthLabel` já usados nos cards de herói.

### `HeroBattlePresentation.ts`
- **`renderHeroBattleSprite`**: passa a envolver sprite + tooltip em `.hero-battle-card` e inclui a barra de HP abaixo do sprite.

### `BattleStripRenderer.ts`
- Chama **`bindBarTooltips`** no `#heroes-container` para mostrar `HP atual/máximo` ao passar o mouse na barra (igual ao inimigo).

### `panel.css`
- Estilos **`.hero-battle-card`**: coluna centralizada sob cada sprite.
- Delays da animação `march` movidos para **`.hero-battle-card:nth-child(n) .hero-sprite`** (o wrapper novo quebrou o seletor antigo).

## Comportamento na UI
- Cada herói na faixa inferior esquerda exibe sprite + barra de vida verde (fill-hero).
- Hover na barra: tooltip `120/120` via `BarTooltipBinder`.
- Hover no sprite: tooltip completo do herói (nome, nível, HP, XP, ATK/DEF) permanece inalterado.

## Validação
```bash
npm test
npm run build
```
Recarregar extensão: três heróis com barras de HP visíveis durante o combate; barras atualizam a cada tick de batalha.

## Ajuste — barras compactas (heróis)
- `.hero-battle-card .health-bar.strip-bar`: largura **36px** (metade de 72px), altura **6px** (metade de 12px), padding/margem/border-radius proporcionais.
- Barra do inimigo permanece no tamanho original.
