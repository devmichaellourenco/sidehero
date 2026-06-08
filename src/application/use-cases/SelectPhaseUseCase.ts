import { resolvePhase } from '../../domain/campaign/CampaignCatalog';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { GameStateDto } from '../dto/GameStateDto';

export class SelectPhaseUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly presenter: GameStatePresenter,
  ) {}

  async execute(phaseId: string): Promise<GameStateDto> {
    const state = await this.repository.load();
    const phase = resolvePhase(phaseId);

    if (!phase) {
      throw new Error('Fase não encontrada');
    }

    if (!state.campaignProgress.canPlayPhase(phaseId)) {
      throw new Error('Fase ainda não desbloqueada');
    }

    const nextState = state
      .withCampaignProgress(state.campaignProgress.withSelectedPhase(phaseId))
      .withPhaseRun(null)
      .withCombat(null)
      .addLog(`Fase selecionada: ${phase.displayName}`);

    await this.repository.save(nextState);
    return this.presenter.present(nextState);
  }
}
