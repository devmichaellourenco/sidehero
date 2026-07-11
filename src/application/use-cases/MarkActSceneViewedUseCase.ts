import { resolveActSceneById } from '../../domain/campaign/ActSceneCatalog';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { GameStateDto } from '../dto/GameStateDto';

export class MarkActSceneViewedUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly presenter: GameStatePresenter,
  ) {}

  async execute(sceneId: string): Promise<GameStateDto> {
    const state = await this.repository.load();
    const scene = resolveActSceneById(sceneId);

    if (!scene) {
      throw new Error('Cena não encontrada');
    }

    const nextState = state.withCampaignProgress(
      state.campaignProgress.markActSceneViewed(sceneId),
    );

    await this.repository.save(nextState);
    return this.presenter.present(nextState);
  }
}
