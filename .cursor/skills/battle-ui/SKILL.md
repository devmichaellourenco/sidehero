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
| Strip | `BattleStripRenderer`, `BattleActorCardPresentation`, `BattleFloatingTextController` (`Lv UP`); cena `.battle-strip` + deck `.battle-hud-deck` em `.battle-field`; TTA com countdown + tooltip (`ActionTimeBarPresentation`) |

| Pausa | Acampamento (`PauseForLoadout`) ≠ pausa de batalha (`PauseBattle` / `ResumeBattle`); Pausar/Continuar à **esquerda**; Acampamento à **direita**; Batalhar oculto (mapa → START → combate) |
| Hub | New game / pós-missão: `loadoutEditOpen` + overlay **Acampamento**; persistir flag sem exigir `phaseRestartOnResume` |
| Overlay Acampamento | `.battle-pause-overlay` com fundo **opaco** (noite + brilho de fogueira) cobrindo o `.battle-field` inteiro (`inset: 0`, cena + deck de HUD); a pausa de batalha (`--battle`) é translúcida e limitada à cena (`--battle-strip-height`) |
| Splash | `SplashScreenController` — ≥5s antes de tutorial/Wow/auto-battle no painel principal |
| Stage progress | Ver skill `stage-progress-bar` — timeline entre localização e a strip |
| Resultado / START | `BattleVictoryFlow` + `BattleStartFlow`; Continuar no deck; recompensas sem scroll; START antes do tick |
| Stats | Runa `battle_stats` → janela popup (padrão) ou sheet no side panel; botão Fixar/Desafixar |
| Pin/unpin menus | Todos `SystemsMenuId`: `SurfacePinPreference` + `OPEN/CLOSE_DETACHED_SURFACE` + `panel.html?detached=`; UI `SurfacePinPresentation` / `sheet-title-row`; campanha unpin → `MissionBattleStartRelay` |
| Modais | `ModalStackController`, `GameViewController`, `SystemsMenuNavigation`, `SystemsMenuIconPresentation` |
| Navegação menus | Faixa de ícones nos sheets (modal/drawer/Log/Stats) + seta v para fechar |
| Apoio | `DonationPromptController`, `DonationCardPresentation`, `DonationConfig` |
| Wow | `WowBannerBuilder`, `WowCelebrationController.syncPersistentBanners`, `WowStripRenderer` |
| Onboarding | `OnboardingPolicy` |
| Overlays exclusivos | `UiOverlayOrchestrator` — prioridade tutorial > cena > resultado de batalha > Wow; um ativo por vez, fila pelo restante |

## Coordenação

Tema de cores do chrome: skill `medieval-theme` (`specs/medieval-theme.spec.md`).

Overlays interruptivos (tutorial, cena narrativa, CLEAR/DEFEAT → recompensas, START, Wow central) passam pelo `UiOverlayOrchestrator` em `GameViewController` / `WowCelebrationController` (resultado/START bloqueiam ticks via flows). Pausa/Acampamento ficam fora (estado do jogador). Resultado terminal: Continuar → hub com overlay ACAMPAMENTO + mapa. Início de missão: mapa → START → combate.
## Testes de apresentação

Listados em `specs/battle-ui.spec.md` — criar ou atualizar ao mudar markup/CSS crítico (não executar `npm test` automaticamente).

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar
- **Não** criar pasta nem arquivos `step-by-step/`; fonte de verdade = specs, agents, skills, rules e testes
