---
name: shop-economy
description: Loja, ofertas e economia de ouro no Side Hero. Use para shop, loja, renovar loja, buy offer ou ShopService.
---

# Loja e Economia

## Spec

`specs/shop-economy.spec.md`

## Fluxo

1. Ofertas → `ShopService.generateOffers(tier, seed, completedMainIds)`
2. Compra → `BuyShopOfferUseCase` valida ouro + estoque
3. Refresh → `RefreshShopUseCase` + limite por stage

## Padrões

- Ouro via VO `Gold` — `canAfford` / `spend`
- Oferta ID embute tier para reabrir modal sem mismatch
- Melhoria `shop_refresh` controla cota e desconto
- Cap de raridade por **mains** (`getShopMaxRarityIndex`); mythic só Ato 3 Valdris (`main:3-21` / tier ≥ 121)
- UI da loja: grade **4 colunas**; card = ícone + preço; detalhes no tooltip; badge ▲/▼; seletor + loadout (`shop`); drag da oferta paga → slot (`BuyAndEquipShopOfferUseCase`)

## Testes

`ShopService.test.ts`, `ShopModalRenderer.test.ts`, `BuyAndEquipShopOfferUseCase.test.ts` — criar ou atualizar; não executar automaticamente.

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar
- **Não** criar pasta nem arquivos `step-by-step/`; fonte de verdade = specs, agents, skills, rules e testes
