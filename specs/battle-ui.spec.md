# Spec — Battle UI e UX do Painel

## Status

**Aceite:** 12/12 (100%) · auditoria 2026-07-23  
**Testes obrigatórios:** 11/11 presentes na suite

## Objetivo

Interface lateral Chrome: battle strip sempre visível, modais/drawers **sem cobrir** a batalha, feedback Wow e onboarding na primeira sessão.

## Critérios de aceite

- [x] Modais de inventário/heróis/melhorias limitados abaixo da combat bar (`--panel-sheet-top`)
- [x] Wow: celebrações centrais; inbox no header (✦) com pendências persistentes (`buildPersistentWowBanners` + `syncPersistentBanners`); strip dismiss sem repetir
- [x] Overlay de derrota sugere contramedida (resist elemental quando detectável)
- [x] Todo card Wow exibe botão de rodapé (padrão **Entendi** para dispensar); o [×] só aparece em CTAs de ação no modo center
- [x] Baú flutuante na batalha quando pendente
- [x] Pausa loadout: banner compacto + overlay ACAMPAMENTO
- [x] Pausa de batalha (≠ acampamento): overlay PAUSA + Continuar; stats em menu Runas (`battle_stats`)
- [x] Menu **Stats** (runa): painel flutuante como o Log, atualiza em tempo real (e na pausa); abas Geral | Dano | Cura | Sofrido | Mitigado | Críticos (ranking com barras por herói)
- [x] Overlay de cena narrativa e celebrações Wow bloqueiam ticks até dispensar
- [x] Footer separa sistemas que abrem telas de ações imediatas: **Baús** no grid; **Abrir baú**, **Abrir todos** e **Otimizar equipe** na faixa de ações rápidas
- [x] Sheets de sistema (modal, hero drawer, Log, Stats): seta para baixo fecha; faixa de ícones dos menus disponíveis (locks/acampamento) via `SystemsMenuNavigation` + `SystemsMenuIconPresentation`
- [x] Onboarding contextual pausa entre dicas (`OnboardingPolicy`)
- [x] Barras de vida verdes; HP na strip
- [x] Botão **Apoiar** no header (direita) abre card de doação voluntária; link Stripe em nova aba; jogo permanece 100% gratuito
- [x] Heróis / Formação / Loja / Inventário / Baús / Otimizar equipe só aparecem no **acampamento** (`canEditParty`)

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Presentation | `panel/panel.html`, `panel.css`, `GameViewController`, `GameHudController` |
| Presentation | `BattleChromeLayout`, `WowBannerBuilder`, `WowBannerCtaPresentation`, `WowStripRenderer`, `RewardOrchestrator`, `OnboardingPolicy`, `DonationCardPresentation` |
| Presentation | `ModalStackController`, `SystemsMenuNavigation`, `BattleChestAffordanceController` |

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
- [x] `GameHudController.test.ts` — botões de acampamento ocultos fora de `canEditParty`; Pausar/Continuar/Detalhes na pausa de batalha
- [x] `BattleStatsPresentation.test.ts` — painel de estatísticas da batalha pausada
- [x] `SystemsMenuNavigation.test.ts` — disponibilidade por camp/unlock + wrap prev/next

## Relacionado

- [`stage-progress-bar.spec.md`](stage-progress-bar.spec.md) — timeline entre localização e a battle strip
- [`combat-campaign.spec.md`](combat-campaign.spec.md) — waves / fase ativa
- [`medieval-theme.spec.md`](medieval-theme.spec.md) — paleta medieval do chrome (tutorial)
