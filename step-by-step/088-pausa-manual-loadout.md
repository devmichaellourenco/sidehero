# 088 — Pausa manual para ajustes de equipe

## Objetivo

Permitir pausar o jogo **a qualquer momento** durante uma fase para editar party, equipamentos e skills. Ao continuar:

| Contexto | Comportamento ao continuar |
|----------|---------------------------|
| Pausa manual no meio da fase | Reinicia a fase atual (wave 1, party curada) |
| Pausa entre fases (após boss) | Avança para a próxima fase (comportamento existente) |

## Domínio

| Arquivo | Alteração |
|---------|-----------|
| `GameState.ts` | `phaseRestartOnResume` — distingue pausa manual vs intermissão pós-boss |
| `PauseForLoadoutUseCase.ts` | Pausa: zera combate, abre edição, marca reinício |
| `PhaseCombatHandlers.ts` | `restartPhaseFromPause()` — equivalente ao wipe, sem mensagem de derrota |
| `TickGameUseCase.ts` | `restartCurrentPhase` reinicia; `resumeCampaign` avança fase |
| `PhaseCombatHandlers.onBossDefeated` | `phaseRestartOnResume: false` |

## UI

| Arquivo | Alteração |
|---------|-----------|
| `panel.html` | Botão **Pausar para ajustes**; banner com título/descrição dinâmicos |
| `GameViewController.ts` | Pausa/continuar; bloqueio de ticks via `loadoutEditOpen` |
| `GameHudController.ts` | Habilita/desabilita botão de pausa |
| `PartyPanelPresentation.ts` | Aviso orientando usar pausa |

## Mensagens

- `PAUSE_FOR_LOADOUT` — service worker
- `TICK` com `restartCurrentPhase: true` — retomar pausa manual

## Testes

- `PauseForLoadoutUseCase.test.ts`
- `TickGameResumeUseCase.test.ts`
- `PhaseCombatHandlers.test.ts` — `restartPhaseFromPause`

## Status

Implementado — 140 testes passando.
