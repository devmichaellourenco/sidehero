# 081 — Sistema de Party (Fases B–E)

## Objetivo

Completar o sistema de party: desbloqueio de heróis, XP da reserva, use cases, gates de loadout e UI de edição.

## Fase B — Unlock Berserker/Paladino

| Arquivo | Alteração |
|---------|-----------|
| `HeroClass.ts` | Classes `berserker`, `paladin` |
| `Hero.ts`, `BaseAttributes.ts` | Stats e atributos base |
| `FeatureKey.ts` | Features `hero_unlock_*` |
| `UpgradeDefinition.ts` | Campo `unlockHeroClass`, branch `heroes` |
| `UpgradeCatalog.ts` | Melhorias de desbloqueio |
| `HeroUnlockService.ts` | Adiciona herói ao roster |
| `UpgradeService.ts` | Aplica unlock após compra |
| `AssetCatalog.ts`, `copy-assets.mjs` | Sprites berserker/paladin |
| `UpgradeBranchDto.ts` | Aba Heróis na árvore |

## Fase C — XP da reserva (50%)

| Arquivo | Alteração |
|---------|-----------|
| `PhaseCombatHandlers.ts` | `BenchXpPolicy` em `onBossDefeated` |

## Fase D — Use cases e gates

| Arquivo | Função |
|---------|--------|
| `PartyService.ts` | add/remove/reorder party |
| `AddToPartyUseCase.ts` | Adicionar à party |
| `RemoveFromPartyUseCase.ts` | Remover da party |
| `MovePartyMemberUseCase.ts` | Reordenar |
| `assertLoadoutEditable.ts` | Gate centralizado |
| Use cases equip/skills | Chamam gate antes de mutar |

## Fase E — UI

| Arquivo | Função |
|---------|--------|
| `PartyPanelPresentation.ts` | HTML slots + reserva |
| `HeroPanelRenderer.ts` | Renderiza party panel |
| `PartyFlow.ts` | Mensagens ADD/REMOVE/MOVE |
| `GameViewController.ts` | Delegação de cliques |
| `panel.css` | Estilos party |
| `GameStateDto` | `benchHeroes` |

## Regras de produto

- Berserker/Paladino entram na **reserva** (não na party ativa automaticamente)
- Party editável só com `!combat && !phaseRun`
- Reserva ganha **50%** do XP do boss
- Mínimo 1, máximo 3 heróis ativos

## Testes

```bash
npm test
```

## Status

Fases B–E concluídas.
