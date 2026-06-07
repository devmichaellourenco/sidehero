# Step-by-Step — Scrollbars temáticas

## Data: 07/06/2025

## Problema

Scrollbars padrão do Windows destoavam do visual RPG do Side Hero.

## Solução

Classe `.game-scroll` com estilo customizado:
- trilho escuro (azul/roxo do painel)
- polegar dourado com gradiente (paleta do jogo)
- hover com destaque dourado/rosa (`--accent`)
- suporte Chrome (`::-webkit-scrollbar`) e Firefox (`scrollbar-color`)

Aplicado em: `#app`, `#hero-panels`, `#inventory-list`, `#battle-log`.

## Status

✅ Implementado em `panel.css` e `panel.html`
