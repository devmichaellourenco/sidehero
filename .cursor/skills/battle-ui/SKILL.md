---
name: battle-ui
description: Battle strip, modais, Wow e UX do painel Side Hero. Use para battle strip, modal, wow, onboarding, panel.css, GameViewController ou HUD.
---

# Battle UI e UX

## Spec

`specs/battle-ui.spec.md`

## Princípios

- Batalha e barra Pausar/Acampamento sempre visíveis no topo
- Modais/drawers abaixo de `--panel-sheet-top` (`BattleChromeLayout` — base da `.battle-combat-bar`)
- Presentation só usa `GameStateDto`

## Áreas

| Área | Arquivos |
|------|----------|
| Strip | `BattleStripRenderer`, `BattleActorCardPresentation`, `BattleFloatingTextController` (`Lv UP`) |
| Stage progress | Ver skill `stage-progress-bar` — timeline entre localização e a strip |
| Pausa | Acampamento (`PauseForLoadout`) ≠ pausa de batalha (`PauseBattle` / `ResumeBattle`); Pausar/Continuar à **esquerda**, Acampamento/Batalhar à **direita** (mesma linha) |
| Stats | Runa `battle_stats` → janela popup (padrão) ou sheet no side panel; botão Fixar/Desafixar |
| Pin/unpin menus | Todos `SystemsMenuId`: `SurfacePinPreference` + `OPEN/CLOSE_DETACHED_SURFACE` + `panel.html?detached=`; UI `SurfacePinPresentation` / `sheet-title-row` |
| Modais | `ModalStackController`, `GameViewController`, `SystemsMenuNavigation`, `SystemsMenuIconPresentation` |
| Navegação menus | Faixa de ícones nos sheets (modal/drawer/Log/Stats) + seta v para fechar |
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
