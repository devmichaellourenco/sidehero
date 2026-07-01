# 141 — Wow Strip polish + relatório idle enriquecido

Implementação dos itens 5 e 6 do doc `138-analise-melhorias-jogo.md`.

## Wow Strip mais inteligente

- **Prioridade visual:** loot raro/epic/lendário/mítico ganha boost de prioridade e tempo de exibição; banners efêmeros de maior prioridade recebem foco automático ao entrar na fila.
- **Dispensar sem repetir:** `WowStripDismissStore` persiste em `sessionStorage` o conteúdo dispensado por `banner.id`; o banner só volta quando o conteúdo muda (ex.: progresso do baú 1/3 → 2/3).
- **Destaque de loot:** classes `wow-banner--loot-{rarity}` com glow e cor de título; frame do gear com sombra em raridades altas.
- **Dismiss affordance:** botão `×` em banners persistentes sem CTA (ex.: progresso do baú).

## Relatório idle enriquecido

- **`IdleProgressSummary`:** duração ausente, fases, ouro, baús e level-ups em `detailLines` estruturadas.
- **Wow Strip:** banner `idle-report` com lista de detalhes e CTA "Entendi".
- **`buildIdleSummary`:** reutiliza o mesmo cálculo para o gate de exibição ao retornar ao painel.

## Arquivos principais

| Arquivo | Papel |
|---------|--------|
| `IdleProgressSummary.ts` | Cálculo compartilhado do progresso offline |
| `WowStripDismissStore.ts` | Persistência de banners dispensados |
| `WowStripController.ts` | Foco, dismiss e filtro |
| `WowStripRenderer.ts` | Visual de raridade + botão dismiss |
| `RewardMomentDetector.ts` | Loot com prioridade por raridade |
| `panel.css` | Estilos epic/legendary/mythic e idle |

## Testes

- `IdleProgressSummary.test.ts`
- `WowStripDismissStore.test.ts`
- `WowBannerBuilder.test.ts` (idle CTA + loot priority)
