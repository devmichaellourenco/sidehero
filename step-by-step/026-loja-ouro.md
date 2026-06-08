# 026 — Loja com ouro

## Objetivo

Dar utilidade ao ouro acumulado nas batalhas, permitindo comprar equipamento diretamente na loja.

## Arquivos criados

| Arquivo | Função |
|---------|--------|
| `src/domain/services/ShopService.ts` | Gera 3 ofertas fixas por stage (arma comum, armadura rara, acessório épico) com preços escalonados |
| `src/application/dto/ShopOfferDto.ts` | DTO da oferta com preço, item e flag `canAfford` |
| `src/application/use-cases/GetShopOffersUseCase.ts` | Carrega estado e monta ofertas da loja |
| `src/application/use-cases/BuyShopOfferUseCase.ts` | Debita ouro, adiciona item ao inventário e registra log |
| `src/presentation/components/ShopModalRenderer.ts` | UI do modal da loja com cards de item e botão Comprar |

## Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/domain/services/LootService.ts` | Extraído `createGear`; adicionado `generateDeterministicGearForSlot` para ofertas estáveis da loja |
| `src/application/GameApplication.ts` | Registra `ShopService`, `GetShopOffersUseCase` e `BuyShopOfferUseCase` |
| `src/infrastructure/messaging/GameMessageBus.ts` | Mensagens `GET_SHOP_OFFERS` e `BUY_SHOP_OFFER` |
| `src/presentation/background/service-worker.ts` | Handlers das novas mensagens |
| `src/presentation/components/GameViewController.ts` | Botão Loja, cache de ofertas, compra com toast |
| `src/presentation/components/BattleLogFilter.ts` | Log filtrado inclui entradas com "comprou" |
| `src/presentation/panel/panel.html` | Botão **Loja** no footer |
| `src/presentation/panel/panel.css` | Estilos do modal da loja |

## Regras de negócio

- **3 ofertas por stage**: arma (comum), armadura (raro), acessório (épico)
- **Preço base**: 25 / 55 / 110 ouro + bônus por stage
- **Ofertas determinísticas**: mesmo stage sempre mostra os mesmos itens (IDs `shop-gear-{stage}-{slot}`)
- **Compra**: item vai para o inventário com ID único (evita duplicata ao recomprar a mesma oferta); ouro debitado via `Gold.spend`
- **Ofertas mudam** ao avançar de stage (texto explicativo no modal)

## Como testar

1. `npm run build`
2. Recarregar extensão no Chrome e **F5** na página
3. Acumular ouro em batalhas
4. Abrir **Loja** no footer
5. Comprar item com ouro suficiente → toast + item no inventário
6. Tentar comprar sem ouro → botão desabilitado

## Próximos passos sugeridos

- Refresh manual da loja (custo em ouro ou cooldown)
- Oferta especial rotativa
- Bump de versão para release na Chrome Web Store
