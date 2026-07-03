# Spec — Loja e Economia

## Status

**Aceite:** 4/4 (100%) · auditoria 2026-07-03  
**Testes obrigatórios:** 1/1 presente na suite

## Objetivo

Gastar **ouro** em ofertas da loja (gear consumível/equipável) com renovação limitada por stage.

## Critérios de aceite

- [x] Catálogo por tier/seed; oferta identificada por ID estável ao reabrir modal no mesmo tier
- [x] Comprar desconta ouro e entrega item ao inventário
- [x] Renovar loja consome cota por stage (`shop_refresh` melhorias)
- [x] Ofertas indisponíveis quando ouro insuficiente ou já compradas

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Domain | `ShopService`, `Gold` VO |
| Application | `GetShopOffersUseCase`, `BuyShopOfferUseCase`, `RefreshShopUseCase` |
| Presentation | modal loja, ícone shop no footer/HUD |

## Invariantes

- Ouro nunca negativo (`Gold.spend`)
- Validação de compra no use case, não só na UI

## Fora de escopo

- Moeda premium / IAP

## Testes obrigatórios

- [x] `ShopService.test.ts`
