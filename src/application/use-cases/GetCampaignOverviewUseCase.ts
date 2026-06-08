import { getCampaignInfo, listPhasesForMap, resolvePhase } from '../../domain/campaign/CampaignCatalog';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { CampaignOverviewDto } from '../dto/CampaignDto';
import { mapCampaignOverview } from '../mappers/CampaignDtoMapper';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { GameStateDto } from '../dto/GameStateDto';

export interface GetCampaignOverviewResult {
  state: GameStateDto;
  campaign: CampaignOverviewDto;
}

export class GetCampaignOverviewUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly presenter: GameStatePresenter,
  ) {}

  async execute(): Promise<GetCampaignOverviewResult> {
    const state = await this.repository.load();
    const info = getCampaignInfo();
    const maps = info.maps.map((map) => ({
      id: map.id,
      name: map.name,
      phases: listPhasesForMap(map.id).map((phase) => {
        const definition = resolvePhase(phase.id)!;
        return {
          id: phase.id,
          displayName: definition.displayName,
          waveCount: definition.waves.length,
          difficultyTier: definition.difficultyTier,
          unlocked: state.campaignProgress.isUnlocked(phase.id),
          cleared: state.campaignProgress.isCleared(phase.id),
          selected: state.campaignProgress.selectedPhaseId === phase.id,
          playable: state.campaignProgress.canPlayPhase(phase.id),
          milestoneBoss: definition.milestoneBoss ?? false,
          seasonFinale: definition.seasonFinale ?? false,
        };
      }),
    }));

    return {
      state: this.presenter.present(state),
      campaign: mapCampaignOverview(info, maps),
    };
  }
}
