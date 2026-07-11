import { describe, expect, it } from 'vitest';
import { CampaignProgress } from '../../domain/campaign/CampaignProgress';
import { GameState } from '../../domain/entities/GameState';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { MarkActSceneViewedUseCase } from './MarkActSceneViewedUseCase';

class MemoryRepository implements IGameStateRepository {
  constructor(private state: GameState) {}

  async load(): Promise<GameState> {
    return this.state;
  }

  async save(state: GameState): Promise<void> {
    this.state = state;
  }
}

describe('MarkActSceneViewedUseCase', () => {
  const presenter = new GameStatePresenter(new UpgradeService());

  it('marca cena como vista no progresso', async () => {
    const repository = new MemoryRepository(GameState.initial());
    const useCase = new MarkActSceneViewedUseCase(repository, presenter);
    const dto = await useCase.execute('stendra-act-1');

    expect(dto.campaignProgress.viewedActSceneIds).toContain('stendra-act-1');
  });
});
