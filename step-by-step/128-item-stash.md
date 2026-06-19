# 128 — Baú de itens (Stash)

## Objetivo

Armazenamento extra desbloqueável além do inventário (capacidade fixa), com UI dedicada, mover itens entre inventário ↔ baú, destruir itens, filtros por tipo e grid icon-only com tooltip no hover.

## Plano (Clean Architecture)

### Domínio
| Artefato | Responsabilidade |
|----------|------------------|
| `StorageCapacityPolicy` | Limites de inventário (30) e baú por nível de upgrade |
| `GearStorageService` | Mover inventário↔baú, destruir, validar capacidade |
| `GameState.stash` | Lista persistida de `Gear[]` |
| `FeatureKey.item_stash` | Desbloqueio + expansão L1/L2/L3 |
| `UpgradeCatalog` | Nós no ramo `equipment` |
| `FeatureAccessPolicy` | `itemStash`, capacidades derivadas |

### Aplicação
| Use case | Ação |
|----------|------|
| `MoveGearToStashUseCase` | Inventário → baú |
| `MoveGearFromStashUseCase` | Baú → inventário |
| `DestroyGearUseCase` | Remove de inventário ou baú |

Integração de capacidade em: `ChestService`, `UnequipGearUseCase`, `GearEquipService`, `BuyShopOfferUseCase`.

### Apresentação
| Componente | Função |
|------------|--------|
| `StorageGridPresentation` | Grid reutilizável (baú + ações no tooltip) |
| `StashModalRenderer` | Modal dedicado com filtros/sort |
| `GearStorageFlow` | Mensagens ao client + modal de confirmação de destruição |
| `DestroyGearConfirmDialog` | Overlay acima dos modais; preview do item + Cancelar / Destruir |
| Inventário | Capacidade `usado/limite`, ações guardar/destruir no tooltip |
| Footer HUD | Botão abrir baú (bloqueado se não desbloqueado) |

## Capacidades

| Storage | Limite |
|---------|--------|
| Inventário | 30 (fixo) |
| Baú L1 | 24 |
| Baú L2 | 36 |
| Baú L3 | 48 |

## Fluxo do jogador

1. Desbloqueia **Baú de itens I** em Melhorias.
2. Abre **Baú** no footer (ou link no inventário).
3. No inventário: hover → **Guardar no baú** / **Destruir**.
4. No baú: hover → **Retirar** / **Destruir**.
5. Filtros: Todos / Arma / Armadura / Acessório + ordenação.
6. **Destruir** abre modal de confirmação (não usa `window.confirm`).

## Confirmação de destruição

- `#destroy-gear-confirm-root` — overlay independente da pilha de modais (`z-index: 1700`).
- Preview: ícone, nome, slot, raridade e bônus do item.
- **Cancelar** (backdrop, botão ou Escape) ou **Destruir** para executar a ação.
- Tooltip do grid é fechado ao abrir a confirmação.

## Status

Implementado — validar manualmente com `npm test`.
