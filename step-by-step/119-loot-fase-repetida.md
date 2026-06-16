# 119 — Recompensas reduzidas em fases repetidas

## Problema

Jogador podia refazer fases já cleared e receber baús/gear novamente.

## Solução

`PhaseLootPolicy` distingue **primeira conclusão** vs **repetição**:

| Recompensa | 1ª vez | Repetição |
|------------|--------|-----------|
| Ouro | 100% | **50%** |
| XP (party + reserva) | 100% | **75%** |
| Baús | Sim | **Não** |
| Avanço `selectedPhaseId` | Sim | **Não** |

Multiplicadores: `REPLAY_GOLD_MULTIPLIER = 0.5`, `REPLAY_XP_MULTIPLIER = 0.75`.

## Arquivos

| Arquivo | Função |
|---------|--------|
| `PhaseLootPolicy.ts` | `scalePhaseGold`, `scalePhaseXp`, `grantsPhaseChests` |
| `PhaseCombatHandlers.ts` | Aplica escalas em waves e boss |

## Validação

```bash
npm test
```
