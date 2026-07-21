---
name: battle-ui
description: Battle strip, modais, Wow e UX do painel Side Hero. Use para battle strip, modal, wow, onboarding, panel.css, GameViewController ou HUD.
---

# Battle UI e UX

## Spec

`specs/battle-ui.spec.md`

## Princípios

- Batalha sempre visível no topo
- Modais/drawers abaixo de `--panel-sheet-top` (`BattleChromeLayout`)
- Presentation só usa `GameStateDto`

## Áreas

| Área | Arquivos |
|------|----------|
| Strip | `BattleStripRenderer`, `BattleActorCardPresentation`, `BattleFloatingTextController` (`Lv UP`) |
| Stage progress | Ver skill `stage-progress-bar` — timeline entre localização e a strip |
| Pausa | Acampamento (`PauseForLoadout`) ≠ pausa de batalha (`PauseBattle` / `ResumeBattle`) |
| Stats | Runa `battle_stats` → menu Stats (`BattleStatsPanelController` + `BattleStatsPresentation` com abas) |
| Modais | `ModalStackController`, `GameViewController` |
| Apoio | `DonationPromptController`, `DonationCardPresentation`, `DonationConfig` |
| Wow | `WowBannerBuilder`, `WowCelebrationController.syncPersistentBanners`, `WowStripRenderer` |
| Onboarding | `OnboardingPolicy` |

## Coordenação

Tema de cores do chrome: skill `medieval-theme` (`specs/medieval-theme.spec.md`).

## Testes de apresentação

Listados em `specs/battle-ui.spec.md` — criar ou atualizar ao mudar markup/CSS crítico (não executar `npm test` automaticamente).

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar
- **Não** criar pasta nem arquivos `step-by-step/`; fonte de verdade = specs, agents, skills, rules e testes
