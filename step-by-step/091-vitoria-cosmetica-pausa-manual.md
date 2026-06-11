# 091 — Vitória cosmética + pausa só manual

## Objetivo

- Tela de vitória **informativa** — jogo continua no fundo (auto-batalha/ticks)
- **Única pausa real:** botão "Pausar para ajustes" → reinicia fase ao continuar
- Corrigir travamento no último ataque do boss (`loadoutEditOpen` após vitória bloqueava ticks)

## Mudanças

### Domínio
| Arquivo | Alteração |
|---------|-----------|
| `PhaseCombatHandlers.ts` | Boss derrotado **não** abre mais `loadoutEditOpen` |
| `CombatTurnPhase.ts` | Bloqueia tick só com pausa manual (`loadoutEditOpen && phaseRestartOnResume`) |
| `PartyEditPolicy.ts` | Edição na fase só com pausa manual |

### Vitória (UI)
| Arquivo | Alteração |
|---------|-----------|
| `BattleVictoryFlow.ts` | Overlay não bloqueia; auto-fecha em 3s; sem intermissão |
| `BattleVictoryOverlayRenderer.ts` | Removido "Realizar alterações"; botão "Fechar" |

### Persistência
| Arquivo | Alteração |
|---------|-----------|
| `ChromeStorageGameRepository.ts` | `loadoutEditOpen` só persiste com `phaseRestartOnResume` |

### Apresentação
| Arquivo | Alteração |
|---------|-----------|
| `GameViewController.ts` | `isManualLoadoutPause()`; vitória não para auto-batalha |
| `GameHudController.ts` | Bloqueio só na pausa manual |
| `TickGameUseCase.ts` | Removido `resumeCampaign` |

## Comportamento final

| Situação | Comportamento |
|----------|----------------|
| Boss derrotado | Overlay 3s; próxima fase inicia nos ticks |
| Entre fases (`phaseRun` null) | Party editável sem pausar |
| Pausa manual | Banner + edição; continuar reinicia fase |

## Status

Implementado — 142 testes passando.
