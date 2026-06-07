# 021 — QoL completo: upgrade, baús, idle, auto-batalha e toasts clicáveis

## 1. Indicadores de upgrade no inventário + comparação ao equipar
- `GearComparison.ts`: `getGearUpgradeInfo`, `renderUpgradeBadge`, `sortGearByBestGain`, `renderInlineComparison`
- `InventoryModalRenderer.ts`: badges ↑/↓/=, ordenação por melhor ganho ou nome
- `EquipPickerModalRenderer.ts`: deltas ATK/DEF/HP vs equipado no picker por slot e por herói
- `GearPresentation.ts`: suporte a `upgradeBadge` e `extraContent` nos cards

## 2. Abrir todos os baús
- `OpenAllChestsUseCase.ts`: abre todos os baús pendentes em uma operação
- Mensagem `OPEN_ALL_CHESTS` no service worker
- Botão **Abrir Todos** (visível com 2+ baús)
- Fila de modais de loot (`lootQueue`) com contador "N de M"

## 3. Resumo de progresso idle
- `PanelStateSnapshot.ts`: snapshot em `sessionStorage` ao ocultar painel/aba
- Toast `idle` ao retornar após 8s+ com progresso (stage, ouro, baús, level ups)
- `visibilitychange` no `GameViewController`

## 4. Auto-batalha no painel
- Toggle **Auto** no footer ao lado de "Avançar Batalha"
- Tick automático a cada 2,5s com painel aberto
- Preferência persistida em `sessionStorage` (`sidehero_auto_battle`)

## 5. Toasts clicáveis
- `ToastController.ts`: `onClick`, `hint`, duração customizável
- Toast de baú com "Clique para abrir" → abre o próximo baú
- Estilos `.game-toast-clickable` e `.game-toast-idle`

## Arquivos alterados
| Arquivo | Função |
|---------|--------|
| `GearComparison.ts` | Lógica de upgrade e comparação reutilizável |
| `GearPresentation.ts` | Cards com badge e conteúdo extra |
| `InventoryModalRenderer.ts` | Inventário com badges e ordenação |
| `EquipPickerModalRenderer.ts` | Comparação inline no equipar |
| `OpenAllChestsUseCase.ts` | Use case de abrir todos os baús |
| `PanelStateSnapshot.ts` | Snapshot idle para resumo |
| `ToastController.ts` | Toasts com ação |
| `GameStateChangeDetector.ts` | Callback de baú clicável |
| `GameViewController.ts` | Orquestra fila de loot, auto-batalha e idle |
| `GameApplication.ts` | Registra `openAllChests` |
| `GameMessageBus.ts` | Tipo `OPEN_ALL_CHESTS` |
| `service-worker.ts` | Handler do novo use case |
| `panel.html` / `panel.css` | UI de auto-batalha, abrir todos, badges, toasts |

## Validação
```bash
npm run build
```
1. Inventário: badges e ordenação por melhor ganho
2. Equipar item: ver deltas vs equipado
3. Ganhar 2+ baús → **Abrir Todos** → fila de modais
4. Ocultar aba 10s+ com progresso idle → toast de resumo
5. Ativar **Auto** → batalhas avançam sozinhas
6. Toast de baú → clique abre o baú
