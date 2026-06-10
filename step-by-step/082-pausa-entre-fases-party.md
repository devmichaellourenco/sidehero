# 082 — Pausa entre fases para ajustes de party

## Objetivo

Permitir editar party/loadout entre fases sem pressa, mantendo avanço automático se o jogador não interagir.

## Comportamento

| Situação | Resultado |
|----------|-----------|
| Vitória de boss | Overlay com countdown de **3s** |
| Sem clique | Avança automaticamente para próxima fase |
| **Continuar** no overlay | Avança imediatamente |
| **Realizar alterações** | Para countdown, esconde overlay, mostra banner de pausa |
| Pausa ativa | Ticks, auto-batalha e botão Avançar bloqueados; party editável |
| **Continuar batalha** no banner | Retoma combate na próxima fase |

## Arquivos

| Arquivo | Alteração |
|---------|-----------|
| `BattleVictoryFlow.ts` | `pauseForAdjustments()`, `isBlockingAdvance()`, countdown 3s |
| `BattleVictoryFlow.test.ts` | Testes auto-continue e intermissão |
| `BattleVictoryOverlayRenderer.ts` | Botão "Realizar alterações" |
| `GameViewController.ts` | Banner de intermissão, bloqueio de ticks |
| `GameHudController.ts` | Desabilita Avançar Batalha na pausa |
| `panel.html` | `#phase-intermission-banner` |
| `panel.css` | Estilos overlay e banner |

## Status

Implementado.
