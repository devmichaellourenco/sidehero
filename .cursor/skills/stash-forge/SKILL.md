---
name: stash-forge
description: Baú de itens e Forja Divina no Side Hero. Use para stash, baú de itens, forja divina, fuse, salvage ou DivineForge.
---

# Baú de Itens e Forja Divina

## Spec

`specs/stash-forge.spec.md`

## Fluxo

1. Capacidade → níveis `item_stash` em `UpgradeCatalog`
2. Fusão/salvage → `DivineForgeService` + policies
3. UI → grid de storage, modal forja

## Padrões

- Gate: `FeatureAccessPolicy.divineForge` / `itemStash`
- 9 itens mesma raridade → 1 superior (`GearRarityProgression`)
- Confirm destroy fora da modal stack principal

## Referência

`step-by-step/134-forja-divina.md`, `step-by-step/128-item-stash.md`

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar
