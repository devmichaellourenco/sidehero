# 020 — Modal de loot pós-baú e toasts

## Modal de loot
- Ao abrir baú, `OPEN_CHEST` retorna `openedGear` no response.
- Modal **Loot do baú** com item, comparação de stats vs equipado e ações:
  - **Equipar em {melhor herói}** — maior ganho total no slot
  - **Guardar no inventário** — fecha modal (item já está no inventário)

## Arquivos
- `GearComparison.ts` — `findBestHeroForGear`, deltas ATK/DEF/HP
- `LootModalRenderer.ts` — UI do modal
- `OpenChestUseCase.ts` — retorna `{ state, openedGear }`

## Toasts
- `ToastController.ts` — notificações no topo do painel
- `GameStateChangeDetector.ts` — compara estado anterior vs novo

### Eventos com toast
| Evento | Tipo | Mensagem |
|--------|------|----------|
| Novo baú | chest | Baú disponível! |
| Vitória / stage | victory | Vitória! Stage N |
| Level up | level | {nome} subiu para Lv.N |
| Abrir baú | loot | Loot: {item} |

## Validação
```bash
npm run build
```
Derrote inimigos até ganhar baú → toast. Abra baú → modal com comparação.
