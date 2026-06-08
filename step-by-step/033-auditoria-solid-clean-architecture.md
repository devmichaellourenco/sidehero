# 033 — Auditoria SOLID e Clean Architecture

## Status: análise concluída (pré-implementação Fase 1+)

## Escopo

Revisão do Side Hero antes de implementar skills, atributos e ascensão — para garantir que a base suporte evolução sem refatoração massiva.

---

## Mapa de camadas atual

```
presentation/     → UI, service-worker, content scripts
application/      → use cases, DTOs, mappers, app services
domain/           → entities, value objects, domain services, repositório (interface)
infrastructure/   → Chrome storage, messaging, DI, migração
```

**Regra de dependência (Clean Architecture):** camadas externas dependem das internas. O domínio não conhece framework nem UI.

---

## O que está correto ✅

| Prática | Onde |
|---------|------|
| Domínio isolado de infra/UI | `domain/` não importa `application/`, `infrastructure/` nem `presentation/` |
| Interface de repositório no domínio | `IGameStateRepository` |
| Entidades imutáveis | `GameState.with*()`, `Hero` com `toProps()` |
| Value objects | `Experience`, `Gold`, `Stats`, `Attributes` |
| Use cases por ação | `TickGameUseCase`, `EquipGearUseCase`, etc. |
| Composition root | `infrastructure/di/createGameApplication.ts` |
| DTOs como contrato de saída | `GameStateDto` entre service-worker e painel |
| Catálogo declarativo | `UpgradeCatalog`, `RequirementEvaluator` — bom modelo para skills |
| Gates no servidor | `OpenAllChestsUseCase`, `EquipBestLoadoutUseCase` validam feature antes de executar |

---

## Violações e riscos ⚠️

### 1. Presentation → Domain (viola regra de dependência)

| Arquivo | Importa do domínio |
|---------|---------------------|
| `FeatureGate.ts` | `FeatureKey`, `getFeatureLevel`, `UpgradeLevels` |
| `GameViewController.ts` | `chestProgress` de `CombatRules` |
| `UpgradeTreeModalRenderer.ts` | `UpgradeBranch` |
| `AssetCatalog.ts` | `EnemyType` |

**Impacto:** UI acoplada a tipos e regras internas. Mudar domínio quebra renderers.

**Correção:** Presentation só consome `application/dto`. Regras de exibição derivadas de flags no DTO (`features`, `chestProgress`, etc.) ou de um `ApplicationReadModel`.

---

### 2. Application DTOs importam tipos do domínio

`GameStateDto.ts` importa `Attributes`, `UpgradeLevels`, entidades para mapear.

**Impacto:** DTO deixa de ser camada anti-corrupção; vira extensão do domínio.

**Correção:** Interfaces próprias em `application/dto/` (ex.: `AttributesDto { str, dex, int }`). Mappers convertem domínio → DTO.

---

### 3. `GameViewController` — God Object (~900 linhas)

Responsabilidades misturadas:
- Timers (auto-battle, refresh)
- Stack de modais
- Fila de loot
- Preferências locais
- Orquestração de shop/upgrades
- Binding de eventos

**Viola:** SRP, dificulta OCP ao adicionar abas Atributos/Skills/Classe.

**Correção:** Extrair controllers por contexto (`BattleFlowController`, `ModalOrchestrator`, `HeroProgressionController`).

---

### 4. `CombatService` — múltiplas responsabilidades

Um único `executeTick` faz:
- Combate
- Recompensas (ouro, XP)
- Avanço de stage
- Drop de baú

**Viola:** SRP. Skills/magia/cura vão aumentar complexidade aqui.

**Correção:** Separar `CombatResolver`, `BattleRewardService`, `StageProgressionService` — ou pipeline de handlers.

---

### 5. Duplicação de lógica (DRY / OCP)

| Duplicação | Onde |
|------------|------|
| Abrir baú | `OpenChestUseCase` vs `OpenAllChestsUseCase` |
| Mapear árvore de upgrades | `GetUpgradeTreeUseCase` vs `PurchaseUpgradeUseCase` |
| Checagem de feature | `FeatureGate` (UI) vs `getFeatureLevel` (use cases) |
| `mapPersistedGameState` + `UpgradeService` | Todos os use cases só para `purchasableUpgradeCount` |

**Correção:** `ChestService.openOne/openAll`, `UpgradeTreeMapper`, `FeatureAccessPolicy` único no domínio.

---

### 6. `UpgradeService` acoplado a todos os use cases (ISP)

Use cases que não lidam com upgrades (`EquipGearUseCase`, `OpenChestUseCase`) injetam `UpgradeService` apenas para enriquecer o DTO.

**Correção:** `GameStatePresenter` ou `EnrichGameStateDto` separado; use cases retornam estado mínimo quando não precisam do enriquecimento.

---

