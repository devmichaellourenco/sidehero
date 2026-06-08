# 029 — Árvore de Melhorias (implementação)

## Objetivo

Desbloquear automações e QoL mediante árvore de melhorias comprada com ouro, com níveis empilháveis e requisitos extensíveis.

## Domínio (`src/domain/upgrades/`)

| Arquivo | Função |
|---------|--------|
| `FeatureKey.ts` | Chaves de features + `UpgradeLevels` |
| `UpgradeRequirement.ts` | Union de requisitos (stage, vitórias, baús, upgrade prévio) |
| `UpgradeDefinition.ts` | Definição de nó (id, custo, ramo, nível) |
| `UpgradeCatalog.ts` | 16 nós v1 (combate, baús, equipamento, QoL, economia) |
| `RequirementEvaluator.ts` | Avalia requisitos contra `GameState` |
| `UpgradeService.ts` | Árvore, compra, contagem de disponíveis |
| `ShopRefreshRules.ts` | Limites/custo/desconto de refresh por nível |

## Estado persistido

- `GameState.upgradeLevels` — nível por feature
- `GameState.shopRefreshUses` — usos no stage (reset em `withStage`)

## Use cases

- `GetUpgradeTreeUseCase` / `PurchaseUpgradeUseCase`
- `GetGameStateUseCase` inclui `purchasableUpgradeCount`
- `RefreshShopUseCase` valida desbloqueio + limite + desconto L3

## UI

- Botão **Melhorias** no footer com badge ↑N
- `UpgradeTreeModalRenderer` — cards por ramo
- `FeatureGate` — consulta de níveis na apresentação
- Configurações: toggles bloqueados com link para Melhorias
- Footer: Otimizar / Abrir todos ocultos até desbloquear
- Loja: refresh bloqueado até `shop_refresh` ≥ 1

## Gates principais

| Feature | Nível mínimo |
|---------|----------------|
| Auto-batalha | `auto_battle` 1 |
| Velocidade 2x/3x | `auto_battle` 2/3 |
| Tick background | `background_tick` 1/2 |
| Auto-abrir baús | `auto_open_chests` 1 |
| Abrir todos | `open_all_chests` 1 |
| Auto batch baús | `open_all_chests` 2 |
| Otimizar equipe | `optimize_loadout` 1 |
| Otimizar loot lote | `optimize_loadout` 2 |
| Auto-equipar | `auto_equip_loot` 1 |
| Auto-equip silencioso | `auto_equip_loot` 2 |
| Log resumido | `log_filter` 1 |
| Renovar loja | `shop_refresh` 1 (2/5/8 usos por stage) |

## Fase 4 — Níveis e limites

- **Auto-batalha L3:** velocidade 3x no select de Configurações
- **Tick idle L2:** `BackgroundTickScheduler` reduz alarme de 0,1 → 0,05 min
- **Refresh loja:** 2/5/8 por stage; desconto 15% no L3; validação no use case
- **Gates servidor:** `OpenAllChestsUseCase`, `EquipBestLoadoutUseCase` rejeitam sem upgrade

## Fase 5 — Polish

- Status **`ready`** na árvore (pré-requisitos ok, falta ouro)
- Badge **↑N** atualizado via `mapPersistedGameState` em todos os use cases
- Alarme de background sincronizado após compra de `background_tick`
- Mensagens de bloqueio no inventário e loot em lote

## Arquivos adicionais (fases 4–5)

| Arquivo | Função |
|---------|--------|
| `GameStateDtoMapper.ts` | Estado + `purchasableUpgradeCount` unificado |
| `BackgroundTickScheduler.ts` | Alarme dinâmico por nível de tick idle |

## Como testar

1. `npm run build`
2. Recarregar extensão + F5
3. Confirmar que automações estão bloqueadas no início
4. Acumular ouro → **Melhorias** → comprar nós
5. Ligar automações em Configurações após desbloqueio
