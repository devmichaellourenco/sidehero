# 095 — Roadmap UX: implementação fases A–C

## Status: concluída

## Resumo

Implementação do roadmap de UX/usabilidade para reduzir cliques, aproximar ações do combate e melhorar navegação entre heróis.

## Fase A — Quick wins

| Item | Implementação |
|------|----------------|
| A1 Baú sobre a batalha | `BattleChestAffordanceController` + botão `#battle-chest-affordance` na battle strip |
| A2 Pausa compacta | Banner reduzido + botão ℹ com tooltip; ⏸ na `battle-combat-bar` |
| A3 Footer em ícones | `actions-icon-bar` com botões compactos e badges |
| A4 Clique no herói da batalha | `data-hero-battle-open` + `bindBattleStripDelegation` |

## Fase B — Hub de herói

| Item | Implementação |
|------|----------------|
| B1 Drawer lateral | `SideDrawerController` + `#hero-drawer-root` (slide-up, batalha visível) |
| B2 Navegação entre heróis | `HeroNavigationHelper` + setas ← → no header do drawer |
| B3 Abas renomeadas | Loadout / Progressão / Skills / Classe |

## Fase C — Densidade

| Item | Implementação |
|------|----------------|
| C1 Log colapsável | `BattleLogPanelController` + toggle no header do log |
| C3 Barra de pendências | `PendingActionsPolicy` + `PendingActionsBarController` |

## Arquitetura

```
presentation/
  components/
    SideDrawerController.ts      — overlay drawer (herói)
    GameViewController.ts        — orquestração UI
  controllers/
    BattleChestAffordanceController.ts
    BattleLogPanelController.ts
    PendingActionsBarController.ts
    GameHudController.ts         — HUD + icon bar
  helpers/
    HeroNavigationHelper.ts      — ordem party + reserva
  policies/
    PendingActionsPolicy.ts      — regras puras de pendências
  panel/
    panel.html / panel.css
```

## Fluxos

- **Herói:** clique no card da party, sprite na batalha ou chip de pendência → drawer
- **Equipar do drawer:** slot → modal empilhado (picker) sobre o drawer
- **Baú:** ícone flutuante na batalha (prioritário) ou ícone no footer (fallback)
- **Pendências:** chips clicáveis abrem baú, inventário, melhorias ou drawer do herói

## Fora de escopo (fase D / B4)

- Equip inline sem modal empilhado
- Carrossel de party
- Atalhos de teclado documentados
- Drag-and-drop de equipamento

## Validação manual

1. `npm run build` + recarregar extensão
2. Baú pendente → ícone pulsa sobre a batalha
3. ⏸ e Avançar acessíveis sem scroll
4. Clique no sprite do herói → drawer com ← →
5. Log recolhe/expande; chips de pendência navegam corretamente
