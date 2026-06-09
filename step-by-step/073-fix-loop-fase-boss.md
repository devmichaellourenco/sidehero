# 073 — Fix loop fase 1-2 após derrotar boss

## Problema

Ao vencer o boss da fase **1-2**, o jogo voltava para **1-2 wave 1/2** em loop infinito, sem avançar para **1-3**.

## Causa raiz

1. `PhaseCombatHandlers.onBossDefeated()` marcava a fase como cleared e desbloqueava `1-3`, mas **não atualizava** `campaignProgress.selectedPhaseId`.
2. Após vitória, `phaseRun` e `combat` eram definidos como `null`.
3. No próximo tick, `CombatTurnPhase.execute()` detectava `phaseRun === null` e reiniciava automaticamente a fase em `selectedPhaseId` — que ainda era `1-2`.

```typescript
// CombatTurnPhase.ts — reinício automático
if (!workingState.phaseRun) {
  const phaseRun = PhaseRun.start(workingState.campaignProgress.selectedPhaseId);
  // ...
}
```

## Correção

Em `PhaseCombatHandlers.onBossDefeated()`, após `markCleared`, quando a fase **não** é finale da temporada e possui unlocks, avança `selectedPhaseId` para a primeira fase desbloqueada:

```typescript
} else if (phase.unlocks.length > 0) {
  progress = progress.withSelectedPhase(phase.unlocks[0]);
}
```

## Arquivos alterados

| Arquivo | Função |
|---------|--------|
| `src/domain/campaign/PhaseCombatHandlers.ts` | Auto-seleciona próxima fase após vitória no boss |
| `src/domain/campaign/PhaseCombatHandlers.test.ts` | Teste: boss 1-2 → selectedPhaseId vira 1-3 |
| `src/domain/services/combat/CombatTurnPhase.test.ts` | Teste integrado: tick após vitória inicia fase 1-3 |

## Testes adicionados

1. **avança selectedPhaseId para próxima fase ao derrotar boss** — valida cleared, unlock e seleção.
2. **inicia fase 1-3 após derrotar boss da 1-2 no tick seguinte** — reproduz o cenário do bug e confirma que não reinicia 1-2.

## Comportamento esperado pós-fix

- Derrotar boss de `1-2` → log de conclusão, XP, ouro, fase `1-3` desbloqueada e selecionada.
- Próximo tick → inicia `1-3` wave 1/N (não retorna a `1-2`).
- Boss final da temporada (`10-50`) → não altera `selectedPhaseId` (permanece na finale).
