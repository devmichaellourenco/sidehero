# Step-by-Step — Correção layout YouTube

## Data: 06/06/2025

## Problema

Regras agressivas (muitos seletores `ytd-*` + `FixedLayoutPatcher`) quebraram o layout do YouTube e ainda sobrepunham conteúdo.

## Solução

**YouTube isolado** com estratégia mínima:

1. `html` com `padding-right` (base) — reduz área útil
2. `ytd-app` apenas `width: 100%` — preenche área disponível, sem `calc(100vw)`
3. `ytd-masthead` com `width: calc(100vw - painel)` — único elemento fixo ajustado
4. **`FixedLayoutPatcher` desativado** no YouTube
5. `ytd-app` removido dos seletores genéricos (só afeta YouTube)

Demais sites mantêm comportamento anterior.

## Status

✅ Corrigido
