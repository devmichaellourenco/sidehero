# 056 — Bloco E: domínio e infraestrutura

## Implementado

### 1. `canHeroEquip` no `GearEquipService`
- Validação centralizada com `GearRequirementChecker`
- `Hero.canEquip()` removido
- `Hero.equip()` e `equipHeroWithGear()` usam `canHeroEquip`

### 2. `HeroProgression` extraído
- `HeroProgression.ts` — skills, ascensão, atributos alocados, pontos
- `Hero.ts` delega progressão; `HeroProps` flat mantido para persistência

### 3. Service worker em `infrastructure/entry/`
- `src/infrastructure/entry/service-worker.ts`
- `scripts/build.mjs` atualizado
- Removido `src/presentation/background/service-worker.ts`

### 4. DI centralizado
- `GameApplicationDependencies.ts` — contrato de dependências
- `createGameApplication()` instancia todos os serviços
- `GameApplication` recebe `(repository, deps)`

## Testes novos
- `GearEquipService.test.ts`
- `GearUpgradePreviewMapper.test.ts`

## Bloco F
Concluído em `057-bloco-f-solid-clean-architecture.md`.
