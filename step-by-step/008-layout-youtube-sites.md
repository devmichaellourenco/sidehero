# Step-by-Step — Layout em sites complexos (YouTube)

## Data: 06/06/2025

## Problema

Em sites como YouTube, o painel ainda sobrepunha o conteúdo porque usam `100vw`, custom elements (`ytd-app`) e headers `position: fixed`.

## Solução

1. **`SiteLayoutRules.ts`** — CSS específico por site (YouTube, X/Twitter) + seletores genéricos (`#root`, `ytd-app`, etc.)
2. **`FixedLayoutPatcher.ts`** — detecta elementos `fixed/sticky` com largura de viewport e reduz com `calc(100vw - painel)`
3. **`PageLayoutAdjuster.ts`** — usa `padding-right` no `html` + observer com `childList` para SPAs

## Base do layout

```css
html {
  width: 100vw;
  padding-right: 380px;
  box-sizing: border-box;
}
```

## Status

✅ Implementado
