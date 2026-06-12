# 099 — Fix pausa + campanha e CLEAR/WARNING

## Status: concluída

## 1. Continuar após trocar fase na campanha (pausa)

**Problema:** Pausar → Campanha → escolher outra fase → Continuar gerava *"Não há pausa ativa para reiniciar a fase"*; botões Pausar/Continuar ficavam visíveis e o jogo não avançava.

**Causa:** `SelectPhaseUseCase` zera `phaseRun` ao trocar fase, mas mantém `loadoutEditOpen` e `phaseRestartOnResume`. `TickGameUseCase` exigia `phaseRun` para continuar.

**Correção:**
- `PhaseCombatHandlers.startSelectedPhaseFromPause()` — cura party e inicia a fase selecionada na wave 1.
- `TickGameUseCase` — ao continuar pausa: se há `phaseRun`, reinicia a fase atual; se não (campanha alterada), inicia a fase selecionada.

## 2. CLEAR e WARNING invertidos

**Problema:** CLEAR aparecia no boss e WARNING na wave normal.

**Referência Taskbar Hero:**
- **WARNING** (vermelho) — ao concluir wave e **ir para o boss**
- **CLEAR** (azul) — ao concluir boss/fase e seguir

**Correção:**
- Nova variant `boss-approach` quando a próxima wave é boss.
- `phase-clear` (boss derrotado) → overlay **CLEAR** azul.
- `boss-approach` → overlay **WARNING** vermelho.
- `wave-clear` (wave intermediária sem boss à frente) → **CLEAR** azul.

## Arquivos alterados

| Arquivo | Função |
|---------|--------|
| `TickGameUseCase.ts` | Retomada com ou sem `phaseRun` |
| `PhaseCombatHandlers.ts` | `startSelectedPhaseFromPause` |
| `BattleVictoryDetector.ts` | Variant `boss-approach` |
| `BattleVictoryOverlayRenderer.ts` | Mapeamento WARNING/CLEAR corrigido |
| Testes em `TickGameResumeUseCase.test.ts` e `BattleVictoryDetector.test.ts` |
