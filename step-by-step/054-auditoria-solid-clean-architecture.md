# 054 — Auditoria SOLID / Clean Architecture + Bloco D

## Nota global: **8,6 / 10**

Base profissional; débitos concentrados em `GameViewController`, `Hero` inchado e acoplamento presentation→infra.

## O que está correto

- Domain puro (zero imports externos)
- Presentation não importa domain
- 19 use cases coesos + `GameStatePresenter`
- Pipeline de combate modular
- Tooltips recentes seguem CA (mappers na application, HTML na presentation)

## Débitos priorizados

| Prioridade | Item |
|------------|------|
| Alta | God class `GameViewController` |
| Alta | `Hero` inchado (~341 linhas) |
| Alta | Presentation → Infrastructure direto |
| Alta | Heurística de gear duplicada na UI |

## Bloco D — implementado nesta sessão

### 1. Port `IGameClient`
- `application/ports/IGameClient.ts` + `GameClientTypes.ts`
- `ChromeGameClient` na infra
- `GameViewController` usa porta (injetável em testes)

### 2. Port `ITaskRunner`
- `GearMutationQueue` depende da interface
- `SerialTaskRunnerAdapter` na infra

### 3. Gear unificado
- `LoadoutOptimizer.previewUpgradeForGear` + `buildInventoryUpgradePreviews`
- `GearUpgradePreviewMapper` → `GameStateDto.gearUpgradeHints`
- `GearComparison.ts` só lê DTO e renderiza HTML

### 4. Split `GameViewController`
| Arquivo | Responsabilidade |
|---------|------------------|
| `HeroDetailFlow.ts` | Progressão, skills, ascensão |
| `ShopFlow.ts` | Loja e melhorias |
| `GearEquipFlow.ts` | Equipar, desequipar, otimizar |
| `ChestLootFlow.ts` | Baús e fila de loot |
| `ModalStackController.ts` | Render dos modais |
| `GameViewController.ts` | Orquestração (~760 linhas, era ~1262) |

## Próximo Bloco E (pendente)

- Extrair `HeroProgression` de `Hero`
- Mover wiring de `GameApplication` para DI
- Injetar `GearRequirementChecker` em `Hero.canEquip()`
- Mover `service-worker` para `infrastructure/entry/`
