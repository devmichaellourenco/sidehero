# 034 — Refatoração SOLID e Clean Architecture (Blocos A, B, C)

## Status: concluída

## Bloco A — Fundação de camadas

### Extração de tipos
- `domain/entities/HeroClass.ts` — quebra ciclo `Hero` ↔ `BaseAttributes`

### DTOs desacoplados do domínio
- `application/dto/AttributesDto.ts`
- `application/dto/FeatureFlagsDto.ts`
- `application/dto/UpgradeBranchDto.ts`
- `GameStateDto.ts` — sem imports de domínio; inclui `featureFlags` e `chestProgress`

### Política única de features
- `domain/policies/FeatureAccessPolicy.ts` — fonte de verdade para gates
- `application/mappers/FeatureFlagsMapper.ts`
- `presentation/helpers/FeatureFlagsHelper.ts` — UI lê só DTO

### Apresentação de estado
- `application/presenters/GameStatePresenter.ts` — substitui `mapPersistedGameState` + `UpgradeService` em todos os use cases
- `application/mappers/HeroDtoMapper.ts`, `GearDtoMapper.ts`, `ChestProgressMapper.ts`, `UpgradeTreeMapper.ts`

### Removido
- `presentation/components/FeatureGate.ts` — UI não importa mais `domain/`

---

## Bloco B — Progressão e domínio

### Skills e requisitos
- `domain/progression/ProgressionRequirement.ts`
- `domain/progression/ProgressionRequirementEvaluator.ts`
- `domain/progression/SkillDefinition.ts`, `SkillCatalog.ts`, `SkillService.ts`

### Equipamento
- `Gear.requirements` + `GearRequirementChecker.ts`
- `LootService` gera requisitos via `inferRequirements`
- `Hero.canEquip()` / validação em `equip()`

### Serviços movidos para domínio
- `domain/services/GearEquipService.ts` (era `application/services/`)
- `domain/services/LoadoutOptimizer.ts` (era `LoadoutPlanner`)

### Use cases novos
- `SpendImprovementPointUseCase`
- `GetHeroSkillTreeUseCase`
- `ActivateSkillUseCase` / `DeactivateSkillUseCase`

### UI — modal do herói com abas
- `hero-detail/HeroSheetTabRenderer.ts`
- `hero-detail/HeroAttributesTabRenderer.ts`
- `hero-detail/HeroSkillsTabRenderer.ts`
- `hero-detail/HeroClassTabRenderer.ts`
- `HeroDetailModalRenderer.ts` — orquestra abas Ficha | Atributos | Skills | Classe

### Message bus
- `SPEND_IMPROVEMENT_POINT`, `GET_HERO_SKILL_TREE`, `ACTIVATE_SKILL`, `DEACTIVATE_SKILL`

---

## Bloco C — Estrutura e testes

### Split do GameViewController
- `presentation/controllers/AutoBattleController.ts`
- `presentation/controllers/GamePreferencesController.ts`
- `presentation/controllers/LootFlowController.ts`
- `presentation/controllers/GameHudController.ts`
- `GameViewController.ts` — orquestrador mais fino

### Serviços de domínio
- `domain/services/ChestService.ts` — unifica abrir 1 / todos os baús
- `domain/services/combat/CombatPipeline.ts` + fases (`HeroAttackPhase`, `EnemyCounterPhase`, `VictoryRewardPhase`)
- `domain/services/ICombatService.ts`, `ILootService.ts`

### Testes (vitest)
- `FeatureAccessPolicy.test.ts`
- `GearRequirementChecker.test.ts`
- `ProgressionRequirementEvaluator.test.ts`
- Script: `npm test`

---

## Arquitetura resultante

```
presentation/     → DTOs + helpers (sem domain/)
application/      → use cases, presenters, mappers
domain/           → entities, policies, progression, services
infrastructure/   → storage, messaging, DI
```

## Próximo passo sugerido

Fase 3 do plano 031: integrar skills no `CombatPipeline` (magia, cura automática).
