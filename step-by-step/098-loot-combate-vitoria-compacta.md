# 098 — Loot em combate + overlay de vitória compacto

## Status: concluída

## 1. Loot de baú durante combate

**Problema:** Abrir baú em combate exibia modal de equipar; toast de erro ficava atrás do modal.

**Correção:** Em `handleLootReceived`, se `!canEditParty`:
- Toast com nome do item (mantido)
- **Sem** modal de loot
- **Sem** auto-equip

Item vai para o inventário; equipar só na pausa ou entre fases.

## 2. Overlay de vitória compacto

Estilo inspirado no Taskbar Hero:

| Situação | Visual |
|----------|--------|
| Wave concluída | Fundo azul claro + **CLEAR** |
| Boss / fase concluída | Fundo vermelho claro + **WARNING** |

- Overlay ocupa **só a battle strip** (sem expandir altura)
- Recompensas ficam em **Detalhes** (colapsado por padrão)
- Auto-fecha em 3s; batalha continua no fundo

## Arquivos

- `GameViewController.ts` — gate de loot em combate
- `BattleVictoryDetector.ts` — detecção wave-clear + variant
- `BattleVictoryOverlayRenderer.ts` — UI compacta
- `BattleVictoryFlow.ts` — toggle detalhes, sem countdown
- `panel.css` — estilos compactos
