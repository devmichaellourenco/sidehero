import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { LootService } from '../../domain/services/LootService';
import { getFeatureLevel } from '../../domain/upgrades/FeatureKey';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { mapPersistedGameState } from '../mappers/GameStateDtoMapper';
import { mapGearToDto, GameStateDto, GearDto } from '../dto/GameStateDto';

export interface OpenAllChestsResult {
  state: GameStateDto;
  openedGears: GearDto[];
}

export class OpenAllChestsUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly lootService: LootService,
    private readonly upgradeService: UpgradeService,
  ) {}

  async execute(): Promise<OpenAllChestsResult> {
    let state = await this.repository.load();

    if (getFeatureLevel(state.upgradeLevels, 'open_all_chests') < 1) {
      throw new Error('Abrir todos os baús não desbloqueado');
    }

    const pendingChests = state.chests.filter((chest) => !chest.opened);

    if (pendingChests.length === 0) {
      return {
        state: mapPersistedGameState(state, this.upgradeService),
        openedGears: [],
      };
    }

    const openedGears: GearDto[] = [];
    let updatedChests = [...state.chests];
    let inventory = [...state.inventory];
    const logs: string[] = [];

    for (const chest of pendingChests) {
      const loot = this.lootService.generateGear(chest.stageEarned);
      updatedChests = updatedChests.map((entry) =>
        entry.id === chest.id ? entry.open(loot) : entry,
      );
      inventory = [...inventory, loot];
      openedGears.push(mapGearToDto(loot));
      logs.push(loot.name);
    }

    state = state
      .withChests(updatedChests)
      .withInventory(inventory)
      .addLog(`Abriu ${openedGears.length} baús: ${logs.join(', ')}`);

    await this.repository.save(state);

    return {
      state: mapPersistedGameState(state, this.upgradeService),
      openedGears,
    };
  }
}
