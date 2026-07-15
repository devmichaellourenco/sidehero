# Spec — Achievements

## Status

**Aceite:** 7/7 (100%)  
**Testes obrigatórios:** 4/4

## Objetivo

Registrar progresso em conquistas persistentes (estilo TaskBar Hero / Steam). Eventos do jogo avançam missões; ao atingir 100% a conquista é desbloqueada. Progresso e unlock disparam celebração Wow. Painel exibe lista consultável.

## Critérios de aceite

- [x] Catálogo declarativo de achievements (`AchievementCatalog`)
- [x] Progresso persistente fora do `GameState` (sobrevive a Novo Jogo)
- [x] Eventos de jogo avançam progresso (`AchievementService`)
- [x] Primeiro achievement: **Hero - Out of the Side** — Clear stage 1-1 for the first time
- [x] Wow ao progredir e ao completar achievement
- [x] Botão no menu do painel (ícone book open) abre a tela de achievements
- [x] Tela/modal lista conquistas com progresso e estado desbloqueado

## Escopo v1

Um único achievement binary (0→1). UI de lista somente-leitura (sem recompensas materiais).

Referência conceitual: [TaskBar Hero Achievements](https://taskbarhero.wiki/achievements) (`Hero Out of the Taskbar` → adaptação Side Hero).

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Domain | `src/domain/achievements/*` |
| Application | `TickGameUseCase`, `GetAchievementsUseCase`, DTOs |
| Infrastructure | `ChromeStorageAchievementRepository`, DI, SW `GET_ACHIEVEMENTS` |
| Presentation | Botão HUD, `AchievementsModalRenderer`, Wow |

## Invariantes

- Save `side_hero_achievements` separado de `side_hero_game_state` e meta
- Achievement já completo não re-dispara progresso/Wow
- `domain/` não importa presentation; presentation não importa entidades de achievement — só DTOs

## Fora de escopo

- Remates Steam/cloud
- Recompensas materiais por unlock

## Testes obrigatórios

- [x] `AchievementService.test.ts`
- [x] `AchievementCatalog.test.ts`
- [x] `RewardMomentDetector.test.ts` (momentos de achievement)
- [x] `AchievementsModalRenderer.test.ts`
