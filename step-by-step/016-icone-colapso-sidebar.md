# 016 — Ícone de colapso do sidebar

## Problema
O botão de recolher/expandir sempre mostrava `◀`, independente do estado.

## Correção (`SidebarHost.ts`)
- **Expandido:** `▶` — indica que o painel será recolhido para a direita.
- **Recolhido:** `◀` — indica que o painel voltará a expandir.
- `updateCollapseButton()` chamado em `applyLayout()` para sincronizar ícone e `aria-label`.
