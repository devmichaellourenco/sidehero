# 064 — HUD de campanha acima da batalha

## Mudança

A informação de **campanha / mapa / fase / wave** saiu da barra de currencies e foi para uma faixa dedicada entre o header (ouro/baús) e o battle strip.

## Layout

```
[ Brand + settings ]
[ Ouro | Baús | Progresso baú ]
[ 🗺 1-1 · 2/3 ]   ← pill compacto (ícone + fase/wave); tooltip no hover
[ Battle strip ]
[ Heróis | Log | Ações ]
```

## Arquivos

| Arquivo | Alteração |
|---------|-----------|
| `panel.html` | `#campaign-context-label` — um `stat-pill` compacto |
| `GameHudController.ts` | Ícone + `faseId · wave`; tooltip oculto no DOM |
| `CampaignTooltipBinder.ts` | Portal de tooltip no hover (campanha/mapa/fase/wave/tier) |
| `GameViewController.ts` | Bind do tooltip na inicialização |
| `panel.css` | Estilos compactos + `.campaign-tooltip-portal` |

## Validação

Recarregar extensão após `npm run build` e confirmar ordem visual no painel.
