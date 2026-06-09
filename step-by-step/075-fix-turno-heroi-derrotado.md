# 075 — Fix turno travado em herói derrotado

## Problema

Quando um herói morria durante a luta, o combate ficava travado nele: o turno não passava para o próximo combatente e a UI mantinha o herói derrotado como ativo.

## Causa raiz

`getNextLivingActor()` avançava internamente o `turnIndex` ao pular heróis mortos, mas quando não encontrava ator vivo retornava `null` **sem devolver** o `CombatState` atualizado.

O `execute()` persistia o combate **antigo** (ainda apontando para o herói morto):

```typescript
if (!active) {
  return { state: workingState.withCombat(combat), ... }; // combat desatualizado
}
```

Resultado: loop infinito no mesmo `turnIndex`, sem ação e sem rebuild da fila.

## Correção

Substituído `getNextLivingActor` por `resolveTurnActor`:

1. Sempre retorna o `CombatState` após os avanços de skip.
2. Chama `ensureTurnQueue` dentro do loop para reconstruir a rodada quando a fila esvazia.
3. Se não houver ator vivo e todos os heróis estiverem mortos, dispara `onPhaseWipe`.

## Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `CombatTurnPhase.ts` | `resolveTurnActor` + wipe quando fila esgota sem ator |
| `CombatTurnPhase.test.ts` | 2 testes reproduzindo skip de herói morto |

## Validação

```bash
npm test
```
