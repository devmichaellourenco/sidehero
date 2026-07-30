---
name: shop-economy
description: Loja, ofertas e economia de ouro no Side Hero. Use para shop, loja, renovar loja, buy offer ou ShopService.
---

# Loja e Economia

## Spec

`specs/shop-economy.spec.md`

## Fluxo

1. Ofertas → `ShopService.generateOffers(state)`
2. Compra → `BuyShopOfferUseCase` valida ouro + estoque
3. Refresh → `RefreshShopUseCase` + limite por stage

## Padrões

- Ouro via VO `Gold` — `canAfford` / `spend`
- Oferta ID embute tier para reabrir modal sem mismatch
- Melhoria `shop_refresh` controla cota e desconto
- Mythic na loja só a partir do Ato 3 de Valdris (`MythicGearAccessPolicy` / tier ≥ 121)

## Testes

`ShopService.test.ts` — criar ou atualizar; não executar automaticamente.

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar
- **Não** criar pasta nem arquivos `step-by-step/`; fonte de verdade = specs, agents, skills, rules e testes
