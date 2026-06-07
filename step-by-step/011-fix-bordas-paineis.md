# Step-by-Step — Correção bordas dos painéis

## Data: 07/06/2025

## Problema

As bordas de **Heróis**, **Inventário** e **Log de Batalha** ficavam deformadas porque `card.png` era esticado com `background-size: 100% 100%`, distorcendo cantos e entalhes do frame.

## Solução

- `.panel`: trocado para `border-image` com slice `30` (9-slice), mantendo cantos proporcionais
- `.gear-item`: mesmo tratamento com `border-image-source` e slice `20`
- Indicador de raridade movido para `::before` (não conflita com `border-image`)

## Status

✅ Corrigido em `panel.css`
