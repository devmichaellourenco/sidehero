# 107 — Toasts com cores contrastantes

## Status: concluída

## Problema

Toasts usavam o mesmo azul escuro dos painéis (`rgba(20, 32, 58)`), passando despercebidos sobre a UI.

## Correção

Cada tipo de toast tem gradiente **saturado** distinto do fundo do jogo:

| Tipo | Cor |
|------|-----|
| info | Teal / ciano |
| chest | Dourado âmbar |
| level | Azul elétrico |
| victory | Rosa / vermelho |
| loot | Roxo |
| idle | Verde |

Borda clara + sombra mais forte para destacar sobre modais e painéis.

## Arquivo

`panel.css` — tokens `--toast-*-bg` e classes `.game-toast-*`
