# Spec — Battle UI e UX do Painel

## Status

**Aceite:** 14/14 (100%) · auditoria 2026-07-28  
**Testes obrigatórios:** 16/16 presentes na suite

## Objetivo

Interface lateral Chrome: battle strip sempre visível, modais/drawers **sem cobrir** a batalha, feedback Wow e onboarding na primeira sessão.

## Critérios de aceite

- [x] Modais de inventário/heróis/melhorias limitados abaixo da barra Pausar/Acampamento (`--panel-sheet-top` = base de `.battle-combat-bar`)
- [x] Wow: celebrações centrais; inbox no header (✦) com pendências persistentes (`buildPersistentWowBanners` + `syncPersistentBanners`); strip dismiss sem repetir
- [x] Overlay de derrota sugere contramedida (resist elemental quando detectável)
- [x] Todo card Wow exibe botão de rodapé (padrão **Entendi** para dispensar); o [×] só aparece em CTAs de ação no modo center
- [x] Baú flutuante na batalha quando pendente
- [x] Pausa loadout: banner compacto + overlay ACAMPAMENTO
- [x] Pausa de batalha (≠ acampamento): overlay PAUSA + Continuar; stats em menu Runas (`battle_stats`)
- [x] Menu **Stats** (runa): modo **janela** (padrão) ou **fixado no side panel** via botão Fixar/Desafixar; atualiza em tempo real; abas Geral | Dano | Cura | Sofrido | Mitigado | Críticos; abas Dano / Sofrido / Mitigado com ranking por tipo de dano
- [x] Compra de runa não gera Wow duplicado quando o mesmo evento já dispara unlock de herói/feature (`isUpgradePurchaseCoveredByStateChange`)
- [x] Todos os menus da barra de sistemas (`SystemsMenuId`) suportam **Fixar/Desafixar** com preferência por menu (padrão: janela popup `panel.html?detached=<id>`, 520×832 sem resize); modo detached não inicia auto-battle
- [x] Overlays interruptivos (tutorial, cena, resultado de batalha, Wow) **não se sobrepõem**: `UiOverlayOrchestrator` com prioridade tutorial > cena > batalha > Wow; o restante espera na fila
- [x] Overlay de cena narrativa e celebrações Wow bloqueiam ticks até dispensar
- [x] Footer separa sistemas que abrem telas de ações imediatas: **Baús** no grid; **Abrir baú**, **Abrir todos** e **Otimizar equipe** na faixa de ações rápidas
- [x] Sheets de sistema (modal, hero drawer, Log, Stats): seta para baixo fecha; faixa de ícones dos menus disponíveis (locks/acampamento) via `SystemsMenuNavigation` + `SystemsMenuIconPresentation`
- [x] Onboarding contextual pausa entre dicas (`OnboardingPolicy`)
- [x] Barras de vida verdes; HP na strip
- [x] Botão **Apoiar** no header (direita) abre card de doação voluntária; link Stripe em nova aba; jogo permanece 100% gratuito
- [x] Heróis / Formação / Loja / Inventário / Baús / Otimizar equipe só aparecem no **acampamento** (`canEditParty`)
- [x] Pista de combate do mapa (ameaça/favorável) no tooltip da campanha e header do mapa; eficácia vs área nas stats de skill
- [x] Splash `splash_screen.png` na abertura do painel principal antes do loop de batalha (`SplashScreenController`)

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Presentation | `panel/panel.html`, `panel.css`, `GameViewController`, `GameHudController` |
| Presentation | `BattleChromeLayout`, `WowBannerBuilder`, `WowBannerCtaPresentation`, `WowStripRenderer`, `RewardOrchestrator`, `OnboardingPolicy`, `DonationCardPresentation` |
| Presentation | `ModalStackController`, `SystemsMenuNavigation`, `BattleChestAffordanceController` |
| Presentation | `SurfacePinPreference`, `SurfacePinPresentation` |
| Presentation | `UiOverlayOrchestrator` — exclusividade tutorial/cena/batalha/Wow |
| Infra | `DetachedSurfaceWindowOpener`, `DetachedSurfaceWindowManager`; redirect legado `panel/stats.html` → `?detached=stats` |

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
- [x] `DetachedSurfaceWindowManager.test.ts` — tamanho/reuso de janela popup destacável
- [x] `SurfacePinPreference.test.ts`, `SurfacePinPresentation.test.ts` — preferência e markup de pin
- [x] `ModalController.test.ts` — título + shell de pin
- [x] `stats.html.test.ts` — redirect legado para `?detached=stats`
- [x] `SystemsMenuNavigation.test.ts` — disponibilidade por camp/unlock + wrap prev/next
- [x] `UiOverlayOrchestrator.test.ts` — prioridade e fila de overlays exclusivos
- [x] `SplashScreenController.test.ts` — splash de abertura antes do loop

## Relacionado

- [`stage-progress-bar.spec.md`](stage-progress-bar.spec.md) — timeline entre localização e a battle strip
- [`combat-campaign.spec.md`](combat-campaign.spec.md) — waves / fase ativa
- [`medieval-theme.spec.md`](medieval-theme.spec.md) — paleta medieval do chrome (tutorial)
