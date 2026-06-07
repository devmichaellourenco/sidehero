# Step-by-Step — Renomeação para Side Hero

## Data: 06/06/2025

## Alteração

Marca exibida renomeada de **Taskbar Hero** para **Side Hero**.

## Arquivos atualizados

- `manifest.json` — nome e título da extensão
- `panel/panel.html` — título e header
- `SidebarHost.ts` — toolbar e label recolhido
- `service-worker.ts` — logs de console
- `package.json` — nome do pacote
- Mensagens do jogo em `CombatService`, `GameState`, `LootService`

## Mantido (compatibilidade)

IDs internos (`taskbar_hero_game_state`, `taskbar-hero-sidebar-root`, etc.) preservados para não perder saves existentes.

## Status

✅ Renomeado
