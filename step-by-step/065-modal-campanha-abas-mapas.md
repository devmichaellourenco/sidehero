# 065 — Modal de campanha com abas por mapa

## Objetivo

Melhorar UX do seletor de fases: em vez de listar 500 fases de uma vez, exibir **um mapa por aba** com grid de 50 fases.

## Comportamento

- Barra de abas horizontal (scroll) com os 10 mapas
- Cada aba mostra: nome, faixa de tier (`T1–50`, `T51–100`, …) e progresso `concluídas/total`
- Painel exibe só as fases do mapa ativo
- Aba inicial: mapa da fase selecionada, ou mapa com progresso ativo, ou primeiro mapa
- Troca de aba sem novo request — só atualiza DOM
- Fases exibidas como `Fase N` com destaque em marcos (👑) e finale (🏆)

## Arquivos

| Arquivo | Função |
|---------|--------|
| `CampaignModalRenderer.ts` | `renderTabs`, `renderMapPanel`, `resolveInitialMapId` |
| `CampaignFlow.ts` | Bind de abas + refresh parcial do painel |
| `CampaignModalRenderer.test.ts` | Testes de aba ativa e painel único |
| `panel.css` | Estilos `.campaign-map-tabs`, `.campaign-map-tab`, scroll do grid |

## Validação

```bash
npm test
npm run build
```

Abrir **Campanha** no painel e alternar entre mapas pelas abas.
