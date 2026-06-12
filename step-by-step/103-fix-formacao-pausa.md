# 103 — Fix formação bloqueada na pausa

## Status: concluída

## Problema

Ao pausar na aba **Formação**, continuava aparecendo *"Formação bloqueada durante a fase"* e os controles de ordem/reserva não apareciam.

## Causa

`shouldRenderHeroPanel` não re-renderizava o painel quando só `canEditParty` mudava (false → true na pausa). Loadout e composição da party permaneciam iguais, então a UI ficava com o HTML antigo da fase em combate.

## Correção

1. **`HeroPanelRenderPolicy.ts`** — re-render quando `canEditParty` muda entre ticks.
2. **`GameViewController.ts`** — `handlePartyPanelAction` também aceita pausa manual (`isManualLoadoutPause`) como fallback.

## Validação

Pausar → aba Formação → setas ← →, − e + na reserva devem aparecer e funcionar.
