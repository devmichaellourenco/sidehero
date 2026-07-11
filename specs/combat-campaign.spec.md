# Spec — Combate e Campanha

## Status

**Aceite:** 15/15 (100%) · escopo base v1  
**Testes obrigatórios:** 7/7 grupos (inclui `CampaignReleaseScope`)

## Objetivo

O jogador avança em **fases** com **waves** de inimigos, com combate em tempo real na battle strip, intermissões visuais e progressão de stage/tier.

## Critérios de aceite

- [x] Tick avança combate quando não pausado; respeita `combatIntermission` e pausa de loadout
- [x] Recompensas por kill: ouro, XP e loot ao derrotar cada inimigo (tabela por mundo/monstro)
- [x] Boss: loot garantido na 1ª vitória da fase; replay com chance reduzida; progresso de fase no fim
- [x] Wipe na fase: cura completa + reinicia wave 1 da mesma fase
- [x] Seleção de fase: apenas desbloqueadas ou já concluídas (replay)
- [x] Overlay CLEAR/WARNING/VITÓRIA antes da próxima wave/fase
- [x] Scaling de inimigos segue `StageScalingCatalog` por tier global
- [x] Skills inimigas e heróis resolvem via `CombatActionExecutor` com elementos e status

## Escopo do jogo base (v1)

**Objetivo:** A campanha jogável termina em **Morthaven** (`4-50`, tier 200). Regiões 5–10 permanecem no catálogo para DLC futuro até o Trono do Vazio (`10-50`).

### Mapa de release

| Perfil | Última região | Finale | Fases jogáveis | Tier máximo |
|--------|---------------|--------|----------------|-------------|
| `base` (v1) | Morthaven | `4-50` | 200 | 200 |
| `full` (futuro) | Trono do Vazio | `10-50` | 500 | 500 |

### Regiões do jogo base

| mapId | Nome | Tiers |
|-------|------|-------|
| `stendra` | Estrenda | 1–50 |
| `gruftall` | Gruftall | 51–100 |
| `valdris` | Valdris | 101–150 |
| `morthaven` | Morthaven | 151–200 |

### Regiões reservadas (DLC)

`broken_sky`, `crimson_abyss`, `eternal_forge`, `ancient_grove`, `twilight_tower`, `void_throne` — existem em `CAMPAIGN_MAPS` e `HANDCRAFTED_PHASES`, mas ficam ocultas no perfil `base`.

### Critérios de aceite — escopo

- [x] Perfil de release centralizado em `CampaignReleaseScope` (domínio)
- [x] UI de campanha lista apenas mapas 1–4 no perfil `base`
- [x] Vitória em `4-50` marca `seasonCompleted` e dispara meta/legado
- [x] `4-50` não desbloqueia `5-1` no perfil `base`
- [x] Seleção/jogo de fase DLC rejeitada no perfil `base`
- [x] Saves com `selectedPhaseId` ou tier além do escopo são clampados na carga (progresso DLC preservado)
- [x] Catálogo completo (mapas 5–10) permanece no código para desenvolvimento de DLC

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Domain | `src/domain/campaign/*` (incl. `CampaignReleaseScope`), `src/domain/services/combat/*`, `src/domain/combat/*` |
| Application | `TickGameUseCase`, `ResumeCombatIntermissionUseCase`, `SelectPhaseUseCase`, `GetCampaignOverviewUseCase` |
| Presentation | `BattleStripRenderer`, `BattleVictoryFlow`, `CampaignMapPresentation`, `CampaignModalRenderer`, `CampaignTooltipBinder`, `CampaignFlow` |

## Invariantes

- Domínio não conhece Chrome nem DOM
- `phaseRun` nulo + tick não inicia fase se campanha pausada para loadout
- Herói derrotado não permanece como turno ativo
- Dano/cura publicados como eventos para UI (`CombatFloatingEvent`)

## Fora de escopo

- Sprites novos de inimigos (arte incremental)
- PvP ou combate manual por turno do jogador

## Lore — regiões do jogo base

**Gruftall** (`gruftall`, T51–100): terra desolada sob o domínio destrutivo de Gonodor. Cinzas espessas, ruínas e crateras; ar sufocante que aterroriza os fracos. Quase nada vive além de monstros errantes e o próprio Gonodor.

**Fase 2-50:** os heróis enfrentam **Gonodor** — na verdade apenas uma **centelha** de seu poder, enquanto o verdadeiro Gonodor está a quilômetros (fora do alcance do nível atual dos heróis). Título da fase: **Centelha de Gonodor**. Background narrativo; não precisa ser exposto na UI além do nome da fase.

**Fase 4-50 (finale v1):** **Duque de Morthaven** — boss de capítulo que encerra a temporada no jogo base.

## Testes obrigatórios

- [x] `GetCampaignOverviewUseCase.test.ts`, `SelectPhaseUseCase.test.ts` — escopo base na overview e seleção
- [x] `CampaignReleaseScope.test.ts` — perfil base, finale, clamp de save
- [x] `PhaseCombatHandlers.test.ts`, `EnemyKillRewardService.test.ts`, `EnemyLootTable.test.ts`
- [x] `CombatTurnPhase.test.ts`, `CombatActionExecutor.test.ts`
- [x] `EncounterResolver.test.ts`, `WaveEnemyFactory.test.ts`
- [x] `BattleVictoryFlow.test.ts`
- [x] `CampaignMapPresentation.test.ts`, `CampaignTooltipBinder.test.ts`, `CampaignModalRenderer.test.ts` — mapa, trilha e tooltips
