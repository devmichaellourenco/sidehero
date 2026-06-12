# 097 — Botão Continuar na barra de combate

## Status: concluída

## Alteração

Botão **Continuar** movido para `battle-combat-bar`, mesmo layout do **Pausar**:
- Ícone ▶ + label "Continuar"
- Visível só durante pausa manual; Pausar fica oculto
- Removido do banner de intermissão (banner mantém só "Pausado" + ℹ)

## Arquivos

- `panel.html` — `#continue-loadout-btn`
- `GameHudController.ts` — toggle pause/continue
- `GameViewController.ts` — listener e remoção de `#phase-intermission-continue`
- `panel.css` — classe unificada `.combat-bar-btn`
