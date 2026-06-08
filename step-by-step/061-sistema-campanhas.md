# 061 — Sistema de campanhas (MVP)

## Escopo fechado com o usuário

| Decisão | Escolha |
|---------|---------|
| Ouro nas waves intermediárias | Sim, ouro parcial sem XP |
| Replay de fases | Pode repetir fases já concluídas |
| Desbloqueio | Linear agora; `unlocks[]` preparado para bifurcações |
| Wipe na fase | Volta wave 1 da mesma fase com cura completa |
| Conteúdo MVP | Infraestrutura + 8 fases manuais + gerador procedural (9–50 Estrenda + Gondonor) |
| Saves antigos | Ignorados — testar do zero |

## Arquitetura de domínio (`src/domain/campaign/`)

| Arquivo | Função |
|---------|--------|
| `CampaignIds.ts` | IDs de campanha/mapa/fase, `buildPhaseId`, `difficultyTierForPhase` |
| `WaveDefinition.ts` | Slots de inimigo (trash/elite/boss) e definição de wave |
| `PhaseDefinition.ts` | Fase com `waves[]` e `unlocks[]` (grafo futuro) |
| `CampaignProgress.ts` | Fases desbloqueadas/concluídas, fase selecionada, `highestTierReached` |
| `PhaseRun.ts` | Execução ativa: `phaseId` + `waveIndex` |
| `HandcraftedPhases.ts` | Fases 1-1 a 1-8 com composições distintas |
| `ProceduralPhaseGenerator.ts` | Gera fases 1-9..1-50 e mapa Gondonor proceduralmente |
| `CampaignCatalog.ts` | Resolve fase handcrafted → procedural |
| `WaveEnemyFactory.ts` | Spawna inimigos; **XP = 0** fora de boss wave |
| `EncounterResolver.ts` | Resolve wave → `Enemy[]` + `EncounterMeta` |
| `PhaseCombatHandlers.ts` | `startPhaseRun`, `onWaveCleared`, `onBossDefeated`, `onPhaseWipe` |

## Regras de gameplay

1. **Fase** = sequência de waves; última wave é boss.
2. **Wave intermediária:** derrota → ouro parcial, sem XP, avança `waveIndex`.
3. **Boss:** derrota → XP + ouro + marca fase concluída + desbloqueia `unlocks[]` + incrementa `totalBattlesWon` + atualiza `stage` (`highestTierReached`) + baú a cada 3 vitórias.
4. **Wipe:** todos heróis mortos → cura full + `waveIndex = 0` na mesma fase.
5. **Seleção:** fases desbloqueadas **ou** já concluídas (farm/replay).
6. **Primeiro tick** sem `phaseRun` auto-inicia a fase em `campaignProgress.selectedPhaseId`.

## Mudanças em entidades e serviços

- `CombatState.ts` — campo `encounterMeta: EncounterMeta | null`
- `GameState.ts` — `campaignProgress`, `phaseRun`; `initial()` sem combate; `currentDifficultyTier()`
- `CombatTurnPhase.ts` — reescrito para waves/boss/wipe por fase
- `VictoryRewardPhase.ts` — **não usado** pelo novo fluxo (legado)

## Application layer

- `SelectPhaseUseCase.ts` — seleciona fase jogável, limpa combate
- `GetCampaignOverviewUseCase.ts` — overview para UI
- `CampaignDto.ts`, `CampaignDtoMapper.ts`
- `GameStateDto` — `campaignName`, `mapName`, `phaseLabel`, `phaseRun`, `campaignProgress`, `difficultyTier`
- `GameApplication.ts` — registra novos use cases
- `service-worker.ts` — handlers `GET_CAMPAIGN_OVERVIEW`, `SELECT_PHASE`
- Loja — usa `currentDifficultyTier()` em vez de `stage` direto

## Persistência

- `ChromeStorageGameRepository.ts` — serializa `campaignProgress`, `phaseRun`
- `GameStateMigration.ts` — fallback `encounterMeta` em saves antigos

## UI

- `panel.html` — botão `#open-campaign-btn`
- `CampaignFlow.ts` + `CampaignModalRenderer.ts` — modal de seleção de fase
- `GameViewController.ts` — `openCampaignModal()` integrado
- `GameHudController.ts` — exibe fase + wave no HUD
- `BattleStripRenderer.ts` — classe visual boss wave
- `GameStateChangeDetector.ts` — toast de fase concluída
- `panel.css` — estilos `.campaign-modal`, `.campaign-phase-grid`, `.enemy-battle-card--boss`
- `ShopModalRenderer.ts` — texto atualizado para tier de dificuldade

## Testes adicionados

- `CampaignProgress.test.ts`
- `EncounterResolver.test.ts`
- `PhaseCombatHandlers.test.ts`
- `CombatTurnPhase.test.ts` (reescrito para campanha)

## Validação

```bash
npm test   # 64 testes passando
npm run build
```

## Reflexão (escalabilidade / manutenção)

O domínio de campanha ficou isolado em `src/domain/campaign/` com catálogo + gerador procedural, o que permite adicionar mapas e bifurcações sem tocar no loop de combate. `PhaseDefinition.unlocks[]` já modela um grafo dirigido — trocar desbloqueio linear por ramificações é questão de conteúdo, não de reescrever `CombatTurnPhase`.

Próximos passos sugeridos: (1) expandir fases handcrafted antes de confiar só no procedural; (2) UI de mapa com nós visuais quando houver bifurcações; (3) remover `VictoryRewardPhase` e `EncounterSpawner` legados após confirmar que não há referências.
