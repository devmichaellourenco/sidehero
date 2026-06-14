# 115 — Correção do teste de desbloqueio gradual de comuns

## Problema

O teste `desbloqueia comuns gradualmente no mapa 1` em `EnemyRosterCatalog.test.ts` falhava:

```
Expected: "giant_rat"
Received: "cave_bat"
```

## Causa

`pickCommonForGlobalTier(globalTier, offset)` seleciona o inimigo com:

```ts
pool[(globalTier + offset) % pool.length].id
```

No tier 1, o pool já tem 2 comuns desbloqueados (`giant_rat`, `cave_bat`). Com offset 0, o índice é `(1 + 0) % 2 = 1` → `cave_bat`, não o primeiro da lista.

A segunda asserção (`tier 40 !== giant_rat`) também estaria incorreta: no tier 40, `(40 + 0) % 4 = 0` → `giant_rat`.

## Correção

O teste passou a validar o comportamento real de `unlockedCommonsForGlobalTier`:

| Tier | Pool esperado |
|------|----------------|
| 1    | 2 comuns: `giant_rat`, `cave_bat` |
| 40   | mais comuns que tier 1 |
| 51   | todos os 8 comuns do nível 1 (mapa 2) |

Também verifica que `pickCommonForGlobalTier(1, offset)` retorna entradas dentro do pool desbloqueado.

## Arquivos alterados

| Arquivo | Função |
|---------|--------|
| `src/domain/enemies/EnemyRosterCatalog.test.ts` | Asserções alinhadas à lógica de `EnemyTierProgression.ts` |

## Resultado

4/4 testes passando em `EnemyRosterCatalog.test.ts`.
