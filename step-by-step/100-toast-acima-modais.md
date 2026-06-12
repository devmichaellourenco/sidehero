# 100 — Toast acima de modais

## Status: concluída

## Problema

Toasts ficavam atrás de modais (z-index 1400), drawer de herói (1300) e tooltips (até 10050), impedindo feedback visual — ex.: erro de equipar durante modal de loot.

## Correção

1. **`panel.css`** — token `--z-toast: 11000` e `.toast-root` usa `z-index: var(--z-toast)` (acima de modal, drawer e campaign tooltip).
2. **`panel.html`** — `#toast-root` movido para o final do `<body>`, após `#modal-root`, reforçando a ordem de empilhamento.

## Arquivos

| Arquivo | Função |
|---------|--------|
| `panel.css` | Camada visual dos toasts |
| `panel.html` | Ordem DOM do container de toasts |

## Validação

Abrir modal (loot, campanha, loja) e disparar toast (ex.: tentar equipar fora de combate) — mensagem deve aparecer no topo, visível sobre o modal.
