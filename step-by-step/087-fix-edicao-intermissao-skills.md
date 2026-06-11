# 087 — Fix edição na intermissão e rank-up de skills

## Problemas reportados

1. Não era possível habilitar/alocar skills mesmo com pontos disponíveis.
2. Na pausa entre fases, trocar heróis ou equipar itens retornava *"Party só pode ser editada fora de combate"*.

## Causas

### Skills
O botão **+1 rank** só habilitava quando `status === 'ready'` (rank 0). Após o primeiro rank, o status vira `owned` e o botão ficava desabilitado permanentemente, mesmo com pontos e `maxRank > 1`.

### Intermissão entre fases
Após derrotar o boss, `phaseRun` e `combat` eram zerados, mas um **tick concorrente** (auto-batalha ou alarme em background) podia iniciar a próxima fase antes do jogador pausar. O cliente ainda mostrava `canEditParty: true` (estado antigo) enquanto o servidor já tinha combate ativo.

## Solução

### Domínio — `loadoutEditOpen`
| Arquivo | Função |
|---------|--------|
| `GameState.ts` | Flag `loadoutEditOpen` persistida no save |
| `PhaseCombatHandlers.ts` | `true` ao derrotar boss |
| `CombatTurnPhase.ts` | Tick vira no-op enquanto a flag estiver ativa |
| `PartyEditPolicy.ts` | Permite edição sem combate (`phaseRun` null ou janela aberta) |
| `TickGameUseCase.ts` | `resumeCampaign: true` limpa a flag e inicia a próxima fase |

### Skills — `canAllocateRank`
| Arquivo | Função |
|---------|--------|
| `SkillService.ts` | Calcula `canAllocateRank` via `canAllocate` / `canAllocateAscension` |
| `SkillNodeDto.ts` | Novo campo no DTO |
| `HeroSkillsTabRenderer.ts` | Usa `canAllocateRank` no botão +1 rank |
| `HeroClassTabRenderer.ts` | Idem para skills de ascensão |

### Apresentação
| Arquivo | Função |
|---------|--------|
| `GameViewController.ts` | `tick({ resumeCampaign: true })` ao continuar; restaura banner se save com janela aberta |
| `BattleVictoryFlow.ts` | `enterSavedIntermissionPause()` após reload |
| `GameClientTypes.ts` | `TICK` aceita `resumeCampaign` |

## Testes

- `PartyEditPolicy.test.ts` — edição com `loadoutEditOpen` e `phaseRun` ativo
- `CombatTurnPhase.test.ts` — tick pausado até `resumeCampaign`
- `PhaseCombatHandlers.test.ts` — boss define `loadoutEditOpen`
- `SkillService.allocate.test.ts` — rank-up com status `owned`

## Status

Implementado — 136 testes passando.
