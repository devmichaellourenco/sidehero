# Spec — Loja e Economia

## Status

**Aceite:** 10/10 (100%) · auditoria 2026-08-11  
**Testes obrigatórios:** 3/3 presentes na suite

## Objetivo

Gastar **ouro** em ofertas da loja (gear consumível/equipável) com renovação limitada por stage.

## Critérios de aceite

- [x] Catálogo por tier/seed; oferta identificada por ID estável ao reabrir modal no mesmo tier
- [x] Comprar desconta ouro e entrega item ao inventário
- [x] Renovar loja consome cota por stage (`shop_refresh` melhorias)
- [x] Ofertas indisponíveis quando ouro insuficiente ou já compradas
- [x] Raridade **mythic** só entra no estoque a partir do Ato 3 de Valdris (tier ≥ 121 / fase `3-21`)
- [x] Modal da loja: tooltip com preview grande + comparação vs herói selecionável (sem fechar a loja)
- [x] Arrastar oferta (só se puder pagar) para o slot do herói: compra + equipa; troca exige espaço no inventário/baú
- [x] Grade de ofertas em **4 colunas**; card compacto = ícone + botão de preço (detalhes só no tooltip)
- [x] Botão de preço ≤ largura do ícone; badge ▲/▼ de comparação no canto superior esquerdo (mesmo padrão do inventário)
- [x] Seletor “Comparar com” + loadout do herói no contexto `shop` (sem fechar a loja)

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Domain | `ShopService`, `Gold` VO |
| Application | `GetShopOffersUseCase`, `BuyShopOfferUseCase`, `BuyAndEquipShopOfferUseCase`, `RefreshShopUseCase` |
| Presentation | `ShopModalRenderer`, drag da oferta → slot (`GearDragDrop*`), ícone shop no footer/HUD |

## Invariantes

- Ouro nunca negativo (`Gold.spend`)
- Validação de compra no use case, não só na UI
- Drag de oferta só se o jogador puder pagar; troca de equip exige espaço em inventário ou baú

## Fora de escopo

- Moeda premium / IAP

## Testes obrigatórios

- [x] `ShopService.test.ts`
- [x] `ShopModalRenderer.test.ts` — preview no tooltip + seletor de herói / comparação / drag / grade
- [x] `BuyAndEquipShopOfferUseCase.test.ts` — compra+equipa, troca com espaço, erro sem espaço
