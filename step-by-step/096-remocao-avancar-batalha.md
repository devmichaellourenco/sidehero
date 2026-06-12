# 096 — Remoção do botão Avançar Batalha

## Status: concluída

## Motivo

O jogo opera apenas com **auto-batalha** (padrão ligado). O botão manual era redundante — ficava desabilitado na maior parte do tempo.

## Alterações

| Arquivo | Mudança |
|---------|---------|
| `panel.html` | Removido `#tick-btn`; barra de combate só com ⏸ Pausar |
| `GameHudController.ts` | Removida lógica do botão de tick |
| `GameViewController.ts` | Removidos listener de clique e atalho Espaço; `tick()` permanece para auto-batalha e continuar da pausa |
| `panel.css` | Estilo `combat-pause-btn` em largura total |

## Comportamento

- Combate avança só via **auto-battle timer** (Configurações)
- **Pausar** / **Continuar** inalterados
- Atalho **Espaço** removido