### 7. Dependência circular emergente

```
Hero.ts → BaseAttributes.ts → Hero.ts (HeroClass)
```

**Correção imediata:** extrair `HeroClass` para `domain/entities/HeroClass.ts`.

---

### 8. Lógica de jogo na camada Application

`LoadoutPlanner`, `GearEquipService` — regras de otimização de equipamento.

**Debate:** Em Clean Architecture estrita, pertencem ao domínio (`domain/services/LoadoutOptimizer`).

**Recomendação:** Mover para domínio antes de adicionar requisitos STR/DEX/INT em gear.

---

### 9. Sem testes automatizados

Nenhum `*.test.ts` / `*.spec.ts`.

**Impacto:** Refatorar SOLID sem rede de segurança é arriscado.

**Correção mínima:** Testes de domínio (`Hero`, `RequirementEvaluator`, futuro `SkillService`).

---

### 10. `service-worker.ts` na pasta presentation

Funciona como **adapter/entry point** — mais adequado em `infrastructure/entry/` ou `infrastructure/messaging/`.

Baixa prioridade; não bloqueia progressão.

---

## Avaliação SOLID (resumo)

| Princípio | Nota | Comentário |
|-----------|------|------------|
| **S** — Single Responsibility | 6/10 | God controllers/services |
| **O** — Open/Closed | 7/10 | Catálogos ajudam; switches crescem (message bus) |
| **L** — Liskov | 8/10 | Pouca herança — imutabilidade consistente |
| **I** — Interface Segregation | 5/10 | Só repositório tem interface; UpgradeService inchado |
| **D** — Dependency Inversion | 6/10 | Use cases → interfaces OK; serviços concretos sem port |

**Clean Architecture geral: 7/10** — estrutura de pastas correta, domínio limpo, mas vazamento presentation↔domain e DTOs frágeis.

---

## Plano de correção (antes / durante progressão)

### Bloco A — Obrigatório antes da Fase 1 (baixo risco)

- [ ] Extrair `HeroClass.ts` (quebra ciclo `Hero` ↔ `BaseAttributes`)
- [ ] Criar `AttributesDto` em application (DTO não importa domínio)
- [ ] Criar `domain/policies/FeatureAccessPolicy.ts` — única fonte de verdade para gates
- [ ] Enriquecer `GameStateDto` com `chestProgress`, `featureFlags` — remover imports domain da presentation
- [ ] Mover `FeatureGate` → `application/policies/FeatureAccessPolicy.ts` (ou consumir só DTO)

### Bloco B — Durante Fase 1–2 (progressão)

- [ ] `domain/progression/SkillService.ts` espelhando padrão de `UpgradeService`, sem tipos de UI
- [ ] `domain/progression/ProgressionRequirementEvaluator.ts` — generalizar `RequirementEvaluator`
- [ ] `domain/services/GearRequirementChecker.ts` + mover `LoadoutPlanner` para domínio
- [ ] Use cases finos: `SpendImprovementPointUseCase`, `ActivateSkillUseCase`
- [ ] `HeroProgressionMapper.ts` — domínio → DTOs de skills/atributos
- [ ] `HeroDetailModal` com sub-renderers por aba (SRP)

### Bloco C — Refatoração estrutural (sprint dedicado)

- [ ] Dividir `GameViewController`
- [ ] `ChestService` unificar abertura de baús
- [ ] `UpgradeTreeMapper` eliminar duplicação
- [ ] `CombatPipeline` antes da Fase 3 (skills no combate)
- [ ] Testes unitários de domínio
- [ ] Interfaces opcionais: `ICombatService`, `ILootService` (se mock necessário)

---

## Diretrizes para o módulo `progression/` (novo)

Para não repetir débitos:

1. **Catálogo** (`SkillCatalog`) — só dados, sem lógica
2. **Serviço** (`SkillService`) — regras de alocação, ativação, validação
3. **Evaluator** — requisitos reutilizável (level, attr, skill rank, ascension)
4. **Sem tipos de UI** no domínio (`NodeStatus` ok no application mapper)
5. **Presentation** recebe `SkillNodeDto[]`, nunca `SkillDefinition`
6. **Combate** consome `CombatSkillResolver` isolado — não inflar `Hero` com lógica de skill

---

## Conclusão

O projeto **já segue a espinha dorsal** de Clean Architecture (camadas, use cases, domínio puro, repositório abstrato). Os problemas são **vazamentos de dependência** (UI→domínio), **objetos grandes** e **duplicação** — típicos de MVP que cresceu rápido.

**Recomendação:** executar **Bloco A** (~1 sessão) antes da Fase 1 de progressão; aplicar **Bloco B** junto com cada fase; agendar **Bloco C** antes da Fase 3 (combate com skills).

Isso garante que skills/atributos/ascensão entrem em uma base profissional e extensível.
