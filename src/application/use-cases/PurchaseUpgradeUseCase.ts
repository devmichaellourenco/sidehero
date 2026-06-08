import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { UpgradeNodeDto } from '../dto/UpgradeNodeDto';
import { mapPersistedGameState } from '../mappers/GameStateDtoMapper';
import { GameStateDto } from '../dto/GameStateDto';

export interface PurchaseUpgradeResult {
  state: GameStateDto;
  nodes: UpgradeNodeDto[];
  purchasableCount: number;
  purchasedUpgradeId: string;
}

export class PurchaseUpgradeUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly upgradeService: UpgradeService,
  ) {}

  async execute(upgradeId: string): Promise<PurchaseUpgradeResult> {
    const state = await this.repository.load();
    const nextState = this.upgradeService.purchase(state, upgradeId);

    await this.repository.save(nextState);

    const tree = this.upgradeService.buildTree(nextState);
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
      state: mapPersistedGameState(nextState, this.upgradeService),
      nodes,
      purchasableCount: this.upgradeService.countAvailable(nextState),
      purchasedUpgradeId: upgradeId,
    };
  }
}
