# 027 — Refresh pago da loja

## Objetivo

Permitir que o jogador gaste ouro para renovar as ofertas da loja sem precisar avançar de stage.

## Arquivos criados

| Arquivo | Função |
|---------|--------|
| `src/application/use-cases/RefreshShopUseCase.ts` | Debita ouro, incrementa seed da loja e retorna novas ofertas |

## Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/domain/entities/GameState.ts` | Campo `shopRefreshSeed`; reset ao mudar de stage |
| `src/domain/services/LootService.ts` | Geração determinística usa `refreshSeed` (nome, stats, ID) |
| `src/domain/services/ShopService.ts` | Ofertas por stage+seed; `calculateRefreshCost` |
| `src/application/use-cases/GetShopOffersUseCase.ts` | Usa seed persistido; expõe custo de refresh |
| `src/application/use-cases/BuyShopOfferUseCase.ts` | Busca oferta com seed atual |
| `src/application/GameApplication.ts` | Registra `RefreshShopUseCase` |
| `src/infrastructure/storage/ChromeStorageGameRepository.ts` | Serializa `shopRefreshSeed` |
| `src/infrastructure/messaging/GameMessageBus.ts` | Mensagem `REFRESH_SHOP` + campos de custo |
| `src/presentation/background/service-worker.ts` | Handler de refresh |
| `src/presentation/components/ShopModalRenderer.ts` | Botão **Renovar loja** com preço |
| `src/presentation/components/GameViewController.ts` | Fluxo de refresh + estado do modal |
| `src/presentation/components/BattleLogFilter.ts` | Log filtrado inclui "renovou a loja" |
| `src/presentation/panel/panel.css` | Toolbar da loja |

## Regras de negócio

- **Custo de refresh:** `15 + (stage - 1) * 5` ouro
- **Seed da loja:** incrementa a cada refresh; persiste no save
- **Reset:** ao avançar de stage, `shopRefreshSeed` volta a 0
- **Variação:** novos nomes de item e pequeno bônus de stats a cada refresh
- **IDs de oferta:** `shop-{stage}-{seed}-{slot}`

## Como testar

1. `npm run build`
2. Recarregar extensão + **F5** na página
3. Abrir **Loja** com ouro suficiente
4. Clicar **Renovar loja** → ofertas mudam, ouro debitado, toast e log
5. Avançar de stage → ofertas base do novo stage (seed 0)
