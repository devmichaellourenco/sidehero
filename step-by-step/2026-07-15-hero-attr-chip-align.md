# Alinhamento vertical STR/DEX/INT na aba Status

Data: 2026-07-15

## Problema

No chip `[STR] [21+9] [+]`, o rótulo STR ficava desalinhado verticalmente em relação ao valor e ao botão.

## Causa

Métricas de fonte do heading + `line-height` padrão e falta de estilo específico para `.hero-attr-value` dentro do chip.

## Correção

1. Chip em grid de 3 colunas com `align-items: center`
2. Label, valor e `+` com **mesma altura (18px)** e `inline-flex` centrado
3. Label passa a usar `--font-body` (Alata), igual ao valor — evita desalinhamento óptico Josefin vs Alata
