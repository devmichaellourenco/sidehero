# 104 — Overlay "Pausado" na battle strip

## Status: concluída

## Mudança

**Antes:** banner compacto abaixo da barra Pausar/Continuar.

**Agora:** overlay na **tela de batalha** com fundo amarelo claro semitransparente e texto **Pausado** em branco (estilo próximo ao CLEAR/WARNING).

## Arquivos

| Arquivo | Alteração |
|---------|-----------|
| `panel.html` | `#battle-pause-overlay` dentro de `.battle-strip`; removido `#phase-intermission-banner` |
| `panel.css` | Estilos `.battle-pause-overlay` / `.battle-pause-label`; removidos estilos do banner antigo |
| `GameViewController.ts` | `syncLoadoutPauseBanner` controla o overlay na strip |
