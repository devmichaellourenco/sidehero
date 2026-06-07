# Step-by-Step — Fix erro de deserialização no service worker

## Data: 06/06/2025

## Problema

```
TypeError: Cannot convert undefined or null to object
background/service-worker.js:600
```

Causa: estado salvo no `chrome.storage` com schema antigo ou campos `equipment`/`experience` nulos. `Object.entries(null)` e `Object.values(null)` lançam esse erro durante o tick idle ou ao mapear heróis.

## Correções

| Arquivo | Alteração |
|---------|-----------|
| `GameStateMigration.ts` | Migração de heróis antigos (`stats`) e novos (`baseAttack`) |
| `ChromeStorageGameRepository.ts` | Deserialize defensivo + fallback para estado inicial |
| `Hero.ts` | `equipment ?? {}` em constructor e `sumGear` |
| `GameStateDto.ts` | `Object.entries(equipment ?? {})` |
| `service-worker.ts` | try/catch no alarm idle |

## Como aplicar

```bash
npm run build
```

Recarregar extensão em `chrome://extensions`.

Se o erro persistir por dados corrompidos, o repositório recria automaticamente um save novo na próxima falha de load.

## Fix adicional — ordem do construtor Hero

O getter `maxHealth` depende de `experience.level`, mas `currentHealth` era calculado **antes** de `experience` ser atribuído no construtor. Corrigido movendo a atribuição de `experience`/`equipment` para antes de `currentHealth`.

## Status

✅ Corrigido
