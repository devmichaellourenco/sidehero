# Achievements — sistema + Hero Out of the Side

Data: 2026-07-15

## Objetivo

Criar o sistema de Achievements (spec, agent, skill) e o primeiro achievement **Hero - Out of the Side** (clear `1-1` pela primeira vez), com Wow ao progredir/completar.

## O que foi feito

### Spec / agent / skill

| Arquivo | Função |
|---------|--------|
| `specs/achievements.spec.md` | Critérios de aceite e invariantes |
| `.cursor/agents/achievements.md` | Agente da feature |
| `.cursor/skills/achievements/SKILL.md` | Fluxo de implementação |
| `.cursor/rules/achievements.mdc` | Regras Cursor no glob da feature |
| `specs/README.md` / `.cursor/AGENTS.md` | Registro no mapa SDD |

### Domínio

| Arquivo | Função |
|---------|--------|
| `AchievementDefinition.ts` | Tipo de definição (evento, target, phaseId) |
| `AchievementCatalog.ts` | Catálogo declarativo + `hero_out_of_the_side` |
| `AchievementProgress.ts` | Progresso imutável por id |
| `AchievementService.ts` | Avança progresso em `phase_cleared` |

### Persistência / aplicação

| Arquivo | Função |
|---------|--------|
| `IAchievementProgressRepository.ts` | Contrato de load/save |
| `ChromeStorageAchievementRepository.ts` | Key `side_hero_achievements` |
| `MemoryAchievementRepository.ts` | Repo em memória para testes |
| `AchievementDto.ts` / `AchievementMapper.ts` | Updates para presentation |
| `TickGameUseCase.ts` | Após tick: fases novas → achievements |
| `GameApplication*` / DI | Injeta repo + `AchievementService` |
| `service-worker.ts` / `GameClientTypes.ts` | Propaga `achievementUpdates` no TICK |

### Wow / UI

| Arquivo | Função |
|---------|--------|
| `RewardMoment` kinds | `achievement_progress` / `achievement_unlocked` |
| `RewardMomentDetector` | Monta momentos a partir do DTO |
| `RewardPresentationController` | `celebrateAchievementUpdates` |
| `GameViewController` | Consome updates no tick |
| `WowMomentMapper` / policy | Banner ephemeral + celebração |
| `AssetCatalog` + `copy-assets.mjs` | Ícone `ui/achievement.png` |

### Testes (criar/atualizar — não executar automaticamente)

- `AchievementCatalog.test.ts`
- `AchievementService.test.ts`
- `RewardMomentDetector.test.ts` (momentos de achievement)
- `WowStripPresentation.test.ts`
- `TickGameResumeUseCase.test.ts` / `EquipGearRace.test.ts` (ctor atualizado)

## Como validar manualmente

1. Novo save ou save sem o achievement.
2. Limpar a fase `1-1`.
3. Esperar Wow **Achievement** com título `Hero - Out of the Side`.
4. Limpar `1-1` de novo: sem novo Wow do mesmo achievement.
5. Novo Jogo: progresso do achievement deve permanecer (storage separado).
