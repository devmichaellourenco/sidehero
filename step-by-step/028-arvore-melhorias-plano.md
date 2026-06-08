# 028 — Árvore de Melhorias (plano aprovado)

## Status: implementado (ver `029-arvore-melhorias.md`)

## Decisões de escopo (respostas do produto)

| Tema | Decisão |
|------|---------|
| Grátis para sempre | Inventário, equipar manual, abrir 1 baú, loja (comprar itens) |
| Bloqueado na árvore | Automações, otimizar equipe, abrir todos, refresh loja, tick idle background |
| Loja | Acesso livre; **só o refresh** exige desbloqueio + custo por uso + limites |
| Pagamento | Desbloqueio/nível = **pagamento único em ouro**; refresh mantém custo por uso |
| Saves | **Sem migração** — `upgradeLevels` começa vazio |
| UI | Botão **Melhorias** no **footer** |
| Requisitos | Múltiplos tipos, extensível; **todo nó tem custo em ouro** |
| Níveis | **Todo feature pode ter upgrades** (L1, L2, L3…) |
| Tick background | Upgrade separado na árvore |

## Fases de implementação

### Fase 1 — Domínio e persistência
- [x] `FeatureKey`, `UpgradeRequirement`, `UpgradeDefinition`, `UpgradeCatalog`
- [x] `RequirementEvaluator` + `UpgradeService`
- [x] `GameState.upgradeLevels` + `shopRefreshUses`
- [x] Serialize/deserialize (default vazio)
- [x] `GetUpgradeTreeUseCase`, `PurchaseUpgradeUseCase`
- [x] Message bus + service worker

### Fase 2 — UI da árvore
- [x] `UpgradeTreeModalRenderer`
- [x] Botão Melhorias no footer + badge comprável
- [x] CSS (cards por ramo, estados locked/ready/available/owned)
- [x] Toast + log ao comprar

### Fase 3 — Gates nas features
- [x] `FeatureGate.ts`
- [x] `GameViewController` — todos os pontos da tabela
- [x] `SettingsModalRenderer` — toggles condicionais
- [x] `ShopModalRenderer` — refresh com limite
- [x] `service-worker.ts` — tick condicionado a `background_tick`
- [x] Desligar prefs ativas se nível = 0

### Fase 4 — Níveis superiores e limites
- [x] `auto_battle_3` velocidade 3x
- [x] `background_tick_2` alarme 2x mais frequente (`BackgroundTickScheduler`)
- [x] `shop_refresh` limites + desconto L3
- [x] `shopRefreshUses` reset no `withStage`
- [x] Gates no domínio: `OpenAllChestsUseCase`, `EquipBestLoadoutUseCase`

### Fase 5 — Polish
- [x] Status `ready` (requisitos ok, falta ouro) na árvore
- [x] `mapPersistedGameState` — badge comprável em todas as respostas de estado
- [x] Hints em inventário/loot lote quando bloqueado
- [x] Documentação `029-arvore-melhorias.md`
