# 089 — Fix pausa cancelada por auto-batalha

## Problema

Ao clicar em **Pausar para ajustes**, o banner aparecia e sumia em seguida — o jogo avançava um tick sozinho e a pausa deixava de valer.

## Causa

1. `stopAutoBattle()` era chamado **depois** do `await` da mensagem `PAUSE_FOR_LOADOUT`. Enquanto o servidor processava a pausa, o timer da auto-batalha podia disparar outro `TICK`.
2. Respostas de `TICK` já em voo podiam chegar **depois** da pausa e chamar `render()` com estado de combate, sobrescrevendo a UI pausada.

## Correção

| Arquivo | Alteração |
|---------|-----------|
| `GameViewController.ts` | `stopAutoBattle()` síncrono no clique e no início de `pauseForLoadout` |
| `GameViewController.ts` | Flag `pausingLoadout` bloqueia ticks até a pausa confirmar |
| `GameViewController.ts` | Após `await` em `tick()`, descarta resposta se pausa estiver ativa |
| `ChestLootFlow.ts` | Não abre baús automaticamente durante `loadoutEditOpen` |

## Status

Corrigido.
