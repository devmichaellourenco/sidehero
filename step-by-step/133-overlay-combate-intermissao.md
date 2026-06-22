# 133 — Overlay CLEAR / WARNING / DEFEAT com pausa entre batalhas

## Objetivo

Exibir mensagens de resultado na battle strip e **aguardar a animação** antes de iniciar a próxima batalha.

| Situação | Mensagem | Cor |
|----------|----------|-----|
| Wave concluída | **CLEAR** | Azul |
| Próxima wave é boss | **WARNING** | Vermelho |
| Fase/boss concluído | **CLEAR** | Azul |
| Party derrotada (wipe) | **DEFEAT** | Vinho |

## Domínio

| Arquivo | Função |
|---------|--------|
| `CombatIntermission.ts` | Value object da pausa entre combates |
| `GameState.ts` | Campo `combatIntermission` |
| `PhaseCombatHandlers.ts` | Cria intermissão em wave clear, boss clear e wipe; `resumeIntermission()` |
| `CombatTurnPhase.ts` | Ignora ticks enquanto há intermissão |
| `ResumeCombatIntermissionUseCase.ts` | Aplica próximo combate após overlay |

## UI

| Arquivo | Função |
|---------|--------|
| `BattleVictoryOverlayRenderer.ts` | CLEAR / WARNING / DEFEAT |
| `BattleVictoryFlow.ts` | Bloqueia ticks; dismiss após animação (~2,2 s) |
| `GameViewController.ts` | `RESUME_COMBAT_INTERMISSION` ao fechar overlay |
| `panel.css` | Animação do rótulo + tom `--defeat` |

## Fluxo

1. Vitória/derrota → domínio aplica recompensas e seta `combatIntermission` (sem iniciar próximo combate).
2. UI exibe overlay e bloqueia auto-batalha/ticks.
3. Animação termina → `RESUME_COMBAT_INTERMISSION` → próxima wave/fase/restart.

## Validação manual

1. Limpar wave normal → **CLEAR** ~2 s → boss ou próxima wave só depois.
2. Limpar wave antes do boss → **WARNING** → boss só após overlay.
3. Derrotar boss/fase → **CLEAR** → próxima fase só após overlay.
4. Wipe → **DEFEAT** → fase anterior só após overlay.
