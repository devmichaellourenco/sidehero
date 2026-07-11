---
name: story-scenes
description: Cenas narrativas por ato da campanha Side Hero — catálogo, cards na trilha, overlay com pausa e integração Wow. Use para cena, ato, narrativa, story scene, ActSceneCatalog ou overlay de campanha.
---

# Cenas narrativas (Story Scenes)

## Spec

`specs/story-scenes.spec.md`

## Fluxo de implementação

1. Texto e ids → `domain/campaign/ActSceneCatalog.ts`
2. Regras de desbloqueio/detecção → `ActScenePolicy.ts`
3. Persistência → `CampaignProgress.viewedActSceneIds` + `MarkActSceneViewedUseCase`
4. Card na trilha → `ActSceneCardPresentation` + `CampaignMapPresentation`
5. Overlay + pausa → `ActSceneFlow` + `GameViewController.isAdvanceBlocked`
6. Wow/marco → garantir `WowCelebrationController.isBlockingAdvance()`

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar

## Convenções

- Id de cena: `{mapId}-act-{1..5}` (ex. `stendra-act-2`)
- Ato N = fases `(N-1)*10+1` … `N*10` dentro do mapa
- Imagem v1: banner da região via `CampaignSceneCatalog` no mapper de DTO

## Arquivos frequentes

- `ActSceneCatalog.ts`, `ActScenePolicy.ts`
- `ActSceneCardPresentation.ts`, `ActSceneOverlayPresentation.ts`, `ActSceneFlow.ts`
- `GetCampaignOverviewUseCase.ts`, `MarkActSceneViewedUseCase.ts`
