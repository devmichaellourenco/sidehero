---
name: camp-missions
description: Acampamento, mapa de missões e tipos principal/secundária/normal no Side Hero. Use para mission board, quest principal/secundária, missão normal, estrelas, CampMissionBoard, unlock de missões ou retorno ao acampamento pós-batalha.
---

# Acampamento, Mapa e Missões

## Spec

`specs/camp-missions.spec.md`

## Quando usar

- Board do mapa, tipos de missão, estrelas, oferta normal
- Fim de batalha → resultado → acampamento
- Unlock de secundárias / próxima principal
- UI de locais no modal de campanha

## Fluxo de implementação

1. Domínio → `src/domain/campaign/missions/`
2. Progresso/save → `CampaignProgress` (+ migração)
3. Fim de combate → `ResolveMissionOutcome` / handlers (sem auto-fase)
4. Use cases + SW messaging
5. UI → `CampaignFlow` / mapa de locais + preview no pin (popover; tooltip de stats nos inimigos)
6. Testes listados na spec — criar/atualizar; **não** executar `npm test`

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar
- **Não** criar pasta nem arquivos `step-by-step/`; fonte de verdade = specs, agents, skills, rules e testes

## Regras de produto (resumo)

- Principal = marcos `x-1, x-5, …, x-50`; próxima incompleta no board; não repetível
- Secundária = cadeias + paralelas; não repetível; loot exclusivo
- Normal = 2–4, mapa×estrela; some na derrota; refresh a cada N visitas ao camp
- Vitória/derrota → resultado com detalhes de recompensa → Continuar → acampamento
- Derrota em missão **normal**: fração de ouro/XP (`NORMAL_MISSION_DEFEAT_REWARD_FRACTION`); main/side: zero
- Preview/CTA só ao clicar no pin (popover sobre o pin; sem footer permanente)
- Clique fora do popover fecha a seleção; popover clampa nas bordas do mapa
- Tooltip de inimigo: grade compacta com ícones de stats (~3 por linha)

## Coordenação

- Combate/waves: skill `combat-campaign`
- HUD/acampamento/modal: `battle-ui`
- Timeline na missão: `stage-progress-bar`
- Cenas: `story-scenes`
- Loot: `gear-loot`
- Números/refresh: `game-balance`

## Arquivos frequentes (alvo)

- `MissionCatalog.ts`, `MissionSceneCatalog.ts`, `MissionUnlockGraph.ts`, `NormalMissionOffer.ts`, `CampMissionBoard.ts`
- `GetMissionBoardUseCase`, `StartMissionUseCase`, `ResolveMissionOutcomeUseCase`
- `MissionMapLayoutCatalog` (slots % Stendra), `CampaignMissionMapPresentation` (popover no pin), `CampaignModalRenderer`, `CampaignFlow`
