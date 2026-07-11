# Spec — Battle UI e UX do Painel

## Status

**Aceite:** 9/9 (100%) · auditoria 2026-07-07  
**Testes obrigatórios:** 8/8 presentes na suite

## Objetivo

Interface lateral Chrome: battle strip sempre visível, modais/drawers **sem cobrir** a batalha, feedback Wow e onboarding na primeira sessão.

## Critérios de aceite

- [x] Modais de inventário/heróis/melhorias limitados abaixo da combat bar (`--panel-sheet-top`)
- [x] Wow: celebrações centrais; inbox no header (✦); strip dismiss sem repetir
- [x] Todo card Wow exibe botão de rodapé (padrão **Entendi** para dispensar); o [×] só aparece em CTAs de ação no modo center
- [x] Baú flutuante na batalha quando pendente
- [x] Pausa loadout: banner compacto + overlay ACAMPAMENTO
- [x] Overlay de cena narrativa e celebrações Wow bloqueiam ticks até dispensar
- [x] Footer em ícones com badges (baús, pendências)
- [x] Onboarding contextual pausa entre dicas (`OnboardingPolicy`)
- [x] Barras de vida verdes; HP na strip
- [x] Botão **Apoiar** no header (direita) abre card de doação voluntária; link Stripe em nova aba; jogo permanece 100% gratuito

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Presentation | `panel/panel.html`, `panel.css`, `GameViewController`, `GameHudController` |
| Presentation | `BattleChromeLayout`, `WowBannerBuilder`, `WowBannerCtaPresentation`, `WowStripRenderer`, `RewardOrchestrator`, `OnboardingPolicy`, `DonationCardPresentation` |
| Presentation | `ModalStackController`, `BattleChestAffordanceController` |

## Invariantes

- Presentation consome `GameStateDto` — não importar entidades de domínio
- Tooltips e drag não quebram scroll de modais abertos
- Atualizar testes de políticas de apresentação após mudanças em markup (criar/atualizar arquivos — execução manual)

## Fora de escopo

- Tema claro / acessibilidade WCAG completa

## Testes obrigatórios

- [x] `BattleChromeLayout.test.ts`, `WowBannerBuilder.test.ts`, `WowBannerCtaPresentation.test.ts`, `WowStripRenderPolicy.test.ts`
- [x] `OnboardingPolicy.test.ts`, `IdleProgressSummary.test.ts`
- [x] `BattleLogRenderer.test.ts` — log incremental no painel
- [x] `CampaignMapPresentation.test.ts`, `CampaignTooltipBinder.test.ts` (campanha — ver também `combat-campaign.spec.md`)
- [x] `DonationCardPresentation.test.ts` — copy gratuito + link Stripe
