# Spec — Battle UI e UX do Painel

## Status

**Aceite:** 7/7 (100%) · auditoria 2026-07-03  
**Testes obrigatórios:** 5/5 presentes na suite

## Objetivo

Interface lateral Chrome: battle strip sempre visível, modais/drawers **sem cobrir** a batalha, feedback Wow e onboarding na primeira sessão.

## Critérios de aceite

- [x] Modais de inventário/heróis/melhorias limitados abaixo da combat bar (`--panel-sheet-top`)
- [x] Wow: celebrações centrais; inbox no header (✦); strip dismiss sem repetir
- [x] Baú flutuante na batalha quando pendente
- [x] Pausa loadout: banner compacto + overlay ACAMPAMENTO
- [x] Footer em ícones com badges (baús, pendências)
- [x] Onboarding contextual pausa entre dicas (`OnboardingPolicy`)
- [x] Barras de vida verdes; HP na strip

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Presentation | `panel/panel.html`, `panel.css`, `GameViewController`, `GameHudController` |
| Presentation | `BattleChromeLayout`, `WowBannerBuilder`, `RewardOrchestrator`, `OnboardingPolicy` |
| Presentation | `ModalStackController`, `BattleChestAffordanceController` |

## Invariantes

- Presentation consome `GameStateDto` — não importar entidades de domínio
- Tooltips e drag não quebram scroll de modais abertos
- Atualizar testes de políticas de apresentação após mudanças em markup (criar/atualizar arquivos — execução manual)

## Fora de escopo

- Tema claro / acessibilidade WCAG completa

## Testes obrigatórios

- [x] `BattleChromeLayout.test.ts`, `WowBannerBuilder.test.ts`, `WowStripRenderPolicy.test.ts`
- [x] `OnboardingPolicy.test.ts`, `IdleProgressSummary.test.ts`
- [x] Ver `step-by-step/144-testes-apresentacao.md`
