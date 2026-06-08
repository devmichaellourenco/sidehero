# 055 — Bloco D: SOLID / Clean Architecture

## Objetivo

Endereçar os 4 débitos de alta prioridade da auditoria 054 sem quebrar funcionalidades.

## Alterações

### Portas (application → infra)

| Porta | Implementação |
|-------|---------------|
| `IGameClient` | `ChromeGameClient` |
| `ITaskRunner` | `SerialTaskRunnerAdapter` |
| `GameClientTypes` | Tipos de mensagem movidos para application |

`GameMessageBus.sendGameMessage` mantido como deprecated wrapper.

### Gear unificado

- `LoadoutOptimizer.previewUpgradeForGear` — usa `GearRequirementChecker`
- `GameStateDto.gearUpgradeHints` — calculado no `GameStatePresenter`
- `GearComparison.ts` — apenas leitura de DTO + HTML

### Split GameViewController

| Arquivo | Linhas aprox. | Papel |
|---------|---------------|-------|
| `GameViewController.ts` | ~760 | Orquestração, render, delegação |
| `HeroDetailFlow.ts` | ~180 | Skills, ascensão, atributos |
| `ShopFlow.ts` | ~120 | Loja e melhorias |
| `GearEquipFlow.ts` | ~80 | Equipar/otimizar |
| `ChestLootFlow.ts` | ~150 | Baús e loot |
| `ModalStackController.ts` | ~200 | Render de modais |

## Testes novos

- `LoadoutOptimizer.test.ts` — preview com requisitos de level

## Próximo: Bloco E

- Slim `Hero` (extrair progressão)
- `Hero.canEquip` via serviço injetado
- Mover service-worker para `infrastructure/entry/`
