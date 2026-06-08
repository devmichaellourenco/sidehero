# 046 — Correção: equipar itens não persistia (race condition)

## Status: concluída

## Sintoma

A ação de equipar parou de funcionar em todos os pontos (slot do herói, inventário, loot, otimizar equipe). O clique parecia não surtir efeito ou o item voltava ao inventário logo depois.

## Causa raiz

O service worker processava mensagens **em paralelo** (`TICK`, `EQUIP_GEAR`, alarm idle, etc.). Cada use case faz `load → mutate → save` sem lock:

1. `EQUIP_GEAR` carrega estado v1, equipa, começa `save`
2. `TICK` (auto-batalha ou alarm) carrega o mesmo v1, avança combate, salva v2
3. O `save` do equip grava v3 **ou** o tick sobrescreve o equip — lost update

Com auto-batalha ativa (corrigida no step 040) e ticks mais frequentes após o refactor de combate, a corrida ficou constante e o equip parecia 100% quebrado.

## Correção

| Arquivo | Alteração |
|---------|-----------|
| `SerialTaskRunner.ts` | Fila async que serializa tarefas |
| `service-worker.ts` | Todas as mensagens + tick idle passam por `stateMutations.run()` |
| `SerialTaskRunner.test.ts` | Garante ordem sequencial |
| `EquipGearRace.test.ts` | Reproduz corrida e valida fila serial |
| `EquipGearUseCase.test.ts` | Smoke do fluxo de equip |

## Como validar

1. `npm run build` e recarregar extensão
2. Ligar **auto-batalha** em Configurações
3. Abrir inventário → Equipar → escolher herói → item permanece equipado + toast
4. Clicar slot no card do herói → equipar → persiste
5. Loot de baú → Equipar → persiste
6. Otimizar equipe → itens equipados corretamente
