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
| Strip | `BattleStripRenderer`, `BattleActorCardPresentation` |
| Modais | `ModalStackController`, `GameViewController` |
| Wow | `WowBannerBuilder`, `RewardOrchestrator` |
| Onboarding | `OnboardingPolicy` |

## Testes de apresentação

Ver `step-by-step/144-testes-apresentacao.md` — criar ou atualizar testes ao mudar markup/CSS crítico (não executar `npm test` automaticamente).

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar

## Referência UX

`step-by-step/095-roadmap-ux-implementacao.md`
