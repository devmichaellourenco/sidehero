# 057 — Bloco F: requirements unificados e interfaces de progressão

## Implementado

### 1. Evaluators em `domain/requirements/`
| Arquivo | Substitui |
|---------|-----------|
| `EvaluatedRequirement.ts` | Tipo compartilhado `{ label, met }` |
| `HeroRequirementEvaluator.ts` | `ProgressionRequirementEvaluator` |
| `UpgradeRequirementEvaluator.ts` | `upgrades/RequirementEvaluator` |

Consumidores atualizados: `SkillService`, `ClassAscensionService`, `UpgradeService`.

### 2. Interfaces de progressão
| Interface | Implementação |
|-----------|---------------|
| `ISkillService` | `SkillService` |
| `IClassAscensionService` | `ClassAscensionService` |

Use cases e `GameApplicationDependencies` dependem das interfaces.

### 3. Remoção de código deprecated
- `GameStateDtoMapper.ts` removido (uso substituído por `GameStatePresenter`)
- `ProgressionRequirementEvaluator.ts` removido
- `RequirementEvaluator.ts` (upgrades) removido

## Testes
- `HeroRequirementEvaluator.test.ts`
- `UpgradeRequirementEvaluator.test.ts`
