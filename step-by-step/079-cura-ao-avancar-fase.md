# 079 — Cura da party ao avançar de fase

## Problema

Ao derrotar o boss e concluir uma fase, os heróis mantinham a vida atual e entravam na próxima fase feridos.

## Correção

Em `PhaseCombatHandlers.onBossDefeated()`, após conceder XP, a party recebe `healFull()` antes de iniciar a próxima fase.

- **Vida:** restaurada para `maxHealth` (inclui level-up no mesmo tick)
- **Recursos de combate** (cooldowns, buffs/debuffs): já eram limpos ao zerar `combat` e `phaseRun`; a nova fase inicia combate fresco via `CombatState.start`

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `PhaseCombatHandlers.ts` | `recoveredHeroes` com `gainExperience` + `healFull` |
| `PhaseCombatHandlers.test.ts` | Teste de cura ao vencer boss |

## Validação

```bash
npm test
```
