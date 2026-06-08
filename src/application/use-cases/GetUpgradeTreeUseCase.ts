import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { UpgradeNodeDto } from '../dto/UpgradeNodeDto';
import { mapPersistedGameState } from '../mappers/GameStateDtoMapper';
import { GameStateDto } from '../dto/GameStateDto';

export interface GetUpgradeTreeResult {
  state: GameStateDto;
  nodes: UpgradeNodeDto[];
  purchasableCount: number;
}

export class GetUpgradeTreeUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly upgradeService: UpgradeService,
  ) {}

  async execute(): Promise<GetUpgradeTreeResult> {
    const state = await this.repository.load();
    const tree = this.upgradeService.buildTree(state);

    const nodes: UpgradeNodeDto[] = tree.map((node) => ({
      id: node.definition.id,
      feature: node.definition.feature,
      level: node.definition.level,
      branch: node.definition.branch,
      name: node.definition.name,
      description: node.definition.description,
      cost: node.definition.cost,
      status: node.status,
      canAfford: node.canAfford,
      requirements: node.requirements,
    }));

    return {
      state: mapPersistedGameState(state, this.upgradeService),
      nodes,
      purchasableCount: this.upgradeService.countAvailable(state),
    };
  }
}
